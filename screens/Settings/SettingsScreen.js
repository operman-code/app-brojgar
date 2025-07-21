// screens/Settings/SettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  Switch,
  TextInput,
  Modal,
} from "react-native";

// Import service
import SettingsService from "./services/SettingsService";

const SettingsScreen = () => {
  const [settings, setSettings] = useState(SettingsService.getSettings());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleToggleSetting = async (settingKey) => {
    try {
      const newValue = !settings[settingKey];
      await SettingsService.updateSetting(settingKey, newValue);
      setSettings(prev => ({ ...prev, [settingKey]: newValue }));
    } catch (error) {
      Alert.alert("Error", "Failed to update setting");
    }
  };

  const handleEditSetting = (settingKey, currentValue) => {
    setSelectedSetting(settingKey);
    setTempValue(String(currentValue));
    setModalVisible(true);
  };

  const handleSaveSetting = async () => {
    try {
      const value = selectedSetting.includes('Limit') || selectedSetting.includes('Target') 
        ? parseFloat(tempValue) 
        : tempValue;
      
      await SettingsService.updateSetting(selectedSetting, value);
      setSettings(prev => ({ ...prev, [selectedSetting]: value }));
      setModalVisible(false);
      Alert.alert("Success", "Setting updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update setting");
    }
  };

  const handleBackupData = () => {
    Alert.alert(
      "Backup Data",
      "Create a backup of all your business data?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Backup", 
          onPress: () => {
            SettingsService.createBackup();
            Alert.alert("Success", "Backup created successfully");
          }
        },
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      "Restore Data",
      "This will replace all current data with backup data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Restore", 
          style: "destructive",
          onPress: () => {
            SettingsService.restoreBackup();
            Alert.alert("Success", "Data restored successfully");
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Export your data in which format?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "JSON", onPress: () => exportData("json") },
        { text: "CSV", onPress: () => exportData("csv") },
      ]
    );
  };

  const exportData = (format) => {
    SettingsService.exportAllData(format);
    Alert.alert("Success", `Data exported as ${format.toUpperCase()}`);
  };

  const handleResetApp = () => {
    Alert.alert(
      "Reset Application",
      "This will delete ALL data and reset the app to initial state. This action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Warning",
              "Are you absolutely sure? All data will be permanently lost!",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "DELETE ALL", 
                  style: "destructive",
                  onPress: () => {
                    SettingsService.resetApplication();
                    Alert.alert("Success", "Application reset successfully");
                  }
                },
              ]
            );
          }
        },
      ]
    );
  };

  const renderToggleSetting = (title, subtitle, settingKey, icon = "⚙️") => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => handleToggleSetting(settingKey)}
        trackColor={{ false: "#f3f4f6", true: "#dbeafe" }}
        thumbColor={settings[settingKey] ? "#3b82f6" : "#9ca3af"}
      />
    </View>
  );

  const renderEditableSetting = (title, subtitle, settingKey, icon = "✏️") => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => handleEditSetting(settingKey, settings[settingKey])}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>
          {typeof settings[settingKey] === 'number' 
            ? settings[settingKey].toLocaleString("en-IN")
            : settings[settingKey]
          }
        </Text>
        <Text style={styles.settingArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderActionSetting = (title, subtitle, onPress, icon = "🔧", color = "#3b82f6") => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color }]}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.settingArrow, { color }]}>›</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title, icon = "📋") => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your business preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Settings */}
        {renderSectionHeader("Business Configuration", "🏢")}
        <View style={styles.section}>
          {renderEditableSetting(
            "Business Name",
            settings.businessName,
            "businessName",
            "🏪"
          )}
          {renderEditableSetting(
            "Owner Name",
            settings.ownerName,
            "ownerName",
            "👤"
          )}
          {renderEditableSetting(
            "GST Number",
            settings.gstNumber,
            "gstNumber",
            "🏛️"
          )}
          {renderEditableSetting(
            "Phone Number",
            settings.phoneNumber,
            "phoneNumber",
            "📞"
          )}
          {renderEditableSetting(
            "Email Address",
            settings.emailAddress,
            "emailAddress",
            "📧"
          )}
          {renderEditableSetting(
            "Business Address",
            settings.businessAddress,
            "businessAddress",
            "📍"
          )}
        </View>

        {/* Financial Settings */}
        {renderSectionHeader("Financial Settings", "💰")}
        <View style={styles.section}>
          {renderEditableSetting(
            "Default Credit Limit",
            `₹${settings.defaultCreditLimit.toLocaleString("en-IN")}`,
            "defaultCreditLimit",
            "💳"
          )}
          {renderEditableSetting(
            "Monthly Sales Target",
            `₹${settings.monthlySalesTarget.toLocaleString("en-IN")}`,
            "monthlySalesTarget",
            "🎯"
          )}
          {renderEditableSetting(
            "Currency",
            settings.currency,
            "currency",
            "💱"
          )}
          {renderEditableSetting(
            "Tax Rate (%)",
            `${settings.defaultTaxRate}%`,
            "defaultTaxRate",
            "📊"
          )}
        </View>

        {/* Inventory Settings */}
        {renderSectionHeader("Inventory Settings", "📦")}
        <View style={styles.section}>
          {renderToggleSetting(
            "Low Stock Alerts",
            "Get notified when items are running low",
            "lowStockAlerts",
            "⚠️"
          )}
          {renderToggleSetting(
            "Auto Reorder Suggestions",
            "Automatically suggest reorders",
            "autoReorderSuggestions",
            "🔄"
          )}
          {renderEditableSetting(
            "Default Min Stock Level",
            settings.defaultMinStockLevel,
            "defaultMinStockLevel",
            "📉"
          )}
          {renderEditableSetting(
            "Default Max Stock Level",
            settings.defaultMaxStockLevel,
            "defaultMaxStockLevel",
            "📈"
          )}
        </View>

        {/* Notification Settings */}
        {renderSectionHeader("Notifications", "🔔")}
        <View style={styles.section}>
          {renderToggleSetting(
            "Push Notifications",
            "Receive app notifications",
            "pushNotifications",
            "📱"
          )}
          {renderToggleSetting(
            "Email Notifications",
            "Receive email alerts",
            "emailNotifications",
            "📧"
          )}
          {renderToggleSetting(
            "Payment Reminders",
            "Notify about overdue payments",
            "paymentReminders",
            "💰"
          )}
          {renderToggleSetting(
            "Daily Reports",
            "Receive daily business summary",
            "dailyReports",
            "📊"
          )}
        </View>

        {/* App Preferences */}
        {renderSectionHeader("App Preferences", "⚙️")}
        <View style={styles.section}>
          {renderToggleSetting(
            "Dark Mode",
            "Use dark theme",
            "darkMode",
            "🌙"
          )}
          {renderToggleSetting(
            "Biometric Lock",
            "Use fingerprint/face ID",
            "biometricLock",
            "🔒"
          )}
          {renderToggleSetting(
            "Auto Backup",
            "Automatically backup data",
            "autoBackup",
            "💾"
          )}
          {renderEditableSetting(
            "Language",
            settings.language,
            "language",
            "🌐"
          )}
        </View>

        {/* Data Management */}
        {renderSectionHeader("Data Management", "💾")}
        <View style={styles.section}>
          {renderActionSetting(
            "Backup Data",
            "Create a backup of all your data",
            handleBackupData,
            "📤",
            "#10b981"
          )}
          {renderActionSetting(
            "Restore Data",
            "Restore from previous backup",
            handleRestoreData,
            "📥",
            "#f59e0b"
          )}
          {renderActionSetting(
            "Export Data",
            "Export all data as JSON or CSV",
            handleExportData,
            "📄",
            "#3b82f6"
          )}
        </View>

        {/* System Information */}
        {renderSectionHeader("System Information", "ℹ️")}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📱</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>Current version</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💾</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Storage Used</Text>
                <Text style={styles.settingSubtitle}>App data size</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>2.4 MB</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔄</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Last Backup</Text>
                <Text style={styles.settingSubtitle}>Latest data backup</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>Today, 2:30 PM</Text>
          </View>
        </View>

        {/* Support & About */}
        {renderSectionHeader("Support & About", "❓")}
        <View style={styles.section}>
          {renderActionSetting(
            "Help & Support",
            "Get help and contact support",
            () => Alert.alert("Support", "Contact: support@brojgar.com"),
            "❓",
            "#3b82f6"
          )}
          {renderActionSetting(
            "Privacy Policy",
            "Read our privacy policy",
            () => Alert.alert("Privacy Policy", "Privacy policy details..."),
            "🔒",
            "#3b82f6"
          )}
          {renderActionSetting(
            "Terms of Service",
            "Read terms and conditions",
            () => Alert.alert("Terms", "Terms of service details..."),
            "📄",
            "#3b82f6"
          )}
          {renderActionSetting(
            "About Brojgar",
            "App information and credits",
            () => Alert.alert("About", "Brojgar Business Management v1.0\nDeveloped for small businesses"),
            "ℹ️",
            "#3b82f6"
          )}
        </View>

        {/* Danger Zone */}
        {renderSectionHeader("Danger Zone", "⚠️")}
        <View style={styles.section}>
          {renderActionSetting(
            "Reset Application",
            "Delete all data and reset app",
            handleResetApp,
            "🗑️",
            "#ef4444"
          )}
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>

      {/* Edit Setting Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {selectedSetting?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Enter value"
              multiline={selectedSetting === 'businessAddress'}
              numberOfLines={selectedSetting === 'businessAddress' ? 3 : 1}
              keyboardType={
                selectedSetting?.includes('Limit') || selectedSetting?.includes('Target') || selectedSetting?.includes('Rate')
                  ? 'numeric'
                  : selectedSetting === 'emailAddress'
                  ? 'email-address'
                  : selectedSetting === 'phoneNumber'
                  ? 'phone-pad'
                  : 'default'
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveSetting}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  section: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: "#374151",
    marginRight: 8,
  },
  settingArrow: {
    fontSize: 18,
    color: "#9ca3af",
  },
  footer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  modalClose: {
    fontSize: 18,
    color: "#6b7280",
    padding: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  modalCancelText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#3b82f6",
  },
  modalSaveText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default SettingsScreen;