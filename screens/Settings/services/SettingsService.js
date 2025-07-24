// screens/Settings/services/SettingsService.js
import DatabaseService from '../../../database/DatabaseService';

class SettingsService {
  static async getAllSettings() {
    try {
      await DatabaseService.init();
      const settings = await DatabaseService.findAll('settings', 'ORDER BY key ASC');
      
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = this.parseValue(setting.value, setting.type);
      });
      
      return settingsObj;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async getSetting(key, defaultValue = null) {
    try {
      return await DatabaseService.getSetting(key, defaultValue);
    } catch (error) {
      console.error(`❌ Error getting setting ${key}:`, error);
      return defaultValue;
    }
  }

  static async updateSetting(key, value, type = 'string') {
    try {
      await DatabaseService.setSetting(key, value.toString(), type);
      return true;
    } catch (error) {
      console.error(`❌ Error updating setting ${key}:`, error);
      throw error;
    }
  }

  static async updateMultipleSettings(settings) {
    try {
      const promises = Object.entries(settings).map(([key, value]) => {
        const type = typeof value === 'number' ? 'number' : 'string';
        return this.updateSetting(key, value, type);
      });
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('❌ Error updating multiple settings:', error);
      throw error;
    }
  }

  static async getBusinessProfile() {
    try {
      const settings = await this.getAllSettings();
      return {
        businessName: settings.business_name || 'Your Business Name',
        ownerName: settings.owner_name || 'Business Owner',
        gstNumber: settings.gst_number || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || ''
      };
    } catch (error) {
      console.error('❌ Error getting business profile:', error);
      return this.getDefaultProfile();
    }
  }

  static async updateBusinessProfile(profile) {
    try {
      const updates = {
        business_name: profile.businessName,
        owner_name: profile.ownerName,
        gst_number: profile.gstNumber,
        phone: profile.phone,
        email: profile.email,
        address: profile.address
      };
      
      await this.updateMultipleSettings(updates);
      return true;
    } catch (error) {
      console.error('❌ Error updating business profile:', error);
      throw error;
    }
  }

  static parseValue(value, type) {
    switch (type) {
      case 'number':
        return parseFloat(value) || 0;
      case 'boolean':
        return value === 'true' || value === '1';
      default:
        return value;
    }
  }

  static getDefaultSettings() {
    return {
      business_name: 'Your Business Name',
      owner_name: 'Business Owner',
      gst_number: '',
      phone: '+91 98765 43210',
      email: 'business@example.com',
      address: 'Business Address, City, State',
      currency: 'INR',
      tax_rate: 18,
      invoice_prefix: 'INV',
      invoice_starting_number: 1
    };
  }

  static getDefaultProfile() {
    return {
      businessName: 'Your Business Name',
      ownerName: 'Business Owner',
      gstNumber: '',
      phone: '+91 98765 43210',
      email: 'business@example.com',
      address: 'Business Address, City, State'
    };
  }
}

export default SettingsService;
