// routes/skills.js
const express = require('express');
const router = express.Router();
const { getAllSkills } = require('../controllers/skillController');

router.get('/', getAllSkills);

module.exports = router;