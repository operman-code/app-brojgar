// screens/Inventory/services/InventoryService.js
import DatabaseService from '../../../database/DatabaseService';

class InventoryService {
  // Get all items with optional filtering
  static async getAllItems(categoryId = null, searchQuery = '', status = 'all') {
    try {
      await DatabaseService.init();
      
      let conditions = 'WHERE i.deleted_at IS NULL';
      let params = [];
      
      if (categoryId) {
        conditions += ' AND i.category_id = ?';
        params.push(categoryId);
      }
      
      if (searchQuery) {
        conditions += ' AND (i.name LIKE ? OR i.description LIKE ? OR i.sku LIKE ?)';
        const searchPattern = `%${searchQuery}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }
      
      if (status === 'low_stock') {
        conditions += ' AND i.current_stock <= i.minimum_stock';
      } else if (status === 'out_of_stock') {
        conditions += ' AND i.current_stock = 0';
      } else if (status === 'active') {
        conditions += ' AND i.is_active = 1';
      }
      
      conditions += ' ORDER BY i.name ASC';
      
      const items = await DatabaseService.executeQuery(`
        SELECT 
          i.*,
          c.name as category_name,
          c.icon as category_icon,
          p.name as supplier_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN parties p ON i.supplier_id = p.id
        ${conditions}
      `, params);
      
      return items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category_name || 'Uncategorized',
        categoryIcon: item.category_icon || '📦',
        sku: item.sku,
        barcode: item.barcode,
        brand: item.brand,
        unit: item.unit,
        costPrice: item.cost_price,
        sellingPrice: item.selling_price,
        mrp: item.mrp,
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        supplier: item.supplier_name,
        taxRate: item.tax_rate,
        status: this.getStockStatus(item.current_stock, item.minimum_stock),
        profitMargin: this.calculateProfitMargin(item.cost_price, item.selling_price),
        stockValue: item.current_stock * item.cost_price,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      return [];
    }
  }

  // Get item by ID
  static async getItemById(id) {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT 
          i.*,
          c.name as category_name,
          p.name as supplier_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN parties p ON i.supplier_id = p.id
        WHERE i.id = ? AND i.deleted_at IS NULL
      `, [id]);
      
      if (result.length === 0) return null;
      
      const item = result[0];
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        category_id: item.category_id,
        category: item.category_name,
        sku: item.sku,
        barcode: item.barcode,
        hsn_code: item.hsn_code,
        brand: item.brand,
        unit: item.unit,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        mrp: item.mrp,
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        reorder_level: item.reorder_level,
        location: item.location,
        supplier_id: item.supplier_id,
        supplier_name: item.supplier_name,
        tax_rate: item.tax_rate,
        is_active: item.is_active,
        created_at: item.created_at
      };
    } catch (error) {
      console.error('❌ Error fetching item by ID:', error);
      return null;
    }
  }

  // Create new item
  static async createItem(itemData) {
    try {
      await DatabaseService.init();
      
      // Generate SKU if not provided
      const sku = itemData.sku || await this.generateSKU(itemData.name);
      
      const data = {
        name: itemData.name,
        description: itemData.description || null,
        category_id: itemData.category_id || null,
        sku: sku,
        barcode: itemData.barcode || null,
        hsn_code: itemData.hsn_code || null,
        brand: itemData.brand || null,
        unit: itemData.unit || 'pcs',
        cost_price: itemData.cost_price || 0,
        selling_price: itemData.selling_price || 0,
        mrp: itemData.mrp || 0,
        current_stock: itemData.current_stock || 0,
        minimum_stock: itemData.minimum_stock || 0,
        reorder_level: itemData.reorder_level || 5,
        location: itemData.location || null,
        supplier_id: itemData.supplier_id || null,
        tax_rate: itemData.tax_rate || 18,
        is_active: 1
      };
      
      const itemId = await DatabaseService.create('items', data);
      
      // Create stock movement record
      if (data.current_stock > 0) {
        await this.createStockMovement(itemId, 'opening_stock', data.current_stock, 'Opening Stock');
      }
      
      // Create notification
      await this.createNotification('Item Added', `${data.name} has been added to inventory`, 'info');
      
      return itemId;
    } catch (error) {
      console.error('❌ Error creating item:', error);
      throw error;
    }
  }

  // Update item
  static async updateItem(id, itemData) {
    try {
      const currentItem = await this.getItemById(id);
      if (!currentItem) throw new Error('Item not found');
      
      const updateData = {
        name: itemData.name,
        description: itemData.description || null,
        category_id: itemData.category_id || null,
        sku: itemData.sku,
        barcode: itemData.barcode || null,
        hsn_code: itemData.hsn_code || null,
        brand: itemData.brand || null,
        unit: itemData.unit || 'pcs',
        cost_price: itemData.cost_price || 0,
        selling_price: itemData.selling_price || 0,
        mrp: itemData.mrp || 0,
        minimum_stock: itemData.minimum_stock || 0,
        reorder_level: itemData.reorder_level || 5,
        location: itemData.location || null,
        supplier_id: itemData.supplier_id || null,
        tax_rate: itemData.tax_rate || 18
      };
      
      const result = await DatabaseService.update('items', id, updateData);
      
      // Handle stock adjustment if stock changed
      if (itemData.current_stock !== undefined && itemData.current_stock !== currentItem.current_stock) {
        const stockDifference = itemData.current_stock - currentItem.current_stock;
        await this.adjustStock(id, stockDifference, 'stock_adjustment', 'Manual stock adjustment');
      }
      
      if (result > 0) {
        await this.createNotification('Item Updated', `${itemData.name} information has been updated`, 'info');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error updating item:', error);
      throw error;
    }
  }

  // Delete item (soft delete)
  static async deleteItem(id) {
    try {
      const item = await this.getItemById(id);
      if (!item) throw new Error('Item not found');
      
      const result = await DatabaseService.softDelete('items', id);
      
      if (result > 0) {
        await this.createNotification('Item Removed', `${item.name} has been removed from inventory`, 'warning');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  }

  // Adjust stock
  static async adjustStock(itemId, quantity, movementType = 'adjustment', notes = '') {
    try {
      const item = await this.getItemById(itemId);
      if (!item) throw new Error('Item not found');
      
      const newStock = Math.max(0, item.current_stock + quantity);
      
      // Update item stock
      await DatabaseService.update('items', itemId, {
        current_stock: newStock
      });
      
      // Create stock movement record
      await this.createStockMovement(itemId, movementType, quantity, notes);
      
      // Check for low stock alert
      if (newStock <= item.minimum_stock) {
        await this.createNotification(
          'Low Stock Alert',
          `${item.name} is running low on stock (${newStock} remaining)`,
          'alert',
          'medium'
        );
      }
      
      return newStock;
    } catch (error) {
      console.error('❌ Error adjusting stock:', error);
      throw error;
    }
  }

  // Create stock movement record
  static async createStockMovement(itemId, movementType, quantity, notes = '', referenceType = null, referenceId = null) {
    try {
      await DatabaseService.create('stock_movements', {
        item_id: itemId,
        movement_type: movementType,
        quantity: quantity,
        reference_type: referenceType,
        reference_id: referenceId,
        notes: notes
      });
    } catch (error) {
      console.error('❌ Error creating stock movement:', error);
    }
  }

  // Get stock movements for an item
  static async getStockMovements(itemId, limit = 20) {
    try {
      const movements = await DatabaseService.executeQuery(`
        SELECT * FROM stock_movements 
        WHERE item_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [itemId, limit]);
      
      return movements.map(movement => ({
        id: movement.id,
        type: movement.movement_type,
        quantity: movement.quantity,
        notes: movement.notes,
        date: movement.created_at,
        reference: movement.reference_type ? `${movement.reference_type}-${movement.reference_id}` : null
      }));
    } catch (error) {
      console.error('❌ Error fetching stock movements:', error);
      return [];
    }
  }

  // Get low stock items
  static async getLowStockItems() {
    try {
      const items = await DatabaseService.executeQuery(`
        SELECT 
          i.id,
          i.name,
          i.current_stock,
          i.minimum_stock,
          i.selling_price,
          c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.current_stock <= i.minimum_stock 
          AND i.deleted_at IS NULL 
          AND i.is_active = 1
        ORDER BY i.current_stock ASC
      `);
      
      return items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category_name || 'Uncategorized',
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
        price: item.selling_price,
        status: item.current_stock === 0 ? 'out_of_stock' : 'low_stock'
      }));
    } catch (error) {
      console.error('❌ Error fetching low stock items:', error);
      return [];
    }
  }

  // Get inventory summary
  static async getInventorySummary() {
    try {
      const [totalItems, totalValue, lowStock, categories] = await Promise.all([
        this.getTotalItemsCount(),
        this.getTotalInventoryValue(),
        this.getLowStockCount(),
        this.getCategoriesCount()
      ]);
      
      return {
        totalItems,
        totalValue,
        lowStockCount: lowStock,
        categoriesCount: categories,
        averageValue: totalItems > 0 ? totalValue / totalItems : 0
      };
    } catch (error) {
      console.error('❌ Error getting inventory summary:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        categoriesCount: 0,
        averageValue: 0
      };
    }
  }

  // Get total items count
  static async getTotalItemsCount() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM items 
        WHERE deleted_at IS NULL AND is_active = 1
      `);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total items count:', error);
      return 0;
    }
  }

  // Get total inventory value
  static async getTotalInventoryValue() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COALESCE(SUM(current_stock * cost_price), 0) as total_value
        FROM items 
        WHERE deleted_at IS NULL AND is_active = 1
      `);
      return result[0]?.total_value || 0;
    } catch (error) {
      console.error('❌ Error getting inventory value:', error);
      return 0;
    }
  }

  // Get low stock count
  static async getLowStockCount() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM items 
        WHERE current_stock <= minimum_stock 
          AND deleted_at IS NULL 
          AND is_active = 1
      `);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting low stock count:', error);
      return 0;
    }
  }

  // Get categories count
  static async getCategoriesCount() {
    try {
      const result = await DatabaseService.executeQuery(`
        SELECT COUNT(*) as count 
        FROM categories 
        WHERE is_active = 1
      `);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting categories count:', error);
      return 0;
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const categories = await DatabaseService.findAll('categories', 'WHERE is_active = 1 ORDER BY name ASC');
      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        description: cat.description
      }));
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  }

  // Generate SKU
  static async generateSKU(itemName) {
    try {
      const prefix = itemName.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      return `${prefix}${timestamp}`;
    } catch (error) {
      return 'ITM' + Date.now().toString().slice(-6);
    }
  }

  // Get stock status
  static getStockStatus(currentStock, minimumStock) {
    if (currentStock === 0) {
      return { status: 'out_of_stock', color: '#ef4444', text: 'Out of Stock' };
    } else if (currentStock <= minimumStock) {
      return { status: 'low_stock', color: '#f59e0b', text: 'Low Stock' };
    } else {
      return { status: 'in_stock', color: '#10b981', text: 'In Stock' };
    }
  }

  // Calculate profit margin
  static calculateProfitMargin(costPrice, sellingPrice) {
    if (sellingPrice === 0) return 0;
    const profit = sellingPrice - costPrice;
    return Math.round((profit / sellingPrice) * 100 * 10) / 10;
  }

  // Create notification
  static async createNotification(title, message, type = 'info', priority = 'medium') {
    try {
      await DatabaseService.create('notifications', {
        title,
        message,
        type,
        priority,
        read: 0
      });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
    }
  }

  // Validate item data
  static validateItemData(data) {
    const errors = {};
    
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Item name must be at least 2 characters long';
    }
    
    if (data.cost_price < 0) {
      errors.cost_price = 'Cost price cannot be negative';
    }
    
    if (data.selling_price < 0) {
      errors.selling_price = 'Selling price cannot be negative';
    }
    
    if (data.current_stock < 0) {
      errors.current_stock = 'Stock cannot be negative';
    }
    
    if (data.minimum_stock < 0) {
      errors.minimum_stock = 'Minimum stock cannot be negative';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Utility functions
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export default InventoryService;