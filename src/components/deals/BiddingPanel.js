// src/components/deals/BiddingPanel.js

import React, { useState, useEffect } from 'react';

const BiddingPanel = ({ dealer, vulnerability, onBidSubmitted }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [selectedDeclarer, setSelectedDeclarer] = useState(null);
  const [doubled, setDoubled] = useState(false);
  const [redoubled, setRedoubled] = useState(false);
  
  // Styles for exact UI match
  const styles = {
    container: {
      width: '100%',
      maxWidth: '380px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    headerText: {
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0 0 15px 0'
    },
    // Level buttons (1-7) - FIRST ROW
    levelsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      margin: '10px 0'
    },
    levelButton: {
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef'
    },
    activeLevel: {
      backgroundColor: '#4361ee',
      color: 'white'
    },
    // Strain buttons (♣ ♦ ♥ ♠ NT) - SECOND ROW
    strainsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      margin: '10px 0'
    },
    strainButton: {
      width: '35px',
      height: '35px',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef'
    },
    activeStrain: {
      backgroundColor: '#4361ee',
      color: 'white !important'
    },
    blackSuit: {
      color: 'black'
    },
    redSuit: {
      color: 'red'
    },
    // Direction buttons (N E S W) - THIRD ROW
    directionRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      margin: '15px 0'
    },
    directionButton: {
      width: '35px',
      height: '35px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef'
    },
    activeDirection: {
      backgroundColor: '#4361ee',
      color: 'white'
    },
    // Double/Redouble row - FOURTH ROW
    doubleRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      margin: '10px 0'
    },
    doubleButton: {
      flex: 1,
      height: '40px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef'
    },
    activeDouble: {
      backgroundColor: '#4361ee',
      color: 'white'
    },
    // Action buttons - FIFTH ROW
    actionRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      margin: '10px 0'
    },
    passButton: {
      flex: 1,
      height: '40px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef',
    },
    bidButton: {
      flex: 1,
      height: '40px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#4361ee',
      color: 'white'
    },
    doubleActionButton: {
      flex: 1,
      height: '40px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef',
      color: '#333'
    },
    // Agreed/Edit buttons - LAST ROW
    finalRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginTop: '15px'
    },
    agreedButton: {
      flex: 1,
      height: '45px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#38b000',
      color: 'white'
    },
    editButton: {
      flex: 1,
      height: '45px',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: '#e9ecef',
      color: '#333'
    },
    // Contract display
    contractDisplay: {
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      padding: '10px',
      backgroundColor: '#f8f8f8',
      borderRadius: '5px',
      margin: '10px 0'
    }
  };

  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  // Handle strain selection
  const handleStrainSelect = (strain) => {
    setSelectedStrain(strain);
  };

  // Handle direction selection
  const handleDirectionSelect = (dir) => {
    setSelectedDeclarer(dir);
  };

  // Handle double toggle
  const handleDoubleToggle = () => {
    setDoubled(!doubled);
    setRedoubled(false);
  };

  // Handle redouble toggle
  const handleRedoubleToggle = () => {
    setRedoubled(!redoubled);
    setDoubled(false);
  };

  // Handle pass action
  const handlePass = () => {
    // Logic for pass would go here
    // For now, we'll just reset the UI
    setSelectedLevel(null);
    setSelectedStrain(null);
    setSelectedDeclarer(null);
    setDoubled(false);
    setRedoubled(false);
  };

  // Handle bid action
  const handleBid = () => {
    // Bid only valid if level and strain are selected
    if (selectedLevel && selectedStrain) {
      // Logic for bid would go here
    }
  };

  // Handle double/redouble action
  const handleXXX = () => {
    // Logic for X/XX would go here
  };

  // Handle agreed action
  const handleAgreed = () => {
    // Submit final contract
    if (selectedLevel && selectedStrain && selectedDeclarer) {
      onBidSubmitted({
        level: selectedLevel,
        strain: selectedStrain,
        declarer: selectedDeclarer,
        doubled: doubled,
        redoubled: redoubled,
        vulnerability
      });
    }
  };

  // Handle edit action
  const handleEdit = () => {
    // Logic for edit would go here
    // Reset UI
    setSelectedLevel(null);
    setSelectedStrain(null);
    setSelectedDeclarer(null);
    setDoubled(false);
    setRedoubled(false);
  };

  // Format vulnerability text
  const getVulnerabilityText = () => {
    if (vulnerability.ns && vulnerability.ew) return 'Both';
    if (vulnerability.ns) return 'N-S';
    if (vulnerability.ew) return 'E-W';
    return 'None';
  };

  // Show current contract
  const getContractDisplay = () => {
    if (!selectedLevel || !selectedStrain) return 'Select contract';
    
    let display = `${selectedLevel}${selectedStrain}`;
    
    if (selectedDeclarer) {
      display += ` by ${selectedDeclarer}`;
    }
    
    if (doubled) {
      display += ' X';
    } else if (redoubled) {
      display += ' XX';
    }
    
    return display;
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerText}>
        Dealer {dealer} Vul {getVulnerabilityText()}
      </div>
      
      {/* FIRST ROW: Levels (1-7) */}
      <div style={styles.levelsRow}>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '1' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('1')}
        >
          1
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '2' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('2')}
        >
          2
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '3' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('3')}
        >
          3
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '4' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('4')}
        >
          4
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '5' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('5')}
        >
          5
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '6' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('6')}
        >
          6
        </button>
        <button 
          style={{
            ...styles.levelButton,
            ...(selectedLevel === '7' ? styles.activeLevel : {})
          }}
          onClick={() => handleLevelSelect('7')}
        >
          7
        </button>
      </div>
      
      {/* SECOND ROW: Strains (♣ ♦ ♥ ♠ NT) */}
      <div style={styles.strainsRow}>
        <button 
          style={{
            ...styles.strainButton,
            ...styles.blackSuit,
            ...(selectedStrain === '♣' ? styles.activeStrain : {})
          }}
          onClick={() => handleStrainSelect('♣')}
        >
          ♣
        </button>
        <button 
          style={{
            ...styles.strainButton,
            ...styles.redSuit,
            ...(selectedStrain === '♦' ? styles.activeStrain : {})
          }}
          onClick={() => handleStrainSelect('♦')}
        >
          ♦
        </button>
        <button 
          style={{
            ...styles.strainButton,
            ...styles.redSuit,
            ...(selectedStrain === '♥' ? styles.activeStrain : {})
          }}
          onClick={() => handleStrainSelect('♥')}
        >
          ♥
        </button>
        <button 
          style={{
            ...styles.strainButton,
            ...styles.blackSuit,
            ...(selectedStrain === '♠' ? styles.activeStrain : {})
          }}
          onClick={() => handleStrainSelect('♠')}
        >
          ♠
        </button>
        <button 
          style={{
            ...styles.strainButton,
            ...styles.blackSuit,
            ...(selectedStrain === 'NT' ? styles.activeStrain : {})
          }}
          onClick={() => handleStrainSelect('NT')}
        >
          NT
        </button>
      </div>
      
      {/* THIRD ROW: Direction buttons (N E S W) */}
      <div style={styles.directionRow}>
        <button 
          style={{
            ...styles.directionButton,
            ...(selectedDeclarer === 'N' ? styles.activeDirection : {})
          }}
          onClick={() => handleDirectionSelect('N')}
        >
          N
        </button>
        <button 
          style={{
            ...styles.directionButton,
            ...(selectedDeclarer === 'E' ? styles.activeDirection : {})
          }}
          onClick={() => handleDirectionSelect('E')}
        >
          E
        </button>
        <button 
          style={{
            ...styles.directionButton,
            ...(selectedDeclarer === 'S' ? styles.activeDirection : {})
          }}
          onClick={() => handleDirectionSelect('S')}
        >
          S
        </button>
        <button 
          style={{
            ...styles.directionButton,
            ...(selectedDeclarer === 'W' ? styles.activeDirection : {})
          }}
          onClick={() => handleDirectionSelect('W')}
        >
          W
        </button>
      </div>
      
      {/* FOURTH ROW: Double/Redouble buttons */}
      <div style={styles.doubleRow}>
        <button 
          style={{
            ...styles.doubleButton,
            ...(doubled ? styles.activeDouble : {})
          }}
          onClick={handleDoubleToggle}
        >
          Double
        </button>
        <button 
          style={{
            ...styles.doubleButton,
            ...(redoubled ? styles.activeDouble : {})
          }}
          onClick={handleRedoubleToggle}
        >
          Redouble
        </button>
      </div>
      
      {/* FIFTH ROW: Action buttons */}
      <div style={styles.actionRow}>
        <button 
          style={styles.passButton}
          onClick={handlePass}
        >
          Pass
        </button>
        <button 
          style={styles.bidButton}
          onClick={handleBid}
        >
          Bid
        </button>
        <button 
          style={styles.doubleActionButton}
          onClick={handleXXX}
        >
          X/XX
        </button>
      </div>
      
      {/* SIXTH ROW: Agreed/Edit buttons */}
      <div style={styles.finalRow}>
        <button 
          style={styles.agreedButton}
          onClick={handleAgreed}
        >
          AGREED
        </button>
        <button 
          style={styles.editButton}
          onClick={handleEdit}
        >
          EDIT
        </button>
      </div>
    </div>
  );
};

export default BiddingPanel;