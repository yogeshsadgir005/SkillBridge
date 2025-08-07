const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // UPDATED: Make text optional and add new fields
    text: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },

}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);