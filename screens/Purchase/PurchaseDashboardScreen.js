import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import DatabaseService from '../../database/DatabaseService';

const PurchaseDashboardScreen = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [form, setForm] = useState({ supplier: '', amount: '', date: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [totals, setTotals] = useState({ count: 0, amount: 0 });
  const [suppliers, setSuppliers] = useState([]);
  const [supplierModal, setSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', email: '' });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const result = await DatabaseService.executeQuery(
        `SELECT t.*, p.name as supplier_name FROM transactions t LEFT JOIN parties p ON t.party_id = p.id WHERE t.type = 'expense' AND t.deleted_at IS NULL ORDER BY t.date DESC`
      );
      setPurchases(result || []);
      let count = result?.length || 0;
      let amount = result?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      setTotals({ count, amount });
    } catch (e) {
      setPurchases([]);
      setTotals({ count: 0, amount: 0 });
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    setSupplierLoading(true);
    try {
      const result = await DatabaseService.executeQuery(
        `SELECT * FROM parties WHERE type = 'supplier' AND deleted_at IS NULL ORDER BY name ASC`
      );
      setSuppliers(result || []);
    } catch (e) {
      setSuppliers([]);
    }
    setSupplierLoading(false);
  };

  const handleAddOrEditPurchase = async () => {
    if (!form.supplier || !form.amount || !form.date) return;
    setAdding(true);
    try {
      // Find or create supplier
      let supplierId = null;
      const party = suppliers.find(s => s.name === form.supplier);
      if (party) {
        supplierId = party.id;
      } else {
        const insert = await DatabaseService.executeQuery(
          `INSERT INTO parties (name, type) VALUES (?, 'supplier')`,
          [form.supplier]
        );
        supplierId = insert?.insertId;
        fetchSuppliers();
      }
      if (editMode && editingPurchase) {
        await DatabaseService.executeQuery(
          `UPDATE transactions SET party_id = ?, amount = ?, date = ?, description = ? WHERE id = ?`,
          [supplierId, parseFloat(form.amount), form.date, form.description, editingPurchase.id]
        );
      } else {
        await DatabaseService.executeQuery(
          `INSERT INTO transactions (party_id, type, amount, date, description) VALUES (?, 'expense', ?, ?, ?)`,
          [supplierId, parseFloat(form.amount), form.date, form.description]
        );
      }
      setForm({ supplier: '', amount: '', date: '', description: '' });
      setModalVisible(false);
      setEditMode(false);
      setEditingPurchase(null);
      fetchPurchases();
    } catch (e) {}
    setAdding(false);
  };

  const handleEditPurchase = (purchase) => {
    setForm({
      supplier: purchase.supplier_name || '',
      amount: String(purchase.amount),
      date: purchase.date,
      description: purchase.description || ''
    });
    setEditMode(true);
    setEditingPurchase(purchase);
    setModalVisible(true);
  };

  const handleDeletePurchase = (purchase) => {
    Alert.alert('Delete Purchase', 'Are you sure you want to delete this purchase?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await DatabaseService.executeQuery(`UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [purchase.id]);
        fetchPurchases();
      }}
    ]);
  };

  // Supplier management
  const handleAddOrEditSupplier = async () => {
    if (!supplierForm.name) return;
    setSupplierLoading(true);
    try {
      if (editingSupplier) {
        await DatabaseService.executeQuery(
          `UPDATE parties SET name = ?, phone = ?, email = ? WHERE id = ?`,
          [supplierForm.name, supplierForm.phone, supplierForm.email, editingSupplier.id]
        );
      } else {
        await DatabaseService.executeQuery(
          `INSERT INTO parties (name, phone, email, type) VALUES (?, ?, ?, 'supplier')`,
          [supplierForm.name, supplierForm.phone, supplierForm.email]
        );
      }
      setSupplierForm({ name: '', phone: '', email: '' });
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (e) {}
    setSupplierLoading(false);
  };

  const handleEditSupplier = (supplier) => {
    setSupplierForm({ name: supplier.name, phone: supplier.phone || '', email: supplier.email || '' });
    setEditingSupplier(supplier);
  };

  const handleDeleteSupplier = (supplier) => {
    Alert.alert('Delete Supplier', 'Are you sure you want to delete this supplier?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await DatabaseService.executeQuery(`UPDATE parties SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [supplier.id]);
        fetchSuppliers();
      }}
    ]);
  };

  // Supplier autocomplete
  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(form.supplier.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Purchase Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => { setModalVisible(true); setEditMode(false); setForm({ supplier: '', amount: '', date: '', description: '' }); }}>
          <Text style={styles.addButtonText}>+ Add Purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supplierButton} onPress={() => setSupplierModal(true)}>
          <Text style={styles.supplierButtonText}>Manage Suppliers</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totals}>
        <Text style={styles.totalText}>Total Purchases: {totals.count}</Text>
        <Text style={styles.totalText}>Total Amount: ₹{totals.amount.toLocaleString('en-IN')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.purchaseItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.supplier}>{item.supplier_name || 'Unknown Supplier'}</Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.date}>{item.date}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEditPurchase(item)} style={styles.actionBtn}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePurchase(item)} style={styles.actionBtn}><Text style={[styles.actionText, { color: '#c00' }]}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No purchases found.</Text>}
        />
      )}
      {/* Add/Edit Purchase Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? 'Edit Purchase' : 'Add Purchase'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Supplier Name"
              value={form.supplier}
              onChangeText={t => setForm(f => ({ ...f, supplier: t }))}
              autoCapitalize="words"
            />
            {/* Autocomplete dropdown */}
            {form.supplier.length > 0 && filteredSuppliers.length > 0 && (
              <View style={styles.autocompleteList}>
                {filteredSuppliers.slice(0, 5).map(s => (
                  <TouchableOpacity key={s.id} onPress={() => setForm(f => ({ ...f, supplier: s.name }))}>
                    <Text style={styles.autocompleteItem}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={t => setForm(f => ({ ...f, amount: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={form.date}
              onChangeText={t => setForm(f => ({ ...f, date: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={form.description}
              onChangeText={t => setForm(f => ({ ...f, description: t }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); setEditMode(false); setEditingPurchase(null); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddOrEditPurchase} disabled={adding}>
                <Text style={styles.saveButtonText}>{adding ? 'Saving...' : (editMode ? 'Update' : 'Save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Supplier Management Modal */}
      <Modal visible={supplierModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.supplierModalContent}>
            <Text style={styles.modalTitle}>Manage Suppliers</Text>
            <TextInput
              style={styles.input}
              placeholder="Search Supplier"
              value={supplierSearch}
              onChangeText={setSupplierSearch}
            />
            <FlatList
              data={suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.supplierRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.supplierName}>{item.name}</Text>
                    {item.phone ? <Text style={styles.supplierInfo}>{item.phone}</Text> : null}
                    {item.email ? <Text style={styles.supplierInfo}>{item.email}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleEditSupplier(item)} style={styles.actionBtn}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSupplier(item)} style={styles.actionBtn}><Text style={[styles.actionText, { color: '#c00' }]}>Delete</Text></TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No suppliers found.</Text>}
              style={{ maxHeight: 200 }}
            />
            <Text style={[styles.modalTitle, { marginTop: 16 }]}>Add/Edit Supplier</Text>
            <TextInput
              style={styles.input}
              placeholder="Supplier Name"
              value={supplierForm.name}
              onChangeText={t => setSupplierForm(f => ({ ...f, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={supplierForm.phone}
              onChangeText={t => setSupplierForm(f => ({ ...f, phone: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={supplierForm.email}
              onChangeText={t => setSupplierForm(f => ({ ...f, email: t }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setSupplierForm({ name: '', phone: '', email: '' }); setEditingSupplier(null); setSupplierModal(false); }}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddOrEditSupplier} disabled={supplierLoading}>
                <Text style={styles.saveButtonText}>{supplierLoading ? 'Saving...' : (editingSupplier ? 'Update' : 'Add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: { backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  supplierButton: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  supplierButtonText: { color: '#222', fontWeight: 'bold' },
  totals: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  totalText: { fontSize: 14, color: '#444' },
  purchaseItem: { backgroundColor: '#f8f8f8', marginHorizontal: 16, marginVertical: 6, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  supplier: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  amount: { fontSize: 15, color: '#111', marginTop: 2 },
  date: { fontSize: 13, color: '#666', marginTop: 2 },
  desc: { fontSize: 13, color: '#888', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  actionBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { color: '#222', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelButton: { marginRight: 16 },
  cancelButtonText: { color: '#888' },
  saveButton: { backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  autocompleteList: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, maxHeight: 120 },
  autocompleteItem: { padding: 8, fontSize: 14, color: '#222' },
  supplierModalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%' },
  supplierRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  supplierName: { fontWeight: 'bold', fontSize: 15, color: '#222' },
  supplierInfo: { fontSize: 13, color: '#666' },
});

export default PurchaseDashboardScreen;