// screens/Inventory/services/InventoryService.js
class InventoryService {
  static items = [
    {
      id: "1",
      name: "iPhone 15 Pro",
      description: "Latest iPhone with A17 Pro chip, titanium design",
      category: "Mobile Accessories",
      sku: "APPL-IP15P-256",
      barcode: "1234567890123",
      price: "134900",
      costPrice: "125000",
      stock: 25,
      minStock: 5,
      maxStock: 50,
      unit: "pcs",
      supplier: "Apple Distributors",
      brand: "Apple",
      notes: "High-demand product, fast-moving",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-25T14:30:00Z",
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra",
      description: "Premium Samsung smartphone with S Pen",
      category: "Mobile Accessories",
      sku: "SAMS-GS24U-512",
      barcode: "2345678901234",
      price: "129999",
      costPrice: "120000",
      stock: 15,
      minStock: 3,
      maxStock: 30,
      unit: "pcs",
      supplier: "Samsung India",
      brand: "Samsung",
      notes: "Premium segment, good margins",
      createdAt: "2024-01-05T11:00:00Z",
      updatedAt: "2024-01-24T16:20:00Z",
    },
    {
      id: "3",
      name: "MacBook Air M3",
      description: "13-inch MacBook Air with M3 chip",
      category: "Computers",
      sku: "APPL-MBA-M3-13",
      barcode: "3456789012345",
      price: "114900",
      costPrice: "108000",
      stock: 8,
      minStock: 2,
      maxStock: 20,
      unit: "pcs",
      supplier: "Apple Distributors",
      brand: "Apple",
      notes: "Popular among students and professionals",
      createdAt: "2023-12-20T09:30:00Z",
      updatedAt: "2024-01-23T10:15:00Z",
    },
    {
      id: "4",
      name: "Sony WH-1000XM5",
      description: "Wireless noise-canceling headphones",
      category: "Audio",
      sku: "SONY-WH1000XM5-BK",
      barcode: "4567890123456",
      price: "29990",
      costPrice: "25000",
      stock: 35,
      minStock: 10,
      maxStock: 60,
      unit: "pcs",
      supplier: "Sony Electronics",
      brand: "Sony",
      notes: "Best-selling audio product",
      createdAt: "2024-01-10T12:00:00Z",
      updatedAt: "2024-01-25T09:45:00Z",
    },
    {
      id: "5",
      name: "Dell XPS 13",
      description: "13-inch ultrabook with Intel Core i7",
      category: "Computers",
      sku: "DELL-XPS13-I7-16",
      barcode: "5678901234567",
      price: "89999",
      costPrice: "82000",
      stock: 12,
      minStock: 3,
      maxStock: 25,
      unit: "pcs",
      supplier: "Dell India",
      brand: "Dell",
      notes: "Corporate favorite",
      createdAt: "2024-01-08T14:20:00Z",
      updatedAt: "2024-01-22T11:30:00Z",
    },
    {
      id: "6",
      name: "iPad Pro 12.9\"",
      description: "12.9-inch iPad Pro with M2 chip",
      category: "Electronics",
      sku: "APPL-IPADP-129-M2",
      barcode: "6789012345678",
      price: "112900",
      costPrice: "105000",
      stock: 18,
      minStock: 4,
      maxStock: 35,
      unit: "pcs",
      supplier: "Apple Distributors",
      brand: "Apple",
      notes: "Professional tablet for creatives",
      createdAt: "2024-01-12T08:45:00Z",
      updatedAt: "2024-01-24T13:10:00Z",
    },
    {
      id: "7",
      name: "Nintendo Switch OLED",
      description: "Gaming console with OLED screen",
      category: "Gaming",
      sku: "NINT-SW-OLED-WH",
      barcode: "7890123456789",
      price: "37980",
      costPrice: "33000",
      stock: 22,
      minStock: 5,
      maxStock: 40,
      unit: "pcs",
      supplier: "Nintendo India",
      brand: "Nintendo",
      notes: "Popular gaming console",
      createdAt: "2024-01-03T15:30:00Z",
      updatedAt: "2024-01-21T17:20:00Z",
    },
    {
      id: "8",
      name: "USB-C to Lightning Cable",
      description: "Official Apple USB-C to Lightning cable",
      category: "Cables",
      sku: "APPL-USBC-LIGHT-1M",
      barcode: "8901234567890",
      price: "1900",
      costPrice: "1500",
      stock: 150,
      minStock: 50,
      maxStock: 300,
      unit: "pcs",
      supplier: "Apple Distributors",
      brand: "Apple",
      notes: "Essential accessory",
      createdAt: "2024-01-02T10:15:00Z",
      updatedAt: "2024-01-25T08:30:00Z",
    },
    {
      id: "9",
      name: "Logitech MX Master 3S",
      description: "Advanced wireless mouse for productivity",
      category: "Electronics",
      sku: "LOGI-MXM3S-BK",
      barcode: "9012345678901",
      price: "8995",
      costPrice: "7500",
      stock: 0,
      minStock: 10,
      maxStock: 50,
      unit: "pcs",
      supplier: "Logitech India",
      brand: "Logitech",
      notes: "Out of stock - reorder needed",
      createdAt: "2024-01-15T11:45:00Z",
      updatedAt: "2024-01-20T14:00:00Z",
    },
    {
      id: "10",
      name: "Samsung 32\" 4K Monitor",
      description: "32-inch 4K UHD monitor with USB-C",
      category: "Electronics",
      sku: "SAMS-M32-4K-USBC",
      barcode: "0123456789012",
      price: "32999",
      costPrice: "28000",
      stock: 6,
      minStock: 8,
      maxStock: 25,
      unit: "pcs",
      supplier: "Samsung India",
      brand: "Samsung",
      notes: "Low stock alert",
      createdAt: "2024-01-18T13:20:00Z",
      updatedAt: "2024-01-24T15:45:00Z",
    },
    {
      id: "11",
      name: "Anker PowerBank 20000mAh",
      description: "High-capacity portable charger",
      category: "Mobile Accessories",
      sku: "ANKR-PB20K-BK",
      barcode: "1122334455667",
      price: "3999",
      costPrice: "3200",
      stock: 85,
      minStock: 30,
      maxStock: 150,
      unit: "pcs",
      supplier: "Anker India",
      brand: "Anker",
      notes: "Fast-moving accessory",
      createdAt: "2024-01-07T09:30:00Z",
      updatedAt: "2024-01-23T12:15:00Z",
    },
    {
      id: "12",
      name: "JBL Flip 6",
      description: "Portable Bluetooth speaker",
      category: "Audio",
      sku: "JBL-FLIP6-BL",
      barcode: "2233445566778",
      price: "12999",
      costPrice: "10500",
      stock: 28,
      minStock: 12,
      maxStock: 60,
      unit: "pcs",
      supplier: "Harman India",
      brand: "JBL",
      notes: "Popular speaker model",
      createdAt: "2024-01-09T14:00:00Z",
      updatedAt: "2024-01-22T16:30:00Z",
    },
  ];

