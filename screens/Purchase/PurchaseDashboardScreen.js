import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import DatabaseService from '../../database/DatabaseService';

const PurchaseDashboardScreen = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ supplier: '', amount: '', date: '', description: '' });
  const [adding, setAdding] = useState(false);
  const [totals, setTotals] = useState({ count: 0, amount: 0 });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const result = await DatabaseService.executeQuery(
        `SELECT t.*, p.name as supplier_name FROM transactions t LEFT JOIN parties p ON t.party_id = p.id WHERE t.type = 'expense' AND t.deleted_at IS NULL ORDER BY t.date DESC`
      );
      setPurchases(result || []);
      // Calculate totals
      let count = result?.length || 0;
      let amount = result?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      setTotals({ count, amount });
    } catch (e) {
      setPurchases([]);
      setTotals({ count: 0, amount: 0 });
    }
    setLoading(false);
  };

  const handleAddPurchase = async () => {
    if (!form.supplier || !form.amount || !form.date) return;
    setAdding(true);
    try {
      // Find or create supplier
      let supplierId = null;
      const party = await DatabaseService.executeQuery(
        `SELECT id FROM parties WHERE name = ? AND type = 'supplier' AND deleted_at IS NULL LIMIT 1`,
        [form.supplier]
      );
      if (party && party[0]) {
        supplierId = party[0].id;
      } else {
        const insert = await DatabaseService.executeQuery(
          `INSERT INTO parties (name, type) VALUES (?, 'supplier')`,
          [form.supplier]
        );
        supplierId = insert?.insertId;
      }
      // Insert purchase transaction
      await DatabaseService.executeQuery(
        `INSERT INTO transactions (party_id, type, amount, date, description) VALUES (?, 'expense', ?, ?, ?)`,
        [supplierId, parseFloat(form.amount), form.date, form.description]
      );
      setForm({ supplier: '', amount: '', date: '', description: '' });
      setModalVisible(false);
      fetchPurchases();
    } catch (e) {
      // handle error
    }
    setAdding(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Purchase Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Add Purchase</Text>
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
              <Text style={styles.supplier}>{item.supplier_name || 'Unknown Supplier'}</Text>
              <Text style={styles.amount}>₹{item.amount}</Text>
              <Text style={styles.date}>{item.date}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No purchases found.</Text>}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Purchase</Text>
            <TextInput
              style={styles.input}
              placeholder="Supplier Name"
              value={form.supplier}
              onChangeText={t => setForm(f => ({ ...f, supplier: t }))}
            />
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
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddPurchase} disabled={adding}>
                <Text style={styles.saveButtonText}>{adding ? 'Saving...' : 'Save'}</Text>
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
  totals: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  totalText: { fontSize: 14, color: '#444' },
  purchaseItem: { backgroundColor: '#f8f8f8', marginHorizontal: 16, marginVertical: 6, padding: 12, borderRadius: 8 },
  supplier: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  amount: { fontSize: 15, color: '#111', marginTop: 2 },
  date: { fontSize: 13, color: '#666', marginTop: 2 },
  desc: { fontSize: 13, color: '#888', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelButton: { marginRight: 16 },
  cancelButtonText: { color: '#888' },
  saveButton: { backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default PurchaseDashboardScreen;