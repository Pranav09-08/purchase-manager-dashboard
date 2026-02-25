const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Create invoice
router.post('/', invoiceController.createInvoice);

// Get invoice by ID
router.get('/:invoiceId', invoiceController.getInvoice);

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Mark invoice as received
router.patch('/:invoiceId/received', invoiceController.markInvoiceReceived);

// Accept invoice
router.patch('/:invoiceId/accept', invoiceController.acceptInvoice);

// Reject invoice
router.patch('/:invoiceId/reject', invoiceController.rejectInvoice);

// Mark invoice as paid
router.patch('/:invoiceId/paid', invoiceController.markInvoicePaid);

// Get invoice summary
router.get('/:invoiceId/summary', invoiceController.getInvoiceSummary);

module.exports = router;
