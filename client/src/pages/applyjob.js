import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Applyjob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("resume", resume);

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/jobs/${id}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/jobs");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>apply for job</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <label htmlFor="resume">Upload Resume:</label>
        <input
          type="file"
          onChange={(e) => setResume(e.target.files[0])}
          required
        />

        <button type="submit" style={{ backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", padding: "10px 20px", cursor: "pointer" }}>
          submit application
        </button>
      </form>
    </div>
  );
}

export default Applyjob;
