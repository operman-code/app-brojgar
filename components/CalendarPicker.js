import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

/**
 * CalendarPicker Component
 * 
 * A reusable calendar picker component that provides a user-friendly way to select dates.
 * Features:
 * - Cross-platform support (iOS modal, Android native picker)
 * - Customizable styling and placeholder text
 * - Optional clear button functionality
 * - Date validation with minimum/maximum date constraints
 * - Formatted date display (DD/MM/YYYY)
 * 
 * @param {string} value - Current date value in YYYY-MM-DD format
 * @param {function} onDateChange - Callback when date is selected
 * @param {string} placeholder - Placeholder text when no date is selected
 * @param {object} style - Additional styles for the input container
 * @param {boolean} disabled - Whether the picker is disabled
 * @param {Date} minimumDate - Minimum selectable date
 * @param {Date} maximumDate - Maximum selectable date
 * @param {string} mode - Picker mode ('date', 'time', 'datetime')
 * @param {boolean} showClearButton - Whether to show clear button
 * @param {function} onClear - Callback when clear button is pressed
 */

const CalendarPicker = ({ 
  value, 
  onDateChange, 
  placeholder = "Select Date",
  style,
  disabled = false,
  minimumDate = null,
  maximumDate = null,
  mode = 'date',
  showClearButton = false,
  onClear = null
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onDateChange(selectedDate.toISOString().split('T')[0]);
      }
    } else {
      // iOS - update temp date for preview
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    onDateChange(tempDate.toISOString().split('T')[0]);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempDate(value ? new Date(value) : new Date());
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const showDatePicker = () => {
    if (disabled) return;
    setTempDate(value ? new Date(value) : new Date());
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateInput, style, disabled && styles.disabled]}
        onPress={showDatePicker}
        disabled={disabled}
      >
        <Text style={[
          styles.dateText,
          !value && styles.placeholderText
        ]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <View style={styles.iconContainer}>
          {showClearButton && value && (
            <TouchableOpacity
              onPress={() => onClear && onClear()}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.calendarIcon}>📅</Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarIcon: {
    fontSize: 18,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  picker: {
    height: 200,
  },
});

export default CalendarPicker;