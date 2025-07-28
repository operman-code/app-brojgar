// screens/Settings/services/SettingsService.js
import DatabaseService from '../../../database/DatabaseService';

class SettingsService {
  static async init() {
    try {
      console.log('✅ Settings service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing settings service:', error);
      throw error;
    }
  }

  // Get all settings
  static async getAllSettings() {
    try {
      const query = `
        SELECT key, value 
        FROM business_settings 
        WHERE deleted_at IS NULL
      `;
      
      const settings = await DatabaseService.executeQuery(query);
      const settingsObject = {};
      
      settings.forEach(setting => {
        // Convert string values to appropriate types
        let value = setting.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        if (!isNaN(value) && value !== '') value = parseFloat(value);
        
        settingsObject[setting.key] = value;
      });
      
      return settingsObject;
    } catch (error) {
      console.error('❌ Error getting all settings:', error);
      return {};
    }
  }

  // Get single setting
  static async getSetting(key) {
    try {
      const query = `
        SELECT value 
        FROM business_settings 
        WHERE key = ? AND deleted_at IS NULL
      `;
      
      const result = await DatabaseService.executeQuery(query, [key]);
      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      console.error(`❌ Error getting setting ${key}:`, error);
      return null;
    }
  }
  
  // Update setting
  static async updateSetting(key, value) {
    try {
      await DatabaseService.setSetting(key, value.toString());
      console.log(`✅ Setting ${key} updated`);
      return true;
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      return false;
    }
  }

  // Get business profile
  static async getBusinessProfile() {
    try {
      const query = `
        SELECT key, value 
        FROM business_settings 
        WHERE deleted_at IS NULL 
          AND key LIKE 'business_%'
      `;
      
      const settings = await DatabaseService.executeQuery(query);
      const profile = {};
      
      settings.forEach(setting => {
        profile[setting.key] = setting.value;
      });
      
      return profile;
    } catch (error) {
      console.error('❌ Error getting business profile:', error);
      return {};
    }
  }

  // Update business profile
  static async updateBusinessProfile(profileData) {
    try {
      for (const [key, value] of Object.entries(profileData)) {
        await DatabaseService.setSetting(key, value);
      }
      
      console.log('✅ Business profile updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating business profile:', error);
      throw error;
    }
  }

  // Get app settings
  static async getAppSettings() {
    try {
      const query = `
        SELECT key, value 
        FROM business_settings 
        WHERE deleted_at IS NULL 
          AND key NOT LIKE 'business_%'
      `;
      
      const settings = await DatabaseService.executeQuery(query);
      const appSettings = {};
      
      settings.forEach(setting => {
        // Convert string values to appropriate types
        let value = setting.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        if (!isNaN(value) && value !== '') value = parseFloat(value);
        
        appSettings[setting.key] = value;
      });
      
      return appSettings;
    } catch (error) {
      console.error('❌ Error getting app settings:', error);
      return {};
    }
  }

  // Update app settings
  static async updateAppSettings(settingsData) {
    try {
      for (const [key, value] of Object.entries(settingsData)) {
        await DatabaseService.setSetting(key, value.toString());
      }
      
      console.log('✅ App settings updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating app settings:', error);
      throw error;
    }
  }

  // Get security settings
  static async getSecuritySettings() {
    try {
      const defaultSettings = {
        passcode_enabled: false,
        biometric_enabled: false,
        auto_lock_time: 5,
        session_timeout: 30
      };
      
      return defaultSettings;
    } catch (error) {
      console.error('❌ Error getting security settings:', error);
      return {};
    }
  }

  // Update security settings
  static async updateSecuritySettings(securityData) {
    try {
      for (const [key, value] of Object.entries(securityData)) {
        await DatabaseService.setSetting(key, value.toString());
      }
      
      console.log('✅ Security settings updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating security settings:', error);
      throw error;
    }
  }

  // Get data settings
  static async getDataSettings() {
    try {
      const stats = await this.getDatabaseStats();
      return {
        ...stats,
        backup_frequency: 'weekly',
        auto_cleanup: true,
        data_retention: 365
      };
    } catch (error) {
      console.error('❌ Error getting data settings:', error);
      return {};
    }
  }

  // Get database statistics
  static async getDatabaseStats() {
    try {
      const [parties, inventory, invoices, transactions] = await Promise.all([
        DatabaseService.executeQuery('SELECT COUNT(*) as count FROM parties WHERE deleted_at IS NULL'),
        DatabaseService.executeQuery('SELECT COUNT(*) as count FROM inventory_items WHERE deleted_at IS NULL'),
        DatabaseService.executeQuery('SELECT COUNT(*) as count FROM invoices WHERE deleted_at IS NULL'),
        DatabaseService.executeQuery('SELECT COUNT(*) as count FROM transactions WHERE deleted_at IS NULL')
      ]);

      return {
        totalParties: parties[0]?.count || 0,
        totalItems: inventory[0]?.count || 0,
        totalInvoices: invoices[0]?.count || 0,
        totalTransactions: transactions[0]?.count || 0,
        databaseSize: 0, // Would need platform-specific implementation
        lastBackup: null
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return {
        totalParties: 0,
        totalItems: 0,
        totalInvoices: 0,
        totalTransactions: 0,
        databaseSize: 0,
        lastBackup: null
      };
    }
  }

  // Export settings
  static async exportSettings() {
    try {
      const settings = await this.getAllSettings();
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      console.error('❌ Error exporting settings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import settings
  static async importSettings(settingsData) {
    try {
      for (const [key, value] of Object.entries(settingsData)) {
        await DatabaseService.setSetting(key, value.toString());
      }
      
      console.log('✅ Settings imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Error importing settings:', error);
      throw error;
    }
  }

  // Reset settings
  static async resetSettings() {
    try {
      // Reset to default values
      const defaultSettings = {
        business_name: 'Brojgar Business',
        business_email: '',
        business_phone: '',
        business_address: '',
        tax_rate: '18',
        currency: 'INR',
        invoice_prefix: 'INV',
        theme: 'light',
        auto_backup: 'true',
        notifications: 'true'
      };

      for (const [key, value] of Object.entries(defaultSettings)) {
        await DatabaseService.setSetting(key, value);
      }

      console.log('✅ Settings reset to defaults');
      return true;
    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      throw error;
    }
  }

  // Clear all data
  static async clearAllData() {
    try {
      await DatabaseService.clearAllData();
      console.log('✅ All data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  // Export data
  static async exportData() {
    try {
      const backupData = await DatabaseService.backup();
      return {
        success: true,
        data: backupData
      };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Initialize settings with defaults
  static async initializeSettings() {
    try {
      const existingSettings = await DatabaseService.executeQuery(
        'SELECT COUNT(*) as count FROM business_settings WHERE deleted_at IS NULL'
      );

      if (existingSettings[0]?.count === 0) {
        await this.resetSettings();
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing settings:', error);
      return false;
    }
  }
}

export default SettingsService;
