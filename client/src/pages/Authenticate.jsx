import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Login from '../components/Login';
import Register from '../components/Register';

const Authenticate = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const switchModeHandler = () => {
    setIsLoginView(prevMode => !prevMode);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          {isLoginView ? (
            <Login onSwitchMode={switchModeHandler} />
          ) : (
            <Register onSwitchMode={switchModeHandler} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Authenticate;