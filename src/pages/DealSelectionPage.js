// C:/bridge-scorer/bonusbridge/src/pages/DealSelectionPage.js

import React, { useState, useEffect } from 'react';
import './DealSelectionPage.css';

const DealSelectionPage = ({ gameSettings, setGameSettings, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState({
    deals: 0,
    tokens: 0,
    time: '',
    remainingTokens: 0
  });

  // Options for the deal selection
  const options = [
    { id: 1, deals: 10, tokens: 40, time: '1 hr 40 min' },
    { id: 2, deals: 12, tokens: 48, time: '1 hr 50 min' },
    { id: 3, deals: 14, tokens: 56, time: '1 hr 55 min' },
    { id: 4, deals: 16, tokens: 64, time: '2 hrs' },
    { id: 5, deals: 20, tokens: 80, time: '2 hrs 30 min' },
    { id: 6, deals: 24, tokens: 96, time: '3 hrs' }
  ];

  // Load token balance from localStorage and clear any stale session data
  useEffect(() => {
    console.log("DealSelectionPage mounted - clearing any stale sessionStorage data");
    
    // Reset global game state on mount
    window.BRIDGE_GAME_STATE.selectedDeals = null;
    
    // Clear sessionStorage to start fresh
    sessionStorage.clear();
    localStorage.removeItem('selectedDealsCount');
    
    console.log("Cleared stale session data");
    
    // Load token balance
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
  }, []);

  // Handle option selection
  const handleOptionSelect = (option) => {
    console.log("Option clicked:", option.id);
    console.log("Option details:", option);
    console.log("Current tokens:", tokenBalance);
    
    setSelectedOption(option);
    
    // Show confirmation dialog with details
    if (tokenBalance >= option.tokens) {
      setConfirmationDetails({
        deals: option.deals,
        tokens: option.tokens,
        time: option.time,
        remainingTokens: tokenBalance - option.tokens
      });
      setShowConfirmation(true);
    } else {
      alert(`Not enough tokens. You need ${option.tokens} tokens but have ${tokenBalance}.`);
    }
  };

  // Handle confirmation
  const handleConfirm = () => {
    console.log("Confirming selection with deal count:", confirmationDetails.deals);
    
    // EMERGENCY FIX: Store in multiple places
    sessionStorage.clear(); // Clear first
    
    // Store deal count in multiple locations
    sessionStorage.setItem('currentSessionDealsCount', confirmationDetails.deals.toString());
    localStorage.setItem('selectedDealsCount', confirmationDetails.deals.toString());
    
    // Store in global variable as a fallback
    window.BRIDGE_GAME_STATE.selectedDeals = confirmationDetails.deals;
    
    console.log("Deal count stored in multiple locations:", confirmationDetails.deals);
    console.log("Verification - Values stored:");
    console.log("- sessionStorage:", sessionStorage.getItem('currentSessionDealsCount'));
    console.log("- localStorage:", localStorage.getItem('selectedDealsCount'));
    console.log("- global variable:", window.BRIDGE_GAME_STATE.selectedDeals);
    
    // Update token balance in localStorage
    const userData = localStorage.getItem('bonusBridgeUser');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        parsedData.tokenBalance = confirmationDetails.remainingTokens;
        localStorage.setItem('bonusBridgeUser', JSON.stringify(parsedData));
        console.log("Updated token balance:", confirmationDetails.remainingTokens);
        setTokenBalance(confirmationDetails.remainingTokens);
      } catch (error) {
        console.error("Error updating token balance:", error);
      }
    }
    
    // Update game settings
    setGameSettings({
      deals: confirmationDetails.deals,
      tokens: confirmationDetails.tokens,
      time: confirmationDetails.time
    });
    
    // Close confirmation dialog
    setShowConfirmation(false);
    
    // Navigate to next page - with a delay to ensure state updates are complete
    console.log("Navigating to next page");
    setTimeout(() => {
      onNext();
    }, 100); // Short delay to ensure state updates complete
  };

  return (
    <div className="deal-selection-container">
      <h2>Select Deals</h2>
      
      <div className="selection-info">
        <p>How many deals for this game?</p>
        <div className="token-info">
          <div className="token-icon">🪙</div>
          <div className="token-details">
            <p className="token-balance">{tokenBalance} Tokens available</p>
            <p className="token-rate">4 tokens per deal</p>
          </div>
        </div>
      </div>
      
      <div className="options-grid">
        {options.map(option => (
          <div 
            key={option.id} 
            className={`option-card ${selectedOption?.id === option.id ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="deal-count">{option.deals}</div>
            <div className="token-count">{option.tokens} tokens</div>
            <div className="time-estimate">{option.time}</div>
          </div>
        ))}
      </div>
      
      <div className="action-buttons">
        <button 
          className="confirm-button"
          onClick={handleConfirm}
          disabled={!selectedOption}
        >
          Confirm
        </button>
        <button className="cancel-button">
          Cancel
        </button>
      </div>
      
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Selection</h3>
            <p>
              You have selected {confirmationDetails.deals} deals which will take approximately {confirmationDetails.time} and use {confirmationDetails.tokens} tokens, leaving you with {confirmationDetails.remainingTokens} tokens.
            </p>
            <div className="confirmation-buttons">
              <button 
                className="confirm-button"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmation(false)}
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

export default DealSelectionPage;