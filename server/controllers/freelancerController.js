const Project = require('../models/Project');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const activeProjects = await Project.countDocuments({ freelancer: req.user.id, status: 'Active' });
        const completedProjects = await Project.countDocuments({ freelancer: req.user.id, status: 'Completed' });
        const applications = await Application.countDocuments({ freelancer: req.user.id });

        res.json({
            stats: { activeProjects, completedProjects, applications, funds: 0 }, // funds logic TBD
            profile: { skills: req.user.skills, description: req.user.description }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({ freelancer: req.user.id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { skills, description } = req.body;
    try {
        const user = await User.findById(req.user.id);
        user.skills = skills.split(',').map(s => s.trim());
        user.description = description;
        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyApplications = async (req, res) => {
    const { status } = req.query;
    try {
        let query = { freelancer: req.user.id };
        if (status && status !== 'All') {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate({
                path: 'project',
                select: 'title description skills budget'
            })
            .sort({ createdAt: -1 });
            
        res.json(applications);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// --- UPDATED FUNCTION ---
exports.submitProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security Check: Ensure the person submitting is the assigned freelancer
        if (project.freelancer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to submit this project' });
        }
        
        // Business Logic Check: Can only submit an 'Active' project
        if (project.status !== 'Active') {
            return res.status(400).json({ message: 'Project is not active and cannot be submitted.' });
        }

        // UPDATED: Change status to 'Pending Approval' instead of 'Completed'
        project.status = 'Pending Approval';
        await project.save();

        // ADDED: Emit socket event for real-time update on the client's side
        const io = req.app.get('io');
        io.to(project._id.toString()).emit('projectStatusUpdated', { status: 'Pending Approval' });

        res.json({ message: 'Project submitted for approval successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};