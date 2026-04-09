import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="navbar">

      <h2 className="logo" onClick={() => navigate("/")}>
        Sakhi
      </h2>

      <div className="nav-links">

        <span onClick={() => navigate("/")}>Home</span>
        <span onClick={() => navigate("/about")}>About</span>
        <span onClick={() => navigate("/contact")}>Contact</span>

        {!token && (
          <span className="nav-btn" onClick={() => navigate("/login")}>
            Login
          </span>
        )}

        {token && (
          <span className="nav-btn logout" onClick={handleLogout}>
            Logout
          </span>
        )}

      </div>
    </div>
  );
}

export default Navbar;