import { BroadcastChannel } from 'broadcast-channel';
import axios from 'axios';
import type { Token, TokenEvent, TokenEventType, TokenResponse } from '../types/token';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TOKEN_STORAGE_KEY = 'auth_tokens';
const CHANNEL_NAME = 'token_sync_channel';

class TokenService {
  private channel: BroadcastChannel<TokenEvent> | null = null;
  private listeners: Set<(event: TokenEvent) => void> = new Set();
  private refreshPromise: Promise<Token> | null = null;

  constructor() {
    this.initializeChannel();
  }

  private initializeChannel() {
    try {
      this.channel = new BroadcastChannel<TokenEvent>(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.notifyListeners(event);
      };
    } catch (error) {
      console.error('Failed to initialize broadcast channel:', error);
    }
  }

  private notifyListeners(event: TokenEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  private getStoredTokens(): Token | null {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored tokens:', error);
      return null;
    }
  }

  private setStoredTokens(token: Token) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  private clearStoredTokens() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private async broadcastEvent(type: TokenEventType, token?: Token) {
    const event: TokenEvent = {
      type,
      token,
      timestamp: Date.now()
    };

    try {
      await this.channel?.postMessage(event);
    } catch (error) {
      console.error('Failed to broadcast event:', error);
    }

    this.notifyListeners(event);
  }

  subscribe(listener: (event: TokenEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentToken(): Token | null {
    return this.getStoredTokens();
  }

  isTokenValid(): boolean {
    const token = this.getCurrentToken();
    if (!token) return false;
    return Date.now() < token.expiresAt;
  }

  async login(username: string, password: string): Promise<Token> {
    // Call actual API
    const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/login`, {
      username,
      password
    });
    
    const token: Token = {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: Date.now() + response.data.expiresIn * 1000
    };

    this.setStoredTokens(token);
    await this.broadcastEvent('TOKEN_UPDATED', token);
    
    return token;
  }

  async refreshToken(): Promise<Token> {
    // Prevent multiple refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentToken = this.getCurrentToken();
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    this.refreshPromise = this.performRefresh(currentToken.refreshToken);

    try {
      const newToken = await this.refreshPromise;
      this.setStoredTokens(newToken);
      await this.broadcastEvent('TOKEN_REFRESHED', newToken);
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<Token> {
    // Call the actual refresh API
    const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/refresh`, {
      refreshToken
    });
    
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresAt: Date.now() + response.data.expiresIn * 1000
    };
  }

  async logout() {
    const currentToken = this.getCurrentToken();
    if (currentToken) {
      try {
        await axios.post(`${API_BASE_URL}/api/logout`, {
          refreshToken: currentToken.refreshToken
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    this.clearStoredTokens();
    await this.broadcastEvent('LOGOUT');
  }

  async getValidToken(): Promise<Token> {
    const currentToken = this.getCurrentToken();
    
    if (currentToken && this.isTokenValid()) {
      return currentToken;
    }

    if (currentToken) {
      return await this.refreshToken();
    }

    throw new Error('No valid token available');
  }
}

export const tokenService = new TokenService();
