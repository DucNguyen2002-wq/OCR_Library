const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/stats', requireAuth, requireAdmin, dashboardController.getStats);
router.get('/charts', requireAuth, requireAdmin, dashboardController.getChartData);

module.exports = router;
