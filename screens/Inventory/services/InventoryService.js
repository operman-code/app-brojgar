// screens/Inventory/services/InventoryService.js
import DatabaseService from '../../../database/DatabaseService';

class InventoryService {
  // Get all inventory items
  static async getAllItems() {
    try {
      const query = `
        SELECT 
          id,
          item_name,
          item_code,
          category,
          description,
          stock_quantity,
          min_stock_level,
          cost_price,
          selling_price,
          tax_rate,
          unit,
          hsn_code,
          created_at,
          updated_at
        FROM inventory_items 
        WHERE deleted_at IS NULL
        ORDER BY item_name ASC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      return [];
    }
  }

  // Create new item
  static async createItem(itemData) {
    try {
      const query = `
        INSERT INTO inventory_items (
          item_name, item_code, category, description, 
          stock_quantity, min_stock_level, cost_price, 
          selling_price, tax_rate, unit, hsn_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        itemData.item_name || itemData.name,
        itemData.item_code || this.generateItemCode(),
        itemData.category || 'General',
        itemData.description || '',
        parseInt(itemData.stock_quantity || 0),
        parseInt(itemData.min_stock_level || 5),
        parseFloat(itemData.cost_price || 0),
        parseFloat(itemData.selling_price || 0),
        parseFloat(itemData.tax_rate || 18),
        itemData.unit || 'pcs',
        itemData.hsn_code || ''
      ];
      
      const result = await DatabaseService.executeQuery(query, params);
      console.log('✅ Item created successfully');
      return result;
    } catch (error) {
      console.error('❌ Error creating item:', error);
      throw error;
    }
  }

  // Update item
  static async updateItem(itemId, itemData) {
    try {
      const query = `
        UPDATE inventory_items 
        SET 
          item_name = ?, 
          item_code = ?, 
          category = ?, 
          description = ?,
          stock_quantity = ?, 
          min_stock_level = ?, 
          cost_price = ?, 
          selling_price = ?,
          tax_rate = ?, 
          unit = ?, 
          hsn_code = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const params = [
        itemData.item_name || itemData.name,
        itemData.item_code,
        itemData.category,
        itemData.description || '',
        parseInt(itemData.stock_quantity || 0),
        parseInt(itemData.min_stock_level || 5),
        parseFloat(itemData.cost_price || 0),
        parseFloat(itemData.selling_price || 0),
        parseFloat(itemData.tax_rate || 18),
        itemData.unit || 'pcs',
        itemData.hsn_code || '',
        itemId
      ];
      
      const result = await DatabaseService.executeQuery(query, params);
      console.log('✅ Item updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating item:', error);
      throw error;
    }
  }

  // Delete item (soft delete)
  static async deleteItem(itemId) {
    try {
      const query = `
        UPDATE inventory_items 
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [itemId]);
      console.log('✅ Item deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  }

  // Get item by ID
  static async getItemById(itemId) {
    try {
      const query = `
        SELECT * FROM inventory_items 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [itemId]);
      return result[0] || null;
    } catch (error) {
      console.error('❌ Error fetching item by ID:', error);
      return null;
    }
  }

  // Get all categories
  static async getCategories() {
    try {
      const query = `
        SELECT * FROM categories 
        WHERE deleted_at IS NULL
        ORDER BY name ASC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  }

  // Create new category
  static async createCategory(categoryData) {
    try {
      const query = `
        INSERT INTO categories (name, description) 
        VALUES (?, ?)
      `;
      
      const params = [
        categoryData.name,
        categoryData.description || ''
      ];
      
      const result = await DatabaseService.executeQuery(query, params);
      console.log('✅ Category created successfully');
      return result;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  }

  // Get inventory summary
  static async getInventorySummary() {
    try {
      const [totalItems, lowStockItems, totalValue, categories] = await Promise.all([
        this.getTotalItemsCount(),
        this.getLowStockItemsCount(),
        this.getTotalInventoryValue(),
        this.getCategoriesCount()
      ]);

      return {
        totalItems,
        lowStockItems,
        totalValue,
        categories
      };
    } catch (error) {
      console.error('❌ Error getting inventory summary:', error);
      return {
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        categories: 0
      };
    }
  }

  // Get total items count
  static async getTotalItemsCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting total items count:', error);
      return 0;
    }
  }

  // Get low stock items count
  static async getLowStockItemsCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND stock_quantity <= min_stock_level
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting low stock items count:', error);
      return 0;
    }
  }

  // Get total inventory value
  static async getTotalInventoryValue() {
    try {
      const query = `
        SELECT COALESCE(SUM(stock_quantity * cost_price), 0) as total_value 
        FROM inventory_items 
        WHERE deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.total_value || 0;
    } catch (error) {
      console.error('❌ Error getting total inventory value:', error);
      return 0;
    }
  }

  // Get categories count
  static async getCategoriesCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM categories 
        WHERE deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting categories count:', error);
      return 0;
    }
  }

  // Validate item data
  static validateItemData(itemData) {
    const errors = [];

    if (!itemData.item_name && !itemData.name) {
      errors.push('Item name is required');
    }

    if (itemData.selling_price && parseFloat(itemData.selling_price) < 0) {
      errors.push('Selling price cannot be negative');
    }

    if (itemData.cost_price && parseFloat(itemData.cost_price) < 0) {
      errors.push('Cost price cannot be negative');
    }

    if (itemData.stock_quantity && parseInt(itemData.stock_quantity) < 0) {
      errors.push('Stock quantity cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate item code
  static generateItemCode() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ITM${timestamp.slice(-6)}${random}`;
  }

  // Search items
  static async searchItems(searchQuery) {
    try {
      const query = `
        SELECT * FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND (
            item_name LIKE ? OR 
            item_code LIKE ? OR 
            category LIKE ? OR
            description LIKE ?
          )
        ORDER BY item_name ASC
      `;
      
      const searchTerm = `%${searchQuery}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];
      
      return await DatabaseService.executeQuery(query, params);
    } catch (error) {
      console.error('❌ Error searching items:', error);
      return [];
    }
  }

  // Update stock quantity
  static async updateStockQuantity(itemId, newQuantity) {
    try {
      const query = `
        UPDATE inventory_items 
        SET 
          stock_quantity = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [newQuantity, itemId]);
      console.log('✅ Stock quantity updated successfully');
      return result;
    } catch (error) {
      console.error('❌ Error updating stock quantity:', error);
      throw error;
    }
  }

  // Get low stock items
  static async getLowStockItems() {
    try {
      const query = `
        SELECT * FROM inventory_items 
        WHERE deleted_at IS NULL 
          AND stock_quantity <= min_stock_level
        ORDER BY stock_quantity ASC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting low stock items:', error);
      return [];
    }
  }
}

export default InventoryService;
