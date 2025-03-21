import React from 'react';
import { motion } from 'framer-motion';

// Funzione per simulare il lancio di un dado
const rollDie = (sides = 6) => {
  return Math.floor(Math.random() * sides) + 1;
};

// Funzione per simulare il lancio di 4d6 e scartare il valore più basso
const roll4d6DropLowest = () => {
  const rolls = [rollDie(), rollDie(), rollDie(), rollDie()];
  const sortedRolls = [...rolls].sort((a, b) => a - b);
  const sum = sortedRolls.slice(1).reduce((total, num) => total + num, 0);
  
  return {
    rolls,
    minIndex: rolls.indexOf(sortedRolls[0]),
    sum
  };
};

// Componente per l'animazione del dado
const DiceAnimation = ({ onComplete, diceCount = 4 }) => {
  const diceVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { 
      rotate: 360, 
      scale: [1, 1.2, 1],
      transition: { 
        duration: 0.8,
        repeat: 2,
        ease: "easeInOut" 
      }
    }
  };

  return (
    <motion.div 
      className="dice-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}
      onAnimationComplete={onComplete}
    >
      {Array.from({ length: diceCount }).map((_, index) => (
        <motion.div
          key={index}
          variants={diceVariants}
          initial="initial"
          animate="animate"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--primary-medium)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          🎲
        </motion.div>
      ))}
    </motion.div>
  );
};

// Componente per visualizzare i risultati dei dadi
const DiceResults = ({ results }) => {
  if (!results || !results.rolls) return null;
  
  return (
    <div className="dice-results" style={{ marginTop: '10px', textAlign: 'center' }}>
      {results.rolls.map((roll, idx) => {
        const isMinRoll = idx === results.minIndex;
        return (
          <span 
            key={idx} 
            style={{ 
              display: 'inline-block',
              width: '30px',
              height: '30px',
              margin: '0 5px',
              backgroundColor: isMinRoll ? 'rgba(255, 255, 255, 0.1)' : 'var(--primary-medium)',
              color: 'white',
              borderRadius: '5px',
              textAlign: 'center',
              lineHeight: '30px',
              textDecoration: isMinRoll ? 'line-through' : 'none',
              opacity: isMinRoll ? 0.5 : 1,
              fontWeight: 'bold'
            }}
          >
            {roll}
          </span>
        );
      })}
      <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
        Total: {results.sum}
      </div>
    </div>
  );
};

// Funzione per generare statistiche standard
const generateStandardArray = () => {
  return {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8
  };
};

// Funzione per ottimizzare le statistiche in base alla classe
const optimizeStatsForClass = (characterClass) => {
  // Valori base per tutte le statistiche
  const baseStats = {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
  };
  
  // Priorità delle statistiche per ogni classe
  const statPriorities = {
    Barbarian: ['strength', 'constitution', 'dexterity', 'wisdom', 'charisma', 'intelligence'],
    Bard: ['charisma', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'strength'],
    Cleric: ['wisdom', 'constitution', 'strength', 'charisma', 'dexterity', 'intelligence'],
    Druid: ['wisdom', 'constitution', 'dexterity', 'intelligence', 'charisma', 'strength'],
    Fighter: ['strength', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'charisma'],
    Monk: ['dexterity', 'wisdom', 'constitution', 'strength', 'intelligence', 'charisma'],
    Paladin: ['strength', 'charisma', 'constitution', 'wisdom', 'intelligence', 'dexterity'],
    Ranger: ['dexterity', 'wisdom', 'constitution', 'intelligence', 'strength', 'charisma'],
    Rogue: ['dexterity', 'intelligence', 'constitution', 'charisma', 'wisdom', 'strength'],
    Sorcerer: ['charisma', 'constitution', 'dexterity', 'intelligence', 'wisdom', 'strength'],
    Warlock: ['charisma', 'constitution', 'dexterity', 'wisdom', 'intelligence', 'strength'],
    Wizard: ['intelligence', 'constitution', 'dexterity', 'wisdom', 'charisma', 'strength']
  };
  
  // Valori standard da distribuire
  const standardValues = [15, 14, 13, 12, 10, 8];
  
  // Distribuisci i valori in base alle priorità della classe
  const priorities = statPriorities[characterClass] || Object.keys(baseStats);
  
  // Assegna i valori standard in base alle priorità
  priorities.forEach((stat, index) => {
    baseStats[stat] = standardValues[index];
  });
  
  return baseStats;
};

// Funzione per calcolare il costo in punti per il point buy
const getPointBuyCost = (value) => {
  if (value <= 13) return value - 8;
  if (value === 14) return 7;
  if (value === 15) return 9;
  return 0;
};

// Funzione per calcolare il modificatore di abilità
const getAbilityModifier = (score) => {
  return Math.floor((score - 10) / 2);
};

export {
  rollDie,
  roll4d6DropLowest,
  DiceAnimation,
  DiceResults,
  generateStandardArray,
  optimizeStatsForClass,
  getPointBuyCost,
  getAbilityModifier
};
