import React, { useState } from "react";
import axios from "axios";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "hi, i am sakhi assistant. how can i help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chatbot",
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "something went wrong. please try again." },
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>talk to a sakhi</h2>

      <div
        style={{
          border: "1px solid black",
          height: "400px",
          overflowY: "scroll",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        {messages.map((m, index) => (
          <div
            key={index}
            style={{
              textAlign: m.sender === "user" ? "right" : "left",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                border: "1px solid black",
                maxWidth: "70%",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "10px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage} style={{height: "40px", marginTop: "10px", background: "var(--gradient)", color: "white", padding: "4px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}>send</button>
      </div>
    </div>
  );
}

export default Chatbot;
