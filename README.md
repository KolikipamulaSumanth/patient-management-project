# Real-Time Chat Application

A modern full-stack chat application built with the MERN stack that enables users to communicate instantly through real-time messaging and media sharing.

The application focuses on scalable frontend-backend architecture, secure authentication, responsive UI design, and real-time communication using WebSockets.

## Tech Stack

### Frontend

- React 18
- Vite
- React Router DOM
- Zustand
- Axios
- Tailwind CSS
- DaisyUI
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary

## Features

### Authentication System

- User signup and login
- JWT-based authentication
- Protected API routes
- Cookie-based session management

### Real-Time Messaging

- Instant one-to-one messaging
- Live socket communication using Socket.IO
- Real-time online/offline user status
- Persistent chat history stored in MongoDB

### Media Upload Support

- Upload and share images in chats
- Cloudinary integration for cloud storage
- Optimized image delivery

### Modern UI

- Responsive design for desktop and mobile
- Clean chat interface using Tailwind CSS and DaisyUI
- Dynamic icons with Lucide React

### State Management

- Global state handling with Zustand
- Centralized authentication and chat state
- Efficient frontend updates

## Project Structure

```text
project-root/
|
├── backend/
|   ├── src/
|   |   ├── controllers/
|   |   ├── middleware/
|   |   ├── models/
|   |   ├── routes/
|   |   ├── lib/
|   |   └── index.js
|   |
|   └── package.json
|
├── frontend/
|   ├── src/
|   |   ├── components/
|   |   ├── pages/
|   |   ├── store/
|   |   ├── lib/
|   |   └── main.jsx
|   |
|   └── package.json
|
└── README.md
```

## Installation & Setup

### Clone the Repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

### Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Core Learning Concepts Used

- REST API development with Express.js
- Real-time communication using WebSockets
- Authentication and authorization with JWT
- MongoDB schema modeling with Mongoose
- Global state management using Zustand
- File uploads and cloud storage integration
- Responsive frontend development with React and Tailwind CSS

## Security Practices

- Environment variables for sensitive credentials
- Protected backend routes
- JWT token verification
- Secure cookie handling
- Password hashing using bcryptjs

## Future Improvements

- Group chat support
- Typing indicators
- Read receipts
- Voice and video calling
- Push notifications
- Message reactions
- Redis-based socket scaling
- Docker deployment
- CI/CD integration

## Resume Highlights

- Developed a full-stack real-time chat application using the MERN stack
- Implemented secure JWT authentication and protected routing
- Built real-time messaging functionality using Socket.IO
- Managed frontend state efficiently with Zustand
- Integrated Cloudinary for media upload and storage
- Designed a responsive and modern chat interface using Tailwind CSS

## Notes

This project was built for learning full-stack application architecture, real-time systems, authentication workflows, and scalable frontend-backend communication patterns.
