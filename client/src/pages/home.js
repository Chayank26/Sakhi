import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleFeatureClick = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* Main Content */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>about sakhi</h2>
        <p>
          Sakhi is a digital platform designed to empower women by providing
          access to job opportunities, government schemes, community support,
          and verified resources in a safe and inclusive environment.
        </p>

        {/* Show only when logged out */}
        {!token && (
          <>
            <button onClick={() => navigate("/login")}>sign in</button>
            <p>
              not signed up?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => navigate("/signup")}
              >
                sign up now
              </span>
            </p>
          </>
        )}
      </div>

      {/* Feature Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "80px",
        }}
      >
        <button
            onClick={() => {
                if (token) {
                navigate("/jobs");
                } else {
                navigate("/login");
                }
            }}
        >
            job portal
        </button>

        <button
            onClick={() => {
                if (token) {
                navigate("/govtschemes");
                } else {
                navigate("/login");
                }
            }}
        >
            access govt schemes
        </button>

        <button
          onClick={() => {
            if (token) {
              navigate("/forum");
            } else {
              navigate("/login");
            }
          }}
        >
          community forum
        </button>

        <button onClick={handleFeatureClick}>
          verified resource directory
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <button onClick={handleFeatureClick}>talk to a sakhi</button>
      </div>
    </div>
  );
}

export default Home;