  // Get all items
  static async getAllItems() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.items]);
      }, 300);
    });
  }

  // Get item by ID
  static async getItemById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = this.items.find(i => i.id === id);
        if (item) {
          resolve({ ...item });
        } else {
          reject(new Error("Item not found"));
        }
      }, 200);
    });
  }

  // Add new item
  static async addItem(itemData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Generate SKU if not provided
          if (!itemData.sku) {
            itemData.sku = this.generateSKU(itemData.name, itemData.category);
          }

          const newItem = {
            ...itemData,
            id: (this.items.length + 1).toString(),
            stock: Number(itemData.stock) || 0,
            minStock: Number(itemData.minStock) || 0,
            maxStock: Number(itemData.maxStock) || 100,
            price: Number(itemData.price) || 0,
            costPrice: Number(itemData.costPrice) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.items.push(newItem);
          resolve(newItem);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Update existing item
  static async updateItem(id, itemData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.items.findIndex(i => i.id === id);
          if (index !== -1) {
            this.items[index] = {
              ...this.items[index],
              ...itemData,
              id, // Ensure ID doesn't change
              stock: Number(itemData.stock) || this.items[index].stock,
              minStock: Number(itemData.minStock) || this.items[index].minStock,
              maxStock: Number(itemData.maxStock) || this.items[index].maxStock,
              price: Number(itemData.price) || this.items[index].price,
              costPrice: Number(itemData.costPrice) || this.items[index].costPrice,
              updatedAt: new Date().toISOString(),
            };
            resolve(this.items[index]);
          } else {
            reject(new Error("Item not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Delete item
  static async deleteItem(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.items.findIndex(i => i.id === id);
          if (index !== -1) {
            const deletedItem = this.items.splice(index, 1)[0];
            resolve(deletedItem);
          } else {
            reject(new Error("Item not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  }

  // Update stock
  static async updateStock(id, quantity, operation = 'add') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const item = this.items.find(i => i.id === id);
          if (item) {
            if (operation === 'add') {
              item.stock += quantity;
            } else if (operation === 'remove') {
              item.stock = Math.max(0, item.stock - quantity);
            } else if (operation === 'set') {
              item.stock = Math.max(0, quantity);
            }
            item.updatedAt = new Date().toISOString();
            resolve(item);
          } else {
            reject(new Error("Item not found"));
          }
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }

  // Search items
  static async searchItems(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve([...this.items]);
          return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.items.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.sku.toLowerCase().includes(searchTerm) ||
          item.barcode.includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.brand.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
        );
        resolve(filtered);
      }, 300);
    });
  }

  // Get items by category
  static async getItemsByCategory(category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.items.filter(i => i.category === category);
        resolve(filtered);
      }, 200);
    });
  }

  // Get low stock items
  static getLowStockItems() {
    return this.items.filter(item => item.stock <= item.minStock && item.stock > 0);
  }

  // Get out of stock items
  static getOutOfStockItems() {
    return this.items.filter(item => item.stock === 0);
  }

  // Get overstock items
  static getOverstockItems() {
    return this.items.filter(item => item.stock >= item.maxStock);
  }

  // Get inventory statistics
  static getInventoryStatistics() {
    const totalItems = this.items.length;
    const totalStockValue = this.items.reduce((sum, item) => {
      return sum + (item.stock * item.costPrice);
    }, 0);
    
    const totalRetailValue = this.items.reduce((sum, item) => {
      return sum + (item.stock * item.price);
    }, 0);

    const lowStockItems = this.getLowStockItems();
    const outOfStockItems = this.getOutOfStockItems();
    const overstockItems = this.getOverstockItems();

    const categoryStats = {};
    this.items.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          count: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      categoryStats[item.category].count++;
      categoryStats[item.category].totalValue += (item.stock * item.costPrice);
      categoryStats[item.category].totalStock += item.stock;
    });

    return {
      totalItems,
      totalStockValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalStockValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      overstockCount: overstockItems.length,
      categoryStats,
      averageItemValue: totalItems > 0 ? totalStockValue / totalItems : 0,
    };
  }

  // Get top selling items (mock data based on stock turnover)
  static getTopSellingItems(limit = 5) {
    return this.items
      .filter(item => item.stock > 0)
      .sort((a, b) => {
        // Sort by a combination of price and current stock level (higher price, lower stock = more sales)
        const scoreA = a.price * (1 / Math.max(a.stock, 1));
        const scoreB = b.price * (1 / Math.max(b.stock, 1));
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Get items needing reorder
  static getItemsNeedingReorder() {
    return this.items.filter(item => 
      item.stock <= item.minStock || item.stock === 0
    ).sort((a, b) => a.stock - b.stock);
  }

  // Generate SKU
  static generateSKU(name, category) {
    const namePrefix = name.split(' ').slice(0, 2).map(word => 
      word.substring(0, 3).toUpperCase()
    ).join('');
    
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    
    return `${categoryPrefix}-${namePrefix}-${timestamp}`;
  }

  // Validate item data
  static validateItemData(itemData) {
    const errors = [];

    if (!itemData.name || itemData.name.trim() === '') {
      errors.push('Item name is required');
    }

    if (!itemData.sku || itemData.sku.trim() === '') {
      errors.push('SKU is required');
    }

    if (itemData.price && isNaN(Number(itemData.price))) {
      errors.push('Price must be a valid number');
    }

    if (itemData.costPrice && isNaN(Number(itemData.costPrice))) {
      errors.push('Cost price must be a valid number');
    }

    if (itemData.stock && isNaN(Number(itemData.stock))) {
      errors.push('Stock must be a valid number');
    }

    if (itemData.minStock && isNaN(Number(itemData.minStock))) {
      errors.push('Minimum stock must be a valid number');
    }

    if (itemData.maxStock && isNaN(Number(itemData.maxStock))) {
      errors.push('Maximum stock must be a valid number');
    }

    // Check for duplicate SKU
    const existingSku = this.items.find(item => 
      item.sku.toLowerCase() === itemData.sku.toLowerCase() && 
      item.id !== itemData.id
    );
    if (existingSku) {
      errors.push('SKU already exists');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get stock alerts
  static getStockAlerts() {
    const alerts = [];
    
    this.getOutOfStockItems().forEach(item => {
      alerts.push({
        type: 'critical',
        message: `${item.name} is out of stock`,
        item: item,
        priority: 1
      });
    });

    this.getLowStockItems().forEach(item => {
      alerts.push({
        type: 'warning',
        message: `${item.name} stock is low (${item.stock} remaining)`,
        item: item,
        priority: 2
      });
    });

    this.getOverstockItems().forEach(item => {
      alerts.push({
        type: 'info',
        message: `${item.name} is overstocked (${item.stock} units)`,
        item: item,
        priority: 3
      });
    });

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  // Export inventory data
  static exportInventory(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.items, null, 2);
    } else if (format === 'csv') {
      const headers = ['ID', 'Name', 'SKU', 'Category', 'Brand', 'Stock', 'Min Stock', 'Max Stock', 'Cost Price', 'Selling Price', 'Stock Value'];
      const csvData = this.items.map(item => [
        item.id,
        item.name,
        item.sku,
        item.category,
        item.brand,
        item.stock,
        item.minStock,
        item.maxStock,
        item.costPrice,
        item.price,
        (item.stock * item.costPrice)
      ]);
      
      return [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    }
    return '';
  }

  // Bulk stock update
  static async bulkUpdateStock(updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const results = [];
          updates.forEach(update => {
            const item = this.items.find(i => i.id === update.id);
            if (item) {
              if (update.operation === 'add') {
                item.stock += update.quantity;
              } else if (update.operation === 'remove') {
                item.stock = Math.max(0, item.stock - update.quantity);
              } else if (update.operation === 'set') {
                item.stock = Math.max(0, update.quantity);
              }
              item.updatedAt = new Date().toISOString();
              results.push({ success: true, item });
            } else {
              results.push({ success: false, error: 'Item not found', id: update.id });
            }
          });
          resolve(results);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Get inventory by value range
  static getItemsByValueRange(minValue, maxValue) {
    return this.items.filter(item => {
      const itemValue = item.stock * item.costPrice;
      return itemValue >= minValue && itemValue <= maxValue;
    });
  }

  // Get items by supplier
  static getItemsBySupplier(supplier) {
    return this.items.filter(item => 
      item.supplier.toLowerCase().includes(supplier.toLowerCase())
    );
  }

  // Format currency
  static formatCurrency(amount) {
    return `₹${Math.abs(amount).toLocaleString("en-IN")}`;
  }

  // Get inventory summary for dashboard
  static getInventorySummary() {
    const stats = this.getInventoryStatistics();
    const alerts = this.getStockAlerts();
    const topItems = this.getTopSellingItems(3);
    const reorderItems = this.getItemsNeedingReorder();

    return {
      totalItems: stats.totalItems,
      totalStockValue: this.formatCurrency(stats.totalStockValue),
      totalRetailValue: this.formatCurrency(stats.totalRetailValue),
      potentialProfit: this.formatCurrency(stats.potentialProfit),
      lowStockCount: stats.lowStockCount,
      outOfStockCount: stats.outOfStockCount,
      criticalAlerts: alerts.filter(a => a.type === 'critical').length,
      topSellingItems: topItems,
      reorderCount: reorderItems.length,
      categories: Object.keys(stats.categoryStats).length,
    };
  }

  // Calculate profit margin for item
  static calculateProfitMargin(item) {
    if (item.costPrice === 0) return 0;
    return ((item.price - item.costPrice) / item.costPrice) * 100;
  }

  // Get profit analysis
  static getProfitAnalysis() {
    const itemsWithMargins = this.items.map(item => ({
      ...item,
      profitMargin: this.calculateProfitMargin(item),
      profitAmount: item.price - item.costPrice,
      stockValue: item.stock * item.costPrice,
      retailValue: item.stock * item.price,
    }));

    const totalProfit = itemsWithMargins.reduce((sum, item) => {
      return sum + (item.profitAmount * item.stock);
    }, 0);

    const averageMargin = itemsWithMargins.reduce((sum, item) => {
      return sum + item.profitMargin;
    }, 0) / itemsWithMargins.length;

    return {
      totalProfit: this.formatCurrency(totalProfit),
      averageMargin: Math.round(averageMargin * 100) / 100,
      highMarginItems: itemsWithMargins.filter(item => item.profitMargin > 30),
      lowMarginItems: itemsWithMargins.filter(item => item.profitMargin < 10),
      itemsWithMargins,
    };
  }
}

export default InventoryService;