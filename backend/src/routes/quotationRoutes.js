// Quotation routes
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// Quotation Routes
router.post('/quotations', quotationController.createQuotation);
router.get('/quotations', quotationController.getAllQuotations);
router.get('/quotations/enquiry/:enquiryId', quotationController.getEnquiryQuotations);
router.put('/quotations/:id', quotationController.updateQuotationStatus);
router.get('/quotations/expired', quotationController.getExpiredQuotations);

module.exports = router;
