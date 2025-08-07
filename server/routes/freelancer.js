// routes/freelancer.js
const express = require('express');
const router = express.Router();
const { getDashboard, getMyProjects, getMyApplications, updateProfile ,  submitProject } = require('../controllers/freelancerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('freelancer'));

router.get('/dashboard', getDashboard);
router.get('/my-projects', getMyProjects);
router.patch('/profile', updateProfile);
router.get('/applications', getMyApplications);
router.post('/project/:id/submit', submitProject);

module.exports = router;