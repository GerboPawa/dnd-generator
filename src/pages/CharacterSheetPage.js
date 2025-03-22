import React, { useState, useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (!character) {
      navigate('/');
      return;
    }
  }, [character, navigate]);

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
      Charlatan: ['False Identity'],
      Criminal: ['Criminal Contact'],
      Entertainer: ['By Popular Demand'],
      'Folk Hero': ['Rustic Hospitality'],
      'Guild Artisan': ['Guild Membership'],
      Hermit: ['Discovery'],
      Noble: ['Position of Privilege'],
      Outlander: ['Wanderer'],
      Sage: ['Researcher'],
      Sailor: ['Ship\'s Passage'],
      Soldier: ['Military Rank'],
      Urchin: ['City Secrets']
    };

    return backgroundFeatures[character.background] || [];
  };

  // Ottieni l'equipaggiamento iniziale
  const getStartingEquipment = () => {
    if (!character.class) return [];

    const equipment = [];

    // Equipaggiamento per classe
    const classEquipment = {
      Barbarian: ['Greataxe', 'Two handaxes', 'Explorer\'s pack', '4 javelins'],
      Bard: ['Rapier', 'Diplomat\'s pack', 'Lute', 'Leather armor', 'Dagger'],
      Cleric: ['Mace', 'Scale mail', 'Light crossbow and 20 bolts', 'Priest\'s pack', 'Shield', 'Holy symbol'],
      Druid: ['Wooden shield', 'Scimitar', 'Leather armor', 'Explorer\'s pack', 'Druidic focus'],
      Fighter: ['Chain mail', 'Longsword', 'Shield', 'Light crossbow and 20 bolts', 'Dungeoneer\'s pack'],
      Monk: ['Shortsword', '10 darts', 'Explorer\'s pack'],
      Paladin: ['Chain mail', 'Longsword', 'Shield', '5 javelins', 'Priest\'s pack', 'Holy symbol'],
      Ranger: ['Scale mail', 'Two shortswords', 'Explorer\'s pack', 'Longbow and 20 arrows'],
      Rogue: ['Rapier', 'Shortbow and 20 arrows', 'Burglar\'s pack', 'Leather armor', 'Two daggers', 'Thieves\' tools'],
      Sorcerer: ['Light crossbow and 20 bolts', 'Component pouch', 'Dungeoneer\'s pack', 'Two daggers'],
      Warlock: ['Light crossbow and 20 bolts', 'Component pouch', 'Scholar\'s pack', 'Leather armor', 'Any simple weapon', 'Two daggers'],
      Wizard: ['Quarterstaff', 'Component pouch', 'Scholar\'s pack', 'Spellbook']
    };

    // Aggiungi equipaggiamento della classe
    if (classEquipment[character.class]) {
      equipment.push(...classEquipment[character.class]);
    }

    // Equipaggiamento per background
    const backgroundEquipment = {
      Acolyte: ['Holy symbol', 'Prayer book', '5 sticks of incense', 'Vestments', 'Common clothes', 'Belt pouch with 15 gp'],
      Charlatan: ['Fine clothes', 'Disguise kit', 'Tools of the con of your choice', 'Belt pouch with 15 gp'],
      Criminal: ['Crowbar', 'Set of dark common clothes with hood', 'Belt pouch with 15 gp'],
      Entertainer: ['Musical instrument', 'The favor of an admirer', 'Costume', 'Belt pouch with 15 gp'],
      'Folk Hero': ['Set of artisan\'s tools', 'Shovel', 'Iron pot', 'Common clothes', 'Belt pouch with 10 gp'],
      'Guild Artisan': ['Set of artisan\'s tools', 'Letter of introduction from your guild', 'Traveler\'s clothes', 'Belt pouch with 15 gp'],
      Hermit: ['Scroll case stuffed with notes', 'Winter blanket', 'Common clothes', 'Herbalism kit', '5 gp'],
      Noble: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse with 25 gp'],
      Outlander: ['Staff', 'Hunting trap', 'Trophy from an animal', 'Traveler\'s clothes', 'Belt pouch with 10 gp'],
      Sage: ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from a dead colleague', 'Common clothes', 'Belt pouch with 10 gp'],
      Sailor: ['Belaying pin', '50 feet of silk rope', 'Lucky charm', 'Common clothes', 'Belt pouch with 10 gp'],
      Soldier: ['Insignia of rank', 'Trophy taken from a fallen enemy', 'Set of bone dice', 'Common clothes', 'Belt pouch with 10 gp'],
      Urchin: ['Small knife', 'Map of the city you grew up in', 'Pet mouse', 'Token to remember your parents by', 'Common clothes', 'Belt pouch with 10 gp']
    };

    // Aggiungi equipaggiamento del background
    if (character.background && backgroundEquipment[character.background]) {
      equipment.push(...backgroundEquipment[character.background]);
    }

    return equipment;
  };

  // Genera un PDF della scheda personaggio
  const generatePDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      const content = characterSheetRef.current;
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      // Determina le dimensioni della pagina
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Prima pagina
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Pagine aggiuntive se necessario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Aggiungi il credito in fondo all'ultima pagina
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Made by Astral Archives (astralarchives.net)', 10, 287);

      // Scarica il PDF
      pdf.save(`${character.name || 'character'}_sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Genera un nome casuale se non è stato fornito
  const characterName = character.name || `${character.race || ''} ${character.class || ''}`.trim() || 'Character';

  return (
    <motion.div
      className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ paddingBottom: '50px' }}
    >
      <motion.div className="flex flex-between mb-4" variants={itemVariants}>
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('common.backToHome')}
        </motion.button>

        <motion.button
          onClick={generatePDF}
          className="primary"
          disabled={isGeneratingPDF}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isGeneratingPDF ? t('characterSheet.generating') : t('characterSheet.downloadPDF')}
        </motion.button>
      </motion.div>

      <div ref={characterSheetRef} className="character-sheet">
        <motion.div className="card" variants={itemVariants}>
          <div className="character-header flex flex-between mb-4">
            <div>
              <h1 className="mb-2">{characterName}</h1>
              <div className="character-details">
                <p>
                  <strong>{t('selection.class')}:</strong> {character.class} {character.subclass ? `(${character.subclass})` : ''}
                </p>
                <p>
                  <strong>{t('selection.race')}:</strong> {character.race} {character.subrace ? `(${character.subrace})` : ''}
                </p>
                <p>
                  <strong>{t('selection.background')}:</strong> {character.background}
                </p>
                <p>
                  <strong>{t('selection.level')}:</strong> {character.level}
                </p>
              </div>
            </div>

            <div className="character-proficiency">
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <strong>{t('characterSheet.proficiencyBonus')}:</strong>
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid var(--primary-medium)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto'
              }}>
                +{getProficiencyBonus(character.level)}
              </div>
            </div>
          </div>

          <div className="grid mb-4">
            {/* Ability Scores */}
            {character.stats && Object.entries(character.stats).map(([ability, score]) => (
              <motion.div
                key={ability}
                className="ability-score"
                variants={itemVariants}
                style={{
                  padding: '15px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ marginBottom: '5px' }}>{t(`stats.${ability}`)}</h3>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}>
                  {score}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary-medium)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto'
                }}>
                  {getAbilityModifier(score) >= 0 ? `+${getAbilityModifier(score)}` : getAbilityModifier(score)}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid mb-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
            {/* Saving Throws */}
            <motion.div className="saving-throws card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.savingThrows')}</h3>
              {character.stats && Object.entries(character.stats).map(([ability, score]) => {
                const isProficient = isSavingThrowProficient(ability);
                const modifier = getAbilityModifier(score) + (isProficient ? getProficiencyBonus(character.level) : 0);

                return (
                  <div key={ability} className="flex mb-2" style={{ alignItems: 'center' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1px solid var(--primary-medium)',
                      marginRight: '10px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isProficient ? 'var(--primary-medium)' : 'transparent'
                    }}>
                      {isProficient && '✓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      {t(`stats.${ability}`)}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {modifier >= 0 ? `+${modifier}` : modifier}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Skills */}
            <motion.div className="skills card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.skills')}</h3>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {character.stats && [
                  { name: 'acrobatics', ability: 'dexterity' },
                  { name: 'animalHandling', ability: 'wisdom' },
                  { name: 'arcana', ability: 'intelligence' },
                  { name: 'athletics', ability: 'strength' },
                  { name: 'deception', ability: 'charisma' },
                  { name: 'history', ability: 'intelligence' },
                  { name: 'insight', ability: 'wisdom' },
                  { name: 'intimidation', ability: 'charisma' },
                  { name: 'investigation', ability: 'intelligence' },
                  { name: 'medicine', ability: 'wisdom' },
                  { name: 'nature', ability: 'intelligence' },
                  { name: 'perception', ability: 'wisdom' },
                  { name: 'performance', ability: 'charisma' },
                  { name: 'persuasion', ability: 'charisma' },
                  { name: 'religion', ability: 'intelligence' },
                  { name: 'sleightOfHand', ability: 'dexterity' },
                  { name: 'stealth', ability: 'dexterity' },
                  { name: 'survival', ability: 'wisdom' }
                ].map(skill => {
                  const skillProficiencies = getSkillProficiencies();
                  const isProficient = skillProficiencies.includes(skill.name);
                  const modifier = getAbilityModifier(character.stats[skill.ability]) +
                    (isProficient ? getProficiencyBonus(character.level) : 0);

                  return (
                    <div key={skill.name} className="flex" style={{ alignItems: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '1px solid var(--primary-medium)',
                        marginRight: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isProficient ? 'var(--primary-medium)' : 'transparent',
                        fontSize: '0.7rem'
                      }}>
                        {isProficient && '✓'}
                      </div>
                      <div style={{ flex: 1, fontSize: '0.9rem' }}>
                        {t(`skills.${skill.name}`)} ({t(`stats.${skill.ability}`).charAt(0).toUpperCase()})
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {modifier >= 0 ? `+${modifier}` : modifier}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="grid mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Class Features */}
            <motion.div className="class-features card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.classFeatures')}</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {getClassFeatures().map((feature, index) => (
                  <li key={index} className="mb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                    <strong>{feature}</strong>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Racial Traits */}
            <motion.div className="racial-traits card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.racialTraits')}</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {getRacialTraits().map((trait, index) => (
                  <li key={index} className="mb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                    <strong>{trait}</strong>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="grid mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Background Features */}
            <motion.div className="background-features card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.backgroundFeatures')}</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {getBackgroundFeatures().map((feature, index) => (
                  <li key={index} className="mb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                    <strong>{feature}</strong>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Equipment */}
            <motion.div className="equipment card" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.equipment')}</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {getStartingEquipment().map((item, index) => (
                  <li key={index} className="mb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '5px' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Spells (if applicable) */}
          {getSpells() && (
            <motion.div className="spells card mb-4" variants={itemVariants}>
              <h3 className="mb-3">{t('characterSheet.spells')}</h3>

              {getSpells().cantrips && getSpells().cantrips.length > 0 && (
                <div className="mb-3">
                  <h4 className="mb-2">{t('characterSheet.cantrips')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().cantrips.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {getSpells().level1 && getSpells().level1.length > 0 && (
                <div className="mb-3">
                  <h4 className="mb-2">{t('characterSheet.level1Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level1.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {getSpells().level2 && getSpells().level2.length > 0 && (
                <div className="mb-3">
                  <h4 className="mb-2">{t('characterSheet.level2Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level2.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {getSpells().level3 && getSpells().level3.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level3Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level3.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level4 && getSpells().level4.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level4Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level4.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level5 && getSpells().level5.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level5Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level5.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level6 && getSpells().level6.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level6Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level6.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level7 && getSpells().level7.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level7Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level7.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level8 && getSpells().level8.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level8Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level8.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
               {getSpells().level9 && getSpells().level9.length > 0 && (
                <div>
                  <h4 className="mb-2">{t('characterSheet.level9Spells')}</h4>
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {getSpells().level9.map((spell, index) => (
                      <li key={index} className="mb-1">
                        {spell}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          <div className="footer text-center" style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>
            <p>Made by Astral Archives (astralarchives.net)</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CharacterSheetPage;
