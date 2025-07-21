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
    total: 0,
    notes: "",
    termsConditions: "Payment due within 30 days",
  });

  const [parties, setParties] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [searchPartyQuery, setSearchPartyQuery] = useState("");
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDiscount, setItemDiscount] = useState("0");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [invoiceData.items, invoiceData.taxRate]);

  const loadInitialData = async () => {
    try {
      // Get next invoice number
      const nextInvoiceNumber = await InvoiceService.getNextInvoiceNumber();
      
      // Load parties and inventory
      const partiesData = await PartiesService.getAllParties();
      const inventoryData = await InventoryService.getAllItems();
      
      // Set due date to 30 days from today
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: nextInvoiceNumber,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
      
      setParties(partiesData.filter(party => party.type === 'customer'));
      setInventory(inventoryData);
    } catch (error) {
      Alert.alert("Error", "Failed to load initial data");
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.price) - item.discount;
      return sum + itemTotal;
    }, 0);
    
    const taxAmount = (subtotal * invoiceData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setInvoiceData(prev => ({
      ...prev,
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total
    }));
  };

  const handlePartySelect = (party) => {
    setInvoiceData(prev => ({
      ...prev,
      partyId: party.id,
      partyName: party.name,
      partyDetails: party
    }));
    setShowPartyModal(false);
  };

  const handleAddItem = () => {
    if (!selectedItem || !itemQuantity || !itemPrice) {
      Alert.alert("Error", "Please fill all item details");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      itemId: selectedItem.id,
      name: selectedItem.name,
      description: selectedItem.description || "",
      quantity: parseFloat(itemQuantity),
      price: parseFloat(itemPrice),
      discount: parseFloat(itemDiscount) || 0,
      unit: selectedItem.unit || "pcs",
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset form
    setSelectedItem(null);
    setItemQuantity("1");
    setItemPrice("");
    setItemDiscount("0");
    setShowItemModal(false);
  };

  const handleRemoveItem = (itemId) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setItemPrice(item.price?.toString() || "");
  };

  const handleGenerateBill = async () => {
    if (!invoiceData.partyId) {
      Alert.alert("Error", "Please select a party");
      return;
    }

    if (invoiceData.items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    try {
      // Save invoice
      const savedInvoice = await InvoiceService.createInvoice(invoiceData);
      
      // Navigate to invoice template
      navigation.navigate("InvoiceTemplate", { 
        invoiceData: savedInvoice 
      });
    } catch (error) {
      Alert.alert("Error", "Failed to create invoice");
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchPartyQuery.toLowerCase()) ||
    party.phone.includes(searchPartyQuery)
  );

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchItemQuery.toLowerCase())
  );

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handlePartySelect(item)}
    >
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemName}>{item.name}</Text>
        <Text style={styles.modalItemDetails}>{item.phone}</Text>
        <Text style={styles.modalItemDetails}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        selectedItem?.id === item.id && styles.selectedModalItem
      ]}
      onPress={() => handleItemSelect(item)}
    >
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemName}>{item.name}</Text>
        <Text style={styles.modalItemDetails}>SKU: {item.sku}</Text>
        <Text style={styles.modalItemDetails}>Price: ₹{item.price}</Text>
        <Text style={styles.modalItemDetails}>Stock: {item.stock} {item.unit}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderInvoiceItem = ({ item, index }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemNumber}>{index + 1}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemCalculation}>
        <Text style={styles.calculationText}>
          {item.quantity} {item.unit} × ₹{item.price} = ₹{(item.quantity * item.price).toFixed(2)}
        </Text>
        {item.discount > 0 && (
          <Text style={styles.discountText}>
            Discount: -₹{item.discount.toFixed(2)}
          </Text>
        )}
        <Text style={styles.itemTotal}>
          Total: ₹{((item.quantity * item.price) - item.discount).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Invoice</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Invoice Details</Text>
          
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceNumberContainer}>
              <Text style={styles.invoiceLabel}>Invoice #</Text>
              <TextInput
                style={styles.invoiceNumberInput}
                value={invoiceData.invoiceNumber}
                onChangeText={(text) => setInvoiceData(prev => ({ ...prev, invoiceNumber: text }))}
                placeholder="INV-001"
              />
            </View>
            
            <View style={styles.dateContainer}>
              <View style={styles.dateGroup}>
                <Text style={styles.dateLabel}>Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={invoiceData.date}
                  onChangeText={(text) => setInvoiceData(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              <View style={styles.dateGroup}>
                <Text style={styles.dateLabel}>Due Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={invoiceData.dueDate}
                  onChangeText={(text) => setInvoiceData(prev => ({ ...prev, dueDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Party Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Bill To</Text>
          
          <TouchableOpacity
            style={styles.partySelector}
            onPress={() => setShowPartyModal(true)}
          >
            {invoiceData.partyName ? (
              <View style={styles.selectedParty}>
                <Text style={styles.selectedPartyName}>{invoiceData.partyName}</Text>
                <Text style={styles.selectedPartyDetails}>
                  {invoiceData.partyDetails.phone}
                </Text>
                <Text style={styles.selectedPartyDetails}>
                  {invoiceData.partyDetails.email}
                </Text>
              </View>
            ) : (
              <Text style={styles.partySelectorPlaceholder}>
                Select Customer/Party
              </Text>
            )}
            <Text style={styles.partySelectorArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📦 Items</Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setShowItemModal(true)}
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
              style={styles.itemsList}
            />
          ) : (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyItemsIcon}>📦</Text>
              <Text style={styles.emptyItemsText}>No items added yet</Text>
              <Text style={styles.emptyItemsSubtext}>
                Tap "Add Item" to start building your invoice
              </Text>
            </View>
          )}
        </View>

        {/* Tax and Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Calculation</Text>
          
          <View style={styles.calculationContainer}>
            <View style={styles.taxRateContainer}>
              <Text style={styles.taxLabel}>Tax Rate (%)</Text>
              <TextInput
                style={styles.taxInput}
                value={invoiceData.taxRate.toString()}
                onChangeText={(text) => {
                  const rate = parseFloat(text) || 0;
                  setInvoiceData(prev => ({ ...prev, taxRate: rate }));
                }}
                keyboardType="numeric"
                placeholder="18"
              />
            </View>
            
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>₹{invoiceData.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoiceData.taxRate}%):</Text>
                <Text style={styles.totalValue}>₹{invoiceData.taxAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>₹{invoiceData.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes and Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Additional Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={invoiceData.notes}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, notes: text }))}
              placeholder="Additional notes for this invoice..."
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Terms & Conditions</Text>
            <TextInput
              style={styles.notesInput}
              value={invoiceData.termsConditions}
              onChangeText={(text) => setInvoiceData(prev => ({ ...prev, termsConditions: text }))}
              placeholder="Payment terms and conditions..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Generate Bill Button */}
      <View style={styles.generateButtonContainer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateBill}
        >
          <Text style={styles.generateButtonText}>Generate Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Party Selection Modal */}
      <Modal
        visible={showPartyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPartyModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <View style={styles.modalHeaderRight} />
          </View>
          
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search customers..."
              value={searchPartyQuery}
              onChangeText={setSearchPartyQuery}
            />
          </View>
          
          <FlatList
            data={filteredParties}
            renderItem={renderPartyItem}
            keyExtractor={(item) => item.id}
            style={styles.modalList}
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
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowItemModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={handleAddItem}
            >
              <Text style={styles.modalAddText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalSearchContainer}>
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search items..."
              value={searchItemQuery}
              onChangeText={setSearchItemQuery}
            />
          </View>
          
          <FlatList
            data={filteredInventory}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            style={styles.modalList}
          />
          
          {selectedItem && (
            <View style={styles.itemFormContainer}>
              <Text style={styles.itemFormTitle}>Item Details</Text>
              <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
              
              <View style={styles.itemFormRow}>
                <View style={styles.itemFormGroup}>
                  <Text style={styles.itemFormLabel}>Quantity</Text>
                  <TextInput
                    style={styles.itemFormInput}
                    value={itemQuantity}
                    onChangeText={setItemQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </View>
                
                <View style={styles.itemFormGroup}>
                  <Text style={styles.itemFormLabel}>Price</Text>
                  <TextInput
                    style={styles.itemFormInput}
                    value={itemPrice}
                    onChangeText={setItemPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                
                <View style={styles.itemFormGroup}>
                  <Text style={styles.itemFormLabel}>Discount</Text>
                  <TextInput
                    style={styles.itemFormInput}
                    value={itemDiscount}
                    onChangeText={setItemDiscount}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>
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
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  invoiceHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  invoiceNumberContainer: {
    marginBottom: 16,
  },
  invoiceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  invoiceNumberInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  dateContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  partySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedParty: {
    flex: 1,
  },
  selectedPartyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  selectedPartyDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  partySelectorPlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  partySelectorArrow: {
    fontSize: 20,
    color: "#9ca3af",
  },
  addItemButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addItemButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  itemsList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyItems: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  emptyItemsIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  invoiceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
  itemCalculation: {
    paddingLeft: 36,
  },
  calculationText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  discountText: {
    fontSize: 14,
    color: "#ef4444",
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  calculationContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  taxRateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  taxLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  taxInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    width: 80,
    textAlign: "center",
  },
  totalsContainer: {
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#374151",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  grandTotalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 80,
  },
  generateButtonContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  generateButton: {
    backgroundColor: "#059669",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
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
    padding: 4,
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
  modalHeaderRight: {
    width: 60,
  },
  modalAddButton: {
    padding: 4,
  },
  modalAddText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  modalSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalSearchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedModalItem: {
    backgroundColor: "#eff6ff",
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalItemDetails: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  itemFormContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  itemFormTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  selectedItemName: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  itemFormRow: {
    flexDirection: "row",
    gap: 12,
  },
  itemFormGroup: {
    flex: 1,
  },
  itemFormLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  itemFormInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
});

export default InvoiceScreen;
