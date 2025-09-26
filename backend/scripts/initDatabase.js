const { sequelize } = require('../config/database');
const { Customer, SalesBill, SalesBillItem, CollectionBill } = require('../models');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized successfully.');

    // Create sample data (optional)
    await createSampleData();

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

const createSampleData = async () => {
  try {
    console.log('🔄 Creating sample data...');

    // Check if data already exists
    const customerCount = await Customer.count();
    if (customerCount > 0) {
      console.log('ℹ️  Sample data already exists, skipping...');
      return;
    }

    // Create sample customers
    const customers = await Customer.bulkCreate([
      {
        customer_code: 'CUST001',
        name: 'ABC Electronics Pvt Ltd',
        email: 'contact@abcelectronics.com',
        phone: '9876543210',
        address: '123 Electronics Street, Tech Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gst_number: '27ABCDE1234F1Z5',
        credit_limit: 100000.00,
        status: 'active'
      },
      {
        customer_code: 'CUST002',
        name: 'XYZ Trading Company',
        email: 'info@xyztrading.com',
        phone: '9876543211',
        address: '456 Trading Complex, Business District',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        gst_number: '07XYZAB5678C1Z2',
        credit_limit: 50000.00,
        status: 'active'
      },
      {
        customer_code: 'CUST003',
        name: 'PQR Industries',
        email: 'sales@pqrindustries.com',
        phone: '9876543212',
        address: '789 Industrial Area, Sector 5',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        gst_number: '29PQRST9012G1Z8',
        credit_limit: 75000.00,
        status: 'active'
      }
    ]);

    console.log(`✅ Created ${customers.length} sample customers`);

    // Create sample sales bills
    const salesBills = [];
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const billNumber = `INV${String(i + 1).padStart(4, '0')}`;
      
      const salesBill = await SalesBill.create({
        bill_number: billNumber,
        customer_id: customer.id,
        bill_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: 10000.00,
        tax_amount: 1800.00,
        discount_amount: 500.00,
        total_amount: 11300.00,
        paid_amount: 0.00,
        balance_amount: 11300.00,
        payment_status: 'pending',
        bill_status: 'sent',
        notes: 'Sample sales bill',
        terms_conditions: 'Payment due within 30 days'
      });

      salesBills.push(salesBill);

      // Create sample items for each sales bill
      await SalesBillItem.bulkCreate([
        {
          sales_bill_id: salesBill.id,
          item_name: 'Product A',
          item_code: 'PROD001',
          description: 'High quality product A',
          quantity: 2,
          unit: 'pcs',
          rate: 3000.00,
          amount: 6000.00,
          tax_rate: 18.00,
          tax_amount: 1080.00,
          discount_rate: 5.00,
          discount_amount: 300.00,
          line_total: 6780.00
        },
        {
          sales_bill_id: salesBill.id,
          item_name: 'Product B',
          item_code: 'PROD002',
          description: 'Premium product B',
          quantity: 1,
          unit: 'pcs',
          rate: 4000.00,
          amount: 4000.00,
          tax_rate: 18.00,
          tax_amount: 720.00,
          discount_rate: 5.00,
          discount_amount: 200.00,
          line_total: 4520.00
        }
      ]);
    }

    console.log(`✅ Created ${salesBills.length} sample sales bills with items`);

    // Create sample collection bills
    const collectionBills = [];
    for (let i = 0; i < 2; i++) {
      const salesBill = salesBills[i];
      const collectionNumber = `COL${String(i + 1).padStart(4, '0')}`;
      const collectionAmount = 5000.00;

      const collectionBill = await CollectionBill.create({
        collection_number: collectionNumber,
        customer_id: salesBill.customer_id,
        sales_bill_id: salesBill.id,
        collection_date: new Date(),
        collection_amount: collectionAmount,
        payment_method: i === 0 ? 'cash' : 'cheque',
        reference_number: i === 0 ? null : 'CHQ123456',
        bank_name: i === 0 ? null : 'State Bank of India',
        cheque_date: i === 0 ? null : new Date(),
        collection_status: 'cleared',
        notes: 'Sample collection',
        collected_by: 'Sales Representative'
      });

      collectionBills.push(collectionBill);

      // Update the sales bill
      await salesBill.update({
        paid_amount: collectionAmount,
        balance_amount: salesBill.total_amount - collectionAmount,
        payment_status: 'partial'
      });
    }

    console.log(`✅ Created ${collectionBills.length} sample collection bills`);
    console.log('✅ Sample data creation completed successfully!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, createSampleData };
