import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';

const ApplicationCard = ({ application }) => {
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-500/10 text-green-400 ring-green-500/30';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/30';
      case 'Rejected': return 'bg-red-500/10 text-red-400 ring-red-500/30';
      default: return 'bg-slate-500/10 text-slate-400 ring-slate-500/30';
    }
  };

  return (
    <article className="bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <div className="p-6">
        <p className="text-xl font-bold text-white hover:text-teal-400 transition-colors">{application.project.title}</p>
        <p className="text-slate-400 leading-relaxed my-3 line-clamp-4">{application.project.description}</p>
        <h4 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-3">Skills Required</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {(application.project.skills || []).map(skill => (
            <span key={skill} className="px-3 py-1 text-xs font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>
          ))}
        </div>
        <p className="font-semibold text-slate-300">Project Budget - ₹{application.project.budget.toLocaleString('en-IN')}</p>
      </div>

      <div className="p-6 bg-slate-800/50">
        <h3 className="text-lg font-bold text-white mb-4">My Proposal</h3>
        <p className="text-slate-400 mb-6">{application.proposal}</p>
        <h4 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-3">Skills I Offered</h4>
        <div className="flex flex-wrap gap-2 mb-6">
            {(application.skills || []).map(skill => (
                <span key={skill} className="px-3 py-1 text-xs font-medium text-teal-300 bg-teal-900/50 rounded-full ring-1 ring-teal-500/30">{skill}</span>
            ))}
        </div>
        <p className="font-semibold text-slate-300 mb-4">My Bid - ₹{application.proposedBudget.toLocaleString('en-IN')}</p>
        <div className="font-semibold text-slate-300 flex items-center gap-2">
            Status: 
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusClasses(application.status)}`}>
                {application.status}
            </span>
        </div>
      </div>
    </article>
  );
};


const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const { token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = {};
        if (filter !== 'All') {
            params.status = filter;
        }
        const response = await api.get('/freelancer/applications', { params });
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

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="freelancer" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                    My Applications
                </h1>
                <p className="mt-2 text-lg text-slate-400">Track the status of all your project bids.</p>
            </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
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
                <div className="space-y-8">
                    {applications.map(app => (
                        <ApplicationCard key={app._id} application={app} />
                    ))}
                </div>
            ) : (
                <div className="text-center min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800">
                    <h3 className="text-2xl font-bold text-white">No Applications Found</h3>
                    <p className="text-slate-400 mt-2">You have no applications with the status "{filter}".</p>
                </div>
            )
        )}
      </main>
    </div>
  );
};

export default MyApplications;