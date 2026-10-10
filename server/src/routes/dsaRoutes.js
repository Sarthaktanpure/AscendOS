const express = require('express');
const router = express.Router();
const {
  getProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  recordAttempt,
  getRevisionQueue,
  reviewProblem,
  getTopicMastery
} = require('../controllers/dsaController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/mastery', getTopicMastery);
router.get('/revision-queue', getRevisionQueue);

router.route('/problems')
  .get(getProblems)
  .post(createProblem);

router.route('/problems/:id')
  .put(updateProblem)
  .delete(deleteProblem);

router.post('/problems/:id/attempt', recordAttempt);
router.post('/problems/:id/review', reviewProblem);

module.exports = router;
