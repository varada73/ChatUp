# Chatty

Chatty is a full-stack real-time chat application built with a React/Vite frontend and a Node.js/Express backend. It supports account registration, cookie-based authentication, friend discovery through connect codes, one-to-one conversations, live message delivery with Socket.IO, unread counts, typing indicators, and online/offline presence powered by Redis.

The repository is organized as a two-app workspace:

- `frontend/` contains the browser client built with React, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Axios, Socket.IO Client, and Sonner.
- `backend/` contains the API and real-time server built with Express, Socket.IO, MongoDB/Mongoose, Redis, JWT, bcrypt, and cookie-based sessions.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Backend API](#backend-api)
- [Socket Events](#socket-events)
- [Data Model](#data-model)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)

## Features

- User registration and login with password hashing.
- JWT authentication stored in an HTTP-only cookie.
- Protected frontend routes for authenticated users.
- Guest-only authentication page.
- User profile persistence through Zustand.
- Unique connect codes for adding friends.
- Friend/conversation creation through Socket.IO.
- One-to-one conversation list with search.
- Paginated message loading.
- Real-time message sending and receiving.
- Last-message previews.
- Per-user unread counts.
- Mark-as-read events.
- Typing state events.
- Online/offline status notifications.
- MongoDB-backed users, friendships, conversations, and messages.
- Redis-backed socket session tracking.
- Docker Compose file for local MongoDB and Redis.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Zustand
- Axios
- Socket.IO Client
- React Hook Form
- Zod
- Sonner
- Lucide React

### Backend

- Node.js with ES modules
- Express 5
- Socket.IO
- MongoDB
- Mongoose
- Redis
- JSON Web Tokens
- bcryptjs
- cookie-parser
- cors
- dotenv
- nanoid
- nodemon

### Infrastructure

- Docker Compose for MongoDB and Redis

## Architecture

Chatty uses a split HTTP and WebSocket architecture:

1. The frontend calls the backend REST API through Axios using `withCredentials: true`.
2. Login creates a signed JWT and stores it as the `jwt` cookie.
3. Protected API routes read and verify the cookie through the Express auth middleware.
4. Once a user is authenticated in the frontend, the Socket.IO client connects to the backend.
5. The Socket.IO authentication middleware reads the same `jwt` cookie from the socket handshake.
6. Redis tracks active socket sessions per user, which lets the server determine whether a user is online.
7. MongoDB stores users, friendships, conversations, and messages.
8. Real-time conversation updates are emitted through Socket.IO events.

High-level flow:

```text
React client
  |
  | REST: /api/auth, /api/conversations
  | Socket.IO: conversation:* events
  v
Express + Socket.IO server
  |
  | persistent data
  v
MongoDB
  |
  | presence/session tracking
  v
Redis
```

## Repository Structure

```text
Chatty/
  backend/
    controllers/
      authController.js
      conversationController.js
      messageController.js
    middleware/
      authMiddleware.js
    models/
      Conversation.js
      Friendship.js
      Message.js
      User.js
    routes/
      authRoutes.js
      conversationRoutes.js
      messageRoutes.js
    services/
      redisService.js
    socket/
      helper.js
      socketAuthMiddleware.js
      socketConversation.js
    utils/
      db.js
      generateUniqueConnectCode.js
      seedData.js
    docker-compose.yaml
    package.json
    server.js
    socket.js

  frontend/
    src/
      components/
        ChatWindow/
        Sidebar/
        ui/
      contexts/
        ConversationContext.tsx
        SocketContext.tsx
      hooks/
      pages/
        Auth/
        Chat/
      services/
      store/
      utils/
    package.json
    vite.config.ts
```

## Prerequisites

Install the following before running the project locally:

- Node.js 20 or newer
- npm
- Docker and Docker Compose, or local MongoDB and Redis installations

The repo currently includes `node_modules` folders, but a clean setup should still use `npm install` inside both apps to make sure dependencies match the lockfiles and the local machine.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/chatty
JWT_SECRET=replace-with-a-long-random-secret
REDIS_URI=redis://localhost:6379
```

Variable details:

- `PORT`: Express and Socket.IO server port.
- `CLIENT_ORIGIN`: allowed frontend origin for CORS and socket connections.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: secret used to sign and verify auth tokens.
- `REDIS_URI`: Redis connection string used for online presence.

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

The frontend uses this value for REST calls. The socket URL is derived from it by removing `/api`, so keep the value in the form `http://host:port/api`.

## Getting Started

Clone the repository and install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start MongoDB and Redis with Docker:

```bash
cd backend
docker compose up -d
```

This starts:

- MongoDB on `localhost:27017`
- Redis on `localhost:6379`

## Running the App

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Socket.IO server: `http://localhost:4000`

Open the frontend, register two users in separate browser sessions, copy one user's connect code, and add that user from the sidebar to begin a conversation.

## Backend API

All API routes are mounted under `/api`.

### Auth Routes

#### `POST /api/auth/register`

Registers a new user.

Request body:

```json
{
  "fullName": "Ada Lovelace",
  "username": "ada",
  "email": "ada@example.com",
  "password": "secret123"
}
```

Behavior:

- Requires all fields.
- Requires passwords to be at least 6 characters.
- Rejects duplicate email or username.
- Hashes the password with bcrypt.
- Generates a unique connect code.

Success response:

```json
{
  "message": "User registered successfully"
}
```

#### `POST /api/auth/login`

Logs in a user and sets the `jwt` cookie.

Request body:

```json
{
  "email": "ada@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "user": {
    "id": "user-id",
    "username": "ada",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "connectCode": "ABC123"
  },
  "message": "Login successful"
}
```

#### `GET /api/auth/me`

Returns the currently authenticated user.

Authentication:

- Requires the `jwt` cookie.

Success response:

```json
{
  "user": {
    "id": "user-id",
    "username": "ada",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "connectCode": "ABC123"
  }
}
```

### Conversation Routes

#### `GET /api/conversations`

Returns the authenticated user's conversations.

Authentication:

- Requires the `jwt` cookie.

Success response:

```json
{
  "data": [
    {
      "conversationId": "conversation-id",
      "lastMessage": {
        "content": "Hello",
        "timestamp": "2026-07-03T10:00:00.000Z"
      },
      "unreadCounts": {
        "user-id": 0,
        "friend-id": 2
      },
      "friend": {
        "id": "friend-id",
        "username": "grace",
        "fullName": "Grace Hopper",
        "connectCode": "XYZ789",
        "online": true
      }
    }
  ]
}
```

#### `GET /api/conversations/check-connect-code?connectCode=ABC123`

Checks whether a connect code can be used to start a new friendship/conversation.

Authentication:

- Requires the `jwt` cookie.

Behavior:

- Rejects invalid connect codes.
- Rejects the current user's own connect code.
- Rejects users who are already friends.

Success response:

```json
{
  "success": true,
  "message": "Connect code is valid"
}
```

### Message Routes

#### `GET /api/conversations/:conversationId/messages`

Returns messages for a conversation, newest page first internally and then reversed for display order.

Authentication:

- Requires the `jwt` cookie.

Query parameters:

- `cursor` optional ISO date string. When provided, returns messages older than the cursor.

Success response:

```json
{
  "messages": [
    {
      "_id": "message-id",
      "conversation": "conversation-id",
      "sender": {
        "_id": "user-id",
        "username": "ada"
      },
      "content": "Hello",
      "read": false,
      "createdAt": "2026-07-03T10:00:00.000Z"
    }
  ],
  "nextCursor": "2026-07-03T10:00:00.000Z",
  "hasNext": false
}
```

## Socket Events

Socket connections are authenticated using the same `jwt` cookie as the REST API.

### Client to Server

#### `conversation:request`

Starts a friendship and conversation by connect code.

Payload:

```json
{
  "connectCode": "ABC123"
}
```

Possible error event:

- `conversation:request:error`

#### `conversation:send-message`

Sends a message to a conversation.

Payload:

```json
{
  "conversationId": "conversation-id",
  "friendId": "friend-id",
  "content": "Hello"
}
```

Possible error event:

- `conversation:send-message:error`

#### `conversation:mark-as-read`

Clears the authenticated user's unread count for a conversation.

Payload:

```json
{
  "conversationId": "conversation-id",
  "friendId": "friend-id"
}
```

Possible error event:

- `conversation:mark-as-read:error`

#### `conversation:typing`

Sends typing state to the other participant.

Payload:

```json
{
  "friendId": "friend-id",
  "isTyping": true
}
```

### Server to Client

#### `conversation:accept`

Emitted to both users when a new conversation is created.

#### `conversation:new-message`

Emitted to the conversation room when a message is saved.

Payload shape:

```json
{
  "conversationId": "conversation-id",
  "message": {
    "_id": "message-id",
    "sender": {
      "_id": "user-id",
      "username": "ada"
    },
    "content": "Hello",
    "createdAt": "2026-07-03T10:00:00.000Z",
    "read": false
  }
}
```

#### `conversation:update-conversation`

Emitted after a message changes the conversation preview or unread counts.

#### `conversation:update-unread-counts`

Emitted after a conversation is marked as read.

#### `conversation:online-status`

Emitted to friends when a user comes online or goes offline.

#### `conversation:update-typing`

Emitted when a friend starts or stops typing.

#### `internal_error`

Emitted when the socket server catches an internal connection error.

## Data Model

### User

Stores account and discovery information.

Fields:

- `connectCode`: unique friend discovery code.
- `fullName`: display name.
- `username`: unique username.
- `email`: unique lowercase email.
- `password`: hashed password.

### Friendship

Represents the relationship between two users.

Fields:

- `requester`: user who initiated the connection.
- `recipient`: user who was added by connect code.
- timestamps.

Indexes:

- Unique compound index on `requester` and `recipient`.

### Conversation

Represents a one-to-one chat.

Fields:

- `participants`: two user IDs.
- `lastMessage`: reference to the latest message.
- `lastMessagePreview`: content and timestamp preview.
- `unreadCount`: map of user ID to unread message count.
- timestamps.

Indexes:

- Unique compound index on participant positions.

### Message

Represents one chat message.

Fields:

- `conversation`: conversation reference.
- `sender`: user reference.
- `content`: message text.
- `read`: read state.
- timestamps.

Indexes:

- Conversation and creation time.
- Sender and creation time.

Post-save behavior:

- Updates the parent conversation's `lastMessage` and `lastMessagePreview`.

## Frontend Overview

Important frontend areas:

- `src/App.tsx`: route declarations and global toaster.
- `src/pages/PageGuards.tsx`: private and guest route protection.
- `src/pages/Auth/`: login/register page and forms.
- `src/pages/Chat/`: main authenticated chat page.
- `src/components/Sidebar/`: conversation list, search, profile, and add-conversation modal.
- `src/components/ChatWindow/`: selected conversation header, message list, input, typing indicator, and empty state.
- `src/services/`: REST API wrappers.
- `src/contexts/SocketContext.tsx`: Socket.IO connection lifecycle.
- `src/contexts/ConversationContext.tsx`: conversation list state and socket event listeners.
- `src/store/authStore.tsx`: persisted auth state.
- `src/store/conversatonStore.tsx`: selected conversation state.
- `src/utils/apiClient.tsx`: configured Axios client.

The frontend expects:

- The backend to allow credentials from `CLIENT_ORIGIN`.
- `VITE_API_URL` to point to the backend `/api` base path.
- The socket server to be reachable at the same origin as `VITE_API_URL` without the `/api` suffix.

## Backend Overview

Important backend areas:

- `server.js`: Express app, HTTP server, CORS, routes, MongoDB connection, Socket.IO server, Redis initialization.
- `socket.js`: Socket.IO connection handler and lifecycle.
- `controllers/`: route business logic.
- `routes/`: Express route definitions.
- `models/`: Mongoose schemas.
- `middleware/authMiddleware.js`: cookie/JWT HTTP route authentication.
- `socket/socketAuthMiddleware.js`: cookie/JWT socket authentication.
- `socket/socketConversation.js`: real-time conversation logic.
- `services/redisService.js`: Redis client and online-session tracking.
- `utils/db.js`: MongoDB connection helper.
- `utils/generateUniqueConnectCode.js`: unique connect-code generation.

## Development Notes

### Authentication

The backend stores the JWT in a cookie named `jwt`. API requests and socket connections both depend on that cookie, so CORS and client credentials must be configured correctly:

- Backend CORS uses `credentials: true`.
- Frontend Axios uses `withCredentials: true`.
- Socket.IO client uses `withCredentials: true`.

### Presence

Redis stores socket IDs in keys shaped like:

```text
user:<userId>:sessions
```

When a user connects, the socket ID is added. When a user disconnects, that socket ID is removed. If no sessions remain, the user is considered offline and friends are notified.

### Conversations

Friendship creation and conversation creation currently happen together through the `conversation:request` socket event. The REST endpoint `check-connect-code` only validates whether the connect code can be used.

### Message Pagination

Messages are fetched in pages of 20. The optional `cursor` query parameter should be an ISO timestamp. The server fetches messages older than the cursor.

## Useful Commands

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

Docker services:

```bash
cd backend
docker compose up -d
docker compose down
```


