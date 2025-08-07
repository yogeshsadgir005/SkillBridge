const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const Message = require('./models/Message');

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

// --- ADDED: Make io accessible to our router controllers ---
// This line allows us to call req.app.get('io') in our controller files.
app.set('io', io);

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/freelancer', require('./routes/freelancer'));
app.use('/api/client', require('./routes/client'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/upload', require('./routes/upload'));


// --- Socket.io Connection Logic ---
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('joinProjectRoom', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined room ${projectId}`);
    });

    socket.on('sendMessage', async (data) => {
        try {
            const message = new Message({
                project: data.projectId,
                sender: data.sender,
                text: data.text,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                messageType: data.messageType,
            });

            const savedMessage = await message.save();
            
            io.to(data.projectId).emit('newMessage', savedMessage);
        } catch (error) {
            console.error('Socket: Error saving or broadcasting message', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));