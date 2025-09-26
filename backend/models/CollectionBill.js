const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CollectionBill = sequelize.define('CollectionBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  collection_number: {
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
  sales_bill_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales_bills',
      key: 'id'
    }
  },
  collection_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  collection_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other'),
    allowNull: false,
    defaultValue: 'cash'
  },
  reference_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Cheque number, transaction ID, etc.'
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cheque_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  collection_status: {
    type: DataTypes.ENUM('pending', 'cleared', 'bounced', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  collected_by: {
    type: DataTypes.STRING(100),
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
  tableName: 'collection_bills',
  indexes: [
    {
      unique: true,
      fields: ['collection_number']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['sales_bill_id']
    },
    {
      fields: ['collection_date']
    },
    {
      fields: ['payment_method']
    },
    {
      fields: ['collection_status']
    }
  ]
});

module.exports = CollectionBill;
