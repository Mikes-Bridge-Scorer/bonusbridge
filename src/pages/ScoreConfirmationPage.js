// C:/bridge-scorer/bonusbridge/src/pages/ScoreConfirmationPage.js

import React, { useState, useEffect } from 'react';
import './ScoreConfirmationPage.css';

const ScoreConfirmationPage = ({ gameData, setGameData, onNext, onAbandonGame }) => {
  const [confirmationData, setConfirmationData] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Load from localStorage on mount
  useEffect(() => {
    console.log("[DEBUG] ScoreConfirmationPage mounted with gameData:", gameData);
    
    const contract = gameData.currentContract;
    if (!contract) {
      console.error("No current contract found in gameData");
      return;
    }
    
    // Load token balance
    const userData = localStorage.getItem('bonusBridgeUser');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setTokenBalance(parsedData.tokenBalance || 0);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Format data for display
    const data = {
      contractString: `${contract.level} ${contract.suit} by ${contract.declarer}${contract.isDoubled ? ' (Doubled)' : ''}${contract.isRedoubled ? ' (Redoubled)' : ''}`,
      tricks: contract.tricks || 0,
      rawScore: contract.rawScore || 0,
      hcp: contract.hcp || 0,
      distribution: contract.distribution || 0,
      penalties: contract.penalties || {},
      bonuses: contract.bonuses || {},
      awardedTo: contract.awardedTo || null,
      finalScore: contract.finalScore || 0
    };
    
    setConfirmationData(data);
    
    // Store current scores in global state as backup
    if (window.BRIDGE_GAME_STATE) {
      window.BRIDGE_GAME_STATE.lastGameScores = { ...gameData.scores };
    }
  }, [gameData]);
  
  // Function to handle continuing to next deal
  const handleContinue = () => {
    // Save contract to localStorage before proceeding
    console.log("[DEBUG] Saving contract to localStorage before continuing");
    localStorage.setItem('lastContract', JSON.stringify(gameData.currentContract));
    
    // Save current scores to localStorage
    console.log("[DEBUG] Saving current scores to localStorage:", gameData.scores);
    localStorage.setItem('currentScores', JSON.stringify(gameData.scores));
    
    // Continue to next deal via onNext callback
    onNext();
  };
  
  // Function to handle abandoning the game
  const handleAbandonGame = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to abandon this game? All progress will be lost.")) {
      console.log("Game abandoned! Saving to localStorage:");
      console.log({
        gameNumber: gameData.gameNumber,
        deals: gameData.deals,
        contracts: gameData.contracts.length,
        scores: gameData.scores
      });
      
      // EMERGENCY FIX: Clear ALL storage to prevent persistence
      console.log("CLEARING ALL SESSION STORAGE");
      sessionStorage.clear();
      
      // Remove specific localStorage items
      localStorage.removeItem('selectedDealsCount');
      localStorage.removeItem('currentSessionDealsCount');
      localStorage.removeItem('lastContract');
      localStorage.removeItem('currentScores');
      
      // Reset scores in global state
      if (window.BRIDGE_GAME_STATE) {
        window.BRIDGE_GAME_STATE.selectedDeals = null;
        window.BRIDGE_GAME_STATE.lastGameScores = {
          'North-South': 0,
          'East-West': 0
        };
      }
      
      // Reset scores explicitly before abandoning
      setGameData(prevData => ({
        ...prevData,
        scores: {
          'North-South': 0,
          'East-West': 0
        }
      }));
      
      // Short delay to ensure state updates
      setTimeout(() => {
        // Call the onAbandonGame callback passed from parent
        if (onAbandonGame) {
          onAbandonGame();
        }
      }, 100);
    } else {
      console.log("User cancelled abandoning game");
    }
  };
  
  // Helper to format scores with + sign for positive numbers
  const formatScore = (score) => {
    if (score > 0) return `+${score}`;
    return score.toString();
  };
  
  // Get vulnerability text
  const getVulnerabilityText = (vulnerability) => {
    switch(vulnerability) {
      case 'None': return 'None Vul';
      case 'NS': return 'NS Vul';
      case 'EW': return 'EW Vul';
      case 'Both': return 'All Vul';
      default: return 'None Vul';
    }
  };
  
  if (!confirmationData) {
    return <div className="loading">Loading contract details...</div>;
  }
  
  return (
    <div className="score-confirmation-container">
      <div className="header">Score Confirmation <span role="img" aria-label="info">ℹ️</span></div>
      
      <div className="game-info">
        Game {gameData.gameNumber} - Deal {gameData.dealNumber} of {gameData.deals} - 
        Dealer {gameData.dealer} - {getVulnerabilityText(gameData.vulnerability)} - 
        Tokens {tokenBalance}
      </div>
      
      <div className="contract-summary">
        {confirmationData.contractString}
      </div>
      
      <div className="score-details">
        <div className="detail-row">
          <div className="detail-label">Tricks:</div>
          <div className="detail-value">{confirmationData.tricks}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Raw Score:</div>
          <div className="detail-value">{formatScore(confirmationData.rawScore)}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">HCP:</div>
          <div className="detail-value">{confirmationData.hcp}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Distribution:</div>
          <div className="detail-value">{confirmationData.distribution}</div>
        </div>
      </div>
      
      <div className="calculation-box">
        <h3>Score Calculation</h3>
        
        <div className="calculation-details">
          <div className="calc-row">
            <div className="calc-label">Raw Score:</div>
            <div className="calc-value">{formatScore(confirmationData.rawScore)}</div>
            <div className="calc-explanation">
              {confirmationData.rawScore < 0 ? 
                `(Penalty for down ${Math.abs(confirmationData.tricks - (6 + gameData.currentContract.level))})` :
                ''}
            </div>
          </div>
          
          {gameData.currentContract.penalties && Object.entries(gameData.currentContract.penalties).map(([key, value]) => (
            <div className="calc-row" key={key}>
              <div className="calc-label">{key}:</div>
              <div className="calc-value">{value}</div>
              <div className="calc-explanation">
                {key === 'Base Penalty' && 
                  `|${Math.abs(confirmationData.rawScore)}| + ${confirmationData.rawScore < 0 ? '10' : '0'} = ${value}`}
              </div>
            </div>
          ))}
          
          {gameData.currentContract.bonuses && Object.entries(gameData.currentContract.bonuses).map(([key, value]) => (
            <div className="calc-row" key={key}>
              <div className="calc-label">{key}:</div>
              <div className="calc-value">{value}</div>
              <div className="calc-explanation">
                {key === 'Defensive Bonus' && 
                  `Declarer ${gameData.currentContract.hcp} HCP vs Defenders ${gameData.currentContract.defenderHcp || 15} HCP`}
                {key === 'Level Penalty' && 'Part Score: +0'}
              </div>
            </div>
          ))}
          
          <div className="calc-total">
            {Object.values(gameData.currentContract.penalties || {}).reduce((sum, val) => sum + val, 0)} + {Object.values(gameData.currentContract.bonuses || {}).reduce((sum, val) => sum + val, 0)} = {confirmationData.finalScore}
          </div>
        </div>
        
        <div className="awarded-section">
          Awarded to: <span className="awarded-team">{confirmationData.awardedTo}</span>
        </div>
      </div>
      
      <div className="current-score-container">
        <h3>Current Score</h3>
        <div className="current-score">
          <div className="team-score">
            <div className="team-name">NS:</div>
            <div className="score-value">{gameData.scores['North-South']}</div>
          </div>
          <div className="team-score">
            <div className="team-name">EW:</div>
            <div className="score-value">{gameData.scores['East-West']}</div>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="secondary-button"
          onClick={handleAbandonGame}
        >
          ABANDON GAME
        </button>
        <button 
          className="primary-button"
          onClick={handleContinue}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default ScoreConfirmationPage;