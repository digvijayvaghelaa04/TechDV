# TechDV LMS 🚀

TechDV is a modern Learning Management System (LMS) built with the MERN stack to provide a smooth and scalable online learning experience. It is designed for role-based learning management, secure authentication, course delivery, student progress tracking, and admin-level platform control.

## ✨ Features

- **Role-Based Access Control** for Super Admin, Admin, Instructor, and Student
- **Secure Authentication & Authorization** using JWT
- **Course Management System** for creating, updating, and managing courses
- **Video Lecture Learning** with course resources and structured content
- **Student Enrollment Flow** with controlled course access
- **Progress Tracking** for learners
- **Admin Dashboard** for managing users, courses, and platform activity
- **Responsive UI** built for desktop, tablet, and mobile devices
- **Scalable Project Structure** with clean frontend and backend architecture

## 🛠 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Redux Toolkit / Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## 📂 Project Structure

```bash
TechDV/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│
└── README.md
```

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/digvijayvaghelaa04/TechDV.git
cd TechDV
```

### 2. Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

If needed, create a `.env` file inside the `frontend` folder for frontend environment variables.

### 4. Run the project

#### Start backend

```bash
cd backend
npm run dev
```

#### Start frontend

```bash
cd frontend
npm run dev
```

## 🔐 User Roles

### Super Admin

* Full platform control
* Manage admins, instructors, students, and courses

### Admin

* Manage platform operations
* Approve and monitor courses and users

### Instructor

* Create and manage own courses
* Upload lessons and learning resources

### Student

* Enroll in courses
* Watch lessons and track progress

## 📌 Core Modules

* Authentication System
* Course Management
* User Management
* Enrollment System
* Learning Dashboard
* Role-Based Authorization
* Progress Monitoring

## 🌟 Future Improvements

* Payment gateway integration
* Certificate generation
* Live classes
* Quiz and assessment module
* Instructor earnings dashboard
* AI-based learning assistant

## 🤝 Contribution

Contributions, suggestions, and improvements are welcome.

## 📧 Contact

**Digvijay Vaghela**
Full Stack Developer
GitHub: [digvijayvaghelaa04](https://github.com/digvijayvaghelaa04)

## 📜 License

This project is for learning, academic, and portfolio purposes.
