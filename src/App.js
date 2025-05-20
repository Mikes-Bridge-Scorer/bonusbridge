// C:/bridge-scorer/bonusbridge/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
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
    deals: null,
    scores: {
      'North-South': 0,
      'East-West': 0
    }
  });
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Debug function to log state changes
  const logStateChange = useCallback((message, stateUpdate) => {
    console.log(message, {
      gameNumber: stateUpdate.gameNumber,
      dealNumber: stateUpdate.dealNumber,
      deals: stateUpdate.deals,
      currentContract: stateUpdate.currentContract
    });
  }, []);

  // Load initial data when component mounts
  useEffect(() => {
    // EMERGENCY FIX: Clear any stale data at app startup
    sessionStorage.clear();
    localStorage.removeItem('selectedDealsCount');
    localStorage.removeItem('currentSessionDealsCount');
    console.log("App startup: Cleared stale deal data");
    
    // Reset global state
    if (window.BRIDGE_GAME_STATE) {
      window.BRIDGE_GAME_STATE.selectedDeals = null;
      window.BRIDGE_GAME_STATE.lastGameScores = {
        'North-South': 0,
        'East-West': 0
      };
    }
    
    // Check for last game number in localStorage
    const lastGameNumber = localStorage.getItem('lastGameNumber');
    if (lastGameNumber) {
      try {
        const gameNum = parseInt(lastGameNumber);
        // Initialize with the next game number
        setGameData(prevData => {
          const newData = {
            ...prevData,
            gameNumber: gameNum + 1
          };
          logStateChange("Initial game data update:", newData);
          return newData;
        });
      } catch (error) {
        console.error("Error parsing last game number:", error);
      }
    }
    
    // Load token balance
    loadTokenBalance();
  }, []);
  
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

  // Function to handle gameSettings updates from DealSelectionPage
  const handleGameSettingsUpdate = (newSettings) => {
    console.log("New game settings received:", newSettings);
    
    // Update game settings state
    setGameSettings(newSettings);
    
    // IMPORTANT: Update gameData immediately and directly
    setGameData(prevData => {
      // Create the updated data object with explicit deal count
      const newData = {
        ...prevData,
        deals: newSettings.deals,
        dealNumber: 1 // Reset deal number when new game settings are selected
      };
      
      console.log("Updated gameData with new deals count:", newSettings.deals);
      logStateChange("Game settings update:", newData);
      return newData;
    });
  };

  // Handle navigation to next page
  const handleNext = () => {
    console.log("handleNext called, current page:", currentPage);
    
    // EMERGENCY FIX: Check all possible sources for deal count
    const sessionDealsCount = sessionStorage.getItem('currentSessionDealsCount');
    const localDealsCount = localStorage.getItem('selectedDealsCount');
    const globalDealsCount = window.BRIDGE_GAME_STATE?.selectedDeals;
    
    console.log("Deal count sources in handleNext:", {
      sessionStorage: sessionDealsCount,
      localStorage: localDealsCount,
      globalVariable: globalDealsCount,
      gameData: gameData.deals,
      gameSettings: gameSettings.deals
    });
    
    // Detailed logging of current game state
    logStateChange("Game state before navigation:", gameData);
    
    // Original switch statement for normal page flow
    switch (currentPage) {
      case 'scorerCredentials':
        console.log("Navigating from scorerCredentials to dealSelection");
        setCurrentPage('dealSelection');
        break;
      case 'dealSelection':
        // When moving from deal selection, verify the deal count is correct
        console.log("Moving from dealSelection with deals:", gameData.deals);
        
        // Get the most reliable deal count
        const finalDealsCount = sessionDealsCount ? parseInt(sessionDealsCount) :
                              localDealsCount ? parseInt(localDealsCount) :
                              globalDealsCount ? globalDealsCount :
                              gameData.deals || gameSettings.deals || 10;
        
        console.log("Using final deals count for navigation:", finalDealsCount);
        
        // Force an update to ensure the deal count is correct before navigation
        setGameData(prevData => {
          const newData = {
            ...prevData,
            deals: finalDealsCount
          };
          console.log("Updated gameData before navigation:", newData);
          return newData;
        });
        
        // Short delay to ensure state update completes
        setTimeout(() => {
          console.log("Navigating to contractInput after timeout");
          setCurrentPage('contractInput');
        }, 100);
        break;
      case 'contractInput':
        console.log("Navigating from contractInput to tricksInput");
        setCurrentPage('tricksInput');
        break;
      case 'tricksInput':
        console.log("Navigating from tricksInput to scoreAdjustment");
        setCurrentPage('scoreAdjustment');
        break;
      case 'scoreAdjustment':
        console.log("Navigating from scoreAdjustment to scoreConfirmation");
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
          
          // Make sure we have the correct total deals count
          let totalDeals = prev.deals;
          
          // Check all possible sources for the most reliable deal count
          const sessionDealsCount = sessionStorage.getItem('currentSessionDealsCount');
          const localDealsCount = localStorage.getItem('selectedDealsCount');
          const globalDealsCount = window.BRIDGE_GAME_STATE?.selectedDeals;
          
          if (!totalDeals) {
            totalDeals = sessionDealsCount ? parseInt(sessionDealsCount) :
                        localDealsCount ? parseInt(localDealsCount) :
                        globalDealsCount ? globalDealsCount : 
                        10;
            console.log("Using deal count from alternative source:", totalDeals);
          }
          
          // Check if we've completed all deals
          const isGameComplete = newDealNumber > totalDeals;
          
          console.log("Next deal details:", {
            newDealNumber,
            totalDeals,
            isGameComplete
          });
          
          // If game is complete, navigate to results
          if (isGameComplete) {
            console.log("Game complete, navigating to results");
            setCurrentPage('results');
            return prev;
          }
          
          const newData = {
            ...prev,
            dealNumber: newDealNumber,
            dealer: nextDealer,
            vulnerability: nextVulnerability,
            contracts: updatedContracts,
            currentContract: null, // Reset current contract for the next deal
            deals: totalDeals // Ensure the deals count persists
          };
          
          logStateChange("Game state after deal increment:", newData);
          return newData;
        });
        
        // Only navigate to contract input if not moving to results
        if (gameData.dealNumber < (gameData.deals || 10)) {
          console.log("Navigating to contractInput for next deal");
          setCurrentPage('contractInput');
        }
        break;
      default:
        console.log("Default case, navigating to scorerCredentials");
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
    console.log("handleResultsBack called");
    setCurrentPage('scoreConfirmation');
  };
  
  // Handle starting a new game - UPDATED to reset scores
  const handleNewGame = () => {
    console.log("handleNewGame called");
    
    // EMERGENCY FIX: Clear all storage at new game
    sessionStorage.clear();
    localStorage.removeItem('selectedDealsCount');
    localStorage.removeItem('currentSessionDealsCount');
    console.log("Cleared all deal count storage for new game");
    
    // Reset global state
    if (window.BRIDGE_GAME_STATE) {
      window.BRIDGE_GAME_STATE.selectedDeals = null;
      window.BRIDGE_GAME_STATE.lastGameScores = {
        'North-South': 0,
        'East-West': 0
      };
    }
    
    // Get the current game number for incrementing
    const currentGameNumber = gameData.gameNumber || 1;
    
    // Store the current game number in localStorage for persistence
    localStorage.setItem('lastGameNumber', currentGameNumber.toString());
    
    // Clear any previous game data from localStorage
    const previousGameDataKeys = Object.keys(localStorage).filter(key => 
      key.includes('gameData') || 
      key.includes('bonusBridge') || 
      key.includes('deal') || 
      key.includes('Deal') || 
      key.includes('contract') || 
      key.includes('Contract')
    );

    // Don't clear user data with tokens
    previousGameDataKeys.forEach(key => {
      if (key !== 'bonusBridgeUser' && !key.includes('lastGameNumber')) {
        console.log("Clearing localStorage key:", key);
        localStorage.removeItem(key);
      }
    });
    
    // Reset game data completely
    const newGameData = {
      gameNumber: currentGameNumber + 1,
      dealNumber: 1,
      dealer: 'North',
      vulnerability: 'None',
      contracts: [],
      currentContract: null,
      deals: null, // Set to null to force selection of new deals count
      scores: {
        'North-South': 0, // Reset to zero
        'East-West': 0    // Reset to zero
      }
    };
    
    // Reset game settings to force a new selection
    setGameSettings({
      deals: null,
      tokens: null,
      time: null
    });
    
   setGameData(newGameData);
    
    logStateChange("Starting new game:", newGameData);
    console.log("Starting new game with reset deal selection");
    
    // Navigate to ScorerCredentialsPage
    setCurrentPage('scorerCredentials');
  };

  // Handle abandoning a game
  const handleAbandonGame = () => {
    console.log("handleAbandonGame called");
    
    // EMERGENCY FIX: Same as handleNewGame, clear everything
    sessionStorage.clear();
    localStorage.removeItem('selectedDealsCount');
    localStorage.removeItem('currentSessionDealsCount');
    
    // Reset global state
    if (window.BRIDGE_GAME_STATE) {
      window.BRIDGE_GAME_STATE.selectedDeals = null;
      window.BRIDGE_GAME_STATE.lastGameScores = {
        'North-South': 0,
        'East-West': 0
      };
    }
    
    // Get the current game number for incrementing
    const currentGameNumber = gameData.gameNumber || 1;
    
    // Store the current game number in localStorage for persistence
    localStorage.setItem('lastGameNumber', currentGameNumber.toString());
    
    // Reset game data completely
    const newGameData = {
      gameNumber: currentGameNumber + 1,
      dealNumber: 1,
      dealer: 'North',
      vulnerability: 'None',
      contracts: [],
      currentContract: null,
      deals: null, // Set to null to force selection of new deals count
      scores: {
        'North-South': 0, // Reset to zero
        'East-West': 0    // Reset to zero
      }
    };
    
    // Reset game settings
    setGameSettings({
      deals: null,
      tokens: null,
      time: null
    });
    
    setGameData(newGameData);
    
    // Navigate to ScorerCredentialsPage
    setCurrentPage('scorerCredentials');
  };

  // Render current page based on state
  const renderCurrentPage = () => {
    try {
      console.log("renderCurrentPage called with currentPage:", currentPage);
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
              setGameSettings={handleGameSettingsUpdate}
              onNext={handleNext}
            />
          );
        case 'contractInput':
          console.log("Rendering ContractInputPage with gameData:", gameData);
          
          // EMERGENCY FIX: Get deal count from all sources
          const sessionDealsCount = sessionStorage.getItem('currentSessionDealsCount');
          const localDealsCount = localStorage.getItem('selectedDealsCount');
          const globalDealsCount = window.BRIDGE_GAME_STATE?.selectedDeals;
          
          // Take first non-null value in priority order
          const finalDealsCount = sessionDealsCount ? parseInt(sessionDealsCount) :
                                localDealsCount ? parseInt(localDealsCount) :
                                globalDealsCount ? globalDealsCount :
                                gameData.deals || gameSettings.deals || 10;
          
          console.log("ContractInputPage - Using deals count:", finalDealsCount);
          
          return (
            <ContractInputPage 
              gameData={{
                ...gameData,
                deals: finalDealsCount // Explicitly pass the correct deal count
              }}
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
              onAbandonGame={handleAbandonGame}
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
            onClick={() => {
              // Reset everything and go back to start
              sessionStorage.clear();
              localStorage.removeItem('selectedDealsCount');
              localStorage.removeItem('currentSessionDealsCount');
              
              // Reset game data
              setGameData({
                gameNumber: 1,
                dealNumber: 1,
                dealer: 'North',
                vulnerability: 'None',
                contracts: [],
                currentContract: null,
                deals: null,
                scores: {
                  'North-South': 0,
                  'East-West': 0
                }
              });
              
              setCurrentPage('scorerCredentials');
            }}
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