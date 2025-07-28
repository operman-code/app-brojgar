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

  useEffect(() => {
    loadInvoiceData();
  }, []);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Generate invoice number
      const invoiceNumber = await InvoiceService.getNextInvoiceNumber();
      
      // Load parties and inventory
      const [partiesData, inventoryData] = await Promise.all([
        PartiesService.getCustomers(), // This gets customers only
        InventoryService.getAllItems()
      ]);

      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber
      }));
      
      setParties(partiesData || []);
      setInventory(inventoryData || []);
    } catch (error) {
      console.error('❌ Error loading invoice data:', error);
      Alert.alert("Error", "Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectParty = (party) => {
    setInvoiceData(prev => ({
      ...prev,
      partyId: party.id,
      partyName: party.name,
      partyDetails: party
    }));
    setShowPartyModal(false);
    setSearchPartyQuery("");
  };

  const handleSelectItem = () => {
    if (!selectedItem || !itemQuantity || !itemPrice) {
      Alert.alert("Error", "Please fill all item details");
      return;
    }

    const quantity = parseFloat(itemQuantity);
    const price = parseFloat(itemPrice);
    const total = quantity * price;
    const taxAmount = (total * invoiceData.taxRate) / 100;

    const newItem = {
      id: Date.now(), // Temporary ID for the invoice item
      itemId: selectedItem.id,
      itemName: selectedItem.item_name,
      quantity: quantity,
      rate: price,
      taxRate: invoiceData.taxRate,
      taxAmount: taxAmount,
      total: total + taxAmount
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    calculateTotals([...invoiceData.items, newItem]);
    
    setShowItemModal(false);
    setSelectedItem(null);
    setItemQuantity("1");
    setItemPrice("");
    setSearchItemQuery("");
  };

  const handleRemoveItem = (itemIndex) => {
    const updatedItems = invoiceData.items.filter((_, index) => index !== itemIndex);
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * invoiceData.taxRate) / 100;
    const total = subtotal + taxAmount - invoiceData.discountAmount;

    setInvoiceData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.partyId) {
      Alert.alert("Error", "Please select a customer");
      return;
    }

    if (invoiceData.items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    try {
      setSaving(true);
      
      const invoicePayload = {
        invoice_number: invoiceData.invoiceNumber,
        party_id: invoiceData.partyId,
        date: invoiceData.date,
        due_date: invoiceData.dueDate || null,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.taxAmount,
        discount_amount: invoiceData.discountAmount,
        total: invoiceData.total,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        items: invoiceData.items.map(item => ({
          item_id: item.itemId,
          item_name: item.itemName,
          quantity: item.quantity,
          rate: item.rate,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount,
          total: item.total
        }))
      };

      await InvoiceService.createInvoice(invoicePayload);
      
      Alert.alert(
        "Success", 
        "Invoice created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              loadInvoiceData();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      Alert.alert("Error", "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const getFilteredParties = () => {
    if (!searchPartyQuery.trim()) return parties;
    return parties.filter(party => 
      party.name.toLowerCase().includes(searchPartyQuery.toLowerCase()) ||
      (party.phone && party.phone.includes(searchPartyQuery))
    );
  };

  const getFilteredInventory = () => {
    if (!searchItemQuery.trim()) return inventory;
    return inventory.filter(item => 
      item.item_name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
      (item.item_code && item.item_code.toLowerCase().includes(searchItemQuery.toLowerCase()))
    );
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Invoice</Text>
        <TouchableOpacity onPress={handleSaveInvoice} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Invoice Number</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={invoiceData.invoiceNumber}
                editable={false}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={invoiceData.date}
                onChangeText={(text) => setInvoiceData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TextInput
              style={styles.input}
              value={invoiceData.dueDate}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, dueDate: text }))}
              placeholder="YYYY-MM-DD (Optional)"
            />
          </View>
        </View>

        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowPartyModal(true)}
          >
            <Text style={invoiceData.partyName ? styles.selectedText : styles.placeholderText}>
              {invoiceData.partyName || 'Select Customer'}
            </Text>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>

          {invoiceData.partyDetails.name && (
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{invoiceData.partyDetails.name}</Text>
              {invoiceData.partyDetails.phone && (
                <Text style={styles.customerInfo}>📞 {invoiceData.partyDetails.phone}</Text>
              )}
              {invoiceData.partyDetails.email && (
                <Text style={styles.customerInfo}>📧 {invoiceData.partyDetails.email}</Text>
              )}
            </View>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowItemModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {invoiceData.items.length > 0 ? (
            <View style={styles.itemsList}>
              {invoiceData.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(index)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemDetail}>Rate: ₹{item.rate}</Text>
                    <Text style={styles.itemDetail}>Total: ₹{item.total.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsText}>No items added yet</Text>
            </View>
          )}
        </View>

        {/* Totals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{invoiceData.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoiceData.taxRate}%):</Text>
            <Text style={styles.totalValue}>₹{invoiceData.taxAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <TextInput
              style={styles.discountInput}
              value={invoiceData.discountAmount.toString()}
              onChangeText={(text) => {
                const discount = parseFloat(text) || 0;
                setInvoiceData(prev => ({ ...prev, discountAmount: discount }));
                calculateTotals(invoiceData.items);
              }}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>₹{invoiceData.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={invoiceData.notes}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, notes: text }))}
              placeholder="Enter any additional notes"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Terms & Conditions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={invoiceData.terms}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, terms: text }))}
              placeholder="Enter terms and conditions"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Party Selection Modal */}
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
            <View />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              value={searchPartyQuery}
              onChangeText={setSearchPartyQuery}
            />
          </View>

          <FlatList
            data={getFilteredParties()}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelectParty(item)}
              >
                <Text style={styles.modalItemName}>{item.name}</Text>
                {item.phone && (
                  <Text style={styles.modalItemDetail}>📞 {item.phone}</Text>
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No customers found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Item Selection Modal */}
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
            <TouchableOpacity onPress={handleSelectItem}>
              <Text style={styles.modalSaveText}>Add</Text>
            </TouchableOpacity>
          </View>

          {!selectedItem ? (
            <>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search items..."
                  value={searchItemQuery}
                  onChangeText={setSearchItemQuery}
                />
              </View>

              <FlatList
                data={getFilteredInventory()}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedItem(item);
                      setItemPrice(item.selling_price?.toString() || "");
                    }}
                  >
                    <Text style={styles.modalItemName}>{item.item_name}</Text>
                    <Text style={styles.modalItemDetail}>
                      Stock: {item.stock_quantity} | Price: ₹{item.selling_price}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListText}>No items found</Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.itemForm}>
              <Text style={styles.selectedItemName}>{selectedItem.item_name}</Text>
              
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.changeItemButton}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.changeItemButtonText}>Change Item</Text>
              </TouchableOpacity>
            </View>
          )}
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
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  selectedText: {
    fontSize: 16,
    color: '#1E293B',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  selectArrow: {
    fontSize: 20,
    color: '#6B7280',
  },
  customerDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
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
    fontSize: 14,
  },
  itemsList: {
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetail: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyItems: {
    padding: 32,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 16,
    color: '#1E293B',
    width: 80,
    textAlign: 'right',
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    paddingTop: 12,
    marginTop: 8,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalItemDetail: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  itemForm: {
    padding: 20,
  },
  selectedItemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  changeItemButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeItemButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
});

export default InvoiceScreen;
