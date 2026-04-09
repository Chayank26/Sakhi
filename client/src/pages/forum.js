import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Forum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/forum", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(res.data);
    } catch (err) {
      console.error("error fetching posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    if (!commentText[postId] || commentText[postId].trim() === "") return;

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/forum/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPosts();
    } catch (err) {
      console.error("error liking post", err);
    }
  };

  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/forum/${postId}/comment`,
        { text: commentText[postId] || "" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.error("error commenting", err);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>community forum</h2>

        <div style={{ display: "flex", gap: "15px" }}>
          <button onClick={() => navigate("/createpost")} style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>create post</button>
          <button onClick={() => navigate("/myposts")} style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>my posts</button>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        {posts.length === 0 && <p style={{color:"black"}}>no posts yet</p>}

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
              <strong>posted by:</strong>{" "}
              {post.author?.username || post.author?.email || "unknown"}
            </p>

            <button onClick={() => handleLike(post._id)} style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>
              like ({post.likes.length})
            </button>

            <div style={{ marginTop: "20px" }}>
                <h4>comments</h4>

                {post.comments.length === 0 && <p style={{color:"black"}}>no comments</p>}

                {post.comments.map((c, index) => (
                    <p key={index} style={{ fontSize: "14px" }}>
                        <strong>
                        {c.user?.username || c.user?.email || "user"}:
                        </strong>{" "}
                        {c.text}
                    </p>
                ))}


              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  placeholder="write a comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => handleComment(post._id)} style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>comment</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forum;
