// C:/bridge-scorer/bonusbridge/src/pages/DealSelectionPage.js

import React, { useState, useEffect } from 'react';
import './DealSelectionPage.css'; // Make sure you have this CSS file

const DealSelectionPage = ({ gameSettings, setGameSettings, onNext }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Define available options directly in this component
  const options = [
    { id: 1, deals: 10, tokens: 40, time: '1 hr 40 min' },
    { id: 2, deals: 12, tokens: 48, time: '1 hr 50 min' },
    { id: 3, deals: 14, tokens: 56, time: '1 hr 55 min' },
    { id: 4, deals: 16, tokens: 64, time: '2 hrs' },
    { id: 5, deals: 20, tokens: 80, time: '2 hrs 30 min' },
    { id: 6, deals: 24, tokens: 96, time: '3 hrs' }
  ];

  // Load token balance on component mount
  useEffect(() => {
    loadTokenBalance();
  }, []);

  // Function to load token balance from localStorage
  const loadTokenBalance = () => {
    console.log("Loading token balance from localStorage:");
    const userData = localStorage.getItem('bonusBridgeUser');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const storedBalance = parsedData.tokenBalance || 0;
        console.log("Found token balance in localStorage:", storedBalance);
        setTokenBalance(storedBalance);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    console.log("Option clicked:", option.id);
    console.log("Option details:", option);
    console.log("Current tokens:", tokenBalance);
    setSelectedOption(option);
    setShowConfirmation(true);
  };

  // Handle confirmation
  const handleConfirm = () => {
    console.log("Confirming selection");
    if (selectedOption) {
      // Update game settings
      setGameSettings({
        deals: selectedOption.deals,
        tokens: selectedOption.tokens,
        time: selectedOption.time
      });
      
      // Update token balance in localStorage
      const userData = localStorage.getItem('bonusBridgeUser');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const newBalance = user.tokenBalance - selectedOption.tokens;
          user.tokenBalance = newBalance;
          localStorage.setItem('bonusBridgeUser', JSON.stringify(user));
          console.log("Updated token balance:", newBalance);
        } catch (error) {
          console.error("Error updating token balance:", error);
        }
      }
      
      // Close confirmation dialog
      setShowConfirmation(false);
      
      // Navigate to next page
      console.log("Navigating to next page");
      onNext();
    }
  };

  // Cancel confirmation
  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedOption(null);
  };

  return (
    <div className="container">
      <div className="deal-selection-container">
        <h2 className="deal-selection-title">Select Deals</h2>
        <div className="deal-instructions">
          How many deals for this game?
        </div>

        <div className="token-info">
          <div className="token-icon">🪙</div>
          <div className="token-details">
            <div className="token-balance">{tokenBalance} Tokens available</div>
            <div className="token-rate">4 tokens per deal</div>
          </div>
        </div>

        <div className="deal-options-grid">
          {options.map(option => (
            <div
              key={option.id}
              className={`deal-option ${selectedOption && selectedOption.id === option.id ? 'selected' : ''} ${option.tokens > tokenBalance ? 'disabled' : ''}`}
              onClick={() => option.tokens <= tokenBalance && handleOptionSelect(option)}
            >
              <div className="deal-count">{option.deals}</div>
              <div className="token-count">{option.tokens} tokens</div>
              <div className="time-estimate">{option.time}</div>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button 
            className="btn btn-primary confirm-btn"
            onClick={() => selectedOption && handleConfirm()}
            disabled={!selectedOption}
          >
            Confirm
          </button>
          
          <button className="btn btn-secondary cancel-btn" onClick={() => handleCancel()}>
            Cancel
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && selectedOption && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <div className="confirmation-content">
                <h3>Confirm Selection</h3>
                <p>
                  You have selected <strong>{selectedOption.deals} deals</strong> which will take
                  approximately <strong>{selectedOption.time}</strong> and use <strong>{selectedOption.tokens} tokens</strong>,
                  leaving you with <strong>{tokenBalance - selectedOption.tokens} tokens</strong>.
                </p>
                <div className="confirmation-buttons">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealSelectionPage;