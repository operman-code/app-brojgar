// screens/Backup/services/BackupService.js
import DatabaseService from '../../../database/DatabaseService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class BackupService {
  static async init() {
    try {
      console.log('✅ Backup service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing backup service:', error);
      throw error;
    }
  }

  // Create backup
  static async createBackup(type = 'manual') {
    try {
      const backupData = await DatabaseService.backup();
      const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      // Save backup record
      await this.saveBackupRecord(filename, JSON.stringify(backupData).length, type);
      
      return {
        success: true,
        filename,
        data: backupData
      };
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save backup record
  static async saveBackupRecord(filename, fileSize, type) {
    try {
      const query = `
        INSERT INTO backups (filename, file_size, backup_type, status) 
        VALUES (?, ?, ?, ?)
      `;
      
      await DatabaseService.executeQuery(query, [filename, fileSize, type, 'completed']);
    } catch (error) {
      console.error('❌ Error saving backup record:', error);
    }
  }

  // Get backup history
  static async getBackupHistory() {
    try {
      const query = `
        SELECT * FROM backups 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC
      `;
      
      return await DatabaseService.executeQuery(query);
    } catch (error) {
      console.error('❌ Error getting backup history:', error);
      return [];
    }
  }

  // Export backup
  static async exportBackup(backupData, filename) {
    try {
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return { success: true, fileUri };
    } catch (error) {
      console.error('❌ Error exporting backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Get backup statistics
  static async getBackupStats() {
    try {
      const totalSizeQuery = `
        SELECT COALESCE(SUM(file_size), 0) as total_size 
        FROM backups 
        WHERE deleted_at IS NULL
      `;
      
      const totalBackupsQuery = `
        SELECT COUNT(*) as total_backups 
        FROM backups 
        WHERE deleted_at IS NULL
      `;
      
      const lastBackupQuery = `
        SELECT MAX(created_at) as last_backup 
        FROM backups 
        WHERE deleted_at IS NULL
      `;

      const [totalSizeResult, totalBackupsResult, lastBackupResult] = await Promise.all([
        DatabaseService.executeQuery(totalSizeQuery),
        DatabaseService.executeQuery(totalBackupsQuery),
        DatabaseService.executeQuery(lastBackupQuery)
      ]);

      return {
        totalSize: totalSizeResult[0]?.total_size || 0,
        totalBackups: totalBackupsResult[0]?.total_backups || 0,
        lastBackup: lastBackupResult[0]?.last_backup || null
      };
    } catch (error) {
      console.error('❌ Error getting backup stats:', error);
      return {
        totalSize: 0,
        totalBackups: 0,
        lastBackup: null
      };
    }
  }
}

export default BackupService;
