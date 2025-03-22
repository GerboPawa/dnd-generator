import React, { useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import SelectionPage from './pages/SelectionPage';
import StatsPage from './pages/StatsPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { I18nextProvider } from 'react-i18next'; // Importa I18nextProvider
import i18n from './i18n/i18n'; // Importa l'istanza di i18next

const App = () => {
  const [character, setCharacter] = useState(null);

  return (
    <I18nextProvider i18n={i18n}> {/* Avvolgi l'applicazione con I18nextProvider */}
      <LanguageProvider>
        <Suspense fallback={<div>Loading translations...</div>}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage setCharacter={setCharacter} />} />
              <Route path="/selection" element={<SelectionPage setCharacter={setCharacter} />} />
              <Route path="/stats" element={<StatsPage character={character} setCharacter={setCharacter} />} />
              <Route path="/character-sheet" element={<CharacterSheetPage character={character} />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default App;
