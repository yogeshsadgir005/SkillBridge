import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaDownload, FaPaperclip, FaPaperPlane, FaBriefcase, FaComments, FaTasks, FaCheck, FaTimes } from 'react-icons/fa';

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

const ProjectWorkingClient = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const { token, socket, user } = useContext(GeneralContext);
    
    const [activeTab, setActiveTab] = useState('details');
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

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
    
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const { fileUrl, fileName } = response.data;
            const messagePayload = { projectId, sender: user._id, fileUrl, fileName, messageType: file.type.startsWith('image/') ? 'image' : 'file' };
            socket.emit('sendMessage', messagePayload);
        } catch (err) { alert("File upload failed."); }
    };

    const handleMarkComplete = async () => {
        if (!window.confirm("Are you sure you want to approve and complete this project?")) return;
        setIsCompleting(true);
        try { await api.patch(`/client/project/${projectId}/complete`); } 
        catch (err) { alert('Failed to update project status.'); } 
        finally { setIsCompleting(false); }
    };
    
    const handleRejectSubmission = async () => {
        if (!window.confirm("Are you sure you want to request changes?")) return;
        setIsRejecting(true);
        try { await api.patch(`/client/project/${projectId}/reject`); } 
        catch (err) { alert('Failed to reject submission.'); } 
        finally { setIsRejecting(false); }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/client/project/${projectId}`);
            alert('Project deleted successfully!');
            navigate('/client/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete project.');
        } finally {
            setIsDeleting(false);
        }
    };
    
    if (isLoading) return <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-sans"><div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>Loading Project Workspace...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-red-400">{error}</div>;

    const StatusBadge = ({ status }) => {
        const statusStyles = {
            Active: 'bg-blue-500/10 text-blue-400 ring-blue-500/30',
            'Pending Approval': 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30 animate-pulse',
            Completed: 'bg-green-500/10 text-green-400 ring-green-500/30',
            Open: 'bg-orange-500/10 text-orange-400 ring-orange-500/30'
        };
        return <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ring-1 ${statusStyles[status] || ''}`}>{status}</span>;
    };
    
    const TabButton = ({ label, icon, tabName }) => (
        <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === tabName ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}>
            {icon} {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
            <Navbar type="client" />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {project && (
                    <div>
                        <div className="p-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 ring-1 ring-slate-800 shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">{project.title}</h1>
                                <StatusBadge status={project.status} />
                            </div>
                            <p className="mt-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">₹{project.budget.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="my-8 p-1.5 rounded-xl bg-slate-800/60 backdrop-blur-sm ring-1 ring-slate-800 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <TabButton label="Details" icon={<FaBriefcase />} tabName="details" />
                            <TabButton label="Controls" icon={<FaTasks />} tabName="controls" />
                            <TabButton label="Chat" icon={<FaComments />} tabName="chat" />
                        </div>

                        <div>
                            {activeTab === 'details' && (
                                <div className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-sm ring-1 ring-slate-800">
                                    <h2 className="text-2xl font-bold text-white">Project Briefing</h2>
                                    <p className="mt-4 text-slate-400 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                                    <div className="mt-6 pt-6 border-t border-slate-800">
                                        <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Required Skills</h3>
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            {project.skills.map(skill => <span key={skill} className="px-3 py-1 text-sm font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'controls' && (
                                <div className="p-8 rounded-2xl bg-slate-900/70 backdrop-blur-sm ring-1 ring-slate-800">
                                    <h2 className="text-2xl font-bold text-white">Project Controls</h2>
                                    <div className="mt-6">
                                        {project.status === 'Active' && <div className="p-4 text-center text-blue-300 bg-blue-900/30 rounded-lg ring-1 ring-blue-500/50"><p className="font-semibold">Project in Progress</p><p className="text-sm text-blue-400 mt-1">Waiting for the freelancer to submit their work.</p></div>}
                                        {project.status === 'Pending Approval' && <div><p className="text-center text-slate-400 mb-4">The freelancer has submitted work for your review.</p><div className="flex flex-col sm:flex-row gap-4"><button onClick={handleRejectSubmission} disabled={isRejecting || isCompleting} className="w-full py-3 font-semibold flex items-center justify-center gap-2 text-red-300 bg-red-900/40 rounded-lg ring-1 ring-red-500/50 hover:bg-red-900/70 transition-colors disabled:opacity-50"><FaTimes /><span>Request Changes</span></button><button onClick={handleMarkComplete} disabled={isCompleting || isRejecting} className="w-full py-3 font-semibold flex items-center justify-center gap-2 text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-px disabled:opacity-50"><FaCheck /><span>Approve & Complete</span></button></div></div>}
                                        {project.status === 'Completed' && <div className="p-4 text-center text-green-300 bg-green-900/30 rounded-lg ring-1 ring-green-500/50"><p className="font-semibold">Project Completed</p></div>}
                                        {project.status === 'Open' && <button onClick={handleDeleteProject} disabled={isDeleting} className="w-full py-3 font-semibold text-red-300 bg-red-900/40 rounded-lg ring-1 ring-red-500/50 hover:bg-red-900/70 transition-colors disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete Project'}</button>}
                                    </div>
                                </div>
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
                                            <button onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"><FaPaperclip size={18} /></button>
                                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message to the freelancer..." onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), handleSendMessage()) : null} className="flex-grow w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none" />
                                            <button onClick={handleSendMessage} className="p-3 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"><FaPaperPlane size={18} /></button>
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

export default ProjectWorkingClient;