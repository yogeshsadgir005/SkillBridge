// routes/projects.js
const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, applyToProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('client'), createProject)
    .get(protect, getAllProjects);

router.route('/:id')
    .get(protect, getProjectById);

router.route('/:id/apply')
    .post(protect, authorize('freelancer'), applyToProject);

module.exports = router;