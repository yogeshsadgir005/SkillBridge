// routes/admin.js
const express = require('express');
const router = express.Router();
const { 
    getStats, 
    getUsers, 
    getProjects, 
    getApplications,
    updateUserStatus,    // NEW
    updateProjectStatus  // NEW
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/projects', getProjects);
router.get('/applications', getApplications);

// NEW: Routes for admin actions
router.patch('/users/:id/status', updateUserStatus);
router.patch('/projects/:id/status', updateProjectStatus);


module.exports = router;