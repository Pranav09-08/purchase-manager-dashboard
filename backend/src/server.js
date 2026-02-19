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
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());


// Call on startup
initDatabase();


// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const componentRoutes = require('./routes/componentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const companyRoutes = require('./routes/companyRoutes');
const requestRoutes = require('./routes/requestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const requiredComponentRoutes = require('./routes/requiredComponentRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const loiRoutes = require('./routes/loiRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Use Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', componentRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', companyRoutes);
app.use('/api', requestRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', requiredComponentRoutes);
app.use('/api', quotationRoutes);
app.use('/api', loiRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', purchaseRoutes);
app.use('/api', debugRoutes);


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
