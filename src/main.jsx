import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage';
import './styles/main.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
);