// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.status(200).json({
        fileName: req.file.originalname,
        fileUrl: req.file.path
    });
});

module.exports = router;