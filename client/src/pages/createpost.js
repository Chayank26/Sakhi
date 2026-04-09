import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Createpost() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/forum",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/forum");
    } catch (err) {
      console.error("error creating post", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>create post</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="post content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit" style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>post</button>
      </form>
    </div>
  );
}

export default Createpost;
