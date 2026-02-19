// Payment routes
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../controllers/authController');

// Payment Routes (authenticated)
router.post('/payments', authenticateToken, paymentController.recordPayment);
router.get('/payments', authenticateToken, paymentController.getAllPayments);
router.get('/payments/summary', authenticateToken, paymentController.getPaymentSummary);
router.get('/payments/company/:companyId', authenticateToken, paymentController.getCompanyPayments);
router.put('/payments/:id', authenticateToken, paymentController.updatePaymentStatus);

module.exports = router;
