// screens/Settings/BackupRestoreScreen.js
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
  Switch,
} from 'react-native';
import GoogleDriveService from './services/GoogleDriveService';

const BackupRestoreScreen = ({ navigation }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [backupFiles, setBackupFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState(null);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    await GoogleDriveService.loadBackupSettings();
    checkAuthentication();
  };

  const checkAuthentication = () => {
    const authenticated = GoogleDriveService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setUserEmail(GoogleDriveService.getUserEmail());
    
    const backupStatus = GoogleDriveService.getAutoBackupStatus();
    setAutoBackupEnabled(backupStatus.enabled);
    setLastBackupDate(backupStatus.lastBackup);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await GoogleDriveService.authenticateUser();
      
      if (result.success) {
        setIsAuthenticated(true);
        setUserEmail(result.email);
        
        // Check for existing backups
        const existingBackups = await GoogleDriveService.checkExistingBackups();
        if (existingBackups.length > 0) {
          Alert.alert(
            'Existing Backups Found',
            `Found ${existingBackups.length} backup(s) in your Google Drive. Would you like to restore the latest one?`,
            [
              { text: 'No, Keep Current Data', style: 'cancel' },
              {
                text: 'Restore Latest Backup',
                onPress: () => handleRestoreBackup(existingBackups[0].id, existingBackups[0].name)
              }
            ]
          );
        } else {
          Alert.alert('Success', 'Connected to Google Drive! No existing backups found.');
        }
        
        loadBackupFiles();
      } else {
        Alert.alert('Error', result.error || 'Failed to connect to Google Drive');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogout = () => {
    GoogleDriveService.logout();
    setIsAuthenticated(false);
    setUserEmail('');
    setBackupFiles([]);
    setAutoBackupEnabled(false);
    setLastBackupDate(null);
    Alert.alert('Success', 'Disconnected from Google Drive');
  };

  const loadBackupFiles = async () => {
    try {
      setLoading(true);
      const result = await GoogleDriveService.listBackupFiles();
      
      if (result.success) {
        setBackupFiles(result.files);
      } else {
        Alert.alert('Error', result.error || 'Failed to load backup files');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load backup files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    Alert.alert(
      'Create Backup',
      'This will create a backup of all your data and upload it to Google Drive. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Backup',
          onPress: async () => {
            try {
              setBackupLoading(true);
              const result = await GoogleDriveService.createBackup();
              
              if (result.success) {
                setLastBackupDate(new Date().toISOString());
                Alert.alert('Success', 'Backup created and uploaded to Google Drive!');
                loadBackupFiles(); // Refresh the list
              } else {
                Alert.alert('Error', result.error || 'Failed to create backup');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to create backup');
            } finally {
              setBackupLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRestoreBackup = async (fileId, fileName) => {
    Alert.alert(
      'Restore Backup',
      `This will restore your data from "${fileName}". This will replace all current data. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await GoogleDriveService.restoreBackup(fileId);
              
              if (result.success) {
                Alert.alert('Success', 'Backup restored successfully! Please restart the app.');
                // You might want to restart the app here
              } else {
                Alert.alert('Error', result.error || 'Failed to restore backup');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAutoBackupToggle = async (value) => {
    try {
      if (value) {
        // Enable auto backup
        const result = await GoogleDriveService.enableAutoBackup();
        if (result.success) {
          setAutoBackupEnabled(true);
          Alert.alert('Success', 'Auto backup enabled! Backups will be created daily at 2 AM.');
        } else {
          Alert.alert('Error', result.error || 'Failed to enable auto backup');
        }
      } else {
        // Disable auto backup
        const result = await GoogleDriveService.disableAutoBackup();
        if (result.success) {
          setAutoBackupEnabled(false);
          Alert.alert('Success', 'Auto backup disabled.');
        } else {
          Alert.alert('Error', result.error || 'Failed to disable auto backup');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto backup settings');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
        <View />
      </View>

      <ScrollView style={styles.content}>
        {/* Google Drive Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Drive Connection</Text>
          
          {isAuthenticated ? (
            <View style={styles.connectedCard}>
              <Text style={styles.connectedText}>✅ Connected to Google Drive</Text>
              <Text style={styles.emailText}>{userEmail}</Text>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleGoogleLogout}
              >
                <Text style={styles.logoutButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.disconnectedCard}>
              <Text style={styles.disconnectedText}>
                Connect to Google Drive to backup your data
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Connect to Google Drive</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
                  trackColor={{ false: '#767577', true: '#10B981' }}
                  thumbColor={autoBackupEnabled ? '#FFFFFF' : '#f4f3f4'}
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
              disabled={backupLoading}
            >
              {backupLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.backupButtonText}>Create Manual Backup</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadBackupFiles}
              disabled={loading}
            >
              <Text style={styles.refreshButtonText}>Refresh Backup List</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Backup Files List */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Backups</Text>
            
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : backupFiles.length > 0 ? (
              backupFiles.map((file, index) => (
                <View key={file.id} style={styles.backupFileCard}>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileDate}>
                      Created: {formatDate(file.createdTime)}
                    </Text>
                    <Text style={styles.fileSize}>
                      Size: {formatFileSize(parseInt(file.size || 0))}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => handleRestoreBackup(file.id, file.name)}
                  >
                    <Text style={styles.restoreButtonText}>Restore</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noBackupsText}>No backup files found</Text>
            )}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📱 First Time Setup:</Text>
            <Text style={styles.instructionText}>
              • Click "Connect to Google Drive"{'\n'}
              • Sign in with your Gmail account{'\n'}
              • App will check for existing backups{'\n'}
              • Choose to restore or start fresh
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>🔄 Auto Backup:</Text>
            <Text style={styles.instructionText}>
              • Enable "Daily Auto Backup" toggle{'\n'}
              • Backups created daily at 2:00 AM{'\n'}
              • No internet required during backup{'\n'}
              • Uploads when internet available
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>📁 Manual Backup:</Text>
            <Text style={styles.instructionText}>
              • Click "Create Manual Backup"{'\n'}
              • Creates backup immediately{'\n'}
              • Uploads to Google Drive{'\n'}
              • Shows in backup list
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>⚠️ Important Notes:</Text>
            <Text style={styles.instructionText}>
              • Use same Gmail account on all devices{'\n'}
              • Auto backup requires internet at 2 AM{'\n'}
              • Manual backup works anytime{'\n'}
              • Restore replaces all current data
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  connectedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  connectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectedCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  disconnectedText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  autoBackupCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  autoBackupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoBackupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  autoBackupDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  lastBackupText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  backupButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  backupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backupFileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  fileDate: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748B',
  },
  restoreButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noBackupsText: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
  },
  loader: {
    marginVertical: 20,
  },
  instructionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default BackupRestoreScreen;
