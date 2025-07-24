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
} from 'react-native';

const InventoryScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState([
    { id: 1, name: 'Apple iPhone 15', category: 'Smartphones', stock: 25, minStock: 5, price: 79999, cost: 70000, status: 'active' },
    { id: 2, name: 'Samsung Galaxy S24', category: 'Smartphones', stock: 18, minStock: 5, price: 74999, cost: 65000, status: 'active' },
    { id: 3, name: 'OnePlus 12', category: 'Smartphones', stock: 2, minStock: 5, price: 64999, cost: 58000, status: 'low_stock' },
    { id: 4, name: 'MacBook Air M2', category: 'Laptops', stock: 8, minStock: 3, price: 114900, cost: 105000, status: 'active' },
    { id: 5, name: 'iPad Pro', category: 'Tablets', stock: 0, minStock: 2, price: 89900, cost: 82000, status: 'out_of_stock' },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    stock: '',
    minStock: '',
    price: '',
    cost: '',
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const tabs = [
    { key: 'all', label: 'All Items', count: items.length },
    { key: 'low_stock', label: 'Low Stock', count: items.filter(i => i.status === 'low_stock').length },
    { key: 'out_of_stock', label: 'Out of Stock', count: items.filter(i => i.status === 'out_of_stock').length },
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || item.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { status: 'out_of_stock', color: '#ef4444', text: 'Out of Stock' };
    if (stock <= minStock) return { status: 'low_stock', color: '#f59e0b', text: 'Low Stock' };
    return { status: 'active', color: '#10b981', text: 'In Stock' };
  };

  const addItem = () => {
    if (newItem.name.trim() && newItem.price.trim()) {
      const item = {
        id: items.length + 1,
        ...newItem,
        stock: parseInt(newItem.stock) || 0,
        minStock: parseInt(newItem.minStock) || 0,
        price: parseFloat(newItem.price) || 0,
        cost: parseFloat(newItem.cost) || 0,
        status: 'active',
      };
      setItems([...items, item]);
      setNewItem({ name: '', category: '', stock: '', minStock: '', price: '', cost: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Item added successfully!');
    } else {
      Alert.alert('Error', 'Please fill required fields');
    }
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
    const stockInfo = getStockStatus(item.stock, item.minStock);
    const profit = item.price - item.cost;
    const profitMargin = item.price > 0 ? ((profit / item.price) * 100).toFixed(1) : 0;

    return (
      <TouchableOpacity style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Text style={styles.itemIconText}>📦</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
            <View style={styles.stockInfo}>
              <View style={[styles.stockBadge, { backgroundColor: stockInfo.color }]}>
                <Text style={styles.stockBadgeText}>{stockInfo.text}</Text>
              </View>
              <Text style={styles.stockQuantity}>Stock: {item.stock}</Text>
            </View>
          </View>
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
            <Text style={styles.profitMargin}>+{profitMargin}% margin</Text>
          </View>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Cost</Text>
            <Text style={styles.detailValue}>₹{item.cost.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Min Stock</Text>
            <Text style={styles.detailValue}>{item.minStock}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Value</Text>
            <Text style={styles.detailValue}>₹{(item.stock * item.cost).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]} onPress={() => navigation.navigate('Invoice')}>
            <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>💰 Sell</Text>
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
            <Text style={styles.headerSubtitle}>{filteredItems.length} items • ₹{items.reduce((sum, item) => sum + (item.stock * item.cost), 0).toLocaleString()} value</Text>
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
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery ? 'Try different search terms' : 'Add your first item to get started'}
              </Text>
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
              <TextInput
                style={styles.formInput}
                value={newItem.category}
                onChangeText={(text) => setNewItem({...newItem, category: text})}
                placeholder="e.g. Smartphones, Laptops"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.stock}
                  onChangeText={(text) => setNewItem({...newItem, stock: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Min Stock</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.minStock}
                  onChangeText={(text) => setNewItem({...newItem, minStock: text})}
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
                  value={newItem.cost}
                  onChangeText={(text) => setNewItem({...newItem, cost: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroupHalf}>
                <Text style={styles.formLabel}>Selling Price *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.price}
                  onChangeText={(text) => setNewItem({...newItem, price: text})}
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
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  primaryActionButtonText: {
    color: '#ffffff',
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
});

export default InventoryScreen;