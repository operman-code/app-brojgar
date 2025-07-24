// screens/Settings/services/SettingsService.js
import DatabaseService from '../../../database/DatabaseService';

class SettingsService {
  static async getBusinessProfile() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM business_settings 
        WHERE setting_key LIKE 'business_%' 
        ORDER BY setting_key
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const settings = result.rows._array;
      
      // Convert array of settings to object
      const profile = {};
      settings.forEach(setting => {
        const key = setting.setting_key.replace('business_', '');
        profile[key] = setting.setting_value;
      });
      
      // Set defaults if no data exists
      return {
        name: profile.name || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        gstin: profile.gstin || '',
        pan: profile.pan || '',
        website: profile.website || '',
        logo: profile.logo || null,
        tagline: profile.tagline || '',
        established_year: profile.established_year || '',
        business_type: profile.business_type || 'Retail'
      };
    } catch (error) {
      console.error('Error getting business profile:', error);
      return this.getDefaultBusinessProfile();
    }
  }

  static async updateBusinessProfile(profileData) {
    try {
      await DatabaseService.init();
      
      // Update each setting
      for (const [key, value] of Object.entries(profileData)) {
        const settingKey = `business_${key}`;
        
        // Check if setting exists
        const checkQuery = 'SELECT id FROM business_settings WHERE setting_key = ?';
        const checkResult = await DatabaseService.executeQuery(checkQuery, [settingKey]);
        
        if (checkResult.rows._array.length > 0) {
          // Update existing setting
          const updateQuery = `
            UPDATE business_settings 
            SET setting_value = ?, updated_at = datetime('now')
            WHERE setting_key = ?
          `;
          await DatabaseService.executeQuery(updateQuery, [value, settingKey]);
        } else {
          // Insert new setting
          const insertQuery = `
            INSERT INTO business_settings (setting_key, setting_value, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))
          `;
          await DatabaseService.executeQuery(insertQuery, [settingKey, value]);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating business profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAppSettings() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM business_settings 
        WHERE setting_key LIKE 'app_%' 
        ORDER BY setting_key
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const settings = result.rows._array;
      
      // Convert array of settings to object
      const appSettings = {};
      settings.forEach(setting => {
        const key = setting.setting_key.replace('app_', '');
        appSettings[key] = setting.setting_value;
      });
      
      // Set defaults
      return {
        theme: appSettings.theme || 'light',
        notifications_enabled: appSettings.notifications_enabled === 'true',
        backup_frequency: appSettings.backup_frequency || 'weekly',
        currency: appSettings.currency || 'INR',
        date_format: appSettings.date_format || 'DD/MM/YYYY',
        decimal_places: parseInt(appSettings.decimal_places) || 2,
        auto_backup: appSettings.auto_backup === 'true',
        sound_enabled: appSettings.sound_enabled !== 'false', // default true
        vibration_enabled: appSettings.vibration_enabled !== 'false', // default true
        language: appSettings.language || 'en',
        tax_rate: parseFloat(appSettings.tax_rate) || 18.0
      };
    } catch (error) {
      console.error('Error getting app settings:', error);
      return this.getDefaultAppSettings();
    }
  }

  static async updateAppSettings(settings) {
    try {
      await DatabaseService.init();
      
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        const settingKey = `app_${key}`;
        const settingValue = typeof value === 'boolean' ? value.toString() : value.toString();
        
        // Check if setting exists
        const checkQuery = 'SELECT id FROM business_settings WHERE setting_key = ?';
        const checkResult = await DatabaseService.executeQuery(checkQuery, [settingKey]);
        
        if (checkResult.rows._array.length > 0) {
          // Update existing setting
          const updateQuery = `
            UPDATE business_settings 
            SET setting_value = ?, updated_at = datetime('now')
            WHERE setting_key = ?
          `;
          await DatabaseService.executeQuery(updateQuery, [settingValue, settingKey]);
        } else {
          // Insert new setting
          const insertQuery = `
            INSERT INTO business_settings (setting_key, setting_value, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))
          `;
          await DatabaseService.executeQuery(insertQuery, [settingKey, settingValue]);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating app settings:', error);
      return { success: false, error: error.message };
    }
  }

  static async getSecuritySettings() {
    try {
      await DatabaseService.init();
      
      const query = `
        SELECT * FROM business_settings 
        WHERE setting_key LIKE 'security_%' 
        ORDER BY setting_key
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const settings = result.rows._array;
      
      // Convert array of settings to object
      const securitySettings = {};
      settings.forEach(setting => {
        const key = setting.setting_key.replace('security_', '');
        securitySettings[key] = setting.setting_value;
      });
      
      return {
        pin_enabled: securitySettings.pin_enabled === 'true',
        fingerprint_enabled: securitySettings.fingerprint_enabled === 'true',
        auto_lock_time: parseInt(securitySettings.auto_lock_time) || 5, // minutes
        failed_attempts_limit: parseInt(securitySettings.failed_attempts_limit) || 3,
        data_encryption: securitySettings.data_encryption === 'true',
        backup_encryption: securitySettings.backup_encryption === 'true'
      };
    } catch (error) {
      console.error('Error getting security settings:', error);
      return {
        pin_enabled: false,
        fingerprint_enabled: false,
        auto_lock_time: 5,
        failed_attempts_limit: 3,
        data_encryption: false,
        backup_encryption: false
      };
    }
  }

  static async updateSecuritySettings(settings) {
    try {
      await DatabaseService.init();
      
      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        const settingKey = `security_${key}`;
        const settingValue = typeof value === 'boolean' ? value.toString() : value.toString();
        
        // Check if setting exists
        const checkQuery = 'SELECT id FROM business_settings WHERE setting_key = ?';
        const checkResult = await DatabaseService.executeQuery(checkQuery, [settingKey]);
        
        if (checkResult.rows._array.length > 0) {
          // Update existing setting
          const updateQuery = `
            UPDATE business_settings 
            SET setting_value = ?, updated_at = datetime('now')
            WHERE setting_key = ?
          `;
          await DatabaseService.executeQuery(updateQuery, [settingValue, settingKey]);
        } else {
          // Insert new setting
          const insertQuery = `
            INSERT INTO business_settings (setting_key, setting_value, created_at, updated_at)
            VALUES (?, ?, datetime('now'), datetime('now'))
          `;
          await DatabaseService.executeQuery(insertQuery, [settingKey, settingValue]);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating security settings:', error);
      return { success: false, error: error.message };
    }
  }

  static async getDataSettings() {
    try {
      await DatabaseService.init();
      
      // Get database statistics
      const stats = await this.getDatabaseStats();
      
      const query = `
        SELECT * FROM business_settings 
        WHERE setting_key LIKE 'data_%' 
        ORDER BY setting_key
      `;
      
      const result = await DatabaseService.executeQuery(query);
      const settings = result.rows._array;
      
      // Convert array of settings to object
      const dataSettings = {};
      settings.forEach(setting => {
        const key = setting.setting_key.replace('data_', '');
        dataSettings[key] = setting.setting_value;
      });
      
      return {
        auto_sync: dataSettings.auto_sync === 'true',
        sync_frequency: dataSettings.sync_frequency || 'daily',
        cloud_backup: dataSettings.cloud_backup === 'true',
        data_retention_days: parseInt(dataSettings.data_retention_days) || 365,
        compress_backups: dataSettings.compress_backups !== 'false', // default true
        ...stats
      };
    } catch (error) {
      console.error('Error getting data settings:', error);
      return {
        auto_sync: false,
        sync_frequency: 'daily',
        cloud_backup: false,
        data_retention_days: 365,
        compress_backups: true,
        totalRecords: 0,
        databaseSize: '0 KB',
        lastBackup: 'Never'
      };
    }
  }

  static async getDatabaseStats() {
    try {
      const tables = [
        'parties', 'inventory_items', 'invoices', 'invoice_items', 
        'transactions', 'notifications', 'business_settings'
      ];
      
      let totalRecords = 0;
      
      for (const table of tables) {
        try {
          const query = `SELECT COUNT(*) as count FROM ${table} WHERE deleted_at IS NULL OR deleted_at = ''`;
          const result = await DatabaseService.executeQuery(query);
          totalRecords += result.rows._array[0].count;
        } catch (error) {
          console.warn(`Table ${table} might not exist:`, error);
        }
      }
      
      // Get last backup date
      const backupQuery = `
        SELECT created_at FROM backups 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      let lastBackup = 'Never';
      try {
        const backupResult = await DatabaseService.executeQuery(backupQuery);
        if (backupResult.rows._array.length > 0) {
          lastBackup = new Date(backupResult.rows._array[0].created_at).toLocaleDateString();
        }
      } catch (error) {
        console.warn('Backup table might not exist:', error);
      }
      
      return {
        totalRecords,
        databaseSize: `${Math.round(totalRecords * 0.5)} KB`, // Rough estimate
        lastBackup
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalRecords: 0,
        databaseSize: '0 KB',
        lastBackup: 'Never'
      };
    }
  }

  static async exportSettings() {
    try {
      const [businessProfile, appSettings, securitySettings] = await Promise.all([
        this.getBusinessProfile(),
        this.getAppSettings(),
        this.getSecuritySettings()
      ]);
      
      const settingsExport = {
        export_date: new Date().toISOString(),
        version: '1.0',
        business_profile: businessProfile,
        app_settings: appSettings,
        security_settings: {
          // Don't export sensitive security settings
          auto_lock_time: securitySettings.auto_lock_time,
          failed_attempts_limit: securitySettings.failed_attempts_limit
        }
      };
      
      return { success: true, data: settingsExport };
    } catch (error) {
      console.error('Error exporting settings:', error);
      return { success: false, error: error.message };
    }
  }

  static async importSettings(settingsData) {
    try {
      if (!settingsData.business_profile && !settingsData.app_settings) {
        throw new Error('Invalid settings format');
      }
      
      const results = [];
      
      if (settingsData.business_profile) {
        const businessResult = await this.updateBusinessProfile(settingsData.business_profile);
        results.push({ type: 'business_profile', success: businessResult.success });
      }
      
      if (settingsData.app_settings) {
        const appResult = await this.updateAppSettings(settingsData.app_settings);
        results.push({ type: 'app_settings', success: appResult.success });
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error importing settings:', error);
      return { success: false, error: error.message };
    }
  }

  static async resetSettings(settingType = 'all') {
    try {
      await DatabaseService.init();
      
      let query;
      
      switch (settingType) {
        case 'business':
          query = "DELETE FROM business_settings WHERE setting_key LIKE 'business_%'";
          break;
        case 'app':
          query = "DELETE FROM business_settings WHERE setting_key LIKE 'app_%'";
          break;
        case 'security':
          query = "DELETE FROM business_settings WHERE setting_key LIKE 'security_%'";
          break;
        case 'all':
          query = "DELETE FROM business_settings";
          break;
        default:
          throw new Error('Invalid setting type');
      }
      
      await DatabaseService.executeQuery(query);
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: error.message };
    }
  }

  static async clearAllData() {
    try {
      await DatabaseService.init();
      
      const tables = [
        'parties', 'inventory_items', 'categories', 'invoices', 
        'invoice_items', 'transactions', 'notifications'
      ];
      
      // Soft delete all data
      for (const table of tables) {
        try {
          const query = `UPDATE ${table} SET deleted_at = datetime('now') WHERE deleted_at IS NULL`;
          await DatabaseService.executeQuery(query);
        } catch (error) {
          console.warn(`Table ${table} might not exist:`, error);
        }
      }
      
      // Reset auto-increment counters
      try {
        await DatabaseService.executeQuery("UPDATE business_settings SET setting_value = '1' WHERE setting_key = 'last_invoice_number'");
        await DatabaseService.executeQuery("UPDATE business_settings SET setting_value = '1' WHERE setting_key = 'last_party_code'");
      } catch (error) {
        console.warn('Error resetting counters:', error);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing all data:', error);
      return { success: false, error: error.message };
    }
  }

  static getDefaultBusinessProfile() {
    return {
      name: '',
      address: '',
      phone: '',
      email: '',
      gstin: '',
      pan: '',
      website: '',
      logo: null,
      tagline: '',
      established_year: '',
      business_type: 'Retail'
    };
  }

  static getDefaultAppSettings() {
    return {
      theme: 'light',
      notifications_enabled: true,
      backup_frequency: 'weekly',
      currency: 'INR',
      date_format: 'DD/MM/YYYY',
      decimal_places: 2,
      auto_backup: true,
      sound_enabled: true,
      vibration_enabled: true,
      language: 'en',
      tax_rate: 18.0
    };
  }

  // Initialize settings tables
  static async initializeSettings() {
    try {
      await DatabaseService.init();
      
      // Create business_settings table if not exists
      await DatabaseService.executeQuery(`
        CREATE TABLE IF NOT EXISTS business_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT NOT NULL UNIQUE,
          setting_value TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);
      
      // Create backups table if not exists (for settings data section)
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
      
      console.log('✅ Settings tables initialized');
    } catch (error) {
      console.error('Error initializing settings tables:', error);
    }
  }

  // Get all settings (alias for getAppSettings)
  static async getAllSettings() {
    try {
      const [businessProfile, appSettings, securitySettings] = await Promise.all([
        this.getBusinessProfile(),
        this.getAppSettings(),
        this.getSecuritySettings()
      ]);
      
      return {
        business: businessProfile,
        app: appSettings,
        security: securitySettings
      };
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {
        business: this.getDefaultBusinessProfile(),
        app: this.getDefaultAppSettings(),
        security: {
          pin_enabled: false,
          fingerprint_enabled: false,
          auto_lock_time: 5,
          failed_attempts_limit: 3,
          data_encryption: false,
          backup_encryption: false
        }
      };
    }
  }

  // Update single setting (generic method)
  static async updateSetting(key, value) {
    try {
      await DatabaseService.init();
      
      const query = `
        INSERT OR REPLACE INTO business_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, datetime('now'))
      `;
      
      await DatabaseService.executeQuery(query, [key, value.toString()]);
      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SettingsService;
