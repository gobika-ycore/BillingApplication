# Billing Application Backend

A robust Node.js backend API for a billing application with MySQL database support.

## Features

- **Customer Management**: Complete CRUD operations for customers
- **Sales Bills**: Create and manage sales bills with line items
- **Collection Bills**: Track payments and collections against sales bills
- **Automatic Calculations**: Auto-calculate taxes, discounts, and totals
- **Outstanding Tracking**: Monitor pending payments and outstanding balances
- **Reporting**: Generate sales and collection summary reports
- **Data Validation**: Comprehensive input validation using Joi
- **Security**: Rate limiting, CORS, and security headers
- **Database Relations**: Proper foreign key relationships and constraints

## Tech Stack

- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv for configuration

## Database Schema

### Tables

1. **customers** - Customer information and credit details
2. **sales_bills** - Sales invoices with totals and payment status
3. **sales_bill_items** - Individual line items for each sales bill
4. **collection_bills** - Payment collections against sales bills

### Key Relationships

- Customer → Sales Bills (One-to-Many)
- Customer → Collection Bills (One-to-Many)
- Sales Bill → Sales Bill Items (One-to-Many)
- Sales Bill → Collection Bills (One-to-Many)

## Setup Instructions

### Prerequisites

1. **Node.js** (version 16 or higher)
2. **MySQL** (version 5.7 or higher)
3. **npm** or **yarn** package manager

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - Create a MySQL database named `billing_db`
   - Update the `.env` file with your database credentials

4. **Environment Configuration**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file with your configuration
   # Update DB_PASSWORD with your MySQL password
   ```

5. **Initialize Database**:
   ```bash
   npm run init-db
   ```
   This will:
   - Create all required tables
   - Set up relationships and indexes
   - Insert sample data for testing

6. **Start the Server**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=billing_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (for future authentication)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Customers
- `GET /api/customers` - Get all customers (with pagination & search)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/outstanding` - Get customer outstanding balance

### Sales Bills
- `GET /api/sales-bills` - Get all sales bills (with pagination & search)
- `GET /api/sales-bills/:id` - Get sales bill by ID
- `POST /api/sales-bills` - Create new sales bill
- `PUT /api/sales-bills/:id` - Update sales bill
- `DELETE /api/sales-bills/:id` - Delete sales bill
- `GET /api/sales-bills/reports/summary` - Get sales summary report

### Collection Bills
- `GET /api/collection-bills` - Get all collection bills (with pagination & search)
- `GET /api/collection-bills/:id` - Get collection bill by ID
- `POST /api/collection-bills` - Create new collection bill
- `PUT /api/collection-bills/:id` - Update collection bill
- `DELETE /api/collection-bills/:id` - Delete collection bill
- `GET /api/collection-bills/reports/summary` - Get collection summary report
- `GET /api/collection-bills/customer/:customerId/outstanding` - Get customer outstanding bills

## API Usage Examples

### Create a Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "customer_code": "CUST001",
    "name": "ABC Company",
    "email": "contact@abc.com",
    "phone": "9876543210",
    "address": "123 Business Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "gst_number": "27ABCDE1234F1Z5",
    "credit_limit": 100000
  }'
```

### Create a Sales Bill
```bash
curl -X POST http://localhost:3000/api/sales-bills \
  -H "Content-Type: application/json" \
  -d '{
    "bill_number": "INV001",
    "customer_id": 1,
    "bill_date": "2024-01-15",
    "due_date": "2024-02-14",
    "notes": "Sample invoice",
    "items": [
      {
        "item_name": "Product A",
        "quantity": 2,
        "rate": 1000,
        "tax_rate": 18,
        "discount_rate": 5
      }
    ]
  }'
```

### Create a Collection Bill
```bash
curl -X POST http://localhost:3000/api/collection-bills \
  -H "Content-Type: application/json" \
  -d '{
    "collection_number": "COL001",
    "customer_id": 1,
    "sales_bill_id": 1,
    "collection_date": "2024-01-20",
    "collection_amount": 500,
    "payment_method": "cash",
    "notes": "Partial payment received"
  }'
```

## Features in Detail

### Automatic Calculations
- Line totals are automatically calculated based on quantity × rate
- Discounts are applied before tax calculations
- Tax amounts are calculated on discounted amounts
- Bill totals include all line items with taxes and discounts

### Payment Tracking
- Sales bills track paid amounts and outstanding balances
- Collection bills automatically update related sales bill balances
- Payment status is automatically updated (pending/partial/paid)

### Data Validation
- All inputs are validated using Joi schemas
- Database constraints prevent invalid data
- Proper error messages for validation failures

### Search and Filtering
- Search customers by name, code, email, or phone
- Filter sales bills by status, payment status, or date range
- Filter collection bills by payment method or status

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restart on file changes.

### Database Operations
```bash
# Initialize/reset database with sample data
npm run init-db

# The init script will:
# - Create all tables
# - Set up relationships
# - Insert sample customers, sales bills, and collections
```

## Testing

The API includes comprehensive error handling and validation. Test the endpoints using:
- Postman or similar API testing tools
- curl commands (examples provided above)
- Frontend applications

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers for protection
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up proper MySQL database with backups
4. Configure reverse proxy (nginx) for SSL termination
5. Monitor logs and performance

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database `billing_db` exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process on port 3000

3. **Permission Errors**
   - Check MySQL user permissions
   - Ensure user can create/modify tables

### Logs
- Development: Detailed logs with morgan 'dev' format
- Production: Combined format logs for monitoring

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify database connection and permissions
3. Ensure all environment variables are set correctly
4. Test with sample data using the init script
