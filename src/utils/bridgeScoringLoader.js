// src/utils/bridgeScoringLoader.js

/**
 * Bridge scoring utility - direct implementation matching the original BridgeScoring.js
 * This standalone implementation eliminates dependency on external script loading
 */

// Score calculation without depending on external library
export const calculateBridgeScore = (level, suit, tricks, vulnerable, doubled = false, redoubled = false) => {
  console.log(`Calculating score: level=${level}, suit=${suit}, tricks=${tricks}, vulnerable=${vulnerable}, doubled=${doubled}, redoubled=${redoubled}`);
  
  // Ensure parameters are the correct type
  level = parseInt(level);
  tricks = parseInt(tricks);
  
  // Constants for scoring calculations
  const TRICK_VALUES = {
    'C': 20, 'D': 20, 'H': 30, 'S': 30, 'NT': 30
  };

  const BONUS_SCORES = {
    PART_SCORE: 50,
    GAME: {
      VULNERABLE: 500,
      NON_VULNERABLE: 300
    },
    SMALL_SLAM: {
      VULNERABLE: 750,
      NON_VULNERABLE: 500
    },
    GRAND_SLAM: {
      VULNERABLE: 1500,
      NON_VULNERABLE: 1000
    },
    DOUBLED: 50,
    REDOUBLED: 100
  };
  
  try {
    const contractTricks = level + 6;
    
    // Base trick score calculation
    let trickScore = 0;
    if (suit === 'NT') {
      trickScore = 40 + (30 * (level - 1));
    } else if (TRICK_VALUES[suit]) {
      trickScore = level * TRICK_VALUES[suit];
    } else {
      console.error(`Invalid suit: ${suit}`);
      return 0;
    }
    
    // Apply doubling multipliers
    if (redoubled) {
      trickScore *= 4;
    } else if (doubled) {
      trickScore *= 2;
    }
    
    // Reset breakdown for a clean calculation
    const breakdown = {
      trickScore: 0,
      overtrickScore: 0,
      bonusScore: 0,
      slamBonus: 0,
      doubledBonus: 0
    };
    
    breakdown.trickScore = trickScore;
    
    if (tricks >= contractTricks) {
      // Making the contract
      
      // Calculate overtricks
      if (tricks > contractTricks) {
        const overtricks = tricks - contractTricks;
        if (!doubled && !redoubled) {
          const overtrickValue = suit === 'NT' ? 30 : TRICK_VALUES[suit];
          breakdown.overtrickScore = overtrickValue * overtricks;
        } else if (doubled) {
          breakdown.overtrickScore = (vulnerable ? 200 : 100) * overtricks;
        } else if (redoubled) {
          breakdown.overtrickScore = (vulnerable ? 400 : 200) * overtricks;
        }
      }

      // Game or partscore bonus
      let basePoints = suit === 'NT' ? 40 + (30 * (level - 1)) : level * TRICK_VALUES[suit];
      if (doubled) basePoints *= 2;
      if (redoubled) basePoints *= 4;
      
      if (basePoints >= 100) {
          breakdown.bonusScore = vulnerable ? 
              BONUS_SCORES.GAME.VULNERABLE : 
              BONUS_SCORES.GAME.NON_VULNERABLE;
      } else {
          breakdown.bonusScore = BONUS_SCORES.PART_SCORE;
      }

      // Slam bonus
      if (level === 6) {
          breakdown.slamBonus = vulnerable ? 
              BONUS_SCORES.SMALL_SLAM.VULNERABLE : 
              BONUS_SCORES.SMALL_SLAM.NON_VULNERABLE;
      } else if (level === 7) {
          breakdown.slamBonus = vulnerable ? 
              BONUS_SCORES.GRAND_SLAM.VULNERABLE : 
              BONUS_SCORES.GRAND_SLAM.NON_VULNERABLE;
      }

      // Insult bonus for making doubled/redoubled contracts
      if (doubled) {
          breakdown.doubledBonus = BONUS_SCORES.DOUBLED;
      } else if (redoubled) {
          breakdown.doubledBonus = BONUS_SCORES.REDOUBLED;
      }

      const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
      console.log("Contract made, score breakdown:", breakdown, "Total:", totalScore);
      return totalScore;
    } else {
      // Going down
      const undertricks = contractTricks - tricks;
      let undertrickScore = 0;

      if (doubled) {
        if (vulnerable) {
          undertrickScore = -(undertricks === 1 ? 200 : 300 + (undertricks - 2) * 300);
        } else {
          undertrickScore = -(undertricks === 1 ? 100 : 300 + (undertricks - 2) * 200);
        }
      } else if (redoubled) {
        if (vulnerable) {
          undertrickScore = -(undertricks === 1 ? 400 : 600 + (undertricks - 2) * 600);
        } else {
          undertrickScore = -(undertricks === 1 ? 200 : 600 + (undertricks - 2) * 400);
        }
      } else {
        // Undoubled undertricks
        undertrickScore = vulnerable ? -(undertricks * 100) : -(undertricks * 50);
      }
      
      console.log("Contract down by", undertricks, "tricks. Score:", undertrickScore);
      return undertrickScore;
    }
  } catch (error) {
    console.error("Bridge scoring error:", error);
    return 0;
  }
};

// Export a simple loader function for compatibility with previous code
export const loadBridgeScoring = () => {
  return Promise.resolve({
    calculateScore: calculateBridgeScore
  });
};