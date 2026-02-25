
// Express server bootstrap
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Database initialization (tables/seed if needed)
const initDatabase = require("./db/init");

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
// Configure CORS to allow Authorization header
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000',
    'http://127.0.0.1:5173', 'http://127.0.0.1:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Initialize database connection
initDatabase();

// ROUTES

// Authentication & Registration (Common: Admin & Vendor)
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

// Product Management (Admin)
const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);

// Component Management (Admin)
const componentRoutes = require('./routes/componentRoutes');
app.use('/api', componentRoutes);

// Inventory Management (Admin)
const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes);

// Company Management (Admin)
const companyRoutes = require('./routes/companyRoutes');
app.use('/api', companyRoutes);

// Request Management (Admin)
const requestRoutes = require('./routes/requestRoutes');
app.use('/api', requestRoutes);

// Analytics (Admin)
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api', analyticsRoutes);


// Quotation Management (Vendor & Admin)
const quotationRoutes = require('./routes/quotationRoutes');
app.use('/api', quotationRoutes);

// LOI Management (Vendor & Admin)
const loiRoutes = require('./routes/loiRoutes');
app.use('/api', loiRoutes);

// Order Management (Vendor & Admin)
const orderRoutes = require('./routes/orderRoutes');
app.use('/api', orderRoutes);

// Payment Management (Vendor & Admin)
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api', paymentRoutes);

// Enquiry Management (Vendor & Admin)
const enquiryRoutes = require('./routes/enquiryRoutes');
app.use('/api', enquiryRoutes);

// Invoice Management (Vendor & Admin)
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api', invoiceRoutes);


// Health check endpoint (Common)
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Global error handler (Common)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
