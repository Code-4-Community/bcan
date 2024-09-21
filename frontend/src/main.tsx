import 'react-app-polyfill/ie11'; // For Internet Explorer 11 support
import 'react-app-polyfill/stable'; // For stable polyfills for older browsers
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './authContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);