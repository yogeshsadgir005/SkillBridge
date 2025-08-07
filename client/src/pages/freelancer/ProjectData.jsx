import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { GeneralContext } from '../../context/GeneralContext';
import api from '../../api';
import { FaPaperPlane } from 'react-icons/fa';

const ProjectData = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(GeneralContext);

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    proposal: '',
    proposedBudget: '',
    skills: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!token || !projectId) return;
      try {
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data.project);
        setFormData(prev => ({...prev, skills: response.data.project.skills.join(', ')}));
      } catch (err) {
        setError("Failed to load project details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [token, projectId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
        const submissionData = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()),
            proposedBudget: Number(formData.proposedBudget)
        };
        await api.post(`/projects/${projectId}/apply`, submissionData);
        alert('Application submitted successfully!');
        navigate('/freelancer/applications');
    } catch (err) {
        setSubmitError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-sans"><div className="w-8 h-8 border-4 border-t-teal-500 border-slate-700 rounded-full animate-spin"></div>Loading Project Details...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <Navbar type="freelancer" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {project && (
          <div className="space-y-12">
            <div className="p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">{project.title}</h1>
              <p className="mt-6 text-slate-400 leading-relaxed whitespace-pre-wrap">{project.description}</p>
              <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Required Skills</h2>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {project.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 text-sm font-medium text-cyan-300 bg-cyan-900/50 rounded-full ring-1 ring-cyan-500/30">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Project Budget</h2>
                  <p className="mt-2 text-3xl font-bold text-white">₹{project.budget.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl ring-1 ring-slate-800 shadow-2xl">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 mb-8">
                Submit Your Proposal
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="proposal" className="block mb-2 text-sm font-medium text-slate-400">Your Proposal</label>
                  <textarea name="proposal" id="proposal" rows="6" value={formData.proposal} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="proposedBudget" className="block mb-2 text-sm font-medium text-slate-400">Your Bid (in ₹)</label>
                    <input type="number" name="proposedBudget" id="proposedBudget" value={formData.proposedBudget} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
                  </div>
                  <div>
                    <label htmlFor="skills" className="block mb-2 text-sm font-medium text-slate-400">Skills You'll Use (comma-separated)</label>
                    <input type="text" name="skills" id="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
                  </div>
                </div>
                {submitError && <p className="text-red-400 text-sm text-center animate-pulse">{submitError}</p>}
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-4 py-3 px-8 font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
                    <div className="flex items-center justify-center gap-2">
                        <FaPaperPlane />
                        <span>{isSubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                    </div>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectData;