// src/pages/GamePlayPage.js

import React, { useState, useEffect } from 'react';
import BiddingPanel from '../components/deals/BiddingPanel';

// Use inline styles to avoid CSS path issues
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    textAlign: 'center',
    paddingBottom: '15px',
    borderBottom: '1px solid #e9ecef',
    position: 'relative'
  },
  title: {
    color: '#2563eb',
    marginBottom: '10px',
    fontSize: '24px'
  },
  gameInfo: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    fontSize: '16px'
  },
  infoItem: {
    padding: '5px 10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    color: '#333',
    fontWeight: 'bold'
  },
  timeRemaining: {
    color: '#e63946',
    fontWeight: 'bold'
  },
  tokenDisplay: {
    position: 'absolute',
    top: '0',
    right: '0',
    backgroundColor: '#ffd700',
    padding: '5px 10px',
    borderRadius: '15px',
    fontWeight: 'bold'
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  playArea: {
    width: '100%',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center'
  },
  playAreaTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '20px'
  },
  scoringArea: {
    width: '100%',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center'
  },
  scoringTitle: {
    marginBottom: '15px',
    color: '#333'
  },
  scoreSummary: {
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  summaryText: {
    margin: '5px 0',
    fontSize: '16px'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px'
  },
  scoreTableContainer: {
    marginTop: '20px'
  },
  scoreTableTitle: {
    marginBottom: '10px',
    color: '#333'
  },
  scoreTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center'
  },
  tableHeader: {
    backgroundColor: '#e9ecef',
    padding: '10px',
    border: '1px solid #dee2e6'
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #dee2e6'
  },
  evenRow: {
    backgroundColor: '#f8f9fa'
  }
};

