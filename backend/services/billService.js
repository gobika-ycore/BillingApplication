const { SalesBill, SalesBillItem, Customer, CollectionBill } = require('../models');
const { Op, sequelize } = require('sequelize');

class BillService {
  /**
   * Generate next bill number
   * @param {string} prefix - Bill number prefix (e.g., 'INV', 'COL')
   * @param {string} tableName - Table name to check for existing numbers
   * @param {string} columnName - Column name containing the bill number
   * @returns {Promise<string>} Next available bill number
   */
  static async generateNextBillNumber(prefix = 'INV', tableName = 'sales_bills', columnName = 'bill_number') {
    try {
      const query = `
        SELECT ${columnName} 
        FROM ${tableName} 
        WHERE ${columnName} LIKE '${prefix}%' 
        ORDER BY ${columnName} DESC 
        LIMIT 1
      `;
      
      const [results] = await sequelize.query(query);
      
      if (results.length === 0) {
        return `${prefix}0001`;
      }
      
      const lastNumber = results[0][columnName];
      const numberPart = lastNumber.replace(prefix, '');
      const nextNumber = parseInt(numberPart) + 1;
      
      return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating bill number:', error);
      throw error;
    }
  }

  /**
   * Calculate outstanding balance for a customer
   * @param {number} customerId - Customer ID
   * @returns {Promise<Object>} Outstanding balance details
   */
  static async calculateCustomerOutstanding(customerId) {
    try {
      const outstandingBills = await SalesBill.findAll({
        where: {
          customer_id: customerId,
          balance_amount: { [Op.gt]: 0 }
        },
        attributes: ['id', 'bill_number', 'bill_date', 'total_amount', 'paid_amount', 'balance_amount'],
        order: [['bill_date', 'ASC']]
      });

      const totalOutstanding = outstandingBills.reduce((sum, bill) => {
        return sum + parseFloat(bill.balance_amount);
      }, 0);

      const overdueAmount = outstandingBills
        .filter(bill => {
          const dueDate = new Date(bill.due_date);
          return dueDate < new Date();
        })
        .reduce((sum, bill) => sum + parseFloat(bill.balance_amount), 0);

      return {
        total_outstanding: parseFloat(totalOutstanding.toFixed(2)),
        overdue_amount: parseFloat(overdueAmount.toFixed(2)),
        outstanding_bills_count: outstandingBills.length,
        outstanding_bills: outstandingBills
      };
    } catch (error) {
      console.error('Error calculating customer outstanding:', error);
      throw error;
    }
  }

  /**
   * Update payment status based on paid amount
   * @param {Object} salesBill - Sales bill instance
   * @returns {string} Payment status
   */
  static determinePaymentStatus(salesBill) {
    const totalAmount = parseFloat(salesBill.total_amount);
    const paidAmount = parseFloat(salesBill.paid_amount);
    const balanceAmount = parseFloat(salesBill.balance_amount);

    if (balanceAmount <= 0 || paidAmount >= totalAmount) {
      return 'paid';
    } else if (paidAmount > 0) {
      return 'partial';
    } else {
      return 'pending';
    }
  }

  /**
   * Get sales summary for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Sales summary
   */
  static async getSalesSummary(startDate, endDate) {
    try {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.bill_date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const summary = await SalesBill.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_bills'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
          [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total_paid'],
          [sequelize.fn('SUM', sequelize.col('balance_amount')), 'total_outstanding'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'average_bill_amount']
        ],
        raw: true
      });

      const statusWise = await SalesBill.findAll({
        where: whereClause,
        attributes: [
          'payment_status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'amount']
        ],
        group: ['payment_status'],
        raw: true
      });

