// screens/Settings/services/SettingsService.js
import DashboardService from "../../Dashboard/services/DashboardService";
import PartiesService from "../../Parties/services/PartiesService";
import InventoryService from "../../Inventory/services/InventoryService";

class SettingsService {
  static settings = {
    // Business Configuration
    businessName: "Brojgar Electronics Store",
    ownerName: "Ram Kumar Singh",
    gstNumber: "07ABCDE1234F1Z5",
    phoneNumber: "+91 98765 43210",
    emailAddress: "ramkumar@brojgarstore.com",
    businessAddress: "Shop No. 45, Block A, Connaught Place, New Delhi - 110001",
    
    // Financial Settings
    defaultCreditLimit: 50000,
    monthlySalesTarget: 500000,
    currency: "₹ INR",
    defaultTaxRate: 18,
    
    // Inventory Settings
    lowStockAlerts: true,
    autoReorderSuggestions: true,
    defaultMinStockLevel: 10,
    defaultMaxStockLevel: 100,
    
    // Notification Settings
    pushNotifications: true,
    emailNotifications: true,
    paymentReminders: true,
    dailyReports: false,
    
    // App Preferences
    darkMode: false,
    biometricLock: false,
    autoBackup: true,
    language: "English (India)",
    
    // System Settings
    appVersion: "1.0.0",
    lastBackup: new Date().toISOString(),
    dataSize: "2.4 MB",
  };

  // Get all settings
  static getSettings() {
    return { ...this.settings };
  }

