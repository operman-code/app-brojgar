import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView, 
  Switch 
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import GoogleDriveService from './services/GoogleDriveService';

// Configure WebBrowser for Google Auth
WebBrowser.maybeCompleteAuthSession();

const BackupRestoreScreen = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backupFiles, setBackupFiles] = useState([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState(null);

  // Google Auth Hook - Simple setup for Expo Go
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: '867567815082-er802upj96nl591jur5slssshb11kng8.apps.googleusercontent.com', // ← Just one client ID
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  redirectUri: 'https://auth.expo.io/@operman-code/brojgar'
});

  useEffect(() => {
    loadInitialState();
  }, []);

  // Handle Google Auth Response
  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const loadInitialState = async () => {
    await GoogleDriveService.loadBackupSettings();
    checkAuthentication();
  };

  const checkAuthentication = () => {
    const authenticated = GoogleDriveService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const backupStatus = GoogleDriveService.getAutoBackupStatus();
      setAutoBackupEnabled(backupStatus.enabled);
      setLastBackupDate(backupStatus.lastBackup);
      loadBackupFiles();
    }
  };

  const handleAuthSuccess = async (accessToken) => {
    try {
      // Set the access token in the service
      GoogleDriveService.setAccessToken(accessToken);
      
      // Get user info
      const userInfo = await GoogleDriveService.getUserInfo();
      GoogleDriveService.setUserEmail(userInfo.email);
      
      setIsAuthenticated(true);
      Alert.alert('Success', 'Connected to Google Drive successfully!');
      
      // Check for existing backups
      const existingBackups = await GoogleDriveService.findDailyBackupFile();
      if (existingBackups.length > 0) {
        Alert.alert(
          'Existing Backup Found',
          'We found an existing backup in your Google Drive. Would you like to restore it?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Restore', 
              onPress: () => handleRestoreBackup(existingBackups[0])
            }
          ]
        );
      } else {
        Alert.alert('No Existing Backup', 'No previous backup found. You can create your first backup now.');
      }
      
      loadBackupFiles();
    } catch (error) {
      console.error('Auth success error:', error);
      Alert.alert('Error', 'Failed to complete authentication');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to connect to Google Drive');
      setIsLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await GoogleDriveService.logout();
      setIsAuthenticated(false);
      setBackupFiles([]);
      setAutoBackupEnabled(false);
      setLastBackupDate(null);
      Alert.alert('Success', 'Disconnected from Google Drive');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to disconnect from Google Drive');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      const result = await GoogleDriveService.createBackup();
      
      if (result.success) {
        Alert.alert('Success', 'Backup created successfully!');
        setLastBackupDate(new Date().toISOString());
        loadBackupFiles();
      } else {
        Alert.alert('Error', result.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupFile) => {
    try {
      setIsLoading(true);
      const result = await GoogleDriveService.restoreBackup(backupFile.id);
      
      if (result.success) {
        Alert.alert('Success', 'Backup restored successfully! Please restart the app.');
      } else {
        Alert.alert('Error', result.error || 'Failed to restore backup');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoBackupToggle = async (value) => {
    try {
      if (value) {
        await GoogleDriveService.enableAutoBackup();
        setAutoBackupEnabled(true);
        Alert.alert('Success', 'Auto backup enabled! Daily backups will be created at 2:00 AM');
      } else {
        await GoogleDriveService.disableAutoBackup();
        setAutoBackupEnabled(false);
        Alert.alert('Success', 'Auto backup disabled');
      }
    } catch (error) {
      console.error('Auto backup toggle error:', error);
      Alert.alert('Error', 'Failed to update auto backup settings');
    }
  };

  const loadBackupFiles = async () => {
    try {
      const result = await GoogleDriveService.listBackupFiles();
      if (result.success) {
        setBackupFiles(result.files);
      }
    } catch (error) {
      console.error('Error loading backup files:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Google Drive Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Drive Connection</Text>
          <View style={styles.connectionCard}>
            {!isAuthenticated ? (
              <TouchableOpacity 
                style={styles.googleButton} 
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.googleButtonText}>🔗</Text>
                    <Text style={styles.googleButtonText}>Connect to Google Drive</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.connectedCard}>
                <Text style={styles.connectedText}>✅ Connected to Google Drive</Text>
                <Text style={styles.emailText}>{GoogleDriveService.getUserEmail()}</Text>
                <TouchableOpacity 
                  style={styles.disconnectButton} 
                  onPress={handleGoogleLogout}
                >
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Auto Backup Settings */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auto Backup Settings</Text>
            <View style={styles.autoBackupCard}>
              <View style={styles.autoBackupHeader}>
                <Text style={styles.autoBackupTitle}>Daily Auto Backup</Text>
                <Switch 
                  value={autoBackupEnabled} 
                  onValueChange={handleAutoBackupToggle}
                />
              </View>
              <Text style={styles.autoBackupDescription}>
                Automatically create daily backups at 2:00 AM
              </Text>
              <Text style={styles.lastBackupText}>
                Last backup: {formatDate(lastBackupDate)}
              </Text>
            </View>
          </View>
        )}

        {/* Manual Backup Actions */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Backup</Text>
            <TouchableOpacity 
              style={styles.backupButton} 
              onPress={handleCreateBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.backupButtonText}>Create Manual Backup</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={loadBackupFiles}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh Backup List</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Backup Files List */}
        {isAuthenticated && backupFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Backups</Text>
            {backupFiles.map((file, index) => (
              <View key={index} style={styles.backupFileCard}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <Text style={styles.fileDetails}>
                    {formatDate(file.createdTime)} • {formatFileSize(file.size)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.restoreButton}
                  onPress={() => handleRestoreBackup(file)}
                >
                  <Text style={styles.restoreButtonText}>Restore</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionText}>
              1. Connect to your Google Drive account{'\n'}
              2. Enable auto backup for daily automatic backups{'\n'}
              3. Create manual backups anytime{'\n'}
              4. Restore your data when needed{'\n'}
              5. All backups are stored securely in your Google Drive
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  connectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  connectedCard: {
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  autoBackupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  autoBackupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoBackupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  autoBackupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lastBackupText: {
    fontSize: 12,
    color: '#888',
  },
  backupButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  backupFileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  restoreButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default BackupRestoreScreen;
