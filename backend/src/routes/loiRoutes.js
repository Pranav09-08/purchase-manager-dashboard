// LOI routes
const express = require('express');
const router = express.Router();
const loiController = require('../controllers/loiController');

// LOI Routes
router.post('/lois', loiController.createLOI);
router.get('/lois', loiController.getAllLOIs);
router.get('/lois/:id', loiController.getLOI);
// router.get('/lois/company/:companyId', loiController.getCompanyLOIs);
// router.put('/lois/:id', loiController.updateLOIStatus);

module.exports = router;
