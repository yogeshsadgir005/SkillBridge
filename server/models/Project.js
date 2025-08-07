const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // This links to a document in the 'User' collection
        required: true 
    },
    freelancer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' // Also links to a User document
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    skills: [{ type: String, required: true }],
    status: { 
        type: String, 
        // UPDATED: Added 'Pending Approval' to the list
        enum: ['Open', 'Active', 'Pending Approval', 'Completed', 'Suspended'], 
        default: 'Open' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);