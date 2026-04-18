# Verbalytics AI - Project Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- OpenAI API key

## Project Structure

```
verbalytics-ai/
├── frontend/                 # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS and styling
│   │   ├── index.css        # Global styles with Tailwind
│   │   └── index.js         # React app entry point
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic services
│   │   └── utils/           # Utility functions
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example
└── docs/                    # Documentation
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Environment Configuration

#### Backend (.env)
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `OPENAI_API_KEY`: Your OpenAI API key

#### Frontend (.env)
```bash
cp .env.example .env
```

### 4. Database Setup

#### Option 1: Local MongoDB
- Install MongoDB locally
- Start MongoDB service
- The app will connect to `mongodb://localhost:27017/verbalytics-ai`

#### Option 2: MongoDB Atlas
- Create a free MongoDB Atlas account
- Create a new cluster
- Get your connection string
- Update `MONGODB_URI` in your `.env` file

### 5. Start Development Servers

#### Backend
```bash
cd backend
npm run dev  # or npm start for production
```

#### Frontend
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Architecture Best Practices

### Backend Architecture
- **Separation of Concerns**: Controllers, models, routes, and services are separated
- **Middleware**: Authentication, validation, and error handling middleware
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Morgan for HTTP request logging

### Frontend Architecture
- **Component-Based**: Reusable React components
- **Service Layer**: API calls separated into service functions
- **Routing**: React Router for navigation
- **State Management**: React hooks for local state
- **Styling**: Tailwind CSS for consistent, utility-first styling
- **Type Safety**: PropTypes for component validation

### Database Design
- **User Schema**: Authentication and profile information
- **Chat Schema**: Message history and session management
- **Evaluation Schema**: Performance metrics and feedback
- **Analytics Schema**: Progress tracking and insights

### Security Considerations
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

## Next Steps

After completing the setup:
1. Test the backend health endpoint
2. Verify database connection
3. Test frontend compilation
4. Proceed to Step 2: Authentication System
