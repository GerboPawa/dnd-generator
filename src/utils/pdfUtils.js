import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getAbilityModifier } from './diceUtils';

// Funzione per generare il PDF della scheda personaggio
const generateCharacterSheetPDF = async (characterRef, character) => {
  if (!characterRef.current) return null;
  
  try {
    // Cattura la scheda personaggio come immagine
    const canvas = await html2canvas(characterRef.current, { 
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Crea un nuovo documento PDF in formato A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Calcola le dimensioni dell'immagine mantenendo le proporzioni
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Aggiungi l'immagine al PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Se l'immagine è più grande di una pagina, aggiungi pagine aggiuntive
    let heightLeft = imgHeight;
    let position = 0;
    
    heightLeft -= pageHeight;
    
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
    
    // Nome del file PDF
    const fileName = `${character?.name || 'character'}_sheet.pdf`;
    
    // Salva il PDF
    pdf.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

// Funzione per formattare la scheda personaggio in modo ottimale per il PDF
const formatCharacterForPDF = (character) => {
  if (!character) return null;
  
  // Calcola il bonus di competenza in base al livello
  const getProficiencyBonus = (level) => {
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6;
  };
  
  // Formatta le statistiche per la visualizzazione
  const formatStats = (stats) => {
    if (!stats) return {};
    
    return Object.entries(stats).reduce((formatted, [stat, value]) => {
      formatted[stat] = {
        value,
        modifier: getAbilityModifier(value)
      };
      return formatted;
    }, {});
  };
  
  // Organizza le informazioni del personaggio in un formato ottimale per il PDF
  return {
    ...character,
    formattedStats: formatStats(character.stats),
    proficiencyBonus: getProficiencyBonus(character.level || 1)
  };
};

// Componente per visualizzare una sezione della scheda personaggio
const CharacterSheetSection = ({ title, children }) => {
  return (
    <div className="character-sheet-section" style={{
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 'var(--border-radius-md)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{
        borderBottom: '2px solid var(--primary-medium)',
        paddingBottom: '8px',
        marginBottom: '15px'
      }}>{title}</h3>
      {children}
    </div>
  );
};

// Componente per visualizzare una statistica
const StatDisplay = ({ label, value, modifier }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 'var(--border-radius-md)',
      marginBottom: '10px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '2px solid var(--primary-medium)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '5px auto 0',
        fontSize: '0.9rem'
      }}>
        {modifier >= 0 ? `+${modifier}` : modifier}
      </div>
    </div>
  );
};

export {
  generateCharacterSheetPDF,
  formatCharacterForPDF,
  CharacterSheetSection,
  StatDisplay
};
