// src/components/EmailShareComponent.js

import React, { useState, useEffect } from 'react';

const EmailShareComponent = ({ gameData, onClose }) => {
  const [emailAddresses, setEmailAddresses] = useState('');
  const [subject, setSubject] = useState(`Bonus Bridge Game Results - Game ID: ${gameData.gameNumber}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [playerNames, setPlayerNames] = useState({
    N: 'North',
    E: 'East',
    S: 'South',
    W: 'West'
  });

  // Load player names from localStorage
  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem('bonusBridgePlayers');
      if (storedPlayers) {
        const players = JSON.parse(storedPlayers);
        setPlayerNames({
          N: players.North?.name || 'North',
          E: players.East?.name || 'East',
          S: players.South?.name || 'South',
          W: players.West?.name || 'West'
        });
        
        // Automatically populate email addresses
        let emails = [];
        if (players.North?.email) emails.push(players.North.email);
        if (players.East?.email) emails.push(players.East.email);
        if (players.South?.email) emails.push(players.South.email);
        if (players.West?.email) emails.push(players.West.email);
        
        setEmailAddresses(emails.join(', '));
      }
    } catch (error) {
      console.error("Error loading player data:", error);
    }
  }, []);

  // Generate the email content based on game data
  const generateEmailContent = () => {
    // Create a formatted date string
    const gameDate = new Date().toLocaleDateString();
    
    // Calculate the winner and margin
    const nsScore = gameData.scores['North-South'];
    const ewScore = gameData.scores['East-West'];
    const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
    const margin = Math.abs(nsScore - ewScore);
    
    // Build the email content
    let content = `
Bonus Bridge Game Results
------------------------
Game ID: ${gameData.gameNumber}
Date: ${gameDate}
Number of Deals: ${gameData.contracts.length}

Final Score:
North-South: ${nsScore} points
East-West: ${ewScore} points
${winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}

Deal Details:
`;

    // Add deal details
    gameData.contracts.forEach((contract, index) => {
      const isNS = contract.declarer === 'N' || contract.declarer === 'S';
      const declarer = playerNames[contract.declarer] || contract.declarer;
      
      content += `
Deal ${index + 1}: ${contract.level}${contract.suit || contract.strain}${contract.isDoubled || contract.doubled ? ' X' : ''}${contract.isRedoubled || contract.redoubled ? ' XX' : ''} by ${declarer}
Result: ${contract.tricksMade >= contract.tricksNeeded 
  ? `Made ${contract.tricksMade > contract.tricksNeeded ? '+' + (contract.tricksMade - contract.tricksNeeded) : ''}`
  : `Down ${contract.tricksNeeded - contract.tricksMade}`
}
Score: ${contract.rawScore || 0}
`;
    });
    
    content += `
------------------------
Visit Bonus Bridge at: www.bonusbridge.com
`;

    return content;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);
    
    // Generate email content
    const emailContent = generateEmailContent();
    
    // In a production app, you would send this to your backend
    // For demonstration, we'll use mailto: protocol to open the user's email client
    const mailtoLink = `mailto:${emailAddresses}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + '\n\n' + emailContent)}`;
    
    // Open the mailto link
    window.open(mailtoLink, '_blank');
    
    // Simulate success (in a real app, this would be the response from your email API)
    setTimeout(() => {
      setIsSending(false);
      setSendResult({ success: true, message: 'Email client opened with game results!' });
    }, 500);

    // Note: For a production app, you'd want a server-side solution:
    /*
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emailAddresses.split(',').map(email => email.trim()),
        subject,
        gameData,
        customMessage: message
      })
    })
    .then(response => response.json())
    .then(data => {
      setIsSending(false);
      setSendResult({ success: true, message: 'Results shared successfully!' });
    })
    .catch(error => {
      setIsSending(false);
      setSendResult({ success: false, message: 'Failed to share results. Please try again.' });
      console.error('Error sharing results:', error);
    });
    */
  };

  return (
    <div className="email-share-modal">
      <div className="email-share-content">
        <h2>Share Results via Email</h2>
        
        {sendResult ? (
          <div className={`share-result ${sendResult.success ? 'success' : 'error'}`}>
            <p>{sendResult.message}</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email-addresses">Recipient Email Addresses:</label>
              <input
                type="text"
                id="email-addresses"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                required
              />
              <small>Separate multiple addresses with commas</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="email-subject">Subject:</label>
              <input
                type="text"
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email-message">Additional Message (optional):</label>
              <textarea
                id="email-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows="4"
              ></textarea>
            </div>
            
            <div className="modal-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Results'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailShareComponent;