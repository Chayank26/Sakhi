# Sakhi – A Digital Support Platform for Women

Sakhi is a full-stack web platform designed to provide women with a secure, supportive, and accessible digital space. It centralizes access to job opportunities, community interaction, verified resources, and emergency support features within a unified ecosystem.

---

## Project Overview

Many digital resources for women are fragmented, unverified, or unsafe. Sakhi addresses this gap by offering:

- Secure authentication  
- Community discussion forum  
- Job opportunity listings with application system  
- Emergency SOS feature (simulated)  
- Verified resource directory  
- Clean and accessible user interface  

The goal is to create a trusted and inclusive digital ecosystem for women.

---

## Problem Statement

Women often face fragmented access to essential resources such as employment opportunities, government schemes, and safe community support. Existing platforms are either unsafe, unverified, or scattered across multiple sources, making it difficult to seek help quickly and securely.

---

## Target Users

### College Student
Age: 18–23  
Goals: Find internships/jobs, seek guidance  
Pain Points: Unsafe platforms, lack of verified information  

### Working Professional
Age: 23–35  
Goals: Community interaction, career growth  
Pain Points: Limited trusted networks  

### Homemaker
Age: 25–45  
Goals: Access government schemes and support  
Pain Points: Lack of awareness and digital guidance  

---

## Tech Stack

### Frontend
- React (Create React App)
- Axios
- Responsive UI Design

### Backend
- Node.js
- Express.js
- JWT Authentication
- Bcrypt Password Hashing

### Database
- MongoDB Atlas
- Mongoose ODM

### External Services
- Nodemailer (Email notifications)
- Multer (File uploads)

### Development & Deployment
- Docker (Containerized development setup)

---

# Software Design

## Architecture Style

Sakhi follows a Layered Client–Server Architecture. The React frontend acts as the presentation layer and communicates with the Express backend through RESTful APIs. The backend is internally structured into routes, controllers, services, middleware, and the data layer managed by MongoDB. This separation of concerns promotes maintainability, scalability, and low coupling between components.

---

## Design Principles Applied

Abstraction is achieved by separating authentication, business logic, and database operations into distinct layers. Modularity is maintained by organizing features such as authentication, jobs, forum, and resources into independent modules. High cohesion is ensured by assigning each module a single, well-defined responsibility. Low coupling is preserved by allowing communication between components only through defined APIs and middleware layers, enabling future feature expansion without major restructuring.

---

## High-Level Architecture Components

Presentation Layer:
- React UI components
- Protected routes
- API communication

Application Layer:
- Express server
- Routes
- Controllers
- Services
- Middleware (JWT authentication, error handling, validation)

Data Layer:
- MongoDB Atlas
- Mongoose models (User, Job, Post, Application)

External Services:
- Nodemailer
- Multer

---

## Key Design Decisions

1. JWT-based authentication was implemented to enable stateless and scalable user sessions.
2. Authentication logic was separated into middleware to reduce coupling between security and business logic.
3. Business logic is handled within service layers instead of controllers to improve abstraction and maintainability.
4. MongoDB was chosen for its flexible schema design suited for dynamic content such as posts and job listings.
5. External services for email and file handling were modularized to prevent tight integration with core logic.

---

## Success Metrics

- Number of registered users
- Active community participation
- User retention rate
- Successful simulated SOS activations

---

## Assumptions and Constraints

Assumptions:
- Users have internet access
- Users are comfortable with basic web navigation

Constraints:
- MVP-level implementation
- No real emergency service integration

---

## Future Enhancements

- Admin moderation panel
- AI-powered chatbot integration
- Cloud-based file storage
- Production cloud deployment
- Analytics dashboard