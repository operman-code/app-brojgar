// database/repositories/InventoryRepository.js
import BaseRepository from './BaseRepository';

class InventoryRepository extends BaseRepository {
  constructor() {
    super('items');
  }

  // Get all active items with category info
  async getAllItemsWithCategory() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_active = 1
      ORDER BY i.name ASC
    `;
    return await this.getAll(query);
  }

  // Get item by SKU or barcode
  async findBySkuOrBarcode(identifier) {
    const query = `
      SELECT * FROM items 
      WHERE (sku = ? OR barcode = ?) AND is_active = 1
      LIMIT 1
    `;
    return await this.getFirst(query, [identifier, identifier]);
  }

  // Search items with advanced filters
  async searchItems(searchTerm, filters = {}) {
    let query = `
      SELECT 
        i.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_active = 1
    `;
    
    const params = [];

    // Add search term
    if (searchTerm) {
      query += ` AND (
        i.name LIKE ? OR 
        i.description LIKE ? OR 
        i.sku LIKE ? OR 
        i.barcode LIKE ? OR 
        i.brand LIKE ?
      )`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add category filter
    if (filters.categoryId) {
      query += ` AND i.category_id = ?`;
      params.push(filters.categoryId);
    }

    // Add stock status filter
    if (filters.stockStatus) {
      if (filters.stockStatus === 'low') {
        query += ` AND i.current_stock <= i.min_stock AND i.current_stock > 0`;
      } else if (filters.stockStatus === 'out') {
        query += ` AND i.current_stock = 0`;
      } else if (filters.stockStatus === 'good') {
        query += ` AND i.current_stock > i.min_stock`;
      }
    }

    // Add price range filter
    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice) {
        query += ` AND i.selling_price >= ?`;
        params.push(filters.minPrice);
      }
      if (filters.maxPrice) {
        query += ` AND i.selling_price <= ?`;
        params.push(filters.maxPrice);
      }
    }

    query += ` ORDER BY i.name ASC`;

    return await this.getAll(query, params);
  }

  // Get low stock items
  async getLowStockItems() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_active = 1 
        AND i.current_stock <= i.min_stock 
        AND i.current_stock > 0
      ORDER BY (i.current_stock / NULLIF(i.min_stock, 0)) ASC
    `;
    return await this.getAll(query);
  }

  // Get out of stock items
  async getOutOfStockItems() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_active = 1 AND i.current_stock = 0
      ORDER BY i.name ASC
    `;
    return await this.getAll(query);
  }

  // Update stock quantity
  async updateStock(itemId, newQuantity, movementType = 'adjustment', notes = '', referenceType = null, referenceId = null) {
    try {
      // Get current item
      const item = await this.findById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const oldQuantity = item.current_stock;
      const quantityDifference = newQuantity - oldQuantity;

      // Update item stock
      await this.update(itemId, { current_stock: newQuantity });

      // Record stock movement
      const stockMovement = {
        item_id: itemId,
        movement_type: movementType,
        quantity: Math.abs(quantityDifference),
        rate: item.cost_price,
        total_value: Math.abs(quantityDifference) * item.cost_price,
        reference_type: referenceType,
        reference_id: referenceId,
        notes: notes || `Stock ${movementType}: ${oldQuantity} → ${newQuantity}`
      };

      // Determine movement direction
      if (quantityDifference > 0) {
        stockMovement.movement_type = 'in';
      } else if (quantityDifference < 0) {
        stockMovement.movement_type = 'out';
      }

      // Insert stock movement record
      await this.db.executeQuery(
        `INSERT INTO stock_movements (
          item_id, movement_type, quantity, rate, total_value, 
          reference_type, reference_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stockMovement.item_id,
          stockMovement.movement_type,
          stockMovement.quantity,
          stockMovement.rate,
          stockMovement.total_value,
          stockMovement.reference_type,
          stockMovement.reference_id,
          stockMovement.notes
        ]
      );

      return await this.findById(itemId);
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      throw error;
    }
  }

  // Add stock (increase)
  async addStock(itemId, quantity, rate = null, notes = '', referenceType = null, referenceId = null) {
    try {
      const item = await this.findById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const newQuantity = item.current_stock + quantity;
      const stockRate = rate || item.cost_price;

      // Update item stock
      await this.update(itemId, { current_stock: newQuantity });

      // Record stock movement
      await this.db.executeQuery(
        `INSERT INTO stock_movements (
          item_id, movement_type, quantity, rate, total_value, 
          reference_type, reference_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          'in',
          quantity,
          stockRate,
          quantity * stockRate,
          referenceType,
          referenceId,
          notes || `Added ${quantity} units`
        ]
      );

      return await this.findById(itemId);
    } catch (error) {
      console.error('❌ Error adding stock:', error);
      throw error;
    }
  }

  // Remove stock (decrease)
  async removeStock(itemId, quantity, notes = '', referenceType = null, referenceId = null) {
    try {
      const item = await this.findById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.current_stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const newQuantity = item.current_stock - quantity;

      // Update item stock
      await this.update(itemId, { current_stock: newQuantity });

      // Record stock movement
      await this.db.executeQuery(
        `INSERT INTO stock_movements (
          item_id, movement_type, quantity, rate, total_value, 
          reference_type, reference_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          'out',
          quantity,
          item.cost_price,
          quantity * item.cost_price,
          referenceType,
          referenceId,
          notes || `Removed ${quantity} units`
        ]
      );

      return await this.findById(itemId);
    } catch (error) {
      console.error('❌ Error removing stock:', error);
      throw error;
    }
  }

  // Get stock movements for an item
  async getStockMovements(itemId, limit = 50) {
    const query = `
      SELECT 
        sm.*,
        i.name as item_name,
        i.unit as item_unit
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      WHERE sm.item_id = ?
      ORDER BY sm.movement_date DESC
      LIMIT ?
    `;
    return await this.getAll(query, [itemId, limit]);
  }

  // Get all stock movements with item details
  async getAllStockMovements(limit = 100) {
    const query = `
      SELECT 
        sm.*,
        i.name as item_name,
        i.unit as item_unit,
        i.sku as item_sku
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      ORDER BY sm.movement_date DESC
      LIMIT ?
    `;
    return await this.getAll(query, [limit]);
  }

  // Generate next SKU
  async generateNextSku(prefix = 'SKU') {
    const query = `
      SELECT sku FROM items 
      WHERE sku LIKE ? 
      ORDER BY CAST(SUBSTR(sku, ?) AS INTEGER) DESC 
      LIMIT 1
    `;
    const result = await this.getFirst(query, [`${prefix}%`, prefix.length + 1]);
    
    if (result) {
      const currentNumber = parseInt(result.sku.substring(prefix.length)) || 0;
      return `${prefix}${String(currentNumber + 1).padStart(6, '0')}`;
    } else {
      return `${prefix}000001`;
    }
  }

  // Get inventory statistics
  async getInventoryStats() {
    const totalItemsQuery = `SELECT COUNT(*) as count FROM items WHERE is_active = 1`;
    const totalStockValueQuery = `
      SELECT SUM(current_stock * cost_price) as value 
      FROM items 
      WHERE is_active = 1
    `;
    const totalRetailValueQuery = `
      SELECT SUM(current_stock * selling_price) as value 
      FROM items 
      WHERE is_active = 1
    `;
    const lowStockCountQuery = `
      SELECT COUNT(*) as count 
      FROM items 
      WHERE is_active = 1 AND current_stock <= min_stock AND current_stock > 0
    `;
    const outOfStockCountQuery = `
      SELECT COUNT(*) as count 
      FROM items 
      WHERE is_active = 1 AND current_stock = 0
    `;

    const [totalItems, totalStockValue, totalRetailValue, lowStockCount, outOfStockCount] = await Promise.all([
      this.getFirst(totalItemsQuery),
      this.getFirst(totalStockValueQuery),
      this.getFirst(totalRetailValueQuery),
      this.getFirst(lowStockCountQuery),
      this.getFirst(outOfStockCountQuery)
    ]);

    return {
      totalItems: totalItems?.count || 0,
      totalStockValue: totalStockValue?.value || 0,
      totalRetailValue: totalRetailValue?.value || 0,
      potentialProfit: (totalRetailValue?.value || 0) - (totalStockValue?.value || 0),
      lowStockCount: lowStockCount?.count || 0,
      outOfStockCount: outOfStockCount?.count || 0
    };
  }

  // Get category-wise stock summary
  async getCategoryStockSummary() {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.icon,
        c.color,
        COUNT(i.id) as item_count,
        SUM(i.current_stock) as total_stock,
        SUM(i.current_stock * i.cost_price) as stock_value,
        SUM(i.current_stock * i.selling_price) as retail_value
      FROM categories c
      LEFT JOIN items i ON c.id = i.category_id AND i.is_active = 1
      WHERE c.type = 'item' AND c.is_active = 1
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY item_count DESC
    `;
    return await this.getAll(query);
  }

  // Get top selling items (based on stock movements)
  async getTopSellingItems(limit = 10, days = 30) {
    const query = `
      SELECT 
        i.id,
        i.name,
        i.unit,
        i.selling_price,
        SUM(sm.quantity) as total_sold,
        SUM(sm.total_value) as total_revenue,
        COUNT(sm.id) as transaction_count
      FROM items i
      JOIN stock_movements sm ON i.id = sm.item_id
      WHERE sm.movement_type = 'out' 
        AND sm.reference_type = 'sale'
        AND sm.movement_date >= date('now', '-${days} days')
        AND i.is_active = 1
      GROUP BY i.id, i.name, i.unit, i.selling_price
      ORDER BY total_sold DESC
      LIMIT ?
    `;
    return await this.getAll(query, [limit]);
  }

  // Get items needing reorder
  async getItemsNeedingReorder() {
    const query = `
      SELECT 
        i.*,
        c.name as category_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.is_active = 1 
        AND i.current_stock <= i.reorder_point
      ORDER BY i.current_stock ASC
    `;
    return await this.getAll(query);
  }

  // Validate stock before sale
  async validateStockForSale(items) {
    const errors = [];
    
    for (const item of items) {
      const dbItem = await this.findById(item.itemId);
      if (!dbItem) {
        errors.push(`Item with ID ${item.itemId} not found`);
        continue;
      }
      
      if (dbItem.current_stock < item.quantity) {
        errors.push(`Insufficient stock for ${dbItem.name}. Available: ${dbItem.current_stock}, Required: ${item.quantity}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Bulk update stock for sale/purchase
  async bulkUpdateStockForTransaction(items, transactionType, referenceId) {
    try {
      await this.db.transaction(async (db) => {
        for (const item of items) {
          const dbItem = await this.findById(item.itemId || item.item_id);
          if (!dbItem) continue;

          let newQuantity;
          let movementType;

          if (transactionType === 'sale') {
            newQuantity = dbItem.current_stock - item.quantity;
            movementType = 'out';
          } else if (transactionType === 'purchase') {
            newQuantity = dbItem.current_stock + item.quantity;
            movementType = 'in';
          } else {
            continue;
          }

          // Update item stock
          await db.runAsync(
            'UPDATE items SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newQuantity, dbItem.id]
          );

          // Record stock movement
          await db.runAsync(
            `INSERT INTO stock_movements (
              item_id, movement_type, quantity, rate, total_value, 
              reference_type, reference_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              dbItem.id,
              movementType,
              item.quantity,
              item.rate || dbItem.cost_price,
              item.quantity * (item.rate || dbItem.cost_price),
              transactionType,
              referenceId,
              `${transactionType} transaction`
            ]
          );
        }
      });
    } catch (error) {
      console.error('❌ Error bulk updating stock:', error);
      throw error;
    }
  }
}

export default new InventoryRepository();
