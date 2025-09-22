// Firestore Initializer Component
// This component helps initialize and test Firestore connection

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FirestoreSetup from '../firestore/FirestoreSetup';

const FirestoreInitializer = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testConnection = async () => {
    setLoading(true);
    addLog('Testing Firestore connection...', 'info');
    
    try {
      const result = await FirestoreSetup.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
        addLog('✅ Firestore connection successful!', 'success');
      } else {
        setConnectionStatus('error');
        addLog(`❌ Connection failed: ${result.error}`, 'error');
      }
    } catch (error) {
      setConnectionStatus('error');
      addLog(`❌ Connection error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const initializeCollections = async () => {
    setLoading(true);
    addLog('Initializing Firestore collections...', 'info');
    
    try {
      const result = await FirestoreSetup.initializeCollections();
      if (result.success) {
        addLog('🎉 Collections initialized successfully!', 'success');
        await getStats(); // Refresh stats
      } else {
        addLog(`❌ Initialization failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Initialization error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setLoading(true);
    addLog('Getting collection statistics...', 'info');
    
    try {
      const result = await FirestoreSetup.getCollectionStats();
      if (result.success) {
        setStats(result.stats);
        addLog('📊 Statistics loaded successfully', 'success');
      } else {
        addLog(`❌ Failed to get stats: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Stats error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all collections? This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            addLog('⚠️  Clearing all collections...', 'warning');
            
            try {
              const result = await FirestoreSetup.clearAllCollections();
              if (result.success) {
                addLog('🗑️  All collections cleared', 'success');
                setStats(null);
              } else {
                addLog(`❌ Clear failed: ${result.error}`, 'error');
              }
            } catch (error) {
              addLog(`❌ Clear error: ${error.message}`, 'error');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Error';
      default: return 'Testing...';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Firestore Setup</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon 
              name={connectionStatus === 'connected' ? 'checkmark-circle' : 'alert-circle'} 
              size={24} 
              color={getStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={testConnection}
            disabled={loading}
          >
            <Icon name="wifi" size={20} color="#1F49B6" />
            <Text style={styles.actionButtonText}>Test Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={initializeCollections}
            disabled={loading}
          >
            <Icon name="construct" size={20} color="#1F49B6" />
            <Text style={styles.actionButtonText}>Initialize Collections</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={getStats}
            disabled={loading}
          >
            <Icon name="bar-chart" size={20} color="#1F49B6" />
            <Text style={styles.actionButtonText}>Get Statistics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllData}
            disabled={loading}
          >
            <Icon name="trash" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        {stats && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Collection Statistics</Text>
            {Object.entries(stats).map(([collection, data]) => (
              <View key={collection} style={styles.statRow}>
                <Text style={styles.statCollection}>{data.collection}</Text>
                <Text style={styles.statCount}>{data.count} documents</Text>
              </View>
            ))}
          </View>
        )}

        {/* Logs */}
        <View style={styles.logsCard}>
          <Text style={styles.cardTitle}>Activity Logs</Text>
          {logs.map((log, index) => (
            <View key={index} style={styles.logRow}>
              <Text style={styles.logTime}>{log.timestamp}</Text>
              <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
                {log.message}
              </Text>
            </View>
          ))}
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#1F49B6" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getLogColor = (type) => {
  switch (type) {
    case 'success': return '#10B981';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1F49B6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1F49B6',
    marginLeft: 12,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
  },
  dangerText: {
    color: '#EF4444',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statCollection: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statCount: {
    fontSize: 14,
    color: '#666',
  },
  logsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  logRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logMessage: {
    fontSize: 14,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default FirestoreInitializer;
