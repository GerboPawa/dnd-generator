import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './styles/global.css';

// Importa i18next e le dipendenze
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from './i18next-browser-languagedetector/index.js';
import HttpApi from './i18next-http-backend/index.js';

// Inizializza i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    fallbackLng: 'en',
    detection: {
      order: ['htmlTag', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'querystring', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      useSuspense: false
    }
  });

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <App />
  </Router>
);
