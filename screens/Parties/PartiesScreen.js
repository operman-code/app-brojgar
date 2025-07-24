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
import PartiesService from './services/PartiesService';

const PartiesScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({});

  const [newParty, setNewParty] = useState({
    name: '',
    type: 'customer',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadParties();
    loadSummary();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, searchQuery]);

  const loadParties = async () => {
    try {
      setLoading(true);
      const data = await PartiesService.getAllParties(selectedTab === 'all' ? 'all' : selectedTab.slice(0, -1), searchQuery);
      setParties(data);
    } catch (error) {
      console.error('Error loading parties:', error);
      Alert.alert('Error', 'Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await PartiesService.getPartiesSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadParties(), loadSummary()]);
    setRefreshing(false);
  };

  const tabs = [
    { key: 'all', label: 'All Parties', count: summary.totalParties || 0 },
    { key: 'customers', label: 'Customers', count: summary.totalCustomers || 0 },
    { key: 'suppliers', label: 'Suppliers', count: summary.totalSuppliers || 0 },
  ];

  const getBalanceColor = (balance) => {
    if (balance > 0) return '#10b981';
    if (balance < 0) return '#ef4444';
    return '#64748b';
  };

  const addParty = async () => {
    try {
      const validation = PartiesService.validatePartyData(newParty);
      if (!validation.isValid) {
        Alert.alert('Validation Error', Object.values(validation.errors).join('\n'));
        return;
      }

      await PartiesService.createParty(newParty);
      setNewParty({ name: '', type: 'customer', phone: '', email: '', address: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Party added successfully!');
      loadParties();
      loadSummary();
    } catch (error) {
      console.error('Error adding party:', error);
      Alert.alert('Error', 'Failed to add party');
    }
  };

  const deleteParty = async (partyId, partyName) => {
    Alert.alert(
      'Delete Party',
      `Are you sure you want to delete ${partyName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PartiesService.deleteParty(partyId);
              Alert.alert('Success', 'Party deleted successfully');
              loadParties();
              loadSummary();
            } catch (error) {
              console.error('Error deleting party:', error);
              Alert.alert('Error', 'Failed to delete party');
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

  const renderParty = ({ item }) => (
    <TouchableOpacity style={styles.partyCard}>
      <View style={styles.partyHeader}>
        <View style={styles.partyAvatar}>
          <Text style={styles.partyAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={styles.partyType}>{item.type}</Text>
          <Text style={styles.partyPhone}>{item.phone}</Text>
        </View>
        <View style={styles.partyBalance}>
          <Text style={[styles.balanceAmount, { color: getBalanceColor(item.balance) }]}>
            ₹{Math.abs(item.balance).toLocaleString()}
          </Text>
          <Text style={styles.balanceLabel}>
            {item.balance > 0 ? 'You\'ll get' : item.balance < 0 ? 'You\'ll give' : 'No dues'}
          </Text>
        </View>
      </View>
      <View style={styles.partyActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryActionButton]} 
          onPress={() => navigation.navigate('Invoice')}
        >
          <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>📄 Invoice</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerActionButton]}
          onPress={() => deleteParty(item.id, item.name)}
        >
          <Text style={[styles.actionButtonText, styles.dangerActionButtonText]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Parties</Text>
            <Text style={styles.headerSubtitle}>
              {parties.length} total parties • ₹{(summary.totalOutstanding || 0).toLocaleString()} outstanding
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
              placeholder="Search parties..."
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

        {/* Parties List */}
        <FlatList
          data={parties}
          renderItem={renderParty}
          keyExtractor={(item) => item.id.toString()}
          style={styles.partiesList}
          contentContainerStyle={styles.partiesListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No parties found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery ? 'Try different search terms' : 'Add your first party to get started'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.emptyActionButtonText}>Add First Party</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </Animated.View>

      {/* Add Party Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Party</Text>
            <TouchableOpacity onPress={addParty}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Party Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newParty.name}
                onChangeText={(text) => setNewParty({...newParty, name: text})}
                placeholder="Enter party name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, newParty.type === 'customer' && styles.activeTypeButton]}
                  onPress={() => setNewParty({...newParty, type: 'customer'})}
                >
                  <Text style={[styles.typeButtonText, newParty.type === 'customer' && styles.activeTypeButtonText]}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newParty.type === 'supplier' && styles.activeTypeButton]}
                  onPress={() => setNewParty({...newParty, type: 'supplier'})}
                >
                  <Text style={[styles.typeButtonText, newParty.type === 'supplier' && styles.activeTypeButtonText]}>Supplier</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={newParty.phone}
                onChangeText={(text) => setNewParty({...newParty, phone: text})}
                placeholder="+91 99999 99999"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                value={newParty.email}
                onChangeText={(text) => setNewParty({...newParty, email: text})}
                placeholder="email@example.com"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newParty.address}
                onChangeText={(text) => setNewParty({...newParty, address: text})}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
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
  partiesList: {
    flex: 1,
  },
  partiesListContent: {
    padding: 20,
  },
  partyCard: {
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
  partyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partyAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  partyType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  partyPhone: {
    fontSize: 14,
    color: '#64748b',
  },
  partyBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  partyActions: {
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
  },
  activeTypeButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTypeButtonText: {
    color: '#ffffff',
  },
});

export default PartiesScreen;
