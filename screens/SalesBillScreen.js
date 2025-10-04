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
  Modal,
  SafeAreaView,
  Share,
  Clipboard,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import firestore from '@react-native-firebase/firestore';
import QRCode from 'react-native-qrcode-svg';

// FormField component outside of main component to prevent re-creation
const FormField = React.memo(({ label, field, placeholder, multiline = false, value, onChangeText }) => (
  <View style={fieldStyles.fieldContainer}>
    <Text style={fieldStyles.fieldLabel}>{label}</Text>
    <TextInput
      style={[
        fieldStyles.input, 
        multiline && fieldStyles.multilineInput,
        { color: '#000000' }
      ]}
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
      placeholderTextColor="#999"
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
  const [editingBill, setEditingBill] = useState(null);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [upiUri, setUpiUri] = useState(null);
  const [upiId, setUpiId] = useState('billing@paytm');
  const [selectedBill, setSelectedBill] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salesBills, setSalesBills] = useState([]);
  const [filteredSalesBills, setFilteredSalesBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setFilteredSalesBills(billsList);
    } catch (error) {
      console.error('Error loading sales bills:', error);
      Alert.alert('Error', 'Failed to load sales bills. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load customers for auto-fill
  const loadCustomers = useCallback(async () => {
    try {
      const snapshot = await firestore().collection('customers').get();
      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }, []);

  // Auto-fill customer details when customer type is 'old' and account number is provided
  const handleAutoFillCustomer = useCallback((acNo) => {
    if (formData.customerType?.toLowerCase() === 'old' && acNo) {
      const customer = customers.find(c => c.acNo === acNo);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customerName: customer.name || '',
          nearCustomer: customer.area || '',
        }));
      }
    }
  }, [formData.customerType, customers]);

  // Auto-fill date and bill number
  const generateBillNumber = useCallback(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = today.getTime().toString().slice(-4);
    return `SB${dateStr}${timeStr}`;
  }, []);

  const autoFillDefaults = useCallback(() => {
    if (!editingBill) {
      const today = new Date().toISOString().split('T')[0];
      const billNo = generateBillNumber();
      
      setFormData(prev => ({
        ...prev,
        date: prev.date || today,
        billNo: prev.billNo || billNo,
      }));
    }
  }, [generateBillNumber, editingBill]);

  // Load sales bills and customers when component mounts
  useEffect(() => {
    loadSalesBills();
    loadCustomers();
  }, [loadSalesBills, loadCustomers]);

  // Auto-fill defaults when form is opened for new bill
  useEffect(() => {
    if (showForm && !editingBill) {
      autoFillDefaults();
    }
  }, [showForm, editingBill, autoFillDefaults]);

  // Watch for account number changes to auto-fill customer details
  useEffect(() => {
    if (formData.acNo && formData.customerType?.toLowerCase() === 'old') {
      handleAutoFillCustomer(formData.acNo);
    }
  }, [formData.acNo, formData.customerType, handleAutoFillCustomer]);

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

  // Search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSalesBills(salesBills);
      return;
    }

    const filtered = salesBills.filter(bill => {
      const searchTerm = query.toLowerCase();
      return (
        bill.date?.toLowerCase().includes(searchTerm) ||
        bill.billNo?.toLowerCase().includes(searchTerm) ||
        bill.loanType?.toLowerCase().includes(searchTerm) ||
        bill.customerType?.toLowerCase().includes(searchTerm) ||
        bill.acNo?.toLowerCase().includes(searchTerm) ||
        bill.customerName?.toLowerCase().includes(searchTerm) ||
        bill.acNoItem?.toLowerCase().includes(searchTerm) ||
        bill.amount?.toString().includes(searchTerm)
      );
    });
    setFilteredSalesBills(filtered);
  }, [salesBills]);

  // Update filtered bills when sales bills list changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [salesBills, handleSearch, searchQuery]);

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
        paymentStatus: 'pending',
        paymentMethod: null,
        paidAt: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };

      if (editingBill) {
        // Update existing bill
        await firestore().collection('salesBills').doc(editingBill.id).update({
          ...billData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          // Preserve existing payment info if available
          paymentStatus: editingBill.paymentStatus || 'pending',
          paymentMethod: editingBill.paymentMethod || null,
          paidAt: editingBill.paidAt || null
        });
      } else {
        // Save new bill to Firestore
        await firestore().collection('salesBills').add(billData);
      }
      
      Alert.alert(
        "Success!", 
        `Sales bill "${billNo}" has been ${editingBill ? 'updated' : 'saved'} successfully!\nCustomer: ${formData.customerName}\nAmount: ₹${formData.amount}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowForm(false);
              setEditingBill(null);
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
    setEditingBill(null);
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (bill) => {
    console.log('Editing bill:', bill); // Debug log
    setEditingBill(bill);
    
    // Pre-populate form with existing data
    const editData = {
      date: bill.date || '',
      billNo: bill.billNo || '',
      loanType: bill.loanType || '',
      customerType: bill.customerType || '',
      acNo: bill.acNo || '',
      nearCustomer: bill.nearCustomer || '',
      customerName: bill.customerName || '',
      acNoItem: bill.acNoItem || '',
      amount: bill.amount?.toString() || '',
    };
    
    console.log('Setting form data:', editData); // Debug log
    setFormData(editData);
    setShowForm(true);
  };

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setPaymentVisible(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBill(null);
    resetForm();
  };


  // Payment methods
  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment' },
    { id: 'card', name: 'Card Payment' },
    { id: 'cash', name: 'Cash Payment' },
  ];

  // Build UPI URI whenever payment method changes
  useEffect(() => {
    if (selectedPaymentMethod === 'upi' && selectedBill) {
      const uri = `upi://pay?pa=${upiId}&pn=Billing%20Application&am=${selectedBill.amount}&cu=INR&tn=Payment%20for%20Bill%20${selectedBill.billNo}%20-%20${selectedBill.customerName}`;
      setUpiUri(uri);
    } else {
      setUpiUri(null);
    }
  }, [selectedPaymentMethod, selectedBill, upiId]);

  const handleShare = async () => {
    if (!selectedBill) return;
    
    try {
      const message = `Payment Details:\n\nBill No: ${selectedBill.billNo}\nCustomer: ${selectedBill.customerName}\nAmount: ₹${selectedBill.amount}\n\nUPI ID: ${upiId}\nUPI Link: ${upiUri}`;
      
      await Share.share({
        message: message,
        title: 'Payment Details'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyUpiLink = () => {
    if (upiUri) {
      Clipboard.setString(upiUri);
      Alert.alert('Copied!', 'UPI payment link copied to clipboard');
    }
  };

  const copyUpiId = () => {
    Clipboard.setString(upiId);
    Alert.alert('Copied!', 'UPI ID copied to clipboard');
  };

  const markAsUnpaid = async (bill) => {
    Alert.alert(
      'Mark as Unpaid',
      `Are you sure you want to mark bill ${bill.billNo} as unpaid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark Unpaid',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('salesBills').doc(bill.id).update({
                paymentStatus: 'unpaid',
                paymentMethod: null,
                paidAt: null,
                updatedAt: firestore.FieldValue.serverTimestamp()
              });
              
              Alert.alert('Updated!', `Bill ${bill.billNo} marked as unpaid.`);
              loadSalesBills();
            } catch (error) {
              console.error('Error updating payment status:', error);
              Alert.alert('Error', 'Failed to update payment status.');
            }
          }
        }
      ]
    );
  };

  const confirmPayment = async () => {
    if (!selectedBill || !selectedPaymentMethod) return;
    
    try {
      // Update payment status in Firestore
      await firestore().collection('salesBills').doc(selectedBill.id).update({
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod,
        paidAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      
      Alert.alert('Success!', `Payment of ₹${selectedBill.amount} marked as received via ${selectedPaymentMethod.toUpperCase()}!`);
      
      // Refresh the bills list
      loadSalesBills();
      
      // Close modal
      setPaymentVisible(false);
      setSelectedPaymentMethod(null);
      setSelectedBill(null);
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status. Please try again.');
    }
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
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>
      
      {/* Payment Status and Method */}
      <View style={styles.paymentInfo}>
        <View style={styles.paymentStatusContainer}>
          <Text style={styles.paymentStatusLabel}>Status:</Text>
          <View style={[
            styles.paymentStatusBadge,
            item.paymentStatus === 'paid' ? styles.paidBadge :
            item.paymentStatus === 'unpaid' ? styles.unpaidBadge :
            styles.pendingBadge
          ]}>
            <Text style={[
              styles.paymentStatusText,
              item.paymentStatus === 'paid' ? styles.paidText :
              item.paymentStatus === 'unpaid' ? styles.unpaidText :
              styles.pendingText
            ]}>
              {(item.paymentStatus || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>
        
        {item.paymentMethod && (
          <View style={styles.paymentMethodContainer}>
            <Text style={styles.paymentMethodLabel}>Method:</Text>
            <View style={styles.paymentMethodBadge}>
              <Icon 
                name={item.paymentMethod === 'upi' ? 'phone-portrait-outline' : 
                      item.paymentMethod === 'card' ? 'card-outline' : 'cash-outline'} 
                size={14} 
                color="#1F49B6" 
              />
              <Text style={styles.paymentMethodText}>{item.paymentMethod?.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.billActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Icon name="create-outline" size={16} color="#ffffff" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.paymentButton}
          onPress={() => handlePayment(item)}
        >
          <Icon name="card-outline" size={16} color="#ffffff" />
          <Text style={styles.actionText}>Payment</Text>
        </TouchableOpacity>
        
        {item.paymentStatus === 'paid' && (
          <TouchableOpacity 
            style={styles.unpaidButton}
            onPress={() => markAsUnpaid(item)}
          >
            <Icon name="close-circle-outline" size={16} color="#ffffff" />
            <Text style={styles.actionText}>Mark Unpaid</Text>
          </TouchableOpacity>
        )}
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
          <Text style={styles.headerTitle}>{editingBill ? 'Edit Sales Bill' : 'Add New Sales Bill'}</Text>
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
              <Text style={styles.submitButtonText}>{editingBill ? 'Update Sales Bill' : 'Save Sales Bill'}</Text>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date, bill no, loan type, customer type, account no, customer name, item, amount..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sales Bill List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F49B6" />
          <Text style={styles.loadingText}>Loading sales bills...</Text>
        </View>
      ) : filteredSalesBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No sales bills found matching your search' : 'No sales bills found'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? 'Try adjusting your search terms' : 'Tap the button below to add your first sales bill'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSalesBills}
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

      {/* Payment Modal */}
      <Modal visible={paymentVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payment Details</Text>
            <TouchableOpacity
              onPress={() => {
                setPaymentVisible(false);
                setSelectedPaymentMethod(null);
                setSelectedBill(null);
              }}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {selectedBill && (
            <View style={styles.billSummary}>
              <Text style={styles.billSummaryTitle}>Bill Summary</Text>
              <Text style={styles.billSummaryText}>Bill No: {selectedBill.billNo}</Text>
              <Text style={styles.billSummaryText}>Customer: {selectedBill.customerName}</Text>
              <Text style={styles.totalAmount}>Total Amount: ₹{selectedBill.amount}</Text>
            </View>
          )}

          <Text style={styles.paymentMethodTitle}>Choose Payment Method:</Text>

          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodButton,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <Icon 
                name={method.id === 'upi' ? 'phone-portrait-outline' : method.id === 'card' ? 'card-outline' : 'cash-outline'} 
                size={20} 
                color={selectedPaymentMethod === method.id ? '#fff' : '#1F49B6'} 
              />
              <Text style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
              ]}>{method.name}</Text>
            </TouchableOpacity>
          ))}

          {/* UPI Payment Section */}
          {selectedPaymentMethod === 'upi' && (
            <ScrollView style={styles.upiSection} showsVerticalScrollIndicator={false}>
              <View style={styles.upiIdContainer}>
                <Text style={styles.upiIdLabel}>UPI ID:</Text>
                <View style={styles.upiIdInputContainer}>
                  <TextInput
                    style={styles.upiIdInput}
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="Enter UPI ID"
                  />
                  <TouchableOpacity onPress={copyUpiId} style={styles.copyButton}>
                    <Icon name="copy-outline" size={20} color="#1F49B6" />
                  </TouchableOpacity>
                </View>
              </View>

              {upiUri && (
                <View style={styles.qrContainer}>
                  <Text style={styles.qrTitle}>Scan QR Code to Pay</Text>
                  <View style={styles.qrCodeWrapper}>
                    <QRCode
                      value={upiUri}
                      size={Math.min(Dimensions.get('window').width * 0.6, 300)}
                      backgroundColor="white"
                      color="black"
                    />
                  </View>
                  <Text style={styles.qrAmount}>₹{selectedBill?.amount}</Text>
                  
                  <View style={styles.upiActions}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                      <Icon name="share-outline" size={20} color="#fff" />
                      <Text style={styles.shareButtonText}>Share Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.copyLinkButton} onPress={copyUpiLink}>
                      <Icon name="link-outline" size={20} color="#fff" />
                      <Text style={styles.copyLinkButtonText}>Copy UPI Link</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.paymentInstructions}>
                    <Text style={styles.instructionTitle}>Payment Instructions:</Text>
                    <Text style={styles.instructionText}>1. Scan the QR code with any UPI app</Text>
                    <Text style={styles.instructionText}>2. Verify the amount and merchant details</Text>
                    <Text style={styles.instructionText}>3. Complete the payment</Text>
                    <Text style={styles.instructionText}>4. Click "Payment Done" after successful payment</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Card Payment Section */}
          {selectedPaymentMethod === 'card' && (
            <View style={styles.cardSection}>
              <Icon name="card-outline" size={64} color="#1F49B6" />
              <Text style={styles.cardText}>Card payment processing...</Text>
              <Text style={styles.cardSubText}>Please use your card terminal or POS device</Text>
            </View>
          )}

          {/* Cash Payment Section */}
          {selectedPaymentMethod === 'cash' && (
            <View style={styles.cashSection}>
              <Icon name="cash-outline" size={64} color="#059669" />
              <Text style={styles.cashText}>Cash Payment</Text>
              <Text style={styles.cashAmount}>₹{selectedBill?.amount}</Text>
              <Text style={styles.cashSubText}>Please collect the cash amount from customer</Text>
            </View>
          )}

          {/* Action Buttons */}
          {selectedPaymentMethod && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.confirmPaymentButton}
                onPress={confirmPayment}
              >
                <Icon name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.confirmPaymentText}>Payment Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  billActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F49B6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  billSummary: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  billSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  billSummaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F49B6',
    marginTop: 8,
  },
  paymentMethodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    elevation: 1,
  },
  selectedPaymentMethod: {
    backgroundColor: '#1F49B6',
    borderColor: '#1F49B6',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F49B6',
    marginLeft: 12,
  },
  selectedPaymentMethodText: {
    color: '#fff',
  },
  upiSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  upiIdContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  upiIdLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  upiIdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiIdInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  copyButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
  },
  qrAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F49B6',
    marginTop: 16,
  },
  upiActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F49B6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyLinkButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  paymentInstructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F49B6',
    marginTop: 16,
  },
  cardSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  cashSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  cashText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 16,
  },
  cashAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 8,
  },
  cashSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  modalActions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  confirmPaymentButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  confirmPaymentText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentStatusLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  unpaidBadge: {
    backgroundColor: '#FFEBEE',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  paidText: {
    color: '#2E7D32',
  },
  unpaidText: {
    color: '#C62828',
  },
  pendingText: {
    color: '#F57C00',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 6,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paymentMethodText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F49B6',
    marginLeft: 4,
  },
  unpaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
  },
});

export default SalesBillScreen;
