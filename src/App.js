import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiRefreshCw, FiUser, FiCpu, FiMoon, FiSun } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./App.css";

async function query(message) {
  const response = await fetch("http://localhost:8080/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: message,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.text();
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await query(userMsg.content);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshMessage = (msg, index) => {
    console.log("Refresh requested for:", msg);
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="header">
        <div className="logo">
          <span className="gemini-blue">M</span>
          <span className="gemini-red">i</span>
          <span className="gemini-yellow">s</span>
          <span className="gemini-blue">t</span>
          <span className="gemini-green">r</span>
          <span className="gemini-red">a</span>
          <span className="gemini-yellow">l</span>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FiSun size={22} /> : <FiMoon size={22} />}
        </button>
      </header>

      <div className="chat-container">
        {messages.length === 0 && !loading && (
          <div className="welcome-message">
            <h1>Welcome to Mistral AI</h1>
            <p>Ask me anything, and I'll try my best to answer.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role === "user" ? "user" : "ai"}`}
          >
            <div className="avatar">
              {msg.role === "user" ? (
                <div className="user-avatar">
                  <FiUser size={20} />
                </div>
              ) : (
                <div className="ai-avatar">
                  <FiCpu size={20} />
                </div>
              )}
            </div>
            <div className="message-content">
              {msg.content}
              {msg.role === "assistant" && (
                <button
                  className="refresh-btn"
                  onClick={() => refreshMessage(msg.content, idx)}
                >
                  <FiRefreshCw size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai loading">
            <div className="avatar ai-avatar">
              <FiCpu size={20} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="input-container">
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            <FiSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
