import React from "react";
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




function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/dashboard" />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/govtschemes"
          element={token ? <Govtschemes /> : <Navigate to="/login" />}
        />

        <Route
          path="/jobs"
          element={token ? <Jobs /> : <Navigate to="/login" />}
        />

        <Route
          path="/postjob"
          element={token ? <Postjob /> : <Navigate to="/login" />}
        />

        <Route
          path="/applyjob/:id"
          element={token ? <Applyjob /> : <Navigate to="/login" />}
        />

        <Route
          path="/forum"
          element={token ? <Forum /> : <Navigate to="/login" />}
        />

        <Route
          path="/createpost"
          element={token ? <Createpost /> : <Navigate to="/login" />}
        />

        <Route
          path="/myposts"
          element={token ? <Myposts /> : <Navigate to="/login" />}
        />



      </Routes>
    </Router>
  );
}

export default App;
