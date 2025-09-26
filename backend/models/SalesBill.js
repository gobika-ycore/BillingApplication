const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalesBill = sequelize.define('SalesBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bill_number: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  bill_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paid_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  balance_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
    defaultValue: 'pending'
  },
  bill_status: {
    type: DataTypes.ENUM('draft', 'sent', 'viewed', 'paid', 'cancelled'),
    defaultValue: 'draft'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms_conditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'sales_bills',
  indexes: [
    {
      unique: true,
      fields: ['bill_number']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['bill_date']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['bill_status']
    }
  ]
});

module.exports = SalesBill;
