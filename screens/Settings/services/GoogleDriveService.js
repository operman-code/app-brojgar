import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import DatabaseService from '../../../database/DatabaseService';

class GoogleDriveService {
  static accessToken = null;
  static userEmail = null;
  static autoBackupEnabled = false;
  static lastBackupDate = null;
  static dailyBackupFileId = null;

  // Google Drive API endpoints
  static GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
  static GOOGLE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

  // Setter methods for the component to use
  static setAccessToken(token) {
    this.accessToken = token;
  }

  static setUserEmail(email) {
    this.userEmail = email;
  }

  static async getUserInfo() {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  static async findDailyBackupFile() {
    try {
      const result = await this.listBackupFiles();
      if (result.success && result.files.length > 0) {
        const dailyBackup = result.files.find(file => 
          file.name === 'brojgar_daily_backup.json'
        );
        if (dailyBackup) {
          this.dailyBackupFileId = dailyBackup.id;
        }
      }
      return result.files;
    } catch (error) {
      console.error('Find daily backup file error:', error);
      return [];
    }
  }

  static async createDailyBackupFile() {
    try {
      const backupData = await DatabaseService.backup();
      const fileName = 'brojgar_daily_backup.json';
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      return { success: true, filePath, fileName };
    } catch (error) {
      console.error('Create daily backup file error:', error);
      return { success: false, error: error.message };
    }
  }

  static async uploadToGoogleDrive(filePath, fileName) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      
      const response = await fetch(`${this.GOOGLE_UPLOAD_API}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary=boundary'
        },
        body: this.createMultipartBody(fileName, fileContent)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return { success: true, fileId: result.id, fileName: result.name };
    } catch (error) {
      console.error('Upload to Google Drive error:', error);
      return { success: false, error: error.message };
    }
  }

  static createMultipartBody(fileName, fileContent) {
    const boundary = 'boundary';
    const metadata = {
      name: fileName,
      parents: ['root']
    };

    const multipartBody = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      fileContent,
      `--${boundary}--`
    ].join('\r\n');

    return multipartBody;
  }

  static async updateFileInGoogleDrive(fileId, filePath, fileName) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      
      const response = await fetch(`${this.GOOGLE_DRIVE_API}/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      return { success: true, fileId, fileName };
    } catch (error) {
      console.error('Update file in Google Drive error:', error);
      return { success: false, error: error.message };
    }
  }

  static async listBackupFiles() {
    try {
      const response = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name contains 'brojgar_backup' or name contains 'brojgar_daily_backup'&fields=files(id,name,createdTime,size)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const result = await response.json();
      return { success: true, files: result.files || [] };
    } catch (error) {
      console.error('List backup files error:', error);
      return { success: false, error: error.message };
    }
  }

  static async downloadBackupFile(fileId) {
    try {
      const response = await fetch(`${this.GOOGLE_DRIVE_API}/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const fileContent = await response.text();
      return { success: true, content: fileContent };
    } catch (error) {
      console.error('Download backup file error:', error);
      return { success: false, error: error.message };
    }
  }

  static async createBackup() {
    try {
      const backupData = await DatabaseService.backup();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `brojgar_backup_${timestamp}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      const uploadResult = await this.uploadToGoogleDrive(filePath, fileName);
      
      if (uploadResult.success) {
        await FileSystem.deleteAsync(filePath);
        return { success: true, fileName: uploadResult.fileName, fileId: uploadResult.fileId };
      } else {
        throw new Error(uploadResult.error);
      }
    } catch (error) {
      console.error('Create backup error:', error);
      return { success: false, error: error.message };
    }
  }

  static async createDailyBackup() {
    try {
      const backupResult = await this.createDailyBackupFile();
      if (!backupResult.success) {
        throw new Error(backupResult.error);
      }

      let uploadResult;
      if (this.dailyBackupFileId) {
        uploadResult = await this.updateFileInGoogleDrive(
          this.dailyBackupFileId, 
          backupResult.filePath, 
          backupResult.fileName
        );
      } else {
        uploadResult = await this.uploadToGoogleDrive(backupResult.filePath, backupResult.fileName);
        if (uploadResult.success) {
          this.dailyBackupFileId = uploadResult.fileId;
        }
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      await FileSystem.deleteAsync(backupResult.filePath);
      this.lastBackupDate = new Date().toISOString();
      await this.saveBackupSettings();
      
      return { success: true, fileName: uploadResult.fileName, fileId: uploadResult.fileId };
    } catch (error) {
      console.error('Create daily backup error:', error);
      return { success: false, error: error.message };
    }
  }

  static async restoreBackup(fileId) {
    try {
      const downloadResult = await this.downloadBackupFile(fileId);
      
      if (!downloadResult.success) {
        throw new Error(downloadResult.error);
      }

      const backupData = JSON.parse(downloadResult.content);
      await DatabaseService.restore(backupData);
      
      return { success: true };
    } catch (error) {
      console.error('Restore backup error:', error);
      return { success: false, error: error.message };
    }
  }

  static async enableAutoBackup() {
    this.autoBackupEnabled = true;
    await this.saveBackupSettings();
    await this.scheduleAutoBackup();
  }

  static async disableAutoBackup() {
    this.autoBackupEnabled = false;
    await this.saveBackupSettings();
    await this.cancelAutoBackup();
  }

  static async scheduleAutoBackup() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Auto Backup',
          body: 'Creating daily backup...',
          data: { type: 'auto_backup' }
        },
        trigger: {
          hour: 2,
          minute: 0,
          repeats: true
        }
      });
    } catch (error) {
      console.error('Schedule auto backup error:', error);
    }
  }

  static async cancelAutoBackup() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Cancel auto backup error:', error);
    }
  }

  static async checkBackupNeeded() {
    if (!this.autoBackupEnabled) {
      return false;
    }

    if (!this.lastBackupDate) {
      return true;
    }

    const lastBackup = new Date(this.lastBackupDate);
    const now = new Date();
    const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);

    return hoursSinceLastBackup >= 24;
  }

  static async performAutoBackup() {
    if (await this.checkBackupNeeded()) {
      const result = await this.createDailyBackup();
      if (result.success) {
        console.log('Auto backup completed successfully');
      }
      return result;
    }
    return { success: true, message: 'No backup needed' };
  }

  static async saveBackupSettings() {
    const settings = {
      autoBackupEnabled: this.autoBackupEnabled,
      lastBackupDate: this.lastBackupDate,
      userEmail: this.userEmail,
      dailyBackupFileId: this.dailyBackupFileId
    };
    await DatabaseService.setSetting('backup_settings', JSON.stringify(settings));
  }

  static async loadBackupSettings() {
    const settingsJson = await DatabaseService.getSetting('backup_settings');
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      this.autoBackupEnabled = settings.autoBackupEnabled || false;
      this.lastBackupDate = settings.lastBackupDate;
      this.userEmail = settings.userEmail;
      this.dailyBackupFileId = settings.dailyBackupFileId;
    }
  }

  static isAuthenticated() {
    return !!this.accessToken;
  }

  static getUserEmail() {
    return this.userEmail;
  }

  static getAutoBackupStatus() {
    return {
      enabled: this.autoBackupEnabled,
      lastBackup: this.lastBackupDate
    };
  }

  static async logout() {
    this.accessToken = null;
    this.userEmail = null;
    this.autoBackupEnabled = false;
    this.lastBackupDate = null;
    this.dailyBackupFileId = null;
    await this.cancelAutoBackup();
  }
}

export default GoogleDriveService;
