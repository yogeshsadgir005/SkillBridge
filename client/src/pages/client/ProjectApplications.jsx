import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ApplicationCard = ({ application, onAction }) => {
    const isActionable = application.status === 'Pending';

    const getStatusClasses = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-500/10 text-green-400 ring-green-500/30';
            case 'Pending': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30 animate-pulse';
            case 'Rejected': return 'bg-red-500/10 text-red-400 ring-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
        }
    };

    return (
        <div className="p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1">
                <p className="font-bold text-lg text-white">{application.freelancer.fullName}</p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-3">{application.proposal}</p>
            </div>

            <div className="md:col-span-1 text-center md:text-left">
                <p className="text-slate-400 font-semibold">Bid</p>
                <p className="text-2xl font-bold text-white">₹{application.proposedBudget.toLocaleString('en-IN')}</p>
            </div>

            <div className="md:col-span-1 flex flex-col sm:flex-row items-center justify-end gap-3">
                {isActionable ? (
                    <>
                        <button onClick={() => onAction(application._id, 'Rejected')} className="w-full sm:w-auto px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                            <FaTimes />
                            <span>Reject</span>
                        </button>
                        <button onClick={() => onAction(application._id, 'Accepted')} className="w-full sm:w-auto px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-px">
                            <FaCheck />
                            <span>Accept</span>
                        </button>
                    </>
                ) : (
                    <span className={`px-4 py-1.5 text-sm font-bold rounded-full ring-1 ${getStatusClasses(application.status)}`}>
                        {application.status}
                    </span>
                )}
            </div>
        </div>
    );
};


const ProjectApplications = () => {
    const [projects, setProjects] = useState([]);
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const { token } = useContext(GeneralContext);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!token) return;
            try {
                const response = await api.get('/client/projects-list');
                setProjects(response.data);
            } catch (err) {
                console.error("Failed to fetch projects list:", err);
            }
        };
        fetchProjects();
    }, [token]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const params = filter !== 'all' ? { projectId: filter } : {};
                const response = await api.get('/client/applications', { params });
                setApplications(response.data);
            } catch (err) {
                setError('Failed to fetch applications.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, [token, filter]);

    const handleAction = async (applicationId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this application?`)) {
            return;
        }

        try {
            const response = await api.patch(`/client/applications/${applicationId}/status`, { status });
            const updatedApplication = response.data;

            setApplications(prevApps => {
                if (updatedApplication.status === 'Accepted') {
                    const acceptedProjectId = typeof updatedApplication.project === 'object' 
                        ? updatedApplication.project._id 
                        : updatedApplication.project;

                    return prevApps.map(app => {
                        if (app.project._id === acceptedProjectId) {
                            return app._id === updatedApplication._id 
                                ? { ...app, status: 'Accepted' } 
                                : { ...app, status: 'Rejected' };
                        }
                        return app;
                    });
                } else {
                    return prevApps.map(app => 
                        app._id === updatedApplication._id ? { ...app, status: 'Rejected' } : app
                    );
                }
            });

        } catch (err) {
            alert('Failed to update application status.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
            <Navbar type="client" />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                            Project Applications
                        </h1>
                        <p className="mt-2 text-lg text-slate-400">Review and manage bids for your projects.</p>
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
                    >
                        <option value="all">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-4 items-center justify-center min-h-[50vh] text-slate-400">
                        <div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>
                        Loading Applications...
                    </div>
                ) : error ? (
                    <div className="min-h-[50vh] flex items-center justify-center">
                        <div className="p-8 text-center bg-red-900/30 rounded-lg ring-1 ring-red-500/50">
                            <p className="font-bold text-red-400">An Error Occurred</p>
                            <p className="text-red-300 mt-2">{error}</p>
                        </div>
                    </div>
                ) : (
                    applications.length > 0 ? (
                        <div className="space-y-6">
                            {applications.map(app => (
                                <ApplicationCard key={app._id} application={app} onAction={handleAction} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800">
                            <h3 className="text-2xl font-bold text-white">No Applications Found</h3>
                            <p className="text-slate-400 mt-2">There are no applications for the selected project.</p>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ProjectApplications;