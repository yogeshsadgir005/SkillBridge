// controllers/projectController.js
const Project = require('../models/Project');
const Application = require('../models/Application');
const Message = require('../models/Message');
exports.createProject = async (req, res) => {
    const { title, description, budget, skills } = req.body;
    try {
        const project = new Project({
            title,
            description,
            budget,
            skills,
            client: req.user.id
        });
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllProjects = async (req, res) => {
    const { search, skills } = req.query;
    try {
        let query = { status: 'Open' };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (skills) {
            query.skills = { $in: skills.split(',') };
        }

        const projects = await Project.find(query).populate('client', 'fullName');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'fullName email')
            .populate('freelancer', 'fullName email');
            
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // 2. Find all messages for this project and sort them by date
        const messages = await Message.find({ project: req.params.id }).sort({ createdAt: 'asc' });
        
        // 3. Send the project AND the messages in the response
        res.json({ project, messages });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.applyToProject = async (req, res) => {
    const { proposal, proposedBudget, skills } = req.body;
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const application = new Application({
            project: req.params.id,
            freelancer: req.user.id,
            proposal,
            proposedBudget,
            skills
        });
        await application.save();
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};