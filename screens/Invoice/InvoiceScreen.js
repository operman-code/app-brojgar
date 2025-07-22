// screens/Invoice/InvoiceScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";

// Import services
import InvoiceService from "./services/InvoiceService";
import PartiesService from "../Parties/services/PartiesService";
import InventoryService from "../Inventory/services/InventoryService";

const InvoiceScreen = ({ navigation, route }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    partyId: "",
    partyName: "",
    partyDetails: {},
    items: [],
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    notes: "",
    terms: "Payment due within 30 days",
  });

  const [parties, setParties] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [searchPartyQuery, setSearchPartyQuery] = useState("");
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDiscount, setItemDiscount] = useState("0");
  const [itemDescription, setItemDescription] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items, invoiceData.taxRate, invoiceData.discountAmount]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Get next invoice number
      const nextInvoiceNumber = await InvoiceService.getNextInvoiceNumber();
      
      // Load parties and inventory
      const [partiesData, inventoryData] = await Promise.all([
        PartiesService.getAllParties(),
        InventoryService.getAllItems()
      ]);
      
      // Set due date to 30 days from today
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: nextInvoiceNumber,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
      
      setParties(partiesData.filter(party => 
        party.type === 'customer' || party.type === 'both'
      ));
      setInventory(inventoryData);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      Alert.alert("Error", "Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.price) - (item.discount || 0);
      return sum + itemTotal;
    }, 0);
    
    const discountAmount = parseFloat(invoiceData.discountAmount) || 0;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * invoiceData.taxRate) / 100;
    const total = subtotalAfterDiscount + taxAmount;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total
    }));
  };

  const selectParty = (party) => {
    setInvoiceData(prev => ({
      ...prev,
      partyId: party.id,
      partyName: party.name,
      partyDetails: {
        name: party.name,
        phone: party.phone || '',
        email: party.email || '',
        gstNumber: party.gstNumber || '',
        address: party.address || ''
      }
    }));
    setShowPartyModal(false);
    setSearchPartyQuery("");
  };

  const openItemModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setItemPrice(item.selling_price?.toString() || "0");
      setItemQuantity("1");
      setItemDiscount("0");
      setItemDescription("");
    } else {
      setSelectedItem(null);
      setItemPrice("");
      setItemQuantity("1");
      setItemDiscount("0");
      setItemDescription("");
    }
    setShowItemModal(true);
  };

  const addItemToInvoice = () => {
    if (!selectedItem && !itemDescription.trim()) {
      Alert.alert("Error", "Please select an item or add custom item description");
      return;
    }

    const quantity = parseFloat(itemQuantity);
    const price = parseFloat(itemPrice);
    const discount = parseFloat(itemDiscount) || 0;

    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Error", "Please enter a valid quantity");
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    // Check stock availability
    if (selectedItem && quantity > selectedItem.current_stock) {
      Alert.alert(
        "Insufficient Stock",
        `Only ${selectedItem.current_stock} ${selectedItem.unit} available in stock`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Add Anyway", 
            onPress: () => addItem()
          }
        ]
      );
      return;
    }

    addItem();
  };

  const addItem = () => {
    const quantity = parseFloat(itemQuantity);
    const price = parseFloat(itemPrice);
    const discount = parseFloat(itemDiscount) || 0;

    const newItem = {
      id: Date.now().toString(),
      itemId: selectedItem?.id || null,
      name: selectedItem?.name || "Custom Item",
      description: itemDescription || selectedItem?.description || "",
      quantity: quantity,
      price: price,
      discount: discount,
      unit: selectedItem?.unit || "pcs",
      taxRate: selectedItem?.tax_rate || 18,
      total: (quantity * price) - discount
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setShowItemModal(false);
    setSelectedItem(null);
    setItemQuantity("1");
    setItemPrice("");
    setItemDiscount("0");
    setItemDescription("");
    setSearchItemQuery("");
  };

  const removeItem = (itemId) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    const quantity = parseFloat(newQuantity);
    if (isNaN(quantity) || quantity <= 0) return;

    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: quantity,
              total: (quantity * item.price) - (item.discount || 0)
            }
          : item
      )
    }));
  };

  const saveInvoice = async (status = 'draft') => {
    if (!invoiceData.partyId) {
      Alert.alert("Error", "Please select a customer");
      return;
    }

    if (invoiceData.items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    setSaving(true);
    try {
      const invoiceToSave = {
        ...invoiceData,
        status: status,
        paidAmount: 0,
        balanceAmount: invoiceData.total
      };

      const result = await InvoiceService.createInvoice(invoiceToSave);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          `Invoice ${result.invoiceNumber} ${status === 'draft' ? 'saved as draft' : 'created'} successfully`,
          [
            {
              text: "OK",
              onPress: () => {
                if (status !== 'draft') {
                  navigation.navigate('InvoiceTemplate', { 
                    invoiceId: result.invoiceId 
                  });
                } else {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to save invoice");
      }
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      Alert.alert("Error", "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchPartyQuery.toLowerCase()) ||
    (party.phone && party.phone.includes(searchPartyQuery)) ||
    (party.email && party.email.toLowerCase().includes(searchPartyQuery.toLowerCase()))
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchItemQuery.toLowerCase())) ||
    (item.barcode && item.barcode.includes(searchItemQuery))
  );

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partyItem}
      onPress={() => selectParty(item)}
    >
      <View style={styles.partyInfo}>
        <Text style={styles.partyName}>{item.name}</Text>
        {item.phone && (
          <Text style={styles.partyDetail}>📞 {item.phone}</Text>
        )}
        {item.email && (
          <Text style={styles.partyDetail}>📧 {item.email}</Text>
        )}
      </View>
      <Text style={styles.selectText}>Select</Text>
    </TouchableOpacity>
  );

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.inventoryItem}
      onPress={() => openItemModal(item)}
    >
      <View style={styles.inventoryInfo}>
        <Text style={styles.inventoryName}>{item.name}</Text>
        <Text style={styles.inventoryDetail}>
          Stock: {item.current_stock} {item.unit}
        </Text>
        <Text style={styles.inventoryDetail}>
          Price: ₹{(item.selling_price || 0).toLocaleString('en-IN')}
        </Text>
      </View>
      <Text style={styles.selectText}>Add</Text>
    </TouchableOpacity>
  );

  const renderInvoiceItem = ({ item }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.invoiceItemHeader}>
        <View style={styles.invoiceItemInfo}>
          <Text style={styles.invoiceItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.invoiceItemDescription}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeItemButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeItemText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.invoiceItemDetails}>
        <View style={styles.quantityContainer}>
          <Text style={styles.itemDetailLabel}>Qty:</Text>
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            onChangeText={(text) => updateItemQuantity(item.id, text)}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>{item.unit}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.itemDetailLabel}>Price:</Text>
          <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
        </View>
        
        {item.discount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.itemDetailLabel}>Discount:</Text>
            <Text style={styles.discountText}>-₹{item.discount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        
        <View style={styles.totalContainer}>
          <Text style={styles.itemDetailLabel}>Total:</Text>
          <Text style={styles.totalText}>₹{item.total.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Invoice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Invoice</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveInvoice('draft')}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceNumberContainer}>
            <Text style={styles.invoiceNumberLabel}>Invoice Number</Text>
            <TextInput
              style={styles.invoiceNumberInput}
              value={invoiceData.invoiceNumber}
              onChangeText={(text) => 
                setInvoiceData(prev => ({ ...prev, invoiceNumber: text }))
              }
              placeholder="INV-001"
            />
          </View>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Date</Text>
              <TextInput
                style={styles.dateInput}
                value={invoiceData.date}
                onChangeText={(text) => 
                  setInvoiceData(prev => ({ ...prev, date: text }))
                }
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Due Date</Text>
              <TextInput
                style={styles.dateInput}
                value={invoiceData.dueDate}
                onChangeText={(text) => 
                  setInvoiceData(prev => ({ ...prev, dueDate: text }))
                }
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        </View>

        {/* Customer Selection */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <TouchableOpacity
            style={styles.customerSelector}
            onPress={() => setShowPartyModal(true)}
          >
            {invoiceData.partyName ? (
              <View>
                <Text style={styles.selectedCustomerName}>{invoiceData.partyName}</Text>
                {invoiceData.partyDetails.phone && (
                  <Text style={styles.selectedCustomerDetail}>
                    📞 {invoiceData.partyDetails.phone}
                  </Text>
                )}
                {invoiceData.partyDetails.email && (
                  <Text style={styles.selectedCustomerDetail}>
                    📧 {invoiceData.partyDetails.email}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.selectCustomerText}>Select Customer</Text>
            )}
            <Text style={styles.selectorArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsSectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => openItemModal()}
            >
              <Text style={styles.addItemButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {invoiceData.items.length > 0 ? (
            <FlatList
              data={invoiceData.items}
              renderItem={renderInvoiceItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyItemsContainer}>
              <Text style={styles.emptyItemsText}>No items added yet</Text>
              <TouchableOpacity
                style={styles.addFirstItemButton}
                onPress={() => openItemModal()}
              >
                <Text style={styles.addFirstItemButtonText}>Add First Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Totals Section */}
        {invoiceData.items.length > 0 && (
          <View style={styles.totalsSection}>
            <Text style={styles.sectionTitle}>Totals</Text>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ₹{invoiceData.subtotal.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <TextInput
                style={styles.discountInput}
                value={invoiceData.discountAmount.toString()}
                onChangeText={(text) => 
                  setInvoiceData(prev => ({ 
                    ...prev, 
                    discountAmount: parseFloat(text) || 0 
                  }))
                }
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoiceData.taxRate}%):</Text>
              <Text style={styles.totalValue}>
                ₹{invoiceData.taxAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>
                ₹{invoiceData.total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}

        {/* Notes and Terms */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes & Terms</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={invoiceData.notes}
              onChangeText={(text) => 
                setInvoiceData(prev => ({ ...prev, notes: text }))
              }
              placeholder="Add any notes for the customer"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Terms & Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={invoiceData.terms}
              onChangeText={(text) => 
                setInvoiceData(prev => ({ ...prev, terms: text }))
              }
              placeholder="Payment terms and conditions"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => saveInvoice('sent')}
            disabled={saving || invoiceData.items.length === 0}
          >
            <Text style={styles.generateButtonText}>
              {saving ? 'Generating...' : 'Generate Invoice'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Select Customer Modal */}
      <Modal
        visible={showPartyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPartyModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <TouchableOpacity onPress={() => {
              setShowPartyModal(false);
              navigation.navigate('Parties', { action: 'add', type: 'customer' });
            }}>
              <Text style={styles.modalAddText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInput}
              value={searchPartyQuery}
              onChangeText={setSearchPartyQuery}
              placeholder="Search customers..."
            />

            <FlatList
              data={filteredParties}
              renderItem={renderPartyItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowItemModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={addItemToInvoice}>
              <Text style={styles.modalAddText}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Search Items */}
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                value={searchItemQuery}
                onChangeText={setSearchItemQuery}
                placeholder="Search items..."
              />
              
              {searchItemQuery.length > 0 && (
                <FlatList
                  data={filteredInventory.slice(0, 5)}
                  renderItem={renderInventoryItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Selected Item or Custom Item */}
            <View style={styles.itemDetailsSection}>
              <Text style={styles.sectionTitle}>Item Details</Text>
              
              {selectedItem ? (
                <View style={styles.selectedItemInfo}>
                  <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
                  <Text style={styles.selectedItemDetail}>
                    Stock: {selectedItem.current_stock} {selectedItem.unit}
                  </Text>
                  <Text style={styles.selectedItemDetail}>
                    Price: ₹{(selectedItem.selling_price || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              ) : (
                <View style={styles.customItemSection}>
                  <Text style={styles.customItemLabel}>Custom Item</Text>
                  <TextInput
                    style={styles.input}
                    value={itemDescription}
                    onChangeText={setItemDescription}
                    placeholder="Enter item description"
                  />
                </View>
              )}

              <View style={styles.itemInputRow}>
                <View style={styles.itemInputField}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>

                <View style={styles.itemInputField}>
                  <Text style={styles.inputLabel}>Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Discount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={itemDiscount}
                  onChangeText={setItemDiscount}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              {/* Item Total Preview */}
              {itemQuantity && itemPrice && (
                <View style={styles.itemTotalPreview}>
                  <Text style={styles.itemTotalLabel}>Item Total:</Text>
                  <Text style={styles.itemTotalValue}>
                    ₹{((parseFloat(itemQuantity) || 0) * (parseFloat(itemPrice) || 0) - (parseFloat(itemDiscount) || 0)).toLocaleString('en-IN')}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Add all the styles here - continuing in next message due to length...
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
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  invoiceHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  invoiceNumberContainer: {
    marginBottom: 20,
  },
  invoiceNumberLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  invoiceNumberInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  customerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
    marginBottom: 15,
  },
  customerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 15,
  },
  selectedCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedCustomerDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  selectCustomerText: {
    fontSize: 16,
    color: '#64748B',
  },
  selectorArrow: {
    fontSize: 18,
    color: '#64748B',
  },
  itemsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyItemsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  addFirstItemButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstItemButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  invoiceItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  invoiceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  invoiceItemInfo: {
    flex: 1,
  },
  invoiceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  invoiceItemDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  removeItemButton: {
    padding: 5,
  },
  removeItemText: {
    fontSize: 16,
    color: '#EF4444',
  },
  invoiceItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 5,
  },
  quantityInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    width: 50,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 14,
    color: '#EF4444',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  totalsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  discountInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    width: 100,
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 15,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  notesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
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
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalAddText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  partyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  partyDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  selectText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  inventoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  inventoryDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  searchSection: {
    marginBottom: 20,
  },
  itemDetailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedItemInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedItemDetail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  customItemSection: {
    marginBottom: 20,
  },
  customItemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  itemInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemInputField: {
    flex: 1,
    marginRight: 10,
  },
  itemTotalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  itemTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
});

export default InvoiceScreen;
