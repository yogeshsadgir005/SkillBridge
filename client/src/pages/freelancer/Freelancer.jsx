import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaArrowRight, FaEdit, FaSave } from 'react-icons/fa';

const StatCard = ({ title, value, buttonText, buttonLink, isFunds = false }) => (
    <div className="group relative p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-cyan-500/10">
        <div className={`absolute top-0 left-0 h-full w-full bg-gradient-to-tr ${isFunds ? 'from-green-500/10 to-teal-500/10' : 'from-teal-500/10 to-cyan-500/10'} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}></div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-400">{title}</h3>
                <p className={`text-6xl font-bold my-4 ${isFunds ? 'text-green-400' : 'text-white'}`}>
                    {isFunds ? `₹${value}` : value}
                </p>
                {isFunds && <span className="text-sm text-slate-500">Available Balance</span>}
            </div>
            {buttonText && (
                <Link to={buttonLink} className="mt-4 text-sm font-semibold text-teal-300 hover:text-white transition-colors flex items-center gap-2">
                    {buttonText}
                    <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    </div>
);

const ProfileSection = ({ initialProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(initialProfile);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setProfileData(initialProfile);
    }, [initialProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.patch('/freelancer/profile', {
                description: profileData.description,
                skills: profileData.skills.join(','), 
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Could not update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl">
            {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                    <h2 className="text-3xl font-bold text-white mb-6">Edit Your Profile</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="skills" className="block mb-2 text-sm font-medium text-slate-400">My Skills (comma-separated)</label>
                            <input
                                id="skills"
                                type="text"
                                value={profileData.skills.join(', ')}
                                onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))}
                                className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-400">About Me</label>
                            <textarea
                                id="description"
                                value={profileData.description}
                                onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                                rows="5"
                                className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
                            />
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <button type="submit" disabled={isSubmitting} className="px-6 py-3 font-semibold flex items-center justify-center gap-2 text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-px disabled:opacity-40">
                                <FaSave />
                                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-semibold text-slate-300 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Your Profile</h2>
                            <p className="mt-1 text-slate-400">This is how clients see you. Keep it up-to-date!</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="w-full sm:w-auto px-6 py-3 font-semibold flex items-center justify-center gap-2 text-white bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                            <FaEdit />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">My Skills</h3>
                        <div className="flex flex-wrap gap-3 mt-3">
                            {profileData && profileData.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 text-sm font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">About Me</h3>
                        <p className="mt-3 text-slate-300 leading-relaxed whitespace-pre-wrap">{profileData && profileData.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const Freelancer = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const response = await api.get('/freelancer/dashboard');
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
      <Navbar type="freelancer" />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-12">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                Welcome, {user ? user.fullName.split(' ')[0] : 'Freelancer'}!
            </h1>
            <p className="mt-2 text-lg text-slate-400">This is your command center. Let's get to work.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Active Projects" value={dashboardData.stats.activeProjects} buttonText="View Projects" buttonLink="/freelancer/my-projects" />
              <StatCard title="Completed Projects" value={dashboardData.stats.completedProjects} buttonText="View Projects" buttonLink="/freelancer/my-projects?status=completed" />
              <StatCard title="My Applications" value={dashboardData.stats.applications} buttonText="View Applications" buttonLink="/freelancer/applications" />
              <StatCard title="Funds" value={dashboardData.stats.funds.toLocaleString('en-IN')} isFunds={true} />
            </div>
            
            <ProfileSection initialProfile={dashboardData.profile} />
          </>
        )}
      </main>
    </div>
  );
};

export default Freelancer;