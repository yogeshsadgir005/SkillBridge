// controllers/adminController.js
const User = require('../models/User');
const Project = require('../models/Project');
const Application = require('../models/Application');

exports.getStats = async (req, res) => {
    try {
        const users = await User.countDocuments();
        const allProjects = await Project.countDocuments();
        const completedProjects = await Project.countDocuments({ status: 'Completed' });
        const applications = await Application.countDocuments();
        res.json({ users, allProjects, completedProjects, applications });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// UPDATED: getUsers with filtering and pagination
exports.getUsers = async (req, res) => {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    try {
        let query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role && role !== 'all') query.role = role;
        if (status && status !== 'all') query.status = status;

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({ 
            users, 
            pagination: { 
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// UPDATED: getProjects with filtering and pagination
exports.getProjects = async (req, res) => {
    const { search, status, page = 1, limit = 10 } = req.query;
     try {
        let query = {};
        if (search) {
            // This requires a more complex query if searching by client name
            query.title = { $regex: search, $options: 'i' };
        }
        if (status && status !== 'all') query.status = status;
        
        const projects = await Project.find(query)
            .populate('client', 'fullName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Project.countDocuments(query);
        
        res.json({ 
            projects, 
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProjects: total
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// UPDATED: getApplications with filtering and pagination
exports.getApplications = async (req, res) => {
    // Basic implementation, can be expanded with more filters
    try {
        const applications = await Application.find()
            .populate('project', 'title')
            .populate('freelancer', 'fullName')
            .populate('client', 'fullName'); // Assuming you add client to Application schema if needed
        res.json({ applications, pagination: {} });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// NEW: Controller for updating user status
exports.updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = req.body.status;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// NEW: Controller for updating project status
exports.updateProjectStatus = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.status = req.body.status;
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};