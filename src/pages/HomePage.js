import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { generateRandomCharacter } from '../utils/characterGenerator'; // Importa la funzione per generare un personaggio casuale

const HomePage = ({ setCharacter }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleRandomGeneration = () => {
    // Genera un personaggio casuale completo
    const randomCharacter = generateRandomCharacter();

    setCharacter(randomCharacter);
    navigate('/character-sheet'); // Reindirizza direttamente alla scheda personaggio
  };

  const handleCustomGeneration = () => {
    navigate('/selection');
  };

  return (
    <motion.div
      className="container flex flex-center flex-column"
      style={{ minHeight: '100vh' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="language-selector-container" style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <LanguageSelector />
      </div>

      <motion.div variants={itemVariants}>
        <h1 className="text-center mb-4">{t('home.title')}</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="card text-center" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="mb-3">{t('home.subtitle')}</h2>
        <p className="mb-4">{t('home.description')}</p>

        <div className="flex flex-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
          <motion.button
            className="primary"
            onClick={handleRandomGeneration}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('home.randomButton')}
          </motion.button>

          <motion.button
            onClick={handleCustomGeneration}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('home.customButton')}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-4 text-center"
        style={{ fontSize: 'var(--font-size-sm)' }}
      >
        <p>Astral Archives © {new Date().getFullYear()} | <a href="https://astralarchives.net" target="_blank" rel="noopener noreferrer">astralarchives.net</a></p>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
