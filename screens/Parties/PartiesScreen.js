// screens/Parties/PartiesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  RefreshControl,
} from "react-native";

// Import service
import PartiesService from "./services/PartiesService";

const PartiesScreen = () => {
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all"); // all, customers, suppliers
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    type: "customer", // customer or supplier
    creditLimit: "",
    paymentTerms: "",
    notes: "",
  });

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    filterParties();
  }, [parties, searchQuery, selectedTab]);

  const loadParties = async () => {
    try {
      const partiesData = await PartiesService.getAllParties();
      setParties(partiesData);
    } catch (error) {
      Alert.alert("Error", "Failed to load parties");
    }
  };

  const filterParties = () => {
    let filtered = parties;

    // Filter by tab
    if (selectedTab === "customers") {
      filtered = filtered.filter(party => party.type === "customer");
    } else if (selectedTab === "suppliers") {
      filtered = filtered.filter(party => party.type === "supplier");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(query) ||
        party.phone.includes(query) ||
        party.email.toLowerCase().includes(query) ||
        party.gstNumber.toLowerCase().includes(query)
      );
    }

    setFilteredParties(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadParties();
    setRefreshing(false);
  };

  const openAddModal = (type = "customer") => {
    setEditingParty(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
      type: type,
      creditLimit: "",
      paymentTerms: "",
      notes: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (party) => {
    setEditingParty(party);
    setFormData({ ...party });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Party name is required");
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return;
    }

    try {
      if (editingParty) {
        await PartiesService.updateParty(editingParty.id, formData);
        Alert.alert("Success", "Party updated successfully");
      } else {
        await PartiesService.addParty(formData);
        Alert.alert("Success", "Party added successfully");
      }
      
      setModalVisible(false);
      await loadParties();
    } catch (error) {
      Alert.alert("Error", "Failed to save party details");
    }
  };

  const handleDelete = (party) => {
    Alert.alert(
      "Delete Party",
      `Are you sure you want to delete ${party.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await PartiesService.deleteParty(party.id);
              Alert.alert("Success", "Party deleted successfully");
              await loadParties();
            } catch (error) {
              Alert.alert("Error", "Failed to delete party");
            }
          },
        },
      ]
    );
  };

  const getPartyBalance = (party) => {
    return PartiesService.getPartyBalance(party.id);
  };

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partyCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.partyHeader}>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={styles.partyType}>
            {item.type === "customer" ? "👤 Customer" : "🏢 Supplier"}
          </Text>
        </View>
        <View style={styles.partyActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.partyDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📞</Text>
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        {item.email && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📧</Text>
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}
        {item.gstNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏛️</Text>
            <Text style={styles.detailText}>GST: {item.gstNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.partyFooter}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance:</Text>
          <Text style={[
            styles.balanceAmount,
            { color: getPartyBalance(item) >= 0 ? "#10b981" : "#ef4444" }
          ]}>
            ₹{Math.abs(getPartyBalance(item)).toLocaleString("en-IN")}
            {getPartyBalance(item) < 0 ? " (You Owe)" : " (They Owe)"}
          </Text>
        </View>
        <Text style={styles.joinedDate}>
          Joined: {new Date(item.createdAt).toLocaleDateString("en-IN")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tabId, title, count) => (
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === tabId && styles.activeTabButton]}
      onPress={() => setSelectedTab(tabId)}
    >
      <Text style={[styles.tabTitle, selectedTab === tabId && styles.activeTabTitle]}>
        {title}
      </Text>
      <Text style={[styles.tabCount, selectedTab === tabId && styles.activeTabCount]}>
        {count}
      </Text>
    </TouchableOpacity>
  );

  const allCount = parties.length;
  const customersCount = parties.filter(p => p.type === "customer").length;
  const suppliersCount = parties.filter(p => p.type === "supplier").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parties</Text>
        <Text style={styles.headerSubtitle}>Manage customers and suppliers</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search parties by name, phone, email, or GST..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton("all", "All Parties", allCount)}
        {renderTabButton("customers", "Customers", customersCount)}
        {renderTabButton("suppliers", "Suppliers", suppliersCount)}
      </View>

      {/* Add Buttons */}
      <View style={styles.addButtonsContainer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#10b981" }]}
          onPress={() => openAddModal("customer")}
        >
          <Text style={styles.addButtonIcon}>👤</Text>
          <Text style={styles.addButtonText}>Add Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => openAddModal("supplier")}
        >
          <Text style={styles.addButtonIcon}>🏢</Text>
          <Text style={styles.addButtonText}>Add Supplier</Text>
        </TouchableOpacity>
      </View>

      {/* Parties List */}
      <FlatList
        data={filteredParties}
        renderItem={renderPartyItem}
        keyExtractor={(item) => item.id}
        style={styles.partiesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Parties Found</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery ? "No parties match your search" : "Start by adding your first customer or supplier"}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingParty ? "Edit Party" : "Add New Party"}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Party Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Party Type *</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "customer" && styles.activeTypeButton
                  ]}
                  onPress={() => setFormData({ ...formData, type: "customer" })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === "customer" && styles.activeTypeButtonText
                  ]}>
                    👤 Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.type === "supplier" && styles.activeTypeButton
                  ]}
                  onPress={() => setFormData({ ...formData, type: "supplier" })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === "supplier" && styles.activeTypeButtonText
                  ]}>
                    🏢 Supplier
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Party Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter party name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* GST Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>GST Number</Text>
              <TextInput
                style={styles.formInput}
                value={formData.gstNumber}
                onChangeText={(text) => setFormData({ ...formData, gstNumber: text })}
                placeholder="Enter GST number"
                autoCapitalize="characters"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Credit Limit */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Credit Limit</Text>
              <TextInput
                style={styles.formInput}
                value={formData.creditLimit}
                onChangeText={(text) => setFormData({ ...formData, creditLimit: text })}
                placeholder="Enter credit limit"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Payment Terms */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Terms</Text>
              <TextInput
                style={styles.formInput}
                value={formData.paymentTerms}
                onChangeText={(text) => setFormData({ ...formData, paymentTerms: text })}
                placeholder="e.g., Net 30 days"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
  },
  activeTabButton: {
    backgroundColor: "#3b82f6",
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabTitle: {
    color: "#ffffff",
  },
  tabCount: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  activeTabCount: {
    color: "#e0f2fe",
  },
  addButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  addButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  partiesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  partyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  partyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  partyType: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  partyActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 16,
  },
  partyDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  partyFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 6,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  joinedDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  activeTypeButton: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTypeButtonText: {
    color: "#3b82f6",
  },
});

export default PartiesScreen;