const express = require('express');
const { SalesBill, SalesBillItem, Customer, CollectionBill } = require('../models');
const { Op, sequelize } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const salesBillItemSchema = Joi.object({
  item_name: Joi.string().min(1).max(100).required(),
  item_code: Joi.string().max(50).optional().allow(''),
  description: Joi.string().optional().allow(''),
  quantity: Joi.number().min(0.001).required(),
  unit: Joi.string().max(20).default('pcs'),
  rate: Joi.number().min(0).required(),
  tax_rate: Joi.number().min(0).max(100).default(0),
  discount_rate: Joi.number().min(0).max(100).default(0)
});

const salesBillSchema = Joi.object({
  bill_number: Joi.string().max(20).required(),
  customer_id: Joi.number().integer().required(),
  bill_date: Joi.date().required(),
  due_date: Joi.date().optional(),
  notes: Joi.string().optional().allow(''),
  terms_conditions: Joi.string().optional().allow(''),
  items: Joi.array().items(salesBillItemSchema).min(1).required()
});

const updateSalesBillSchema = salesBillSchema.fork(['bill_number'], (schema) => schema.optional());

// Helper function to calculate bill totals
const calculateBillTotals = (items) => {
  let subtotal = 0;
  let totalTaxAmount = 0;
  let totalDiscountAmount = 0;

  const calculatedItems = items.map(item => {
    const amount = item.quantity * item.rate;
    const discountAmount = (amount * item.discount_rate) / 100;
    const taxableAmount = amount - discountAmount;
    const taxAmount = (taxableAmount * item.tax_rate) / 100;
    const lineTotal = taxableAmount + taxAmount;

    subtotal += amount;
    totalDiscountAmount += discountAmount;
    totalTaxAmount += taxAmount;

    return {
      ...item,
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
};

// GET /api/sales-bills - Get all sales bills with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const paymentStatus = req.query.payment_status;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { bill_number: { [Op.like]: `%${search}%` } },
        { '$customer.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.bill_status = status;
    }

    if (paymentStatus) {
      whereClause.payment_status = paymentStatus;
    }

    const { count, rows } = await SalesBill.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'customer_code']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        salesBills: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sales bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales bills',
      error: error.message
    });
  }
});

// GET /api/sales-bills/:id - Get sales bill by ID with items
router.get('/:id', async (req, res) => {
  try {
    const salesBill = await SalesBill.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBillItem,
          as: 'items'
        },
        {
          model: CollectionBill,
          as: 'collections'
        }
      ]
    });

    if (!salesBill) {
      return res.status(404).json({
        success: false,
        message: 'Sales bill not found'
      });
    }

    res.json({
      success: true,
      data: salesBill
    });
  } catch (error) {
    console.error('Error fetching sales bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales bill',
      error: error.message
    });
  }
});

// POST /api/sales-bills - Create new sales bill
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { error, value } = salesBillSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(value.customer_id);
    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate totals
    const calculations = calculateBillTotals(value.items);
    
    // Create sales bill
    const salesBillData = {
      ...value,
      subtotal: calculations.subtotal,
      tax_amount: calculations.tax_amount,
      discount_amount: calculations.discount_amount,
      total_amount: calculations.total_amount,
      balance_amount: calculations.balance_amount
    };

    delete salesBillData.items;

    const salesBill = await SalesBill.create(salesBillData, { transaction });

    // Create sales bill items
    const itemsData = calculations.items.map(item => ({
      ...item,
      sales_bill_id: salesBill.id
    }));

    await SalesBillItem.bulkCreate(itemsData, { transaction });

    await transaction.commit();

    // Fetch the created bill with items
    const createdBill = await SalesBill.findByPk(salesBill.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBillItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sales bill created successfully',
      data: createdBill
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating sales bill:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Bill number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating sales bill',
      error: error.message
    });
  }
});

// PUT /api/sales-bills/:id - Update sales bill
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { error, value } = updateSalesBillSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const salesBill = await SalesBill.findByPk(req.params.id);
    if (!salesBill) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sales bill not found'
      });
    }

    // Calculate totals if items are provided
    let calculations = null;
    if (value.items) {
      calculations = calculateBillTotals(value.items);
    }

    // Update sales bill
    const updateData = { ...value };
    if (calculations) {
      updateData.subtotal = calculations.subtotal;
      updateData.tax_amount = calculations.tax_amount;
      updateData.discount_amount = calculations.discount_amount;
      updateData.total_amount = calculations.total_amount;
      updateData.balance_amount = calculations.balance_amount;
    }

    delete updateData.items;

    await salesBill.update(updateData, { transaction });

    // Update items if provided
    if (value.items && calculations) {
      // Delete existing items
      await SalesBillItem.destroy({
        where: { sales_bill_id: req.params.id },
        transaction
      });

      // Create new items
      const itemsData = calculations.items.map(item => ({
        ...item,
        sales_bill_id: salesBill.id
      }));

      await SalesBillItem.bulkCreate(itemsData, { transaction });
    }

    await transaction.commit();

    // Fetch updated bill with items
    const updatedBill = await SalesBill.findByPk(salesBill.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBillItem,
          as: 'items'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Sales bill updated successfully',
      data: updatedBill
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating sales bill:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Bill number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating sales bill',
      error: error.message
    });
  }
});

// DELETE /api/sales-bills/:id - Delete sales bill
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const salesBill = await SalesBill.findByPk(req.params.id);
    if (!salesBill) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sales bill not found'
      });
    }

    // Check if there are any collections against this bill
    const collectionCount = await CollectionBill.count({
      where: { sales_bill_id: req.params.id }
    });

    if (collectionCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete sales bill with existing collections'
      });
    }

    // Delete items first
    await SalesBillItem.destroy({
      where: { sales_bill_id: req.params.id },
      transaction
    });

    // Delete sales bill
    await salesBill.destroy({ transaction });

    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Sales bill deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting sales bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sales bill',
      error: error.message
    });
  }
});

// GET /api/sales-bills/reports/summary - Get sales summary
router.get('/reports/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.bill_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const summary = await SalesBill.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_bills'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total_paid'],
        [sequelize.fn('SUM', sequelize.col('balance_amount')), 'total_outstanding']
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

    res.json({
      success: true,
      data: {
        summary: summary[0],
        status_wise: statusWise
      }
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales summary',
      error: error.message
    });
  }
});

module.exports = router;
