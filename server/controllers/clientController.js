const Project = require('../models/Project');
const Application = require('../models/Application');

// @desc    Get dashboard data for a client
// @route   GET /api/client/dashboard
// @access  Private (Client)
exports.getDashboard = async (req, res) => {
    try {
        const activeProjects = await Project.countDocuments({ client: req.user.id, status: 'Active' });
        const completedProjects = await Project.countDocuments({ client: req.user.id, status: 'Completed' });
        
        // Get all project IDs owned by the client
        const clientProjects = await Project.find({ client: req.user.id }).select('_id');
        const projectIds = clientProjects.map(p => p._id);
        
        const totalApplications = await Application.countDocuments({ project: { $in: projectIds } });

        const recentProjects = await Project.find({ client: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(); // Use lean for performance on read-only operations

        // Manually count applications for each recent project
        for (let project of recentProjects) {
            project.applicationCount = await Application.countDocuments({ project: project._id });
        }
            
        res.json({
            stats: { activeProjects, completedProjects, totalApplications },
            recentProjects
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all applications for a client's projects
// @route   GET /api/client/applications
// @access  Private (Client)
exports.getApplications = async (req, res) => {
    try {
        const { projectId } = req.query;
        let projectIds;

        if (projectId && projectId !== 'all') {
             projectIds = [projectId];
        } else {
            const clientProjects = await Project.find({ client: req.user.id }).select('_id');
            projectIds = clientProjects.map(p => p._id);
        }

        const applications = await Application.find({ project: { $in: projectIds } })
            .populate('freelancer', 'fullName')
            .populate('project', 'title');
            
        res.json(applications);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Accept or reject an application
// @route   PATCH /api/client/applications/:appId/status
// @access  Private (Client)
exports.updateApplicationStatus = async (req, res) => {
    const { status } = req.body; // status should be 'Accepted' or 'Rejected'
    
    if (!['Accepted', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update' });
    }

    try {
        const application = await Application.findById(req.params.appId).populate('project');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Security check: Ensure the project belongs to the logged-in client
        if (application.project.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }

        application.status = status;
        
        if (status === 'Accepted') {
            const project = await Project.findById(application.project._id);
            project.freelancer = application.freelancer;
            project.status = 'Active';
            await project.save();

            // Reject all other pending applications for this project
            await Application.updateMany(
                { project: application.project._id, _id: { $ne: application._id }, status: 'Pending' },
                { status: 'Rejected' }
            );
        }
        
        await application.save();
        res.json(application);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyProjects = async (req, res) => {
    const { status } = req.query;
    try {
        let query = { client: req.user.id };
        if (status && status.toLowerCase() !== 'all') {
            query.status = status;
        }
        const projects = await Project.find(query).sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjectsList = async (req, res) => {
    try {
        const projects = await Project.find({ client: req.user.id }).select('_id title');
        res.json(projects);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security Check: Make sure the person deleting is the project owner
        if (project.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this project' });
        }

        // Business Logic: Only allow deleting projects that are 'Open'
        if (project.status !== 'Open') {
            return res.status(400).json({ message: 'Cannot delete a project that is active or completed.' });
        }

        // Delete all applications associated with the project
        await Application.deleteMany({ project: project._id });
        // Delete the project itself
        await project.deleteOne(); // or await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project and all associated applications have been deleted.' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


// --- NEW FUNCTIONS START HERE ---

// @desc    Mark a submitted project as complete
// @route   PATCH /api/client/project/:id/complete
// @access  Private (Client)
exports.markProjectComplete = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security check: ensure the user is the client for this project
        if (project.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized' });
        }
        
        // Business logic: only completable if pending approval
        if (project.status !== 'Pending Approval') {
            return res.status(400).json({ message: `Project cannot be completed from status: ${project.status}` });
        }

        project.status = 'Completed';
        await project.save();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.to(project._id.toString()).emit('projectStatusUpdated', { status: 'Completed' });

        res.json({ message: 'Project marked as complete', project });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Reject a freelancer's submission and return project to 'Active'
// @route   PATCH /api/client/project/:id/reject
// @access  Private (Client)
exports.rejectProjectSubmission = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Security check: ensure the user is the client for this project
        if (project.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized' });
        }
        
        // Business logic: only rejectable if pending approval
        if (project.status !== 'Pending Approval') {
            return res.status(400).json({ message: `Project submission cannot be rejected from status: ${project.status}` });
        }

        project.status = 'Active';
        await project.save();

        // Emit socket event for real-time update
        const io = req.app.get('io');
        io.to(project._id.toString()).emit('projectStatusUpdated', { status: 'Active' });

        res.json({ message: 'Project submission rejected, returned to active status', project });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};