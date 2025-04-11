// C:/bridge-scorer/bonusbridge/src/components/auth/ScorerCredentials.js

import React, { useState, useRef, useEffect } from 'react';
import './ScorerCredentials.css';

const ScorerCredentials = ({ onSaveCredentials, onInvitePlayers }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [activationCode, setActivationCode] = useState(['', '', '', '', '', '', '']);
  const [codeError, setCodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [bonusTokens, setBonusTokens] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [showCodeError, setShowCodeError] = useState(false);
  const [activeDirection, setActiveDirection] = useState('East');
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [usedCodes, setUsedCodes] = useState([]);
  const [allPlayersValid, setAllPlayersValid] = useState(false);
  const [players, setPlayers] = useState({
    East: { name: '', email: '' },
    South: { name: '', email: '' },
    West: { name: '', email: '' },
    North: { name: '', email: '' }  // North will be set to the scorer
  });
  
  // Add a notification for "Save Credentials" requirement
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  
  const MINIMUM_TOKENS_REQUIRED = 40; // Minimum tokens needed for the cheapest game option
  
  const codeInputRefs = useRef([]);

  // On component mount, check for returning user and load token balance
  useEffect(() => {
    // Check if user has played before
    const storedUser = localStorage.getItem('bonusBridgeUser');
    const storedCodes = localStorage.getItem('bonusBridgeUsedCodes');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsReturningUser(true);
        setTokenBalance(user.tokenBalance || 0);
        
        // Pre-fill scorer information for returning users
        setFirstName(user.firstName || '');
        setEmail(user.email || '');
        
        if (user.firstName && user.email) {
          setCredentialsSaved(true);
          
          // Set North player to the scorer
          setPlayers(prev => ({
            ...prev,
            North: { name: user.firstName, email: user.email }
          }));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    if (storedCodes) {
      try {
        setUsedCodes(JSON.parse(storedCodes));
      } catch (error) {
        console.error("Error parsing used codes:", error);
        localStorage.setItem('bonusBridgeUsedCodes', JSON.stringify([]));
      }
    } else {
      // Initialize empty array for used codes
      localStorage.setItem('bonusBridgeUsedCodes', JSON.stringify([]));
    }
    
    // Load stored players if available
    const storedPlayers = localStorage.getItem('bonusBridgePlayers');
    if (storedPlayers) {
      try {
        const loadedPlayers = JSON.parse(storedPlayers);
        setPlayers(loadedPlayers);
      } catch (error) {
        console.error("Error parsing players data:", error);
      }
    }
    
    // Initialize players data in localStorage if not already present
    if (!localStorage.getItem('bonusBridgePlayers')) {
      const initialPlayers = {
        East: { name: '', email: '' },
        South: { name: '', email: '' },
        West: { name: '', email: '' },
        North: { name: '', email: '' }
      };
      localStorage.setItem('bonusBridgePlayers', JSON.stringify(initialPlayers));
    }
  }, []);

  // Check player validation status whenever players state changes
  useEffect(() => {
    const valid = areAllPlayersRegistered();
    setAllPlayersValid(valid);
  }, [players, firstName, email, credentialsSaved]);

  // Get letter value (A=3, B=4, ..., Z=28)
  const getLetterValue = (letter) => {
    const letterUpper = letter.toUpperCase();
    if (letterUpper >= 'A' && letterUpper <= 'Z') {
      return letterUpper.charCodeAt(0) - 'A'.charCodeAt(0) + 3;
    }
    return 0;
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle code input changes
  const handleCodeChange = (index, value) => {
    console.log(`Handling input change at index ${index} with value: "${value}"`);
    
    if (value.length <= 1) {
      const newCode = [...activationCode];
      newCode[index] = value;
      setActivationCode(newCode);
      
      // Auto-advance to next input field
      if (value !== '' && index < 6) {
        codeInputRefs.current[index + 1]?.focus();
      }
      
      // Validate the code when all digits are entered
      if (newCode.every(digit => digit !== '')) {
        validateCode(newCode);
      }
    }
  };

  // Handle key press in code inputs
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && activationCode[index] === '' && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // Check if code has been used before (checking only first 6 characters)
  const isCodeUsed = (codeString) => {
    const firstSixChars = codeString.substring(0, 6);
    return usedCodes.some(code => code.substring(0, 6) === firstSixChars);
  };

  // Validate the entered code
  const validateCode = (code) => {
    // Ensure the last character is a number
    const lastChar = code[6];
    const chars = code.slice(0, 6);
    const codeString = code.join('');
    
    console.log("Validating code:", codeString);
    
    if (!/^\d$/.test(lastChar)) {
      setCodeError('Last character must be a number');
      setShowCodeError(true);
      return false; // Return false to indicate validation failed
    }
    
    // Check if all characters are valid
    if (!chars.every(char => /^[A-Za-z0-9]$/.test(char))) {
      setCodeError('First 6 characters must be letters or numbers');
      setShowCodeError(true);
      return false; // Return false to indicate validation failed
    }
    
    // Check if code has been used before (first 6 characters)
    if (isCodeUsed(codeString)) {
      setCodeError('This code has already been used');
      setShowCodeError(true);
      return false; // Return false to indicate validation failed
    }
    
    // Calculate the sum of values
    const sum = chars.reduce((total, char) => {
      if (/^[A-Za-z]$/.test(char)) {
        return total + getLetterValue(char);
      } else if (/^\d$/.test(char)) {
        return total + parseInt(char, 10);
      }
      return total;
    }, 0);
    
    console.log(`Code validation: Sum=${sum}, Multiplier=${lastChar}`);
    
    // Special code for app reset (sum is exactly 99)
    if (sum === 99) {
      console.log("Reset code detected");
      const confirmReset = window.confirm('Do you want to reset the app? This will clear all data and start fresh.');
      if (confirmReset) {
        localStorage.clear();
        window.location.reload();
      }
      
      // Add code to used codes list after processing it
      const updatedUsedCodes = [...usedCodes, codeString];
      setUsedCodes(updatedUsedCodes);
      localStorage.setItem('bonusBridgeUsedCodes', JSON.stringify(updatedUsedCodes));
      
      return false; // Return false since no tokens were added
    }
    
    // Add code to used codes list AFTER validating it's a correct code
    const updatedUsedCodes = [...usedCodes, codeString];
    setUsedCodes(updatedUsedCodes);
    localStorage.setItem('bonusBridgeUsedCodes', JSON.stringify(updatedUsedCodes));
    
    // Multiply by the last number
    const multiplier = parseInt(lastChar, 10);
    
    // Set tokens based on the multiplier × 100
    const tokens = multiplier * 100;
    setBonusTokens(tokens);
    setTokenBalance(prevBalance => prevBalance + tokens);
    setCodeError('');
    setShowCodeError(false);
    
    // Update token balance in localStorage
    try {
      const userData = localStorage.getItem('bonusBridgeUser');
      if (userData) {
        const user = JSON.parse(userData);
        user.tokenBalance = (user.tokenBalance || 0) + tokens;
        localStorage.setItem('bonusBridgeUser', JSON.stringify(user));
      }
    } catch (error) {
      console.error("Error updating token balance:", error);
    }
    
    console.log(`Code validation: Sum=${sum}, Multiplier=${multiplier}, Tokens=${tokens}`);
    return true; // Return true to indicate validation passed
  };

  // Handle direction selection
  const handleDirectionClick = (direction) => {
    if (direction !== 'North') { // Prevent changing North as it's the scorer
      setActiveDirection(direction);
    }
  };

  // Handle player info changes
  const handlePlayerChange = (field, value) => {
    // Check if credentials are saved first
    if (!credentialsSaved) {
      setShowSaveReminder(true);
    }
    
    // Email validation for player emails
    if (field === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError(`Please enter a valid email address for ${activeDirection}`);
      } else {
        setEmailError('');
      }
    }
    
    // Update players object with the new value
    const updatedPlayers = {
      ...players,
      [activeDirection]: {
        ...players[activeDirection],
        [field]: value
      }
    };
    
    // Save to state
    setPlayers(updatedPlayers);
    
    // Save to localStorage immediately to persist changes
    localStorage.setItem('bonusBridgePlayers', JSON.stringify(updatedPlayers));
  };

  // Save credentials
  const handleSaveCredentials = () => {
    if (firstName && email) {
      // Email validation
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      
      setEmailError('');
      
      // Developer recognition
      if (email.toLowerCase() === 'mike.calpe@gmail.com' && firstName.toLowerCase() === 'mike') {
        const confirmClear = window.confirm('Developer recognized. Would you like to clear local storage for testing?');
        if (confirmClear) {
          localStorage.clear();
          window.location.reload();
          return;
        }
      } 
      // Check for returning user with different credentials
      else if (isReturningUser) {
        const storedUser = JSON.parse(localStorage.getItem('bonusBridgeUser'));
        if (storedUser && (storedUser.email.toLowerCase() !== email.toLowerCase() || 
            storedUser.firstName.toLowerCase() !== firstName.toLowerCase())) {
          alert('Credentials not recognized. Please contact the developer at mike.calpe@gmail.com');
          return;
        }
      }
      
      setCredentialsSaved(true);
      setShowSaveReminder(false); // Hide reminder once saved
      
      // Set North player to the scorer
      const updatedPlayers = {
        ...players,
        North: { name: firstName, email: email }
      };
      
      setPlayers(updatedPlayers);
      
      // Save updated players to localStorage
      localStorage.setItem('bonusBridgePlayers', JSON.stringify(updatedPlayers));
      
      // Save user info and token balance
      const userData = {
        firstName,
        email,
        tokenBalance: tokenBalance + bonusTokens
      };
      
      localStorage.setItem('bonusBridgeUser', JSON.stringify(userData));
      
      onSaveCredentials({
        firstName,
        email,
        bonusTokens: tokenBalance + bonusTokens
      });
    }
  };

  // Reset the players data
  const resetPlayersData = () => {
    // Reset to initial state
    const initialPlayers = {
      East: { name: '', email: '' },
      South: { name: '', email: '' },
      West: { name: '', email: '' },
      North: { name: firstName, email: email } // Keep the scorer's info
    };
    
    setPlayers(initialPlayers);
    localStorage.setItem('bonusBridgePlayers', JSON.stringify(initialPlayers));
  };

  // Check if all required players are registered with valid emails
  const areAllPlayersRegistered = () => {
    // For this implementation, we'll only require East, South, and West
    // (plus the scorer as North which we'll check separately)
    const requiredDirections = ['East', 'South', 'West'];
    
    // Make sure scorer info is valid first
    const isNorthValid = 
      firstName && 
      firstName.trim() !== '' && 
      email && 
      email.trim() !== '' && 
      validateEmail(email) && 
      credentialsSaved;
    
    if (!isNorthValid) {
      console.log("North (scorer) validation failed:", { firstName, email, credentialsSaved });
      return false;
    }
    
    // Check that all required player directions have valid info
    const allValid = requiredDirections.every(direction => {
      const player = players[direction];
      const isValid = player && 
                     player.name && 
                     player.name.trim() !== '' && 
                     player.email && 
                     player.email.trim() !== '' && 
                     validateEmail(player.email);
      
      // Log each direction's validation result
      console.log(`Direction ${direction} valid:`, isValid, player);
      
      return isValid;
    });
    
    // Return final result
    console.log("All players registered:", allValid);
    return allValid;
  };

  // Handle request for more tokens
  const handleRequestMoreTokens = () => {
    const subject = 'Request for More Bonus Bridge Tokens';
    const body = `Hello,\n\nI would like to request more tokens for Bonus Bridge.\n\nUser: ${firstName}\nEmail: ${email}\nCurrent Token Balance: ${tokenBalance}\n\nThank you.`;
    
    window.location.href = `mailto:mike.calpe@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Submit player invitations
  const handleSubmitPlayers = () => {
    // Check if credentials are saved first
    if (!credentialsSaved) {
      alert('Please save your credentials first');
      setShowSaveReminder(true);
      return;
    }
    
    // Check for minimum token requirement
    if (tokenBalance < MINIMUM_TOKENS_REQUIRED) {
      alert(`You need at least ${MINIMUM_TOKENS_REQUIRED} tokens to play. You currently have ${tokenBalance} tokens. Please enter a code or get more tokens.`);
      return;
    }
    
    // Make sure North player is set to the scorer
    const updatedPlayers = {
      ...players,
      North: { name: firstName, email: email }
    };
    
    // Set players state to ensure North is included
    setPlayers(updatedPlayers);
    
    // Check if any of the required players are missing valid info
    const requiredDirections = ['East', 'South', 'West'];
    const missingInfo = requiredDirections.filter(direction => {
      const player = updatedPlayers[direction];
      return !player || !player.name || player.name.trim() === '' || !player.email || !validateEmail(player.email);
    });
    
    if (missingInfo.length > 0) {
      alert(`Please complete registration for: ${missingInfo.join(', ')}`);
      return;
    }
    
    // Save updated players info
    localStorage.setItem('bonusBridgePlayers', JSON.stringify(updatedPlayers));
    
    // Proceed with all players
    onInvitePlayers(updatedPlayers);
  };

  return (
    <div className="scorer-credentials-container">
      {/* Scorer Registration Section */}
      <div className="credentials-card">
        <h2>Scorer Credentials</h2>
        
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={credentialsSaved}
          />
        </div>
        
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={credentialsSaved}
          />
          {emailError && emailError.includes('Email') && <div className="error-message">{emailError}</div>}
        </div>
        
        <div className="token-balance">
          Token Balance: {tokenBalance}
          {tokenBalance < MINIMUM_TOKENS_REQUIRED && credentialsSaved && (
            <div className="token-warning">
              At least {MINIMUM_TOKENS_REQUIRED} tokens required to play
            </div>
          )}
        </div>
        
        <div className="bonus-info">
          If you have a code, enter it now to receive your tokens
        </div>
        
        <button 
          className="btn btn-primary btn-block"
          onClick={handleSaveCredentials}
          disabled={!firstName || !email || credentialsSaved}
        >
          Save Credentials
        </button>
        
        {/* Add a visual reminder to save credentials */}
        {!credentialsSaved && firstName && email && (
          <div className="reminder-message">
            Please click "Save Credentials" before continuing
          </div>
        )}
      </div>

      {/* Code Entry Section */}
      <div className="code-card">
        <h3>Enter your code here</h3>
        
        <div className="code-container">
          {activationCode.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (codeInputRefs.current[index] = el)}
              type="text"
              className="code-input"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>
        
        {showCodeError && (
          <div className="error-message">{codeError}</div>
        )}
        
        {bonusTokens > 0 && (
          <div className="success-message">
            {bonusTokens} tokens have been added to your account!
          </div>
        )}
        
        <button 
          className="btn btn-link get-tokens-btn"
          onClick={handleRequestMoreTokens}
        >
          Get more tokens
        </button>
      </div>

      {/* Player Invitation Section */}
      <div className="players-card">
        <h3>Invite Players</h3>
        <div className="player-instruction">All players are required to register</div>
        
        {/* Show save credentials reminder if they try to register players before saving credentials */}
        {showSaveReminder && !credentialsSaved && (
          <div className="save-reminder">
            Please save your credentials before registering players
          </div>
        )}
        
        <div className="direction-tabs">
          <button 
            className={`direction-tab ${activeDirection === 'East' ? 'active' : ''}`}
            onClick={() => handleDirectionClick('East')}
          >
            East
          </button>
          <button 
            className={`direction-tab ${activeDirection === 'South' ? 'active' : ''}`}
            onClick={() => handleDirectionClick('South')}
          >
            South
          </button>
          <button 
            className={`direction-tab ${activeDirection === 'West' ? 'active' : ''}`}
            onClick={() => handleDirectionClick('West')}
          >
            West
          </button>
        </div>
        
        <div className="player-form">
          <h4>{activeDirection} Player</h4>
          
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={players[activeDirection]?.name || ''}
              onChange={(e) => handlePlayerChange('name', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={players[activeDirection]?.email || ''}
              onChange={(e) => handlePlayerChange('email', e.target.value)}
            />
            {emailError && activeDirection && emailError.includes(activeDirection) && (
              <div className="error-message-large">{emailError}</div>
            )}
          </div>
        </div>
        
        <div className="button-row">
          <button 
            className={`btn btn-primary continue-btn ${allPlayersValid ? 'active' : ''}`}
            onClick={handleSubmitPlayers}
            disabled={!allPlayersValid}
          >
            Continue to Game
          </button>
          
          <button 
            className="btn btn-secondary reset-btn"
            onClick={resetPlayersData}
          >
            Reset Players
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScorerCredentials;