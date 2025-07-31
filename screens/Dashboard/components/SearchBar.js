// screens/Dashboard/components/SearchBar.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SearchBar = ({ 
  placeholder = "Search...",
  onSearch,
  onClear,
  suggestions = [],
  isLoading = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setSearchText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={isFocused ? ['#FFFFFF', '#F8FAFC'] : ['#F1F5F9', '#F8FAFC']}
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>⏳</Text>
          </View>
        )}
      </LinearGradient>

      {/* Suggestions */}
      {isFocused && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.suggestionsBackground}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSearch(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainerFocused: {
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsBackground: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#1E293B',
  },
});

export default SearchBar;
