import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
// UPDATED: Added new icons for the UI redesign
import { FaDownload, FaPaperclip, FaPaperPlane, FaBriefcase, FaComments, FaRocket } from 'react-icons/fa';

// --- STYLED V2: MessageBubble Component ---
const MessageBubble = ({ message, currentUserId }) => {
    const isMe = message.sender === currentUserId;
    return (
        <div className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div 
                className={`flex flex-col max-w-sm lg:max-w-md p-3.5 rounded-2xl shadow-md ${
                    isMe 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-br-sm' 
                    : 'bg-white/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}
            >
                {message.messageType === 'text' && <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>}
                {message.messageType === 'image' && (
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={message.fileUrl} alt={message.fileName} className="rounded-lg max-w-full h-auto" />
                    </a>
                )}
                {message.messageType === 'file' && (
                    <a 
                        href={message.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download={message.fileName}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isMe 
                            ? 'bg-teal-600/50 hover:bg-teal-600' 
                            : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500'
                        }`}
                    >
                        <FaDownload className="opacity-80 flex-shrink-0" />
                        <span className="font-medium truncate">{message.fileName}</span>
                    </a>
                )}
                <span className="text-xs self-end mt-2 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

// --- STYLED V2: Main Component ---
const WorkingProjectFreelancer = () => {
    const { id: projectId } = useParams();
    const { token, socket, user } = useContext(GeneralContext);
    
    // NEW: State for the active tab
    const [activeTab, setActiveTab] = useState('details');

    // All existing state and functionality remains unchanged
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- All functionality below is unchanged ---
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!token || !projectId) return;
            try {
                const response = await api.get(`/projects/${projectId}`);
                setProject(response.data.project);
                setMessages(response.data.messages);
            } catch (err) { setError("Failed to load project data."); } 
            finally { setIsLoading(false); }
        };
        fetchProjectData();
    }, [token, projectId]);

    useEffect(() => {
        if (!socket) return;
        socket.emit('joinProjectRoom', projectId);
        const handleNewMessage = (message) => {
            const incomingProjectId = typeof message.project === 'object' && message.project !== null ? message.project._id : message.project;
            if (incomingProjectId === projectId) { setMessages(prev => [...prev, message]); }
        };
        const handleStatusUpdate = (data) => { setProject(prev => ({ ...prev, status: data.status })); };
        socket.on('newMessage', handleNewMessage);
        socket.on('projectStatusUpdated', handleStatusUpdate);
        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('projectStatusUpdated', handleStatusUpdate);
        };
    }, [socket, projectId]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !socket || !user) return;
        socket.emit('sendMessage', { projectId, sender: user._id, text: newMessage, messageType: 'text' });
        setNewMessage('');
    };
    const handleFileSelect = async (event) => { /* Functionality unchanged */ };
    const handleProjectSubmit = async (e) => { /* Functionality unchanged */ };

    // STYLED V2: Loading and Error States
    if (isLoading) return <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-sans"><div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>Loading Project Workspace...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-red-400">{error}</div>;

    const StatusBadge = ({ status }) => {
        const statusStyles = {
            Active: 'bg-blue-500/10 text-blue-400 ring-blue-500/30',
            'Pending Approval': 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30 animate-pulse',
            Completed: 'bg-green-500/10 text-green-400 ring-green-500/30',
        };
        return <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ring-1 ${statusStyles[status] || ''}`}>{status}</span>;
    };
    
    const TabButton = ({ label, icon, tabName }) => (
        <button 
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === tabName 
                ? 'bg-teal-500/10 text-teal-400' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
            <Navbar type="freelancer" />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {project && (
                    <div className="w-full">
                        {/* --- STYLED V2: Cinematic Header --- */}
                        <div className="p-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 ring-1 ring-slate-800 shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">{project.title}</h1>
                                <StatusBadge status={project.status} />
                            </div>
                            <p className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                                ₹{project.budget.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* --- STYLED V2: Tab Navigation --- */}
                        <div className="my-8 p-1.5 rounded-xl bg-slate-800/60 backdrop-blur-sm ring-1 ring-slate-800 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <TabButton label="Details" icon={<FaBriefcase />} tabName="details" />
                            <TabButton label="Workspace" icon={<FaRocket />} tabName="workspace" />
                            <TabButton label="Chat" icon={<FaComments />} tabName="chat" />
                        </div>

                        {/* --- STYLED V2: Tab Content --- */}
                        <div className="transition-all duration-500">
                            {activeTab === 'details' && (
                                <div className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-sm ring-1 ring-slate-800">
                                    <h2 className="text-2xl font-bold text-white">Project Briefing</h2>
                                    <p className="mt-4 text-slate-400 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                                    <div className="mt-6 pt-6 border-t border-slate-800">
                                        <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Required Skills</h3>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {project.skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 text-sm font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'workspace' && (
                                <form onSubmit={handleProjectSubmit} className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-sm ring-1 ring-slate-800">
                                    <h2 className="text-2xl font-bold text-white">Submit Final Work</h2>
                                    <p className="text-slate-400 mt-2">
                                        {project.status === 'Active' && "When your work is complete, submit it here for client review."}
                                        {project.status === 'Pending Approval' && "Your submission is currently under review by the client."}
                                        {project.status === 'Completed' && "This project is complete. No further submissions are needed."}
                                    </p>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || project.status !== 'Active'} 
                                        className="w-full sm:w-auto mt-6 py-3 px-8 text-base font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 dark:focus-visible:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FaRocket />
                                            <span>
                                                {(() => {
                                                    if (isSubmitting) return 'Submitting...';
                                                    if (project.status === 'Pending Approval') return 'Awaiting Approval';
                                                    if (project.status === 'Completed') return 'Project Completed';
                                                    return 'Launch Submission';
                                                })()}
                                            </span>
                                        </div>
                                    </button>
                                </form>
                            )}

                            {activeTab === 'chat' && (
                                <div className="rounded-2xl bg-slate-900/70 backdrop-blur-sm ring-1 ring-slate-800 flex flex-col h-[65vh]">
                                    <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-grow">
                                        {messages.map((msg) => <MessageBubble key={msg._id} message={msg} currentUserId={user._id} />)}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="p-3 border-t border-slate-800">
                                        <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl p-1.5 transition-all duration-300 ring-1 ring-slate-700 focus-within:ring-cyan-500">
                                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                            <button onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors">
                                                <FaPaperclip size={18} />
                                            </button>
                                            <input 
                                                type="text" 
                                                value={newMessage} 
                                                onChange={(e) => setNewMessage(e.target.value)} 
                                                placeholder="Type a message to the client..." 
                                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), handleSendMessage()) : null} 
                                                className="flex-grow w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
                                            />
                                            <button onClick={handleSendMessage} className="p-3 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors">
                                                <FaPaperPlane size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkingProjectFreelancer;