import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import SelectionPage from './pages/SelectionPage';
import StatsPage from './pages/StatsPage';
import CharacterSheetPage from './pages/CharacterSheetPage';
import { LanguageProvider } from './contexts/LanguageContext';

const App = () => {
  const [character, setCharacter] = useState(null);

  return (
    <LanguageProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage setCharacter={setCharacter} />} />
          <Route path="/selection" element={<SelectionPage setCharacter={setCharacter} />} />
          <Route path="/stats" element={<StatsPage character={character} setCharacter={setCharacter} />} />
          <Route path="/character-sheet" element={<CharacterSheetPage character={character} />} />
        </Routes>
      </AnimatePresence>
    </LanguageProvider>
  );
};

export default App;
