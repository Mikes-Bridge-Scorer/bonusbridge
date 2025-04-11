// C:/bridge-scorer/bonusbridge/src/pages/ScorerCredentialsPage.js

import React from 'react';
import ScorerCredentials from '../components/auth/ScorerCredentials';

const ScorerCredentialsPage = ({ onNext }) => {
  // Handle saving credentials
  const handleSaveCredentials = (credentials) => {
    console.log('Credentials saved:', credentials);
    
    // Store or update user data in localStorage
    localStorage.setItem('bonusBridgeUser', JSON.stringify({
      firstName: credentials.firstName,
      email: credentials.email,
      tokenBalance: credentials.bonusTokens
    }));
  };
  
  // Handle player invitations
  const handleInvitePlayers = (players) => {
    console.log('Players to invite:', players);
    
    // Store player information
    localStorage.setItem('bonusBridgePlayers', JSON.stringify(players));
    
    // After all operations complete, move to the next screen
    if (onNext) {
      onNext();
    }
  };
  
  return (
    <div className="container">
      <ScorerCredentials 
        onSaveCredentials={handleSaveCredentials}
        onInvitePlayers={handleInvitePlayers}
      />
    </div>
  );
};

export default ScorerCredentialsPage;