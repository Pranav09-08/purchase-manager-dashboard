// Order routes
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order Routes
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/pending', orderController.getPendingOrders);
router.get('/orders/company/:companyId', orderController.getCompanyOrders);
router.put('/orders/:id/accept', orderController.acceptOrder);
router.put('/orders/:id/reject', orderController.rejectOrder);
router.put('/orders/:id/choice', orderController.sendChoice);

module.exports = router;
