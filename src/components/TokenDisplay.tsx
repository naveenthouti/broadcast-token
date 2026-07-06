import { useState, useEffect } from 'react';
import { tokenService } from '../services/tokenService';
import type { Token, TokenEvent } from '../types/token';

export function TokenDisplay() {
  const [token, setToken] = useState<Token | null>(null);
  const [events, setEvents] = useState<TokenEvent[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Initial token check
    const currentToken = tokenService.getCurrentToken();
    setToken(currentToken);
    setIsValid(tokenService.isTokenValid());

    // Subscribe to token events
    const unsubscribe = tokenService.subscribe((event) => {
      setEvents(prev => [event, ...prev].slice(0, 10)); // Keep last 10 events
      
      if (event.type === 'TOKEN_UPDATED' || event.type === 'TOKEN_REFRESHED') {
        setToken(event.token || null);
        setIsValid(!!event.token);
      } else if (event.type === 'LOGOUT') {
        setToken(null);
        setIsValid(false);
      }
    });

    return unsubscribe;
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatExpiresAt = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="token-display">
      <h2>Token Status</h2>
      
      {token ? (
        <div className="token-info">
          <div className="token-field">
            <label>Access Token:</label>
            <code className="token-value">{token.accessToken.substring(0, 20)}...</code>
          </div>
          
          <div className="token-field">
            <label>Refresh Token:</label>
            <code className="token-value">{token.refreshToken.substring(0, 20)}...</code>
          </div>
          
          <div className="token-field">
            <label>Expires At:</label>
            <span className="token-value">{formatExpiresAt(token.expiresAt)}</span>
          </div>
          
          <div className="token-field">
            <label>Status:</label>
            <span className={`status ${isValid ? 'valid' : 'expired'}`}>
              {isValid ? '✓ Valid' : '✗ Expired'}
            </span>
          </div>
        </div>
      ) : (
        <div className="no-token">
          <p>No token available</p>
        </div>
      )}

      <div className="events-log">
        <h3>Event Log (Last 10)</h3>
        {events.length === 0 ? (
          <p className="no-events">No events yet</p>
        ) : (
          <ul className="events-list">
            {events.map((event, index) => (
              <li key={index} className="event-item">
                <span className="event-time">{formatTime(event.timestamp)}</span>
                <span className={`event-type event-type-${event.type.toLowerCase()}`}>
                  {event.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
