import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaEye, FaBan, FaCheckCircle } from 'react-icons/fa';

const ProjectRow = ({ project, onSuspend }) => {
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-400 ring-green-500/30';
      case 'Active': return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
      case 'Pending Approval': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30';
      case 'Suspended': return 'bg-red-500/10 text-red-400 ring-red-500/30';
      default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
    }
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 font-medium text-white">{project.title}</td>
      <td className="px-6 py-4 text-slate-400">{project.client.name}</td>
      <td className="px-6 py-4 text-slate-300">₹{project.budget.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusClasses(project.status)}`}>
          {project.status}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-400">{new Date(project.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-x-4">
            <Link to={`/projects/${project._id}`} className="text-slate-400 hover:text-cyan-400 transition-colors">
                <FaEye />
            </Link>
            <button onClick={() => onSuspend(project._id, project.status)} className={`transition-colors ${project.status === 'Suspended' ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-red-400'}`}>
                {project.status === 'Suspended' ? <FaCheckCircle /> : <FaBan />}
            </button>
        </div>
      </td>
    </tr>
  );
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

  const { token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await api.get('/admin/projects', {
          params: { ...filters, page: pagination.page, limit: pagination.limit }
        });
        setProjects(response.data.projects);
        setPagination(prev => ({ ...prev, totalPages: response.data.pagination.totalPages }));
      } catch (err) {
        setError('Failed to fetch projects.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [token, filters, pagination.page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleSuspendProject = async (projectId, currentStatus) => {
    const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this project?`)) {
      return;
    }
    
    try {
      await api.patch(`/admin/projects/${projectId}/status`, { status: newStatus });
      setProjects(projects.map(p => 
        p._id === projectId ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      alert(`Failed to update project status.`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="admin" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                Project Management
            </h1>
            <p className="mt-2 text-lg text-slate-400">Search, filter, and moderate all projects on the platform.</p>
        </div>

        <div className="mb-8 p-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search by title or client..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full sm:w-2/3 lg:w-1/3 px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full sm:w-auto px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Active">Active</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Completed">Completed</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 overflow-x-auto">
          {isLoading ? (
            <p className="p-10 text-center text-slate-400">Loading projects...</p>
          ) : error ? (
            <p className="p-10 text-center text-red-400">{error}</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4">Project Title</th>
                  <th scope="col" className="px-6 py-4">Client</th>
                  <th scope="col" className="px-6 py-4">Budget</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Date Posted</th>
                  <th scope="col" className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <ProjectRow key={project._id} project={project} onSuspend={handleSuspendProject} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProjects;