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
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all"); // all, low-stock, out-of-stock
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stockItem, setStockItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockOperation, setStockOperation] = useState("add"); // add, remove, set
  const [stockNotes, setStockNotes] = useState("");
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    barcode: "",
    sellingPrice: "",
    costPrice: "",
    mrp: "",
    currentStock: "",
    minimumStock: "",
    maximumStock: "",
    unit: "pcs",
    taxRate: "18",
    hsn_code: "",
    notes: "",
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
  }, [items, searchQuery, selectedTab, selectedCategory]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData, metricsData] = await Promise.all([
        InventoryService.getAllItems(),
        InventoryService.getCategories(),
        InventoryService.getInventorySummary()
      ]);
      
      setItems(itemsData);
      setCategories(categoriesData);
      setDashboardMetrics(metricsData);
    } catch (error) {
      console.error('❌ Error loading inventory data:', error);
      Alert.alert("Error", "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by stock status
    if (selectedTab === "low-stock") {
      filtered = filtered.filter(item => 
        item.current_stock <= item.minimum_stock && item.current_stock > 0
      );
    } else if (selectedTab === "out-of-stock") {
      filtered = filtered.filter(item => item.current_stock <= 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.sku && item.sku.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.includes(query)) ||
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
      name: "",
      description: "",
      category: categories.length > 0 ? categories[0].name : "",
      sku: "",
      barcode: "",
      sellingPrice: "",
      costPrice: "",
      mrp: "",
      currentStock: "0",
      minimumStock: "10",
      maximumStock: "100",
      unit: "pcs",
      taxRate: "18",
      hsn_code: "",
      notes: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      sku: item.sku || "",
      barcode: item.barcode || "",
      sellingPrice: item.selling_price?.toString() || "",
      costPrice: item.cost_price?.toString() || "",
      mrp: item.mrp?.toString() || "",
      currentStock: item.current_stock?.toString() || "0",
      minimumStock: item.minimum_stock?.toString() || "10",
      maximumStock: item.maximum_stock?.toString() || "100",
      unit: item.unit || "pcs",
      taxRate: item.tax_rate?.toString() || "18",
      hsn_code: item.hsn_code || "",
      notes: item.notes || "",
    });
    setModalVisible(true);
  };

  const openStockModal = (item) => {
    setStockItem(item);
    setStockQuantity("");
    setStockNotes("");
    setStockOperation("add");
    setStockModalVisible(true);
  };

  const generateSKU = () => {
    const sku = InventoryService.generateSKU(formData.name);
    setFormData({ ...formData, sku });
  };

  const generateBarcode = () => {
    const barcode = InventoryService.generateBarcode();
    setFormData({ ...formData, barcode });
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Item name is required");
      return;
    }

    if (!formData.sellingPrice.trim()) {
      Alert.alert("Error", "Selling price is required");
      return;
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        selling_price: parseFloat(formData.sellingPrice) || 0,
        cost_price: parseFloat(formData.costPrice) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        current_stock: parseFloat(formData.currentStock) || 0,
        minimum_stock: parseFloat(formData.minimumStock) || 0,
        maximum_stock: parseFloat(formData.maximumStock) || 0,
        unit: formData.unit,
        tax_rate: parseFloat(formData.taxRate) || 0,
        hsn_code: formData.hsn_code.trim(),
        notes: formData.notes.trim(),
      };

      if (editingItem) {
        await InventoryService.updateItem(editingItem.id, itemData);
        Alert.alert("Success", "Item updated successfully");
      } else {
        await InventoryService.addItem(itemData);
        Alert.alert("Success", "Item added successfully");
      }

      setModalVisible(false);
      await loadInventoryData();
    } catch (error) {
      console.error('❌ Error saving item:', error);
      Alert.alert("Error", "Failed to save item");
    }
  };

  const handleStockUpdate = async () => {
    if (!stockQuantity.trim()) {
      Alert.alert("Error", "Quantity is required");
      return;
    }

    const quantity = parseFloat(stockQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    try {
      await InventoryService.updateStock(
        stockItem.id,
        quantity,
        stockOperation,
        stockNotes
      );
      
      Alert.alert("Success", "Stock updated successfully");
      setStockModalVisible(false);
      await loadInventoryData();
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      Alert.alert("Error", "Failed to update stock");
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

  const getStockStatus = (item) => {
    if (item.current_stock <= 0) {
      return { status: "Out of Stock", color: "#EF4444" };
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: "Low Stock", color: "#F59E0B" };
    } else {
      return { status: "In Stock", color: "#10B981" };
    }
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
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.stockButton}
              onPress={() => openStockModal(item)}
            >
              <Text style={styles.stockButtonText}>📦</Text>
            </TouchableOpacity>
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

        <View style={styles.itemDetails}>
          {item.sku && (
            <Text style={styles.itemDetailText}>SKU: {item.sku}</Text>
          )}
          {item.barcode && (
            <Text style={styles.itemDetailText}>Barcode: {item.barcode}</Text>
          )}
          <Text style={styles.itemDetailText}>
            Price: ₹{(item.selling_price || 0).toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockQuantity}>
              Stock: {item.current_stock} {item.unit}
            </Text>
            <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
              {stockStatus.status}
            </Text>
          </View>
          <Text style={styles.itemValue}>
            Value: ₹{((item.current_stock * item.cost_price) || 0).toLocaleString('en-IN')}
          </Text>
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Dashboard */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{dashboardMetrics.totalItems || 0}</Text>
          <Text style={styles.metricLabel}>Total Items</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            ₹{((dashboardMetrics.totalValue || 0) / 1000).toFixed(0)}K
          </Text>
          <Text style={styles.metricLabel}>Total Value</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{dashboardMetrics.lowStockItems || 0}</Text>
          <Text style={styles.metricLabel}>Low Stock</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{dashboardMetrics.outOfStockItems || 0}</Text>
          <Text style={styles.metricLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name, SKU, barcode, or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: "all", label: "All" },
          { key: "low-stock", label: "Low Stock" },
          { key: "out-of-stock", label: "Out of Stock" },
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

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === "all" && styles.activeCategoryChip,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === "all" && styles.activeCategoryChipText,
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.name && styles.activeCategoryChipText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter item name"
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

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categorySelector}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          formData.category === category.name && styles.activeCategoryOption,
                        ]}
                        onPress={() => setFormData({ ...formData, category: category.name })}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            formData.category === category.name && styles.activeCategoryOptionText,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Product Codes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Codes</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>SKU</Text>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateSKU}
                  >
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.sku}
                  onChangeText={(text) => setFormData({ ...formData, sku: text })}
                  placeholder="Enter or generate SKU"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Barcode</Text>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateBarcode}
                  >
                    <Text style={styles.generateButtonText}>Auto Generate</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.barcode}
                  onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                  placeholder="Enter or generate barcode"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>HSN Code</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hsn_code}
                  onChangeText={(text) => setFormData({ ...formData, hsn_code: text })}
                  placeholder="Enter HSN code"
                />
              </View>
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cost Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.costPrice}
                  onChangeText={(text) => setFormData({ ...formData, costPrice: text })}
                  placeholder="Enter cost price"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selling Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sellingPrice}
                  onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
                  placeholder="Enter selling price"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MRP (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.mrp}
                  onChangeText={(text) => setFormData({ ...formData, mrp: text })}
                  placeholder="Enter MRP"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tax Rate (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.taxRate}
                  onChangeText={(text) => setFormData({ ...formData, taxRate: text })}
                  placeholder="Enter tax rate"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Stock Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stock Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Stock</Text>
                <View style={styles.stockInputRow}>
                  <TextInput
                    style={[styles.input, styles.stockInput]}
                    value={formData.currentStock}
                    onChangeText={(text) => setFormData({ ...formData, currentStock: text })}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.unitInput]}
                    value={formData.unit}
                    onChangeText={(text) => setFormData({ ...formData, unit: text })}
                    placeholder="pcs"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Stock</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minimumStock}
                  onChangeText={(text) => setFormData({ ...formData, minimumStock: text })}
                  placeholder="Enter minimum stock level"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Maximum Stock</Text>
                <TextInput
                  style={styles.input}
                  value={formData.maximumStock}
                  onChangeText={(text) => setFormData({ ...formData, maximumStock: text })}
                  placeholder="Enter maximum stock level"
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

      {/* Stock Update Modal */}
      <Modal
        visible={stockModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.stockModalOverlay}>
          <View style={styles.stockModalContainer}>
            <View style={styles.stockModalHeader}>
              <Text style={styles.stockModalTitle}>Update Stock</Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}>
                <Text style={styles.stockModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {stockItem && (
              <View style={styles.stockModalContent}>
                <Text style={styles.stockItemName}>{stockItem.name}</Text>
                <Text style={styles.stockCurrentText}>
                  Current Stock: {stockItem.current_stock} {stockItem.unit}
                </Text>

                <View style={styles.stockOperationSelector}>
                  {[
                    { key: "add", label: "Add Stock", icon: "+" },
                    { key: "remove", label: "Remove Stock", icon: "-" },
                    { key: "set", label: "Set Stock", icon: "=" },
                  ].map((operation) => (
                    <TouchableOpacity
                      key={operation.key}
                      style={[
                        styles.stockOperationOption,
                        stockOperation === operation.key && styles.activeStockOperation,
                      ]}
                      onPress={() => setStockOperation(operation.key)}
                    >
                      <Text style={styles.stockOperationIcon}>{operation.icon}</Text>
                      <Text
                        style={[
                          styles.stockOperationText,
                          stockOperation === operation.key && styles.activeStockOperationText,
                        ]}
                      >
                        {operation.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.stockInputGroup}>
                  <Text style={styles.stockInputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.stockInput}
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.stockInputGroup}>
                  <Text style={styles.stockInputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.stockInput, styles.stockNotesInput]}
                    value={stockNotes}
                    onChangeText={setStockNotes}
                    placeholder="Enter reason for stock update"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.stockModalActions}>
                  <TouchableOpacity
                    style={styles.stockCancelButton}
                    onPress={() => setStockModalVisible(false)}
                  >
                    <Text style={styles.stockCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stockUpdateButton}
                    onPress={handleStockUpdate}
                  >
                    <Text style={styles.stockUpdateButtonText}>Update Stock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  metricLabel: {
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
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeCategoryChipText: {
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
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  itemCategory: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
  },
  stockButton: {
    padding: 8,
    marginLeft: 8,
  },
  stockButtonText: {
    fontSize: 16,
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
  itemDetails: {
    marginBottom: 12,
  },
  itemDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stockInfo: {
    flex: 1,
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  itemValue: {
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  generateButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  generateButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
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
    marginTop: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    marginTop: 8,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderRadius: 8,
  },
  activeCategoryOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeCategoryOptionText: {
    color: '#FFFFFF',
  },
  stockInputRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  stockInput: {
    flex: 1,
    marginRight: 8,
  },
  unitInput: {
    width: 80,
  },
  stockModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxWidth: 400,
    width: '90%',
  },
  stockModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stockModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  stockModalClose: {
    fontSize: 20,
    color: '#64748B',
  },
  stockModalContent: {
    padding: 20,
  },
  stockItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  stockCurrentText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  stockOperationSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stockOperationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  activeStockOperation: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  stockOperationIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  stockOperationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  activeStockOperationText: {
    color: '#FFFFFF',
  },
  stockInputGroup: {
    marginBottom: 16,
  },
  stockInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  stockInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  stockNotesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  stockModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  stockCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  stockCancelButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  stockUpdateButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  stockUpdateButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default InventoryScreen;
