// Custom React Hook for Firebase operations
import { useState, useEffect } from 'react';
import BillingFirebaseService from '../services/BillingFirebaseService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = BillingFirebaseService.subscribeToCustomers((result) => {
      if (result.success) {
        setCustomers(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCustomer = async (customerData) => {
    setLoading(true);
    const result = await BillingFirebaseService.addCustomer(customerData);
    setLoading(false);
    return result;
  };

  const updateCustomer = async (customerId, customerData) => {
    setLoading(true);
    const result = await BillingFirebaseService.updateCustomer(customerId, customerData);
    setLoading(false);
    return result;
  };

  const deleteCustomer = async (customerId) => {
    setLoading(true);
    const result = await BillingFirebaseService.deleteCustomer(customerId);
    setLoading(false);
    return result;
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

export const useSalesBills = () => {
  const [salesBills, setSalesBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = BillingFirebaseService.subscribeToSalesBills((result) => {
      if (result.success) {
        setSalesBills(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSalesBill = async (billData) => {
    setLoading(true);
    const result = await BillingFirebaseService.addSalesBill(billData);
    setLoading(false);
    return result;
  };

  const updateSalesBill = async (billId, billData) => {
    setLoading(true);
    const result = await BillingFirebaseService.updateSalesBill(billId, billData);
    setLoading(false);
    return result;
  };

  const deleteSalesBill = async (billId) => {
    setLoading(true);
    const result = await BillingFirebaseService.deleteSalesBill(billId);
    setLoading(false);
    return result;
  };

  return {
    salesBills,
    loading,
    error,
    addSalesBill,
    updateSalesBill,
    deleteSalesBill,
  };
};

export const useCollectionBills = () => {
  const [collectionBills, setCollectionBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = BillingFirebaseService.subscribeToCollectionBills((result) => {
      if (result.success) {
        setCollectionBills(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCollectionBill = async (billData) => {
    setLoading(true);
    const result = await BillingFirebaseService.addCollectionBill(billData);
    setLoading(false);
    return result;
  };

  const updateCollectionBill = async (billId, billData) => {
    setLoading(true);
    const result = await BillingFirebaseService.updateCollectionBill(billId, billData);
    setLoading(false);
    return result;
  };

  const deleteCollectionBill = async (billId) => {
    setLoading(true);
    const result = await BillingFirebaseService.deleteCollectionBill(billId);
    setLoading(false);
    return result;
  };

  return {
    collectionBills,
    loading,
    error,
    addCollectionBill,
    updateCollectionBill,
    deleteCollectionBill,
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = BillingFirebaseService.subscribeToProducts((result) => {
      if (result.success) {
        setProducts(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData) => {
    setLoading(true);
    const result = await BillingFirebaseService.addProduct(productData);
    setLoading(false);
    return result;
  };

  const updateProduct = async (productId, productData) => {
    setLoading(true);
    const result = await BillingFirebaseService.updateProduct(productId, productData);
    setLoading(false);
    return result;
  };

  const deleteProduct = async (productId) => {
    setLoading(true);
    const result = await BillingFirebaseService.deleteProduct(productId);
    setLoading(false);
    return result;
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
