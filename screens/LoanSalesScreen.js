import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const LoanSalesScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loanStats, setLoanStats] = useState({
    totalCustomers: 0,
    totalLoanAmount: 0,
    loansByType: {},
    loansByArea: {},
    averageLoanAmount: 0
  });

  // Fetch customers data from Firestore and calculate loan statistics
  useEffect(() => {
    const subscriber = firestore()
      .collection('customers')
      .onSnapshot(querySnapshot => {
        const customerList = [];
        
        querySnapshot.forEach(documentSnapshot => {
          const customerData = documentSnapshot.data();
          if (customerData.loanLimit && customerData.loanLimit > 0) {
            customerList.push({
              id: documentSnapshot.id,
              ...customerData,
            });
          }
        });

        setCustomers(customerList);
        calculateLoanStats(customerList);
        setLoading(false);

      }, error => {
        console.error('Error fetching customers:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load customer data');
      });

    return () => subscriber();
  }, []);

  const calculateLoanStats = (customerList) => {
    const stats = {
      totalCustomers: customerList.length,
      totalLoanAmount: 0,
      loansByType: {},
      loansByArea: {},
      averageLoanAmount: 0
    };

    customerList.forEach(customer => {
      const loanAmount = Number(customer.loanLimit || 0);
      const loanType = customer.loanType || 'Not Specified';
      const area = customer.area || 'Not Specified';

      // Total loan amount
      stats.totalLoanAmount += loanAmount;

      // Group by loan type
      if (!stats.loansByType[loanType]) {
        stats.loansByType[loanType] = {
          count: 0,
          totalAmount: 0,
          customers: []
        };
      }
      stats.loansByType[loanType].count += 1;
      stats.loansByType[loanType].totalAmount += loanAmount;
      stats.loansByType[loanType].customers.push(customer);

      // Group by area
      if (!stats.loansByArea[area]) {
        stats.loansByArea[area] = {
          count: 0,
          totalAmount: 0
        };
      }
      stats.loansByArea[area].count += 1;
      stats.loansByArea[area].totalAmount += loanAmount;
    });

    // Calculate average
    stats.averageLoanAmount = stats.totalCustomers > 0 
      ? stats.totalLoanAmount / stats.totalCustomers 
      : 0;

    setLoanStats(stats);
  };

  const getIconForLoanType = (loanType) => {
    switch (loanType) {
      case 'Personal Loan': return 'person-outline';
      case 'Business Loan': return 'business-outline';
      case 'Home Loan': return 'home-outline';
      case 'Vehicle Loan': return 'car-outline';
      case 'Education Loan': return 'school-outline';
      case 'Gold Loan': return 'diamond-outline';
      default: return 'cash-outline';
    }
  };

  const getColorForLoanType = (loanType) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const types = Object.keys(loanStats.loansByType);
    const index = types.indexOf(loanType);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F49B6" />
        <Text style={styles.loadingText}>Loading loan statistics...</Text>
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
        <Text style={styles.headerTitle}>Loan Dashboard</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CustomerData')} 
          style={styles.addButton}
        >
          <Icon name="people" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={[styles.overviewCard, { backgroundColor: '#4ECDC4' }]}>
            <Icon name="people-outline" size={32} color="#fff" />
            <Text style={styles.overviewNumber}>{loanStats.totalCustomers}</Text>
            <Text style={styles.overviewLabel}>Total Customers</Text>
          </View>
          
          <View style={[styles.overviewCard, { backgroundColor: '#45B7D1' }]}>
            <Icon name="cash-outline" size={32} color="#fff" />
            <Text style={styles.overviewNumber}>₹{(loanStats.totalLoanAmount / 100000).toFixed(1)}L</Text>
            <Text style={styles.overviewLabel}>Total Loan Amount</Text>
          </View>
        </View>

        <View style={styles.overviewContainer}>
          <View style={[styles.overviewCard, { backgroundColor: '#96CEB4' }]}>
            <Icon name="trending-up-outline" size={32} color="#fff" />
            <Text style={styles.overviewNumber}>₹{(loanStats.averageLoanAmount / 1000).toFixed(0)}K</Text>
            <Text style={styles.overviewLabel}>Average Loan</Text>
          </View>
          
          <View style={[styles.overviewCard, { backgroundColor: '#FFEAA7' }]}>
            <Icon name="list-outline" size={32} color="#fff" />
            <Text style={styles.overviewNumber}>{Object.keys(loanStats.loansByType).length}</Text>
            <Text style={styles.overviewLabel}>Loan Types</Text>
          </View>
        </View>

        {/* Loans by Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loans by Type</Text>
          {Object.keys(loanStats.loansByType).length === 0 ? (
            <View style={styles.emptySection}>
              <Icon name="document-text-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No loan data available</Text>
              <Text style={styles.emptySubText}>Add customers with loan information to see statistics</Text>
            </View>
          ) : (
            Object.entries(loanStats.loansByType).map(([type, data]) => (
              <View key={type} style={styles.loanTypeCard}>
                <View style={styles.loanTypeHeader}>
                  <View style={styles.loanTypeInfo}>
                    <View style={[styles.loanTypeIcon, { backgroundColor: getColorForLoanType(type) }]}>
                      <Icon name={getIconForLoanType(type)} size={20} color="#fff" />
                    </View>
                    <View style={styles.loanTypeDetails}>
                      <Text style={styles.loanTypeName}>{type}</Text>
                      <Text style={styles.loanTypeCount}>{data.count} customers</Text>
                    </View>
                  </View>
                  <View style={styles.loanTypeAmount}>
                    <Text style={styles.loanTypeTotal}>₹{(data.totalAmount / 100000).toFixed(1)}L</Text>
                    <Text style={styles.loanTypeAverage}>Avg: ₹{(data.totalAmount / data.count / 1000).toFixed(0)}K</Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${(data.totalAmount / loanStats.totalLoanAmount) * 100}%`,
                        backgroundColor: getColorForLoanType(type)
                      }
                    ]} 
                  />
                </View>
                
                <Text style={styles.progressPercentage}>
                  {((data.totalAmount / loanStats.totalLoanAmount) * 100).toFixed(1)}% of total loan amount
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Loans by Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loans by Area</Text>
          {Object.keys(loanStats.loansByArea).length === 0 ? (
            <View style={styles.emptySection}>
              <Icon name="location-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No area data available</Text>
            </View>
          ) : (
            Object.entries(loanStats.loansByArea)
              .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
              .slice(0, 5)
              .map(([area, data]) => (
                <View key={area} style={styles.areaCard}>
                  <View style={styles.areaInfo}>
                    <Icon name="location-outline" size={16} color="#1F49B6" />
                    <Text style={styles.areaName}>{area}</Text>
                  </View>
                  <View style={styles.areaStats}>
                    <Text style={styles.areaCount}>{data.count} customers</Text>
                    <Text style={styles.areaAmount}>₹{(data.totalAmount / 100000).toFixed(1)}L</Text>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CustomerData')}
          >
            <Icon name="person-add-outline" size={24} color="#1F49B6" />
            <Text style={styles.actionButtonText}>Add New Customer</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1F49B6', paddingVertical: 20, paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 8 },
  addButton: { padding: 8 },
  content: { flex: 1, padding: 15 },
  loadingContainer: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' 
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  
  // Overview Cards
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
  
  // Empty States
  emptySection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Loan Type Cards
  loanTypeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  loanTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loanTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loanTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  loanTypeDetails: {
    flex: 1,
  },
  loanTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loanTypeCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  loanTypeAmount: {
    alignItems: 'flex-end',
  },
  loanTypeTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F49B6',
  },
  loanTypeAverage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Area Cards
  areaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  areaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  areaStats: {
    alignItems: 'flex-end',
  },
  areaCount: {
    fontSize: 12,
    color: '#666',
  },
  areaAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F49B6',
  },
  
  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  
  bottomSpacing: { height: 20 },
});

export default LoanSalesScreen;
