// screens/Settings/SettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  TextInput,
  Modal,
} from "react-native";

// Import service
import SettingsService from "./services/SettingsService";

const SettingsScreen = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsData = await SettingsService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await SettingsService.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      Alert.alert("Error", "Failed to update setting");
    }
  };

  const openEditModal = (field, label, currentValue) => {
    setEditField(field);
    setEditLabel(label);
    setEditValue(currentValue?.toString() || "");
    setEditModalVisible(true);
  };

  const saveEditValue = async () => {
    if (!editValue.trim()) {
      Alert.alert("Error", "Value cannot be empty");
      return;
    }

    try {
      let value = editValue.trim();
      
      // Convert to appropriate type
      if (['defaultCreditLimit', 'monthlySalesTarget', 'defaultTaxRate', 'defaultMinStockLevel', 'defaultMaxStockLevel'].includes(editField)) {
        value = parseFloat(value) || 0;
      }

      await updateSetting(editField, value);
      setEditModalVisible(false);
      Alert.alert("Success", "Setting updated successfully");
    } catch (error) {
      console.error('❌ Error saving edit value:', error);
      Alert.alert("Error", "Failed to save setting");
    }
  };

  const handleBackupDatabase = async () => {
    Alert.alert(
      "Backup Database",
      "This will create a backup of all your business data. The backup file will be shared so you can save it to Google Drive or other cloud storage.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create Backup",
          onPress: async () => {
            setBackingUp(true);
            try {
              const result = await SettingsService.backupDatabase();
              if (result.success) {
                Alert.alert("Success", "Database backup created and shared successfully!");
              } else {
                Alert.alert("Error", result.error || "Failed to create backup");
              }
            } catch (error) {
              console.error('❌ Error creating backup:', error);
              Alert.alert("Error", "Failed to create database backup");
            } finally {
              setBackingUp(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      "Export Data",
      "This will export all your business data in JSON format for analysis or migration purposes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              const result = await SettingsService.exportAllData();
              if (result.success) {
                Alert.alert("Success", "Data exported successfully!");
              } else {
                Alert.alert("Error", result.error || "Failed to export data");
              }
            } catch (error) {
              console.error('❌ Error exporting data:', error);
              Alert.alert("Error", "Failed to export data");
            }
          }
        }
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "⚠️ Clear All Data",
      "This will permanently delete ALL your business data including customers, inventory, invoices, and settings. This action cannot be undone!\n\nPlease create a backup first.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All Data",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Are you absolutely sure you want to delete all data? This cannot be undone!",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete All",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const result = await SettingsService.clearAllData();
                      if (result.success) {
                        Alert.alert("Success", "All data has been cleared");
                        await loadSettings(); // Reload default settings
                      } else {
                        Alert.alert("Error", result.error || "Failed to clear data");
                      }
                    } catch (error) {
                      console.error('❌ Error clearing data:', error);
                      Alert.alert("Error", "Failed to clear data");
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderSettingItem = ({ title, value, onPress, type = "text", icon = "" }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {type === "switch" ? null : (
            <Text style={styles.settingValue}>{value}</Text>
          )}
        </View>
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
          thumbColor={value ? "#FFFFFF" : "#64748B"}
        />
      ) : (
        <Text style={styles.settingArrow}>→</Text>
      )}
    </TouchableOpacity>
  );

  const renderActionButton = ({ title, onPress, color = "#3B82F6", icon = "", loading = false }) => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: color }]} 
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.actionButtonIcon}>{icon}</Text>
      <Text style={styles.actionButtonText}>
        {loading ? "Processing..." : title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => Alert.alert("Info", "Settings are saved automatically")}
        >
          <Text style={styles.saveButtonText}>ℹ️ Auto-Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Configuration</Text>
          
          {renderSettingItem({
            title: "Business Name",
            value: settings.businessName || "Not Set",
            onPress: () => openEditModal("businessName", "Business Name", settings.businessName),
            icon: "🏢"
          })}
          
          {renderSettingItem({
            title: "Owner Name",
            value: settings.ownerName || "Not Set",
            onPress: () => openEditModal("ownerName", "Owner Name", settings.ownerName),
            icon: "👤"
          })}
          
          {renderSettingItem({
            title: "Phone Number",
            value: settings.phoneNumber || "Not Set",
            onPress: () => openEditModal("phoneNumber", "Phone Number", settings.phoneNumber),
            icon: "📞"
          })}
          
          {renderSettingItem({
            title: "Email Address",
            value: settings.emailAddress || "Not Set",
            onPress: () => openEditModal("emailAddress", "Email Address", settings.emailAddress),
            icon: "📧"
          })}
          
          {renderSettingItem({
            title: "GST Number",
            value: settings.gstNumber || "Not Set",
            onPress: () => openEditModal("gstNumber", "GST Number", settings.gstNumber),
            icon: "🏛️"
          })}
          
          {renderSettingItem({
            title: "Business Address",
            value: settings.businessAddress || "Not Set",
            onPress: () => openEditModal("businessAddress", "Business Address", settings.businessAddress),
            icon: "📍"
          })}
        </View>

        {/* Financial Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Settings</Text>
          
          {renderSettingItem({
            title: "Default Credit Limit",
            value: `₹${(settings.defaultCreditLimit || 0).toLocaleString('en-IN')}`,
            onPress: () => openEditModal("defaultCreditLimit", "Default Credit Limit (₹)", settings.defaultCreditLimit),
            icon: "💳"
          })}
          
          {renderSettingItem({
            title: "Monthly Sales Target",
            value: `₹${(settings.monthlySalesTarget || 0).toLocaleString('en-IN')}`,
            onPress: () => openEditModal("monthlySalesTarget", "Monthly Sales Target (₹)", settings.monthlySalesTarget),
            icon: "🎯"
          })}
          
          {renderSettingItem({
            title: "Currency",
            value: settings.currency || "₹ INR",
            onPress: () => Alert.alert("Info", "Currency setting is currently fixed to INR"),
            icon: "💰"
          })}
          
          {renderSettingItem({
            title: "Default Tax Rate",
            value: `${settings.defaultTaxRate || 0}%`,
            onPress: () => openEditModal("defaultTaxRate", "Default Tax Rate (%)", settings.defaultTaxRate),
            icon: "📊"
          })}
        </View>

        {/* Inventory Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Settings</Text>
          
          {renderSettingItem({
            title: "Low Stock Alerts",
            value: settings.lowStockAlerts,
            onPress: (value) => updateSetting("lowStockAlerts", value),
            type: "switch",
            icon: "⚠️"
          })}
          
          {renderSettingItem({
            title: "Auto Reorder Suggestions",
            value: settings.autoReorderSuggestions,
            onPress: (value) => updateSetting("autoReorderSuggestions", value),
            type: "switch",
            icon: "🔄"
          })}
          
          {renderSettingItem({
            title: "Default Min Stock Level",
            value: settings.defaultMinStockLevel?.toString() || "10",
            onPress: () => openEditModal("defaultMinStockLevel", "Default Min Stock Level", settings.defaultMinStockLevel),
            icon: "📉"
          })}
          
          {renderSettingItem({
            title: "Default Max Stock Level",
            value: settings.defaultMaxStockLevel?.toString() || "100",
            onPress: () => openEditModal("defaultMaxStockLevel", "Default Max Stock Level", settings.defaultMaxStockLevel),
            icon: "📈"
          })}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          {renderSettingItem({
            title: "Push Notifications",
            value: settings.pushNotifications,
            onPress: (value) => updateSetting("pushNotifications", value),
            type: "switch",
            icon: "🔔"
          })}
          
          {renderSettingItem({
            title: "Email Notifications",
            value: settings.emailNotifications,
            onPress: (value) => updateSetting("emailNotifications", value),
            type: "switch",
            icon: "📧"
          })}
          
          {renderSettingItem({
            title: "Payment Reminders",
            value: settings.paymentReminders,
            onPress: (value) => updateSetting("paymentReminders", value),
            type: "switch",
            icon: "💰"
          })}
          
          {renderSettingItem({
            title: "Daily Reports",
            value: settings.dailyReports,
            onPress: (value) => updateSetting("dailyReports", value),
            type: "switch",
            icon: "📊"
          })}
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          {renderSettingItem({
            title: "Dark Mode",
            value: settings.darkMode,
            onPress: (value) => {
              updateSetting("darkMode", value);
              Alert.alert("Info", "Dark mode will be applied in the next app update");
            },
            type: "switch",
            icon: "🌙"
          })}
          
          {renderSettingItem({
            title: "Biometric Lock",
            value: settings.biometricLock,
            onPress: (value) => {
              updateSetting("biometricLock", value);
              Alert.alert("Info", "Biometric authentication will be enabled in the next app update");
            },
            type: "switch",
            icon: "🔒"
          })}
          
          {renderSettingItem({
            title: "Auto Backup",
            value: settings.autoBackup,
            onPress: (value) => updateSetting("autoBackup", value),
            type: "switch",
            icon: "☁️"
          })}
          
          {renderSettingItem({
            title: "Language",
            value: settings.language || "English (India)",
            onPress: () => Alert.alert("Info", "Language settings will be available in future updates"),
            icon: "🌐"
          })}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.dataInfoContainer}>
            <View style={styles.dataInfoItem}>
              <Text style={styles.dataInfoLabel}>Last Backup:</Text>
              <Text style={styles.dataInfoValue}>
                {settings.lastBackup ? 
                  new Date(settings.lastBackup).toLocaleDateString('en-IN') : 
                  "Never"
                }
              </Text>
            </View>
            <View style={styles.dataInfoItem}>
              <Text style={styles.dataInfoLabel}>Database Size:</Text>
              <Text style={styles.dataInfoValue}>{settings.dataSize || "0 KB"}</Text>
            </View>
          </View>

          {renderActionButton({
            title: "Backup Database",
            onPress: handleBackupDatabase,
            color: "#10B981",
            icon: "☁️",
            loading: backingUp
          })}

          {renderActionButton({
            title: "Export Data",
            onPress: handleExportData,
            color: "#3B82F6",
            icon: "📤"
          })}

          {renderActionButton({
            title: "Clear All Data",
            onPress: handleClearAllData,
            color: "#EF4444",
            icon: "🗑️"
          })}
        </View>

        {/* System Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          {renderSettingItem({
            title: "App Version",
            value: settings.appVersion || "1.0.0",
            onPress: () => Alert.alert("Version Info", `Brojgar Business Management App\nVersion: ${settings.appVersion || "1.0.0"}\nDeveloped by: operman.in`),
            icon: "ℹ️"
          })}
          
          {renderSettingItem({
            title: "About Brojgar",
            value: "Learn more",
            onPress: () => Alert.alert(
              "About Brojgar", 
              "Brojgar is a comprehensive business management application designed for small and medium businesses.\n\nFeatures:\n• Customer & Supplier Management\n• Inventory Tracking\n• Invoice Generation\n• Reports & Analytics\n• Data Backup & Export\n\nDeveloped by: operman.in"
            ),
            icon: "📱"
          })}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit {editLabel}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>{editLabel}</Text>
              <TextInput
                style={[
                  styles.input,
                  editField === "businessAddress" && styles.textArea
                ]}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Enter ${editLabel.toLowerCase()}`}
                multiline={editField === "businessAddress"}
                numberOfLines={editField === "businessAddress" ? 4 : 1}
                keyboardType={
                  ['defaultCreditLimit', 'monthlySalesTarget', 'defaultTaxRate', 'defaultMinStockLevel', 'defaultMaxStockLevel'].includes(editField) 
                    ? 'numeric' 
                    : editField === 'emailAddress' 
                      ? 'email-address'
                      : editField === 'phoneNumber'
                        ? 'phone-pad'
                        : 'default'
                }
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={saveEditValue}
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
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  settingValue: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 16,
    color: '#94A3B8',
  },
  dataInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  dataInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataInfoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  dataInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalClose: {
    fontSize: 20,
    color: '#64748B',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SettingsScreen;
