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
            case 'Open': return 'bg-orange-500/10 text-orange-400 ring-orange-500/30';
            default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
        }
    };
    
    return (
        <article className="group relative flex flex-col justify-between p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl transition-all duration-300 hover:ring-slate-700 hover:-translate-y-2">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white pr-4">{project.title}</h3>
                    <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusClasses(project.status)}`}>
                        {project.status}
                    </span>
                </div>
                <p className="font-semibold text-slate-400 mb-4">Budget: ₹{project.budget.toLocaleString('en-IN')}</p>
                <p className="text-slate-400 leading-relaxed line-clamp-3">{project.description}</p>
            </div>
            <div className="pt-5 mt-5 border-t border-slate-800">
                <Link to={`/client/project/${project._id}`} className="block text-center font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg py-3 shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105">
                    Manage & Chat
                </Link>
            </div>
        </article>
    );
};

const ClientProjects = () => {
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
        const response = await api.get('/client/my-projects', { params });
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
      <Navbar type="client" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                    My Projects
                </h1>
                <p className="mt-2 text-lg text-slate-400">View and manage all your posted projects.</p>
            </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800">
                    <h3 className="text-2xl font-bold text-white">No Projects Found</h3>
                    <p className="text-slate-400 mt-2">No projects match the status "{filter}".</p>
                </div>
            )
        )}
      </main>
    </div>
  );
};

export default ClientProjects;