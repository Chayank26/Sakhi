import React, { useEffect, useState } from "react";
import axios from "axios";

function Myposts() {
  const [posts, setPosts] = useState([]);

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/forum/myposts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(res.data);
    } catch (err) {
      console.error("error fetching my posts", err);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/forum/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchMyPosts();
    } catch (err) {
      console.error("error deleting post", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>my posts</h2>

      <div style={{ marginTop: "30px" }}>
        {posts.length === 0 && <p style={{color:"black"}}>you have not posted anything yet</p>}

        {posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: "1px solid black",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{color:"black"}}>{post.title}</h3>
            <p style={{color:"black"}}>{post.content}</p>

            <p style={{ fontSize: "14px",color:"black" }}>
              likes: {post.likes.length} | comments: {post.comments.length}
            </p>

            <button onClick={() => handleDelete(post._id)} style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Myposts;
