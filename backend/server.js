const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const customerRoutes = require('./routes/customers');
const salesBillRoutes = require('./routes/salesBills');
const collectionBillRoutes = require('./routes/collectionBills');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Billing API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/sales-bills', salesBillRoutes);
app.use('/api/collection-bills', collectionBillRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Billing Application API',
    version: '1.0.0',
    endpoints: {
      customers: {
        'GET /api/customers': 'Get all customers with pagination and search',
        'GET /api/customers/:id': 'Get customer by ID',
        'POST /api/customers': 'Create new customer',
        'PUT /api/customers/:id': 'Update customer',
        'DELETE /api/customers/:id': 'Delete customer',
        'GET /api/customers/:id/outstanding': 'Get customer outstanding balance'
      },
      salesBills: {
        'GET /api/sales-bills': 'Get all sales bills with pagination and search',
        'GET /api/sales-bills/:id': 'Get sales bill by ID',
        'POST /api/sales-bills': 'Create new sales bill',
        'PUT /api/sales-bills/:id': 'Update sales bill',
        'DELETE /api/sales-bills/:id': 'Delete sales bill',
        'GET /api/sales-bills/reports/summary': 'Get sales summary report'
      },
      collectionBills: {
        'GET /api/collection-bills': 'Get all collection bills with pagination and search',
        'GET /api/collection-bills/:id': 'Get collection bill by ID',
        'POST /api/collection-bills': 'Create new collection bill',
        'PUT /api/collection-bills/:id': 'Update collection bill',
        'DELETE /api/collection-bills/:id': 'Delete collection bill',
        'GET /api/collection-bills/reports/summary': 'Get collection summary report',
        'GET /api/collection-bills/customer/:customerId/outstanding': 'Get customer outstanding bills'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Billing API Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
