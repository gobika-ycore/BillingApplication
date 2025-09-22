// Firestore Connection Test Component
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
import firestore from '@react-native-firebase/firestore';

const FirestoreTest = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [testResults, setTestResults] = useState([]);
  const [collections, setCollections] = useState({});

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  // Test basic connection
  const testConnection = async () => {
    setLoading(true);
    addResult('🔄 Testing Firestore connection...', 'info');
    
    try {
      // Try to write a test document
      await firestore().collection('test').doc('connection').set({
        timestamp: firestore.FieldValue.serverTimestamp(),
        message: 'Connection test successful',
        appVersion: '1.0.0'
      });

      // Try to read it back
      const doc = await firestore().collection('test').doc('connection').get();
      
      if (doc.exists) {
        addResult('✅ Firestore connection successful!', 'success');
        setConnectionStatus('connected');
        
        // Clean up test document
        await firestore().collection('test').doc('connection').delete();
        addResult('🧹 Test document cleaned up', 'info');
      } else {
        throw new Error('Test document not found');
      }
    } catch (error) {
      addResult(`❌ Connection failed: ${error.message}`, 'error');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Create sample data
  const createSampleData = async () => {
    setLoading(true);
    addResult('🔄 Creating sample data...', 'info');
    
    try {
      // Create sample customer
      const customerRef = await firestore().collection('customers').add({
        acNo: 'ACC001234',
        name: 'John Doe',
        phone: '+91 9876543210',
        address: '123 Main Street, City',
        area: 'Downtown Area',
        customerGroup: 'Monday Morning Group',
        loanLimit: 50000,
        isActive: true,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      addResult(`✅ Sample customer created: ${customerRef.id}`, 'success');

      // Create sample sales bill
      const salesBillRef = await firestore().collection('salesBills').add({
        billNo: 'BILL001',
        customerName: 'John Doe',
        customerId: customerRef.id,
        amount: 25000,
        date: '2024-01-15',
        status: 'pending',
        loanType: 'Personal Loan',
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      addResult(`✅ Sample sales bill created: ${salesBillRef.id}`, 'success');

      // Create sample collection bill
      const collectionBillRef = await firestore().collection('collectionBills').add({
        billNo: 'COL001',
        customerName: 'John Doe',
        customerId: customerRef.id,
        collectionAmount: 5000,
        paymentMethod: 'cash',
        date: '2024-01-16',
        status: 'collected',
        createdAt: firestore.FieldValue.serverTimestamp()
      });
      addResult(`✅ Sample collection bill created: ${collectionBillRef.id}`, 'success');

      addResult('🎉 All sample data created successfully!', 'success');
      
      // Refresh collection stats
      await getCollectionStats();
      
    } catch (error) {
      addResult(`❌ Failed to create sample data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get collection statistics
  const getCollectionStats = async () => {
    setLoading(true);
    addResult('📊 Getting collection statistics...', 'info');
    
    try {
      const collectionNames = ['customers', 'salesBills', 'collectionBills'];
      const stats = {};
      
      for (const collectionName of collectionNames) {
        const snapshot = await firestore().collection(collectionName).get();
        stats[collectionName] = {
          count: snapshot.size,
          documents: snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        };
      }
      
      setCollections(stats);
      addResult('✅ Collection statistics loaded', 'success');
      
    } catch (error) {
      addResult(`❌ Failed to get statistics: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear all test data
  const clearTestData = async () => {
    Alert.alert(
      'Clear Test Data',
      'Are you sure you want to clear all test data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            addResult('🗑️ Clearing test data...', 'warning');
            
            try {
              const collectionNames = ['customers', 'salesBills', 'collectionBills'];
              
              for (const collectionName of collectionNames) {
                const snapshot = await firestore().collection(collectionName).get();
                const batch = firestore().batch();
                
                snapshot.docs.forEach(doc => {
                  batch.delete(doc.ref);
                });
                
                await batch.commit();
                addResult(`✅ Cleared ${collectionName} collection`, 'success');
              }
              
              setCollections({});
              addResult('🎉 All test data cleared!', 'success');
              
            } catch (error) {
              addResult(`❌ Failed to clear data: ${error.message}`, 'error');
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Firestore Test</Text>
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
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'error' ? 'Connection Error' : 'Testing...'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Test Actions</Text>
          
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
            onPress={createSampleData}
            disabled={loading}
          >
            <Icon name="add-circle" size={20} color="#10B981" />
            <Text style={[styles.actionButtonText, {color: '#10B981'}]}>Create Sample Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={getCollectionStats}
            disabled={loading}
          >
            <Icon name="bar-chart" size={20} color="#F59E0B" />
            <Text style={[styles.actionButtonText, {color: '#F59E0B'}]}>Get Statistics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={clearTestData}
            disabled={loading}
          >
            <Icon name="trash" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, {color: '#EF4444'}]}>Clear Test Data</Text>
          </TouchableOpacity>
        </View>

        {/* Collection Statistics */}
        {Object.keys(collections).length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Collection Statistics</Text>
            {Object.entries(collections).map(([name, data]) => (
              <View key={name} style={styles.statRow}>
                <Text style={styles.statName}>{name}</Text>
                <Text style={styles.statCount}>{data.count} documents</Text>
              </View>
            ))}
          </View>
        )}

        {/* Test Results Log */}
        <View style={styles.logsCard}>
          <Text style={styles.cardTitle}>Test Results</Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.logRow}>
              <Text style={styles.logTime}>{result.timestamp}</Text>
              <Text style={[styles.logMessage, { color: getLogColor(result.type) }]}>
                {result.message}
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
  statName: {
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

export default FirestoreTest;
