import React from "react";
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar";

import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Govtschemes from "./pages/govtschemes";
import Jobs from "./pages/jobs";
import Postjob from "./pages/postjob";
import Applyjob from "./pages/applyjob";

import Forum from "./pages/forum";
import Createpost from "./pages/createpost";
import Myposts from "./pages/myposts";

import Resources from "./pages/resources";
import Chatbot from "./pages/chatbot";

function App() {

  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  return (
    <Router>
      <Navbar />

      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={!isLoggedIn() ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!isLoggedIn() ? <Signup /> : <Navigate to="/dashboard" />} />

        {/* Protected */}
        <Route path="/dashboard" element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/govtschemes" element={isLoggedIn() ? <Govtschemes /> : <Navigate to="/login" />} />
        <Route path="/jobs" element={isLoggedIn() ? <Jobs /> : <Navigate to="/login" />} />
        <Route path="/postjob" element={isLoggedIn() ? <Postjob /> : <Navigate to="/login" />} />
        <Route path="/applyjob/:id" element={isLoggedIn() ? <Applyjob /> : <Navigate to="/login" />} />
        <Route path="/forum" element={isLoggedIn() ? <Forum /> : <Navigate to="/login" />} />
        <Route path="/createpost" element={isLoggedIn() ? <Createpost /> : <Navigate to="/login" />} />
        <Route path="/myposts" element={isLoggedIn() ? <Myposts /> : <Navigate to="/login" />} />
        <Route path="/resources" element={isLoggedIn() ? <Resources /> : <Navigate to="/login" />} />
        <Route path="/chatbot" element={isLoggedIn() ? <Chatbot /> : <Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;