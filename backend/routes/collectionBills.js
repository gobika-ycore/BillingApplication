const express = require('express');
const { CollectionBill, Customer, SalesBill } = require('../models');
const { Op, sequelize } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const collectionBillSchema = Joi.object({
  collection_number: Joi.string().max(20).required(),
  customer_id: Joi.number().integer().required(),
  sales_bill_id: Joi.number().integer().optional().allow(null),
  collection_date: Joi.date().required(),
  collection_amount: Joi.number().min(0.01).required(),
  payment_method: Joi.string().valid('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other').default('cash'),
  reference_number: Joi.string().max(50).optional().allow(''),
  bank_name: Joi.string().max(100).optional().allow(''),
  cheque_date: Joi.date().optional().allow(null),
  notes: Joi.string().optional().allow(''),
  collected_by: Joi.string().max(100).optional().allow('')
});

const updateCollectionBillSchema = collectionBillSchema.fork(['collection_number'], (schema) => schema.optional());

// GET /api/collection-bills - Get all collection bills with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;
    const paymentMethod = req.query.payment_method;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { collection_number: { [Op.like]: `%${search}%` } },
        { reference_number: { [Op.like]: `%${search}%` } },
        { '$customer.name$': { [Op.like]: `%${search}%` } },
        { '$salesBill.bill_number$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.collection_status = status;
    }

    if (paymentMethod) {
      whereClause.payment_method = paymentMethod;
    }

    const { count, rows } = await CollectionBill.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'customer_code']
        },
        {
          model: SalesBill,
          as: 'salesBill',
          attributes: ['id', 'bill_number', 'total_amount'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        collectionBills: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching collection bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection bills',
      error: error.message
    });
  }
});

// GET /api/collection-bills/:id - Get collection bill by ID
router.get('/:id', async (req, res) => {
  try {
    const collectionBill = await CollectionBill.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBill,
          as: 'salesBill'
        }
      ]
    });

    if (!collectionBill) {
      return res.status(404).json({
        success: false,
        message: 'Collection bill not found'
      });
    }

    res.json({
      success: true,
      data: collectionBill
    });
  } catch (error) {
    console.error('Error fetching collection bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection bill',
      error: error.message
    });
  }
});

// POST /api/collection-bills - Create new collection bill
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { error, value } = collectionBillSchema.validate(req.body);
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

    // Check if sales bill exists (if provided)
    let salesBill = null;
    if (value.sales_bill_id) {
      salesBill = await SalesBill.findByPk(value.sales_bill_id);
      if (!salesBill) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Sales bill not found'
        });
      }

      // Check if collection amount doesn't exceed balance
      if (value.collection_amount > salesBill.balance_amount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Collection amount cannot exceed outstanding balance'
        });
      }
    }

    // Create collection bill
    const collectionBill = await CollectionBill.create(value, { transaction });

    // Update sales bill if provided
    if (salesBill) {
      const newPaidAmount = parseFloat(salesBill.paid_amount) + parseFloat(value.collection_amount);
      const newBalanceAmount = parseFloat(salesBill.total_amount) - newPaidAmount;
      
      let paymentStatus = 'partial';
      if (newBalanceAmount <= 0) {
        paymentStatus = 'paid';
      } else if (newPaidAmount === 0) {
        paymentStatus = 'pending';
      }

      await salesBill.update({
        paid_amount: newPaidAmount,
        balance_amount: Math.max(0, newBalanceAmount),
        payment_status: paymentStatus
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the created collection bill with related data
    const createdBill = await CollectionBill.findByPk(collectionBill.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBill,
          as: 'salesBill'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Collection bill created successfully',
      data: createdBill
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating collection bill:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Collection number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating collection bill',
      error: error.message
    });
  }
});

// PUT /api/collection-bills/:id - Update collection bill
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { error, value } = updateCollectionBillSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const collectionBill = await CollectionBill.findByPk(req.params.id);
    if (!collectionBill) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Collection bill not found'
      });
    }

    // If updating collection amount or sales bill, handle the sales bill updates
    const oldAmount = parseFloat(collectionBill.collection_amount);
    const newAmount = value.collection_amount ? parseFloat(value.collection_amount) : oldAmount;
    const amountDifference = newAmount - oldAmount;

    if (collectionBill.sales_bill_id && amountDifference !== 0) {
      const salesBill = await SalesBill.findByPk(collectionBill.sales_bill_id);
      if (salesBill) {
        const newPaidAmount = parseFloat(salesBill.paid_amount) + amountDifference;
        const newBalanceAmount = parseFloat(salesBill.total_amount) - newPaidAmount;
        
        if (newBalanceAmount < 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Updated collection amount would exceed total bill amount'
          });
        }

        let paymentStatus = 'partial';
        if (newBalanceAmount <= 0) {
          paymentStatus = 'paid';
        } else if (newPaidAmount === 0) {
          paymentStatus = 'pending';
        }

        await salesBill.update({
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          payment_status: paymentStatus
        }, { transaction });
      }
    }

    await collectionBill.update(value, { transaction });

    await transaction.commit();

    // Fetch updated collection bill with related data
    const updatedBill = await CollectionBill.findByPk(collectionBill.id, {
      include: [
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: SalesBill,
          as: 'salesBill'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Collection bill updated successfully',
      data: updatedBill
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating collection bill:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Collection number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating collection bill',
      error: error.message
    });
  }
});

// DELETE /api/collection-bills/:id - Delete collection bill
router.delete('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const collectionBill = await CollectionBill.findByPk(req.params.id);
    if (!collectionBill) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Collection bill not found'
      });
    }

    // Update sales bill if linked
    if (collectionBill.sales_bill_id) {
      const salesBill = await SalesBill.findByPk(collectionBill.sales_bill_id);
      if (salesBill) {
        const newPaidAmount = parseFloat(salesBill.paid_amount) - parseFloat(collectionBill.collection_amount);
        const newBalanceAmount = parseFloat(salesBill.total_amount) - newPaidAmount;
        
        let paymentStatus = 'partial';
        if (newBalanceAmount >= parseFloat(salesBill.total_amount)) {
          paymentStatus = 'pending';
        } else if (newBalanceAmount <= 0) {
          paymentStatus = 'paid';
        }

        await salesBill.update({
          paid_amount: Math.max(0, newPaidAmount),
          balance_amount: newBalanceAmount,
          payment_status: paymentStatus
        }, { transaction });
      }
    }

    await collectionBill.destroy({ transaction });

    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Collection bill deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting collection bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting collection bill',
      error: error.message
    });
  }
});

// GET /api/collection-bills/reports/summary - Get collection summary
router.get('/reports/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const whereClause = {};
    if (start_date && end_date) {
      whereClause.collection_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const summary = await CollectionBill.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_collections'],
        [sequelize.fn('SUM', sequelize.col('collection_amount')), 'total_amount']
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

    res.json({
      success: true,
      data: {
        summary: summary[0],
        method_wise: methodWise,
        status_wise: statusWise
      }
    });
  } catch (error) {
    console.error('Error fetching collection summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching collection summary',
      error: error.message
    });
  }
});

// GET /api/collection-bills/customer/:customerId/outstanding - Get customer's outstanding bills for collection
router.get('/customer/:customerId/outstanding', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

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

    res.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          customer_code: customer.customer_code
        },
        total_outstanding: totalOutstanding,
        outstanding_bills: outstandingBills
      }
    });
  } catch (error) {
    console.error('Error fetching outstanding bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching outstanding bills',
      error: error.message
    });
  }
});

module.exports = router;
