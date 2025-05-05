
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Initialize theme from localStorage if available
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.className = savedTheme === 'light' ? 'theme-light' : '';
};

// Call this before rendering
initializeTheme();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);