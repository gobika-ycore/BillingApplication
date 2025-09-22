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

// FormField component with inline styles to ensure proper rendering
const FormField = React.memo(({ label, field, placeholder, multiline = false, value, onChangeText }) => (
  <View style={{
    marginBottom: 20,
  }}>
    <Text style={{
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
      lineHeight: 24,
    }}>{label}</Text>
    <TextInput
      style={[
        {
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
          textAlignVertical: multiline ? "top" : "center",
        },
        multiline && {
          height: 80,
          textAlignVertical: "top",
        }
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
      keyboardType={field === 'phone' || field === 'loanLimit' ? 'numeric' : 'default'}
      placeholderTextColor="#999"
    />
  </View>
));

const CustomerDataScreen = ({ navigation }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    acNo: "",
    customerGroup: "",
    area: "",
    name: "",
    phone: "",
    address: "",
    loanLimit: "",
    idProof: "",
    customerPhoto: "",
    location: "",
  });

  // Load customers from Firestore
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore().collection('customers').orderBy('createdAt', 'desc').get();
      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load customers when component mounts
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Customer name is required');
    if (!formData.phone.trim()) errors.push('Phone number is required');
    if (!formData.acNo.trim()) errors.push('Account number is required');
    if (!formData.customerGroup.trim()) errors.push('Customer group is required');
    if (!formData.area.trim()) errors.push('Area is required');
    if (!formData.address.trim()) errors.push('Address is required');
    
    // Validate phone number format
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    // Validate loan limit
    if (formData.loanLimit && isNaN(parseFloat(formData.loanLimit))) {
      errors.push('Loan limit must be a valid number');
    }
    
    return errors;
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
      // Generate account number if not provided
      const acNo = formData.acNo || `ACC${Date.now().toString().slice(-6)}`;
      
      // Prepare data for Firestore
      const customerData = {
        ...formData,
        acNo,
        loanLimit: parseFloat(formData.loanLimit) || 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      // Save to Firestore
      const docRef = await firestore().collection('customers').add(customerData);
      
      Alert.alert(
        "Success!", 
        `Customer "${formData.name}" has been saved successfully!\nAccount No: ${acNo}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowForm(false);
              resetForm();
              loadCustomers(); // Refresh the customer list
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Error', 'Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      acNo: "",
      customerGroup: "",
      area: "",
      name: "",
      phone: "",
      address: "",
      loanLimit: "",
      idProof: "",
      customerPhoto: "",
      location: "",
    });
  };

  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };


  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerAcNo}>{item.acNo}</Text>
      </View>
      <Text style={styles.customerPhone}>{item.phone}</Text>
      <Text style={styles.customerArea}>{item.area}</Text>
      <View style={styles.customerFooter}>
        <Text style={styles.customerGroup}>{item.customerGroup}</Text>
        <Text style={styles.customerLimit}>{item.loanLimit}</Text>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>Add New Customer</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Icon name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FormField 
            label="Ac No" 
            field="acNo" 
            placeholder="Enter account number" 
            value={formData.acNo}
            onChangeText={(value) => handleInputChange('acNo', value)}
          />
          
          <FormField 
            label="Customers Group " 
            field="customerGroup" 
            placeholder="Enter customer group details" 
            value={formData.customerGroup}
            onChangeText={(value) => handleInputChange('customerGroup', value)}
          />
          
          <FormField 
            label="Area " 
            field="area" 
            placeholder="Enter area details" 
            value={formData.area}
            onChangeText={(value) => handleInputChange('area', value)}
          />
          
          <FormField 
            label="Name" 
            field="name" 
            placeholder="Enter customer name" 
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
          
          <FormField 
            label="Phone" 
            field="phone" 
            placeholder="Enter phone number" 
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
          />
          
          <FormField 
            label="Address" 
            field="address" 
            placeholder="Enter full address" 
            multiline={true}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
          />
          
          <FormField 
            label="Loan Limit" 
            field="loanLimit" 
            placeholder="Enter loan limit amount" 
            value={formData.loanLimit}
            onChangeText={(value) => handleInputChange('loanLimit', value)}
          />
          
          <FormField 
            label="Id proof" 
            field="idProof" 
            placeholder="Enter ID proof details" 
            value={formData.idProof}
            onChangeText={(value) => handleInputChange('idProof', value)}
          />
          
          <View style={{
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#333",
              marginBottom: 8,
              lineHeight: 24,
            }}>Customer photo</Text>
            <TouchableOpacity style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e1e5e9",
              borderStyle: "dashed",
              minHeight: 48,
            }}>
              <Icon name="camera-outline" size={24} color="#1E40AF" />
              <Text style={{
                marginLeft: 8,
                fontSize: 16,
                color: "#1E40AF",
                fontWeight: "500",
              }}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          <FormField 
            label="Location" 
            field="location" 
            placeholder="Enter location details" 
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
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
              <Text style={styles.submitButtonText}>Save Customer Data</Text>
            )}
          </TouchableOpacity>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  // Customer List View
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
        <Text style={styles.headerTitle}>Customer Data</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleAddNew}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F49B6" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No customers found</Text>
          <Text style={styles.emptySubText}>Tap the button below to add your first customer</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadCustomers}
        />
      )}

      {/* Add New Customer Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Icon name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Customer</Text>
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
  photoButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderStyle: "dashed",
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "500",
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
  customerCard: {
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
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  customerAcNo: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "600",
  },
  customerPhone: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  customerArea: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  customerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerGroup: {
    fontSize: 12,
    color: "#999",
    flex: 1,
  },
  customerLimit: {
    fontSize: 16,
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
});

export default CustomerDataScreen;
