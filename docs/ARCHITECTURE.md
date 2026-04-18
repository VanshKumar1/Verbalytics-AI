# Verbalytics AI Architecture

## Step 1 Goal

Establish a production-oriented foundation that is easy to extend for:

- Authentication and protected routes
- AI chat modes
- Evaluation storage
- Analytics dashboards
- Deployment to Vercel, Render, and MongoDB Atlas

## Recommended Folder Structure

```text
verbalytics-ai/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/        # Images, icons, and static UI assets
│   │   ├── components/    # Shared reusable UI pieces
│   │   ├── contexts/      # Auth and app-wide React context
│   │   ├── features/      # Feature-specific UI modules
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # App shells and page layouts
│   │   ├── pages/         # Route-level pages
│   │   ├── services/      # Axios clients and API wrappers
│   │   ├── styles/        # Design tokens and extra styles
│   │   ├── utils/         # Frontend helpers
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/        # DB, env, and app configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, validation, and error middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic and OpenAI integration
│   │   ├── tests/         # API and integration tests
│   │   └── utils/         # Shared helpers
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── docs/
│   ├── ARCHITECTURE.md
│   └── PROJECT_SETUP.md
└── package.json           # Root developer scripts
```

## Why This Structure Scales

- Keep route handlers thin. Controllers should validate input, call services, and shape responses.
- Put business logic in services so chat, evaluation, and analytics remain testable.
- Keep database models isolated from route logic to reduce coupling.
- Use feature-oriented folders on the frontend once the app grows beyond basic shared components.
- Centralize config and environment access in backend config utilities instead of reading env vars everywhere.
- Add API wrapper modules in `frontend/src/services` so UI components stay focused on presentation.

## Step-by-Step Build Order

1. Step 1: project setup and architecture
2. Step 2: authentication and JWT protection
3. Step 3: frontend shell, routing, and polished UI
4. Step 4: chat interface and message flow
5. Step 5: OpenAI integration and mode-based prompting
6. Step 6: prompt engineering and structured evaluation output
7. Step 7: evaluation persistence and results views
8. Step 8: memory and conversation history
9. Step 9: analytics dashboards and charts
10. Step 10: difficulty tuning and session intelligence
11. Step 11: deployment
12. Step 12: optimization and hardening
13. Step 13: final architecture review

## Root Commands

Run from the project root:

```bash
npm install
npm run dev
```

Useful alternatives:

```bash
npm run dev:backend
npm run dev:frontend
npm run install:all
```

## Environment Notes

- `backend/.env` needs real `JWT_SECRET` and `OPENAI_API_KEY` values before auth and AI features are complete.
- `MONGODB_URI` should point to local MongoDB for development or MongoDB Atlas for deployment.
- `frontend/.env` should keep `REACT_APP_API_URL=http://localhost:5000` in development.
