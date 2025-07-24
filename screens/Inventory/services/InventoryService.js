// screens/Inventory/services/InventoryService.js
import DatabaseService from '../../../database/DatabaseService';

class InventoryService {
  // Get all items with optional filtering
  static async getAllItems(categoryId = null, searchQuery = '', status = 'all') {
    try {
      await DatabaseService.init();
      
      let query = `
        SELECT i.*, c.name as category_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE (i.deleted_at IS NULL OR i.deleted_at = '')
      `;
      let params = [];
      
      if (categoryId) {
        query += ' AND i.category_id = ?';
        params.push(categoryId);
      }
      
      if (searchQuery) {
        query += ' AND (i.name LIKE ? OR i.description LIKE ? OR i.sku LIKE ?)';
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
      }
      
      if (status === 'low_stock') {
        query += ' AND i.current_stock <= i.min_stock';
      } else if (status === 'out_of_stock') {
        query += ' AND i.current_stock = 0';
      }
      
      query += ' ORDER BY i.name ASC';
      
      const result = await DatabaseService.executeQuery(query, params);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  }

  // Create new item
  static async createItem(itemData) {
    try {
      await DatabaseService.init();
      
      const {
        name,
        description = '',
        category_id = null,
        sku = '',
        unit = 'pcs',
        purchase_price = 0,
        sale_price = 0,
        current_stock = 0,
        min_stock = 0
      } = itemData;
      
      const query = `
        INSERT INTO inventory_items (
          name, description, category_id, sku, unit, purchase_price, 
          sale_price, current_stock, min_stock, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = await DatabaseService.executeQuery(query, [
        name, description, category_id, sku, unit, purchase_price,
        sale_price, current_stock, min_stock
      ]);
      
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, error: error.message };
    }
  }

  // Update item
  static async updateItem(id, itemData) {
    try {
      await DatabaseService.init();
      
      const {
        name,
        description,
        category_id,
        sku,
        unit,
        purchase_price,
        sale_price,
        current_stock,
        min_stock
      } = itemData;
      
      const query = `
        UPDATE inventory_items 
        SET name = ?, description = ?, category_id = ?, sku = ?, unit = ?,
            purchase_price = ?, sale_price = ?, current_stock = ?, min_stock = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [
        name, description, category_id, sku, unit, purchase_price,
        sale_price, current_stock, min_stock, id
      ]);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete item (soft delete)
  static async deleteItem(id) {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE inventory_items 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [id]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: error.message };
    }
  }

  // Get categories
  static async getCategories() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM categories 
        WHERE (deleted_at IS NULL OR deleted_at = '') 
        ORDER BY name ASC
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Create category
  static async createCategory(categoryData) {
    try {
      await DatabaseService.init();
      
      const { name, description = '', icon = '📦', color = '#3b82f6' } = categoryData;
      
      const query = `
        INSERT INTO categories (name, description, icon, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const result = await DatabaseService.executeQuery(query, [name, description, icon, color]);
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== MISSING METHODS ADDED =====

  // Get inventory summary
  static async getInventorySummary() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN current_stock <= min_stock THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items,
          COALESCE(SUM(current_stock * sale_price), 0) as total_value
        FROM inventory_items 
        WHERE (deleted_at IS NULL OR deleted_at = '')
      `;
      
      const result = await DatabaseService.executeQuery(query);
      return result.rows._array[0] || {
        total_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        total_value: 0
      };
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      return {
        total_items: 0,
        low_stock_items: 0,
        out_of_stock_items: 0,
        total_value: 0
      };
    }
  }

  // Validate item data
  static validateItemData(itemData) {
    const errors = [];
    
    if (!itemData.name || itemData.name.trim().length === 0) {
      errors.push('Item name is required');
    }
    
    if (itemData.sale_price < 0) {
      errors.push('Sale price cannot be negative');
    }
    
    if (itemData.purchase_price < 0) {
      errors.push('Purchase price cannot be negative');
    }
    
    if (itemData.current_stock < 0) {
      errors.push('Current stock cannot be negative');
    }
    
    if (itemData.min_stock < 0) {
      errors.push('Minimum stock cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default InventoryService;
