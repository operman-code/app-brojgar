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

const PartiesScreen = ({ route }) => {
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all"); // all, customers, suppliers
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    type: "customer", // customer or supplier
    creditLimit: "",
    creditDays: "30",
    openingBalance: "0",
    notes: "",
  });

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    // Handle navigation params
    if (route?.params?.action === 'add') {
      openAddModal(route.params.type || 'customer');
    }
  }, [route?.params]);

  useEffect(() => {
    filterParties();
  }, [parties, searchQuery, selectedTab]);

  const loadParties = async () => {
    setLoading(true);
    try {
      const [partiesData, stats] = await Promise.all([
        PartiesService.getAllParties(),
        PartiesService.getPartiesStatistics()
      ]);
      
      setParties(partiesData);
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Error loading parties:', error);
      Alert.alert("Error", "Failed to load parties");
    } finally {
      setLoading(false);
    }
  };

  const filterParties = () => {
    let filtered = parties;

    // Filter by tab
    if (selectedTab === "customers") {
      filtered = filtered.filter(party => 
        party.type === "customer" || party.type === "both"
      );
    } else if (selectedTab === "suppliers") {
      filtered = filtered.filter(party => 
        party.type === "supplier" || party.type === "both"
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(query) ||
        (party.phone && party.phone.includes(query)) ||
        (party.email && party.email.toLowerCase().includes(query)) ||
        (party.gstNumber && party.gstNumber.toLowerCase().includes(query))
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
      panNumber: "",
      type: type,
      creditLimit: "50000",
      creditDays: "30",
      openingBalance: "0",
      notes: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (party) => {
    setEditingParty(party);
    setFormData({
      name: party.name || "",
      phone: party.phone || "",
      email: party.email || "",
      address: party.address || "",
      gstNumber: party.gstNumber || "",
      panNumber: party.panNumber || "",
      type: party.type || "customer",
      creditLimit: party.creditLimit?.toString() || "50000",
      creditDays: party.credit_days?.toString() || "30",
      openingBalance: party.opening_balance?.toString() || "0",
      notes: party.notes || "",
    });
    setModalVisible(true);
  };

  const handleSaveParty = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Party name is required");
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    try {
      const partyData = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit) || 0,
        creditDays: parseInt(formData.creditDays) || 30,
        openingBalance: parseFloat(formData.openingBalance) || 0,
      };

      if (editingParty) {
        await PartiesService.updateParty(editingParty.id, partyData);
        Alert.alert("Success", "Party updated successfully");
      } else {
        await PartiesService.addParty(partyData);
        Alert.alert("Success", "Party added successfully");
      }

      setModalVisible(false);
      await loadParties();
    } catch (error) {
      console.error('❌ Error saving party:', error);
      Alert.alert("Error", "Failed to save party");
    }
  };

  const handleDeleteParty = async (partyId) => {
    Alert.alert(
      "Delete Party",
      "Are you sure you want to delete this party?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await PartiesService.deleteParty(partyId);
              Alert.alert("Success", "Party deleted successfully");
              await loadParties();
            } catch (error) {
              console.error('❌ Error deleting party:', error);
              Alert.alert("Error", "Failed to delete party");
            }
          },
        },
      ]
    );
  };

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partyCard}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.partyHeader}>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={styles.partyType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <View style={styles.partyActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteParty(item.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.partyDetails}>
        {item.phone && (
          <Text style={styles.partyDetailText}>📞 {item.phone}</Text>
        )}
        {item.email && (
          <Text style={styles.partyDetailText}>📧 {item.email}</Text>
        )}
        {item.gstNumber && (
          <Text style={styles.partyDetailText}>🏢 GST: {item.gstNumber}</Text>
        )}
      </View>

      <View style={styles.partyFooter}>
        <Text style={styles.balanceText}>
          Balance: ₹{(item.balance || 0).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.creditText}>
          Credit: ₹{(item.creditLimit || 0).toLocaleString('en-IN')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No Parties Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? "No parties match your search criteria" 
          : "Start by adding your first customer or supplier"
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => openAddModal('customer')}
        >
          <Text style={styles.emptyButtonText}>Add First Party</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Parties...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parties</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal('customer')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.totalCustomers || 0}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.totalSuppliers || 0}</Text>
          <Text style={styles.statLabel}>Suppliers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{((statistics.totalReceivables || 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>To Collect</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{((statistics.totalPayables || 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>To Pay</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search parties by name, phone, email, or GST..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: "all", label: "All" },
          { key: "customers", label: "Customers" },
          { key: "suppliers", label: "Suppliers" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Party List */}
      <FlatList
        data={filteredParties}
        renderItem={renderPartyItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Party Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingParty ? "Edit Party" : "Add Party"}
            </Text>
            <TouchableOpacity onPress={handleSaveParty}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter party name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeSelector}>
                  {[
                    { key: "customer", label: "Customer" },
                    { key: "supplier", label: "Supplier" },
                    { key: "both", label: "Both" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeOption,
                        formData.type === type.key && styles.activeTypeOption,
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.key })}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          formData.type === type.key && styles.activeTypeOptionText,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Enter complete address"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Business Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GST Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.gstNumber}
                  onChangeText={(text) => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
                  placeholder="Enter GST number"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PAN Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.panNumber}
                  onChangeText={(text) => setFormData({ ...formData, panNumber: text.toUpperCase() })}
                  placeholder="Enter PAN number"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Financial Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credit Limit (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.creditLimit}
                  onChangeText={(text) => setFormData({ ...formData, creditLimit: text })}
                  placeholder="Enter credit limit"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credit Days</Text>
                <TextInput
                  style={styles.input}
                  value={formData.creditDays}
                  onChangeText={(text) => setFormData({ ...formData, creditDays: text })}
                  placeholder="Enter credit days"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Opening Balance (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.openingBalance}
                  onChangeText={(text) => setFormData({ ...formData, openingBalance: text })}
                  placeholder="Enter opening balance"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="Enter any additional notes"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </SafeAreaView>
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
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  searchIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  partyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  partyType: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 2,
  },
  partyActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  partyDetails: {
    marginBottom: 12,
  },
  partyDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  partyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  creditText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  activeTypeOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTypeOptionText: {
    color: '#FFFFFF',
  },
});

export default PartiesScreen;
