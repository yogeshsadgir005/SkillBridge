
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { GeneralContextProvider } from './context/GeneralContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   
    <GeneralContextProvider>
      <App />
    </GeneralContextProvider>
  </React.StrictMode>
);