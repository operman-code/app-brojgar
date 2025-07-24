// screens/Backup/services/BackupService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

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
          const query = `SELECT * FROM ${table} WHERE deleted_at IS NULL OR deleted_at = ''`;
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

  static async getBackupHistory(limit = 20) {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT id, backup_name, backup_size, record_count, include_images, 
               created_at, status
        FROM backups 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      const result = await DatabaseService.executeQuery(query, [limit]);
      
      return result.rows._array.map(backup => ({
        ...backup,
        formattedSize: this.formatFileSize(backup.backup_size),
        timeAgo: this.getTimeAgo(backup.created_at),
        include_images: backup.include_images === 1
      }));
    } catch (error) {
      console.error('Error getting backup history:', error);
      return [];
    }
  }

  static async restoreFromBackup(backupId) {
    try {
      await DatabaseService.init();
      
      // Get backup data
      const query = 'SELECT backup_data FROM backups WHERE id = ?';
      const result = await DatabaseService.executeQuery(query, [backupId]);
      
      if (result.rows._array.length === 0) {
        throw new Error('Backup not found');
      }
      
      const backupData = JSON.parse(result.rows._array[0].backup_data);
      
      // Begin transaction
      await DatabaseService.executeQuery('BEGIN TRANSACTION');
      
      try {
        // Clear existing data (soft delete)
        const tables = Object.keys(backupData.data);
        for (const table of tables) {
          await DatabaseService.executeQuery(
            `UPDATE ${table} SET deleted_at = datetime('now') WHERE deleted_at IS NULL`
          );
        }
        
        // Restore data
        for (const [table, records] of Object.entries(backupData.data)) {
          if (records.length === 0) continue;
          
          // Get table structure
          const columns = Object.keys(records[0]).filter(col => col !== 'id');
          const placeholders = columns.map(() => '?').join(', ');
          const columnNames = columns.join(', ');
          
          const insertQuery = `
            INSERT INTO ${table} (${columnNames}) 
            VALUES (${placeholders})
          `;
          
          for (const record of records) {
            const values = columns.map(col => record[col]);
            await DatabaseService.executeQuery(insertQuery, values);
          }
        }
        
        // Commit transaction
        await DatabaseService.executeQuery('COMMIT');
        
        // Update backup status
        await DatabaseService.executeQuery(
          'UPDATE backups SET status = ? WHERE id = ?',
          ['restored', backupId]
        );
        
        return { success: true };
      } catch (error) {
        // Rollback on error
        await DatabaseService.executeQuery('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteBackup(backupId) {
    try {
      await DatabaseService.init();
      
      const query = `
        UPDATE backups 
        SET deleted_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      
      await DatabaseService.executeQuery(query, [backupId]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async exportBackup(backupId, format = 'json') {
    try {
      await DatabaseService.init();
      
      // Get backup data
      const query = 'SELECT * FROM backups WHERE id = ?';
      const result = await DatabaseService.executeQuery(query, [backupId]);
      
      if (result.rows._array.length === 0) {
        throw new Error('Backup not found');
      }
      
      const backup = result.rows._array[0];
      const backupData = JSON.parse(backup.backup_data);
      
      let exportData;
      let fileName;
      let mimeType;
      
      switch (format) {
        case 'json':
          exportData = JSON.stringify(backupData, null, 2);
          fileName = `${backup.backup_name}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          exportData = await this.convertToCSV(backupData);
          fileName = `${backup.backup_name}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'sql':
          exportData = await this.convertToSQL(backupData);
          fileName = `${backup.backup_name}.sql`;
          mimeType = 'application/sql';
          break;
          
        default:
          throw new Error('Unsupported export format');
      }
      
      // Write to file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, exportData);
      
      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export Backup - ${backup.backup_name}`
        });
      }
      
      return { success: true, fileUri, fileName };
    } catch (error) {
      console.error('Error exporting backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async importBackup() {
    try {
      // Pick file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain'],
        copyToCacheDirectory: true
      });
      
      if (result.type === 'cancel') {
        return { success: false, cancelled: true };
      }
      
      // Read file content
      const fileContent = await FileSystem.readAsStringAsync(result.uri);
      const backupData = JSON.parse(fileContent);
      
      // Validate backup format
      if (!backupData.version || !backupData.data) {
        throw new Error('Invalid backup file format');
      }
      
      // Create new backup record
      const backupId = await this.saveBackupRecord(backupData, false);
      
      return { 
        success: true, 
        backupId,
        fileName: result.name,
        recordCount: Object.values(backupData.data).reduce((sum, table) => sum + table.length, 0)
      };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { success: false, error: error.message };
    }
  }

  static async getBackupStats() {
    try {
      await DatabaseService.init();
      
      const queries = {
        totalBackups: 'SELECT COUNT(*) as count FROM backups WHERE deleted_at IS NULL',
        totalSize: 'SELECT SUM(backup_size) as size FROM backups WHERE deleted_at IS NULL',
        lastBackup: 'SELECT created_at FROM backups WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1',
        avgSize: 'SELECT AVG(backup_size) as size FROM backups WHERE deleted_at IS NULL'
      };
      
      const results = await Promise.all(
        Object.entries(queries).map(async ([key, query]) => {
          const result = await DatabaseService.executeQuery(query);
          return [key, result.rows._array[0]];
        })
      );
      
      const stats = Object.fromEntries(results);
      
      return {
        totalBackups: stats.totalBackups.count || 0,
        totalSize: this.formatFileSize(stats.totalSize.size || 0),
        lastBackupDate: stats.lastBackup.created_at ? 
          new Date(stats.lastBackup.created_at).toLocaleDateString() : 'Never',
        averageSize: this.formatFileSize(stats.avgSize.size || 0),
        lastBackupDaysAgo: stats.lastBackup.created_at ? 
          this.getDaysAgo(stats.lastBackup.created_at) : null
      };
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return {
        totalBackups: 0,
        totalSize: '0 B',
        lastBackupDate: 'Never',
        averageSize: '0 B',
        lastBackupDaysAgo: null
      };
    }
  }

  static async convertToCSV(backupData) {
    let csvContent = '';
    
    for (const [tableName, records] of Object.entries(backupData.data)) {
      if (records.length === 0) continue;
      
      csvContent += `\n\n=== ${tableName.toUpperCase()} ===\n`;
      
      // Headers
      const headers = Object.keys(records[0]);
      csvContent += headers.join(',') + '\n';
      
      // Data rows
      for (const record of records) {
        const row = headers.map(header => {
          const value = record[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvContent += row.join(',') + '\n';
      }
    }
    
    return csvContent;
  }

  static async convertToSQL(backupData) {
    let sqlContent = `-- Backup Export Generated on ${new Date().toISOString()}\n`;
    sqlContent += `-- Version: ${backupData.version}\n\n`;
    
    for (const [tableName, records] of Object.entries(backupData.data)) {
      if (records.length === 0) continue;
      
      sqlContent += `\n-- Data for table: ${tableName}\n`;
      
      for (const record of records) {
        const columns = Object.keys(record).join(', ');
        const values = Object.values(record).map(value => {
          if (value === null || value === undefined) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          return value;
        }).join(', ');
        
        sqlContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
      }
    }
    
    return sqlContent;
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  static getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return time.toLocaleDateString();
  }

  static getDaysAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

  // Schedule automatic backups
  static async scheduleAutomaticBackup() {
    try {
      const stats = await this.getBackupStats();
      
      // Create automatic backup if last backup was more than 7 days ago
      if (!stats.lastBackupDaysAgo || stats.lastBackupDaysAgo >= 7) {
        console.log('Creating automatic backup...');
        const result = await this.createBackup(false);
        
        if (result.success) {
          // Create notification about automatic backup
          await DatabaseService.executeQuery(`
            INSERT INTO notifications (
              title, message, type, priority, created_at, updated_at
            ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
          `, [
            'Automatic Backup Created',
            'Your business data has been automatically backed up.',
            'backup_reminder',
            'low'
          ]);
        }
        
        return result;
      }
      
      return { success: true, message: 'Backup not needed yet' };
    } catch (error) {
      console.error('Error scheduling automatic backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Initialize backup system
  static async initializeBackupSystem() {
    try {
      await DatabaseService.init();
      
      // Create backups table
      await DatabaseService.executeQuery(`
        CREATE TABLE IF NOT EXISTS backups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backup_name TEXT NOT NULL,
          backup_size INTEGER DEFAULT 0,
          record_count INTEGER DEFAULT 0,
          include_images INTEGER DEFAULT 0,
          backup_data TEXT,
          status TEXT DEFAULT 'completed',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        )
      `);
      
      console.log('✅ Backup system initialized');
    } catch (error) {
      console.error('Error initializing backup system:', error);
    }
  }
}

export default BackupService;
