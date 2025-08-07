// src/context/GeneralContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

export const GeneralContext = createContext({
  token: null,
  user: null,
  socket: null,
  login: (userData, token, navigate) => {},
  logout: () => {},
});

export const GeneralContextProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const { user, token } = JSON.parse(storedData);
      setToken(token);
      setUser(user);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:4000', {
        auth: { token },
      });
      setSocket(newSocket);
      return () => newSocket.disconnect();
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token]);

  const loginHandler = useCallback((userData, userToken, navigate) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify({ user: userData, token: userToken }));
    
    switch (userData.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'freelancer':
        navigate('/freelancer/dashboard');
        break;
      case 'client':
        navigate('/client/dashboard');
        break;
      default:
        navigate('/');
    }
  }, []);

  const logoutHandler = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userData');
  }, []);

  const contextValue = {
    token,
    user,
    socket,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <GeneralContext.Provider value={contextValue}>
      {children}
    </GeneralContext.Provider>
  );
};