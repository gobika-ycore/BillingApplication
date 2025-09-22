import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import firestore from '@react-native-firebase/firestore';

// FormField component outside of main component to prevent re-creation
const FormField = React.memo(({ label, field, placeholder, multiline = false, value, onChangeText }) => (
  <View style={fieldStyles.fieldContainer}>
    <Text style={fieldStyles.fieldLabel}>{label}</Text>
    <TextInput
      style={[fieldStyles.input, multiline && fieldStyles.multilineInput]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      autoCorrect={false}
      autoCapitalize="sentences"
      blurOnSubmit={false}
      returnKeyType={multiline ? "default" : "next"}
      keyboardType={field === 'amount' ? 'numeric' : 'default'}
    />
  </View>
));

// Styles for FormField component
const fieldStyles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    minHeight: 48,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
});

const SalesBillScreen = ({ navigation }) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salesBills, setSalesBills] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    billNo: "",
    loanType: "",
    customerType: "",
    acNo: "",
    nearCustomer: "",
    customerName: "",
    acNoItem: "",
    amount: "",
  });

  // Load sales bills from Firestore
  const loadSalesBills = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('salesBills').orderBy('createdAt', 'desc').get();
      const billsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSalesBills(billsList);
    } catch (error) {
      console.error('Error loading sales bills:', error);
      Alert.alert('Error', 'Failed to load sales bills. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sales bills when component mounts
  useEffect(() => {
    loadSalesBills();
  }, [loadSalesBills]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (!formData.customerName.trim()) errors.push('Customer name is required');
    if (!formData.billNo.trim()) errors.push('Bill number is required');
    if (!formData.amount.trim()) errors.push('Amount is required');
    if (!formData.date.trim()) errors.push('Date is required');
    if (!formData.loanType.trim()) errors.push('Loan type is required');
    if (!formData.customerType.trim()) errors.push('Customer type is required');
    
    // Validate amount
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      errors.push('Amount must be a valid number');
    }
    
    if (formData.amount && parseFloat(formData.amount) <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    return errors;
  };

  const resetForm = () => {
    setFormData({
      date: "",
      billNo: "",
      loanType: "",
      customerType: "",
      acNo: "",
      nearCustomer: "",
      customerName: "",
      acNoItem: "",
      amount: "",
    });
  };

  const handleSave = async () => {
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      // Generate bill number if not provided
      const billNo = formData.billNo || `BILL${Date.now().toString().slice(-6)}`;
      
      // Prepare data for Firestore
      const billData = {
        ...formData,
        billNo,
        amount: parseFloat(formData.amount),
        totalAmount: parseFloat(formData.amount),
        paidAmount: 0,
        balanceAmount: parseFloat(formData.amount),
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore
      await firestore().collection('salesBills').add(billData);
      
      Alert.alert(
        "Success!", 
        `Sales bill "${billNo}" has been saved successfully!\nCustomer: ${formData.customerName}\nAmount: ₹${formData.amount}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowForm(false);
              resetForm();
              loadSalesBills(); // Refresh the bills list
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving sales bill:', error);
      Alert.alert('Error', 'Failed to save sales bill. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };


  const renderSalesBillItem = useCallback(({ item }) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <Text style={styles.billNo}>{item.billNo}</Text>
        <Text style={styles.billDate}>{item.date}</Text>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.acNo}>{item.acNo}</Text>
      <View style={styles.billFooter}>
        <View style={styles.billDetails}>
          <Text style={styles.loanType}>{item.loanType}</Text>
          <Text style={styles.customerType}>({item.customerType})</Text>
        </View>
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
    </View>
  ), []);

  if (showForm) {
    return (
      <View style={styles.container}>
        {/* Form Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Sales Bill</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormField 
            label="Date" 
            field="date" 
            placeholder="Enter date (YYYY-MM-DD)" 
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
          />
          
          <FormField 
            label="Bill no" 
            field="billNo" 
            placeholder="Enter bill number" 
            value={formData.billNo}
            onChangeText={(value) => handleInputChange('billNo', value)}
          />
          
          <FormField 
            label="Loan Type" 
            field="loanType" 
            placeholder="Enter loan type" 
            value={formData.loanType}
            onChangeText={(value) => handleInputChange('loanType', value)}
          />
          
          <FormField 
            label="Customer Type ( old / new )" 
            field="customerType" 
            placeholder="Enter old or new" 
            value={formData.customerType}
            onChangeText={(value) => handleInputChange('customerType', value)}
          />
          
          <FormField 
            label="Ac no ( new Customer Auto generate number )" 
            field="acNo" 
            placeholder="Account number" 
            value={formData.acNo}
            onChangeText={(value) => handleInputChange('acNo', value)}
          />
          
          <FormField 
            label="Near Customer" 
            field="nearCustomer" 
            placeholder="Enter near customer details" 
            value={formData.nearCustomer}
            onChangeText={(value) => handleInputChange('nearCustomer', value)}
          />
          
          <FormField 
            label="Customer name " 
            field="customerName" 
            placeholder="Enter customer name" 
            value={formData.customerName}
            onChangeText={(value) => handleInputChange('customerName', value)}
          />
          
          <FormField 
            label="Ac no -Item" 
            field="acNoItem" 
            placeholder="Enter item details" 
            multiline={true}
            value={formData.acNoItem}
            onChangeText={(value) => handleInputChange('acNoItem', value)}
          />

          <FormField 
            label="Amount" 
            field="amount" 
            placeholder="Enter amount (e.g., ₹25,000)" 
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
          />

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.submitButton, saving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Save Sales Bill</Text>
            )}
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  // Sales Bill List View
  return (
    <View style={styles.container}>
      {/* List Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Bill</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddNew}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sales Bill List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F49B6" />
          <Text style={styles.loadingText}>Loading sales bills...</Text>
        </View>
      ) : salesBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No sales bills found</Text>
          <Text style={styles.emptySubText}>Tap the button below to add your first sales bill</Text>
        </View>
      ) : (
        <FlatList
          data={salesBills}
          renderItem={renderSalesBillItem}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadSalesBills}
        />
      )}

      {/* Add New Sales Bill Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Icon name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Sales Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#1F49B6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#1F49B6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 20,
  },
  billCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billNo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  billDate: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  acNo: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  billFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  billDetails: {
    flex: 1,
  },
  loanType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  customerType: {
    fontSize: 12,
    color: "#999",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  addButton: {
    backgroundColor: "#1F49B6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#1F49B6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default SalesBillScreen;
