export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export type TokenEventType = 'TOKEN_UPDATED' | 'TOKEN_REFRESHED' | 'LOGOUT';

export interface TokenEvent {
  type: TokenEventType;
  token?: Token;
  timestamp: number;
}
