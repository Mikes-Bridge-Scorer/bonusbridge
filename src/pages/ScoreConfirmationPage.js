// C:/bridge-scorer/bonusbridge/src/pages/ScoreConfirmationPage.js

import React, { useState, useEffect } from 'react';
import './ScoreConfirmationPage.css';

const ScoreConfirmationPage = ({ gameData, setGameData, onNext }) => {
  const [localContract, setLocalContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [calculatedScore, setCalculatedScore] = useState({
    points: 0,
    team: '',
    rawScore: 0,
    hcpAdjustment: 0,
    netScore: 0,
    initialPoints: 0,
    contractTypeAdjustments: 0,
    distributionAdjustment: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [scoresUpdated, setScoresUpdated] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Debug function to log important state
  const logDebugInfo = (stage, data) => {
    console.log(`[DEBUG ${stage}]`, data);
  };

  // Load contract and calculate scores only once on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Load token balance
        const userData = localStorage.getItem('bonusBridgeUser');
        if (userData && isMounted) {
          const parsedData = JSON.parse(userData);
          setTokenBalance(parsedData.tokenBalance || 0);
        }

        // Load contract data
        const storedContractData = localStorage.getItem('currentBridgeContract');
        if (storedContractData && isMounted) {
          const parsedContract = JSON.parse(storedContractData);
          logDebugInfo('Loaded Contract', parsedContract);
          setLocalContract(parsedContract);
          
          // Calculate scores immediately
          const score = calculateScoreFromContract(parsedContract);
          logDebugInfo('Calculated Score', score);
          setCalculatedScore(score);
        }

        if (isMounted) setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Update game scores once when scores are calculated
  useEffect(() => {
    if (localContract && calculatedScore.points && !scoresUpdated) {
      logDebugInfo('Before Update Scores', {
        localContract,
        calculatedScore,
        currentGameData: gameData
      });
      updateGameScores();
      setScoresUpdated(true);
    }
  }, [localContract, calculatedScore, scoresUpdated, gameData]);

  // Check if this is the final deal
  useEffect(() => {
    if (gameData && gameData.dealNumber && gameData.deals) {
      // Check if current deal is the last deal
      const isLastDeal = parseInt(gameData.dealNumber) >= parseInt(gameData.deals);
      console.log(`Deal ${gameData.dealNumber} of ${gameData.deals}, isLastDeal: ${isLastDeal}`);
      setIsGameComplete(isLastDeal);
    }
  }, [gameData]);

  // Helper function to check if contract is game or higher
  const isGameOrHigher = (level, suit) => {
    level = parseInt(level);
    
    // Any slam (6+ level)
    if (level >= 6) return true;
    
    // Game contracts based on suit
    if (suit === 'NT' && level >= 3) return true;           // 3NT+
    if ((suit === '♥' || suit === '♠') && level >= 4) return true;  // 4♥+ or 4♠+
    if ((suit === '♣' || suit === '♦') && level >= 5) return true;  // 5♣+ or 5♦+
    
    return false;
  };

  // Helper function to determine contract type (part score, game, small slam, grand slam)
  const getContractType = (level, suit) => {
    level = parseInt(level);
    if (level === 7) return 'grand slam';
    if (level === 6) return 'small slam';
    if (isGameOrHigher(level, suit)) return 'game';
    return 'part score';
  };

  // Helper to convert full direction names to single letters (for ResultsPage)
  const convertToDirectionLetter = (direction) => {
    switch (direction) {
      case 'North': return 'N';
      case 'East': return 'E';
      case 'South': return 'S';
      case 'West': return 'W';
      default: return direction; // Already a letter or unknown
    }
  };

  // Calculate score from contract according to revised rules
  const calculateScoreFromContract = (contract) => {
    if (!contract) {
      return {
        points: 0, team: 'No Team', rawScore: 0, hcp: 0, hcpAdjustment: 0,
        netScore: 0, initialPoints: 0, contractTypeAdjustments: 0, distributionAdjustment: 0
      };
    }

    const { level, suit, declarer, rawScore, hcp, distribution, tricksTaken } = contract;
    const isMade = rawScore > 0;
    const contractLevel = parseInt(level);
    const contractType = getContractType(contractLevel, suit);
    const isNT = suit === 'NT';
    const tricksRequired = contractLevel + 6; // Calculate tricks required to make contract
    const overtricks = Math.max(0, tricksTaken - tricksRequired); // Calculate overtricks
    
    console.log(`Contract: ${level} ${suit} by ${declarer}, Type: ${contractType}, Made: ${isMade}`);
    
    // Calculate scores differently for made vs defeated contracts
    if (isMade) {
      // 1. HCP Adjustment: (Total HCP - 24) × 15
      const hcpValue = hcp || 0;
      const hcpAdjustment = (hcpValue - 24) * 15;

      // 2. Net Score Calculation
      const netScore = rawScore - hcpAdjustment;

      // 3. Initial Points Calculation: Net Score ÷ 20
      const initialPoints = Math.max(1, Math.round(netScore / 20)); // Minimum 1 point

      // 4. Contract Type Adjustments
      let contractTypeAdjustments = 0;
      
      // Apply correct contract type adjustments based on contract type
      if (contractType === 'game') contractTypeAdjustments += 2;
      else if (contractType === 'small slam') contractTypeAdjustments += 4;
      else if (contractType === 'grand slam') contractTypeAdjustments += 6;
      // Part score has no adjustment (0)
      
      // NT bonus applies to all NT contracts
      if (isNT) contractTypeAdjustments += 1;
      
      // Overtrick bonuses
      if (overtricks >= 4 && overtricks < 7) contractTypeAdjustments += 1; // 4-6 overtricks
      if (overtricks >= 7) contractTypeAdjustments += 2; // 7+ overtricks

      // 5. Distribution Adjustment (only for suit contracts)
      let distributionAdjustment = 0;
      const distributionPoints = distribution || 0;
      if (!isNT) { // Only apply to suit contracts
        if (distributionPoints >= 3 && distributionPoints <= 4) distributionAdjustment = -1;
        else if (distributionPoints >= 5 && distributionPoints <= 6) distributionAdjustment = -2;
        else if (distributionPoints >= 7) distributionAdjustment = -3;
      }

      // Final Points Calculation
      const finalPoints = Math.max(1, Math.round(initialPoints + contractTypeAdjustments + distributionAdjustment));

      // Determine which team gets the points
      const scoringTeam = (declarer === 'North' || declarer === 'South') ? 'North-South' : 'East-West';

      return {
        points: finalPoints,
        team: scoringTeam,
        rawScore,
        hcp: hcpValue,
        hcpAdjustment,
        netScore,
        initialPoints,
        contractTypeAdjustments,
        distributionAdjustment,
        contractType // Add contract type to response for display
      };
    } else {
      // For defeated contracts:
      
      // 1. Base Penalty: |Raw Score| ÷ 10
      const basePenalty = Math.round(Math.abs(rawScore) / 10);
      
      // 2. Contract Level Penalties
      let levelPenalty = 0;
      if (contractType === 'game') levelPenalty = 3;
      else if (contractType === 'small slam') levelPenalty = 5;
      else if (contractType === 'grand slam') levelPenalty = 7;
      
      // 3. Final Score: Ensure minimum penalty of 3 points
      const finalPoints = Math.max(3, basePenalty + levelPenalty);
      
      // Team that gets the points (defenders)
      const scoringTeam = (declarer === 'North' || declarer === 'South') ? 'East-West' : 'North-South';
      
      return {
        points: finalPoints,
        team: scoringTeam,
        rawScore,
        hcp: hcp || 0,
        hcpAdjustment: 0, // Not used for defeated contracts
        netScore: rawScore, // Same as raw score for defeated contracts
        initialPoints: basePenalty,
        contractTypeAdjustments: levelPenalty,
        distributionAdjustment: 0, // Not used for defeated contracts
        contractType // Add contract type to response for display
      };
    }
  };

  // Function to update game scores without causing infinite loops
  const updateGameScores = () => {
    if (calculatedScore && calculatedScore.points && calculatedScore.team) {
      const points = calculatedScore.points;
      const team = calculatedScore.team;
      
      // Create new scores object
      const updatedScores = { 
        'North-South': parseInt(gameData.scores?.['North-South'] || 0),
        'East-West': parseInt(gameData.scores?.['East-West'] || 0)
      };
      
      // Add current points to the appropriate team
      updatedScores[team] = updatedScores[team] + points;
      
      logDebugInfo('Updating Scores', {
        previous: gameData.scores,
        updated: updatedScores,
        points,
        team
      });

      // Update the game data
      setGameData(prevData => {
        const newData = {
          ...prevData,
          scores: updatedScores,
          currentContract: {
            ...localContract,
            finalScore: points,
            rawScore: calculatedScore.rawScore
          }
        };
        logDebugInfo('Updated Game Data', newData);
        return newData;
      });
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

  // Handle continue button click
  const handleContinue = () => {
    // This compatibility fix ensures proper data structure for ResultsPage
    if (isGameComplete) {
      // Prepare data for ResultsPage in the expected format
      
      // First, ensure the current contract is added to the contracts array with the right format
      const updatedContract = {
        level: localContract.level,
        suit: localContract.suit,
        declarer: convertToDirectionLetter(localContract.declarer), // IMPORTANT: Convert to single letter
        finalScore: calculatedScore.points,
        tricksNeeded: parseInt(localContract.level) + 6,
        tricksMade: localContract.tricksTaken,
        isDoubled: localContract.isDoubled || false,
        isRedoubled: localContract.isRedoubled || false,
        rawScore: localContract.rawScore,
        hcp: localContract.hcp || 0,
        distributionPoints: localContract.distribution || 0,
        // Additional fields that might be needed
        score: calculatedScore.points, // Some components might look for this field
        deals: gameData.deals, // This is a critical field that was missing
        made: localContract.tricksTaken >= (parseInt(localContract.level) + 6) // Whether contract was made
      };
      
      // Update contracts array in gameData with properly formatted contracts
      const updatedContracts = [];
      
      // Convert existing contracts to the right format first
      if (gameData.contracts && Array.isArray(gameData.contracts)) {
        gameData.contracts.forEach(contract => {
          updatedContracts.push({
            ...contract,
            declarer: convertToDirectionLetter(contract.declarer),
            tricksNeeded: parseInt(contract.level) + 6,
            tricksMade: contract.tricksTaken || 0,
            deals: gameData.deals,
            made: (contract.tricksTaken || 0) >= (parseInt(contract.level) + 6)
          });
        });
      }
      
      // Add the current contract
      updatedContracts.push(updatedContract);
      
      // ResultsPage requires this data format with proper properties
      const resultsData = {
        gameNumber: gameData.gameNumber,
        deals: gameData.deals,
        contracts: updatedContracts,
        scores: gameData.scores,
        totalNS: gameData.scores['North-South'],
        totalEW: gameData.scores['East-West'],
        completedDate: new Date().toISOString()
      };
      
      // Update the game data with the correctly formatted data
      setGameData(resultsData);
      
      // Save data to localStorage for results page
      localStorage.setItem('lastGameResults', JSON.stringify(resultsData));
      
      console.log("Game complete! Saving to localStorage:", resultsData);
      
      // Navigate to results page
      onNext('results');
    } else {
      // Normal continuation to next deal
      onNext();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="score-confirmation-container">
        <div className="header">Score Confirmation</div>
        <div className="game-info">Loading...</div>
      </div>
    );
  }

  // Error state
  if (!localContract) {
    return (
      <div className="score-confirmation-container">
        <div className="header">Score Confirmation</div>
        <div className="game-info">Error: No contract data found</div>
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

  // Calculate additional information for display
  const isMade = calculatedScore.rawScore > 0;
  const contractLevel = parseInt(localContract.level);
  const tricksRequired = contractLevel + 6;
  const overtricks = Math.max(0, localContract.tricksTaken - tricksRequired);
  const undertricks = isMade ? 0 : (tricksRequired - localContract.tricksTaken);
  
  // Render UI
  return (
    <div className="score-confirmation-container">
      <div className="header">Score Confirmation</div>
      
      <div className="game-info">
        Game {gameData.gameNumber} - Deal {gameData.dealNumber} of {gameData.deals} - 
        Dealer {gameData.dealer} - {getVulnerabilityText(gameData.vulnerability)} - 
        Tokens {tokenBalance}
      </div>
      
      <div className="contract-details">
        <div className="contract-summary">
          {localContract.level} {localContract.suit} by {localContract.declarer} 
          {localContract.isDoubled ? ' (Doubled)' : ''}
          {localContract.isRedoubled ? ' (Redoubled)' : ''}
        </div>
        
        <div className="compact-details-grid">
          <div className="detail-label">Tricks:</div>
          <div className="detail-value">{localContract.tricksTaken || 0}</div>
          
          <div className="detail-label">Raw Score:</div>
          <div className="detail-value">{localContract.rawScore || 0}</div>
          
          <div className="detail-label">HCP:</div>
          <div className="detail-value">{localContract.hcp || 0}</div>
          
          <div className="detail-label">Distribution:</div>
          <div className="detail-value">{localContract.distribution || 0}</div>
        </div>
      </div>
      
      <div className="score-calculation">
        <h2>Score Calculation</h2>
        
        {isMade ? (
          <div className="compact-calculation-grid">
            <div className="calc-label">Raw Score:</div>
            <div className="calc-value">{calculatedScore.rawScore}</div>
            <div className="calc-formula">(Base score from contract)</div>
            
            <div className="calc-label">HCP Adjustment:</div>
            <div className="calc-value">{calculatedScore.hcpAdjustment}</div>
            <div className="calc-formula">(HCP-24)×15 = {calculatedScore.hcpAdjustment}</div>
            
            <div className="calc-label">Net Score:</div>
            <div className="calc-value">{calculatedScore.netScore}</div>
            <div className="calc-formula">{calculatedScore.rawScore} - {calculatedScore.hcpAdjustment}</div>
            
            <div className="calc-label">Initial Points:</div>
            <div className="calc-value">{calculatedScore.initialPoints}</div>
            <div className="calc-formula">|{calculatedScore.netScore}| ÷ 20 = {calculatedScore.initialPoints}</div>
            
            <div className="calc-label">Contract Adj:</div>
            <div className="calc-value">{calculatedScore.contractTypeAdjustments}</div>
            <div className="calc-formula">
              {calculatedScore.contractType === 'game' ? 'Game: +2' : 
               calculatedScore.contractType === 'small slam' ? 'Small Slam: +4' : 
               calculatedScore.contractType === 'grand slam' ? 'Grand Slam: +6' : 'Part Score: +0'}
              {localContract.suit === 'NT' ? ', NT: +1' : ''}
              {overtricks >= 4 && overtricks < 7 ? ', 4+ overtricks: +1' : ''}
              {overtricks >= 7 ? ', 7+ overtricks: +2' : ''}
            </div>
            
            <div className="calc-label">Distribution Adj:</div>
            <div className="calc-value">{calculatedScore.distributionAdjustment}</div>
            <div className="calc-formula">
              {localContract.suit === 'NT' ? 'NT: No adjustment' : 
               `Dist pts ${localContract.distribution}: ${calculatedScore.distributionAdjustment}`}
            </div>
          </div>
        ) : (
          <div className="compact-calculation-grid">
            <div className="calc-label">Raw Score:</div>
            <div className="calc-value">{calculatedScore.rawScore}</div>
            <div className="calc-formula">(Penalty for down {undertricks})</div>
            
            <div className="calc-label">Base Penalty:</div>
            <div className="calc-value">{calculatedScore.initialPoints}</div>
            <div className="calc-formula">|{calculatedScore.rawScore}| ÷ 10 = {calculatedScore.initialPoints}</div>
            
            <div className="calc-label">Level Penalty:</div>
            <div className="calc-value">{calculatedScore.contractTypeAdjustments}</div>
            <div className="calc-formula">
              {calculatedScore.contractType === 'game' ? 'Game down: +3' : 
               calculatedScore.contractType === 'small slam' ? 'Small Slam down: +5' : 
               calculatedScore.contractType === 'grand slam' ? 'Grand Slam down: +7' : 'Part Score: +0'}
            </div>
          </div>
        )}
        
        <div className="final-points-compact">
          {isMade ? (
            <div>
              {calculatedScore.initialPoints} + ({calculatedScore.contractTypeAdjustments}) + ({calculatedScore.distributionAdjustment}) = <strong>{calculatedScore.points}</strong>
            </div>
          ) : (
            <div>
              {calculatedScore.initialPoints} + {calculatedScore.contractTypeAdjustments} = <strong>{calculatedScore.points}</strong>
            </div>
          )}
          <div>Awarded to: <span className="team-name">{calculatedScore.team}</span></div>
        </div>
      </div>
      
      <div className="game-score-compact">
        <div>Current Score</div>
        <div className="team-scores-compact">
          <div>NS: <strong>{gameData.scores && gameData.scores['North-South'] || 0}</strong></div>
          <div>EW: <strong>{gameData.scores && gameData.scores['East-West'] || 0}</strong></div>
        </div>
      </div>
      
      <div className="button-container">
        <button 
          className="primary-button" 
          onClick={handleContinue}
        >
          {isGameComplete ? 'VIEW GAME RESULTS' : 'CONTINUE'}
        </button>
      </div>
      
      {isGameComplete && (
        <div className="game-complete-message">
          Game complete! Click to view final results.
        </div>
      )}
    </div>
  );
};

export default ScoreConfirmationPage;