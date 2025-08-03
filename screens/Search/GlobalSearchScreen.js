import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
} from 'react-native';

const GlobalSearchScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recentSearches, setRecentSearches] = useState([
    'iPhone 15',
    'Rajesh Kumar',
    'January sales',
    'Invoice payment',
  ]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Auto focus search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 500);
  }, []);

  const categories = [
    { key: 'all', label: 'All', icon: '🔍' },
    { key: 'parties', label: 'Parties', icon: '👥' },
    { key: 'inventory', label: 'Items', icon: '📦' },
    { key: 'invoices', label: 'Invoices', icon: '📄' },
    { key: 'transactions', label: 'Transactions', icon: '💰' },
  ];

  const mockSearchResults = [
    {
      id: 1,
      type: 'party',
      title: 'Rajesh Kumar',
      subtitle: 'Customer • +91 98765 43210',
      details: 'Balance: ₹15,000 • 5 invoices',
      icon: '👤',
      relevance: 95,
    },
    {
      id: 2,
      type: 'item',
      title: 'Apple iPhone 15',
      subtitle: 'Smartphones • ₹79,999',
      details: 'Stock: 25 units • Low: 5 units',
      icon: '📱',
      relevance: 90,
    },
    {
      id: 3,
      type: 'invoice',
      title: 'Invoice #INV-2024-001',
      subtitle: 'Rajesh Kumar • ₹25,000',
      details: 'Due: Today • Status: Pending',
      icon: '📄',
      relevance: 85,
    },
    {
      id: 4,
      type: 'transaction',
      title: 'Sale Transaction',
      subtitle: 'Priya Sharma • ₹18,000',
      details: 'Jan 13, 2024 • Completed',
      icon: '💰',
      relevance: 80,
    },
  ];

  const quickSuggestions = [
    { icon: '📊', text: 'Monthly sales report', category: 'reports' },
    { icon: '⚠️', text: 'Low stock items', category: 'inventory' },
    { icon: '💸', text: 'Pending payments', category: 'transactions' },
    { icon: '📈', text: 'Top customers', category: 'parties' },
  ];

  const searchTips = [
    'Search by customer name or phone number',
    'Find items by name or category',
    'Look up invoices by number or amount',
    'Use keywords like "pending", "overdue", or "low stock"',
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      setLoading(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = mockSearchResults.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.details.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (selectedCategory !== 'all') {
          const categoryFiltered = filtered.filter(item => {
            switch (selectedCategory) {
              case 'parties': return item.type === 'party';
              case 'inventory': return item.type === 'item';
              case 'invoices': return item.type === 'invoice';
              case 'transactions': return item.type === 'transaction';
              default: return true;
            }
          });
          setSearchResults(categoryFiltered);
        } else {
          setSearchResults(filtered);
        }
        setLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0 && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 3)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.text);
    setSelectedCategory(suggestion.category);
  };

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category.key}
      style={[styles.categoryButton, selectedCategory === category.key && styles.activeCategoryButton]}
      onPress={() => setSelectedCategory(category.key)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[styles.categoryText, selectedCategory === category.key && styles.activeCategoryText]}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => navigation.goBack()}>
      <View style={styles.resultLeft}>
        <View style={styles.resultIcon}>
          <Text style={styles.resultIconText}>{item.icon}</Text>
        </View>
        <View style={styles.resultContent}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          <Text style={styles.resultDetails}>{item.details}</Text>
        </View>
      </View>
      <View style={styles.resultRight}>
        <View style={styles.relevanceScore}>
          <Text style={styles.relevanceText}>{item.relevance}%</Text>
        </View>
        <Text style={styles.resultArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentSearch = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.recentSearchItem}
      onPress={() => handleSearch(item)}
    >
      <Text style={styles.recentSearchIcon}>🕐</Text>
      <Text style={styles.recentSearchText}>{item}</Text>
      <TouchableOpacity
        onPress={() => setRecentSearches(recentSearches.filter((_, i) => i !== index))}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderQuickSuggestion = (suggestion, index) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionCard}
      onPress={() => selectSuggestion(suggestion)}
    >
      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
      <Text style={styles.suggestionText}>{suggestion.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search</Text>
          <TouchableOpacity onPress={() => setRecentSearches([])}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search parties, items, invoices..."
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {categories.map(renderCategory)}
            </View>
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {searchQuery.length > 0 ? (
            /* Search Results */
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  Search Results ({searchResults.length})
                </Text>
                <Text style={styles.resultsQuery}>for "{searchQuery}"</Text>
              </View>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyResults}>
                      <Text style={styles.emptyIcon}>🔍</Text>
                      <Text style={styles.emptyTitle}>No results found</Text>
                      <Text style={styles.emptyMessage}>
                        Try different keywords or check spelling
                      </Text>
                    </View>
                  }
                />
              )}
            </>
          ) : (
            /* No Search Query - Show Suggestions */
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <View style={styles.sectionCard}>
                    {recentSearches.map(renderRecentSearch)}
                  </View>
                </View>
              )}

              {/* Quick Suggestions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Suggestions</Text>
                <View style={styles.suggestionsGrid}>
                  {quickSuggestions.map(renderQuickSuggestion)}
                </View>
              </View>

              {/* Search Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Tips</Text>
                <View style={styles.sectionCard}>
                  {searchTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
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
  clearText: {
    fontSize: 14,
    color: '#64748b',
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: '#94a3b8',
    padding: 4,
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  scrollContent: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  resultsQuery: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 18,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  resultDetails: {
    fontSize: 12,
    color: '#94a3b8',
  },
  resultRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  relevanceScore: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  relevanceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  resultArrow: {
    fontSize: 20,
    color: '#cbd5e1',
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
  section: {
    marginBottom: 24,
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
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recentSearchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#64748b',
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  removeIcon: {
    fontSize: 12,
    color: '#94a3b8',
    padding: 4,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    width: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#3b82f6',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default GlobalSearchScreen;