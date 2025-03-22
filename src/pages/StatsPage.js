import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StatsPage = ({ character, setCharacter }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!character) {
      navigate('/');
      return;
    }
  }, [character, navigate]);
  
  const [statMethod, setStatMethod] = useState('standard');
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  const [pointsRemaining, setPointsRemaining] = useState(27);
  const [rolling, setRolling] = useState(false);
  const [diceResults, setDiceResults] = useState([]);
  const [diceAnimation, setDiceAnimation] = useState(false);

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

  const diceVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: {
      rotate: 360,
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: 2,
        ease: "easeInOut"
      }
    }
  };

  // Funzione per determinare gli attributi ottimali in base alla classe
  useEffect(() => {
    if (character && character.class && statMethod === 'optimized') {
      let optimizedStats = { ...stats };
      
      // Configurazione degli attributi ottimali per classe
      switch(character.class) {
        case 'Barbarian':
          optimizedStats = { strength: 15, dexterity: 14, constitution: 15, intelligence: 8, wisdom: 10, charisma: 8 };
          break;
        case 'Bard':
          optimizedStats = { strength: 8, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 10, charisma: 15 };
          break;
        case 'Cleric':
          optimizedStats = { strength: 10, dexterity: 10, constitution: 14, intelligence: 8, wisdom: 15, charisma: 12 };
          break;
        case 'Druid':
          optimizedStats = { strength: 8, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 15, charisma: 10 };
          break;
        case 'Fighter':
          optimizedStats = { strength: 15, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 10, charisma: 8 };
          break;
        case 'Monk':
          optimizedStats = { strength: 8, dexterity: 15, constitution: 14, intelligence: 8, wisdom: 15, charisma: 8 };
          break;
        case 'Paladin':
          optimizedStats = { strength: 15, dexterity: 8, constitution: 14, intelligence: 8, wisdom: 10, charisma: 15 };
          break;
        case 'Ranger':
          optimizedStats = { strength: 10, dexterity: 15, constitution: 14, intelligence: 8, wisdom: 15, charisma: 8 };
          break;
        case 'Rogue':
          optimizedStats = { strength: 8, dexterity: 15, constitution: 14, intelligence: 12, wisdom: 10, charisma: 12 };
          break;
        case 'Sorcerer':
          optimizedStats = { strength: 8, dexterity: 14, constitution: 14, intelligence: 8, wisdom: 10, charisma: 15 };
          break;
        case 'Warlock':
          optimizedStats = { strength: 8, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 8, charisma: 15 };
          break;
        case 'Wizard':
          optimizedStats = { strength: 8, dexterity: 14, constitution: 14, intelligence: 15, wisdom: 10, charisma: 8 };
          break;
        default:
          break;
      }
      
      setStats(optimizedStats);
    } else if (statMethod === 'standard') {
      // Standard array
      setStats({
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
      });
    }
  }, [character, statMethod]);

  // Funzione per simulare il lancio di 4d6 e scartare il valore più basso
  const rollStat = () => {
    setDiceAnimation(true);
    
    // Simula il lancio di 4d6
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    
    // Trova l'indice del valore più basso
    const minIndex = rolls.indexOf(Math.min(...rolls));
    
    // Crea una copia per l'animazione
    const rollsForAnimation = [...rolls];
    
    // Rimuove il valore più basso per il calcolo
    const validRolls = [...rolls];
    validRolls.splice(minIndex, 1);
    
    // Calcola la somma dei 3 dadi rimanenti
    const sum = validRolls.reduce((acc, val) => acc + val, 0);
    
    return { rolls: rollsForAnimation, sum, minIndex };
  };

  // Funzione per gestire il lancio di tutti i dadi per le statistiche
  const handleRollAllStats = () => {
    if (rolling) return;
    
    setRolling(true);
    setDiceAnimation(true);
    
    const allResults = [];
    const newStats = { ...stats };
    
    // Simula il lancio per ogni statistica
    const statKeys = Object.keys(stats);
    
    // Funzione per lanciare un dado alla volta con un ritardo
    const rollWithDelay = (index) => {
      if (index >= statKeys.length) {
        setTimeout(() => {
          setRolling(false);
          setDiceAnimation(false);
        }, 500);
        return;
      }
      
      const statKey = statKeys[index];
      const result = rollStat();
      allResults.push({ stat: statKey, ...result });
      
      newStats[statKey] = result.sum;
      
      setDiceResults([...allResults]);
      setStats({ ...newStats });
      
      setTimeout(() => rollWithDelay(index + 1), 800);
    };
    
    rollWithDelay(0);
  };

  // Funzione per gestire il cambio di valore in point buy
  const handlePointBuyChange = (stat, value) => {
    if (statMethod !== 'pointbuy') return;
    
    const oldValue = stats[stat];
    const newValue = parseInt(value);
    
    // Calcola il costo in punti
    const getPointCost = (val) => {
      if (val <= 13) return val - 8;
      if (val === 14) return 7;
      if (val === 15) return 9;
      return 0;
    };
    
    const oldCost = getPointCost(oldValue);
    const newCost = getPointCost(newValue);
    const pointDifference = newCost - oldCost;
    
    // Verifica se ci sono abbastanza punti
    if (pointsRemaining - pointDifference < 0) return;
    
    // Aggiorna i punti e le statistiche
    setPointsRemaining(pointsRemaining - pointDifference);
    setStats({
      ...stats,
      [stat]: newValue
    });
  };

  const handleSubmit = () => {
    // Aggiorna il personaggio con le statistiche
    setCharacter({
      ...character,
      stats: stats
    });
    
    navigate('/character-sheet');
  };

  const handleBack = () => {
    navigate('/selection');
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
        {t('stats.title')}
      </motion.h1>
      
      <motion.div className="card" variants={itemVariants}>
        <h2 className="mb-3">{t('stats.selectMethod')}</h2>
        
        <div className="flex mb-4" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <motion.button 
            className={statMethod === 'standard' ? 'primary' : ''}
            onClick={() => setStatMethod('standard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('stats.standardArray')}
          </motion.button>
          
          <motion.button 
            className={statMethod === 'roll' ? 'primary' : ''}
            onClick={() => setStatMethod('roll')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('stats.rollDice')}
          </motion.button>
          
          <motion.button 
            className={statMethod === 'pointbuy' ? 'primary' : ''}
            onClick={() => setStatMethod('pointbuy')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('stats.pointBuy')}
          </motion.button>
          
          <motion.button 
            className={statMethod === 'optimized' ? 'primary' : ''}
            onClick={() => setStatMethod('optimized')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('stats.optimized')}
          </motion.button>
        </div>
        
        {statMethod === 'roll' && (
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button 
              onClick={handleRollAllStats}
              disabled={rolling}
              className="primary mb-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {rolling ? t('stats.rolling') : t('stats.rollAll')}
            </motion.button>
            
            {diceAnimation && (
              <div className="dice-container" style={{ marginBottom: '20px' }}>
                <motion.div 
                  className="dice-animation"
                  variants={diceVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '2rem'
                  }}
                >
                  {[1, 2, 3, 4].map((die, index) => (
                    <span key={index} role="img" aria-label="dice">🎲</span>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
        
        {statMethod === 'pointbuy' && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mb-2">{t('stats.pointsRemaining')}: <strong>{pointsRemaining}</strong></p>
            <p className="mb-3">{t('stats.pointBuyRange')}</p>
          </motion.div>
        )}
        
        <div className="grid">
          {Object.entries(stats).map(([stat, value]) => (
            <motion.div 
              key={stat} 
              className="stat-item"
              variants={itemVariants}
              style={{
                padding: '15px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
              }}
            >
              <h3 style={{ marginBottom: '10px' }}>{t(`stats.${stat}`)}</h3>
              
              {statMethod === 'pointbuy' ? (
                <select 
                  value={value}
                  onChange={(e) => handlePointBuyChange(stat, e.target.value)}
                  style={{ width: '80px', margin: '0 auto', display: 'block' }}
                >
                  {[8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              ) : (
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {value}
                </div>
              )}
              
              <div className="stat-modifier" style={{ marginTop: '5px' }}>
                {t('stats.modifier')}: {Math.floor((value - 10) / 2)}
              </div>
              
              {statMethod === 'roll' && diceResults.find(r => r.stat === stat) && (
                <div className="dice-results" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                  {diceResults.find(r => r.stat === stat).rolls.map((roll, idx) => {
                    const isMinRoll = idx === diceResults.find(r => r.stat === stat).minIndex;
                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          margin: '0 3px',
                          textDecoration: isMinRoll ? 'line-through' : 'none',
                          opacity: isMinRoll ? 0.5 : 1
                        }}
                      >
                        {roll}
                      </span>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div className="flex flex-between mt-4" variants={itemVariants}>
          <motion.button 
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('common.back')}
          </motion.button>
          
          <motion.button 
            onClick={handleSubmit}
            className="primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('common.next')}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPage;
