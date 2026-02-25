const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Create purchase enquiry
router.post('/purchase-enquiry', enquiryController.createPurchaseEnquiry);
// Get purchase enquiry by ID
router.get('/purchase-enquiry/:enquiryId', enquiryController.getPurchaseEnquiry);
// Get all purchase enquiries
router.get('/purchase-enquiries', enquiryController.getPurchaseEnquiries);
// Update purchase enquiry status
router.patch('/purchase-enquiry/:enquiryId', enquiryController.updatePurchaseEnquiry);
// Reject purchase enquiry
router.patch('/purchase-enquiry/:enquiryId/reject', enquiryController.rejectPurchaseEnquiry);
// Delete purchase enquiry
router.delete('/purchase-enquiry/:enquiryId', enquiryController.deletePurchaseEnquiry);

module.exports = router;
