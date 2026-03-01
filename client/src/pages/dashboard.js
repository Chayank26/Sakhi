import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>dashboard</h2>

        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "50px" }}>
        <button onClick={() => navigate("/jobs")}>
            Job Opportunities
        </button>

        <button onClick={() => navigate("/govtschemes")}>
            Govt Schemes
        </button>

        <button onClick={() => navigate("/forum")}>Community Forum</button>

        <button onClick={() => navigate("/resources")}>
          Verified Resources
        </button>

      </div>

      <div style={{ marginTop: "40px" }}>
        <button>Talk to a Sakhi</button>
      </div>

      <div style={{ marginTop: "40px" }}>
        <button onClick={() => navigate("/about")}>About Us</button>
        <button onClick={() => navigate("/contact")}>Contact Us</button>
      </div>
    </div>
  );
}

export default Dashboard;
