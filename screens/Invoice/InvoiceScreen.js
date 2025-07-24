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
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import InvoiceService from './services/InvoiceService';
import PartiesService from '../Parties/services/PartiesService';
import InventoryService from '../Inventory/services/InventoryService';

const InvoiceScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    customer: null,
    items: [],
    notes: '',
    terms: '',
    discount: 0,
    tax: 18,
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [invoiceNumber, customersList, productsList] = await Promise.all([
        InvoiceService.getNextInvoiceNumber(),
        PartiesService.getAllParties('customer'),
        InventoryService.getAllItems()
      ]);
      
      setInvoiceData(prev => ({ ...prev, invoiceNumber }));
      setCustomers(customersList);
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * invoiceData.discount) / 100;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return ((subtotal - discount) * invoiceData.tax) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const addItem = (product) => {
    const existingItem = invoiceData.items.find(item => item.id === product.id);
    
    if (existingItem) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        items: [...invoiceData.items, {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1
        }]
      });
    }
    setShowProductModal(false);
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter(item => item.id !== itemId)
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      });
    }
  };

  const selectCustomer = (customer) => {
    setInvoiceData({ ...invoiceData, customer });
    setShowCustomerModal(false);
  };

  const generateInvoice = async () => {
    if (!invoiceData.customer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    if (invoiceData.items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    try {
      const result = await InvoiceService.createInvoice({
        customer: invoiceData.customer,
        items: invoiceData.items,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        discount: invoiceData.discount,
        tax: invoiceData.tax
      });

      Alert.alert(
        'Success', 
        `Invoice ${result.invoiceNumber} created successfully!`,
        [
          { text: 'Create New', onPress: () => resetInvoice() },
          { 
            text: 'View Invoice', 
            onPress: () => navigation.navigate('InvoiceTemplate', { 
              invoiceData: { ...invoiceData, invoiceNumber: result.invoiceNumber, total: result.total }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', 'Failed to create invoice');
    }
  };

  const resetInvoice = async () => {
    try {
      const newInvoiceNumber = await InvoiceService.getNextInvoiceNumber();
      setInvoiceData({
        invoiceNumber: newInvoiceNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        customer: null,
        items: [],
        notes: '',
        terms: '',
        discount: 0,
        tax: 18,
      });
    } catch (error) {
      console.error('Error resetting invoice:', error);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toLocaleString()}</Text>
    </View>
  );

  const renderCustomer = ({ item }) => (
    <TouchableOpacity style={styles.customerItem} onPress={() => selectCustomer(item)}>
      <View style={styles.customerAvatar}>
        <Text style={styles.customerAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerPhone}>{item.phone}</Text>
      </View>
      <Text style={styles.selectText}>Select</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => addItem(item)}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.sellingPrice.toLocaleString()}</Text>
        <Text style={styles.productStock}>Stock: {item.currentStock}</Text>
      </View>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Invoice</Text>
          <TouchableOpacity onPress={generateInvoice} style={styles.generateButton}>
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Invoice Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.sectionCard}>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Invoice Number</Text>
                <Text style={styles.invoiceValue}>{invoiceData.invoiceNumber}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Date</Text>
                <Text style={styles.invoiceValue}>{invoiceData.date}</Text>
              </View>
            </View>
          </View>

          {/* Customer Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <TouchableOpacity 
              style={styles.customerSelector}
              onPress={() => setShowCustomerModal(true)}
            >
              {invoiceData.customer ? (
                <View style={styles.selectedCustomer}>
                  <View style={styles.customerAvatar}>
                    <Text style={styles.customerAvatarText}>{invoiceData.customer.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{invoiceData.customer.name}</Text>
                    <Text style={styles.customerPhone}>{invoiceData.customer.phone}</Text>
                  </View>
                  <Text style={styles.changeText}>Change</Text>
                </View>
              ) : (
                <View style={styles.selectCustomerPlaceholder}>
                  <Text style={styles.selectCustomerIcon}>👤</Text>
                  <Text style={styles.selectCustomerText}>Select Customer</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items ({invoiceData.items.length})</Text>
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={() => setShowProductModal(true)}
              >
                <Text style={styles.addItemText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>
            
            {invoiceData.items.length > 0 ? (
              <View style={styles.sectionCard}>
                <FlatList
                  data={invoiceData.items}
                  renderItem={renderInvoiceItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            ) : (
              <View style={styles.emptyItems}>
                <Text style={styles.emptyItemsIcon}>📦</Text>
                <Text style={styles.emptyItemsText}>No items added yet</Text>
                <Text style={styles.emptyItemsSubtext}>Tap "Add Item" to get started</Text>
              </View>
            )}
          </View>

          {/* Invoice Summary */}
          {invoiceData.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.sectionCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{calculateSubtotal().toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount ({invoiceData.discount}%)</Text>
                  <Text style={styles.summaryValue}>-₹{calculateDiscount().toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax ({invoiceData.tax}%)</Text>
                  <Text style={styles.summaryValue}>+₹{calculateTax().toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₹{calculateTotal().toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Customer Selection Modal */}
        <Modal visible={showCustomerModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => {
                setShowCustomerModal(false);
                navigation.navigate('Parties');
              }}>
                <Text style={styles.modalAddText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search customers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <FlatList
              data={filteredCustomers}
              renderItem={renderCustomer}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              ListEmptyComponent={
                <View style={styles.emptyModalContainer}>
                  <Text style={styles.emptyModalText}>No customers found</Text>
                  <TouchableOpacity 
                    style={styles.emptyModalButton}
                    onPress={() => {
                      setShowCustomerModal(false);
                      navigation.navigate('Parties');
                    }}
                  >
                    <Text style={styles.emptyModalButtonText}>Add First Customer</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>

        {/* Product Selection Modal */}
        <Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Product</Text>
              <TouchableOpacity onPress={() => {
                setShowProductModal(false);
                navigation.navigate('Inventory');
              }}>
                <Text style={styles.modalAddText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              ListEmptyComponent={
                <View style={styles.emptyModalContainer}>
                  <Text style={styles.emptyModalText}>No products found</Text>
                  <TouchableOpacity 
                    style={styles.emptyModalButton}
                    onPress={() => {
                      setShowProductModal(false);
                      navigation.navigate('Inventory');
                    }}
                  >
                    <Text style={styles.emptyModalButtonText}>Add First Product</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </SafeAreaView>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
};

// Add all the styles here (same as before but I'll include them for completeness)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  invoiceLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  customerSelector: {
    marginHorizontal: 20,
  },
  selectedCustomer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectCustomerPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  selectCustomerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectCustomerText: {
    flex: 1,
    fontSize: 16,
    color: '#64748b',
  },
  chevron: {
    fontSize: 24,
    color: '#cbd5e1',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  changeText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  addItemButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addItemText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyItems: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyItemsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#64748b',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    minWidth: 80,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
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
  modalAddText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalList: {
    flex: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#64748b',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyModalText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  emptyModalButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyModalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InvoiceScreen;
