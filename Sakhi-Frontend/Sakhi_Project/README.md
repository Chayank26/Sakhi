# Sakhi v2 - Project Specification

## Project Overview

Sakhi is a full-stack web platform built to empower women by providing career opportunities, skill development, government support, community interaction, and safety resources.

The goal is to create a modern, production-quality web application that demonstrates full-stack software engineering skills.

This project is being built primarily as a portfolio project and should follow good software engineering practices, modular architecture, reusable components, clean code, proper folder structure, and responsive UI.

---

## Tech Stack

### Frontend

* React (Vite)
* React Router
* JavaScript (ES6+)
* HTML
* CSS (Tailwind CSS may be added later)
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JWT Authentication
* Password hashing using bcrypt
* Protected Routes
* Role-Based Access Control

### Other Tools

* Git
* GitHub
* Cloudinary (future)
* Render/Railway (Backend Deployment)
* Vercel (Frontend Deployment)

---

## User Roles

### Guest

* View landing page
* Browse public information
* View featured courses
* View government schemes
* Register/Login

### User

* Manage profile
* Enroll in courses
* Apply for jobs
* Participate in community
* Bookmark content
* View progress dashboard

### Admin

* Manage users
* Manage jobs
* Manage courses
* Manage government schemes
* Moderate community posts

---

# Core Modules

## 1. Landing Page

Contains:

* Hero section
* About Sakhi
* Features overview
* Testimonials (dummy)
* Contact section
* Responsive navigation bar
* Footer

---

## 2. Authentication

Features:

* Register
* Login
* Logout
* JWT Authentication
* Protected Routes
* Password hashing

---

## 3. User Profile

Users can:

* Upload profile picture
* Edit profile
* Add skills
* Add education
* Upload resume
* View enrolled courses
* View applied jobs

---

## 4. Job Portal

Users can:

* Browse jobs
* Search jobs
* Filter jobs
* Save jobs
* Apply for jobs

Job Providers/Admin can:

* Create jobs
* Edit jobs
* Delete jobs

---

## 5. Sakhi Academy (Learning Hub)

Users can:

* Browse free courses
* Search courses
* Filter by category
* Enroll in courses
* Track progress
* Bookmark courses
* Complete lessons
* View certificates (future)

Each course contains:

* Title
* Thumbnail
* Description
* Instructor
* Difficulty
* Duration
* Lessons

Each lesson contains:

* Video
* Notes
* Resources

Admin can:

* Create courses
* Upload lessons
* Edit courses
* Delete courses

---

## 6. Community

Users can:

* Create posts
* Edit posts
* Delete posts
* Like posts
* Comment
* Search posts

Admin can moderate content.

---

## 7. Government Schemes

Users can:

* Browse schemes
* Search
* Filter
* Bookmark schemes

Admin can:

* Add schemes
* Edit schemes
* Delete schemes

---

## 8. Safety

Contains:

* SOS Button
* Emergency Contacts
* Safety Resources
* Trusted Contacts (future)

---

## Future AI Module

An AI assistant called Sakhi AI will be integrated later.

It should eventually:

* Answer questions about the platform
* Explain course topics
* Recommend courses
* Recommend jobs
* Help generate resumes
* Answer government scheme questions

This module should be designed so that it can later integrate with an LLM API.

---

# Design Goals

The application should have:

* Clean modern UI
* Mobile-first responsive design
* Reusable React components
* Consistent color palette
* Accessible forms
* Loading states
* Error handling
* Good user experience

---

# Folder Structure

client/

* src/

  * components/
  * pages/
  * hooks/
  * context/
  * services/
  * utils/
  * assets/

server/

* controllers/
* routes/
* models/
* middleware/
* config/
* utils/

---

# Coding Guidelines

* Prefer reusable components.
* Keep components small and focused.
* Use functional React components.
* Use React Hooks.
* Separate business logic from UI.
* Follow REST API conventions.
* Write readable, well-commented code where necessary.
* Use descriptive variable and function names.
* Avoid code duplication.
* Do not generate unnecessarily complex code.

---

# Development Approach

Implement one feature at a time.

Before writing code:

1. Explain the implementation plan.
2. Suggest the folder structure for the feature.
3. Generate code only for the current feature.
4. Do not modify unrelated files.
5. Wait for confirmation before moving to the next feature.

The objective is learning, not generating the entire application automatically.
