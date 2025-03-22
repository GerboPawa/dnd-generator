import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CharacterSheetPage = ({ character }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const characterSheetRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Se non c'è un personaggio, reindirizza alla home
  if (!character) {
    navigate('/');
    return null;
  }

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

  // Calcola il modificatore di abilità
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  // Calcola il bonus di competenza in base al livello
  const getProficiencyBonus = (level) => {
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6;
  };

  // Determina se il personaggio è competente in un tiro salvezza
  const isSavingThrowProficient = (ability) => {
    const savingThrowProficiencies = {
      Barbarian: ['strength', 'constitution'],
      Bard: ['dexterity', 'charisma'],
      Cleric: ['wisdom', 'charisma'],
      Druid: ['intelligence', 'wisdom'],
      Fighter: ['strength', 'constitution'],
      Monk: ['strength', 'dexterity'],
      Paladin: ['wisdom', 'charisma'],
      Ranger: ['strength', 'dexterity'],
      Rogue: ['dexterity', 'intelligence'],
      Sorcerer: ['constitution', 'charisma'],
      Warlock: ['wisdom', 'charisma'],
      Wizard: ['intelligence', 'wisdom']
    };

    return character.class && savingThrowProficiencies[character.class].includes(ability);
  };

  // Ottieni le abilità in cui il personaggio è competente in base a classe e background
  const getSkillProficiencies = () => {
    const skillProficiencies = [];

    // Aggiungi competenze in base alla classe
    const classProficiencies = {
      Barbarian: ['athletics', 'intimidation', 'nature', 'perception', 'survival'],
      Bard: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'],
      Cleric: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
      Druid: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
      Fighter: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
      Monk: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
      Paladin: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
      Ranger: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
      Rogue: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'],
      Sorcerer: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
      Warlock: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
      Wizard: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion']
    };

    // Aggiungi competenze in base al background
    const backgroundProficiencies = {
      Acolyte: ['insight', 'religion'],
      Charlatan: ['deception', 'sleightOfHand'],
      Criminal: ['deception', 'stealth'],
      Entertainer: ['acrobatics', 'performance'],
      'Folk Hero': ['animalHandling', 'survival'],
      'Guild Artisan': ['insight', 'persuasion'],
      Hermit: ['medicine', 'religion'],
      Noble: ['history', 'persuasion'],
      Outlander: ['athletics', 'survival'],
      Sage: ['arcana', 'history'],
      Sailor: ['athletics', 'perception'],
      Soldier: ['athletics', 'intimidation'],
      Urchin: ['sleightOfHand', 'stealth']
    };

    // Seleziona casualmente 2 competenze dalla classe
    if (character.class && classProficiencies[character.class]) {
      const availableClassSkills = [...classProficiencies[character.class]];
      for (let i = 0; i < 2 && availableClassSkills.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableClassSkills.length);
        skillProficiencies.push(availableClassSkills[randomIndex]);
        availableClassSkills.splice(randomIndex, 1);
      }
    }

    // Aggiungi competenze dal background
    if (character.background && backgroundProficiencies[character.background]) {
      backgroundProficiencies[character.background].forEach(skill => {
        if (!skillProficiencies.includes(skill)) {
          skillProficiencies.push(skill);
        }
      });
    }

    return skillProficiencies;
  };

  // Ottieni gli incantesimi disponibili per la classe e il livello
  const getSpells = () => {
    // Classi che usano incantesimi
    const spellcasterClasses = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];

    if (!character.class || !spellcasterClasses.includes(character.class)) {
      return null;
    }

    // Esempio di incantesimi per classe e livello
    const spellsByClass = {
      Bard: {
        cantrips: ['Dancing Lights', 'Light', 'Mage Hand', 'Mending', 'Vicious Mockery'],
        level1: ['Charm Person', 'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Healing Word', 'Sleep'],
        level2: ['Hold Person', 'Invisibility', 'Suggestion'],
        level3: ['Dispel Magic', 'Hypnotic Pattern'],
        level4: ['Dimension Door', 'Polymorph'],
        level5: ['Animate Objects', 'Mass Cure Wounds'],
        level6: ['Otto\'s Irresistible Dance', 'Suggestion (Mass)'],
        level7: ['Mirage Arcane', 'Project Image'],
        level8: ['Dominate Monster', 'Power Word Stun'],
        level9: ['Foresight', 'Mass Heal']
      },
      Cleric: {
        cantrips: ['Guidance', 'Light', 'Sacred Flame', 'Spare the Dying', 'Thaumaturgy'],
        level1: ['Bless', 'Cure Wounds', 'Guiding Bolt', 'Healing Word', 'Shield of Faith'],
        level2: ['Hold Person', 'Lesser Restoration', 'Spiritual Weapon'],
        level3: ['Mass Healing Word', 'Revivify', 'Spirit Guardians'],
        level4: ['Banishment', 'Guardian of Faith'],
        level5: ['Mass Cure Wounds', 'Raise Dead'],
        level6: ['Heal', 'Harm'],
        level7: ['Divine Word', 'Regenerate'],
        level8: ['Holy Aura', 'Control Weather'],
        level9: ['Mass Heal', 'True Resurrection']
      },
      Druid: {
        cantrips: ['Druidcraft', 'Guidance', 'Produce Flame', 'Resistance', 'Shillelagh'],
        level1: ['Animal Friendship', 'Cure Wounds', 'Entangle', 'Faerie Fire', 'Healing Word'],
        level2: ['Barkskin', 'Flaming Sphere', 'Moonbeam'],
        level3: ['Call Lightning', 'Conjure Animals', 'Plant Growth'],
        level4: ['Conjure Woodland Beings', 'Hallucinatory Terrain'],
        level5: ['Awaken', 'Wall of Stone'],
        level6: ['Heal', 'Sunbeam'],
        level7: ['Mirage Arcane', 'Reverse Gravity'],
        level8: ['Animal Shapes', 'Control Weather'],
        level9: ['Shapechange', 'Foresight']
      },
      Paladin: {
        level1: ['Bless', 'Cure Wounds', 'Divine Favor', 'Shield of Faith'],
        level2: ['Aid', 'Find Steed', 'Lesser Restoration', 'Zone of Truth'],
        level3: ['Aura of Vitality', 'Revivify'],
        level4: ['Aura of Life', 'Banishment'],
        level5: ['Banishing Smite', 'Raise Dead']
      },
      Ranger: {
        level1: ['Animal Friendship', 'Cure Wounds', 'Hunter\'s Mark'],
        level2: ['Barkskin', 'Lesser Restoration', 'Pass without Trace'],
        level3: ['Conjure Animals', 'Lightning Arrow'],
        level4: ['Conjure Woodland Beings', 'Freedom of Movement'],
        level5: ['Conjure Volley', 'Swift Quiver']
      },
      Sorcerer: {
        cantrips: ['Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Prestidigitation'],
        level1: ['Burning Hands', 'Charm Person', 'Magic Missile', 'Shield', 'Sleep'],
        level2: ['Invisibility', 'Scorching Ray', 'Suggestion'],
        level3: ['Fireball', 'Fly', 'Haste'],
        level4: ['Dimension Door', 'Polymorph'],
        level5: ['Animate Objects', 'Wall of Force'],
        level6: ['Chain Lightning', 'Disintegrate'],
        level7: ['Delayed Blast Fireball', 'Teleport'],
        level8: ['Dominate Monster', 'Power Word Stun'],
        level9: ['Meteor Swarm', 'Time Stop']
      },
      Warlock: {
        cantrips: ['Eldritch Blast', 'Mage Hand', 'Minor Illusion', 'Prestidigitation', 'True Strike'],
        level1: ['Charm Person', 'Hex', 'Protection from Evil and Good', 'Witch Bolt'],
        level2: ['Hold Person', 'Invisibility', 'Mirror Image'],
        level3: ['Dispel Magic', 'Fear', 'Vampiric Touch'],
        level4: ['Banishment', 'Dimension Door'],
        level5: ['Contact Other Plane', 'Dream'],
        level6: ['Circle of Death', 'Create Undead'],
        level7: ['Plane Shift', 'Teleport'],
        level8: ['Dominate Monster', 'Power Word Stun'],
        level9: ['Astral Projection', 'Foresight']
      },
      Wizard: {
        cantrips: ['Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Prestidigitation'],
        level1: ['Burning Hands', 'Charm Person', 'Feather Fall', 'Mage Armor', 'Magic Missile', 'Shield', 'Sleep'],
        level2: ['Invisibility', 'Mirror Image', 'Misty Step', 'Scorching Ray', 'Web'],
        level3: ['Counterspell', 'Fireball', 'Fly', 'Haste', 'Lightning Bolt'],
        level4: ['Dimension Door', 'Polymorph', 'Wall of Fire'],
        level5: ['Animate Objects', 'Wall of Force', 'Telekinesis'],
        level6: ['Chain Lightning', 'Disintegrate', 'Globe of Invulnerability'],
        level7: ['Delayed Blast Fireball', 'Teleport', 'Simulacrum'],
        level8: ['Dominate Monster', 'Power Word Stun', 'Maze'],
        level9: ['Meteor Swarm', 'Time Stop', 'Wish']
      }
    };

    const spells = {
      cantrips: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
      level6: [],
      level7: [],
      level8: [],
      level9: []
    };

    // Seleziona incantesimi in base al livello
    const classSpells = spellsByClass[character.class];

    if (!classSpells) {
      return spells; // Ritorna un oggetto vuoto se la classe non ha incantesimi
    }

    // Cantrips (non dipendono dal livello)
    if (classSpells.cantrips) {
      // Numero di cantrips per classe
      const cantripCount = {
        Bard: 2,
        Cleric: 3,
        Druid: 2,
        Sorcerer: 4,
        Warlock: 2,
        Wizard: 3
      }[character.class] || 0;

      // Seleziona casualmente i cantrips
      const availableCantrips = [...classSpells.cantrips];
      for (let i = 0; i < cantripCount && availableCantrips.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableCantrips.length);
        spells.cantrips.push(availableCantrips[randomIndex]);
        availableCantrips.splice(randomIndex, 1);
      }
    }

    // Funzione per selezionare gli incantesimi di un dato livello
    const selectSpellsForLevel = (level, levelCount) => {
      if (character.level >= level && classSpells[`level${level}`]) {
        const availableSpells = [...classSpells[`level${level}`]];
        if (levelCount === 'all') {
          spells[`level${level}`] = availableSpells;
        } else {
          for (let i = 0; i < levelCount && availableSpells.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSpells.length);
            spells[`level${level}`].push(availableSpells[randomIndex]);
            availableSpells.splice(randomIndex, 1);
          }
        }
      }
    };

    // Definisci il numero di incantesimi per livello per ogni classe
    const spellCountsByLevel = {
      Bard: { 1: 4, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 },
      Cleric: { 1: 'all', 2: 'all', 3: 'all', 4: 'all', 5: 'all', 6: 'all', 7: 'all', 8: 'all', 9: 'all' },
      Druid: { 1: 'all', 2: 'all', 3: 'all', 4: 'all', 5: 'all', 6: 'all', 7: 'all', 8: 'all', 9: 'all' },
      Paladin: { 1: 0, 2: 2, 3: 2, 4: 1, 5: 1 },
      Ranger: { 1: 0, 2: 2, 3: 2, 4: 1, 5: 1 },
      Sorcerer: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 },
      Warlock: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 },
      Wizard: { 1: 6, 2: 4, 3: 4, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
    };

    const classSpellCounts = spellCountsByLevel[character.class] || {};

    // Seleziona gli incantesimi per ogni livello
    for (let level = 1; level <= 9; level++) {
      const levelCount = classSpellCounts[level] || 0;
      selectSpellsForLevel(level, levelCount);
    }

    return spells;
  };

  // Ottieni le caratteristiche della classe
  const getClassFeatures = () => {
    const features = [];

    if (!character.class) return features;

    // Caratteristiche per classe e livello
    const classFeatures = {
      Barbarian: {
        1: ['Rage', 'Unarmored Defense'],
        2: ['Reckless Attack', 'Danger Sense'],
        3: ['Primal Path'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack', 'Fast Movement'],
        6: ['Path Feature'],
        7: ['Feral Instincts'],
        8: ['Ability Score Improvement'],
        9: ['Brutal Critical (1 die)'],
        10: ['Path Feature'],
        11: ['Relentless Rage'],
        12: ['Ability Score Improvement'],
        13: ['Brutal Critical (2 dice)'],
        14: ['Path Feature'],
        15: ['Persistent Rage'],
        16: ['Ability Score Improvement'],
        17: ['Brutal Critical (3 dice)'],
        18: ['Indomitable Might'],
        19: ['Ability Score Improvement'],
        20: ['Primal Champion']
      },
      Bard: {
        1: ['Bardic Inspiration', 'Spellcasting'],
        2: ['Jack of All Trades', 'Song of Rest'],
        3: ['Bard College', 'Expertise'],
        4: ['Ability Score Improvement'],
        5: ['Bardic Inspiration (d8)', 'Font of Inspiration'],
        6: ['Countercharm', 'College Feature'],
        7: ['None'],
        8: ['Ability Score Improvement'],
        9: ['Song of Rest (d10)'],
        10: ['Bardic Inspiration (d10)', 'Expertise', 'Magical Secrets'],
        11: ['None'],
        12: ['Ability Score Improvement'],
        13: ['Song of Rest (d12)'],
        14: ['Magical Secrets', 'College Feature'],
        15: ['Bardic Inspiration (d12)'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Magical Secrets'],
        19: ['Ability Score Improvement'],
        20: ['Superior Inspiration']
      },
      Cleric: {
        1: ['Spellcasting', 'Divine Domain'],
        2: ['Channel Divinity', 'Divine Domain Feature'],
        3: ['Divine Domain Feature'],
        4: ['Ability Score Improvement'],
        5: ['Destroy Undead (CR 1/2)'],
        6: ['Channel Divinity (3/rest)', 'Divine Domain Feature'],
        7: ['None'],
        8: ['Ability Score Improvement', 'Destroy Undead (CR 1)'],
        9: ['None'],
        10: ['Divine Intervention'],
        11: ['Destroy Undead (CR 2)'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Destroy Undead (CR 3)', 'Divine Domain Feature'],
        15: ['None'],
        16: ['Ability Score Improvement'],
        17: ['Destroy Undead (CR 4)', 'Divine Domain Feature'],
        18: ['Channel Divinity (1/short or long rest)'],
        19: ['Ability Score Improvement'],
        20: ['Divine Intervention Improvement']
      },
      Druid: {
        1: ['Druidic', 'Spellcasting'],
        2: ['Wild Shape', 'Druid Circle'],
        3: ['Druid Circle Feature'],
        4: ['Ability Score Improvement'],
        5: ['Wild Shape Improvement'],
        6: ['Druid Circle Feature'],
        7: ['None'],
        8: ['Ability Score Improvement'],
        9: ['None'],
        10: ['Druid Circle Feature'],
        11: ['None'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Druid Circle Feature'],
        15: ['None'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Timeless Body', 'Beast Spells'],
        19: ['Ability Score Improvement'],
        20: ['Archdruid']
      },
      Fighter: {
        1: ['Fighting Style', 'Second Wind'],
        2: ['Action Surge'],
        3: ['Martial Archetype'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack'],
        6: ['Ability Score Improvement'],
        7: ['Archetype Feature'],
        8: ['Ability Score Improvement'],
        9: ['Indomitable'],
        10: ['Archetype Feature'],
        11: ['Extra Attack (2)'],
        12: ['Ability Score Improvement'],
        13: ['Indomitable (2)'],
        14: ['Ability Score Improvement'],
        15: ['Archetype Feature'],
        16: ['Ability Score Improvement'],
        17: ['Action Surge (2)', 'Indomitable (3)'],
        18: ['Archetype Feature'],
        19: ['Ability Score Improvement'],
        20: ['Extra Attack (3)']
      },
      Monk: {
        1: ['Unarmored Defense', 'Martial Arts'],
        2: ['Ki', 'Unarmored Movement'],
        3: ['Monastic Tradition', 'Deflect Missiles'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack', 'Stunning Strike'],
        6: ['Ki-Empowered Strikes', 'Tradition Feature'],
        7: ['Evasion', 'Stillness of Mind'],
        8: ['Ability Score Improvement'],
        9: ['Unarmored Movement Improvement'],
        10: ['Purity of Body'],
        11: ['Tradition Feature'],
        12: ['Ability Score Improvement'],
        13: ['Tongue of the Sun and Moon'],
        14: ['Diamond Soul'],
        15: ['Timeless Body'],
        16: ['Ability Score Improvement'],
        17: ['Tradition Feature'],
        18: ['Empty Body'],
        19: ['Ability Score Improvement'],
        20: ['Perfect Self']
      },
      Paladin: {
        1: ['Divine Sense', 'Lay on Hands'],
        2: ['Fighting Style', 'Spellcasting', 'Divine Smite'],
        3: ['Sacred Oath', 'Divine Health'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack'],
        6: ['Aura of Protection'],
        7: ['Oath Feature'],
        8: ['Ability Score Improvement'],
        9: ['None'],
        10: ['Aura of Courage'],
        11: ['Improved Divine Smite'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Cleansing Touch'],
        15: ['Oath Feature'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Aura Improvements'],
        19: ['Ability Score Improvement'],
        20: ['Oath Feature']
      },
      Ranger: {
        1: ['Favored Enemy', 'Natural Explorer'],
        2: ['Fighting Style', 'Spellcasting'],
        3: ['Ranger Archetype', 'Primeval Awareness'],
        4: ['Ability Score Improvement'],
        5: ['Extra Attack'],
        6: ['Favored Enemy and Natural Explorer Improvements'],
        7: ['Archetype Feature'],
        8: ['Ability Score Improvement', 'Land\'s Stride'],
        9: ['None'],
        10: ['Hide in Plain Sight'],
        11: ['Archetype Feature'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Vanish'],
        15: ['Archetype Feature'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Feral Senses'],
        19: ['Ability Score Improvement'],
        20: ['Foe Slayer']
      },
      Rogue: {
        1: ['Expertise', 'Sneak Attack', 'Thieves Cant'],
        2: ['Cunning Action'],
        3: ['Roguish Archetype'],
        4: ['Ability Score Improvement'],
        5: ['Uncanny Dodge'],
        6: ['Expertise'],
        7: ['Evasion'],
        8: ['Ability Score Improvement'],
        9: ['Archetype Feature'],
        10: ['Ability Score Improvement'],
        11: ['Reliable Talent'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Blindsense'],
        15: ['Slippery Mind'],
        16: ['Ability Score Improvement'],
        17: ['Archetype Feature'],
        18: ['Elusive'],
        19: ['Ability Score Improvement'],
        20: ['Stroke of Luck']
      },
      Sorcerer: {
        1: ['Spellcasting', 'Sorcerous Origin'],
        2: ['Font of Magic'],
        3: ['Metamagic'],
        4: ['Ability Score Improvement'],
        5: ['None'],
        6: ['Origin Feature'],
        7: ['None'],
        8: ['Ability Score Improvement'],
        9: ['None'],
        10: ['Metamagic'],
        11: ['None'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Origin Feature'],
        15: ['None'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Metamagic'],
        19: ['Ability Score Improvement'],
        20: ['Sorcerous Restoration']
      },
      Warlock: {
        1: ['Otherworldly Patron', 'Pact Magic'],
        2: ['Eldritch Invocations'],
        3: ['Pact Boon'],
        4: ['Ability Score Improvement'],
        5: ['None'],
        6: ['Patron Feature'],
        7: ['None'],
        8: ['Ability Score Improvement'],
        9: ['None'],
        10: ['Patron Feature'],
        11: ['Mystic Arcanum (6th level)'],
        12: ['Ability Score Improvement'],
        13: ['Mystic Arcanum (7th level)'],
        14: ['Patron Feature'],
        15: ['None'],
        16: ['Ability Score Improvement'],
        17: ['Mystic Arcanum (8th level)'],
        18: ['None'],
        19: ['Ability Score Improvement'],
        20: ['Mystic Arcanum (9th level)']
      },
      Wizard: {
        1: ['Spellcasting', 'Arcane Recovery'],
        2: ['Arcane Tradition'],
        3: ['Arcane Tradition Feature'],
        4: ['Ability Score Improvement'],
        5: ['None'],
        6: ['Arcane Tradition Feature'],
        7: ['None'],
        8: ['Ability Score Improvement'],
        9: ['None'],
        10: ['Arcane Tradition Feature'],
        11: ['None'],
        12: ['Ability Score Improvement'],
        13: ['None'],
        14: ['Arcane Tradition Feature'],
        15: ['None'],
        16: ['Ability Score Improvement'],
        17: ['None'],
        18: ['Spell Mastery'],
        19: ['Ability Score Improvement'],
        20: ['Signature Spell']
      }
    };

    // Aggiungi caratteristiche in base al livello
    for (let level = 1; level <= character.level; level++) {
      if (classFeatures[character.class] && classFeatures[character.class][level]) {
        features.push(...classFeatures[character.class][level]);
      }
    }

    // Aggiungi caratteristiche della sottoclasse se presente
    if (character.subclass) {
      const subclassFeatures = {
        'Path of the Berserker': ['Frenzy'],
        'Path of the Totem Warrior': ['Spirit Seeker', 'Totem Spirit'],
        'College of Lore': ['Bonus Proficiencies', 'Cutting Words'],
        'College of Valor': ['Bonus Proficiencies', 'Combat Inspiration'],
        'Knowledge Domain': ['Blessings of Knowledge'],
        'Life Domain': ['Disciple of Life'],
        'Light Domain': ['Warding Flare'],
        'Nature Domain': ['Acolyte of Nature'],
        'Tempest Domain': ['Wrath of the Storm', 'Thunderbolt Strike'],
        'Trickery Domain': ['Blessing of the Trickster'],
        'War Domain': ['War Priest', 'Divine Strike'],
        'Circle of the Land': ['Bonus Cantrip', 'Natural Recovery', 'Circle Spells'],
        'Circle of the Moon': ['Combat Wild Shape', 'Circle Forms'],
        'Champion': ['Improved Critical'],
        'Battle Master': ['Combat Superiority', 'Student of War'],
        'Eldritch Knight': ['Spellcasting', 'Weapon Bond'],
        'Way of the Open Hand': ['Open Hand Technique'],
        'Way of Shadow': ['Shadow Arts'],
        'Way of the Four Elements': ['Disciple of the Elements'],
        'Oath of Devotion': ['Sacred Weapon', 'Divine Health'],
        'Oath of the Ancients': ['Nature\'s Wrath', 'Turn the Faithless'],
        'Oath of Vengeance': ['Abjure Enemy', 'Vow of Enmity'],
        'Hunter': ['Hunter\'s Prey'],
        'Beast Master': ['Ranger\'s Companion'],
        'Thief': ['Fast Hands', 'Second-Story Work'],
        'Assassin': ['Assassinate'],
        'Arcane Trickster': ['Spellcasting', 'Mage Hand Legerdemain'],
        'Draconic Bloodline': ['Dragon Ancestor', 'Draconic Resilience'],
        'Wild Magic': ['Wild Magic Surge', 'Tides of Chaos'],
        'The Archfey': ['Fey Presence'],
        'The Fiend': ['Dark One\'s Blessing'],
        'The Great Old One': ['Awakened Mind'],
        'School of Abjuration': ['Abjuration Savant', 'Arcane Ward'],
        'School of Conjuration': ['Conjuration Savant', 'Minor Conjuration'],
        'School of Divination': ['Divination Savant', 'Portent'],
        'School of Enchantment': ['Enchantment Savant', 'Hypnotic Gaze'],
        'School of Evocation': ['Evocation Savant', 'Sculpt Spells'],
        'School of Illusion': ['Illusion Savant', 'Improved Minor Illusion'],
        'School of Necromancy': ['Necromancy Savant', 'Grim Harvest'],
        'School of Transmutation': ['Transmutation Savant', 'Minor Alchemy']
      };

      if (subclassFeatures[character.subclass]) {
        features.push(...subclassFeatures[character.subclass]);
      }
    }

    return features;
  };

  // Ottieni i tratti razziali
  const getRacialTraits = () => {
    const traits = [];

    if (!character.race) return traits;

    // Tratti per razza
    const racialTraits = {
      Dragonborn: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
      Dwarf: ['Darkvision', 'Dwarven Resilience', 'Dwarven Combat Training', 'Tool Proficiency', 'Stonecunning'],
      Elf: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
      Gnome: ['Darkvision', 'Gnome Cunning'],
      'Half-Elf': ['Darkvision', 'Fey Ancestry', 'Skill Versatility'],
      'Half-Orc': ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'],
      Halfling: ['Lucky', 'Brave', 'Halfling Nimbleness'],
      Human: ['Extra Language'],
      Tiefling: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy']
    };

    // Aggiungi tratti razziali
    if (racialTraits[character.race]) {
      traits.push(...racialTraits[character.race]);
    }

    // Aggiungi tratti della sottorazza se presente
    if (character.subrace) {
      const subracialTraits = {
        'Hill Dwarf': ['Dwarven Toughness'],
        'Mountain Dwarf': ['Dwarven Armor Training'],
        'High Elf': ['Elf Weapon Training', 'Cantrip', 'Extra Language'],
        'Wood Elf': ['Elf Weapon Training', 'Fleet of Foot', 'Mask of the Wild'],
        'Dark Elf (Drow)': ['Superior Darkvision', 'Drow Magic', 'Drow Weapon Training'],
        'Forest Gnome': ['Natural Illusionist', 'Speak with Small Beasts'],
        'Rock Gnome': ['Artificer\'s Lore', 'Tinker'],
        'Lightfoot': ['Naturally Stealthy'],
        'Stout': ['Stout Resilience'],
        'Variant': ['Feat', 'Skill Proficiency']
      };

      if (subracialTraits[character.subrace]) {
        traits.push(...subracialTraits[character.subrace]);
      }
    }

    return traits;
  };

  // Ottieni le caratteristiche del background
  const getBackgroundFeatures = () => {
    if (!character.background) return [];

    const backgroundFeatures = {
      Acolyte: ['Shelter of the Faithful'],
