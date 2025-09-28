"use client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Button from '../components/UI/Button';

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [theme, setTheme] = useState('light'); // Default theme
  const messagesEndRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Try to load dataset info from localStorage
    const storedInfo = localStorage.getItem("datasetInfo");
    const savedFileName = localStorage.getItem('fileName');
    const savedLastUpdated = localStorage.getItem('lastUpdated');
    
    if (storedInfo) {
      try {
        setDatasetInfo(JSON.parse(storedInfo));
        // Add a welcome message
        setChatHistory([
          {
            sender: "bot",
            text: "Hello! I'm your data assistant. Ask me questions about your uploaded dataset!"
          }
        ]);

        if (savedFileName) setFileName(savedFileName);
        if (savedLastUpdated) setLastUpdated(savedLastUpdated);
      } catch (e) {
        console.error("Error loading saved dataset info:", e);
      }
    }
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;
    
    if (!datasetInfo) {
      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message },
        { sender: "bot", text: "No dataset found. Please upload a dataset on the dashboard page first." }
      ]);
      setMessage("");
      return;
    }
    
    // Add user message to chat
    setChatHistory([...chatHistory, { sender: "user", text: message }]);
    const userMessage = message;
    setMessage("");
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          dataset_info: datasetInfo
        })
      });
      
      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      
      // Add bot response to chat
      setChatHistory(prevChat => [
        ...prevChat,
        { sender: "bot", text: data.response }
      ]);
      
    } catch (error) {
      setChatHistory(prevChat => [
        ...prevChat, 
        { sender: "bot", text: `Sorry, an error occurred: ${error.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem('dashboardTheme', newTheme);
  };

  // Get theme colors based on current theme
  const themeColors = {
    light: {
      background: "#ffffff",
      text: "#333333",
      primary: "#0078D4",
      secondary: "#0050B3",
      accent: "#107C10",
      card: "#f9f9f9",
      border: "#e0e0e0"
    },
    dark: {
      background: "#1f1f1f",
      text: "#f0f0f0",
      primary: "#2899f5",
      secondary: "#6CB4F3",
      accent: "#3BB44A",
      card: "#2d2d2d",
      border: "#444444"
    }
  };
  
  const colors = themeColors[theme];

  return (
    <div className="dashboard-container">
      <Header 
        title="Data Insight Chat Assistant"
        fileName={fileName}
        lastUpdated={lastUpdated}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      <div className="chat-page-container">
        {!datasetInfo && (
          <div className="chat-warning">
            <p>⚠️ No dataset information found. Please upload a dataset on the dashboard page first.</p>
            <Link href="/" className="dashboard-link">
              Go to Dashboard
            </Link>
          </div>
        )}
        
        <div className="chat-interface">
          {/* Chat messages area */}
          <div className="chat-messages">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`message ${chat.sender}`}
              >
                <div className="message-bubble">
                  {chat.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <form
            onSubmit={handleSendMessage}
            className="chat-input-area"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about your dataset..."
              className="chat-input"
              disabled={!datasetInfo}
            />
            <Button
              type="submit"
              disabled={loading || !datasetInfo}
              loading={loading}
              variant="primary"
              theme={theme}
            >
              Send
            </Button>
          </form>
        </div>
        
        <div className="chat-suggestions">
          <h3>Example Questions</h3>
          <ul>
            <li>How many rows and columns are in the dataset?</li>
            <li>Are there any missing values?</li>
            <li>What columns are in the dataset?</li>
            <li>Show me a summary of the data</li>
            <li>What correlations exist between variables?</li>
            <li>Which column has the highest average value?</li>
          </ul>
          
          <Link href="/" className="back-to-dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      
      <Footer theme={theme} />
    </div>
  );
}