      const topCustomers = await SalesBill.findAll({
        where: whereClause,
        include: [{
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'customer_code']
        }],
        attributes: [
          'customer_id',
          [sequelize.fn('COUNT', sequelize.col('SalesBill.id')), 'bill_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        group: ['customer_id', 'customer.id'],
        order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
        limit: 10,
        raw: false
      });

      return {
        summary: {
          ...summary[0],
          total_sales: parseFloat(summary[0].total_sales || 0).toFixed(2),
          total_paid: parseFloat(summary[0].total_paid || 0).toFixed(2),
          total_outstanding: parseFloat(summary[0].total_outstanding || 0).toFixed(2),
          average_bill_amount: parseFloat(summary[0].average_bill_amount || 0).toFixed(2)
        },
        status_wise: statusWise.map(item => ({
          ...item,
          amount: parseFloat(item.amount || 0).toFixed(2)
        })),
        top_customers: topCustomers.map(item => ({
          customer: item.customer,
          bill_count: parseInt(item.dataValues.bill_count),
          total_amount: parseFloat(item.dataValues.total_amount).toFixed(2)
        }))
      };
    } catch (error) {
      console.error('Error getting sales summary:', error);
      throw error;
    }
  }

  /**
   * Get collection summary for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Collection summary
   */
  static async getCollectionSummary(startDate, endDate) {
    try {
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.collection_date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const summary = await CollectionBill.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_collections'],
          [sequelize.fn('SUM', sequelize.col('collection_amount')), 'total_amount'],
          [sequelize.fn('AVG', sequelize.col('collection_amount')), 'average_collection_amount']
        ],
        raw: true
      });

      const methodWise = await CollectionBill.findAll({
        where: whereClause,
        attributes: [
          'payment_method',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('collection_amount')), 'amount']
        ],
        group: ['payment_method'],
        raw: true
      });

      const statusWise = await CollectionBill.findAll({
        where: whereClause,
        attributes: [
          'collection_status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('collection_amount')), 'amount']
        ],
        group: ['collection_status'],
        raw: true
      });

      return {
        summary: {
          ...summary[0],
          total_amount: parseFloat(summary[0].total_amount || 0).toFixed(2),
          average_collection_amount: parseFloat(summary[0].average_collection_amount || 0).toFixed(2)
        },
        method_wise: methodWise.map(item => ({
          ...item,
          amount: parseFloat(item.amount || 0).toFixed(2)
        })),
        status_wise: statusWise.map(item => ({
          ...item,
          amount: parseFloat(item.amount || 0).toFixed(2)
        }))
      };
    } catch (error) {
      console.error('Error getting collection summary:', error);
      throw error;
    }
  }

  /**
   * Validate bill items and calculate totals
   * @param {Array} items - Array of bill items
   * @returns {Object} Calculated totals and validated items
   */
  static calculateBillTotals(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required and cannot be empty');
    }

    let subtotal = 0;
    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    const calculatedItems = items.map((item, index) => {
      // Validate required fields
      if (!item.item_name || !item.quantity || !item.rate) {
        throw new Error(`Item at index ${index} is missing required fields`);
      }

      const quantity = parseFloat(item.quantity);
      const rate = parseFloat(item.rate);
      const taxRate = parseFloat(item.tax_rate || 0);
      const discountRate = parseFloat(item.discount_rate || 0);

      // Validate numeric values
      if (quantity <= 0 || rate < 0 || taxRate < 0 || discountRate < 0) {
        throw new Error(`Item at index ${index} has invalid numeric values`);
      }

      if (taxRate > 100 || discountRate > 100) {
        throw new Error(`Item at index ${index} has tax or discount rate exceeding 100%`);
      }

      const amount = quantity * rate;
      const discountAmount = (amount * discountRate) / 100;
      const taxableAmount = amount - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const lineTotal = taxableAmount + taxAmount;

      subtotal += amount;
      totalDiscountAmount += discountAmount;
      totalTaxAmount += taxAmount;

      return {
        ...item,
        quantity,
        rate,
        tax_rate: taxRate,
        discount_rate: discountRate,
        amount: parseFloat(amount.toFixed(2)),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        line_total: parseFloat(lineTotal.toFixed(2))
      };
    });

    const totalAmount = subtotal - totalDiscountAmount + totalTaxAmount;

    return {
      items: calculatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_amount: parseFloat(totalTaxAmount.toFixed(2)),
      discount_amount: parseFloat(totalDiscountAmount.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      balance_amount: parseFloat(totalAmount.toFixed(2))
    };
  }
}

module.exports = BillService;
