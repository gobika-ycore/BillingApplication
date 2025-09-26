import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const LoanSalesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [loanSales, setLoanSales] = useState([]);

  // Fetch loan sales data from Firestore
  useEffect(() => {
    const subscriber = firestore()
      .collection('loanSales')
      .orderBy('date', 'desc')
      .onSnapshot(querySnapshot => {
        const sales = [];
        
        querySnapshot.forEach(documentSnapshot => {
          sales.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });

        setLoanSales(sales);
        setLoading(false);
      }, error => {
        console.error('Error fetching loan sales:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load loan sales data');
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.loanItem}
      onPress={() => navigation.navigate('LoanSaleDetails', { loanId: item.id })}
    >
      <View style={styles.loanHeader}>
        <Text style={styles.customerName}>{item.customerName || 'No Name'}</Text>
        <Text style={styles.amount}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
      </View>
      
      <View style={styles.loanDetails}>
        <Text style={styles.loanType}>{item.loanType || 'N/A'}</Text>
        <Text style={styles.date}>
          {item.date ? new Date(item.date.toDate()).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
      
      <View style={styles.loanFooter}>
        <Text style={styles.status}>
          {item.status || 'Pending'}
        </Text>
        <Icon name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F49B6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Sales</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddLoanSale')}>
          <Icon name="add-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {loanSales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No loan sales found</Text>
          <Text style={styles.emptySubText}>Add a new loan sale to get started</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddLoanSale')}
          >
            <Text style={styles.addButtonText}>Add Loan Sale</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loanSales}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={() => (
            <Text style={styles.listHeader}>
              {loanSales.length} loan sale{loanSales.length !== 1 ? 's' : ''} found
            </Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F49B6',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1F49B6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  listHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginLeft: 5,
  },
  loanItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F49B6',
  },
  loanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loanType: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default LoanSalesScreen;
