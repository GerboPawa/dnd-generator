import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa le traduzioni
import translationEN from './locales/en.json';
import translationIT from './locales/it.json';
import translationES from './locales/es.json';
import translationFR from './locales/fr.json';
import translationDE from './locales/de.json';

// Risorse di traduzione
const resources = {
  en: {
    translation: translationEN
  },
  it: {
    translation: translationIT
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  de: {
    translation: translationDE
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Lingua predefinita
    fallbackLng: 'en', // Lingua di fallback
    interpolation: {
      escapeValue: false // React già si occupa dell'escape
    }
  });

export default i18n;
