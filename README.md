# Verbalytics AI

Verbalytics AI is a production-oriented full-stack web application for debate practice and interview preparation. It uses LLM-powered conversations, structured evaluation, and progress analytics to help users improve logic, clarity, and relevance over time.

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB
- AI: OpenAI API

## Product Goals

- Debate Mode with counter-arguments and follow-up questions
- Interview Mode with adaptive question difficulty
- Evaluation Mode with structured scoring and written feedback
- Chat history memory and session continuity
- Dashboard analytics with progress tracking
- Production deployment to Vercel, Render, and MongoDB Atlas

## Step 1 Setup Status

The repository now includes:

- `frontend/` and `backend/` application folders
- Root-level `package.json` for full-stack developer scripts
- Environment templates for frontend and backend
- Scalable source folder structure for both apps
- Setup documentation in `docs/PROJECT_SETUP.md`
- Architecture documentation in `docs/ARCHITECTURE.md`

## Scalable Project Structure

```text
verbalytics-ai/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── .env
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── utils/
│   ├── .env
│   └── package.json
├── docs/
└── package.json
```

## Initialization Commands

From the project root:

```bash
npm install
npm run dev
```

Run apps separately if needed:

```bash
npm run dev:backend
npm run dev:frontend
```

Install both app dependencies again if needed:

```bash
npm run install:all
```

## Environment Variables

Backend `.env`:

```bash
MONGODB_URI=mongodb://localhost:27017/verbalytics-ai
JWT_SECRET=replace_with_a_long_random_secret
OPENAI_API_KEY=replace_with_real_openai_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Frontend `.env`:

```bash
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

## Architecture Best Practices

- Keep controllers thin and move core logic into services.
- Store Mongoose schemas in `backend/src/models` and validation/auth concerns in middleware.
- Put API clients in `frontend/src/services` so pages and components stay UI-focused.
- Use reusable layouts, hooks, and contexts to avoid duplicated state logic.
- Treat prompts, evaluation rules, and chat orchestration as backend service concerns.
- Keep secrets only in environment variables and never hardcode keys in frontend code.

## Documentation

- Setup guide: `docs/PROJECT_SETUP.md`
- Architecture guide: `docs/ARCHITECTURE.md`

## Next Step

Step 2 is the authentication system:

- user registration
- user login
- JWT issuance and verification
- password hashing with bcrypt
- protected backend routes
- Postman testing flow
