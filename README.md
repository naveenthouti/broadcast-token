# 🔐 Broadcast Token Sharing Demo

A React TypeScript application demonstrating how to share authentication tokens between multiple browser tabs using the Broadcast Channel API. Includes a Node.js mock server for token refresh API calls.

## 🌟 Features

- **Token Sharing**: Automatically syncs authentication tokens across multiple browser tabs
- **Broadcast Channel API**: Uses modern browser APIs for real-time communication
- **Token Refresh**: Automatic token refresh with mock server integration
- **Event Logging**: Real-time event log showing token updates across tabs
- **Mock Auth Server**: Node.js/Express server with login, refresh, and logout endpoints
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Beautiful UI that works on all screen sizes

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **broadcast-channel** - Cross-tab communication
- **Axios** - HTTP client for API calls

### Backend (Mock Server)
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd broadcast-token
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` if needed (defaults to `http://localhost:3001` for the API)

## 🏃 Running the Application

### Start the Mock Server

In one terminal:
```bash
npm run server
```

The server will start on `http://localhost:3001` with the following endpoints:
- `POST /api/login` - Login endpoint
- `POST /api/refresh` - Token refresh endpoint
- `POST /api/logout` - Logout endpoint
- `GET /api/health` - Health check endpoint

### Start the React Application

In another terminal:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing the Broadcast Channel

1. Open the application in a browser tab
2. Login with any username and password
3. Open the same URL in a new tab
4. Watch the token automatically sync to the new tab
5. Refresh the token in one tab and see it update in all tabs
6. Logout in one tab and watch all tabs update

## 📁 Project Structure

```
broadcast-token/
├── src/
│   ├── components/
│   │   ├── ActionButtons.tsx    # Refresh and logout buttons
│   │   ├── LoginForm.tsx        # Login form component
│   │   └── TokenDisplay.tsx     # Token status display
│   ├── services/
│   │   └── tokenService.ts      # Token management with broadcast channel
│   ├── types/
│   │   └── token.ts             # TypeScript type definitions
│   ├── App.tsx                  # Main application component
│   └── App.css                  # Application styles
├── server/
│   ├── index.ts                 # Mock auth server
│   ├── package.json             # Server dependencies
│   └── tsconfig.json            # Server TypeScript config
├── package.json                 # Frontend dependencies
├── tsconfig.json                # Frontend TypeScript config
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

## 🔑 How It Works

### Leader-Follower Pattern for Token Sharing

This implementation uses a **Leader-Follower pattern** to efficiently manage token synchronization across multiple browser tabs:

#### How the Pattern Works

1. **Leader Tab (Active Tab)**
   - The tab where the user performs the login action becomes the "leader"
   - Leader tab makes actual API calls to the authentication server
   - Leader tab stores tokens in localStorage
   - Leader tab broadcasts token changes to all other tabs via Broadcast Channel
   - Leader tab handles token refresh operations

2. **Follower Tabs (Passive Tabs)**
   - All other tabs act as "followers"
   - Followers listen to the Broadcast Channel for token events
   - Followers update their local state when they receive events
   - Followers do NOT make API calls for token operations
   - Followers rely on the leader to handle authentication

#### Benefits of Leader-Follower Pattern

- **Reduced API Calls**: Only one tab makes authentication API calls, reducing server load
- **Consistency**: All tabs stay synchronized through a single source of truth
- **Race Condition Prevention**: Prevents multiple tabs from trying to refresh tokens simultaneously
- **Efficiency**: Followers get instant updates without network latency
- **Reliability**: If the leader tab is closed, another tab can take over leadership

#### Event Flow

```
User Action (Leader Tab)
    ↓
API Call to Server
    ↓
Store Token in localStorage
    ↓
Broadcast Event via Channel
    ↓
All Follower Tabs Receive Event
    ↓
Followers Update Local State
```

### Token Service
The `tokenService` manages authentication tokens and uses the Broadcast Channel API to sync them across tabs:

1. **Login**: Calls the mock API to get tokens, stores them in localStorage, and broadcasts the update
2. **Token Refresh**: Automatically refreshes expired tokens using the refresh token
3. **Broadcast Channel**: All tabs listen for token events and update their local state accordingly
4. **Logout**: Clears tokens and broadcasts the logout event to all tabs

### Event Types
- `TOKEN_UPDATED` - New token created (login)
- `TOKEN_REFRESHED` - Token refreshed
- `LOGOUT` - User logged out

### Mock Server
The mock server simulates a real authentication backend:
- Generates access and refresh tokens
- Validates refresh tokens
- Handles logout by invalidating refresh tokens
- Uses in-memory storage (reset on server restart)

## 🎨 Customization

### Change API URL
Edit `.env` file:
```
VITE_API_URL=http://your-api-server.com
```

### Adjust Token Expiry
Modify the server's `expiresIn` value in `server/index.ts`:
```typescript
const expiresIn = 3600; // 1 hour in seconds
```

### Change Broadcast Channel Name
Edit `src/services/tokenService.ts`:
```typescript
const CHANNEL_NAME = 'your_custom_channel_name';
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy Server
For production, deploy the mock server to a hosting service like:
- Vercel
- Railway
- Render
- AWS Lambda
- DigitalOcean

## 📝 API Endpoints

### POST /api/login
Request:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "access_...",
  "refreshToken": "refresh_...",
  "expiresIn": 3600
}
```

### POST /api/refresh
Request:
```json
{
  "refreshToken": "refresh_..."
}
```

Response:
```json
{
  "accessToken": "new_access_...",
  "refreshToken": "new_refresh_...",
  "expiresIn": 3600
}
```

### POST /api/logout
Request:
```json
{
  "refreshToken": "refresh_..."
}
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

### GET /api/health
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "activeTokens": 5
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- [broadcast-channel](https://github.com/pubkey/broadcast-channel) - Cross-tab communication library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [React](https://react.dev/) - The library for web and native user interfaces
