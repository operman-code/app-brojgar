# Components

This directory contains reusable UI components for the Brojgar app.

## CalendarPicker

A reusable calendar picker component that provides a user-friendly way to select dates.

### Features

- **Cross-platform support**: iOS modal picker, Android native picker
- **Customizable styling**: Accepts custom styles and themes
- **Date validation**: Minimum and maximum date constraints
- **Clear functionality**: Optional clear button to reset date
- **Formatted display**: Shows dates in DD/MM/YYYY format
- **Accessibility**: Proper touch targets and visual feedback

### Usage

```javascript
import CalendarPicker from '../components/CalendarPicker';

// Basic usage
<CalendarPicker
  value={selectedDate}
  onDateChange={(date) => setSelectedDate(date)}
  placeholder="Select Date"
/>

// Advanced usage with validation and clear button
<CalendarPicker
  value={dueDate}
  onDateChange={(date) => setDueDate(date)}
  placeholder="Select Due Date"
  minimumDate={new Date(invoiceDate)}
  showClearButton={true}
  onClear={() => setDueDate("")}
  style={customStyles}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | - | Current date value in YYYY-MM-DD format |
| `onDateChange` | function | - | Callback when date is selected |
| `placeholder` | string | "Select Date" | Placeholder text when no date is selected |
| `style` | object | - | Additional styles for the input container |
| `disabled` | boolean | false | Whether the picker is disabled |
| `minimumDate` | Date | null | Minimum selectable date |
| `maximumDate` | Date | null | Maximum selectable date |
| `mode` | string | 'date' | Picker mode ('date', 'time', 'datetime') |
| `showClearButton` | boolean | false | Whether to show clear button |
| `onClear` | function | - | Callback when clear button is pressed |

### Platform Differences

- **iOS**: Shows a modal picker with Cancel/Done buttons
- **Android**: Shows the native date picker dialog

### Styling

The component uses a consistent design that matches the app's theme:

- Border radius: 8px
- Padding: 12px horizontal, 12px vertical
- Background: White
- Border: Light gray (#ddd)
- Text color: Dark gray (#333)
- Placeholder color: Light gray (#999)

### Integration

The CalendarPicker is currently integrated in:

1. **InvoiceScreen**: Date and Due Date fields
2. **Future screens**: Can be easily added to other forms

### Example Implementation

```javascript
// In InvoiceScreen.js
<View style={[styles.inputGroup, styles.halfWidth]}>
  <Text style={styles.inputLabel}>Date</Text>
  <CalendarPicker
    value={invoiceData.date}
    onDateChange={(date) => setInvoiceData(prev => ({ ...prev, date: date }))}
    placeholder="Select Date"
    style={styles.input}
  />
</View>

<View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>Due Date</Text>
  <CalendarPicker
    value={invoiceData.dueDate}
    onDateChange={(date) => setInvoiceData(prev => ({ ...prev, dueDate: date }))}
    placeholder="Select Due Date (Optional)"
    style={styles.input}
    minimumDate={new Date(invoiceData.date)}
    showClearButton={true}
    onClear={() => setInvoiceData(prev => ({ ...prev, dueDate: "" }))}
  />
</View>
```