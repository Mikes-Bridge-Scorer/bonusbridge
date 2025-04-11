// C:/bridge-scorer/bonusbridge/src/pages/ScoreAdjustmentPage.js

import React, { useState, useEffect } from 'react';
import './ScoreAdjustmentPage.css';

const ScoreAdjustmentPage = ({ gameData, setGameData, onNext }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [hcp, setHcp] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    // Load token balance
    const userData = localStorage.getItem('bonusBridgeUser');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const storedBalance = parsedData.tokenBalance || 0;
        setTokenBalance(storedBalance);
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
        
        // Pre-populate HCP and distribution from contract if they exist
        if (parsedContract.hcp !== undefined) {
          setHcp(parsedContract.hcp);
        }
        
        if (parsedContract.distribution !== undefined) {
          setDistribution(parsedContract.distribution);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing contract data:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleContinue = () => {
    if (hcp === null || distribution === null) {
      alert('Please enter HCP and Distribution points');
      return;
    }

    try {
      // Update contract with HCP and Distribution
      const updatedContract = {
        ...contract,
        hcp,
        distribution
      };

      // Store in localStorage
      localStorage.setItem('currentBridgeContract', JSON.stringify(updatedContract));

      // Update game data
      setGameData(prevData => {
        const newData = {
          ...prevData,
          currentContract: updatedContract
        };
        return newData;
      });
      
      // Move to next page
      onNext();
    } catch (error) {
      console.error("Error in handleContinue:", error);
      alert("An error occurred: " + error.message);
    }
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
      <div className="container">
        <div className="score-adjustment-container">
          <div className="header">SCORE ADJUSTMENT PAGE</div>
          <div className="game-info">Loading...</div>
        </div>
      </div>
    );
  }

  // Render error state if no contract
  if (!contract) {
    return (
      <div className="container">
        <div className="score-adjustment-container">
          <div className="header">SCORE ADJUSTMENT PAGE</div>
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
      </div>
    );
  }

  return (
    <div className="container">
      <div className="score-adjustment-container">
        <div className="header">SCORE ADJUSTMENT PAGE</div>
        
        <div className="game-info">
          Game {gameData.gameNumber} - Deal {gameData.dealNumber} of {gameData.deals} - 
          Dealer {gameData.dealer} - {getVulnerabilityText(gameData.vulnerability)} - 
          Tokens {tokenBalance}
        </div>
        
        <div className="contract-display">
          {contract.level} {contract.suit} by {contract.declarer} {contract.isDoubled ? '(Doubled)' : ''} - Raw score: {contract.rawScore}
        </div>

        <div className="point-section">
          <h3>Add Declarer + Dummy HCP</h3>
          <div className="point-grid">
            {[...Array(38)].map((_, i) => (
              <button
                key={i}
                className={`point-button ${hcp === i ? 'selected' : ''}`}
                onClick={() => setHcp(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        
        <div className="point-section">
          <h3>Add Declarer + Dummy Distribution Points</h3>
          <p className="point-formula">Doubleton=1, Singleton=2, Void=3</p>
          <div className="point-grid-smaller">
            {[...Array(14)].map((_, i) => (
              <button
                key={i}
                className={`point-button ${distribution === i ? 'selected' : ''}`}
                onClick={() => setDistribution(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        
        <div className="points-summary">
          <div className="point-row">
            <span>High Card Points:</span>
            <span>{hcp !== null ? hcp : '-'}</span>
          </div>
          <div className="point-row">
            <span>Distribution Points:</span>
            <span>{distribution !== null ? distribution : '-'}</span>
          </div>
        </div>
        
        <div className="button-container">
          <button 
            className="secondary-button"
            onClick={() => window.history.back()}
          >
            EDIT
          </button>
          <button 
            className="primary-button"
            onClick={handleContinue}
            disabled={hcp === null || distribution === null}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreAdjustmentPage;