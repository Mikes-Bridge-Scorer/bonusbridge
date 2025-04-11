// src/utils/bridgeScoring.js

/**
 * Calculate the raw score for a contract based on bridge scoring rules
 * @param {Object} contractData - Contract information
 * @returns {number} - The raw score
 */
function calculateContractScore(contractData) {
  console.log('SCORING DEBUG: calculateContractScore called with data:', contractData);
  
  const { 
    level, 
    suit, 
    declarer, 
    isDoubled, 
    isRedoubled, 
    isVulnerable, 
    tricksMade, 
    tricksNeeded 
  } = contractData;
  
  const levelNum = parseInt(level);
  const tricksMadeNum = parseInt(tricksMade);
  const tricksNeededNum = parseInt(tricksNeeded);
  
  // Determine if contract was made or not
  const contractMade = tricksMadeNum >= tricksNeededNum;
  
  // If contract was not made, calculate penalty
  if (!contractMade) {
    const undertricks = Math.abs(tricksNeededNum - tricksMadeNum);
    console.log('SCORING DEBUG: Contract not made, calculating undertrick score:', 
                { undertricks, isVulnerable, isDoubled, isRedoubled });
    return calculateUndertrickScore(
      undertricks,
      isVulnerable,
      isDoubled,
      isRedoubled
    );
  }
  
  // Calculate made contract score
  let score = 0;
  
  // Step 1: Calculate trick score
  if (suit === 'NT') {
    // NT scoring: First trick = 40, subsequent tricks = 30 each
    score += 40 + (levelNum - 1) * 30;
  } else if (suit === '♣' || suit === '♦' || suit === 'C' || suit === 'D') {
    // Minor suit scoring: 20 per trick
    score += levelNum * 20;
  } else {
    // Major suit scoring: 30 per trick
    score += levelNum * 30;
  }
  
  // Double and redouble increase trick score
  if (isDoubled) score *= 2;
  if (isRedoubled) score *= 4;
  
  // Step 2: Calculate overtrick bonuses
  const overtricks = tricksMadeNum - tricksNeededNum;
  if (overtricks > 0) {
    let overtrickValue;
    
    if (isRedoubled) {
      overtrickValue = isVulnerable ? 400 : 200;
    } else if (isDoubled) {
      overtrickValue = isVulnerable ? 200 : 100;
    } else {
      if (suit === 'NT') {
        overtrickValue = 30;
      } else if (suit === '♣' || suit === '♦' || suit === 'C' || suit === 'D') {
        overtrickValue = 20;
      } else {
        overtrickValue = 30;
      }
    }
    
    score += overtricks * overtrickValue;
  }
  
  // Step 3: Add insult bonus for making doubled/redoubled contracts
  if (isDoubled) score += 50;
  if (isRedoubled) score += 100;
  
  // Step 4: Add game/slam bonus
  const isGame = isGameContract(levelNum, suit);
  const isSmallSlam = levelNum === 6;
  const isGrandSlam = levelNum === 7;
  
  if (isGrandSlam) {
    score += isVulnerable ? 1500 : 1000; // Grand slam bonus
  } else if (isSmallSlam) {
    score += isVulnerable ? 750 : 500; // Small slam bonus
  } else if (isGame) {
    score += isVulnerable ? 500 : 300; // Game bonus
  } else {
    score += 50; // Part score bonus
  }
  
  console.log('SCORING DEBUG: Made contract score:', score);
  return score;
}

/**
 * Calculate score for undertricks
 * @param {number} undertricks - Number of undertricks
 * @param {boolean} isVulnerable - Whether the declarer is vulnerable
 * @param {boolean} isDoubled - Whether the contract is doubled
 * @param {boolean} isRedoubled - Whether the contract is redoubled
 * @returns {number} - The negative score for undertricks
 */
function calculateUndertrickScore(undertricks, isVulnerable, isDoubled, isRedoubled) {
  console.log('SCORING DEBUG: calculateUndertrickScore called with:', 
              { undertricks, isVulnerable, isDoubled, isRedoubled });
  
  let score = 0;
  
  if (isRedoubled) {
    if (isVulnerable) {
      // Vulnerable redoubled undertricks
      // First trick = 400, each additional = 600
      score = 400 + (undertricks - 1) * 600;
    } else {
      // Non-vulnerable redoubled undertricks
      // First trick = 200, second and third = 400 each, subsequent = 600 each
      if (undertricks === 1) {
        score = 200;
      } else if (undertricks <= 3) {
        score = 200 + (undertricks - 1) * 400;
      } else {
        score = 200 + 2 * 400 + (undertricks - 3) * 600;
      }
    }
  } else if (isDoubled) {
    if (isVulnerable) {
      // Vulnerable doubled undertricks
      // First trick = 200, each additional = 300
      score = 200 + (undertricks - 1) * 300;
      console.log('SCORING DEBUG: Vulnerable doubled undertrick calculation:', 
                 { undertricks, formula: '200 + (undertricks - 1) * 300', score });
    } else {
      // Non-vulnerable doubled undertricks
      // First trick = 100, second and third = 200 each, subsequent = 300 each
      if (undertricks === 1) {
        score = 100;
      } else if (undertricks <= 3) {
        score = 100 + (undertricks - 1) * 200;
      } else {
        score = 100 + 2 * 200 + (undertricks - 3) * 300;
      }
      console.log('SCORING DEBUG: Non-vulnerable doubled undertrick calculation:', 
                 { undertricks, formula: undertricks <= 3 ? 
                    '100 + (undertricks - 1) * 200' : 
                    '100 + 2 * 200 + (undertricks - 3) * 300', 
                  score });
    }
  } else {
    // Undoubled undertricks
    if (isVulnerable) {
      score = 100 * undertricks;
    } else {
      score = 50 * undertricks;
    }
  }
  
  console.log('SCORING DEBUG: Final undertrick score before negation:', score);
  return -score; // Return negative score for undertricks
}

/**
 * Determine if a contract is a game contract
 * @param {number} level - Contract level
 * @param {string} suit - Contract suit
 * @returns {boolean} - Whether it's a game contract
 */
function isGameContract(level, suit) {
  return (level === 3 && suit === 'NT') || 
         (level === 4 && (suit === '♥' || suit === '♠' || suit === 'H' || suit === 'S')) || 
         (level === 5 && (suit === '♣' || suit === '♦' || suit === 'C' || suit === 'D')) ||
         level >= 6;
}

/**
 * Calculate distribution adjustment points based on the specified scale
 * @param {number} distributionPoints - Number of distribution points
 * @param {boolean} isNoTrump - Whether the contract is NT
 * @returns {number} - The deduction to apply
 */
function calculateDistributionDeduction(distributionPoints, isNoTrump) {
  // No deduction for NT contracts
  if (isNoTrump) {
    return 0;
  }
  
  // Apply the scale for other contracts
  if (distributionPoints <= 2) {
    return 0;
  } else if (distributionPoints === 3) {
    return 1;
  } else if (distributionPoints === 4) {
    return 2;
  } else if (distributionPoints === 5) {
    return 3;
  } else if (distributionPoints === 6) {
    return 4;
  } else {
    // 7 or greater = -5
    return 5;
  }
}

/**
 * Generate a contract analysis comment
 * @param {Object} contractData - Contract information 
 * @returns {string} - Analysis comment
 */
function generateContractComment(contractData) {
  const { level, suit, declarer, tricksMade, tricksNeeded, isDoubled, isRedoubled } = contractData;
  
  const tricksMadeNum = parseInt(tricksMade);
  const tricksNeededNum = parseInt(tricksNeeded);
  const difference = tricksMadeNum - tricksNeededNum;
  
  let comment = '';
  
  // Contract was made
  if (difference >= 0) {
    if (isGameContract(parseInt(level), suit)) {
      if (parseInt(level) >= 6) {
        comment = `Impressive slam contract ${level}${suit} by ${declarer}`;
        if (difference > 0) {
          comment += ` making ${difference} overtrick${difference > 1 ? 's' : ''}!`;
        } else {
          comment += ' made exactly.';
        }
      } else {
        comment = `Good game contract ${level}${suit} by ${declarer}`;
        if (difference > 0) {
          comment += ` with ${difference} overtrick${difference > 1 ? 's' : ''}.`;
        } else {
          comment += ' made exactly.';
        }
      }
    } else {
      comment = `Part score ${level}${suit} by ${declarer}`;
      if (difference > 0) {
        comment += ` with ${difference} overtrick${difference > 1 ? 's' : ''}.`;
      } else {
        comment += ' made exactly.';
      }
    }
    
    // Add extra flair for doubled/redoubled contracts that made
    if (isRedoubled && difference >= 0) {
      comment += ' Redoubled and made - well done!';
    } else if (isDoubled && difference >= 0) {
      comment += ' Doubled and made - good play!';
    }
  }
  // Contract was defeated
  else {
    const undertricks = Math.abs(difference);
    if (isGameContract(parseInt(level), suit)) {
      comment = `Game contract ${level}${suit} by ${declarer} went down ${undertricks}.`;
      if (undertricks >= 3) {
        comment += ' Difficult hand to make.';
      }
    } else {
      comment = `Part score ${level}${suit} by ${declarer} went down ${undertricks}.`;
    }
    
    // Add comment for doubled/redoubled contracts that went down
    if (isRedoubled) {
      comment += ' Redoubled - ouch!';
    } else if (isDoubled) {
      comment += ' Doubled - good defense.';
    }
  }
  
  return comment;
}

module.exports = {
  calculateContractScore,
  calculateUndertrickScore,
  isGameContract,
  calculateDistributionDeduction,
  generateContractComment
};