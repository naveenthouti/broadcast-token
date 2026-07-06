import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for refresh tokens (in production, use a database)
const refreshTokens = new Map<string, { username: string; expiresAt: number }>();

// Helper function to generate tokens
const generateAccessToken = (username: string): string => {
  return `access_${Date.now()}_${username}_${Math.random().toString(36).substring(7)}`;
};

const generateRefreshToken = (username: string): string => {
  return `refresh_${Date.now()}_${username}_${Math.random().toString(36).substring(7)}`;
};

// Login endpoint
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Simulate validation (in production, verify against database)
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Generate tokens
  const accessToken = generateAccessToken(username);
  const refreshToken = generateRefreshToken(username);
  const expiresIn = 3600; // 1 hour

  // Store refresh token
  refreshTokens.set(refreshToken, {
    username,
    expiresAt: Date.now() + expiresIn * 1000 * 24 // Refresh token valid for 24 hours
  });

  res.json({
    accessToken,
    refreshToken,
    expiresIn
  });
});

// Refresh token endpoint
app.post('/api/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  // Check if refresh token exists and is valid
  const tokenData = refreshTokens.get(refreshToken);

  if (!tokenData) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  if (Date.now() > tokenData.expiresAt) {
    refreshTokens.delete(refreshToken);
    return res.status(401).json({ error: 'Refresh token has expired' });
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(tokenData.username);
  const newRefreshToken = generateRefreshToken(tokenData.username);
  const expiresIn = 3600; // 1 hour

  // Delete old refresh token and store new one
  refreshTokens.delete(refreshToken);
  refreshTokens.set(newRefreshToken, {
    username: tokenData.username,
    expiresAt: Date.now() + expiresIn * 1000 * 24
  });

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn
  });
});

// Logout endpoint
app.post('/api/logout', (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }

  res.json({ message: 'Logged out successfully' });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeTokens: refreshTokens.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock Auth Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/login`);
  console.log(`  POST http://localhost:${PORT}/api/refresh`);
  console.log(`  POST http://localhost:${PORT}/api/logout`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
});
