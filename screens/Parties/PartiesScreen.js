// screens/Parties/PartiesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Import services
import PartiesService from "./services/PartiesService";

const { width } = Dimensions.get('window');

const PartiesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    filterParties();
  }, [parties, searchQuery, selectedType]);

  const loadParties = async () => {
    try {
      setLoading(true);
      const data = await PartiesService.getAllParties();
      setParties(data);
    } catch (error) {
      console.error('❌ Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadParties();
    setRefreshing(false);
  };

  const filterParties = () => {
    let filtered = parties;

    if (selectedType !== "all") {
      filtered = filtered.filter(party => party.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        party.phone.includes(searchQuery) ||
        party.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredParties(filtered);
  };

  const handleDeleteParty = (partyId) => {
    Alert.alert(
      "Delete Party",
      "Are you sure you want to delete this party?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await PartiesService.deleteParty(partyId);
              await loadParties();
            } catch (error) {
              console.error('❌ Error deleting party:', error);
            }
          },
        },
      ]
    );
  };

  const renderPartyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.partyItem}
      onPress={() => navigation.navigate('PartyDetails', { partyId: item.id })}
    >
      <LinearGradient
        colors={item.type === 'customer' ? ['#10b981', '#059669'] : ['#f59e0b', '#d97706']}
        style={styles.partyGradient}
      >
        <View style={styles.partyHeader}>
          <View style={styles.partyInfo}>
            <Text style={styles.partyName}>{item.name}</Text>
            <View style={styles.partyType}>
              <Text style={styles.partyTypeText}>
                {item.type === 'customer' ? '👤 Customer' : '🏪 Supplier'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteParty(item.id)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.partyDetails}>
          {item.phone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📞</Text>
              <Text style={styles.detailText}>{item.phone}</Text>
            </View>
          )}
          {item.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📧</Text>
              <Text style={styles.detailText}>{item.email}</Text>
            </View>
          )}
          {item.address && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍</Text>
              <Text style={styles.detailText} numberOfLines={2}>{item.address}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#3b82f6" />
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingIcon}>👥</Text>
            <Text style={styles.loadingText}>Loading Parties...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#3b82f6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Parties</Text>
            <Text style={styles.headerSubtitle}>Manage customers & suppliers</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddParty')}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search parties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === "all" && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType("all")}
          >
            <Text style={[
              styles.filterText,
              selectedType === "all" && styles.filterTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === "customer" && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType("customer")}
          >
            <Text style={[
              styles.filterText,
              selectedType === "customer" && styles.filterTextActive
            ]}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === "supplier" && styles.filterButtonActive
            ]}
            onPress={() => setSelectedType("supplier")}
          >
            <Text style={[
              styles.filterText,
              selectedType === "supplier" && styles.filterTextActive
            ]}>Suppliers</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Parties List */}
      <FlatList
        data={filteredParties}
        renderItem={renderPartyItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No parties found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first party to get started'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 20,
  },
  partyItem: {
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  partyGradient: {
    borderRadius: 16,
    padding: 16,
  },
  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  partyType: {
    alignSelf: 'flex-start',
  },
  partyTypeText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
  partyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default PartiesScreen;
