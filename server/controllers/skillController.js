// controllers/skillController.js
const Project = require('../models/Project');

// Get a unique list of all skills used in projects
exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Project.distinct('skills');
        res.json(skills);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};