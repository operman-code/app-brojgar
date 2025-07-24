import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  FlatList,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import InventoryService from './services/InventoryService';

const InventoryScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({});

  const [newItem, setNewItem] = useState({
    name: '',
    category_id: null,
    cost_price: '',
    selling_price: '',
    current_stock: '',
    minimum_stock: '',
    unit: 'pcs',
  });

  useEffect(() => {
    loadInventory();
    loadCategories();
    loadSummary();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, searchQuery]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getAllItems(null, searchQuery, selectedTab);
      setItems(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await InventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await InventoryService.getInventorySummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadInventory(), loadCategories(), loadSummary()]);
    setRefreshing(false);
  };

  const tabs = [
    { key: 'all', label: 'All Items', count: summary.totalItems || 0 },
    { key: 'low_stock', label: 'Low Stock', count: summary.lowStockCount || 0 },
    { key: 'out_of_stock', label: 'Out of Stock', count: 0 },
  ];

  const addItem = async () => {
    try {
      const validation = InventoryService.validateItemData(newItem);
      if (!validation.isValid) {
        Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
        return;
      }

      await InventoryService.createItem({
        ...newItem,
        cost_price: parseFloat(newItem.cost_price) || 0,
        selling_price: parseFloat(newItem.selling_price) || 0,
        current_stock: parseFloat(newItem.current_stock) || 0,
        minimum_stock: parseFloat(newItem.minimum_stock) || 0,
      });
      
      setNewItem({
        name: '',
        category_id: null,
        cost_price: '',
        selling_price: '',
        current_stock: '',
        minimum_stock: '',
        unit: 'pcs',
      });
      setModalVisible(false);
      Alert.alert('Success', 'Item added successfully!');
      loadInventory();
      loadSummary();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const deleteItem = async (itemId, itemName) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${itemName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await InventoryService.deleteItem(itemId);
              Alert.alert('Success', 'Item deleted successfully');
              loadInventory();
              loadSummary();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        }
      ]
    );
  };

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.key}
      style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
      onPress={() => setSelectedTab(tab.key)}
    >
      <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
        {tab.label}
      </Text>
      <View style={[styles.tabBadge, selectedTab === tab.key && styles.activeTabBadge]}>
        <Text style={[styles.tabBadgeText, selectedTab === tab.key && styles.activeTabBadgeText]}>
          {tab.count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const stockInfo = InventoryService.getStockStatus(item.currentStock, item.minimumStock);

    return (
      <TouchableOpacity style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Text style={styles.itemIconText}>{item.categoryIcon}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <View style={styles.stockInfo}>
              <View style={[styles.stockBadge, { backgroundColor: stockInfo.color }]}>
                <Text style={styles.stockBadgeText}>{stockInfo.text}</Text>
              </View>
              <Text style={styles.stockQuantity}>Stock: {item.currentStock}</Text>
            </View>
          </View>
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>₹{item.sellingPrice.toLocaleString()}</Text>
            <Text style={styles.profitMargin}>+{item.profitMargin}% margin</Text>
          </View>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cost</Text>
            <Text style={styles.detailValue}>₹{item.costPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Min Stock</Text>
            <Text style={styles.detailValue}>{item.minimumStock}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Value</Text>
            <Text style={styles.detailValue}>₹{item.stockValue.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 Report</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]} 
            onPress={() => navigation.navigate('Invoice')}
          >
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>💰 Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={() => deleteItem(item.id, item.name)}
          >
            <Text style={[styles.actionButtonText, styles.dangerActionButtonText]}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Inventory</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} items • ₹{(summary.totalValue || 0).toLocaleString()} value
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsRow}>
              {tabs.map(renderTab)}
            </View>
          </ScrollView>
        </View>

        {/* Items List */}
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery ? 'Try different search terms' : 'Add your first item to get started'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.emptyActionButtonText}>Add First Item</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </Animated.View>

      {/* Add Item Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Item Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newItem.name}
                onChangeText={(text) => setNewItem({...newItem, name: text})}
                placeholder="Enter item name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton, 
                      newItem.category_id === category.id && styles.activeCategoryButton
                    ]}
                    onPress={() => setNewItem({...newItem, category_id: category.id})}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      newItem.category_id === category.id && styles.activeCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.current_stock}
                  onChangeText={(text) => setNewItem({...newItem, current_stock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Min Stock</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.minimum_stock}
                  onChangeText={(text) => setNewItem({...newItem, minimum_stock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Cost Price *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.cost_price}
                  onChangeText={(text) => setNewItem({...newItem, cost_price: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Selling Price *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.selling_price}
                  onChangeText={(text) => setNewItem({...newItem, selling_price: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
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
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    padding: 0,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8fafc',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabBadge: {
    marginLeft: 8,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabBadgeText: {
    color: '#ffffff',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 20,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  stockQuantity: {
    fontSize: 12,
    color: '#64748b',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  profitMargin: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#3b82f6',
  },
  dangerActionButton: {
    backgroundColor: '#fef2f2',
    flex: 0.3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  primaryActionButtonText: {
    color: '#ffffff',
  },
  dangerActionButtonText: {
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 10,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeCategoryText: {
    color: '#ffffff',
  },
});

export default InventoryScreen;
