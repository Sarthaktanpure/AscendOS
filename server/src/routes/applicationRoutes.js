const express = require('express');
const router = express.Router();
const {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getFunnelMetrics
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/funnel', getFunnelMetrics);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
