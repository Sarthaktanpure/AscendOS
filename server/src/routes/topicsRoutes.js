const express = require('express');
const router = express.Router();
const {
  getTopics,
  updateTopicConfidence,
  toggleSubtopic,
  toggleKeyQuestion,
  getQuizzes,
  submitQuiz
} = require('../controllers/topicsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTopics);
router.put('/:id/confidence', updateTopicConfidence);
router.patch('/:id/subtopics/:subtopicId/toggle', toggleSubtopic);
router.patch('/:id/questions/:questionId/toggle', toggleKeyQuestion);

router.get('/quizzes/list', getQuizzes);
router.post('/quizzes/:id/submit', submitQuiz);

module.exports = router;
