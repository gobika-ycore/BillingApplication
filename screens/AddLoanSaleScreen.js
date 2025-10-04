import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const AddLoanSaleScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    loanType: '',
    loanLimit: '',
    interestRate: '',
    tenure: '',
    totalAmount: '',
    paymentType: 'Cash',
    status: 'Pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalAmount = () => {
    const limit = parseFloat(formData.loanLimit) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const months = parseInt(formData.tenure) || 0;
    
    if (limit > 0 && rate > 0 && months > 0) {
      const monthlyRate = rate / 100 / 12;
      const totalAmount = limit * (1 + (monthlyRate * months));
      setFormData(prev => ({
        ...prev,
        totalAmount: totalAmount.toFixed(2)
      }));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.customerName.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }
    if (!formData.loanType.trim()) {
      Alert.alert('Error', 'Loan type is required');
      return;
    }
    if (!formData.loanLimit || parseFloat(formData.loanLimit) <= 0) {
      Alert.alert('Error', 'Valid loan limit is required');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('loanSales').add({
        ...formData,
        loanLimit: parseFloat(formData.loanLimit),
        interestRate: parseFloat(formData.interestRate) || 0,
        tenure: parseInt(formData.tenure) || 0,
        totalAmount: parseFloat(formData.totalAmount) || parseFloat(formData.loanLimit),
        date: firestore.Timestamp.now(),
        createdAt: firestore.Timestamp.now()
      });

      Alert.alert('Success', 'Loan sale added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding loan sale:', error);
      Alert.alert('Error', 'Failed to add loan sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F49B6" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Loan Sale</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Customer Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.customerName}
              onChangeText={(value) => handleInputChange('customerName', value)}
              placeholder="Enter customer name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.customerPhone}
              onChangeText={(value) => handleInputChange('customerPhone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.customerAddress}
              onChangeText={(value) => handleInputChange('customerAddress', value)}
              placeholder="Enter customer address"
              multiline
              numberOfLines={3}
            />
          </View>

          <Text style={styles.sectionTitle}>Loan Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loan Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.loanType}
              onChangeText={(value) => handleInputChange('loanType', value)}
              placeholder="e.g., Personal Loan, Business Loan"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Loan Limit *</Text>
              <TextInput
                style={styles.input}
                value={formData.loanLimit}
                onChangeText={(value) => handleInputChange('loanLimit', value)}
                placeholder="₹ 0"
                keyboardType="numeric"
                onBlur={calculateTotalAmount}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={formData.interestRate}
                onChangeText={(value) => handleInputChange('interestRate', value)}
                placeholder="0.0"
                keyboardType="numeric"
                onBlur={calculateTotalAmount}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Tenure (Months)</Text>
              <TextInput
                style={styles.input}
                value={formData.tenure}
                onChangeText={(value) => handleInputChange('tenure', value)}
                placeholder="12"
                keyboardType="numeric"
                onBlur={calculateTotalAmount}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Total Amount</Text>
              <TextInput
                style={styles.input}
                value={formData.totalAmount}
                onChangeText={(value) => handleInputChange('totalAmount', value)}
                placeholder="₹ 0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Type</Text>
            <View style={styles.paymentTypeContainer}>
              {['Cash', 'Bank Transfer', 'Cheque', 'UPI'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.paymentTypeButton,
                    formData.paymentType === type && styles.selectedPaymentType
                  ]}
                  onPress={() => handleInputChange('paymentType', type)}
                >
                  <Text style={[
                    styles.paymentTypeText,
                    formData.paymentType === type && styles.selectedPaymentTypeText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.paymentTypeContainer}>
              {['Pending', 'Approved', 'Rejected', 'Disbursed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.paymentTypeButton,
                    formData.status === status && styles.selectedPaymentType
                  ]}
                  onPress={() => handleInputChange('status', status)}
                >
                  <Text style={[
                    styles.paymentTypeText,
                    formData.status === status && styles.selectedPaymentTypeText
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Additional notes or comments"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Loan Sale'}
          </Text>
        </TouchableOpacity>
      </View>
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
  placeholder: { width: 40 },
  content: { flex: 1 },
  form: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F49B6',
    marginBottom: 15,
    marginTop: 10,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: { width: '48%' },
  paymentTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentTypeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedPaymentType: {
    backgroundColor: '#1F49B6',
    borderColor: '#1F49B6',
  },
  paymentTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#1F49B6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddLoanSaleScreen;
