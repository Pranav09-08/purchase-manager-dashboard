// Procurement workflow routes (purchase + vendor side)
const express = require('express');
const router = express.Router();
const purchaseEnquiryController = require('../controllers/purchaseEnquiryController');
const purchaseQuotationController = require('../controllers/purchaseQuotationController');
const vendorCounterQuotationController = require('../controllers/vendorCounterQuotationController');
const purchaseLoiController = require('../controllers/purchaseLoiController');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const purchasePaymentController = require('../controllers/purchasePaymentController');
const vendorInvoiceController = require('../controllers/vendorInvoiceController');
const { authenticateToken } = require('../controllers/authController');

// ==================== PURCHASE ENQUIRY ROUTES ====================
router.post('/purchase/enquiry', authenticateToken, purchaseEnquiryController.createPurchaseEnquiry);
router.get('/purchase/enquiry/:enquiryId', authenticateToken, purchaseEnquiryController.getPurchaseEnquiry);
router.get('/purchase/enquiries', authenticateToken, purchaseEnquiryController.getPurchaseEnquiries);
router.put('/purchase/enquiry/:enquiryId', authenticateToken, purchaseEnquiryController.updatePurchaseEnquiry);
router.put('/purchase/enquiry/:enquiryId/reject', authenticateToken, purchaseEnquiryController.rejectPurchaseEnquiry);
router.delete('/purchase/enquiry/:enquiryId', authenticateToken, purchaseEnquiryController.deletePurchaseEnquiry);

// ==================== PURCHASE QUOTATION ROUTES ====================
router.post('/purchase/quotation', authenticateToken, purchaseQuotationController.createPurchaseQuotation);
router.post('/vendor/quotation', authenticateToken, purchaseQuotationController.createVendorQuotation);
router.get('/purchase/quotation/:quotationId', authenticateToken, purchaseQuotationController.getPurchaseQuotation);
router.get('/purchase/quotations', authenticateToken, purchaseQuotationController.getPurchaseQuotations);
router.put('/purchase/quotation/:quotationId', authenticateToken, purchaseQuotationController.updatePurchaseQuotation);

// ==================== VENDOR COUNTER QUOTATION ROUTES ====================
router.post('/vendor/counter-quotation', authenticateToken, vendorCounterQuotationController.createCounterQuotation);
router.get('/vendor/counter-quotation/:counterId', authenticateToken, vendorCounterQuotationController.getCounterQuotation);
router.get('/vendor/counter-quotations', authenticateToken, vendorCounterQuotationController.getCounterQuotations);
router.put('/vendor/counter-quotation/:counterId/accept', authenticateToken, vendorCounterQuotationController.acceptCounterQuotation);
router.put('/vendor/counter-quotation/:counterId/reject', authenticateToken, vendorCounterQuotationController.rejectCounterQuotation);

// ==================== PURCHASE LOI ROUTES ====================
router.post('/purchase/loi', authenticateToken, purchaseLoiController.createPurchaseLOI);
router.get('/purchase/loi/:loiId', authenticateToken, purchaseLoiController.getPurchaseLOI);
router.get('/purchase/lois', authenticateToken, purchaseLoiController.getPurchaseLOIs);
router.put('/purchase/loi/:loiId', authenticateToken, purchaseLoiController.updatePurchaseLOI);
router.put('/vendor/loi/:loiId/accept', authenticateToken, purchaseLoiController.acceptLOI);
router.put('/vendor/loi/:loiId/reject', authenticateToken, purchaseLoiController.rejectLOI);

// ==================== PURCHASE ORDER ROUTES ====================
router.post('/purchase/order', authenticateToken, purchaseOrderController.createPurchaseOrder);
router.get('/purchase/order/:orderId', authenticateToken, purchaseOrderController.getPurchaseOrder);
router.get('/purchase/orders', authenticateToken, purchaseOrderController.getPurchaseOrders);
router.put('/purchase/order/:orderId/status', authenticateToken, purchaseOrderController.updatePurchaseOrderStatus);
router.put('/vendor/order/:orderId/confirm', authenticateToken, purchaseOrderController.vendorConfirmOrder);
router.delete('/purchase/order/:orderId', authenticateToken, purchaseOrderController.deletePurchaseOrder);

// ==================== PURCHASE PAYMENT ROUTES ====================
router.post('/purchase/payment', authenticateToken, purchasePaymentController.createPayment);
router.get('/purchase/payment/:paymentId', authenticateToken, purchasePaymentController.getPayment);
router.get('/purchase/payments', authenticateToken, purchasePaymentController.getPayments);
router.put('/purchase/payment/:paymentId/complete', authenticateToken, purchasePaymentController.completePayment);
router.put('/purchase/payment/:paymentId/fail', authenticateToken, purchasePaymentController.failPayment);
router.put('/vendor/payment/:paymentId/receipt', authenticateToken, purchasePaymentController.sendPaymentReceipt);
router.get('/purchase/order/:orderId/payment-summary', authenticateToken, purchasePaymentController.getOrderPaymentSummary);

// ==================== VENDOR INVOICE ROUTES ====================
router.post('/vendor/invoice', authenticateToken, vendorInvoiceController.createVendorInvoice);
router.get('/vendor/invoice/:invoiceId', authenticateToken, vendorInvoiceController.getVendorInvoice);
router.get('/vendor/invoices', authenticateToken, vendorInvoiceController.getVendorInvoices);
router.get('/vendor/invoice/:invoiceId/summary', authenticateToken, vendorInvoiceController.getInvoiceSummary);
router.put('/vendor/invoice/:invoiceId/received', authenticateToken, vendorInvoiceController.markInvoiceReceived);
router.put('/vendor/invoice/:invoiceId/accept', authenticateToken, vendorInvoiceController.acceptVendorInvoice);
router.put('/vendor/invoice/:invoiceId/reject', authenticateToken, vendorInvoiceController.rejectVendorInvoice);
router.put('/vendor/invoice/:invoiceId/paid', authenticateToken, vendorInvoiceController.markInvoicePaid);

module.exports = router;
