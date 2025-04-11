// src/components/PlayerRankingComponent.js

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const PlayerRankingComponent = ({ gameData }) => {
  const [playerStats, setPlayerStats] = useState({
    N: { name: 'North', deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
    E: { name: 'East', deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
    S: { name: 'South', deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
    W: { name: 'West', deals: 0, points: 0, totalTricks: 0, madeContracts: 0 }
  });
  
  const [declarerStats, setDeclarerStats] = useState({ made: 0, down: 0 });
  const [hcpStats, setHcpStats] = useState({ ns: 0, ew: 0 });
  const [topPlayer, setTopPlayer] = useState(null);
  
  // Load player names from localStorage if available
  useEffect(() => {
    const loadPlayerNames = () => {
      try {
        const playersData = localStorage.getItem('bonusBridgePlayers');
        if (playersData) {
          const players = JSON.parse(playersData);
          
          setPlayerStats(prev => ({
            N: { ...prev.N, name: players.North?.name || 'North' },
            E: { ...prev.E, name: players.East?.name || 'East' },
            S: { ...prev.S, name: players.South?.name || 'South' },
            W: { ...prev.W, name: players.West?.name || 'West' }
          }));
        }
      } catch (error) {
        console.error("Error loading player names:", error);
      }
    };
    
    loadPlayerNames();
  }, []);
  
  // Calculate player statistics when gameData changes
  useEffect(() => {
    if (!gameData?.contracts?.length) return;
    
    const stats = {
      N: { ...playerStats.N, deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
      E: { ...playerStats.E, deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
      S: { ...playerStats.S, deals: 0, points: 0, totalTricks: 0, madeContracts: 0 },
      W: { ...playerStats.W, deals: 0, points: 0, totalTricks: 0, madeContracts: 0 }
    };
    
    let madeContracts = 0;
    let downContracts = 0;
    let nsHCP = 0;
    let ewHCP = 0;
    let totalHCP = 0;
    
    gameData.contracts.forEach(contract => {
      if (contract.declarer) {
        const dir = contract.declarer;
        stats[dir].deals += 1;
        
        // Record tricks taken
        if (contract.tricksMade) {
          stats[dir].totalTricks += contract.tricksMade;
        }
        
        // Calculate if contract was made or defeated
        const made = contract.tricksMade >= contract.tricksNeeded;
        if (made) {
          stats[dir].madeContracts += 1;
          madeContracts += 1;
        } else {
          downContracts += 1;
        }
        
        // Add score for declarer
        stats[dir].points += contract.rawScore || 0;
        
        // Track HCP
        if (contract.hcp) {
          totalHCP += contract.hcp;
          if (dir === 'N' || dir === 'S') {
            nsHCP += contract.hcp;
          } else {
            ewHCP += contract.hcp;
          }
        }
      }
    });
    
    // Find top player
    let topPlayerKey = 'N';
    let topPlayerAvg = stats.N.deals > 0 ? stats.N.points / stats.N.deals : 0;
    
    Object.keys(stats).forEach(dir => {
      const avg = stats[dir].deals > 0 ? stats[dir].points / stats[dir].deals : 0;
      if (avg > topPlayerAvg) {
        topPlayerAvg = avg;
        topPlayerKey = dir;
      }
    });
    
    setPlayerStats(stats);
    setDeclarerStats({ made: madeContracts, down: downContracts });
    setHcpStats({ 
      ns: totalHCP > 0 ? Math.round(nsHCP / totalHCP * 100) : 50, 
      ew: totalHCP > 0 ? Math.round(ewHCP / totalHCP * 100) : 50 
    });
    setTopPlayer({
      direction: topPlayerKey,
      name: stats[topPlayerKey].name,
      avgScore: topPlayerAvg.toFixed(1),
      deals: stats[topPlayerKey].deals,
      madePercentage: stats[topPlayerKey].deals > 0 
        ? Math.round((stats[topPlayerKey].madeContracts / stats[topPlayerKey].deals) * 100) 
        : 0
    });
  }, [gameData, playerStats.N.name, playerStats.E.name, playerStats.S.name, playerStats.W.name]);
  
  // Prepare data for player performance chart
  const playerChartData = {
    labels: Object.values(playerStats).map(p => p.name),
    datasets: [
      {
        label: 'Average Points Per Deal as Declarer',
        data: Object.values(playerStats).map(p => 
          p.deals > 0 ? (p.points / p.deals).toFixed(1) : 0
        ),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Points'
        }
      }
    }
  };

  return (
    <div className="player-ranking-container">
      {topPlayer && (
        <div className="top-player-section">
          <h2>Top Player</h2>
          <div className="top-player-card">
            <div className="top-player-badge">🏆</div>
            <div className="top-player-name">{topPlayer.name}</div>
            <div className="top-player-direction">Playing as {topPlayer.direction === 'N' ? 'North' : 
                                                              topPlayer.direction === 'S' ? 'South' : 
                                                              topPlayer.direction === 'E' ? 'East' : 'West'}</div>
            <div className="top-player-stats">
              <div className="stat-item">
                <div className="stat-value">{topPlayer.avgScore}</div>
                <div className="stat-label">Avg. Points Per Deal</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{topPlayer.deals}</div>
                <div className="stat-label">Contracts Played</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{topPlayer.madePercentage}%</div>
                <div className="stat-label">Contracts Made</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="player-performance-section">
        <h3>Player Performance</h3>
        <Bar data={playerChartData} options={chartOptions} />
      </div>
      
      <div className="stats-comparison-grid">
        {/* You can add content for the stats comparison grid here if needed */}
      </div>
    </div>
  );
};

export default PlayerRankingComponent;