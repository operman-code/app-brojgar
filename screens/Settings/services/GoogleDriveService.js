// screens/Settings/services/GoogleDriveService.js
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import DatabaseService from '../../../database/DatabaseService';

WebBrowser.maybeCompleteAuthSession();

class GoogleDriveService {
  static accessToken = null;
  static userEmail = null;
  static autoBackupEnabled = false;
  static lastBackupDate = null;

  // Google Drive API endpoints
  static GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
  static GOOGLE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

  // Initialize Google Auth
  static async initializeAuth() {
    try {
      const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: 'YOUR_EXPO_CLIENT_ID',
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/userinfo.email'
        ]
      });

      return { request, response, promptAsync };
    } catch (error) {
      console.error('❌ Error initializing Google Auth:', error);
      throw error;
    }
  }

  // Authenticate user
  static async authenticateUser() {
    try {
      const { promptAsync } = await this.initializeAuth();
      const result = await promptAsync();

      if (result.type === 'success') {
        this.accessToken = result.authentication.accessToken;
        
        // Get user email
        const userInfo = await this.getUserInfo();
        this.userEmail = userInfo.email;
        
        // Check for existing backups
        await this.checkExistingBackups();
        
        console.log('✅ Google authentication successful');
        return { success: true, email: this.userEmail };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Google authentication failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user info from Google
  static async getUserInfo() {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      throw error;
    }
  }

  // Check for existing backups
  static async checkExistingBackups() {
    try {
      const result = await this.listBackupFiles();
      if (result.success && result.files.length > 0) {
        console.log(`📁 Found ${result.files.length} existing backup(s)`);
        return result.files;
      } else {
        console.log('📁 No existing backups found');
        return [];
      }
    } catch (error) {
      console.error('❌ Error checking existing backups:', error);
      return [];
    }
  }

  // Create backup file
  static async createBackupFile() {
    try {
      const backupData = await DatabaseService.backup();
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `brojgar_backup_${timestamp}_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write backup to local file
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));
      
      return { success: true, filePath, fileName };
    } catch (error) {
      console.error('❌ Error creating backup file:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload file to Google Drive
  static async uploadToGoogleDrive(filePath, fileName) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      
      // Create metadata
      const metadata = {
        name: fileName,
        parents: ['appDataFolder'], // Store in app-specific folder
        description: 'Brojgar Business App Backup'
      };

      // Upload file
      const response = await fetch(`${this.GOOGLE_UPLOAD_API}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary=foo_bar_baz'
        },
        body: this.createMultipartBody(metadata, fileContent)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ File uploaded to Google Drive:', result.id);
      
      return { success: true, fileId: result.id, fileName };
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error);
      return { success: false, error: error.message };
    }
  }

  // Create multipart body for upload
  static createMultipartBody(metadata, fileContent) {
    const boundary = 'foo_bar_baz';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartBody = 
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    return multipartBody;
  }

  // List backup files from Google Drive
  static async listBackupFiles() {
    try {
      const response = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name contains 'brojgar_backup' and trashed=false&orderBy=createdTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, files: result.files || [] };
    } catch (error) {
      console.error('❌ Error listing backup files:', error);
      return { success: false, error: error.message };
    }
  }

  // Download backup file from Google Drive
  static async downloadBackupFile(fileId) {
    try {
      const response = await fetch(
        `${this.GOOGLE_DRIVE_API}/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const backupData = await response.json();
      return { success: true, backupData };
    } catch (error) {
      console.error('❌ Error downloading backup file:', error);
      return { success: false, error: error.message };
    }
  }

  // Create backup and upload to Google Drive
  static async createBackup() {
    try {
      console.log('🔄 Creating backup...');
      
      // Step 1: Create backup file
      const backupResult = await this.createBackupFile();
      if (!backupResult.success) {
        throw new Error(backupResult.error);
      }

      // Step 2: Upload to Google Drive
      const uploadResult = await this.uploadToGoogleDrive(
        backupResult.filePath, 
        backupResult.fileName
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Step 3: Clean up local file
      await FileSystem.deleteAsync(backupResult.filePath);

      // Step 4: Update last backup date
      this.lastBackupDate = new Date().toISOString();
      await this.saveBackupSettings();

      console.log('✅ Backup created and uploaded successfully');
      return { 
        success: true, 
        fileName: uploadResult.fileName,
        fileId: uploadResult.fileId 
      };
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Restore backup from Google Drive
  static async restoreBackup(fileId) {
    try {
      console.log('🔄 Restoring backup...');
      
      // Step 1: Download backup file
      const downloadResult = await this.downloadBackupFile(fileId);
      if (!downloadResult.success) {
        throw new Error(downloadResult.error);
      }

      // Step 2: Restore to database
      const restoreResult = await DatabaseService.restore(downloadResult.backupData);
      if (!restoreResult) {
        throw new Error('Database restore failed');
      }

      console.log('✅ Backup restored successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Enable auto backup
  static async enableAutoBackup() {
    try {
      this.autoBackupEnabled = true;
      await this.saveBackupSettings();
      await this.scheduleAutoBackup();
      console.log('✅ Auto backup enabled');
      return { success: true };
    } catch (error) {
      console.error('❌ Error enabling auto backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Disable auto backup
  static async disableAutoBackup() {
    try {
      this.autoBackupEnabled = false;
      await this.saveBackupSettings();
      await this.cancelAutoBackup();
      console.log('✅ Auto backup disabled');
      return { success: true };
    } catch (error) {
      console.error('❌ Error disabling auto backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule auto backup
  static async scheduleAutoBackup() {
    try {
      // Schedule daily backup at 2 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Auto Backup',
          body: 'Creating daily backup of your data...',
          data: { type: 'auto_backup' }
        },
        trigger: {
          hour: 2,
          minute: 0,
          repeats: true
        }
      });

      console.log('✅ Auto backup scheduled');
    } catch (error) {
      console.error('❌ Error scheduling auto backup:', error);
    }
  }

  // Cancel auto backup
  static async cancelAutoBackup() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Auto backup cancelled');
    } catch (error) {
      console.error('❌ Error cancelling auto backup:', error);
    }
  }

  // Check if backup is needed
  static async checkBackupNeeded() {
    try {
      if (!this.autoBackupEnabled || !this.isAuthenticated()) {
        return false;
      }

      const lastBackup = this.lastBackupDate;
      if (!lastBackup) {
        return true; // No backup ever created
      }

      const lastBackupDate = new Date(lastBackup);
      const now = new Date();
      const daysSinceLastBackup = (now - lastBackupDate) / (1000 * 60 * 60 * 24);

      return daysSinceLastBackup >= 1; // Backup needed if more than 1 day
    } catch (error) {
      console.error('❌ Error checking backup needed:', error);
      return false;
    }
  }

  // Perform auto backup
  static async performAutoBackup() {
    try {
      if (await this.checkBackupNeeded()) {
        console.log('🔄 Performing auto backup...');
        const result = await this.createBackup();
        
        if (result.success) {
          // Send notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Backup Complete',
              body: 'Your data has been backed up to Google Drive',
              data: { type: 'backup_complete' }
            },
            trigger: null
          });
        }
        
        return result;
      }
      
      return { success: true, message: 'No backup needed' };
    } catch (error) {
      console.error('❌ Auto backup failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Save backup settings
  static async saveBackupSettings() {
    try {
      const settings = {
        autoBackupEnabled: this.autoBackupEnabled,
        lastBackupDate: this.lastBackupDate,
        userEmail: this.userEmail
      };

      await DatabaseService.setSetting('backup_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('❌ Error saving backup settings:', error);
    }
  }

  // Load backup settings
  static async loadBackupSettings() {
    try {
      const settingsJson = await DatabaseService.getSetting('backup_settings');
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        this.autoBackupEnabled = settings.autoBackupEnabled || false;
        this.lastBackupDate = settings.lastBackupDate;
        this.userEmail = settings.userEmail;
      }
    } catch (error) {
      console.error('❌ Error loading backup settings:', error);
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return this.accessToken !== null;
  }

  // Get user email
  static getUserEmail() {
    return this.userEmail;
  }

  // Get auto backup status
  static getAutoBackupStatus() {
    return {
      enabled: this.autoBackupEnabled,
      lastBackup: this.lastBackupDate,
      userEmail: this.userEmail
    };
  }

  // Logout
  static async logout() {
    this.accessToken = null;
    this.userEmail = null;
    this.autoBackupEnabled = false;
    this.lastBackupDate = null;
    await this.cancelAutoBackup();
    console.log('✅ Logged out from Google Drive');
  }
}

export default GoogleDriveService;