  // Update a specific setting
  static async updateSetting(key, value) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            console.log(`Setting ${key} updated to:`, value);
            resolve(this.settings[key]);
          } else {
            reject(new Error(`Setting ${key} not found`));
          }
        } catch (error) {
          reject(error);
        }
      }, 200);
    });
  }

  // Get a specific setting
  static getSetting(key) {
    return this.settings[key];
  }

  // Reset settings to default
  static resetSettings() {
    const defaultSettings = {
      businessName: "My Business",
      ownerName: "Business Owner",
      gstNumber: "",
      phoneNumber: "",
      emailAddress: "",
      businessAddress: "",
      defaultCreditLimit: 25000,
      monthlySalesTarget: 100000,
      currency: "₹ INR",
      defaultTaxRate: 18,
      lowStockAlerts: true,
      autoReorderSuggestions: false,
      defaultMinStockLevel: 5,
      defaultMaxStockLevel: 50,
      pushNotifications: true,
      emailNotifications: false,
      paymentReminders: true,
      dailyReports: false,
      darkMode: false,
      biometricLock: false,
      autoBackup: false,
      language: "English (India)",
      appVersion: "1.0.0",
      lastBackup: new Date().toISOString(),
      dataSize: "0 MB",
    };

    this.settings = { ...defaultSettings };
    return this.settings;
  }

  // Create backup of all data
  static createBackup() {
    const backupData = {
      settings: this.settings,
      dashboard: {
        businessMetrics: DashboardService.calculateBusinessMetrics(),
        salesChartData: DashboardService.getSalesChartData(),
        kpiData: DashboardService.getKPIData(),
        notifications: DashboardService.getNotifications(),
        transactions: DashboardService.getRecentTransactions(),
      },
      parties: PartiesService.parties,
      inventory: InventoryService.items,
      timestamp: new Date().toISOString(),
      version: this.settings.appVersion,
    };

    // In a real app, this would save to cloud storage or local file system
    console.log("Backup created:", backupData);
    
    // Update last backup time
    this.settings.lastBackup = new Date().toISOString();
    
    return {
      success: true,
      timestamp: backupData.timestamp,
      size: this.calculateDataSize(backupData),
    };
  }

  // Restore from backup
  static restoreBackup(backupData) {
    // In a real app, this would load from actual backup file
    // For now, we'll simulate a restore
    const mockBackupData = {
      settings: {
        ...this.settings,
        businessName: "Restored Business",
        lastBackup: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
      dashboard: {},
      parties: [],
      inventory: [],
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      version: "1.0.0",
    };

    try {
      // Restore settings
      this.settings = { ...mockBackupData.settings };
      
      // In a real app, would also restore other service data
      console.log("Data restored from backup:", mockBackupData.timestamp);
      
      return {
        success: true,
        timestamp: mockBackupData.timestamp,
        itemsRestored: {
          settings: Object.keys(this.settings).length,
          parties: mockBackupData.parties.length,
          inventory: mockBackupData.inventory.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Export all application data
  static exportAllData(format = 'json') {
    const exportData = {
      settings: this.settings,
      dashboard: {
        kpiData: DashboardService.getKPIData(),
        businessMetrics: DashboardService.calculateBusinessMetrics(),
        salesChartData: DashboardService.getSalesChartData(),
      },
      parties: PartiesService.parties,
      inventory: InventoryService.items,
      exportInfo: {
        timestamp: new Date().toISOString(),
        version: this.settings.appVersion,
        exportedBy: this.settings.ownerName,
        businessName: this.settings.businessName,
      },
    };

    if (format === 'json') {
      return {
        filename: `brojgar_export_${new Date().toISOString().split('T')[0]}.json`,
        content: JSON.stringify(exportData, null, 2),
        mimeType: 'application/json',
        size: this.calculateDataSize(exportData),
      };
    } else if (format === 'csv') {
      // For CSV, we'll export each data type separately
      const csvData = this.convertToCSV(exportData);
      return {
        filename: `brojgar_export_${new Date().toISOString().split('T')[0]}.csv`,
        content: csvData,
        mimeType: 'text/csv',
        size: csvData.length,
      };
    }

    return null;
  }

  // Convert data to CSV format
  static convertToCSV(data) {
    let csvContent = "";
    
    // Settings CSV
    csvContent += "SETTINGS\n";
    csvContent += "Key,Value\n";
    Object.entries(data.settings).forEach(([key, value]) => {
      csvContent += `"${key}","${value}"\n`;
    });
    csvContent += "\n";

    // Parties CSV
    if (data.parties && data.parties.length > 0) {
      csvContent += "PARTIES\n";
      const partyHeaders = Object.keys(data.parties[0]);
      csvContent += partyHeaders.join(',') + '\n';
      data.parties.forEach(party => {
        const values = partyHeaders.map(header => `"${party[header] || ''}"`);
        csvContent += values.join(',') + '\n';
      });
      csvContent += "\n";
    }

    // Inventory CSV
    if (data.inventory && data.inventory.length > 0) {
      csvContent += "INVENTORY\n";
      const inventoryHeaders = Object.keys(data.inventory[0]);
      csvContent += inventoryHeaders.join(',') + '\n';
      data.inventory.forEach(item => {
        const values = inventoryHeaders.map(header => `"${item[header] || ''}"`);
        csvContent += values.join(',') + '\n';
      });
    }

    return csvContent;
  }

  // Calculate data size
  static calculateDataSize(data) {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${sizeInMB} MB`;
    }
  }

  // Reset entire application
  static resetApplication() {
    // Reset all settings
    this.resetSettings();
    
    // In a real app, would also reset all service data
    console.log("Application reset completed");
    
    return {
      success: true,
      message: "Application has been reset to initial state",
      timestamp: new Date().toISOString(),
    };
  }

  // Get app statistics
  static getAppStatistics() {
    const partiesStats = PartiesService.getPartiesStatistics();
    const inventoryStats = InventoryService.getInventoryStatistics();
    const businessMetrics = DashboardService.calculateBusinessMetrics();

    return {
      totalParties: partiesStats.totalParties,
      totalInventoryItems: inventoryStats.totalItems,
      totalTransactions: businessMetrics.salesCount + businessMetrics.purchaseCount,
      totalRevenue: businessMetrics.totalSales,
      dataSize: this.settings.dataSize,
      lastBackup: this.settings.lastBackup,
      appVersion: this.settings.appVersion,
      businessAge: this.calculateBusinessAge(),
    };
  }

  // Calculate business age (mock)
  static calculateBusinessAge() {
    const startDate = new Date('2023-01-01'); // Mock business start date
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    return `${months} months`;
  }

  // Validate settings
  static validateSetting(key, value) {
    const validations = {
      businessName: (val) => val && val.trim().length > 0,
      ownerName: (val) => val && val.trim().length > 0,
      phoneNumber: (val) => val && /^[+]?[\d\s-()]{10,}$/.test(val),
      emailAddress: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      gstNumber: (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(val),
      defaultCreditLimit: (val) => typeof val === 'number' && val >= 0,
      monthlySalesTarget: (val) => typeof val === 'number' && val >= 0,
      defaultTaxRate: (val) => typeof val === 'number' && val >= 0 && val <= 100,
      defaultMinStockLevel: (val) => typeof val === 'number' && val >= 0,
      defaultMaxStockLevel: (val) => typeof val === 'number' && val > 0,
    };

    if (validations[key]) {
      return validations[key](value);
    }

    return true; // Default to valid for unknown keys
  }

  // Get notification preferences
  static getNotificationPreferences() {
    return {
      pushNotifications: this.settings.pushNotifications,
      emailNotifications: this.settings.emailNotifications,
      paymentReminders: this.settings.paymentReminders,
      dailyReports: this.settings.dailyReports,
      lowStockAlerts: this.settings.lowStockAlerts,
    };
  }

  // Update notification preferences
  static updateNotificationPreferences(preferences) {
    Object.keys(preferences).forEach(key => {
      if (this.settings.hasOwnProperty(key)) {
        this.settings[key] = preferences[key];
      }
    });
    return this.getNotificationPreferences();
  }

  // Get business profile
  static getBusinessProfile() {
    return {
      businessName: this.settings.businessName,
      ownerName: this.settings.ownerName,
      gstNumber: this.settings.gstNumber,
      phoneNumber: this.settings.phoneNumber,
      emailAddress: this.settings.emailAddress,
      businessAddress: this.settings.businessAddress,
      currency: this.settings.currency,
      monthlySalesTarget: this.settings.monthlySalesTarget,
    };
  }

  // Update business profile
  static updateBusinessProfile(profileData) {
    const profileKeys = [
      'businessName', 'ownerName', 'gstNumber', 
      'phoneNumber', 'emailAddress', 'businessAddress'
    ];
    
    profileKeys.forEach(key => {
      if (profileData[key] !== undefined) {
        this.settings[key] = profileData[key];
      }
    });
    
    return this.getBusinessProfile();
  }

  // Get financial settings
  static getFinancialSettings() {
    return {
      defaultCreditLimit: this.settings.defaultCreditLimit,
      monthlySalesTarget: this.settings.monthlySalesTarget,
      currency: this.settings.currency,
      defaultTaxRate: this.settings.defaultTaxRate,
    };
  }

  // Get inventory settings
  static getInventorySettings() {
    return {
      lowStockAlerts: this.settings.lowStockAlerts,
      autoReorderSuggestions: this.settings.autoReorderSuggestions,
      defaultMinStockLevel: this.settings.defaultMinStockLevel,
      defaultMaxStockLevel: this.settings.defaultMaxStockLevel,
    };
  }

  // Get app preferences
  static getAppPreferences() {
    return {
      darkMode: this.settings.darkMode,
      biometricLock: this.settings.biometricLock,
      autoBackup: this.settings.autoBackup,
      language: this.settings.language,
    };
  }

  // Check if setting is enabled
  static isSettingEnabled(settingKey) {
    return Boolean(this.settings[settingKey]);
  }

  // Get settings by category
  static getSettingsByCategory(category) {
    const categories = {
      business: ['businessName', 'ownerName', 'gstNumber', 'phoneNumber', 'emailAddress', 'businessAddress'],
      financial: ['defaultCreditLimit', 'monthlySalesTarget', 'currency', 'defaultTaxRate'],
      inventory: ['lowStockAlerts', 'autoReorderSuggestions', 'defaultMinStockLevel', 'defaultMaxStockLevel'],
      notifications: ['pushNotifications', 'emailNotifications', 'paymentReminders', 'dailyReports'],
      app: ['darkMode', 'biometricLock', 'autoBackup', 'language'],
    };

    if (categories[category]) {
      const categorySettings = {};
      categories[category].forEach(key => {
        categorySettings[key] = this.settings[key];
      });
      return categorySettings;
    }

    return {};
  }

  // Import settings from backup or export
  static importSettings(settingsData) {
    try {
      // Validate imported settings
      const validSettings = {};
      Object.keys(settingsData).forEach(key => {
        if (this.settings.hasOwnProperty(key)) {
          if (this.validateSetting(key, settingsData[key])) {
            validSettings[key] = settingsData[key];
          }
        }
      });

      // Apply valid settings
      this.settings = { ...this.settings, ...validSettings };
      
      return {
        success: true,
        imported: Object.keys(validSettings).length,
        skipped: Object.keys(settingsData).length - Object.keys(validSettings).length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get formatted settings for display
  static getFormattedSettings() {
    const formatted = {};
    
    Object.keys(this.settings).forEach(key => {
      let value = this.settings[key];
      
      // Format specific types
      if (key.includes('Limit') || key.includes('Target')) {
        value = `₹${value.toLocaleString('en-IN')}`;
      } else if (key === 'defaultTaxRate') {
        value = `${value}%`;
      } else if (typeof value === 'boolean') {
        value = value ? 'Enabled' : 'Disabled';
      } else if (key === 'lastBackup') {
        value = new Date(value).toLocaleString('en-IN');
      }
      
      formatted[key] = value;
    });
    
    return formatted;
  }
}

export default SettingsService;