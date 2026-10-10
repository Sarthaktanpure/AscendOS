const express = require('express');
const router = express.Router();
const { getResources, toggleCompleted, createResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getResources)
  .post(createResource);

router.patch('/:id/toggle-completed', toggleCompleted);

module.exports = router;
