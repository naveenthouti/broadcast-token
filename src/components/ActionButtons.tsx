import { useState } from 'react';
import { tokenService } from '../services/tokenService';

export function ActionButtons() {
  const [loading, setLoading] = useState<'refresh' | 'logout' | null>(null);
  const [message, setMessage] = useState('');

  const handleRefresh = async () => {
    setLoading('refresh');
    setMessage('');
    
    try {
      await tokenService.refreshToken();
      setMessage('Token refreshed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to refresh token');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    setLoading('logout');
    setMessage('');
    
    try {
      await tokenService.logout();
      setMessage('Logged out successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to logout');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(null);
    }
  };

  const hasToken = !!tokenService.getCurrentToken();

  return (
    <div className="action-buttons">
      {message && <div className="message">{message}</div>}
      
      <button
        onClick={handleRefresh}
        disabled={!hasToken || loading === 'refresh'}
        className="action-button refresh-button"
      >
        {loading === 'refresh' ? 'Refreshing...' : 'Refresh Token'}
      </button>
      
      <button
        onClick={handleLogout}
        disabled={!hasToken || loading === 'logout'}
        className="action-button logout-button"
      >
        {loading === 'logout' ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