const GamePlayPage = ({ gameSettings, onGameEnd, tokenBalance }) => {
  const [currentDealNumber, setCurrentDealNumber] = useState(1);
  const [gameState, setGameState] = useState('bidding'); // bidding, playing, scoring
  const [currentDealer, setCurrentDealer] = useState('North');
  const [vulnerability, setVulnerability] = useState({ ns: false, ew: false });
  const [contract, setContract] = useState(null);
  const [scores, setScores] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(gameSettings.time * 60); // in seconds
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Determine dealer and vulnerability based on deal number
  useEffect(() => {
    // Dealer rotation: North, East, South, West
    const dealerMap = {
      0: 'North',
      1: 'East',
      2: 'South',
      3: 'West'
    };
    
    setCurrentDealer(dealerMap[(currentDealNumber - 1) % 4]);
    
    // Vulnerability pattern:
    // North dealer: None
    // East dealer: NS
    // South dealer: EW
    // West dealer: Both
    switch (dealerMap[(currentDealNumber - 1) % 4]) {
      case 'North':
        setVulnerability({ ns: false, ew: false }); // None
        break;
      case 'East':
        setVulnerability({ ns: true, ew: false }); // NS
        break;
      case 'South':
        setVulnerability({ ns: false, ew: true }); // EW
        break;
      case 'West':
        setVulnerability({ ns: true, ew: true }); // Both
        break;
      default:
        setVulnerability({ ns: false, ew: false });
    }
  }, [currentDealNumber]);

  // Handle bid submission
  const handleBidSubmitted = (bidData) => {
    setContract(bidData);
    
    if (bidData.type === 'pass-out') {
      // If all players passed, move to next deal
      handleNextDeal();
    } else {
      setGameState('playing');
      // In a real app, you'd save this to your game state
      console.log("Contract:", bidData);
    }
  };
  
  // Handle play completion
  const handlePlayCompleted = (result) => {
    // result should contain tricks taken, etc.
    setGameState('scoring');
    
    // Calculate score based on contract and tricks
    const score = calculateScore(contract, result.tricksTaken);
    
    // Add to scores array
    setScores(prev => [
      ...prev, 
      {
        dealNumber: currentDealNumber,
        contract: contract,
        tricksTaken: result.tricksTaken,
        score: score
      }
    ]);
  };
  
  // Calculate bridge score
  const calculateScore = (contract, tricksTaken) => {
    // This is a simplified scoring calculation
    // In a real app, you'd implement the complete bridge scoring rules
    
    if (!contract) return 0;
    
    const level = contract.level;
    const strain = contract.strain;
    const doubled = contract.doubled;
    const redoubled = contract.redoubled;
    const declarer = contract.declarer;
    
    const isVulnerable = 
      (declarer === 'North' || declarer === 'South') 
        ? vulnerability.ns 
        : vulnerability.ew;
    
    // Calculate tricks required (6 + bid level)
    const tricksRequired = 6 + parseInt(level);
    
    // Check if contract was made
    if (tricksTaken >= tricksRequired) {
      // Contract made - calculate positive score
      let score = 0;
      
      // Trick points
      const trickValue = 
        strain === '♣' || strain === '♦' 
          ? 20 
          : strain === '♥' || strain === '♠' 
            ? 30 
            : 40; // NT
            
      // First trick in NT is worth 40
      const firstTrickScore = strain === 'NT' ? 40 : trickValue;
      
      // Calculate trick score
      score += firstTrickScore + (level - 1) * trickValue;
      
      // Apply doubling
      if (doubled) score *= 2;
      if (redoubled) score *= 2; // Additional doubling
      
      // Game/part-game bonus
      if (score >= 100) {
        // Game bonus
        score += isVulnerable ? 500 : 300;
      } else {
        // Part-game bonus
        score += 50;
      }
      
      // Slam bonus
      if (level === 6) {
        // Small slam
        score += isVulnerable ? 750 : 500;
      } else if (level === 7) {
        // Grand slam
        score += isVulnerable ? 1500 : 1000;
      }
      
      // Overtricks
      const overtricks = tricksTaken - tricksRequired;
      if (overtricks > 0) {
        const overtrickValue = 
          doubled 
            ? (isVulnerable ? 200 : 100) 
            : redoubled 
              ? (isVulnerable ? 400 : 200)
              : trickValue;
              
        score += overtricks * overtrickValue;
      }
      
      return score;
    } else {
      // Contract not made - calculate negative score
      const undertricks = tricksRequired - tricksTaken;
      
      if (doubled) {
        if (isVulnerable) {
          // Vulnerable, doubled undertricks
          return -(200 + (undertricks - 1) * 300);
        } else {
          // Non-vulnerable, doubled undertricks
          return -(100 + (undertricks - 1) * 200);
        }
      } else if (redoubled) {
        if (isVulnerable) {
          // Vulnerable, redoubled undertricks
          return -(400 + (undertricks - 1) * 600);
        } else {
          // Non-vulnerable, redoubled undertricks
          return -(200 + (undertricks - 1) * 400);
        }
      } else {
        // Undoubled undertricks
        return -undertricks * (isVulnerable ? 100 : 50);
      }
    }
  };
  
  // Handle moving to next deal
  const handleNextDeal = () => {
    if (currentDealNumber >= gameSettings.deals) {
      // Game complete
      handleGameEnd();
    } else {
      // Advance to next deal
      setCurrentDealNumber(prev => prev + 1);
      setGameState('bidding');
      setContract(null);
    }
  };
  
  // Handle time up
  const handleTimeUp = () => {
    alert('Time is up! Game is ending.');
    handleGameEnd();
  };
  
  // Handle game end
  const handleGameEnd = () => {
    // Calculate final scores, save to localStorage, etc.
    const finalScores = {
      deals: scores,
      totalNS: scores.reduce((total, deal) => {
        // Positive scores for N-S go to N-S, negative to E-W
        if (deal.contract.declarer === 'North' || deal.contract.declarer === 'South') {
          return total + deal.score;
        } else {
          return total - deal.score;
        }
      }, 0),
      totalEW: scores.reduce((total, deal) => {
        // Positive scores for E-W go to E-W, negative to N-S
        if (deal.contract.declarer === 'East' || deal.contract.declarer === 'West') {
          return total + deal.score;
        } else {
          return total - deal.score;
        }
      }, 0)
    };
    
    // Save game results
    localStorage.setItem('bonusBridgeLastGame', JSON.stringify(finalScores));
    
    // Call the parent callback
    onGameEnd(finalScores);
  };
  
  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get vulnerability display text
  const getVulnerabilityText = () => {
    if (vulnerability.ns && vulnerability.ew) return 'Both';
    if (vulnerability.ns) return 'N-S';
    if (vulnerability.ew) return 'E-W';
    return 'None';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Bonus Bridge</h1>
        <div style={styles.gameInfo}>
          <span style={styles.infoItem}>Deal {currentDealNumber} of {gameSettings.deals}</span>
          <span style={styles.infoItem}>Dealer: {currentDealer}</span>
          <span style={styles.infoItem}>Vul: {getVulnerabilityText()}</span>
          <span style={{...styles.infoItem, ...styles.timeRemaining}}>Time: {formatTime(timeRemaining)}</span>
        </div>
        <div style={styles.tokenDisplay}>Tokens: {tokenBalance}</div>
      </div>

      <div style={styles.content}>
        {gameState === 'bidding' && (
          <BiddingPanel 
            dealer={currentDealer}
            vulnerability={vulnerability}
            onBidSubmitted={handleBidSubmitted}
          />
        )}
        
        {gameState === 'playing' && (
          <div style={styles.playArea}>
            <h2 style={styles.playAreaTitle}>Playing Contract: {contract?.level}{contract?.strain} by {contract?.declarer}</h2>
            <p>Playing interface would go here</p>
            {/* This would be replaced by your play interface */}
            <button 
              style={styles.primaryButton}
              onClick={() => handlePlayCompleted({ tricksTaken: 10 })}
            >
              Complete Play (Demo: 10 tricks)
            </button>
          </div>
        )}
        
        {gameState === 'scoring' && (
          <div style={styles.scoringArea}>
            <h2 style={styles.scoringTitle}>Deal Complete</h2>
            <div style={styles.scoreSummary}>
              <p style={styles.summaryText}>Contract: {contract?.level}{contract?.strain} {contract?.doubled ? 'X' : ''}{contract?.redoubled ? 'XX' : ''} by {contract?.declarer}</p>
              <p style={styles.summaryText}>Result: {scores[scores.length - 1]?.tricksTaken} tricks</p>
              <p style={styles.summaryText}>Score: {scores[scores.length - 1]?.score}</p>
            </div>
            <button 
              style={styles.primaryButton}
              onClick={handleNextDeal}
            >
              {currentDealNumber >= gameSettings.deals ? 'End Game' : 'Next Deal'}
            </button>
          </div>
        )}
      </div>

      {scores.length > 0 && (
        <div style={styles.scoreTableContainer}>
          <h3 style={styles.scoreTableTitle}>Scores</h3>
          <table style={styles.scoreTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Deal</th>
                <th style={styles.tableHeader}>Contract</th>
                <th style={styles.tableHeader}>By</th>
                <th style={styles.tableHeader}>Result</th>
                <th style={styles.tableHeader}>Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={index} style={index % 2 === 1 ? styles.evenRow : {}}>
                  <td style={styles.tableCell}>{score.dealNumber}</td>
                  <td style={styles.tableCell}>{score.contract.level}{score.contract.strain} {score.contract.doubled ? 'X' : ''}{score.contract.redoubled ? 'XX' : ''}</td>
                  <td style={styles.tableCell}>{score.contract.declarer}</td>
                  <td style={styles.tableCell}>{score.tricksTaken} tricks</td>
                  <td style={styles.tableCell}>{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GamePlayPage;