import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const BUSINESS_TYPES = [
  { key: 'retail', label: '🛍️ Retail Store' },
  { key: 'wholesale', label: '📦 Wholesale Business' },
  { key: 'service', label: '🔧 Service Provider' },
  { key: 'manufacturing', label: '🏭 Manufacturing' },
  { key: 'restaurant', label: '🍽️ Restaurant/Food' },
  { key: 'other', label: '💼 Other Business' },
];

const SignUpScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { register, googleAuth, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'retail',
    businessPhone: '',
    businessAddress: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBusinessTypePicker, setShowBusinessTypePicker] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Business name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        businessType: formData.businessType,
        businessPhone: formData.businessPhone.trim(),
        businessAddress: formData.businessAddress.trim(),
      };

      const result = await register(userData);
      
      if (result.success) {
        Alert.alert(
          'Welcome to Brojgar!',
          'Your account has been created successfully. You can now start managing your business.',
          [{ text: 'Get Started', onPress: () => console.log('Registration successful') }]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          result.message || 'Unable to create account. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    try {
      Alert.alert(
        'Google Sign-Up',
        'Google authentication will be implemented in the next step. For now, please use the registration form.',
        [{ text: 'OK' }]
      );
      // TODO: Implement Google OAuth
    } catch (error) {
      console.error('Google sign up error:', error);
      Alert.alert('Error', 'Google sign-up failed. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBusinessTypeSelect = (businessType) => {
    handleInputChange('businessType', businessType);
    setShowBusinessTypePicker(false);
  };

  const getBusinessTypeLabel = () => {
    const type = BUSINESS_TYPES.find(t => t.key === formData.businessType);
    return type ? type.label : 'Select Business Type';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar === 'dark' ? 'dark-content' : 'light-content'} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Logo and Welcome Text */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              style={styles.logoContainer}
            >
              <Text style={styles.logoText}>B</Text>
            </LinearGradient>
            
            <Text style={[styles.title, { color: theme.text }]}>
              Join Brojgar
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Create your business account
            </Text>
          </View>

          {/* Sign Up Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: errors.name ? '#EF4444' : theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textLight}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: errors.email ? '#EF4444' : theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textLight}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: errors.password ? '#EF4444' : theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textLight}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: errors.confirmPassword ? '#EF4444' : theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Business Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Business Name</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: errors.businessName ? '#EF4444' : theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>🏢</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your business name"
                  placeholderTextColor={theme.textLight}
                  value={formData.businessName}
                  onChangeText={(value) => handleInputChange('businessName', value)}
                  autoCapitalize="words"
                />
              </View>
              {errors.businessName && (
                <Text style={styles.errorText}>{errors.businessName}</Text>
              )}
            </View>

            {/* Business Type Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Business Type</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  { 
                    borderColor: theme.border,
                    backgroundColor: theme.surface 
                  }
                ]}
                onPress={() => setShowBusinessTypePicker(true)}
              >
                <Text style={styles.inputIcon}>🏪</Text>
                <Text style={[styles.pickerText, { color: theme.text }]}>
                  {getBusinessTypeLabel()}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Business Phone Input (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Business Phone (Optional)</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter business phone"
                  placeholderTextColor={theme.textLight}
                  value={formData.businessPhone}
                  onChangeText={(value) => handleInputChange('businessPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Business Address Input (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Business Address (Optional)</Text>
              <View style={[
                styles.inputContainer,
                { 
                  borderColor: theme.border,
                  backgroundColor: theme.surface 
                }
              ]}>
                <Text style={styles.inputIcon}>📍</Text>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter business address"
                  placeholderTextColor={theme.textLight}
                  value={formData.businessAddress}
                  onChangeText={(value) => handleInputChange('businessAddress', value)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                { opacity: isSubmitting ? 0.7 : 1 }
              ]}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.signUpButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textLight }]}>
                or continue with
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={handleGoogleSignUp}
            >
              <Text style={styles.googleIcon}>🌐</Text>
              <Text style={[styles.googleButtonText, { color: theme.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={[styles.signInLink, { color: theme.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Business Type Picker Modal */}
      <Modal
        visible={showBusinessTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBusinessTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Business Type
              </Text>
              <TouchableOpacity 
                onPress={() => setShowBusinessTypePicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              {BUSINESS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.businessTypeOption,
                    { 
                      backgroundColor: formData.businessType === type.key ? theme.primaryLight : 'transparent',
                      borderBottomColor: theme.border 
                    }
                  ]}
                  onPress={() => handleBusinessTypeSelect(type.key)}
                >
                  <Text style={[styles.businessTypeText, { color: theme.text }]}>
                    {type.label}
                  </Text>
                  {formData.businessType === type.key && (
                    <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 56,
    textAlignVertical: 'center',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    height: 56,
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
  },
  signInLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#64748B',
  },
  businessTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  businessTypeText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;