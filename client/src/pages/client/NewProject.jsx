import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api';
import { FaRocket } from 'react-icons/fa';

const NewProject = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skills: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const submissionData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      budget: Number(formData.budget)
    };

    try {
      await api.post('/projects', submissionData);
      setSuccess('Project submitted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      console.error("Project submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="client" />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex items-center justify-center">
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-4xl p-8 space-y-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-slate-800"
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
              Launch a New Project
            </h2>
            <p className="mt-2 text-slate-400">Fill out the details below to find the perfect talent.</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-400">Project Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-400">Project Description</label>
              <textarea id="description" name="description" rows="6" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block mb-2 text-sm font-medium text-slate-400">Budget (in ₹)</label>
                <input type="number" id="budget" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
              </div>
              <div>
                <label htmlFor="skills" className="block mb-2 text-sm font-medium text-slate-400">Required Skills (comma-separated)</label>
                <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
              </div>
            </div>

            {error && <div className="p-4 text-center text-red-300 bg-red-900/30 rounded-lg ring-1 ring-red-500/50">{error}</div>}
            {success && <div className="p-4 text-center text-green-300 bg-green-900/30 rounded-lg ring-1 ring-green-500/50">{success}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2">
                <FaRocket />
                <span>{isSubmitting ? 'Posting Project...' : 'Post Project'}</span>
              </div>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewProject;