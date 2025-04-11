# BonusBridge

BonusBridge is a Progressive Web App (PWA) for scoring contract bridge games. It provides an intuitive interface for entering contract bids, tricks taken, and calculating scores according to standard bridge scoring rules.

## Features

- **Deal Tracking**: Track deals, bidding, and scoring
- **Contract Input**: Easy input for contract level, suit, and doubling
- **Trick Input**: Record tricks taken and automatically calculate scores
- **Score Adjustment**: Make adjustments to scores when needed
- **Results Display**: View game results with comprehensive statistics
- **Player Rankings**: Track player performance over time
- **Email Sharing**: Share game results via email
- **Offline Capability**: Use the app even without an internet connection
- **Mobile Optimized**: Responsive design works on all devices

## Installation

### Web Version
1. Visit the app at [your-deployed-url.com]
2. For the best experience, click "Add to Home Screen" when prompted

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/bonusbridge.git

# Navigate to the project directory
cd bonusbridge

# Install dependencies
npm install

# Start the development server
npm start
```

## PWA Features

BonusBridge is a full Progressive Web App with:
- Offline functionality
- Home screen installation
- Fast loading times
- Mobile-optimized interface

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── deals/        # Deal selection and bidding 
│   └── game/         # Game play components
├── pages/            # Full page components
├── services/         # Service layers 
├── styles/           # CSS styling
│   └── components/   # Component-specific styles
└── utils/            # Utility functions
```

## Bridge Scoring

This app implements standard contract bridge scoring rules, including:
- Trick point calculation
- Game and slam bonuses
- Overtrick and undertrick scoring
- Vulnerability considerations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.