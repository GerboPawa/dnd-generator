import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './styles/global.css';

// Importa i18next e le dipendenze
import i18n from './i18n/i18n'; // Importa l'istanza di i18next dal file di configurazione

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <App />
  </Router>
);
