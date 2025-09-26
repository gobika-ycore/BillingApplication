const express = require('express');
const { Customer, SalesBill, CollectionBill } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const customerSchema = Joi.object({
  customer_code: Joi.string().max(20).required(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().min(10).max(15).optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  state: Joi.string().max(50).optional().allow(''),
  pincode: Joi.string().max(10).optional().allow(''),
  gst_number: Joi.string().length(15).optional().allow(''),
  credit_limit: Joi.number().min(0).optional(),
  status: Joi.string().valid('active', 'inactive', 'blocked').optional()
});

const updateCustomerSchema = customerSchema.fork(['customer_code'], (schema) => schema.optional());

// GET /api/customers - Get all customers with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { customer_code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        customers: rows,
        pagination: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Get customer by ID with related data
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: SalesBill,
          as: 'salesBills',
          limit: 5,
          order: [['created_at', 'DESC']]
        },
        {
          model: CollectionBill,
          as: 'collectionBills',
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const customer = await Customer.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Customer code or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateCustomerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.update(value);
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Customer code or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has any sales bills
    const salesBillCount = await SalesBill.count({
      where: { customer_id: req.params.id }
    });

    if (salesBillCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing sales bills'
      });
    }

    await customer.destroy();
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

// GET /api/customers/:id/outstanding - Get customer outstanding balance
router.get('/:id/outstanding', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const outstandingBills = await SalesBill.findAll({
      where: {
        customer_id: req.params.id,
        balance_amount: { [Op.gt]: 0 }
      },
      order: [['bill_date', 'ASC']]
    });

    const totalOutstanding = outstandingBills.reduce((sum, bill) => {
      return sum + parseFloat(bill.balance_amount);
    }, 0);

    res.json({
      success: true,
      data: {
        customer_id: customer.id,
        customer_name: customer.name,
        total_outstanding: totalOutstanding,
        outstanding_bills: outstandingBills
      }
    });
  } catch (error) {
    console.error('Error fetching outstanding balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching outstanding balance',
      error: error.message
    });
  }
});

module.exports = router;
