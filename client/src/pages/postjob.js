import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Postjob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/jobs",
        { title, company, location, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/jobs");
    } catch (err) {
      console.error("error posting job", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>post a job</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="company name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <textarea
          placeholder="job description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          post job
        </button>
      </form>
    </div>
  );
}

export default Postjob;
