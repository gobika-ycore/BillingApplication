const Customer = require('./Customer');
const SalesBill = require('./SalesBill');
const SalesBillItem = require('./SalesBillItem');
const CollectionBill = require('./CollectionBill');

// Define associations
// Customer has many SalesBills
Customer.hasMany(SalesBill, {
  foreignKey: 'customer_id',
  as: 'salesBills'
});

SalesBill.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

// Customer has many CollectionBills
Customer.hasMany(CollectionBill, {
  foreignKey: 'customer_id',
  as: 'collectionBills'
});

CollectionBill.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

// SalesBill has many SalesBillItems
SalesBill.hasMany(SalesBillItem, {
  foreignKey: 'sales_bill_id',
  as: 'items'
});

SalesBillItem.belongsTo(SalesBill, {
  foreignKey: 'sales_bill_id',
  as: 'salesBill'
});

// SalesBill has many CollectionBills (one bill can have multiple collections)
SalesBill.hasMany(CollectionBill, {
  foreignKey: 'sales_bill_id',
  as: 'collections'
});

CollectionBill.belongsTo(SalesBill, {
  foreignKey: 'sales_bill_id',
  as: 'salesBill'
});

module.exports = {
  Customer,
  SalesBill,
  SalesBillItem,
  CollectionBill
};
