import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const LoanSaleDetailsScreen = ({ navigation, route }) => {
  const { loanId } = route.params;
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const doc = await firestore().collection('loanSales').doc(loanId).get();
        if (doc.exists) {
          setLoanData({ id: doc.id, ...doc.data() });
        } else {
          Alert.alert('Error', 'Loan sale not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching loan details:', error);
        Alert.alert('Error', 'Failed to load loan details');
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await firestore().collection('loanSales').doc(loanId).update({
        status: newStatus,
        updatedAt: firestore.Timestamp.now()
      });
      
      setLoanData(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Loan Sale',
      'Are you sure you want to delete this loan sale? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('loanSales').doc(loanId).delete();
              Alert.alert('Success', 'Loan sale deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting loan sale:', error);
              Alert.alert('Error', 'Failed to delete loan sale');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#4CAF50';
      case 'disbursed': return '#2196F3';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#757575';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F49B6" />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  if (!loanData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Loan sale not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F49B6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loanData.status) }]}>
              <Text style={styles.statusText}>{loanData.status || 'Pending'}</Text>
            </View>
          </View>
          
          <View style={styles.statusActions}>
            {['Pending', 'Approved', 'Rejected', 'Disbursed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  loanData.status === status && styles.currentStatusButton
                ]}
                onPress={() => handleStatusUpdate(status)}
                disabled={loanData.status === status}
              >
                <Text style={[
                  styles.statusButtonText,
                  loanData.status === status && styles.currentStatusButtonText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{loanData.customerName || 'N/A'}</Text>
          </View>
          {loanData.customerPhone && (
            <View style={styles.infoRow}>
              <Icon name="call-outline" size={20} color="#1F49B6" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{loanData.customerPhone}</Text>
            </View>
          )}
          {loanData.customerAddress && (
            <View style={styles.infoRow}>
              <Icon name="location-outline" size={20} color="#1F49B6" />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{loanData.customerAddress}</Text>
            </View>
          )}
        </View>

        {/* Loan Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Information</Text>
          <View style={styles.infoRow}>
            <Icon name="card-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{loanData.loanType || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="cash-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Limit:</Text>
            <Text style={styles.infoValue}>₹{Number(loanData.loanLimit || 0).toFixed(2)}</Text>
          </View>
          {loanData.interestRate && (
            <View style={styles.infoRow}>
              <Icon name="trending-up-outline" size={20} color="#1F49B6" />
              <Text style={styles.infoLabel}>Interest Rate:</Text>
              <Text style={styles.infoValue}>{loanData.interestRate}% per annum</Text>
            </View>
          )}
          {loanData.tenure && (
            <View style={styles.infoRow}>
              <Icon name="time-outline" size={20} color="#1F49B6" />
              <Text style={styles.infoLabel}>Tenure:</Text>
              <Text style={styles.infoValue}>{loanData.tenure} months</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="calculator-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Total Amount:</Text>
            <Text style={[styles.infoValue, styles.totalAmount]}>
              ₹{Number(loanData.totalAmount || loanData.loanLimit || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoRow}>
            <Icon name="wallet-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Payment Type:</Text>
            <Text style={styles.infoValue}>{loanData.paymentType || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={20} color="#1F49B6" />
            <Text style={styles.infoLabel}>Date Created:</Text>
            <Text style={styles.infoValue}>{formatDate(loanData.date)}</Text>
          </View>
          {loanData.updatedAt && (
            <View style={styles.infoRow}>
              <Icon name="refresh-outline" size={20} color="#1F49B6" />
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>{formatDate(loanData.updatedAt)}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {loanData.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{loanData.notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F49B6',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 8 },
  deleteButton: { padding: 8 },
  content: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  currentStatusButton: {
    backgroundColor: '#1F49B6',
    borderColor: '#1F49B6',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  currentStatusButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F49B6',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F49B6',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
});

export default LoanSaleDetailsScreen;
