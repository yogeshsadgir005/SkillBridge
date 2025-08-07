const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    getApplications, 
    updateApplicationStatus,
    getMyProjects,
    getProjectsList,
    deleteProject,
    markProjectComplete,      // ADDED
    rejectProjectSubmission   // ADDED
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('client'));

router.get('/dashboard', getDashboard);
router.get('/applications', getApplications);
router.patch('/applications/:appId/status', updateApplicationStatus);
router.get('/my-projects', getMyProjects);
router.get('/projects-list', getProjectsList);

// --- Project Action Routes ---
router.delete('/project/:id', deleteProject);
// ADDED: New routes for project completion and rejection
router.patch('/project/:id/complete', markProjectComplete);
router.patch('/project/:id/reject', rejectProjectSubmission);


module.exports = router;