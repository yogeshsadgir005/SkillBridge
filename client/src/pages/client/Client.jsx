import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaPlus, FaArrowRight } from 'react-icons/fa';

const StatCard = ({ title, value, linkTo, isAction = false }) => {
    if (isAction) {
        return (
            <Link 
                to={linkTo} 
                className="group relative flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-2xl shadow-2xl shadow-cyan-500/20 text-white text-center transition-all duration-300 hover:-translate-y-2"
            >
                <div className="mb-4">
                    <FaPlus size={32} />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
            </Link>
        );
    }

    return (
        <Link 
            to={linkTo} 
            className="group relative p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/10"
        >
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-slate-400">{title}</h3>
                    <p className="text-6xl font-bold text-white my-4">{value}</p>
                </div>
                <div className="mt-4 text-sm font-semibold text-teal-300 flex items-center gap-2">
                    View
                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
};

const ProjectRow = ({ project }) => {
    const getStatusClasses = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/10 text-green-400 ring-green-500/30';
            case 'Active': return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
            case 'Pending Approval': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30';
            default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
        }
    };

    return (
        <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4 font-medium text-white">{project.title}</td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusClasses(project.status)}`}>
                    {project.status}
                </span>
            </td>
            <td className="px-6 py-4 text-center font-semibold text-slate-300">{project.applicationCount}</td>
            <td className="px-6 py-4">
                <Link to={`/client/project/${project._id}`} className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                    Manage
                </Link>
            </td>
        </tr>
    );
};


const Client = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useContext(GeneralContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/client/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="client" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                Welcome back, {user ? user.fullName.split(' ')[0] : 'Client'}!
            </h1>
            <p className="mt-2 text-lg text-slate-400">Here's a summary of your projects and activity.</p>
        </div>
        
        {isLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center min-h-[50vh] text-slate-400">
                <div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>
                Loading Dashboard...
            </div>
        ) : error ? (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="p-8 text-center bg-red-900/30 rounded-lg ring-1 ring-red-500/50">
                    <p className="font-bold text-red-400">An Error Occurred</p>
                    <p className="text-red-300 mt-2">{error}</p>
                </div>
            </div>
        ) : dashboardData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <StatCard title="Active Projects" value={dashboardData.stats.activeProjects} linkTo="/client/projects?status=active" />
              <StatCard title="Completed Projects" value={dashboardData.stats.completedProjects} linkTo="/client/projects?status=completed" />
              <StatCard title="Applications Received" value={dashboardData.stats.totalApplications} linkTo="/client/applications" />
              <StatCard title="Post a New Project" linkTo="/client/new-project" isAction={true} />
            </div>

            <h3 className="text-3xl font-bold text-white mb-6">Your Recent Projects</h3>
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-4">Project Title</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-center">Bids</th>
                    <th scope="col" className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {dashboardData.recentProjects.length > 0 ? (
                        dashboardData.recentProjects.map(project => (
                            <ProjectRow key={project._id} project={project} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center p-10 text-slate-500">You have no recent projects.</td>
                        </tr>
                    )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Client;