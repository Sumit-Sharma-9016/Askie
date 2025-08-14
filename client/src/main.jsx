import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';
import './styles/tailwind.css';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
