import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { GeneralContext } from '../context/GeneralContext';
import { FaSignOutAlt } from 'react-icons/fa';

const navLinkStyles = ({ isActive }) => 
  `px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
    isActive 
    ? 'bg-teal-500/10 text-teal-300' 
    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

const PublicLinks = () => (
  <NavLink to="/" className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
    Home
  </NavLink>
);

const FreelancerLinks = ({ onLogout }) => {
  return (
    <div className="flex items-center gap-x-2 sm:gap-x-4">
      <NavLink to="/freelancer/dashboard" className={navLinkStyles}>Dashboard</NavLink>
      <NavLink to="/freelancer/all-projects" className={navLinkStyles}>All Projects</NavLink>
      <NavLink to="/freelancer/my-projects" className={navLinkStyles}>My Projects</NavLink>
      <NavLink to="/freelancer/applications" className={navLinkStyles}>Applications</NavLink>
      <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10">
        <FaSignOutAlt size={18} />
      </button>
    </div>
  );
};

const ClientLinks = ({ onLogout }) => {
    return (
      <div className="flex items-center gap-x-2 sm:gap-x-4">
        <NavLink to="/client/dashboard" className={navLinkStyles}>Dashboard</NavLink>
        <NavLink to="/client/new-project" className={navLinkStyles}>New Project</NavLink>
        <NavLink to="/client/applications" className={navLinkStyles}>Applications</NavLink>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10">
          <FaSignOutAlt size={18} />
        </button>
      </div>
    );
};

const AdminLinks = ({ onLogout }) => {
    return (
        <div className="flex items-center gap-x-2 sm:gap-x-4">
            <NavLink to="/admin/dashboard" className={navLinkStyles}>Home</NavLink>
            <NavLink to="/admin/all-users" className={navLinkStyles}>All users</NavLink>
            <NavLink to="/admin/projects" className={navLinkStyles}>Projects</NavLink>
            <NavLink to="/admin/applications" className={navLinkStyles}>Applications</NavLink>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10">
              <FaSignOutAlt size={18} />
            </button>
        </div>
    );
};

const Navbar = ({ type = 'public' }) => {
  const { logout } = useContext(GeneralContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/authenticate');
  };
  
  const renderLinks = () => {
    switch (type) {
      case 'freelancer': return <FreelancerLinks onLogout={handleLogout} />;
      case 'client': return <ClientLinks onLogout={handleLogout} />;
      case 'admin': return <AdminLinks onLogout={handleLogout} />;
      default: return <PublicLinks />;
    }
  };

  const getLogoLink = () => {
    switch (type) {
        case 'freelancer': return '/freelancer/dashboard';
        case 'client': return '/client/dashboard';
        case 'admin': return '/admin/dashboard';
        default: return '/';
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-lg ring-1 ring-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to={getLogoLink()} className="flex-shrink-0">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
              SB Works
              {type === 'admin' && <span className='ml-2 text-sm font-normal text-red-400'>(admin)</span>}
            </h1>
          </Link>
          <div className="hidden sm:block">
            {renderLinks()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;