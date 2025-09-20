import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Load theme immediately to prevent flash
const savedSettings = localStorage.getItem('settings');
if (savedSettings) {
  try {
    const settings = JSON.parse(savedSettings);
    if (settings.appearance && settings.appearance.theme) {
      document.documentElement.setAttribute('data-theme', settings.appearance.theme);
    }
    if (settings.appearance && settings.appearance.fontSize) {
      const sizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      document.documentElement.style.setProperty('--base-font-size', sizeMap[settings.appearance.fontSize]);
    }
  } catch (error) {
    console.error('Error loading saved settings:', error);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
