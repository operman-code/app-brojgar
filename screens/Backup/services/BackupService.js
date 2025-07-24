// screens/Backup/services/BackupService.js
import DatabaseService from '../../../database/DatabaseService';

class BackupService {
  static async createBackup(includeImages = false) {
    try {
      await DatabaseService.init();
      
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
      };

      // Get all data from tables
      const tables = [
        'parties',
        'inventory_items',
        'categories',
        'invoices',
        'invoice_items',
        'transactions',
        'notifications',
        'business_settings'
      ];

      for (const table of tables) {
        try {
          const query = `SELECT * FROM ${table} WHERE (deleted_at IS NULL OR deleted_at = '')`;
          const result = await DatabaseService.executeQuery(query);
          backupData.data[table] = result.rows._array;
        } catch (error) {
          console.warn(`Table ${table} might not exist:`, error);
          backupData.data[table] = [];
        }
      }

      // Create backup record
      const backupId = await this.saveBackupRecord(backupData, includeImages);
      
      return {
        success: true,
        backupId,
        data: backupData,
        size: JSON.stringify(backupData).length
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async saveBackupRecord(backupData, includeImages) {
    try {
      const backupSize = JSON.stringify(backupData).length;
      const recordCount = Object.values(backupData.data).reduce((sum, table) => sum + table.length, 0);
      
      const query = `
        INSERT INTO backups (
          backup_name, backup_size, record_count, include_images, 
          backup_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;
      
      const backupName = `Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
      
      const result = await DatabaseService.executeQuery(query, [
        backupName,
        backupSize,
        recordCount,
        includeImages ? 1 : 0,
        JSON.stringify(backupData)
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error saving backup record:', error);
      throw error;
    }
  }

  static async getBackupStats() {
    try {
      await DatabaseService.init();
      
      const queries = {
        totalBackups: 'SELECT COUNT(*) as count FROM backups WHERE (deleted_at IS NULL OR deleted_at = "")',
        totalSize: 'SELECT SUM(backup_size) as size FROM backups WHERE (deleted_at IS NULL OR deleted_at = "")',
        lastBackup: 'SELECT created_at FROM backups WHERE (deleted_at IS NULL OR deleted_at = "") ORDER BY created_at DESC LIMIT 1',
      };
      
      const results = await Promise.all(
        Object.entries(queries).map(async ([key, query]) => {
          try {
            const result = await DatabaseService.executeQuery(query);
            return [key, result.rows._array[0]];
          } catch (error) {
            console.warn(`Error in backup stats query ${key}:`, error);
            return [key, { count: 0, size: 0, created_at: null }];
          }
        })
      );
      
      const stats = Object.fromEntries(results);
      
      return {
        totalBackups: stats.totalBackups?.count || 0,
        totalSize: this.formatFileSize(stats.totalSize?.size || 0),
        lastBackupDate: stats.lastBackup?.created_at ? 
          new Date(stats.lastBackup.created_at).toLocaleDateString() : 'Never',
        lastBackupDaysAgo: stats.lastBackup?.created_at ? 
          this.getDaysAgo(stats.lastBackup.created_at) : null
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return {
        totalBackups: 0,
        totalSize: '0 B',
        lastBackupDate: 'Never',
        lastBackupDaysAgo: null
      };
    }
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  static getDaysAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  static async scheduleAutomaticBackup() {
    try {
      const stats = await this.getBackupStats();
      
      // Create automatic backup if last backup was more than 7 days ago
      if (!stats.lastBackupDaysAgo || stats.lastBackupDaysAgo >= 7) {
        console.log('Creating automatic backup...');
        const result = await this.createBackup(false);
        
        return result;
      }
      
      return { success: true, message: 'Backup not needed yet' };
    } catch (error) {
      console.error('Error scheduling automatic backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async initializeBackupSystem() {
    try {
      await DatabaseService.init();
      console.log('✅ Backup system initialized');
    } catch (error) {
      console.error('Error initializing backup system:', error);
    }
  }
}

export default BackupService;
