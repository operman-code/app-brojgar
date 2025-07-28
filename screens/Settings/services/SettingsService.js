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
}

export default SettingsService;
