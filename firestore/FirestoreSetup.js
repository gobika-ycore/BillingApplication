// Firestore Setup and Database Structure
// This file contains the database structure and setup functions for your billing application

import firestore from '@react-native-firebase/firestore';

// Database Collections Structure
export const COLLECTIONS = {
  CUSTOMERS: 'customers',
  SALES_BILLS: 'salesBills',
  COLLECTION_BILLS: 'collectionBills',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  USERS: 'users'
};

// Sample data structure for each collection
export const SAMPLE_DATA = {
  // Customer document structure
  customer: {
    acNo: 'ACC001234',
    name: 'John Doe',
    phone: '+91 9876543210',
    address: '123 Main Street, City',
    area: 'Downtown Area',
    customerGroup: 'Monday Morning Group',
    loanLimit: 50000,
    idProof: 'Aadhar Card - 1234 5678 9012',
    customerPhoto: '', // URL to photo
    location: 'Latitude, Longitude',
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp()
  },

  // Sales Bill document structure
  salesBill: {
    billNo: 'BILL001',
    date: '2024-01-15',
    billDate: firestore.Timestamp.now(),
    customerId: 'customer_doc_id',
    customerName: 'John Doe',
    acNo: 'ACC001234',
    loanType: 'Personal Loan',
    customerType: 'old', // 'new' or 'old'
    nearCustomer: 'Near landmark details',
    acNoItem: 'Item details and description',
    amount: 25000,
    items: [
      {
        name: 'Loan Amount',
        quantity: 1,
        rate: 25000,
        total: 25000
      }
    ],
    totalAmount: 25000,
    paidAmount: 0,
    balanceAmount: 25000,
    status: 'pending', // 'pending', 'paid', 'partial'
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp()
  },

  // Collection Bill document structure
  collectionBill: {
    billNo: 'COL001',
    date: '2024-01-16',
    billDate: firestore.Timestamp.now(),
    customerId: 'customer_doc_id',
    customerName: 'John Doe',
    acNo: 'ACC001234',
    collectionAmount: 5000,
    paymentMethod: 'cash', // 'cash', 'cheque', 'online'
    referenceNo: 'REF123456',
    notes: 'Monthly installment payment',
    collectedBy: 'Agent Name',
    status: 'collected', // 'collected', 'pending', 'bounced'
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp()
  },

  // Product document structure
  product: {
    name: 'Gold Loan',
    description: 'Gold loan with competitive interest rates',
    category: 'Loans',
    price: 0, // Base price if applicable
    unit: 'loan',
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp()
  },

  // Settings document structure
  settings: {
    companyName: 'Your Billing Company',
    companyAddress: 'Company Address',
    companyPhone: '+91 1234567890',
    companyEmail: 'info@company.com',
    gstNumber: 'GST123456789',
    billPrefix: 'BILL',
    collectionPrefix: 'COL',
    nextBillNumber: 1,
    nextCollectionNumber: 1,
    currency: '₹',
    dateFormat: 'DD/MM/YYYY',
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp()
  }
};

// Firestore Setup Functions
export class FirestoreSetup {
  
  // Initialize Firestore collections with sample data
  static async initializeCollections() {
    try {
      console.log('Initializing Firestore collections...');
      
      // Check if collections already exist
      const customersSnapshot = await firestore().collection(COLLECTIONS.CUSTOMERS).limit(1).get();
      
      if (customersSnapshot.empty) {
        // Add sample customer
        await firestore().collection(COLLECTIONS.CUSTOMERS).add(SAMPLE_DATA.customer);
        console.log('✅ Sample customer added');
      }

      // Add sample sales bill
      const salesSnapshot = await firestore().collection(COLLECTIONS.SALES_BILLS).limit(1).get();
      if (salesSnapshot.empty) {
        await firestore().collection(COLLECTIONS.SALES_BILLS).add(SAMPLE_DATA.salesBill);
        console.log('✅ Sample sales bill added');
      }

      // Add sample collection bill
      const collectionSnapshot = await firestore().collection(COLLECTIONS.COLLECTION_BILLS).limit(1).get();
      if (collectionSnapshot.empty) {
        await firestore().collection(COLLECTIONS.COLLECTION_BILLS).add(SAMPLE_DATA.collectionBill);
        console.log('✅ Sample collection bill added');
      }

      // Add sample product
      const productsSnapshot = await firestore().collection(COLLECTIONS.PRODUCTS).limit(1).get();
      if (productsSnapshot.empty) {
        await firestore().collection(COLLECTIONS.PRODUCTS).add(SAMPLE_DATA.product);
        console.log('✅ Sample product added');
      }

      // Add settings
      const settingsSnapshot = await firestore().collection(COLLECTIONS.SETTINGS).limit(1).get();
      if (settingsSnapshot.empty) {
        await firestore().collection(COLLECTIONS.SETTINGS).add(SAMPLE_DATA.settings);
        console.log('✅ Settings initialized');
      }

      console.log('🎉 Firestore collections initialized successfully!');
      return { success: true, message: 'Collections initialized successfully' };
      
    } catch (error) {
      console.error('❌ Error initializing Firestore:', error);
      return { success: false, error: error.message };
    }
  }

  // Test Firestore connection
  static async testConnection() {
    try {
      console.log('Testing Firestore connection...');
      
      // Try to read from Firestore
      const testDoc = await firestore().collection('test').doc('connection').set({
        timestamp: firestore.FieldValue.serverTimestamp(),
        message: 'Connection test successful'
      });

      // Clean up test document
      await firestore().collection('test').doc('connection').delete();
      
      console.log('✅ Firestore connection successful!');
      return { success: true, message: 'Firestore connection successful' };
      
    } catch (error) {
      console.error('❌ Firestore connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get collection statistics
  static async getCollectionStats() {
    try {
      const stats = {};
      
      for (const [key, collection] of Object.entries(COLLECTIONS)) {
        const snapshot = await firestore().collection(collection).get();
        stats[collection] = {
          count: snapshot.size,
          collection: collection
        };
      }
      
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all collections (use with caution!)
  static async clearAllCollections() {
    try {
      console.log('⚠️  Clearing all collections...');
      
      for (const collection of Object.values(COLLECTIONS)) {
        const snapshot = await firestore().collection(collection).get();
        const batch = firestore().batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Cleared collection: ${collection}`);
      }
      
      return { success: true, message: 'All collections cleared' };
    } catch (error) {
      console.error('Error clearing collections:', error);
      return { success: false, error: error.message };
    }
  }
}

// Firestore Indexes (for better query performance)
export const FIRESTORE_INDEXES = [
  // Customers
  { collection: 'customers', fields: ['name', 'createdAt'] },
  { collection: 'customers', fields: ['acNo', 'isActive'] },
  { collection: 'customers', fields: ['customerGroup', 'createdAt'] },
  
  // Sales Bills
  { collection: 'salesBills', fields: ['customerId', 'createdAt'] },
  { collection: 'salesBills', fields: ['billDate', 'status'] },
  { collection: 'salesBills', fields: ['customerName', 'billDate'] },
  
  // Collection Bills
  { collection: 'collectionBills', fields: ['customerId', 'createdAt'] },
  { collection: 'collectionBills', fields: ['billDate', 'status'] },
  { collection: 'collectionBills', fields: ['paymentMethod', 'billDate'] }
];

export default FirestoreSetup;
