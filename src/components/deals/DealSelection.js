// C:/bridge-scorer/bonusbridge/src/components/deals/DealSelection.js

import React, { useState, useEffect } from 'react';
// Use standard import instead of decorator-style import
import '../../styles/components/DealSelection.css';

const DealSelection = ({ availableTokens = 0, tokensPerDeal = 4, onConfirm, onCancel }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentTokens, setCurrentTokens] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDealOption, setSelectedDealOption] = useState(null);

  // Update currentTokens whenever availableTokens changes
  useEffect(() => {
    console.log("Available tokens updated:", availableTokens);
    setCurrentTokens(availableTokens);
    
    // Force token update from localStorage if needed
    if (availableTokens === 0) {
      const userData = localStorage.getItem('bonusBridgeUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.tokenBalance) {
            console.log("Found token balance in localStorage:", user.tokenBalance);
            setCurrentTokens(user.tokenBalance);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, [availableTokens]);

  const dealOptions = [
    { id: 1, deals: 10, tokens: 40, time: '1 hr 40 min' },
    { id: 2, deals: 12, tokens: 48, time: '1 hr 50 min' },
    { id: 3, deals: 14, tokens: 56, time: '1 hr 55 min' },
    { id: 4, deals: 16, tokens: 64, time: '2 hrs' },
    { id: 5, deals: 20, tokens: 80, time: '2 hrs 30 min' },
    { id: 6, deals: 24, tokens: 96, time: '3 hrs' }
  ];

  // Handle option click with more logging
  const handleOptionClick = (optionId) => {
    console.log("Option clicked:", optionId);
    const option = dealOptions.find(option => option.id === optionId);
    console.log("Option details:", option);
    console.log("Current tokens:", currentTokens);
    
    if (option) {
      if (option.tokens <= currentTokens) {
        console.log("Setting selected option to:", optionId);
        setSelectedOption(optionId);
      } else {
        console.log("Not enough tokens for this option");
        alert(`You need ${option.tokens} tokens for this option, but you only have ${currentTokens} tokens.`);
      }
    }
  };

  const handleConfirmClick = () => {
    if (selectedOption !== null) {
      const option = dealOptions.find(option => option.id === selectedOption);
      if (option && option.tokens <= currentTokens) {
        setSelectedDealOption(option);
        setShowConfirmation(true);
      } else {
        alert('You do not have enough tokens for this option.');
      }
    } else {
      alert('Please select a number of deals first.');
    }
  };

  const handleConfirmationYes = () => {
    setShowConfirmation(false);
    if (selectedDealOption) {
      onConfirm(selectedDealOption);
    }
  };

  const handleConfirmationNo = () => {
    setShowConfirmation(false);
    // Keep the selection, just close the confirmation dialog
  };

  return (
    <div className="deal-selection-container">
      <div className="card">
        <div className="card-header">
          <h2>Select Deals</h2>
          <p>How many deals for this game?</p>
        </div>

        <div className="tokens-info">
          <div className="token-icon">🪙</div>
          <div className="token-details">
            <div className="token-available">{currentTokens} Tokens available</div>
            <div className="token-rate">{tokensPerDeal} tokens per deal</div>
          </div>
        </div>

        <div className="deal-options-grid">
          {dealOptions.map(option => (
            <div 
              key={option.id}
              className={`deal-option ${selectedOption === option.id ? 'selected' : ''} ${option.tokens > currentTokens ? 'disabled' : ''}`}
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="deal-number">{option.deals}</div>
              <div className="token-cost">{option.tokens} tokens</div>
              <div className="time-estimate">{option.time}</div>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleConfirmClick}
            disabled={selectedOption === null}
          >
            Confirm
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedDealOption && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Selection</h3>
            <p>
              You have selected <span className="highlight">{selectedDealOption.deals} deals</span> which will take approximately <span className="highlight">{selectedDealOption.time}</span> and use <span className="highlight">{selectedDealOption.tokens} tokens</span>, leaving you with <span className="highlight">{currentTokens - selectedDealOption.tokens} tokens</span>.
            </p>
            <div className="confirmation-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleConfirmationYes}
              >
                Confirm
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleConfirmationNo}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealSelection;