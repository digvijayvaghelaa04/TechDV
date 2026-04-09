# TechDV LMS 🚀 - Enterprise E-Learning Platform

TechDV is a cinematic, ultra-modern Learning Management System (LMS) built with the MERN stack. Designed for the cutting-edge of online education, it features a highly optimized architecture, immersive UI/UX, real-time WebRTC Live Mentorship, and an AI-driven teaching assistant.

## ✨ Features

- 🎭 **Role-Based Access Control**: Granular permissions for Super Admins, Admins, Instructors, and Students.
- 🎬 **Premium Cinematic UI/UX**: Dark-mode aesthetic powered by Tailwind CSS, glassmorphism, and Framer Motion micro-interactions.
- 📡 **WebRTC Live Mentorship**: Ultra low-latency virtual classrooms powered by Agora and Socket.io for instantaneous chat.
- 🤖 **AI Assistant Widget**: Floating, context-aware AI chat integrated directly into the application layout.
- 🏆 **Gamification**: Built-in visual reward hooks (Confetti bursts) on lesson completion.
- ⚡ **Highly Scalable Architecture**: Clean `src/` directory separation, component lazy-loading, and heavily optimized Vite compilation.

## 🛠 Tech Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- Framer Motion
- React Router DOM v6
- Agora WebRTC Client
- Socket.io Client

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & Bcrypt
- Socket.io
- Agora Access Token Builder

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/digvijayvaghelaa04/TechDV.git
   cd TechDV
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration:**
   - Duplicate `.env.example` in both `backend` and `frontend` folders and rename them to `.env`.
   - Provide your MongoDB URI and Agora API credentials in `backend/.env`.

5. **Start the Application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🔒 Security
All API keys, secrets, and environment configurations are excluded via `.gitignore` to maintain industry-standard security compliance. 

*Designed and engineered by Digvijay Vaghela.*
