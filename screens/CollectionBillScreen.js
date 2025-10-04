import React, { useState, useCallback, useEffect } from "react";
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

const CollectionBillScreen = ({ navigation }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collectionBills, setCollectionBills] = useState([]);
  const [filteredCollectionBills, setFilteredCollectionBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    date: "",
    billNo: "",
    acNo: "",
    customerName: "",
    receiptNo: "",
    collectionAmount: "",
    paymentMethod: "",
  });

  // Load collection bills from Firestore
  const loadCollectionBills = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('collectionBills').orderBy('createdAt', 'desc').get();
      const billsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollectionBills(billsList);
      setFilteredCollectionBills(billsList);
    } catch (error) {
      console.error('Error loading collection bills:', error);
      Alert.alert('Error', 'Failed to load collection bills. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fill date, bill number, and receipt number
  const generateBillNumber = useCallback(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = today.getTime().toString().slice(-4);
    return `BILL${timeStr}`;
  }, []);

  const generateReceiptNumber = useCallback(() => {
    const today = new Date();
    const timeStr = today.getTime().toString().slice(-4);
    return `REC${timeStr}`;
  }, []);

  const autoFillDefaults = useCallback(() => {
    if (!editingBill) {
      const today = new Date().toISOString().split('T')[0];
      const billNo = generateBillNumber();
      const receiptNo = generateReceiptNumber();
      
      setFormData(prev => ({
        ...prev,
        date: prev.date || today,
        billNo: prev.billNo || billNo,
        receiptNo: prev.receiptNo || receiptNo,
      }));
    }
  }, [generateBillNumber, generateReceiptNumber, editingBill]);

  // Load collection bills when component mounts
  useEffect(() => {
    loadCollectionBills();
  }, [loadCollectionBills]);

  // Auto-fill defaults when form is opened for new bill
  useEffect(() => {
    if (showForm && !editingBill) {
      autoFillDefaults();
    }
  }, [showForm, editingBill, autoFillDefaults]);


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
    if (!formData.collectionAmount.trim()) errors.push('Collection amount is required');
    if (!formData.date.trim()) errors.push('Date is required');
    if (!formData.receiptNo.trim()) errors.push('Receipt number is required');
    
    // Validate amount
    if (formData.collectionAmount && isNaN(parseFloat(formData.collectionAmount))) {
      errors.push('Collection amount must be a valid number');
    }
    
    if (formData.collectionAmount && parseFloat(formData.collectionAmount) <= 0) {
      errors.push('Collection amount must be greater than 0');
    }
    
    return errors;
  };

  // Search functionality
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCollectionBills(collectionBills);
      return;
    }

    const filtered = collectionBills.filter(bill => {
      const searchTerm = query.toLowerCase();
      return (
        bill.date?.toLowerCase().includes(searchTerm) ||
        bill.billNo?.toLowerCase().includes(searchTerm) ||
        bill.acNo?.toLowerCase().includes(searchTerm) ||
        bill.customerName?.toLowerCase().includes(searchTerm) ||
        bill.receiptNo?.toLowerCase().includes(searchTerm) ||
        bill.collectionAmount?.toString().includes(searchTerm) ||
        bill.paymentMethod?.toLowerCase().includes(searchTerm)
      );
    });
    setFilteredCollectionBills(filtered);
  }, [collectionBills]);

  // Update filtered bills when collection bills list changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [collectionBills, handleSearch, searchQuery]);

  const resetForm = () => {
    setFormData({
      date: "",
      billNo: "",
      acNo: "",
      customerName: "",
      receiptNo: "",
      collectionAmount: "",
      paymentMethod: "",
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
      const billNo = formData.billNo || `COL${Date.now().toString().slice(-6)}`;
      const receiptNo = formData.receiptNo || `RCP${Date.now().toString().slice(-6)}`;
      
      // Prepare data for Firestore
      const billData = {
        ...formData,
        billNo,
        receiptNo,
        collectionAmount: parseFloat(formData.collectionAmount),
        paymentMethod: formData.paymentMethod || 'cash',
        status: 'collected',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };

      if (editingBill) {
        // Update existing bill
        await firestore().collection('collectionBills').doc(editingBill.id).update({
          ...billData,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Save new bill to Firestore
        await firestore().collection('collectionBills').add(billData);
      }
      
      Alert.alert(
        "Success!", 
        `Collection bill "${billNo}" has been ${editingBill ? 'updated' : 'saved'} successfully!\nCustomer: ${formData.customerName}\nAmount: ₹${formData.collectionAmount}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowForm(false);
              setEditingBill(null);
              resetForm();
              loadCollectionBills(); // Refresh the bills list
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving collection bill:', error);
      Alert.alert('Error', 'Failed to save collection bill. Please try again.');
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
    setEditingBill(bill);
    setFormData({
      date: bill.date || '',
      billNo: bill.billNo || '',
      acNo: bill.acNo || '',
      customerName: bill.customerName || '',
      receiptNo: bill.receiptNo || '',
      collectionAmount: bill.collectionAmount?.toString() || '',
      paymentMethod: bill.paymentMethod || '',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBill(null);
    resetForm();
  };
  const FormField = ({ label, field, placeholder, multiline = false }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          multiline && styles.multilineInput,
          { color: '#000000' }
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor="#999"
        selectionColor="#1F49B6"
      />
    </View>
  );

  const renderCollectionBillItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.collectionCard}
      onPress={() => handleEdit(item)}
      activeOpacity={0.7}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.billNo}>{item.billNo}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.acNo}>{item.acNo}</Text>
      <View style={styles.collectionFooter}>
        <Text style={styles.receiptNo}>{item.receiptNo}</Text>
        <Text style={styles.collectionAmount}>₹{item.collectionAmount}</Text>
      </View>
      <View style={styles.editIndicator}>
        <Icon name="create-outline" size={16} color="#1E40AF" />
        <Text style={styles.editText}>Tap to edit</Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{editingBill ? 'Edit Collection Bill' : 'Add New Collection Bill'}</Text>
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
          />
          
          <FormField 
            label="Bill no" 
            field="billNo" 
            placeholder="Enter bill number" 
          />
          
          <FormField 
            label="Ac No" 
            field="acNo" 
            placeholder="Enter account number" 
          />
          
          <FormField 
            label="Customer name" 
            field="customerName" 
            placeholder="Enter customer name" 
          />
          
          <FormField 
            label="Receipt No ( each Every Ac No )" 
            field="receiptNo" 
            placeholder="Enter receipt number" 
          />
          
          <FormField 
            label="Collection Amount" 
            field="collectionAmount" 
            placeholder="Enter collection amount" 
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
              <Text style={styles.submitButtonText}>{editingBill ? 'Update Collection Bill' : 'Save Collection Bill'}</Text>
            )}
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  // Collection Bill List View
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
        <Text style={styles.headerTitle}>Collection Bill</Text>
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
            placeholder="Search by date, bill no, account no, customer name, receipt no, amount, payment method..."
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

      {/* Collection Bill List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F49B6" />
          <Text style={styles.loadingText}>Loading collection bills...</Text>
        </View>
      ) : filteredCollectionBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No collection bills found matching your search' : 'No collection bills found'}
          </Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? 'Try adjusting your search terms' : 'Tap the button below to add your first collection bill'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCollectionBills}
          renderItem={renderCollectionBillItem}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadCollectionBills}
        />
      )}

      {/* Add New Collection Bill Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Icon name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Collection Bill</Text>
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
  collectionCard: {
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
  collectionHeader: {
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
  date: {
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
  collectionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptNo: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  collectionAmount: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
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
  editIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  editText: {
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default CollectionBillScreen;
