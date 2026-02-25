// Quotation routes
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Quotation Routes
// Create purchase quotation
router.post('/purchase-quotation', quotationController.createPurchaseQuotation);
// Vendor creates quotation
router.post('/vendor-quotation', quotationController.createVendorQuotation);
// Get purchase quotation by ID
router.get('/purchase-quotation/:quotationId', quotationController.getPurchaseQuotation);
// Get all purchase quotations
router.get('/purchase-quotations', quotationController.getPurchaseQuotations);
// Update purchase quotation status
router.patch('/purchase-quotation/:quotationId', quotationController.updatePurchaseQuotation);
// Vendor counter quotation
router.post('/counter-quotation', quotationController.createCounterQuotation);

module.exports = router;
