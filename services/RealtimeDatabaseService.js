// Firebase Realtime Database Service (Alternative to Firestore - No Billing Required)
// This service provides the same functionality as Firestore but uses Realtime Database

import database from '@react-native-firebase/database';

class RealtimeDatabaseService {
  constructor() {
    this.database = database();
  }

  // Customer Operations
  async addCustomer(customerData) {
    try {
      const customersRef = this.database.ref('customers');
      const newCustomerRef = customersRef.push();
      
      const dataToSave = {
        ...customerData,
        id: newCustomerRef.key,
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };
      
      await newCustomerRef.set(dataToSave);
      return { success: true, id: newCustomerRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateCustomer(customerId, customerData) {
    try {
      const customerRef = this.database.ref(`customers/${customerId}`);
      await customerRef.update({
        ...customerData,
        updatedAt: database.ServerValue.TIMESTAMP
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteCustomer(customerId) {
    try {
      const customerRef = this.database.ref(`customers/${customerId}`);
      await customerRef.remove();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCustomer(customerId) {
    try {
      const customerRef = this.database.ref(`customers/${customerId}`);
      const snapshot = await customerRef.once('value');
      
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: false, error: 'Customer not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllCustomers() {
    try {
      const customersRef = this.database.ref('customers');
      const snapshot = await customersRef.orderByChild('name').once('value');
      
      const customers = [];
      snapshot.forEach(child => {
        customers.push({
          id: child.key,
          ...child.val()
        });
      });
      
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sales Bill Operations
  async addSalesBill(billData) {
    try {
      const billsRef = this.database.ref('salesBills');
      const newBillRef = billsRef.push();
      
      const dataToSave = {
        ...billData,
        id: newBillRef.key,
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };
      
      await newBillRef.set(dataToSave);
      return { success: true, id: newBillRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateSalesBill(billId, billData) {
    try {
      const billRef = this.database.ref(`salesBills/${billId}`);
      await billRef.update({
        ...billData,
        updatedAt: database.ServerValue.TIMESTAMP
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteSalesBill(billId) {
    try {
      const billRef = this.database.ref(`salesBills/${billId}`);
      await billRef.remove();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllSalesBills() {
    try {
      const billsRef = this.database.ref('salesBills');
      const snapshot = await billsRef.orderByChild('createdAt').once('value');
      
      const bills = [];
      snapshot.forEach(child => {
        bills.push({
          id: child.key,
          ...child.val()
        });
      });
      
      // Reverse to get newest first
      return { success: true, data: bills.reverse() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Collection Bill Operations
  async addCollectionBill(billData) {
    try {
      const billsRef = this.database.ref('collectionBills');
      const newBillRef = billsRef.push();
      
      const dataToSave = {
        ...billData,
        id: newBillRef.key,
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };
      
      await newBillRef.set(dataToSave);
      return { success: true, id: newBillRef.key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllCollectionBills() {
    try {
      const billsRef = this.database.ref('collectionBills');
      const snapshot = await billsRef.orderByChild('createdAt').once('value');
      
      const bills = [];
      snapshot.forEach(child => {
        bills.push({
          id: child.key,
          ...child.val()
        });
      });
      
      return { success: true, data: bills.reverse() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time listeners
  subscribeToCustomers(callback) {
    const customersRef = this.database.ref('customers');
    
    const listener = customersRef.on('value', (snapshot) => {
      const customers = [];
      snapshot.forEach(child => {
        customers.push({
          id: child.key,
          ...child.val()
        });
      });
      callback({ success: true, data: customers });
    }, (error) => {
      callback({ success: false, error: error.message });
    });

    // Return unsubscribe function
    return () => customersRef.off('value', listener);
  }

  subscribeToSalesBills(callback) {
    const billsRef = this.database.ref('salesBills');
    
    const listener = billsRef.on('value', (snapshot) => {
      const bills = [];
      snapshot.forEach(child => {
        bills.push({
          id: child.key,
          ...child.val()
        });
      });
      callback({ success: true, data: bills.reverse() });
    }, (error) => {
      callback({ success: false, error: error.message });
    });

    return () => billsRef.off('value', listener);
  }

  subscribeToCollectionBills(callback) {
    const billsRef = this.database.ref('collectionBills');
    
    const listener = billsRef.on('value', (snapshot) => {
      const bills = [];
      snapshot.forEach(child => {
        bills.push({
          id: child.key,
          ...child.val()
        });
      });
      callback({ success: true, data: bills.reverse() });
    }, (error) => {
      callback({ success: false, error: error.message });
    });

    return () => billsRef.off('value', listener);
  }

  // Test connection
  async testConnection() {
    try {
      const testRef = this.database.ref('test');
      await testRef.set({
        timestamp: database.ServerValue.TIMESTAMP,
        message: 'Connection test successful'
      });
      
      // Clean up
      await testRef.remove();
      
      return { success: true, message: 'Realtime Database connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new RealtimeDatabaseService();
