const express = require('express');
const router = express.Router();
const {
  getSessions,
  generateSchedule,
  startSession,
  pauseSession,
  completeSession,
  skipSession,
  rescheduleSession,
  emergencyTwoHours,
  lowEnergyDay,
  rebuildSchedule
} = require('../controllers/schedulerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/sessions', getSessions);
router.post('/generate', generateSchedule);
router.post('/compact-2h', emergencyTwoHours);
router.post('/low-energy', lowEnergyDay);
router.post('/rebuild', rebuildSchedule);

router.patch('/sessions/:id/start', startSession);
router.patch('/sessions/:id/pause', pauseSession);
router.patch('/sessions/:id/complete', completeSession);
router.patch('/sessions/:id/skip', skipSession);
router.patch('/sessions/:id/reschedule', rescheduleSession);

module.exports = router;
