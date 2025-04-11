// src/pages/GameResultsPage.js

import React from 'react';
import '../styles/components/gameResults.css';

const GameResultsPage = ({ gameResults, onReturnHome }) => {
  return (
    <div className="game-results-container">
      <div className="results-header">
        <h1>Game Results</h1>
        <div className="score-totals">
          <div className="score-total ns">
            <h2>North-South</h2>
            <p className="total-score">{gameResults.totalNS}</p>
          </div>
          <div className="score-total ew">
            <h2>East-West</h2>
            <p className="total-score">{gameResults.totalEW}</p>
          </div>
        </div>
      </div>

      <div className="results-details">
        <h2>Deal Details</h2>
        <table className="results-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Contract</th>
              <th>By</th>
              <th>Result</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {gameResults.deals.map((deal, index) => (
              <tr key={index}>
                <td>{deal.dealNumber}</td>
                <td>
                  {deal.contract.level}{deal.contract.strain} 
                  {deal.contract.doubled ? 'X' : ''}
                  {deal.contract.redoubled ? 'XX' : ''}
                </td>
                <td>{deal.contract.declarer}</td>
                <td>{deal.tricksTaken} tricks</td>
                <td className={deal.score > 0 ? "positive-score" : "negative-score"}>
                  {deal.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="results-actions">
        <button className="primary-button" onClick={onReturnHome}>
          Return to Home
        </button>
        <button className="secondary-button" onClick={() => window.print()}>
          Print Results
        </button>
      </div>
    </div>
  );
};

export default GameResultsPage;