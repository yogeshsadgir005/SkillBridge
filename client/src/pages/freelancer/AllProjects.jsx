import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaSearch } from 'react-icons/fa';

const FilterPanel = ({ availableSkills, selectedSkills, onSkillChange }) => (
  <aside className="sticky top-28 p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl">
    <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Filters</h3>
    <div>
      <h4 className="font-semibold text-slate-300 mb-4">Skills</h4>
      <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {availableSkills.map(skill => (
          <li key={skill} className="flex items-center">
            <input 
              id={skill} 
              type="checkbox"
              value={skill}
              checked={selectedSkills.includes(skill)}
              onChange={onSkillChange}
              className="h-4 w-4 rounded cursor-pointer accent-teal-500 bg-slate-700 border-slate-600 focus:ring-teal-400"
            />
            <label htmlFor={skill} className="ml-3 text-sm text-slate-300 cursor-pointer">{skill}</label>
          </li>
        ))}
      </ul>
    </div>
  </aside>
);

const ProjectCard = ({ project }) => (
  <article className="group relative flex flex-col p-6 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl transition-all duration-300 hover:ring-slate-700 hover:-translate-y-2">
    <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
            <Link to={`/freelancer/project-details/${project._id}`} className="text-xl font-bold text-white hover:text-teal-400 transition-colors duration-300 pr-4">
                {project.title}
            </Link>
            <span className="text-xs text-slate-500 flex-shrink-0">{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="font-semibold text-teal-400 mb-4">Budget: ₹{project.budget.toLocaleString('en-IN')}</p>
        <p className="text-slate-400 leading-relaxed mb-6 line-clamp-3">{project.description}</p>
    </div>
    <div className="flex-grow flex items-end">
        <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-4">
            {project.skills.slice(0, 4).map(skill => (
                <span key={skill} className="px-3 py-1 text-xs font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>
            ))}
            </div>
            <div className="border-t border-slate-800 pt-4 flex items-center gap-x-6 text-sm text-slate-400 font-medium">
                <span>{project.bidsCount} bids</span>
                {project.avgBid && <span>₹{project.avgBid.toLocaleString('en-IN')} (avg bid)</span>}
            </div>
        </div>
    </div>
  </article>
);


const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useContext(GeneralContext);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get('/skills');
        setAvailableSkills(response.data);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = {
            search: searchTerm,
            skills: selectedSkills.join(',')
        };
        const response = await api.get('/projects', { params });
        setProjects(response.data);
      } catch (err) {
        setError('Failed to fetch projects. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
        fetchProjects();
    }, 500);

    return () => clearTimeout(timer);
  }, [token, selectedSkills, searchTerm]);

  const handleSkillChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSkills(prev => 
      checked ? [...prev, value] : prev.filter(skill => skill !== value)
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="freelancer" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1">
            <FilterPanel 
              availableSkills={availableSkills}
              selectedSkills={selectedSkills}
              onSkillChange={handleSkillChange}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-12">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                    Find Your Next Opportunity
                </h1>
                <p className="mt-2 text-lg text-slate-400">Browse and filter projects to match your skills.</p>
            </div>
            <div className="relative mb-8">
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300"
                />
            </div>
            {isLoading ? (
                <div className="flex flex-col gap-4 items-center justify-center min-h-[50vh] text-slate-400">
                    <div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>
                    Finding Projects...
                </div>
            ) : error ? (
                <div className="min-h-[50vh] flex items-center justify-center p-8 text-center bg-red-900/30 rounded-lg ring-1 ring-red-500/50">
                    <p className="font-bold text-red-400">{error}</p>
                </div>
            ) : (
              <div className="space-y-6">
                {projects.length > 0 ? projects.map(project => (
                  <ProjectCard key={project._id} project={project} />
                )) : (
                    <div className="text-center min-h-[50vh] flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800">
                        <h3 className="text-2xl font-bold text-white">No Projects Found</h3>
                        <p className="text-slate-400 mt-2">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllProjects;