import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { GeneralContext } from '../context/GeneralContext';

const Login = ({ onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useContext(GeneralContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(user, token, navigate);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-slate-800">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
          Welcome Back
        </h2>
        <p className="mt-2 text-slate-400">Sign in to continue your journey.</p>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-400">Email address</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-400">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-800/50 text-slate-200 border-transparent rounded-lg ring-1 ring-inset ring-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-300" 
            required 
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>}
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full py-3 mt-4 font-semibold text-white bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-slate-400">
        Not registered yet?{' '}
        <button 
          onClick={onSwitchMode} 
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          Create an account
        </button>
      </p>
    </div>
  );
};
export default Login;