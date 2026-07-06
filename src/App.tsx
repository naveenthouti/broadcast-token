import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { TokenDisplay } from './components/TokenDisplay';
import { ActionButtons } from './components/ActionButtons';
import { tokenService } from './services/tokenService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial authentication state
    setIsAuthenticated(!!tokenService.getCurrentToken());

    // Subscribe to token changes
    const unsubscribe = tokenService.subscribe((event) => {
      if (event.type === 'TOKEN_UPDATED' || event.type === 'TOKEN_REFRESHED') {
        setIsAuthenticated(!!event.token);
      } else if (event.type === 'LOGOUT') {
        setIsAuthenticated(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 Token Sharing Demo</h1>
        <p className="subtitle">Broadcast Channel API - Share tokens between browser tabs</p>
      </header>

      <main className="app-main">
        <div className="info-banner">
          <p>
            <strong>How to test:</strong> Open this application in multiple tabs. 
            Login in one tab and watch the token sync automatically across all tabs!
          </p>
        </div>

        <div className="content-grid">
          <div className="card">
            <LoginForm />
          </div>

          <div className="card">
            <TokenDisplay />
          </div>

          {isAuthenticated && (
            <div className="card">
              <ActionButtons />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, and Broadcast Channel API</p>
      </footer>
    </div>
  );
}

export default App;
