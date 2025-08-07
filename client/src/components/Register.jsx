import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { GeneralContext } from '../context/GeneralContext';

const Register = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: 'Freelancer',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(GeneralContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase(),
      });
      const { token, user } = response.data;
      login(user, token, navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-slate-800">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          Join the Future
        </h2>
        <p className="mt-2 text-slate-400">Start your journey with us today.</p>
      </div>
      <form onSubmit={handleRegister} className="flex flex-col gap-y-5">
        <div>
          <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-slate-400">Full Name</label>
          <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
        </div>
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-400">Email Address</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
        </div>
        <div>
          <label htmlFor="password"  className="block mb-2 text-sm font-medium text-slate-400">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
        </div>
        <div>
          <label htmlFor="confirmPassword"  className="block mb-2 text-sm font-medium text-slate-400">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" required />
        </div>
        <div>
            <label className="block mb-3 text-sm font-medium text-slate-400">Register as a</label>
            <div className="flex items-center gap-x-6">
                <div className="flex items-center">
                    <input type="radio" id="freelancer" name="role" value="Freelancer" checked={formData.role === 'Freelancer'} onChange={handleChange} className="h-4 w-4 accent-teal-500 focus:ring-teal-400 bg-slate-700 border-slate-600"/>
                    <label htmlFor="freelancer" className="ml-2 text-sm text-slate-300">Freelancer</label>
                </div>
                <div className="flex items-center">
                    <input type="radio" id="client" name="role" value="Client" checked={formData.role === 'Client'} onChange={handleChange} className="h-4 w-4 accent-teal-500 focus:ring-teal-400 bg-slate-700 border-slate-600"/>
                    <label htmlFor="client" className="ml-2 text-sm text-slate-300">Client</label>
                </div>
            </div>
        </div>
        {error && <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="w-full py-3 mt-4 font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
          {isSubmitting ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      <p className="text-center text-slate-400">
        Already have an account?{' '}
        <button onClick={onSwitchMode} className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
          Sign In
        </button>
      </p>
    </div>
  );
};
export default Register;