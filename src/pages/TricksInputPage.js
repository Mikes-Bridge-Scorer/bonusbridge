// C:/bridge-scorer/bonusbridge/src/pages/TricksInputPage.js - Edit button removed

import React, { useState, useEffect } from 'react';
import './TricksInputPage.css';

const TricksInputPage = ({ gameData, setGameData, onNext }) => {
  const [tricks, setTricks] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    // Load contract data
    const storedContractData = localStorage.getItem('currentBridgeContract');
    if (storedContractData) {
      try {
        const parsedContract = JSON.parse(storedContractData);
        setContract(parsedContract);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing contract data:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Calculate score whenever tricks or contract changes
  useEffect(() => {
    if (contract && tricks !== null) {
      const calculatedScore = calculateScore(contract, tricks);
      setScore(calculatedScore);
    }
  }, [tricks, contract]);

  // Basic bridge scoring calculation
  const calculateScore = (contract, tricksTaken) => {
    if (!contract || tricksTaken === null) return 0;

    const { level, suit, declarer, isDoubled, isRedoubled, vulnerability } = contract;
    const tricksNeeded = level + 6;
    const overtricks = Math.max(0, tricksTaken - tricksNeeded);
    const undertricks = Math.max(0, tricksNeeded - tricksTaken);
    
    // Is the declaring side vulnerable?
    const isVulnerable = 
      (vulnerability === 'Both') || 
      ((vulnerability === 'NS') && (declarer === 'North' || declarer === 'South')) ||
      ((vulnerability === 'EW') && (declarer === 'East' || declarer === 'West'));

    console.log("DEBUG - Vulnerability check:", { vulnerability, declarer, isVulnerable });

    // Made contract
    if (tricksTaken >= tricksNeeded) {
      let score = 0;
      
      // Basic trick score
      if (suit === '♣' || suit === '♦') {
        score += level * 20;
      } else if (suit === '♥' || suit === '♠') {
        score += level * 30;
      } else if (suit === 'NT') {
        score += 40 + (level - 1) * 30;
      }
      
      // Doubled/Redoubled
      if (isDoubled) score *= 2;
      if (isRedoubled) score *= 2; // x4 total
      
      // Game/Part-score bonuses
      if (score >= 100) {
        // Game bonus
        score += isVulnerable ? 500 : 300;
      } else {
        // Part-score bonus
        score += 50;
      }
      
      // Slam bonuses
      if (level === 6) {
        score += isVulnerable ? 750 : 500; // Small slam
      } else if (level === 7) {
        score += isVulnerable ? 1500 : 1000; // Grand slam
      }
      
      // Overtrick bonuses
      if (overtricks > 0) {
        if (!isDoubled && !isRedoubled) {
          // Undoubled overtricks
          if (suit === '♣' || suit === '♦') {
            score += overtricks * 20;
          } else {
            score += overtricks * 30;
          }
        } else if (isDoubled) {
          // Doubled overtricks
          score += isVulnerable ? overtricks * 200 : overtricks * 100;
        } else if (isRedoubled) {
          // Redoubled overtricks
          score += isVulnerable ? overtricks * 400 : overtricks * 200;
        }
      }
      
      // Double/Redouble bonus
      if (isDoubled) score += 50;
      if (isRedoubled) score += 100;
      
      return score;
    } else {
      // Down - negative score
      let score = 0;
      
      if (!isDoubled && !isRedoubled) {
        // Undoubled undertricks
        score = isVulnerable ? undertricks * 100 : undertricks * 50;
      } else if (isDoubled) {
        // Doubled undertricks
        if (isVulnerable) {
          // Vulnerable doubled undertricks
          score = 200 + (undertricks - 1) * 300; // First trick = 200, each additional = 300
        } else {
          // Non-vulnerable doubled undertricks - Updated to match official scoring
          if (undertricks === 1) {
            score = 100;
          } else if (undertricks <= 3) {
            score = 100 + (undertricks - 1) * 200; // First = 100, second & third = 200 each
          } else {
            score = 100 + 2 * 200 + (undertricks - 3) * 300; // First = 100, second & third = 200 each, rest = 300 each
          }
        }
      } else if (isRedoubled) {
        // Redoubled undertricks
        if (isVulnerable) {
          // Vulnerable redoubled undertricks
          score = 400 + (undertricks - 1) * 600; // First trick = 400, each additional = 600
        } else {
          // Non-vulnerable redoubled undertricks - Updated to match official scoring
          if (undertricks === 1) {
            score = 200;
          } else if (undertricks <= 3) {
            score = 200 + (undertricks - 1) * 400; // First = 200, second & third = 400 each
          } else {
            score = 200 + 2 * 400 + (undertricks - 3) * 600; // First = 200, second & third = 400 each, rest = 600 each
          }
        }
      }

      console.log("DEBUG - Undertrick calculation:", { undertricks, isVulnerable, isDoubled, isRedoubled, score });
      
      return -score; // Return negative score for undertricks
    }
  };

  const handleContinue = () => {
    if (tricks === null || !contract) {
      alert('Please select the number of tricks taken');
      return;
    }

    // Calculate required tricks
    const tricksNeeded = contract.level + 6;
    
    // Update contract with tricks data
    const updatedContract = {
      ...contract,
      tricksTaken: tricks,
      tricksNeeded,
      tricksMade: tricks - tricksNeeded,
      rawScore: score,
      score
    };

    // Save to game data
    setGameData(prevData => ({
      ...prevData,
      currentContract: updatedContract
    }));

    // Save to localStorage for persistence
    localStorage.setItem('currentBridgeContract', JSON.stringify(updatedContract));

    // Navigate to next page
    onNext();
  };

  const getVulnerabilityText = (vulnerability) => {
    switch(vulnerability) {
      case 'None': return 'None Vul';
      case 'NS': return 'NS Vul';
      case 'EW': return 'EW Vul';
      case 'Both': return 'All Vul';
      default: return 'None Vul';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="tricks-input-container">
        <div className="header">ENTER TRICKS MADE</div>
        <div className="game-info">Loading...</div>
      </div>
    );
  }

  // Render error state if no contract
  if (!contract) {
    return (
      <div className="tricks-input-container">
        <div className="header">ENTER TRICKS MADE</div>
        <div className="game-info">No contract data found</div>
        <div className="contract-display">
          <p>Error: Unable to load contract information</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="primary-button"
          style={{ margin: '20px auto', display: 'block' }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="tricks-input-container">
      <div className="header">ENTER TRICKS MADE</div>
      
      <div className="game-info">
        Game {gameData.gameNumber} - Deal {gameData.dealNumber} of {gameData.deals} - 
        Dealer {gameData.dealer} - {getVulnerabilityText(gameData.vulnerability)} - 
        Tokens {tokenBalance}
      </div>
      
      <div className="contract-display">
        Contract: {contract.level} {contract.suit} by {contract.declarer} {contract.isDoubled ? '(Doubled)' : ''} {contract.isRedoubled ? '(Redoubled)' : ''}
      </div>
      
      <div className="tricks-section">
        <h3>Please enter number of tricks made</h3>
        <div className="tricks-grid">
          {[...Array(14)].map((_, i) => (
            <button
              key={i}
              className={`tricks-button ${tricks === i ? 'selected' : ''}`}
              onClick={() => setTricks(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      
      {tricks !== null && (
        <div className="tricks-summary">
          <div className="tricks-count">{tricks} tricks</div>
          <div className="contract-result">
            {tricks >= (contract.level + 6) 
              ? `Contract made exactly ${tricks > (contract.level + 6) ? '+' + (tricks - (contract.level + 6)) : ''}` 
              : `Contract down ${(contract.level + 6) - tricks}`}
          </div>
          <div className="score-display">
            scoring {Math.abs(score)} to {score >= 0 
              ? (contract.declarer === 'North' || contract.declarer === 'South' ? 'North-South' : 'East-West')
              : (contract.declarer === 'North' || contract.declarer === 'South' ? 'East-West' : 'North-South')}
          </div>
        </div>
      )}
      
      <div className="hcp-hint">
        <h3>Now Count Your HCP and Distribution Points</h3>
        <div className="hint-content">
          <p>HCP - Combined total HCP Dummy + Declarer</p>
          <p>Distribution - Doubleton=1, Singleton=2, Void=3</p>
          <p>Long suits - 6 cards=1, 7 cards=2, 8 cards=3</p>
        </div>
      </div>
      
      <div className="button-container">
        <button 
          className="primary-button"
          onClick={handleContinue}
          disabled={tricks === null}
          style={{width: '100%', maxWidth: '300px', margin: '0 auto'}}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default TricksInputPage;