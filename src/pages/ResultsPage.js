// src/pages/ResultsPage.js
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/global.css';
import '../styles/ResultsPage.css';
import '../styles/PlayerRanking.css';
import PlayerRankingComponent from '../components/PlayerRankingComponent';
import EmailShareComponent from '../components/EmailShareComponent';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultsPage = ({ gameData, onBack, onNewGame }) => {
  const [playerStats, setPlayerStats] = useState({
    N: { deals: 0, points: 0 },
    E: { deals: 0, points: 0 },
    S: { deals: 0, points: 0 },
    W: { deals: 0, points: 0 }
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [gameDate] = useState(new Date().toLocaleDateString());
  const [gameTime] = useState(new Date().toLocaleTimeString());
  const [gameId] = useState(`G${Math.floor(Math.random() * 10000)}`);

  // Calculate statistics when component mounts
  useEffect(() => {
    try {
      const stats = calculatePlayerStats();
      setPlayerStats(stats);
    } catch (error) {
      console.error("Error calculating player stats:", error);
      // Set default stats to prevent rendering errors
      setPlayerStats({
        N: { deals: 0, points: 0 },
        E: { deals: 0, points: 0 },
        S: { deals: 0, points: 0 },
        W: { deals: 0, points: 0 }
      });
    }
  }, [gameData]);

  // Prepare data for charts
  const pieChartData = {
    labels: ['North-South', 'East-West'],
    datasets: [
      {
        data: [
          gameData?.scores?.['North-South'] || 0, 
          gameData?.scores?.['East-West'] || 0
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Player Performance' }
    }
  };

  const barChartData = {
    labels: ['North', 'East', 'South', 'West'],
    datasets: [
      {
        label: 'Average Points Per Deal',
        data: [
          playerStats.N.deals > 0 ? playerStats.N.points / playerStats.N.deals : 0,
          playerStats.E.deals > 0 ? playerStats.E.points / playerStats.E.deals : 0,
          playerStats.S.deals > 0 ? playerStats.S.points / playerStats.S.deals : 0,
          playerStats.W.deals > 0 ? playerStats.W.points / playerStats.W.deals : 0
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      }
    ],
  };

  // Calculate player statistics from game data
  const calculatePlayerStats = () => {
    const stats = {
      N: { deals: 0, points: 0 },
      E: { deals: 0, points: 0 },
      S: { deals: 0, points: 0 },
      W: { deals: 0, points: 0 }
    };

    // Defensive programming - check if the required data exists
    if (!gameData || !gameData.contracts || !Array.isArray(gameData.contracts)) {
      console.error("Missing or invalid contracts data:", gameData);
      return stats;
    }

    // Process each contract
    gameData.contracts.forEach(contract => {
      // Skip invalid contracts
      if (!contract || !contract.declarer) {
        console.warn("Invalid contract in data:", contract);
        return;
      }
      
      // Get single letter declarer (N, E, S, W)
      const dir = contract.declarer.charAt(0).toUpperCase();
      
      // Skip if not a valid direction
      if (!stats[dir]) {
        console.warn("Invalid declarer direction:", dir);
        return;
      }
      
      // Increment deals count
      stats[dir].deals += 1;
      
      // Calculate points based on whether contract was made or defeated
      // Check if contract was made using the data available
      const tricksNeeded = contract.tricksNeeded || (contract.level + 6);
      const tricksMade = contract.tricksMade || contract.tricksTaken || 0;
      const made = contract.made !== undefined ? contract.made : tricksMade >= tricksNeeded;
      
      if (made) {
        // For made contracts, points go to declarer's direction
        const isNS = dir === 'N' || dir === 'S';
        const partnerDir = dir === 'N' ? 'S' : dir === 'S' ? 'N' : dir === 'E' ? 'W' : 'E';
        
        // Use the score from the contract if available, otherwise estimate from team scores
        let pointsEarned;
        if (contract.finalScore || contract.score) {
          pointsEarned = contract.finalScore || contract.score;
        } else {
          // Fallback calculation
          const totalTeamDeals = stats[dir].deals + stats[partnerDir].deals;
          pointsEarned = totalTeamDeals > 0 ? 
            (gameData.scores?.[isNS ? 'North-South' : 'East-West'] || 0) / totalTeamDeals : 0;
        }
        
        stats[dir].points += pointsEarned;
      }
    });

    return stats;
  };

  // Function to handle export format selection
  const handleExportFormatChange = (e) => {
    setExportFormat(e.target.value);
  };

  // Function to export game results in selected format
  const exportResults = () => {
    switch (exportFormat) {
      case 'csv':
        exportAsCSV();
        break;
      case 'pdf':
        exportAsPDF();
        break;
      case 'html':
        exportAsHTML();
        break;
      default:
        exportAsCSV();
    }
    setShowExportOptions(false);
  };

  // Export functions (placeholders - would need actual implementation)
  const exportAsCSV = () => {
    alert('CSV export functionality would be implemented here');
    // Actual implementation would create and download a CSV file
  };

  const exportAsPDF = () => {
    alert('PDF export functionality would be implemented here');
    // Actual implementation would generate and download a PDF
  };

  const exportAsHTML = () => {
    alert('HTML email export functionality would be implemented here');
    // Actual implementation would generate HTML and send via email
  };

  // Function to handle sharing results via email
  const shareResults = () => {
    setShowShareModal(true);
  };
  
  // Function to handle closing the email share modal
  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };
  
  // Function to toggle player rankings display
  const toggleRankings = () => {
    setShowRankings(!showRankings);
  };

  // Determine winners - safely access properties
  const nsScore = gameData?.scores?.['North-South'] || 0;
  const ewScore = gameData?.scores?.['East-West'] || 0;
  const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
  const margin = Math.abs(nsScore - ewScore);

  // Find best individual player
  const playerArray = [
    { dir: 'N', avg: playerStats.N.deals > 0 ? playerStats.N.points / playerStats.N.deals : 0 },
    { dir: 'E', avg: playerStats.E.deals > 0 ? playerStats.E.points / playerStats.E.deals : 0 },
    { dir: 'S', avg: playerStats.S.deals > 0 ? playerStats.S.points / playerStats.S.deals : 0 },
    { dir: 'W', avg: playerStats.W.deals > 0 ? playerStats.W.points / playerStats.W.deals : 0 }
  ];
  const bestPlayer = playerArray.reduce((max, p) => p.avg > max.avg ? p : max, playerArray[0]);

  // Check if data is available for rendering
  if (!gameData || !gameData.contracts) {
    return (
      <div className="results-container" style={{ padding: "20px", textAlign: "center" }}>
        <div className="blue-header">
          <h2>Game Results</h2>
        </div>
        <div style={{ margin: "30px 0", fontSize: "18px" }}>
          No game data available. Please complete a game to view results.
        </div>
        <button 
          onClick={onBack} 
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#0052cc", 
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer" 
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="blue-header">
        <h2>Game Results</h2>
      </div>
      
      <div className="game-info-section">
        <div className="game-metadata">
          <div>Game ID: {gameId}</div>
          <div>Date: {gameDate}</div>
          <div>Time: {gameTime}</div>
          <div>Number of Deals: {gameData.contracts?.length || 0}</div>
        </div>
        
        <div className="final-scores">
          <h3>Final Score</h3>
          <div className="team-score">North-South: {nsScore} points</div>
          <div className="team-score">East-West: {ewScore} points</div>
          <div className="winner">{winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}</div>
        </div>
      </div>
      
      <div className="charts-section">
        <div className="chart-container">
          <h3>Score Distribution</h3>
          <Pie data={pieChartData} />
        </div>
        
        <div className="chart-container">
          <h3>Player Performance</h3>
          <Bar options={barChartOptions} data={barChartData} />
        </div>
      </div>
      
      <div className="results-table-section">
        <h3>Detailed Results</h3>
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Contract</th>
                <th>By</th>
                <th>Result</th>
                <th>Score</th>
                <th>HCP</th>
                <th>Dist</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {gameData.contracts.map((contract, index) => {
                // Safely access properties with fallbacks
                const declarer = contract.declarer || '';
                const isNS = declarer.charAt(0) === 'N' || declarer.charAt(0) === 'S';
                const level = contract.level || 0;
                const suit = contract.suit || '';
                const doubled = contract.isDoubled ? ' X' : '';
                const redoubled = contract.isRedoubled ? ' XX' : '';
                const tricksNeeded = contract.tricksNeeded || (level + 6);
                const tricksMade = contract.tricksMade || contract.tricksTaken || 0;
                const made = tricksMade >= tricksNeeded;
                const resultText = made 
                  ? `Made ${tricksMade > tricksNeeded ? '+' + (tricksMade - tricksNeeded) : ''}`
                  : `Down ${tricksNeeded - tricksMade}`;
                const rawScore = contract.rawScore || 0;
                const hcp = contract.hcp || contract.distributionPoints || '-';
                const dist = contract.distributionPoints || contract.distribution || '-';
                const points = contract.finalScore || contract.score || 0;
                
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{level}{suit}{doubled}{redoubled}</td>
                    <td>{declarer}</td>
                    <td>{resultText}</td>
                    <td>{rawScore}</td>
                    <td>{hcp}</td>
                    <td>{dist}</td>
                    <td>{points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="statistics-section">
        <h3>Game Statistics</h3>
        <div className="statistics-grid">
          <div className="stat-item">
            <div className="stat-label">Best Player</div>
            <div className="stat-value">
              {bestPlayer.dir} ({bestPlayer.avg.toFixed(1)} pts/deal)
              <button 
                className="ranking-details-btn"
                onClick={toggleRankings}
              >
                {showRankings ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">NS Contracts</div>
            <div className="stat-value">{playerStats.N.deals + playerStats.S.deals}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">EW Contracts</div>
            <div className="stat-value">{playerStats.E.deals + playerStats.W.deals}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Game Duration</div>
            <div className="stat-value">1 hr 45 min</div>
          </div>
        </div>
      </div>
      
      {/* Player Rankings Section */}
      {showRankings && (
        <PlayerRankingComponent gameData={gameData} />
      )}
      
      {showExportOptions ? (
        <div className="export-options">
          <h3>Export Options</h3>
          <div className="export-format">
            <label>
              <input 
                type="radio" 
                value="csv" 
                checked={exportFormat === 'csv'} 
                onChange={handleExportFormatChange} 
              /> 
              CSV
            </label>
            <label>
              <input 
                type="radio" 
                value="pdf" 
                checked={exportFormat === 'pdf'} 
                onChange={handleExportFormatChange} 
              /> 
              PDF
            </label>
            <label>
              <input 
                type="radio" 
                value="html" 
                checked={exportFormat === 'html'} 
                onChange={handleExportFormatChange} 
              /> 
              HTML Email
            </label>
          </div>
          <div className="export-actions">
            <button onClick={exportResults}>Export</button>
            <button onClick={() => setShowExportOptions(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="action-buttons">
          <button onClick={() => setShowExportOptions(true)}>Export Results</button>
          <button onClick={shareResults}>Share Results</button>
          <button onClick={onBack}>Back</button>
          <button onClick={onNewGame}>New Game</button>
        </div>
      )}
      
      {/* Email Share Modal */}
      {showShareModal && (
        <EmailShareComponent 
          gameData={{
            gameNumber: gameData.gameNumber || gameId,
            scores: gameData.scores,
            contracts: gameData.contracts
          }}
          onClose={handleCloseShareModal}
        />
      )}
    </div>
  );
};

export default ResultsPage;