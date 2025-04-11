// src/services/EmailService.js

/**
 * Service to handle email-related functionality for the Bonus Bridge app
 */
class EmailService {
  /**
   * Send results to all players with BCC to admin
   * @param {Object} gameData - Complete game data
   * @param {Object} players - Player information including emails
   * @param {String} format - Format of the results (csv, pdf, html)
   * @returns {Promise} Promise resolving to success or error message
   */
  static sendResultsEmail(gameData, players, format = 'csv') {
    return new Promise((resolve, reject) => {
      try {
        // In a real implementation, this would connect to an email API service
        // like SendGrid, Mailgun, AWS SES, etc.
        
        const adminEmail = 'mike.calpe@gmail.com';
        
        // Get player emails
        const playerEmails = [];
        if (players) {
          ['North', 'East', 'South', 'West'].forEach(direction => {
            if (players[direction] && players[direction].email) {
              playerEmails.push(players[direction].email);
            }
          });
        }
        
        // Create appropriate attachment based on format
        let attachment;
        switch (format) {
          case 'csv':
            attachment = this.generateCSV(gameData);
            break;
          case 'pdf':
            attachment = this.generatePDF(gameData);
            break;
          case 'html':
            // For HTML email, the content is in the body, not as attachment
            break;
          default:
            attachment = this.generateCSV(gameData);
        }
        
        // Create email body/content
        const emailContent = format === 'html' 
          ? this.generateHTMLEmail(gameData, players) 
          : this.generateBasicEmailText(gameData, players);
          
        console.log('Email would be sent to:', playerEmails);
        console.log('With BCC to:', adminEmail);
        console.log('Email format:', format);
        
        // In actual implementation, you would call your email service here
        // Example: 
        // const response = await emailAPI.send({
        //   to: playerEmails,
        //   bcc: [adminEmail],
        //   subject: `Bonus Bridge Game Results - ${new Date().toLocaleDateString()}`,
        //   body: emailContent,
        //   attachments: format !== 'html' ? [attachment] : []
        // });
        
        // For demonstration, we'll just resolve with a success message
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: `Results email sent to ${playerEmails.length} players`
          });
        }, 1000);
      } catch (error) {
        reject({ 
          success: false,
          message: `Failed to send results email: ${error.message}`
        });
      }
    });
  }
  
  /**
   * Generate CSV data for game results
   * @param {Object} gameData - Complete game data
   * @returns {Object} Object with filename and data
   */
  static generateCSV(gameData) {
    // Headers for CSV
    let csvContent = "Deal,Contract,By,Vulnerability,Result,Raw Score,HCP,Distribution,Points\n";
    
    // Add data rows
    gameData.contracts.forEach((contract, index) => {
      const isNS = contract.declarer === 'N' || contract.declarer === 'S';
      const tricksDiff = contract.tricksMade - contract.tricksNeeded;
      const result = tricksDiff >= 0
        ? `Made ${tricksDiff > 0 ? '+' + tricksDiff : ''}`
        : `Down ${Math.abs(tricksDiff)}`;
      
      csvContent += `${index + 1},`;
      csvContent += `${contract.level}${contract.suit}${contract.isDoubled ? ' X' : ''}${contract.isRedoubled ? ' XX' : ''},`;
      csvContent += `${contract.declarer},`;
      csvContent += `${contract.isVulnerable ? 'V' : 'NV'},`;
      csvContent += `${result},`;
      csvContent += `${contract.rawScore},`;
      csvContent += `${contract.hcp || ''},`;
      csvContent += `${contract.distributionPoints || ''},`;
      csvContent += `${isNS ? gameData.scores['North-South'] / gameData.contracts.length : gameData.scores['East-West'] / gameData.contracts.length}\n`;
    });
    
    // Add summary row
    csvContent += `\nFinal Score,NS: ${gameData.scores['North-South']},EW: ${gameData.scores['East-West']}\n`;
    
    return {
      filename: `bonus-bridge-results-${new Date().toISOString().split('T')[0]}.csv`,
      data: csvContent
    };
  }
  
  /**
   * Generate PDF data for game results
   * @param {Object} gameData - Complete game data
   * @returns {Object} Object with filename and binary data (placeholder)
   */
  static generatePDF(gameData) {
    // This would use a PDF library like jsPDF in actual implementation
    // For now, we'll just return a placeholder
    
    return {
      filename: `bonus-bridge-results-${new Date().toISOString().split('T')[0]}.pdf`,
      data: "PDF_BINARY_DATA_PLACEHOLDER"
    };
  }
  
  /**
   * Generate HTML email content for game results
   * @param {Object} gameData - Complete game data
   * @param {Object} players - Player information
   * @returns {String} HTML content
   */
  static generateHTMLEmail(gameData, players) {
    // Create HTML email template
    const nsScore = gameData.scores['North-South'];
    const ewScore = gameData.scores['East-West'];
    const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
    const margin = Math.abs(nsScore - ewScore);
    
    // Calculate player statistics
    const nsDeals = gameData.contracts.filter(c => 
      c.declarer === 'N' || c.declarer === 'S').length;
    const ewDeals = gameData.contracts.filter(c => 
      c.declarer === 'E' || c.declarer === 'W').length;
    
    // Generate game highlights
    let highlights = '';
    if (gameData.contracts.length > 0) {
      // Check for slams
      const slams = gameData.contracts.filter(c => parseInt(c.level) >= 6);
      if (slams.length > 0) {
        highlights += `<p>Slam${slams.length > 1 ? 's' : ''} bid: `;
        highlights += slams.map(s => `${s.level}${s.suit} by ${s.declarer}`).join(', ');
        highlights += '</p>';
      }
      
      // Check for doubled contracts
      const doubled = gameData.contracts.filter(c => c.isDoubled || c.isRedoubled);
      if (doubled.length > 0) {
        highlights += `<p>Doubled contract${doubled.length > 1 ? 's' : ''}: `;
        highlights += doubled.map(d => `${d.level}${d.suit}${d.isRedoubled ? ' XX' : ' X'} by ${d.declarer}`).join(', ');
        highlights += '</p>';
      }
    }
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #0078d7; color: white; padding: 15px; text-align: center; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .summary { margin-bottom: 20px; }
          .winner { font-size: 18px; font-weight: bold; color: #0078d7; margin: 10px 0; }
          .highlights { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0078d7; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
          .players { margin-bottom: 20px; }
          .stats { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .stat-item { flex: 1; text-align: center; background-color: #f8f9fa; padding: 10px; margin: 0 5px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Bonus Bridge Game Results</h2>
          <p>${new Date().toLocaleDateString()}</p>
        </div>
        <div class="container">
          <div class="summary">
            <h3>Game Summary</h3>
            <p>Game Number: ${gameData.gameNumber}</p>
            <p>Number of Deals: ${gameData.contracts.length}</p>
            <p>Final Score: North-South ${nsScore} - East-West ${ewScore}</p>
            <p class="winner">${winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}</p>
          </div>
          
          <div class="players">
            <h3>Players</h3>
            <p><strong>North:</strong> ${players?.North?.name || 'N/A'}</p>
            <p><strong>East:</strong> ${players?.East?.name || 'N/A'}</p>
            <p><strong>South:</strong> ${players?.South?.name || 'N/A'}</p>
            <p><strong>West:</strong> ${players?.West?.name || 'N/A'}</p>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <h4>NS Contracts</h4>
              <div>${nsDeals}</div>
            </div>
            <div class="stat-item">
              <h4>EW Contracts</h4>
              <div>${ewDeals}</div>
            </div>
            <div class="stat-item">
              <h4>NS Points</h4>
              <div>${nsScore}</div>
            </div>
            <div class="stat-item">
              <h4>EW Points</h4>
              <div>${ewScore}</div>
            </div>
          </div>
          
          ${highlights ? `<div class="highlights"><h3>Game Highlights</h3>${highlights}</div>` : ''}
          
          <h3>Detailed Results</h3>
          <table>
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
    `;
    
    // Add rows for each contract
    gameData.contracts.forEach((contract, index) => {
      const tricksDiff = contract.tricksMade - contract.tricksNeeded;
      const result = tricksDiff >= 0
        ? `Made ${tricksDiff > 0 ? '+' + tricksDiff : ''}`
        : `Down ${Math.abs(tricksDiff)}`;
      
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${contract.level}${contract.suit}${contract.isDoubled ? ' X' : ''}${contract.isRedoubled ? ' XX' : ''}</td>
          <td>${contract.declarer}</td>
          <td>${result}</td>
          <td>${contract.rawScore}</td>
        </tr>
      `;
    });
    
    // Close the HTML
    html += `
            </tbody>
          </table>
          
          <p>Congratulations to ${winner === 'Tie' ? 'both teams' : winner}! Your results will be added to the World Ranking table at bridgescorer.com.</p>
          
          <div class="footer">
            <p>This email was sent from Bonus Bridge App.</p>
            <p>Visit <a href="https://bridgescorer.com">bridgescorer.com</a> to see the world league table.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Generate basic email text for formats with attachments
   * @param {Object} gameData - Complete game data
   * @param {Object} players - Player information
   * @returns {String} Plain text email content
   */
  static generateBasicEmailText(gameData, players) {
    const nsScore = gameData.scores['North-South'];
    const ewScore = gameData.scores['East-West'];
    const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
    const margin = Math.abs(nsScore - ewScore);
    
    return `
Bonus Bridge Game Results - ${new Date().toLocaleDateString()}

Game Number: ${gameData.gameNumber}
Number of Deals: ${gameData.contracts.length}

Players:
North: ${players?.North?.name || 'N/A'}
East: ${players?.East?.name || 'N/A'}
South: ${players?.South?.name || 'N/A'}
West: ${players?.West?.name || 'N/A'}

Final Score:
North-South: ${nsScore} points
East-West: ${ewScore} points

${winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}

Congratulations to ${winner === 'Tie' ? 'both teams' : winner}! Your results will be added to the World Ranking table.

Please see the attached file for detailed results.

Visit bridgescorer.com to see the world league table.
    `;
  }
  
  /**
   * Share results via the native share API if available
   * @param {Object} gameData - Game data to share
   * @returns {Promise} Promise resolving to success or error message
   */
  static shareResults(gameData) {
    return new Promise((resolve, reject) => {
      try {
        // Create the text to share
        const nsScore = gameData.scores['North-South'];
        const ewScore = gameData.scores['East-West'];
        const winner = nsScore > ewScore ? 'North-South' : ewScore > nsScore ? 'East-West' : 'Tie';
        const margin = Math.abs(nsScore - ewScore);
        
        const text = `
I just finished a game of Bonus Bridge!

Game Number: ${gameData.gameNumber}
Number of Deals: ${gameData.contracts.length}

Final Score:
North-South: ${nsScore} points
East-West: ${ewScore} points

${winner === 'Tie' ? 'Game Tied!' : `${winner} wins by ${margin} points!`}

Check out the full results at bridgescorer.com
        `;
        
        // Check if Web Share API is available
        if (navigator.share) {
          navigator.share({
            title: 'Bonus Bridge Game Results',
            text: text,
            // url: 'https://bridgescorer.com'
          })
          .then(() => {
            resolve({ success: true, message: 'Results shared successfully' });
          })
          .catch(error => {
            console.error('Error sharing:', error);
            
            // If sharing fails, try alternate method
            this.copyToClipboard(text)
              .then(() => resolve({ 
                success: true, 
                message: 'Results copied to clipboard' 
              }))
              .catch(() => reject({ 
                success: false, 
                message: 'Failed to share results' 
              }));
          });
        } else {
          // If Web Share API is not available, copy to clipboard
          this.copyToClipboard(text)
            .then(() => resolve({ 
              success: true, 
              message: 'Results copied to clipboard' 
            }))
            .catch(() => reject({ 
              success: false, 
              message: 'Failed to share results' 
            }));
        }
      } catch (error) {
        reject({ success: false, message: `Failed to share results: ${error.message}` });
      }
    });
  }
  
  /**
   * Helper function to copy text to clipboard
   * @param {String} text - Text to copy
   * @returns {Promise} Promise that resolves when copying is complete
   */
  static copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      // Modern browsers
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            resolve();
          } else {
            reject(new Error('Unable to copy text'));
          }
        } catch (err) {
          reject(err);
        }
      }
    });
  }
}

export default EmailService;