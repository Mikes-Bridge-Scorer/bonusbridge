// C:/bridge-scorer/bonusbridge/src/pages/ContractInputPage.js - Edit button removed

import React, { useState, useEffect } from 'react';
import './ContractInputPage.css';

const ContractInputPage = ({ gameData, setGameData, onNext }) => {
  const [bid, setBid] = useState(null);
  const [suit, setSuit] = useState(null);
  const [declarer, setDeclarer] = useState(null);
  const [isDoubled, setIsDoubled] = useState(false);
  const [isRedoubled, setIsRedoubled] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [contractSummary, setContractSummary] = useState('');

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
  }, []);

  useEffect(() => {
    // Update contract summary
    if (bid !== null && suit !== null && declarer !== null) {
      let summary = `${bid} ${suit} by ${declarer}`;
      if (isDoubled) summary += ' Doubled';
      if (isRedoubled) summary += ' Redoubled';
      setContractSummary(summary);
    } else {
      setContractSummary('');
    }
  }, [bid, suit, declarer, isDoubled, isRedoubled]);

  const handleSubmit = () => {
    if (bid === null || suit === null || declarer === null) {
      alert('Please fill in all contract details');
      return;
    }

    // Create contract object
    const contract = {
      level: bid,
      suit,
      declarer,
      isDoubled,
      isRedoubled,
      vulnerability: gameData.vulnerability
    };

    // Save to game data
    setGameData(prevData => ({
      ...prevData,
      currentContract: contract
    }));

    // Save to localStorage for persistence
    localStorage.setItem('currentBridgeContract', JSON.stringify(contract));

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

  return (
    <div className="contract-input-container">
      <div className="header">ENTER CONTRACT</div>
      
      <div className="game-info">
        Game {gameData.gameNumber} - Deal {gameData.dealNumber} of {gameData.deals} - 
        Dealer {gameData.dealer} - {getVulnerabilityText(gameData.vulnerability)} - 
        Tokens {tokenBalance}
      </div>

      <div className="contract-section">
        <h3>Bid</h3>
        <div className="bid-grid">
          {[1, 2, 3, 4, 5, 6, 7].map(level => (
            <button 
              key={`bid-${level}`}
              className={`bid-button ${bid === level ? 'selected' : ''}`}
              onClick={() => setBid(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="contract-section">
        <h3>Suit</h3>
        <div className="suit-grid">
          <button 
            className={`suit-button ${suit === '♣' ? 'selected' : ''}`}
            onClick={() => setSuit('♣')}
          >
            ♣
          </button>
          <button 
            className={`suit-button diamond ${suit === '♦' ? 'selected' : ''}`}
            onClick={() => setSuit('♦')}
          >
            ♦
          </button>
          <button 
            className={`suit-button heart ${suit === '♥' ? 'selected' : ''}`}
            onClick={() => setSuit('♥')}
          >
            ♥
          </button>
          <button 
            className={`suit-button spade ${suit === '♠' ? 'selected' : ''}`}
            onClick={() => setSuit('♠')}
          >
            ♠
          </button>
          <button 
            className={`suit-button ${suit === 'NT' ? 'selected' : ''}`}
            onClick={() => setSuit('NT')}
          >
            NT
          </button>
        </div>
      </div>

      <div className="contract-section">
        <h3>Declarer</h3>
        <div className="declarer-grid">
          <button 
            className={`declarer-button ${declarer === 'North' ? 'selected' : ''}`}
            onClick={() => setDeclarer('North')}
          >
            North
          </button>
          <button 
            className={`declarer-button ${declarer === 'East' ? 'selected' : ''}`}
            onClick={() => setDeclarer('East')}
          >
            East
          </button>
          <button 
            className={`declarer-button ${declarer === 'South' ? 'selected' : ''}`}
            onClick={() => setDeclarer('South')}
          >
            South
          </button>
          <button 
            className={`declarer-button ${declarer === 'West' ? 'selected' : ''}`}
            onClick={() => setDeclarer('West')}
          >
            West
          </button>
        </div>
      </div>

      <div className="contract-section">
        <h3>Doubled?</h3>
        <div className="doubled-grid">
          <button 
            className={`doubled-button ${!isDoubled && !isRedoubled ? 'selected' : ''}`}
            onClick={() => {
              setIsDoubled(false);
              setIsRedoubled(false);
            }}
          >
            No
          </button>
          <button 
            className={`doubled-button ${isDoubled && !isRedoubled ? 'selected' : ''}`}
            onClick={() => {
              setIsDoubled(true);
              setIsRedoubled(false);
            }}
          >
            Doubled
          </button>
          <button 
            className={`doubled-button ${isRedoubled ? 'selected' : ''}`}
            onClick={() => {
              setIsDoubled(true);
              setIsRedoubled(true);
            }}
          >
            Redoubled
          </button>
        </div>
      </div>

      {contractSummary && (
        <div className="contract-summary">
          {contractSummary}
        </div>
      )}

      <div className="button-container">
        <button 
          className="primary-button"
          onClick={handleSubmit}
          disabled={bid === null || suit === null || declarer === null}
          style={{width: '100%', maxWidth: '300px', margin: '0 auto'}}
        >
          Submit Contract
        </button>
      </div>
    </div>
  );
};

export default ContractInputPage;