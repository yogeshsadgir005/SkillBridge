import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
                <Link to="/" className="flex-shrink-0">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                    SB Works
                    </h1>
                </Link>
                <Link to="/authenticate">
                    <button className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800/50 rounded-lg hover:bg-slate-700/50 ring-1 ring-slate-800 transition-colors">
                        Sign In
                    </button>
                </Link>
            </div>
        </nav>

        <main className="flex-grow flex flex-col items-center justify-center text-center text-white px-4">
          <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 leading-tight mb-6">
            Empower Your Journey
          </h2>
          <p className="max-w-3xl text-lg md:text-xl text-slate-400 mb-12">
            Unleash your creativity and skills on a thriving marketplace where innovation meets opportunity, connecting talented freelancers with businesses seeking excellence.
          </p>
          <Link to="/authenticate">
            <button className="py-4 px-8 font-semibold text-white flex items-center gap-3 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition-all duration-300 hover:-translate-y-px">
              <span>Join Now</span>
              <FaArrowRight />
            </button>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Landing;