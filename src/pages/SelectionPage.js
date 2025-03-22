import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SelectionPage = ({ setCharacter }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [characterData, setCharacterData] = useState({
    class: '',
    subclass: '',
    race: '',
    subrace: '',
    background: '',
    level: 1
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
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

  // Dati di esempio per le opzioni
  const classes = ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];

  const subclasses = {
    Barbarian: ['Path of the Berserker', 'Path of the Totem Warrior'],
    Bard: ['College of Lore', 'College of Valor'],
    Cleric: ['Knowledge Domain', 'Life Domain', 'Light Domain', 'Nature Domain', 'Tempest Domain', 'Trickery Domain', 'War Domain'],
    Druid: ['Circle of the Land', 'Circle of the Moon'],
    Fighter: ['Champion', 'Battle Master', 'Eldritch Knight'],
    Monk: ['Way of the Open Hand', 'Way of Shadow', 'Way of the Four Elements'],
    Paladin: ['Oath of Devotion', 'Oath of the Ancients', 'Oath of Vengeance'],
    Ranger: ['Hunter', 'Beast Master'],
    Rogue: ['Thief', 'Assassin', 'Arcane Trickster'],
    Sorcerer: ['Draconic Bloodline', 'Wild Magic'],
    Warlock: ['The Archfey', 'The Fiend', 'The Great Old One'],
    Wizard: ['School of Abjuration', 'School of Conjuration', 'School of Divination', 'School of Enchantment', 'School of Evocation', 'School of Illusion', 'School of Necromancy', 'School of Transmutation']
  };

  const races = ['Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling'];

  const subraces = {
    Dwarf: ['Hill Dwarf', 'Mountain Dwarf'],
    Elf: ['High Elf', 'Wood Elf', 'Dark Elf (Drow)'],
    Gnome: ['Forest Gnome', 'Rock Gnome'],
    Halfling: ['Lightfoot', 'Stout'],
    Human: ['Standard', 'Variant'],
    // Le altre razze non hanno sottorazze nel PHB base
  };

  const backgrounds = ['Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero', 'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage', 'Sailor', 'Soldier', 'Urchin'];

  const levels = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({
      ...prev,
      [name]: value,
      // Reset subclass/subrace when class/race changes
      ...(name === 'class' && { subclass: '' }),
      ...(name === 'race' && { subrace: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCharacter(characterData);
    navigate('/stats');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <motion.div
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1 className="text-center mb-4" variants={itemVariants}>
        {t('selection.title')}
      </motion.h1>

      <motion.div className="card" variants={itemVariants}>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            {/* Class Selection */}
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="class">{t('selection.class')}</label>
              <select
                id="class"
                name="class"
                value={characterData.class}
                onChange={handleChange}
                required
              >
                <option value="">{t('selection.selectClass')}</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </motion.div>

            {/* Subclass Selection (conditional) */}
            {characterData.class && subclasses[characterData.class] && (
              <motion.div
                className="form-group"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="subclass">{t('selection.subclass')}</label>
                <select
                  id="subclass"
                  name="subclass"
                  value={characterData.subclass}
                  onChange={handleChange}
                >
                  <option value="">{t('selection.selectSubclass')}</option>
                  {subclasses[characterData.class].map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Race Selection */}
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="race">{t('selection.race')}</label>
              <select
                id="race"
                name="race"
                value={characterData.race}
                onChange={handleChange}
                required
              >
                <option value="">{t('selection.selectRace')}</option>
                {races.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </motion.div>

            {/* Subrace Selection (conditional) */}
            {characterData.race && subraces[characterData.race] && (
              <motion.div
                className="form-group"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="subrace">{t('selection.subrace')}</label>
                <select
                  id="subrace"
                  name="subrace"
                  value={characterData.subrace}
                  onChange={handleChange}
                >
                  <option value="">{t('selection.selectSubrace')}</option>
                  {subraces[characterData.race].map(sr => (
                    <option key={sr} value={sr}>{sr}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Background Selection */}
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="background">{t('selection.background')}</label>
              <select
                id="background"
                name="background"
                value={characterData.background}
                onChange={handleChange}
                required
              >
                <option value="">{t('selection.selectBackground')}</option>
                {backgrounds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </motion.div>

            {/* Level Selection */}
            <motion.div className="form-group" variants={itemVariants}>
              <label htmlFor="level">{t('selection.level')}</label>
              <select
                id="level"
                name="level"
                value={characterData.level}
                onChange={handleChange}
                required
              >
                {levels.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </motion.div>
          </div>

          <motion.div className="flex flex-between mt-4" variants={itemVariants}>
            <motion.button
              type="button"
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('common.back')}
            </motion.button>

            <motion.button
              type="submit"
              className="primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!characterData.class || !characterData.race || !characterData.background}
            >
              {t('common.next')}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SelectionPage;
