const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const groupRoutes = require('./routes/groupRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const gstRoutes = require('./routes/gstRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/reports', reportRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Accounting ERP API is running...' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    errors: err.errors || []
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
