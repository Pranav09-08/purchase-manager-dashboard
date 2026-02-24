// Authentication and registration routes
const express = require('express');
const authController = require('../controllers/authController');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// Public routes
router.post('/auth/register', authController.registerVendor);
router.post('/auth/login', authController.loginVendor); // Unified login for both vendors and admins

// Admin authentication routes (DEPRECATED - use /auth/login instead)
router.post('/auth/admin-login', adminAuthController.loginAdmin);

// Vendor routes (authenticated)
router.put('/vendor/profile', authController.authenticateToken, authController.updateVendorProfile);

// Admin management routes (authenticated - requires super_admin)
router.get('/auth/admins', authController.authenticateToken, adminAuthController.getAllAdmins);
router.post('/auth/admins', authController.authenticateToken, adminAuthController.createAdmin);
router.put('/auth/admins/:adminId', authController.authenticateToken, adminAuthController.updateAdmin);
router.put('/auth/admins/:adminId/password', authController.authenticateToken, adminAuthController.changeAdminPassword);
router.delete('/auth/admins/:adminId', authController.authenticateToken, adminAuthController.deleteAdmin);

// Vendor registration management routes
router.get('/auth/registrations', authController.authenticateToken, authController.getRegistrationRequests);
router.get('/auth/registrations/:id', authController.authenticateToken, authController.getRegistrationRequest);
router.put('/auth/registrations/:id/approve', authController.authenticateToken, authController.approveRegistration);
router.put('/auth/registrations/:id/reject', authController.authenticateToken, authController.rejectRegistration);
router.put('/auth/registrations/:id/certificate', authController.authenticateToken, authController.updateCertificateStatus);

module.exports = router;
