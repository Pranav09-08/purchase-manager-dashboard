// Order routes
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');


// Purchase Order Specific Routes
router.get('/orders/:orderId', orderController.getPurchaseOrder);
router.get('/purchase-orders', orderController.getPurchaseOrders);
router.put('/orders/:orderId/status', orderController.updatePurchaseOrderStatus);
router.put('/orders/:orderId/confirm', orderController.vendorConfirmOrder);
router.delete('/orders/:orderId', orderController.deletePurchaseOrder);

module.exports = router;
