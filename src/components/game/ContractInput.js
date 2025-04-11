// src/components/game/ContractInput.js

import React, { useState, useEffect } from 'react';
import './ContractInput.css';

const ContractInput = ({ 
  gameNumber = 1, 
  dealNumber = 1, 
  tokenCount = 0,
  dealer = 'North', 
  vulnerability = 'None',
  onContractConfirmed 
}) => {
  // State for all the contract inputs
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [selectedDeclarer, setSelectedDeclarer] = useState(null);
  const [doubled, setDoubled] = useState(false);
  const [redoubled, setRedoubled] = useState(false);

  // Format vulnerability for display
  const formatVulnerability = (vul) => {
    if (vul === 'None') return 'NVul';
    return 'Vul';
  };

  // Get the full contract display
  const getContractDisplay = () => {
    if (!selectedLevel || !selectedStrain || !selectedDeclarer) {
      return 'Select a contract';
    }

    let display = `${selectedLevel} ${selectedStrain} By ${selectedDeclarer}`;
    
    if (doubled) {
      display += ' X';
    } else if (redoubled) {
      display += ' XX';
    }
    
    display += ` ${formatVulnerability(vulnerability)}`;
    
    return display;
  };

  // Handle contract confirmation
  const handleConfirm = () => {
    if (selectedLevel && selectedStrain && selectedDeclarer) {
      const contract = {
        level: selectedLevel,
        strain: selectedStrain,
        declarer: selectedDeclarer,
        doubled,
        redoubled,
        vulnerability
      };
      
      onContractConfirmed(contract);
    } else {
      alert('Please select a complete contract (level, strain, and declarer).');
    }
  };

  // Handle contract editing/reset
  const handleEdit = () => {
    setSelectedLevel(null);
    setSelectedStrain(null);
    setSelectedDeclarer(null);
    setDoubled(false);
    setRedoubled(false);
  };

  return (
    <div className="contract-input-container">
      {/* Game information section */}
      <div className="game-info">
        <div className="game-number">Game {gameNumber}</div>
        <div className="deal-number">Deal {dealNumber} of 10</div>
        <div className="token-count">Tokens: {tokenCount}</div>
      </div>
      
      {/* Dealer and vulnerability */}
      <div className="dealer-info">
        Dealer {dealer} {formatVulnerability(vulnerability)}
      </div>
      
      {/* Level selection */}
      <div className="input-section">
        <h3>Bid</h3>
        <div className="level-buttons">
          {[1, 2, 3, 4, 5, 6, 7].map(level => (
            <button
              key={level}
              className={`level-button ${selectedLevel === level ? 'selected' : ''}`}
              onClick={() => setSelectedLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
      
      {/* Strain selection */}
      <div className="input-section">
        <h3>Suit</h3>
        <div className="strain-buttons">
          <button
            className={`strain-button black ${selectedStrain === '♣' ? 'selected' : ''}`}
            onClick={() => setSelectedStrain('♣')}
          >
            ♣
          </button>
          <button
            className={`strain-button red ${selectedStrain === '♦' ? 'selected' : ''}`}
            onClick={() => setSelectedStrain('♦')}
          >
            ♦
          </button>
          <button
            className={`strain-button red ${selectedStrain === '♥' ? 'selected' : ''}`}
            onClick={() => setSelectedStrain('♥')}
          >
            ♥
          </button>
          <button
            className={`strain-button black ${selectedStrain === '♠' ? 'selected' : ''}`}
            onClick={() => setSelectedStrain('♠')}
          >
            ♠
          </button>
          <button
            className={`strain-button black ${selectedStrain === 'NT' ? 'selected' : ''}`}
            onClick={() => setSelectedStrain('NT')}
          >
            NT
          </button>
        </div>
      </div>
      
      {/* Declarer selection */}
      <div className="input-section">
        <h3>Declarer</h3>
        <div className="declarer-buttons">
          <button
            className={`declarer-button ${selectedDeclarer === 'North' ? 'selected' : ''}`}
            onClick={() => setSelectedDeclarer('North')}
          >
            N
          </button>
          <button
            className={`declarer-button ${selectedDeclarer === 'East' ? 'selected' : ''}`}
            onClick={() => setSelectedDeclarer('East')}
          >
            E
          </button>
          <button
            className={`declarer-button ${selectedDeclarer === 'South' ? 'selected' : ''}`}
            onClick={() => setSelectedDeclarer('South')}
          >
            S
          </button>
          <button
            className={`declarer-button ${selectedDeclarer === 'West' ? 'selected' : ''}`}
            onClick={() => setSelectedDeclarer('West')}
          >
            W
          </button>
        </div>
      </div>
      
      {/* Double/Redouble selection */}
      <div className="input-section">
        <div className="double-buttons">
          <button
            className={`double-button ${doubled ? 'selected' : ''}`}
            onClick={() => {
              setDoubled(!doubled);
              setRedoubled(false);
            }}
          >
            Double (X)
          </button>
          <button
            className={`double-button ${redoubled ? 'selected' : ''}`}
            onClick={() => {
              setRedoubled(!redoubled);
              setDoubled(false);
            }}
          >
            Redouble (XX)
          </button>
        </div>
      </div>
      
      {/* Contract display */}
      <div className="input-section">
        <h3>Contract</h3>
        <div className="contract-display">
          {getContractDisplay()}
        </div>
      </div>
      
      {/* Confirm/Edit buttons */}
      <div className="action-buttons">
        <button
          className="confirm-button"
          onClick={handleConfirm}
        >
          Confirm
        </button>
        <button
          className="edit-button"
          onClick={handleEdit}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ContractInput;