import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GeneralContext } from './context/GeneralContext';
import ClientProjects from './pages/client/ClientProjects';
import Landing from './pages/Landing';
import Authenticate from './pages/Authenticate';
import Admin from './pages/admin/Admin';
import AdminProjects from './pages/admin/AdminProjects';
import AllUsers from './pages/admin/AllUsers';
import AllApplicationsAdmin from './pages/admin/AllApplications';
import Client from './pages/client/Client';
import NewProject from './pages/client/NewProject';
import ProjectApplications from './pages/client/ProjectApplications';
import ProjectWorkingClient from './pages/client/ProjectWorking';
import Freelancer from './pages/freelancer/Freelancer';
import AllProjects from './pages/freelancer/AllProjects';
import MyApplications from './pages/freelancer/MyApplications';
import MyProjects from './pages/freelancer/MyProjects';
import WorkingProjectFreelancer from './pages/freelancer/WorkingProject';
import ProjectData from './pages/freelancer/ProjectData';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useContext(GeneralContext);

  const storedData = localStorage.getItem('userData');
  const session = storedData ? JSON.parse(storedData) : null;

  const currentToken = token || session?.token;
  const currentUser = user || session?.user;
  
  if (!currentToken || !currentUser) {
    return <Navigate to="/authenticate" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    const homePath = `/${currentUser.role.toLowerCase()}/dashboard`;
    return <Navigate to={homePath} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/authenticate" element={<Authenticate />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin']}><AdminProjects /></ProtectedRoute>} />
        <Route path="/admin/all-users" element={<ProtectedRoute allowedRoles={['admin']}><AllUsers /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AllApplicationsAdmin /></ProtectedRoute>} />

        <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={['client']}><Client /></ProtectedRoute>} />
        <Route path="/client/projects" element={<ProtectedRoute allowedRoles={['client']}><ClientProjects /></ProtectedRoute>} />
        <Route path="/client/new-project" element={<ProtectedRoute allowedRoles={['client']}><NewProject /></ProtectedRoute>} />
        <Route path="/client/applications" element={<ProtectedRoute allowedRoles={['client']}><ProjectApplications /></ProtectedRoute>} />
        <Route path="/client/project/:id" element={<ProtectedRoute allowedRoles={['client']}><ProjectWorkingClient /></ProtectedRoute>} />
        
        <Route path="/freelancer/dashboard" element={<ProtectedRoute allowedRoles={['freelancer']}><Freelancer /></ProtectedRoute>} />
        <Route path="/freelancer/all-projects" element={<ProtectedRoute allowedRoles={['freelancer']}><AllProjects /></ProtectedRoute>} />
        <Route path="/freelancer/project-details/:id" element={<ProtectedRoute allowedRoles={['freelancer']}><ProjectData /></ProtectedRoute>} />
        <Route path="/freelancer/my-projects" element={<ProtectedRoute allowedRoles={['freelancer']}><MyProjects /></ProtectedRoute>} />
        <Route path="/freelancer/applications" element={<ProtectedRoute allowedRoles={['freelancer']}><MyApplications /></ProtectedRoute>} />
        <Route path="/freelancer/project/:id" element={<ProtectedRoute allowedRoles={['freelancer']}><WorkingProjectFreelancer /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;