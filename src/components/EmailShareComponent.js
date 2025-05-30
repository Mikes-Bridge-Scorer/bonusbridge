// src/components/EmailShareComponent.js

import React, { useState } from 'react';
import '../styles/EmailShareComponent.css'; // Make sure this path is correct

const EmailShareComponent = ({ gameData, onClose }) => {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState(`Bridge Game Results - Game ${gameData.gameNumber || 'ID'}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  
  // Your email to be used as BCC - using the provided email
  const yourEmail = "mike.calpe@gmail.com";

  // Function to generate email body with game results
  const generateEmailBody = () => {
    // Format scores
    const nsScore = gameData.scores && gameData.scores['North-South'] ? gameData.scores['North-South'] : 0;
    const ewScore = gameData.scores && gameData.scores['East-West'] ? gameData.scores['East-West'] : 0;
    const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
    const margin = Math.abs(nsScore - ewScore);
    
    // Generate a simple table of contracts
    let contractsTable = '';
    if (gameData.contracts && gameData.contracts.length > 0) {
      contractsTable = 'Deals:\n\n';
      contractsTable += 'Deal | Contract | By | Result | Points\n';
      contractsTable += '----- | -------- | --- | ------ | ------\n';
      
      gameData.contracts.forEach((contract, index) => {
        const level = contract.level || '';
        const suit = contract.suit || '';
        const doubled = contract.isDoubled ? ' X' : '';
        const redoubled = contract.isRedoubled ? ' XX' : '';
        const declarer = contract.declarer || '';
        
        const tricksNeeded = contract.tricksNeeded || (contract.level + 6);
        const tricksMade = contract.tricksMade || contract.tricksTaken || 0;
        const made = tricksMade >= tricksNeeded;
        const resultText = made 
          ? `Made ${tricksMade > tricksNeeded ? '+' + (tricksMade - tricksNeeded) : ''}`
          : `Down ${tricksNeeded - tricksMade}`;
          
        const points = contract.finalScore || contract.score || 0;
        
        contractsTable += `${index + 1} | ${level}${suit}${doubled}${redoubled} | ${declarer} | ${resultText} | ${points}\n`;
      });
    }
    
    // Format the email body
    const emailBody = `
Bridge Game Results

Game ${gameData.gameNumber || 'ID'}
${gameData.abandoned ? 'Game was abandoned before completion' : 'Game completed'}

Final Score:
North-South: ${nsScore} points
East-West: ${ewScore} points
${winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}

${contractsTable}

Generated by Bonus Bridge Scoring App
`;

    return emailBody;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);
    
    // Generate the email body if not already set
    const emailBody = message || generateEmailBody();
    
    // Create mailto link with BCC to your email
    const mailtoLink = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&bcc=${encodeURIComponent(yourEmail)}&body=${encodeURIComponent(emailBody)}`;
    
    // Attempt to open the email client
    try {
      window.location.href = mailtoLink;
      setIsSending(false);
      setSendResult({ success: true, message: 'Email client opened successfully.' });
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setIsSending(false);
      setSendResult({ success: false, message: `Error opening email client: ${error.message}` });
    }
  };

  return (
    <div className="email-share-overlay">
      <div className="email-share-container">
        <div className="email-share-header">
          <h2>Share Results via Email</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="email-form">
          <div className="form-group">
            <label htmlFor="recipients">Recipients:</label>
            <input 
              type="text" 
              id="recipients" 
              value={recipients} 
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject:</label>
            <input 
              type="text" 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave blank to use auto-generated game summary"
              rows={10}
            />
          </div>
          
          {message === '' && (
            <div className="preview-section">
              <h3>Preview:</h3>
              <pre className="email-preview">{generateEmailBody()}</pre>
            </div>
          )}
          
          <div className="button-group">
            <button 
              type="button" 
              className="generate-button" 
              onClick={() => setMessage(generateEmailBody())}
            >
              Generate Content
            </button>
            <button 
              type="submit" 
              className="send-button"
              disabled={isSending || !recipients}
            >
              {isSending ? 'Opening Email Client...' : 'Send Email'}
            </button>
          </div>
        </form>
        
        {sendResult && (
          <div className={`result-message ${sendResult.success ? 'success' : 'error'}`}>
            {sendResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailShareComponent;