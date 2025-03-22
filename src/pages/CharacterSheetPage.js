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
        level3: ['Dispel Magic', 'Hypnotic Pattern']
      },
      Cleric: {
        cantrips: ['Guidance', 'Light', 'Sacred Flame', 'Spare the Dying', 'Thaumaturgy'],
        level1: ['Bless', 'Cure Wounds', 'Guiding Bolt', 'Healing Word', 'Shield of Faith'],
        level2: ['Hold Person', 'Lesser Restoration', 'Spiritual Weapon'],
        level3: ['Mass Healing Word', 'Revivify', 'Spirit Guardians']
      },
      Druid: {
        cantrips: ['Druidcraft', 'Guidance', 'Produce Flame', 'Resistance', 'Shillelagh'],
        level1: ['Animal Friendship', 'Cure Wounds', 'Entangle', 'Faerie Fire', 'Healing Word'],
        level2: ['Barkskin', 'Flaming Sphere', 'Moonbeam'],
        level3: ['Call Lightning', 'Conjure Animals', 'Plant Growth']
      },
      Paladin: {
        level1: ['Bless', 'Cure Wounds', 'Divine Favor', 'Shield of Faith'],
        level2: ['Aid', 'Find Steed', 'Lesser Restoration', 'Zone of Truth']
      },
      Ranger: {
        level1: ['Animal Friendship', 'Cure Wounds', 'Hunters Mark'],
        level2: ['Barkskin', 'Lesser Restoration', 'Pass without Trace']
}
      Sorcerer: {
        cantrips: ['Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Prestidigitation'],
        level1: ['Burning Hands', 'Charm Person', 'Magic Missile', 'Shield', 'Sleep'],
        level2: ['Invisibility', 'Scorching Ray', 'Suggestion'],
        level3: ['Fireball', 'Fly', 'Haste']
      },
      Warlock: {
        cantrips: ['Eldritch Blast', 'Mage Hand', 'Minor Illusion', 'Prestidigitation', 'True Strike'],
        level1: ['Charm Person', 'Hex', 'Protection from Evil and Good', 'Witch Bolt'],
        level2: ['Hold Person', 'Invisibility', 'Mirror Image'],
        level3: ['Dispel Magic', 'Fear', 'Vampiric Touch']
      },
      Wizard: {
        cantrips: ['Dancing Lights', 'Fire Bolt', 'Light', 'Mage Hand', 'Prestidigitation'],
        level1: ['Burning Hands', 'Charm Person', 'Feather Fall', 'Mage Armor', 'Magic Missile', 'Shield', 'Sleep'],
        level2: ['Invisibility', 'Mirror Image', 'Misty Step', 'Scorching Ray', 'Web'],
        level3: ['Counterspell', 'Fireball', 'Fly', 'Haste', 'Lightning Bolt']
      }
    };
    
    const spells = {
      cantrips: [],
      level1: [],
      level2: [],
      level3: []
    };
    
    // Seleziona incantesimi in base al livello
    const classSpells = spellsByClass[character.class];
    
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
    
    // Incantesimi di livello 1
    if (character.level >= 1 && classSpells.level1) {
      // Numero di incantesimi conosciuti per classe
      const level1Count = {
        Bard: 4,
        Cleric: 'all', // I chierici conoscono tutti gli incantesimi
        Druid: 'all', // I druidi conoscono tutti gli incantesimi
        Paladin: character.level >= 2 ? 2 : 0, // I paladini ottengono incantesimi al livello 2
        Ranger: character.level >= 2 ? 2 : 0, // I ranger ottengono incantesimi al livello 2
        Sorcerer: 2,
        Warlock: 2,
        Wizard: 6
      }[character.class] || 0;
      
      if (level1Count === 'all') {
        spells.level1 = [...classSpells.level1];
      } else {
        // Seleziona casualmente gli incantesimi
        const availableSpells = [...classSpells.level1];
        for (let i = 0; i < level1Count && availableSpells.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableSpells.length);
          spells.level1.push(availableSpells[randomIndex]);
          availableSpells.splice(randomIndex, 1);
        }
      }
    }
    
    // Incantesimi di livello 2 (disponibili dal livello 3)
    if (character.level >= 3 && classSpells.level2) {
      // Numero di incantesimi conosciuti per classe
      const level2Count = {
        Bard: 2,
        Cleric: 'all',
        Druid: 'all',
        Paladin: 2,
        Ranger: 2,
        Sorcerer: 1,
        Warlock: 1,
        Wizard: 4
      }[character.class] || 0;
      
      if (level2Count === 'all') {
        spells.level2 = [...classSpells.level2];
      } else {
        // Seleziona casualmente gli incantesimi
        const availableSpells = [...classSpells.level2];
        for (let i = 0; i < level2Count && availableSpells.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableSpells.length);
          spells.level2.push(availableSpells[randomIndex]);
          availableSpells.splice(randomIndex, 1);
        }
      }
    }
    
    // Incantesimi di livello 3 (disponibili dal livello 5)
    if (character.level >= 5 && classSpells.level3) {
      // Numero di incantesimi conosciuti per classe
      const level3Count = {
        Bard: 2,
        Cleric: 'all',
        Druid: 'all',
        Paladin: 2,
        Ranger: 2,
        Sorcerer: 1,
        Warlock: 1,
        Wizard: 4
      }[character.class] || 0;
      
      if (level3Count === 'all') {
        spells.level3 = [...classSpells.level3];
      } else {
        // Seleziona casualmente gli incantesimi
        const availableSpells = [...classSpells.level3];
        for (let i = 0; i < level3Count && availableSpells.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableSpells.length);
          spells.level3.push(availableSpells[randomIndex]);
          availableSpells.splice(randomIndex, 1);
        }
      }
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
        3: ['Primal Path']
      },
      Bard: {
        1: ['Bardic Inspiration', 'Spellcasting'],
        2: ['Jack of All Trades', 'Song of Rest'],
        3: ['Bard College', 'Expertise']
      },
      Cleric: {
        1: ['Spellcasting', 'Divine Domain'],
        2: ['Channel Divinity', 'Divine Domain Feature'],
        3: ['Divine Domain Feature']
      },
      Druid: {
        1: ['Druidic', 'Spellcasting'],
        2: ['Wild Shape', 'Druid Circle'],
        3: ['Druid Circle Feature']
      },
      Fighter: {
        1: ['Fighting Style', 'Second Wind'],
        2: ['Action Surge'],
        3: ['Martial Archetype']
      },
      Monk: {
        1: ['Unarmored Defense', 'Martial Arts'],
        2: ['Ki', 'Unarmored Movement'],
        3: ['Monastic Tradition', 'Deflect Missiles']
      },
      Paladin: {
        1: ['Divine Sense', 'Lay on Hands'],
        2: ['Fighting Style', 'Spellcasting', 'Divine Smite'],
        3: ['Sacred Oath', 'Divine Health']
      },
      Ranger: {
        1: ['Favored Enemy', 'Natural Explorer'],
        2: ['Fighting Style', 'Spellcasting'],
        3: ['Ranger Archetype', 'Primeval Awareness']
      },
      Rogue: {
        1: ['Expertise', 'Sneak Attack', 'Thieves' Cant'],
        2: ['Cunning Action'],
        3: ['Roguish Archetype']
      },
      Sorcerer: {
        1: ['Spellcasting', 'Sorcerous Origin'],
        2: ['Font of Magic'],
        3: ['Metamagic']
      },
      Warlock: {
        1: ['Otherworldly Patron', 'Pact Magic'],
        2: ['Eldritch Invocations'],
        3: ['Pact Boon']
      },
      Wizard: {
        1: ['Spellcasting', 'Arcane Recovery'],
        2: ['Arcane Tradition'],
        3: ['Arcane Tradition Feature']
      }
    };
    
    // Aggiungi caratteristiche in base al livello
    for (let level = 1; level <= character.level; level++) {
      if (classFeatures[character.class][level]) {
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
        'Oath of the Ancients': ['Nature's Wrath', 'Turn the Faithless'],
        'Oath of Vengeance': ['Abjure Enemy', 'Vow of Enmity'],
        'Hunter': ['Hunter's Prey'],
        'Beast Master': ['Ranger's Companion'],
        'Thief': ['Fast Hands', 'Second-Story Work'],
        'Assassin': ['Assassinate'],
        'Arcane Trickster': ['Spellcasting', 'Mage Hand Legerdemain'],
        'Draconic Bloodline': ['Dragon Ancestor', 'Draconic Resilience'],
        'Wild Magic': ['Wild Magic Surge', 'Tides of Chaos'],
        'The Archfey': ['Fey Presence'],
        'The Fiend': ['Dark One's Blessing'],
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
        'Rock Gnome': ['Artificer's Lore', 'Tinker'],
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
      Sailor: ['Ship's Passage'],
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
      Barbarian: ['Greataxe', 'Two handaxes', 'Explorer's pack', '4 javelins'],
      Bard: ['Rapier', 'Diplomat's pack', 'Lute', 'Leather armor', 'Dagger'],
      Cleric: ['Mace', 'Scale mail', 'Light crossbow and 20 bolts', 'Priest's pack', 'Shield', 'Holy symbol'],
      Druid: ['Wooden shield', 'Scimitar', 'Leather armor', 'Explorer's pack', 'Druidic focus'],
      Fighter: ['Chain mail', 'Longsword', 'Shield', 'Light crossbow and 20 bolts', 'Dungeoneer's pack'],
      Monk: ['Shortsword', '10 darts', 'Explorer's pack'],
      Paladin: ['Chain mail', 'Longsword', 'Shield', '5 javelins', 'Priest's pack', 'Holy symbol'],
      Ranger: ['Scale mail', 'Two shortswords', 'Explorer's pack', 'Longbow and 20 arrows'],
      Rogue: ['Rapier', 'Shortbow and 20 arrows', 'Burglar's pack', 'Leather armor', 'Two daggers', 'Thieves' tools'],
      Sorcerer: ['Light crossbow and 20 bolts', 'Component pouch', 'Dungeoneer's pack', 'Two daggers'],
      Warlock: ['Light crossbow and 20 bolts', 'Component pouch', 'Scholar's pack', 'Leather armor', 'Any simple weapon', 'Two daggers'],
      Wizard: ['Quarterstaff', 'Component pouch', 'Scholar's pack', 'Spellbook']
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
      'Folk Hero': ['Set of artisan's tools', 'Shovel', 'Iron pot', 'Common clothes', 'Belt pouch with 10 gp'],
      'Guild Artisan': ['Set of artisan's tools', 'Letter of introduction from your guild', 'Traveler's clothes', 'Belt pouch with 15 gp'],
      Hermit: ['Scroll case stuffed with notes', 'Winter blanket', 'Common clothes', 'Herbalism kit', '5 gp'],
      Noble: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse with 25 gp'],
      Outlander: ['Staff', 'Hunting trap', 'Trophy from an animal', 'Traveler's clothes', 'Belt pouch with 10 gp'],
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
