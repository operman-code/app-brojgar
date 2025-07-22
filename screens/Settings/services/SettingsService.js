// Add these methods to the end of screens/Settings/services/SettingsService.js

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
