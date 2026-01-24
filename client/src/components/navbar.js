import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "15px 40px",
        borderBottom: "2px solid black",
      }}
    >
      <h3 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        sakhi
      </h3>

      <div style={{ display: "flex", gap: "20px" }}>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          home
        </span>

        <span style={{ cursor: "pointer" }} onClick={() => navigate("/about")}>
          about us
        </span>

        <span
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/contact")}
        >
          contact us
        </span>

        {!token && (
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
            login
          </span>
        )}

        {token && (
          <span style={{ cursor: "pointer" }} onClick={handleLogout}>
            logout
          </span>
        )}
      </div>
    </div>
  );
}

export default Navbar;
