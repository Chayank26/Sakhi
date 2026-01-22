# Sakhi – A Digital Support Platform for Women

## Project Overview
Sakhi is a full-stack web-based platform designed to provide women with a safe, supportive, and accessible digital space. The platform centralizes access to trusted community support, employment opportunities, and safety-oriented features, addressing the fragmentation and lack of verified digital resources available to women.

This project was developed as part of the Software Design course, following proper software design principles, modular architecture, and version control practices.

## Problem Statement
Women often face fragmented access to essential resources such as employment opportunities, government schemes, and safe community support. Existing platforms are either unsafe, unverified, or scattered across multiple sources, making it difficult to seek help quickly, securely, and confidently.

## Target Users (Personas)

### Persona 1: College Student
- Age: 18–23  
- Goals: Find internships/jobs, seek guidance  
- Pain Points: Unsafe platforms, lack of verified information  

### Persona 2: Working Professional
- Age: 23–35  
- Goals: Career growth, community interaction  
- Pain Points: Limited trusted networks  

### Persona 3: Homemaker
- Age: 25–45  
- Goals: Access government schemes and support  
- Pain Points: Lack of awareness and digital guidance  

## Vision Statement
To build a secure and inclusive digital ecosystem that empowers women by providing trusted access to opportunities, community support, and safety resources through a single unified platform.

## Features Implemented (MVP)
- User signup and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected routes for authenticated users
- Modular backend architecture
- MongoDB Atlas cloud database
- React-based frontend
- Docker-ready system design

## System Architecture
The application follows a client–server architecture:

- Frontend: React application (port 3000)
- Backend: Node.js and Express REST API (port 5000)
- Database: MongoDB Atlas (cloud-hosted)
- Authentication: Stateless JWT-based authentication

The frontend communicates with the backend via REST APIs, and authentication tokens are stored securely on the client side.

## Tech Stack

### Frontend
- React
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- bcrypt.js

### Database
- MongoDB Atlas

### DevOps / Design
- Git and GitHub (feature branching)
- Docker (design-level containerization)

## Docker & Deployment (Design-Level)
The application is designed to be containerized using Docker. Separate Dockerfiles are created for the frontend and backend, and a docker-compose configuration is provided to orchestrate both services. This enables consistent deployment and scalability. Docker execution is optional for this project.

## Success Metrics
- Number of registered users
- Successful authentication flows
- Protected route access validation
- System stability during authentication

## Future Scope
- AI-powered chatbot for “Talk to a Sakhi”
- Government schemes information portal
- Job opportunity listings
- SOS integration with real emergency services
- Admin moderation panel
- Mobile application version

## How to Run the Project (Development)

### Backend
cd Server  
npm install  
npm run dev  

### Frontend
cd client  
npm install  
npm start  


## Project Structure
Sakhi/  
├── client/        (React frontend)  
├── Server/        (Node.js backend)  
├── docker-compose.yml  
├── README.md  

## Software Design Highlights
- Modular separation of concerns
- RESTful API design
- Secure authentication workflow
- Proper GitHub workflow with feature branches
- Deployment-ready architecture
 

