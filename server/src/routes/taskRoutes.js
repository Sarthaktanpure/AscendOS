const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, toggleMIT, bulkUpdate } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/bulk', bulkUpdate);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/mit', toggleMIT);

module.exports = router;
