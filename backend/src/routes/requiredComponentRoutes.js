// Purchase manager required components routes
const express = require('express');
const router = express.Router();
const requiredComponentController = require('../controllers/requiredComponentController');

// Purchase Manager Required Components
const { authenticateToken } = require('../controllers/authController');

router.get('/required-components', authenticateToken, requiredComponentController.getRequiredComponents);
router.post('/required-components', authenticateToken, requiredComponentController.createRequiredComponent);
router.put('/required-components/:id', authenticateToken, requiredComponentController.updateRequiredComponent);
router.delete('/required-components/:id', authenticateToken, requiredComponentController.deleteRequiredComponent);

module.exports = router;
