// screens/Settings/services/SettingsService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class SettingsService {
  
  // Get all settings from database
  static async getSettings() {
    try {
      const db = await DatabaseService.getDatabase();
      const settingsRows = await db.getAllAsync('SELECT key, value, type FROM settings');
      
      // Convert to object
      const settings = {};
      settingsRows.forEach(row => {
        let value = row.value;
        
        // Parse value based on type
        switch (row.type) {
          case 'boolean':
            value = value === 'true';
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = row.value;
            }
            break;
          default:
            // string - keep as is
            break;
        }
        
        settings[row.key] = value;
      });
      
      // Return settings with defaults
      return {
        // Business Configuration
        businessName: settings.businessName || "Brojgar Business",
        ownerName: settings.ownerName || "Business Owner",
        gstNumber: settings.gstNumber || "",
        phoneNumber: settings.phoneNumber || "",
        emailAddress: settings.emailAddress || "",
        businessAddress: settings.businessAddress || "",
        
        // Financial Settings
        defaultCreditLimit: settings.defaultCreditLimit || 50000,
        monthlySalesTarget: settings.monthlySalesTarget || 500000,
        currency: settings.currency || "₹ INR",
        defaultTaxRate: settings.defaultTaxRate || 18,
        
        // Inventory Settings
        lowStockAlerts: settings.lowStockAlerts !== false,
        autoReorderSuggestions: settings.autoReorderSuggestions !== false,
        defaultMinStockLevel: settings.defaultMinStockLevel || 10,
        defaultMaxStockLevel: settings.defaultMaxStockLevel || 100,
        
        // Notification Settings
        pushNotifications: settings.pushNotifications !== false,
        emailNotifications: settings.emailNotifications !== false,
        paymentReminders: settings.paymentReminders !== false,
        dailyReports: settings.dailyReports || false,
        
        // App Preferences
        darkMode: settings.darkMode || false,
        biometricLock: settings.biometricLock || false,
        autoBackup: settings.autoBackup !== false,
        language: settings.language || "English (India)",
        
        // System Settings
        appVersion: "1.0.0",
        lastBackup: settings.lastBackup || new Date().toISOString(),
        dataSize: await this.calculateDataSize(),
      };
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Get default settings
  static getDefaultSettings() {
    return {
      businessName: "Brojgar Business",
      ownerName: "Business Owner",
      gstNumber: "",
      phoneNumber: "",
      emailAddress: "",
      businessAddress: "",
      defaultCreditLimit: 50000,
      monthlySalesTarget: 500000,
      currency: "₹ INR",
      defaultTaxRate: 18,
      lowStockAlerts: true,
      autoReorderSuggestions: true,
      defaultMinStockLevel: 10,
      defaultMaxStockLevel: 100,
      pushNotifications: true,
      emailNotifications: true,
      paymentReminders: true,
      dailyReports: false,
      darkMode: false,
      biometricLock: false,
      autoBackup: true,
      language: "English (India)",
      appVersion: "1.0.0",
      lastBackup: new Date().toISOString(),
      dataSize: "0 MB",
    };
  }

  // Update setting in database
  static async updateSetting(key, value) {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Determine value type
      let type = 'string';
      let stringValue = value;
      
      if (typeof value === 'boolean') {
        type = 'boolean';
        stringValue = value.toString();
      } else if (typeof value === 'number') {
        type = 'number';
        stringValue = value.toString();
      } else if (typeof value === 'object') {
        type = 'json';
        stringValue = JSON.stringify(value);
      }
      
      await db.runAsync(`
        INSERT OR REPLACE INTO settings (key, value, type, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [key, stringValue, type]);
      
      console.log('✅ Setting updated:', key, value);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      return { success: false, error: error.message };
    }
  }

  // Update multiple settings at once
  static async updateSettings(settings) {
    try {
      const db = await DatabaseService.getDatabase();
      
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        for (const [key, value] of Object.entries(settings)) {
          // Skip system settings
          if (['appVersion', 'dataSize'].includes(key)) continue;
          
          let type = 'string';
          let stringValue = value;
          
          if (typeof value === 'boolean') {
            type = 'boolean';
            stringValue = value.toString();
          } else if (typeof value === 'number') {
            type = 'number';
            stringValue = value.toString();
          } else if (typeof value === 'object') {
            type = 'json';
            stringValue = JSON.stringify(value);
          }
          
          await db.runAsync(`
            INSERT OR REPLACE INTO settings (key, value, type, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `, [key, stringValue, type]);
        }
        
        await db.execAsync('COMMIT');
        console.log('✅ Settings updated successfully');
        return { success: true };
        
      } catch (error) {
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate database size
  static async calculateDataSize() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Get record counts
      const counts = await Promise.all([
        db.getFirstAsync('SELECT COUNT(*) as count FROM parties'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM items'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM invoices'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM payments'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM expenses'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM stock_movements'),
      ]);
      
      const totalRecords = counts.reduce((sum, result) => sum + (result?.count || 0), 0);
      const estimatedSizeKB = totalRecords * 2; // Rough estimate: 2KB per record
      
      if (estimatedSizeKB < 1024) {
        return `${estimatedSizeKB} KB`;
      } else {
        return `${(estimatedSizeKB / 1024).toFixed(1)} MB`;
      }
    } catch (error) {
      console.error('❌ Error calculating data size:', error);
      return '0 KB';
    }
  }

  // Backup database to file
  static async backupDatabase() {
    try {
      const backupData = await this.exportAllData();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `brojgar_backup_${timestamp.split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
      
      // Update last backup timestamp
      await this.updateSetting('lastBackup', new Date().toISOString());
      
      // Share the backup file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Brojgar Database Backup',
          UTI: 'public.json'
        });
        
        return { success: true, filename };
      } else {
        return { success: false, error: 'Sharing not available on this device' };
      }
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Export all data from database
  static async exportAllData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Get all data from all tables
      const [
        settings,
        categories,
        parties,
        items,
        invoices,
        invoiceItems,
        payments,
        expenses,
        stockMovements
      ] = await Promise.all([
        db.getAllAsync('SELECT * FROM settings'),
        db.getAllAsync('SELECT * FROM categories'),
        db.getAllAsync('SELECT * FROM parties'),
        db.getAllAsync('SELECT * FROM items'),
        db.getAllAsync('SELECT * FROM invoices'),
        db.getAllAsync('SELECT * FROM invoice_items'),
        db.getAllAsync('SELECT * FROM payments'),
        db.getAllAsync('SELECT * FROM expenses'),
        db.getAllAsync('SELECT * FROM stock_movements')
      ]);

      return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          settings,
          categories,
          parties,
          items,
          invoices,
          invoiceItems,
          payments,
          expenses,
          stockMovements
        }
      };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  // Clear all data from database
  static async clearAllData() {
    try {
      const db = await DatabaseService.getDatabase();
      
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Clear all tables
        await db.execAsync('DELETE FROM stock_movements');
        await db.execAsync('DELETE FROM invoice_items');
        await db.execAsync('DELETE FROM payments');
        await db.execAsync('DELETE FROM expenses');
        await db.execAsync('DELETE FROM invoices');
        await db.execAsync('DELETE FROM items');
        await db.execAsync('DELETE FROM parties');
        await db.execAsync('DELETE FROM categories');
        await db.execAsync('DELETE FROM settings');
        
        // Reset auto-increment counters
        await db.execAsync('DELETE FROM sqlite_sequence');
        
        await db.execAsync('COMMIT');
        
        console.log('✅ All data cleared successfully');
        return { success: true };
        
      } catch (error) {
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return { success: false, error: error.message };
    }
  }

  // Restore database from backup
  static async restoreDatabase(backupFile) {
    try {
      const db = await DatabaseService.getDatabase();
      
      // Read backup file
      const backupContent = await FileSystem.readAsStringAsync(backupFile);
      const backupData = JSON.parse(backupContent);
      
      await db.execAsync('BEGIN TRANSACTION');
      
      try {
        // Clear existing data
        await this.clearAllData();
        
        // Restore each table
        const tables = ['settings', 'categories', 'parties', 'items', 'invoices', 'invoice_items', 'payments', 'expenses', 'stock_movements'];
        
        for (const tableName of tables) {
          if (backupData.data[tableName]) {
            await this.restoreTableData(db, tableName, backupData.data[tableName]);
          }
        }
        
        await db.execAsync('COMMIT');
        
        console.log('✅ Database restored successfully');
        return { success: true };
        
      } catch (error) {
        await db.execAsync('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Error restoring database:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to restore table data
  static async restoreTableData(db, tableName, records) {
    if (!records || records.length === 0) return;
    
    const firstRecord = records[0];
    const columns = Object.keys(firstRecord);
    const placeholders = columns.map(() => '?').join(', ');
    
    const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    for (const record of records) {
      const values = columns.map(col => record[col]);
      await db.runAsync(insertSQL, values);
    }
  }

  // Validate setting value
  static validateSetting(key, value) {
    const validations = {
      businessName: (val) => val && val.trim().length > 0,
      ownerName: (val) => val && val.trim().length > 0,
      phoneNumber: (val) => val && /^[+]?[\d\s-()]{10,}$/.test(val),
      emailAddress: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      gstNumber: (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(val),
      defaultCreditLimit: (val) => typeof val === 'number' && val >= 0,
      monthlySalesTarget: (val) => typeof val === 'number' && val >= 0,
      defaultTaxRate: (val) => typeof val === 'number' && val >= 0 && val <= 100,
      defaultMinStockLevel: (val) => typeof val === 'number' && val >= 0,
      defaultMaxStockLevel: (val) => typeof val === 'number' && val > 0,
    };

    if (validations[key]) {
      return validations[key](value);
    }

    return true; // Default to valid for unknown keys
  }

  // Get app statistics
  static async getAppStatistics() {
    try {
      const db = await DatabaseService.getDatabase();
      
      const [
        partiesCount,
        itemsCount,
        invoicesCount,
        paymentsCount,
        totalRevenue
      ] = await Promise.all([
        db.getFirstAsync('SELECT COUNT(*) as count FROM parties WHERE is_active = 1'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM items WHERE is_active = 1'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM invoices'),
        db.getFirstAsync('SELECT COUNT(*) as count FROM payments'),
        db.getFirstAsync('SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status != "cancelled"')
      ]);
      
      return {
        totalParties: partiesCount?.count || 0,
        totalItems: itemsCount?.count || 0,
        totalInvoices: invoicesCount?.count || 0,
        totalPayments: paymentsCount?.count || 0,
        totalRevenue: totalRevenue?.total || 0,
        dataSize: await this.calculateDataSize(),
        appVersion: "1.0.0",
      };
    } catch (error) {
      console.error('❌ Error getting app statistics:', error);
      return {};
    }
  }

  // Format currency
  static formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

export default SettingsService;
