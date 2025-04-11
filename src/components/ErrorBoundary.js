// C:/bridge-scorer/bonusbridge/src/components/ErrorBoundary.js

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px auto', 
          maxWidth: '500px',
          backgroundColor: '#f8d7da',
          borderRadius: '5px',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          <h2>Something went wrong</h2>
          <p>
            {this.state.error && this.state.error.toString()}
          </p>
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={this.resetError}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0069d9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;