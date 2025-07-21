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
  Image,
} from "react-native";

// Import service
import InventoryService from "./services/InventoryService";

const InventoryScreen = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all"); // all, low-stock, out-of-stock
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [stockItem, setStockItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockOperation, setStockOperation] = useState("add"); // add, remove, set
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Electronics",
    sku: "",
    barcode: "",
    price: "",
    costPrice: "",
    stock: "",
    minStock: "",
    maxStock: "",
    unit: "pcs",
    supplier: "",
    brand: "",
    notes: "",
  });

  const categories = ["Electronics", "Mobile Accessories", "Computers", "Audio", "Gaming", "Cables", "Others"];

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedTab, selectedCategory]);

  const loadItems = async () => {
    try {
      const itemsData = await InventoryService.getAllItems();
      setItems(itemsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load inventory items");
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
      filtered = filtered.filter(item => item.stock <= item.minStock && item.stock > 0);
    } else if (selectedTab === "out-of-stock") {
      filtered = filtered.filter(item => item.stock === 0);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.barcode.includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      category: "Electronics",
      sku: "",
      barcode: "",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "",
      maxStock: "",
      unit: "pcs",
      supplier: "",
      brand: "",
      notes: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setModalVisible(true);
  };

  const openStockModal = (item, operation = "add") => {
    setStockItem(item);
    setStockOperation(operation);
    setStockQuantity("");
    setStockModalVisible(true);
  };
  
  // Auto-generate barcode function
  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = `${timestamp.slice(-8)}${random}`;
    setFormData({ ...formData, barcode: barcode });
  };
  
  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Item name is required");
      return;
    }

    if (!formData.sku.trim()) {
      Alert.alert("Validation Error", "SKU is required");
      return;
    }

    try {
      if (editingItem) {
        await InventoryService.updateItem(editingItem.id, formData);
        Alert.alert("Success", "Item updated successfully");
      } else {
        await InventoryService.addItem(formData);
        Alert.alert("Success", "Item added successfully");
      }
      
      setModalVisible(false);
      await loadItems();
    } catch (error) {
      Alert.alert("Error", "Failed to save item");
    }
  };

  const handleStockUpdate = async () => {
    if (!stockQuantity || isNaN(Number(stockQuantity))) {
      Alert.alert("Validation Error", "Please enter a valid quantity");
      return;
    }

    try {
      await InventoryService.updateStock(stockItem.id, Number(stockQuantity), stockOperation);
      Alert.alert("Success", "Stock updated successfully");
      setStockModalVisible(false);
      await loadItems();
    } catch (error) {
      Alert.alert("Error", "Failed to update stock");
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await InventoryService.deleteItem(item.id);
              Alert.alert("Success", "Item deleted successfully");
              await loadItems();
            } catch (error) {
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const getStockStatus = (item) => {
    if (item.stock === 0) return { text: "Out of Stock", color: "#ef4444" };
    if (item.stock <= item.minStock) return { text: "Low Stock", color: "#f59e0b" };
    if (item.stock >= item.maxStock) return { text: "Overstock", color: "#8b5cf6" };
    return { text: "In Stock", color: "#10b981" };
  };

  const getStockPercentage = (item) => {
    if (item.maxStock === 0) return 0;
    return Math.min((item.stock / item.maxStock) * 100, 100);
  };

  const renderItemCard = ({ item }) => {
    const stockStatus = getStockStatus(item);
    const stockPercentage = getStockPercentage(item);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSku}>SKU: {item.sku}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.stockButton}
              onPress={() => openStockModal(item, "add")}
            >
              <Text style={styles.actionIcon}>📦</Text>
            </TouchableOpacity>
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

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text style={[styles.detailValue, { color: stockStatus.color }]}>
              {item.stock} {item.unit}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>₹{item.price}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand:</Text>
            <Text style={styles.detailValue}>{item.brand}</Text>
          </View>
        </View>

        <View style={styles.stockIndicator}>
          <View style={styles.stockBarBackground}>
            <View 
              style={[
                styles.stockBarFill, 
                { 
                  width: `${stockPercentage}%`,
                  backgroundColor: stockStatus.color 
                }
              ]} 
            />
          </View>
          <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
            {stockStatus.text}
          </Text>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemValue}>
            Stock Value: ₹{(item.stock * item.costPrice).toLocaleString("en-IN")}
          </Text>
          <Text style={styles.lastUpdated}>
            Updated: {new Date(item.updatedAt).toLocaleDateString("en-IN")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.activeCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.activeCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const allCount = items.length;
  const lowStockCount = items.filter(item => item.stock <= item.minStock && item.stock > 0).length;
  const outOfStockCount = items.filter(item => item.stock === 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Text style={styles.headerSubtitle}>Manage your stock and products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, SKU, barcode, or brand..."
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

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {renderCategoryButton("all")}
        {categories.map(renderCategoryButton)}
      </ScrollView>

      {/* Stock Status Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton("all", "All Items", allCount)}
        {renderTabButton("low-stock", "Low Stock", lowStockCount)}
        {renderTabButton("out-of-stock", "Out of Stock", outOfStockCount)}
      </View>

      {/* Add Item Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add New Item</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id}
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery ? "No items match your search" : "Start by adding your first inventory item"}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Item Modal */}
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
              {editingItem ? "Edit Item" : "Add New Item"}
            </Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSave}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Item Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter item name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Enter item description"
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categorySelector}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category && styles.activeCategoryOption
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.category === category && styles.activeCategoryOptionText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.formLabel}>SKU *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.sku}
                  onChangeText={(text) => setFormData({ ...formData, sku: text })}
                  placeholder="SKU/Product Code"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Barcode</Text>
                <View style={styles.barcodeInputContainer}>
                  <TextInput
                    style={styles.barcodeInput}
                    value={formData.barcode}
                    onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                    placeholder="Barcode"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    style={styles.generateBarcodeButton}
                    onPress={generateBarcode}
                  >
                    <Text style={styles.generateBarcodeText}>Auto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.formLabel}>Brand</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.brand}
                  onChangeText={(text) => setFormData({ ...formData, brand: text })}
                  placeholder="Brand name"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  placeholder="pcs, kg, ltr"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Pricing */}
            <Text style={styles.sectionTitle}>Pricing</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.formLabel}>Cost Price</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.costPrice}
                  onChangeText={(text) => setFormData({ ...formData, costPrice: text })}
                  placeholder="Cost price"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Selling Price</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="Selling price"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Stock Management */}
            <Text style={styles.sectionTitle}>Stock Management</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.formLabel}>Current Stock</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.stock}
                  onChangeText={(text) => setFormData({ ...formData, stock: text })}
                  placeholder="Current stock"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Min Stock</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.minStock}
                  onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                  placeholder="Minimum stock"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Max Stock</Text>
              <TextInput
                style={styles.formInput}
                value={formData.maxStock}
                onChangeText={(text) => setFormData({ ...formData, maxStock: text })}
                placeholder="Maximum stock level"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Supplier</Text>
              <TextInput
                style={styles.formInput}
                value={formData.supplier}
                onChangeText={(text) => setFormData({ ...formData, supplier: text })}
                placeholder="Supplier name"
                placeholderTextColor="#9ca3af"
              />
            </View>

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
              <TouchableOpacity
                onPress={() => setStockModalVisible(false)}
              >
                <Text style={styles.stockModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.stockItemName}>{stockItem?.name}</Text>
            <Text style={styles.stockItemCurrent}>
              Current Stock: {stockItem?.stock} {stockItem?.unit}
            </Text>

            <View style={styles.stockOperationSelector}>
              <TouchableOpacity
                style={[
                  styles.operationButton,
                  stockOperation === "add" && styles.activeOperationButton
                ]}
                onPress={() => setStockOperation("add")}
              >
                <Text style={[
                  styles.operationButtonText,
                  stockOperation === "add" && styles.activeOperationButtonText
                ]}>
                  Add Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.operationButton,
                  stockOperation === "remove" && styles.activeOperationButton
                ]}
                onPress={() => setStockOperation("remove")}
              >
                <Text style={[
                  styles.operationButtonText,
                  stockOperation === "remove" && styles.activeOperationButtonText
                ]}>
                  Remove Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.operationButton,
                  stockOperation === "set" && styles.activeOperationButton
                ]}
                onPress={() => setStockOperation("set")}
              >
                <Text style={[
                  styles.operationButtonText,
                  stockOperation === "set" && styles.activeOperationButtonText
                ]}>
                  Set Stock
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.stockQuantityInput}
              value={stockQuantity}
              onChangeText={setStockQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.stockModalButtons}>
              <TouchableOpacity
                style={styles.stockCancelButton}
                onPress={() => setStockModalVisible(false)}
              >
                <Text style={styles.stockCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stockUpdateButton}
                onPress={handleStockUpdate}
              >
                <Text style={styles.stockUpdateText}>Update</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
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
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
  categoryContainer: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: "#3b82f6",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeCategoryButtonText: {
    color: "#ffffff",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
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
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
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
    fontSize: 16,
    fontWeight: "600",
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  itemSku: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: "#8b5cf6",
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  stockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
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
  itemDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  stockIndicator: {
    marginBottom: 12,
  },
  stockBarBackground: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
    marginBottom: 6,
  },
  stockBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  itemFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  lastUpdated: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 20,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
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
  barcodeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  barcodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  generateBarcodeButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  generateBarcodeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  categorySelector: {
    flexDirection: "row",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  activeCategoryOption: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#6b7280",
  },
  activeCategoryOptionText: {
    color: "#ffffff",
  },
  stockModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  stockModalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  stockModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stockModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  stockModalClose: {
    fontSize: 18,
    color: "#6b7280",
  },
  stockItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  stockItemCurrent: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  stockOperationSelector: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  operationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  activeOperationButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  operationButtonText: {
    fontSize: 12,
    color: "#6b7280",
  },
  activeOperationButtonText: {
    color: "#ffffff",
  },
  stockQuantityInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  stockModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  stockCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  stockCancelText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  stockUpdateButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#3b82f6",
  },
  stockUpdateText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default InventoryScreen;
