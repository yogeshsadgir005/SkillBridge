import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';

const ProjectCard = ({ project }) => {
    const getStatusClasses = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/10 text-green-400 ring-green-500/30';
            case 'Active': return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
            case 'Pending Approval': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30';
            default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
        }
    };
    
    return (
        <Link 
            to={`/freelancer/project/${project._id}`} 
            className="block p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl transition-all duration-300 hover:ring-slate-700 hover:-translate-y-2 hover:shadow-cyan-500/10"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <p className="font-semibold text-teal-400 mt-1">Budget: ₹{project.budget.toLocaleString('en-IN')}</p>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusClasses(project.status)}`}>
                    {project.status}
                </span>
            </div>
            <p className="text-slate-400 leading-relaxed mt-4 line-clamp-2">{project.description}</p>
            <div className="border-t border-slate-800 pt-4 mt-4 text-xs text-slate-500">
                Created on: {new Date(project.createdAt).toLocaleDateString()}
            </div>
        </Link>
    );
};


const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  const { token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        const params = {};
        if (filter !== 'All') {
          params.status = filter;
        }
        const response = await api.get('/freelancer/my-projects', { params });
        setProjects(response.data);
      } catch (err) {
        setError('Failed to fetch your projects.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProjects();
  }, [token, filter]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="freelancer" />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                    My Projects
                </h1>
                <p className="mt-2 text-lg text-slate-400">Manage your active and completed work.</p>
            </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
          >
            <option value="All">All Projects</option>
            <option value="Active">Active</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {isLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center min-h-[50vh] text-slate-400">
                <div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>
                Loading Projects...
            </div>
        ) : error ? (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="p-8 text-center bg-red-900/30 rounded-lg ring-1 ring-red-500/50">
                    <p className="font-bold text-red-400">An Error Occurred</p>
                    <p className="text-red-300 mt-2">{error}</p>
                </div>
            </div>
        ) : (
            projects.length > 0 ? (
                <div className="space-y-6">
                    {projects.map(project => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800">
                    <h3 className="text-2xl font-bold text-white">No Projects Found</h3>
                    <p className="text-slate-400 mt-2">You have no projects with the status "{filter}".</p>
                </div>
            )
        )}
      </main>
    </div>
  );
};

export default MyProjects;