// screens/Inventory/InventoryScreen.js
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
import InventoryService from "./services/InventoryService";

const InventoryScreen = ({ route }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all"); // all, low_stock, categories
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [statistics, setStatistics] = useState({});
  
  const [formData, setFormData] = useState({
    item_name: "",
    item_code: "",
    category: "",
    description: "",
    stock_quantity: "",
    min_stock_level: "",
    cost_price: "",
    selling_price: "",
    tax_rate: "18",
    unit: "pcs",
    hsn_code: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  useEffect(() => {
    // Handle navigation params
    if (route?.params?.action === 'add') {
      openAddModal();
    }
  }, [route?.params]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedTab]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, stats] = await Promise.all([
        InventoryService.getAllItems(),
        InventoryService.getCategories(),
        InventoryService.getInventorySummary()
      ]);
      
      setItems(itemsData);
      setCategories(categoriesData);
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Error loading inventory:', error);
      Alert.alert("Error", "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by tab
    if (selectedTab === "low_stock") {
      filtered = filtered.filter(item => 
        item.stock_quantity <= item.min_stock_level
      );
    } else if (selectedTab === "categories" && searchQuery) {
      filtered = filtered.filter(item => 
        item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim() && selectedTab !== "categories") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(query) ||
        (item.item_code && item.item_code.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      item_name: "",
      item_code: "",
      category: "",
      description: "",
      stock_quantity: "",
      min_stock_level: "5",
      cost_price: "",
      selling_price: "",
      tax_rate: "18",
      unit: "pcs",
      hsn_code: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name || "",
      item_code: item.item_code || "",
      category: item.category || "",
      description: item.description || "",
      stock_quantity: item.stock_quantity?.toString() || "",
      min_stock_level: item.min_stock_level?.toString() || "5",
      cost_price: item.cost_price?.toString() || "",
      selling_price: item.selling_price?.toString() || "",
      tax_rate: item.tax_rate?.toString() || "18",
      unit: item.unit || "pcs",
      hsn_code: item.hsn_code || "",
    });
    setModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!formData.item_name.trim()) {
      Alert.alert("Error", "Item name is required");
      return;
    }

    try {
      const itemData = {
        ...formData,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock_level: parseInt(formData.min_stock_level) || 5,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        tax_rate: parseFloat(formData.tax_rate) || 18,
      };

      if (editingItem) {
        await InventoryService.updateItem(editingItem.id, itemData);
        Alert.alert("Success", "Item updated successfully");
      } else {
        await InventoryService.createItem(itemData);
        Alert.alert("Success", "Item added successfully");
      }

      setModalVisible(false);
      await loadInventoryData();
    } catch (error) {
      console.error('❌ Error saving item:', error);
      Alert.alert("Error", "Failed to save item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await InventoryService.deleteItem(itemId);
              Alert.alert("Success", "Item deleted successfully");
              await loadInventoryData();
            } catch (error) {
              console.error('❌ Error deleting item:', error);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    try {
      await InventoryService.createCategory(categoryFormData);
      Alert.alert("Success", "Category added successfully");
      setCategoryModalVisible(false);
      setCategoryFormData({ name: "", description: "" });
      await loadInventoryData();
    } catch (error) {
      console.error('❌ Error saving category:', error);
      Alert.alert("Error", "Failed to save category");
    }
  };

  const getStockStatus = (item) => {
    if (item.stock_quantity <= 0) return { text: "Out of Stock", color: "#ef4444" };
    if (item.stock_quantity <= item.min_stock_level) return { text: "Low Stock", color: "#f59e0b" };
    return { text: "In Stock", color: "#10b981" };
  };

  const renderItemCard = ({ item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => openEditModal(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <Text style={styles.itemCode}>{item.item_code}</Text>
            {item.category && (
              <Text style={styles.itemCategory}>📂 {item.category}</Text>
            )}
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        <View style={styles.itemDetails}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockQuantity}>
              Stock: {item.stock_quantity} {item.unit}
            </Text>
            <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
              {stockStatus.text}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.costPrice}>
              Cost: ₹{(item.cost_price || 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.sellingPrice}>
              Price: ₹{(item.selling_price || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Items Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? "No items match your search criteria" 
          : "Start by adding your first inventory item"
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={openAddModal}
        >
          <Text style={styles.emptyButtonText}>Add First Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.categoryButtonText}>+ Category</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.totalItems || 0}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.lowStockItems || 0}</Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{((statistics.totalValue || 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.categories || 0}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name, code, or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: "all", label: "All Items" },
          { key: "low_stock", label: "Low Stock" },
          { key: "categories", label: "Categories" },
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

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit Item Modal */}
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
              {editingItem ? "Edit Item" : "Add Item"}
            </Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.item_name}
                  onChangeText={(text) => setFormData({ ...formData, item_name: text })}
                  placeholder="Enter item name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.item_code}
                  onChangeText={(text) => setFormData({ ...formData, item_code: text })}
                  placeholder="Enter item code (auto-generated if empty)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  placeholder="Select or enter category"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter item description"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Stock Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stock Information</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Stock Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.stock_quantity}
                    onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Min Stock Level</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.min_stock_level}
                    onChangeText={(text) => setFormData({ ...formData, min_stock_level: text })}
                    placeholder="5"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  placeholder="pcs, kg, ltr, etc."
                />
              </View>
            </View>

            {/* Pricing Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing Information</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Cost Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.cost_price}
                    onChangeText={(text) => setFormData({ ...formData, cost_price: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Selling Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.selling_price}
                    onChangeText={(text) => setFormData({ ...formData, selling_price: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Tax Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.tax_rate}
                    onChangeText={(text) => setFormData({ ...formData, tax_rate: text })}
                    placeholder="18"
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>HSN Code</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.hsn_code}
                    onChangeText={(text) => setFormData({ ...formData, hsn_code: text })}
                    placeholder="Enter HSN code"
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TouchableOpacity onPress={handleSaveCategory}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.section}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Name *</Text>
                <TextInput
                  style={styles.input}
                  value={categoryFormData.name}
                  onChangeText={(text) => setCategoryFormData({ ...categoryFormData, name: text })}
                  placeholder="Enter category name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={categoryFormData.description}
                  onChangeText={(text) => setCategoryFormData({ ...categoryFormData, description: text })}
                  placeholder="Enter category description"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
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
  headerActions: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
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
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#3B82F6',
  },
  itemActions: {
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
  itemDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockQuantity: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costPrice: {
    fontSize: 14,
    color: '#64748B',
  },
  sellingPrice: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});

export default InventoryScreen;
