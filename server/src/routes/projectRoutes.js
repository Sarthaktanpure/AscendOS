const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateQualityAudit,
  addTestCoverageEvidence,
  addPerformanceEvidence,
  addEngineeringDecision
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.patch('/:id/audit', updateQualityAudit);
router.post('/:id/evidence/tests', addTestCoverageEvidence);
router.post('/:id/evidence/performance', addPerformanceEvidence);
router.post('/:id/decisions', addEngineeringDecision);

module.exports = router;
