const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminAuthController');

// POST /api/admin/auth/login
router.post('/login', loginAdmin);

module.exports = router;
