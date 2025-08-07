import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaArrowRight } from 'react-icons/fa';

const StatCard = ({ title, value, buttonText, buttonLink }) => (
  <div className="group relative p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/10">
    <div 
      className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-teal-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    ></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-slate-400">{title}</h3>
        <p className="text-6xl font-bold text-white my-4">{value}</p>
      </div>
      <Link to={buttonLink} className="mt-4 text-sm font-semibold text-teal-300 hover:text-white transition-colors flex items-center gap-2">
        {buttonText}
        <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
);


const Admin = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Authentication required to view this page.");
        return;
      }
      
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, [token]);

  const renderLoading = () => (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[50vh] text-slate-400">
      <div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>
      Loading Dashboard...
    </div>
  );

  const renderError = () => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <div className="p-8 text-center bg-red-900/30 rounded-lg ring-1 ring-red-500/50">
            <p className="font-bold text-red-400">An Error Occurred</p>
            <p className="text-red-300 mt-2">{error}</p>
        </div>
    </div>
  );
  
  const renderDashboard = () => (
    stats && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="All Projects" 
          value={stats.allProjects} 
          buttonText="View projects"
          buttonLink="/admin/projects"
        />
        <StatCard 
          title="Completed Projects" 
          value={stats.completedProjects} 
          buttonText="View projects"
          buttonLink="/admin/projects?status=completed"
        />
        <StatCard 
          title="Total Applications" 
          value={stats.applications} 
          buttonText="View Applications"
          buttonLink="/admin/applications"
        />
        <StatCard 
          title="Registered Users" 
          value={stats.users} 
          buttonText="View Users"
          buttonLink="/admin/all-users"
        />
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="admin" />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-400">Oversee and manage platform activity.</p>
        </div>
        
        {isLoading ? renderLoading() : error ? renderError() : renderDashboard()}
      </main>
    </div>
  );
};

export default Admin;