// Billing Firebase Service - Specific service for billing operations
import FirebaseService from './FirebaseService';

class BillingFirebaseService {
  // Customer Operations
  async addCustomer(customerData) {
    return await FirebaseService.addDocument('customers', customerData);
  }

  async updateCustomer(customerId, customerData) {
    return await FirebaseService.updateDocument('customers', customerId, customerData);
  }

  async deleteCustomer(customerId) {
    return await FirebaseService.deleteDocument('customers', customerId);
  }

  async getCustomer(customerId) {
    return await FirebaseService.getDocument('customers', customerId);
  }

  async getAllCustomers() {
    return await FirebaseService.getCollection('customers', 'name', 'asc');
  }

  // Sales Bill Operations
  async addSalesBill(billData) {
    return await FirebaseService.addDocument('salesBills', billData);
  }

  async updateSalesBill(billId, billData) {
    return await FirebaseService.updateDocument('salesBills', billId, billData);
  }

  async deleteSalesBill(billId) {
    return await FirebaseService.deleteDocument('salesBills', billId);
  }

  async getSalesBill(billId) {
    return await FirebaseService.getDocument('salesBills', billId);
  }

  async getAllSalesBills() {
    return await FirebaseService.getCollection('salesBills', 'createdAt', 'desc');
  }

  // Collection Bill Operations
  async addCollectionBill(billData) {
    return await FirebaseService.addDocument('collectionBills', billData);
  }

  async updateCollectionBill(billId, billData) {
    return await FirebaseService.updateDocument('collectionBills', billId, billData);
  }

  async deleteCollectionBill(billId) {
    return await FirebaseService.deleteDocument('collectionBills', billId);
  }

  async getCollectionBill(billId) {
    return await FirebaseService.getDocument('collectionBills', billId);
  }

  async getAllCollectionBills() {
    return await FirebaseService.getCollection('collectionBills', 'createdAt', 'desc');
  }

  // Product/Item Operations
  async addProduct(productData) {
    return await FirebaseService.addDocument('products', productData);
  }

  async updateProduct(productId, productData) {
    return await FirebaseService.updateDocument('products', productId, productData);
  }

  async deleteProduct(productId) {
    return await FirebaseService.deleteDocument('products', productId);
  }

  async getProduct(productId) {
    return await FirebaseService.getDocument('products', productId);
  }

  async getAllProducts() {
    return await FirebaseService.getCollection('products', 'name', 'asc');
  }

  // Reports and Analytics
  async getSalesBillsByDateRange(startDate, endDate) {
    try {
      const snapshot = await FirebaseService.firestore
        .collection('salesBills')
        .where('billDate', '>=', startDate)
        .where('billDate', '<=', endDate)
        .orderBy('billDate', 'desc')
        .get();
      
      const bills = [];
      snapshot.forEach(doc => {
        bills.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: bills };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCollectionBillsByDateRange(startDate, endDate) {
    try {
      const snapshot = await FirebaseService.firestore
        .collection('collectionBills')
        .where('billDate', '>=', startDate)
        .where('billDate', '<=', endDate)
        .orderBy('billDate', 'desc')
        .get();
      
      const bills = [];
      snapshot.forEach(doc => {
        bills.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, data: bills };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCustomerBills(customerId) {
    try {
      const salesSnapshot = await FirebaseService.firestore
        .collection('salesBills')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const collectionSnapshot = await FirebaseService.firestore
        .collection('collectionBills')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const salesBills = [];
      const collectionBills = [];
      
      salesSnapshot.forEach(doc => {
        salesBills.push({ id: doc.id, type: 'sales', ...doc.data() });
      });
      
      collectionSnapshot.forEach(doc => {
        collectionBills.push({ id: doc.id, type: 'collection', ...doc.data() });
      });
      
      return { 
        success: true, 
        data: { 
          salesBills, 
          collectionBills,
          totalSales: salesBills.length,
          totalCollections: collectionBills.length
        } 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time subscriptions
  subscribeToCustomers(callback) {
    return FirebaseService.subscribeToCollection('customers', callback, 'name', 'asc');
  }

  subscribeToSalesBills(callback) {
    return FirebaseService.subscribeToCollection('salesBills', callback, 'createdAt', 'desc');
  }

  subscribeToCollectionBills(callback) {
    return FirebaseService.subscribeToCollection('collectionBills', callback, 'createdAt', 'desc');
  }

  subscribeToProducts(callback) {
    return FirebaseService.subscribeToCollection('products', callback, 'name', 'asc');
  }
}

export default new BillingFirebaseService();
