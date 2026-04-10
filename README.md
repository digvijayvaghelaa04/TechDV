# TechDV LMS

Production-ready MERN learning platform with role-based access, course management, payments, enrollment, progress tracking, and live classes.

## Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, React Query, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Deploy: Vercel (frontend), Render/Railway (backend)

## Project Structure

- `frontend/` - React SPA
- `backend/` - Express API and business logic
- `cource-data/` - static course media (protected/private assets)

## Local Development

1. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
2. Create env files:
   - `backend/.env` from `backend/.env.example`
   - `frontend/.env` from `frontend/.env.example`
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`

## Environment Variables

Required backend variables (minimum):

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`

Required frontend variables (minimum):

- `VITE_API_URL` (must end with `/api/v1`)
- `VITE_STORAGE_URL` (backend origin for uploads/media)

## Deployment Notes

### Frontend (Vercel)

- Set `VITE_API_URL` to your deployed backend API URL.
- Set `VITE_STORAGE_URL` to your backend origin.

### Backend (Render/Railway)

- Set `NODE_ENV=production`.
- Set `FRONTEND_URL` to your deployed frontend URL (comma-separated if multiple).
- Ensure MongoDB Atlas network access and credentials are valid.
- Health check endpoint: `/health`.

## Scripts

Backend:

- `npm run dev` - start with nodemon
- `npm start` - production start
- `npm run lint` - lint backend code
- `npm run seed` - optional data seeding

Frontend:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
