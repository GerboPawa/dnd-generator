import React from 'react';
import { useTranslation } from 'react-i18next';

// Funzione per generare un personaggio casuale completo
const generateRandomCharacter = () => {
  // Array di classi, razze, background e livelli disponibili
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
  
  // Seleziona casualmente classe, razza, background e livello
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const randomRace = races[Math.floor(Math.random() * races.length)];
  const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const randomLevel = Math.floor(Math.random() * 20) + 1; // Livello da 1 a 20
  
  // Seleziona casualmente sottoclasse e sottorazza se disponibili
  let randomSubclass = null;
  if (subclasses[randomClass] && randomLevel >= 3) { // Le sottoclassi sono disponibili dal livello 3
    randomSubclass = subclasses[randomClass][Math.floor(Math.random() * subclasses[randomClass].length)];
  }
  
  let randomSubrace = null;
  if (subraces[randomRace]) {
    randomSubrace = subraces[randomRace][Math.floor(Math.random() * subraces[randomRace].length)];
  }
  
  // Genera statistiche ottimizzate per la classe
  const stats = generateOptimizedStats(randomClass);
  
  // Genera un nome casuale
  const randomName = generateRandomName(randomRace);
  
  // Restituisci il personaggio completo
  return {
    name: randomName,
    class: randomClass,
    subclass: randomSubclass,
    race: randomRace,
    subrace: randomSubrace,
    background: randomBackground,
    level: randomLevel,
    stats: stats,
    isRandom: true
  };
};

// Funzione per generare statistiche ottimizzate per una classe specifica
const generateOptimizedStats = (characterClass) => {
  // Valori base per tutte le statistiche
  const baseStats = {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8
  };
  
  // Punti da distribuire (usando il sistema point buy standard di D&D)
  let pointsRemaining = 27;
  
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
  
  // Costo in punti per aumentare una statistica
  const getPointCost = (value) => {
    if (value <= 13) return value - 8;
    if (value === 14) return 7;
    if (value === 15) return 9;
    return 0;
  };
  
  // Distribuisci i punti in base alle priorità della classe
  const priorities = statPriorities[characterClass] || Object.keys(baseStats);
  
  // Assegna 15 alla statistica principale
  baseStats[priorities[0]] = 15;
  pointsRemaining -= getPointCost(15);
  
  // Assegna 14 alla seconda statistica più importante
  baseStats[priorities[1]] = 14;
  pointsRemaining -= getPointCost(14);
  
  // Assegna 13 alla terza statistica più importante
  baseStats[priorities[2]] = 13;
  pointsRemaining -= getPointCost(13);
  
  // Distribuisci i punti rimanenti alle altre statistiche
  let currentPriorityIndex = 3;
  while (pointsRemaining > 0 && currentPriorityIndex < priorities.length) {
    const currentStat = priorities[currentPriorityIndex];
    const currentValue = baseStats[currentStat];
    
    // Calcola quanto costerebbe aumentare questa statistica di 1
    const costToIncrease = getPointCost(currentValue + 1) - getPointCost(currentValue);
    
    // Se possiamo permetterci di aumentare questa statistica, fallo
    if (pointsRemaining >= costToIncrease && currentValue < 15) {
      baseStats[currentStat] += 1;
      pointsRemaining -= costToIncrease;
    } else {
      // Passa alla prossima statistica
      currentPriorityIndex++;
    }
  }
  
  // Aggiungi un po' di casualità alle statistiche (±1 per ogni statistica)
  Object.keys(baseStats).forEach(stat => {
    const randomAdjustment = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
    baseStats[stat] = Math.max(8, Math.min(15, baseStats[stat] + randomAdjustment));
  });
  
  return baseStats;
};

// Funzione per generare un nome casuale in base alla razza
const generateRandomName = (race) => {
  // Nomi per razza
  const names = {
    Dragonborn: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Nadarr', 'Patrin', 'Rhogar', 'Shamash', 'Tarhun', 'Torinn'],
    Dwarf: ['Adrik', 'Alberich', 'Baern', 'Barendd', 'Brottor', 'Bruenor', 'Dain', 'Darrak', 'Delg', 'Eberk', 'Einkil', 'Fargrim', 'Flint', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik', 'Oskar', 'Rangrim', 'Rurik', 'Taklinn', 'Thoradin', 'Thorin', 'Tordek', 'Traubon', 'Travok', 'Ulfgar', 'Veit', 'Vondal'],
    Elf: ['Adran', 'Aelar', 'Aramil', 'Arannis', 'Aust', 'Beiro', 'Berrian', 'Carric', 'Enialis', 'Erdan', 'Erevan', 'Galinndan', 'Hadarai', 'Heian', 'Himo', 'Immeral', 'Ivellios', 'Laucian', 'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Riardon', 'Rolen', 'Soveliss', 'Thamior', 'Tharivol', 'Theren', 'Varis'],
    Gnome: ['Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell', 'Dimble', 'Eldon', 'Erky', 'Fonkin', 'Frug', 'Gerbo', 'Gimble', 'Glim', 'Jebeddo', 'Kellen', 'Namfoodle', 'Orryn', 'Roondar', 'Seebo', 'Sindri', 'Warryn', 'Wrenn', 'Zook'],
    'Half-Elf': ['Adran', 'Aelar', 'Aramil', 'Arannis', 'Aust', 'Beiro', 'Berrian', 'Carric', 'Enialis', 'Erdan', 'Erevan', 'Galinndan', 'Hadarai', 'Heian', 'Himo', 'Immeral', 'Ivellios', 'Laucian', 'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Riardon', 'Rolen', 'Soveliss', 'Thamior', 'Tharivol', 'Theren', 'Varis'],
    'Half-Orc': ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront', 'Shump', 'Thokk'],
    Halfling: ['Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Errich', 'Finnan', 'Garret', 'Lindal', 'Lyle', 'Merric', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Roscoe', 'Wellby'],
    Human: ['Anlow', 'Arando', 'Bram', 'Cale', 'Dalkon', 'Daylen', 'Dodd', 'Dungarth', 'Dyrk', 'Eandro', 'Falken', 'Feck', 'Fenton', 'Gryphero', 'Hagar', 'Jeras', 'Krynt', 'Lavant', 'Leyten', 'Madian', 'Malfier', 'Markus', 'Meklan', 'Namen', 'Navaren', 'Nerle', 'Nilus', 'Ningyan', 'Norris', 'Quentin', 'Semil', 'Sevenson', 'Steveren', 'Talfen', 'Tamond', 'Taran', 'Tavon', 'Tegan', 'Vanan', 'Vincent'],
    Tiefling: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai']
  };
  
  // Seleziona un nome casuale dalla lista appropriata
  const raceNames = names[race] || names.Human; // Default a Human se la razza non è trovata
  return raceNames[Math.floor(Math.random() * raceNames.length)];
};

export { generateRandomCharacter, generateOptimizedStats };
