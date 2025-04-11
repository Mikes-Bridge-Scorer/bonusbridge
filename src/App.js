// C:/bridge-scorer/bonusbridge/src/App.js

import React, { useState, useEffect } from 'react';
import ScorerCredentialsPage from './pages/ScorerCredentialsPage';
import DealSelectionPage from './pages/DealSelectionPage';
import ContractInputPage from './pages/ContractInputPage';
import TricksInputPage from './pages/TricksInputPage';
import ScoreAdjustmentPage from './pages/ScoreAdjustmentPage';
import ScoreConfirmationPage from './pages/ScoreConfirmationPage';
import ResultsPage from './pages/ResultsPage';

// Import just the global CSS
import './styles/global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('scorerCredentials');
  const [gameSettings, setGameSettings] = useState({
    deals: null,
    tokens: null,
    time: null
  });
  const [gameData, setGameData] = useState({
    gameNumber: 1,
    dealNumber: 1,
    dealer: 'North',
    vulnerability: 'None',
    contracts: [],
    currentContract: null,
    deals: 10,
    scores: {
      'North-South': 0,
      'East-West': 0
    }
  });
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Load token balance on component mount and whenever the page changes
  useEffect(() => {
    loadTokenBalance();
  }, [currentPage]);
  
  // Function to load token balance from localStorage
  const loadTokenBalance = () => {
    const userData = localStorage.getItem('bonusBridgeUser');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const storedBalance = parsedData.tokenBalance || 0;
        
        // Only update if it's different to prevent unnecessary renders
        if (storedBalance !== tokenBalance) {
          setTokenBalance(storedBalance);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  };

  // Handle navigation to next page
  const handleNext = (destination) => {
    console.log("handleNext called, current page:", currentPage, "destination:", destination);
    
    // Check if we're being directed to a specific page
    if (destination === 'results') {
      // Direct navigation to results page
      setCurrentPage('results');
      return;
    }
    
    // Original switch statement for normal page flow
    switch (currentPage) {
      case 'scorerCredentials':
        setCurrentPage('dealSelection');
        break;
      case 'dealSelection':
        setCurrentPage('contractInput');
        break;
      case 'contractInput':
        setCurrentPage('tricksInput');
        break;
      case 'tricksInput':
        setCurrentPage('scoreAdjustment');
        break;
      case 'scoreAdjustment':
        setCurrentPage('scoreConfirmation');
        break;
      case 'scoreConfirmation':
        // Store the current contract in history before moving to next deal
        const currentContract = gameData.currentContract ? { ...gameData.currentContract } : null;
        
        // Update game data with the completed contract
        setGameData(prev => {
          // Add the current contract to the contracts array
          const updatedContracts = [...prev.contracts];
          if (currentContract) {
            updatedContracts.push(currentContract);
          }
          
          // Increment deal number
          const newDealNumber = prev.dealNumber + 1;
          
          // Determine dealer and vulnerability for the next deal
          const nextDealer = getNextDealer(prev.dealer);
          const nextVulnerability = getVulnerability(newDealNumber);
          
          return {
            ...prev,
            dealNumber: newDealNumber,
            dealer: nextDealer,
            vulnerability: nextVulnerability,
            contracts: updatedContracts,
            currentContract: null, // Reset current contract for the next deal
          };
        });
        
        // Navigate to contract input for the next deal
        setCurrentPage('contractInput');
        break;
      default:
        setCurrentPage('scorerCredentials');
    }
  };
  
  // Get the next dealer in rotation
  const getNextDealer = (currentDealer) => {
    const rotation = ['North', 'East', 'South', 'West'];
    const currentIndex = rotation.indexOf(currentDealer);
    return rotation[(currentIndex + 1) % 4];
  };
  
  // Get vulnerability based on deal number
  const getVulnerability = (dealNumber) => {
    // Simple vulnerability rotation pattern
    switch (dealNumber % 4) {
      case 1: return 'None';
      case 2: return 'NS';
      case 3: return 'EW';
      case 0: return 'Both';
      default: return 'None';
    }
  };
  
  // Handle navigation between pages
  const handleResultsBack = () => {
    setCurrentPage('scoreConfirmation');
  };
  
  // Handle starting a new game
  const handleNewGame = () => {
    // Reset game data but keep scores for running total
    const oldScores = { ...gameData.scores };
    
    // Ensure scores are numbers, not strings
    const cleanScores = {
      'North-South': parseInt(oldScores['North-South']) || 0,
      'East-West': parseInt(oldScores['East-West']) || 0
    };
    
    setGameData({
      gameNumber: gameData.gameNumber + 1,
      dealNumber: 1,
      dealer: 'North',
      vulnerability: 'None',
      contracts: [],
      currentContract: null,
      deals: gameSettings.deals || 10,
      scores: cleanScores
    });
    setCurrentPage('dealSelection');
  };

  // Render current page based on state
  const renderCurrentPage = () => {
    try {
      switch (currentPage) {
        case 'scorerCredentials':
          return (
            <ScorerCredentialsPage 
              onNext={handleNext}
            />
          );
        case 'dealSelection':
          return (
            <DealSelectionPage 
              gameSettings={gameSettings}
              setGameSettings={setGameSettings}
              onNext={handleNext}
            />
          );
        case 'contractInput':
          return (
            <ContractInputPage 
              gameData={gameData}
              setGameData={setGameData}
              onNext={handleNext}
            />
          );
        case 'tricksInput':
          return (
            <TricksInputPage 
              gameData={gameData}
              setGameData={setGameData}
              onNext={handleNext}
            />
          );
        case 'scoreAdjustment':
          return (
            <ScoreAdjustmentPage 
              gameData={gameData}
              setGameData={setGameData}
              onNext={handleNext}
            />
          );
        case 'scoreConfirmation':
          return (
            <ScoreConfirmationPage 
              gameData={gameData}
              setGameData={setGameData}
              onNext={handleNext}
            />
          );
        case 'results':
          return (
            <ResultsPage
              gameData={gameData}
              onBack={handleResultsBack}
              onNewGame={handleNewGame}
            />
          );
        default:
          return <div>Page not found</div>;
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #f5c6cb',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '5px'
        }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <pre>{error.stack}</pre>
          <button 
            onClick={() => setCurrentPage('scorerCredentials')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Restart Application
          </button>
        </div>
      );
    }
  };

  return (
    <div className="app">
      {renderCurrentPage()}
    </div>
  );
}

export default App;