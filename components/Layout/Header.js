import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Application header component with navigation, theme toggle and file input
 * 
 * @param {Object} props
 * @param {string} props.title - Application title
 * @param {string} props.fileName - Currently loaded file name
 * @param {string} props.lastUpdated - Timestamp when data was last updated
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {Function} props.onThemeToggle - Function to toggle theme
 * @param {Function} props.onFileSelect - Handler for file selection
 * @param {Function} props.onAnalyze - Handler for analyze button click
 * @param {boolean} props.loading - Whether data is loading
 * @param {Object} props.file - Selected file object
 */
const Header = ({
  title = "Dynamic Data Insight Dashboard",
  fileName = "",
  lastUpdated = "",
  theme = "light",
  onThemeToggle,
  onFileSelect,
  onAnalyze,
  loading = false,
  file = null
}) => {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  // Theme colors
  const colors = {
    light: {
      background: "#ffffff",
      border: "#e0e0e0",
      text: "#333333",
      primary: "#0078D4",
      accent: "#107C10"
    },
    dark: {
      background: "#1f1f1f",
      border: "#444444",
      text: "#f0f0f0",
      primary: "#2899f5",
      accent: "#3BB44A"
    }
  };
  
  const currentColors = colors[theme];

  return (
    <header className="dashboard-header" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      marginBottom: "20px",
      borderBottom: `2px solid ${currentColors.border}`,
      backgroundColor: currentColors.background,
      transition: "all 0.3s ease-in-out"
    }}>
      <div>
        <h1 style={{ 
          fontSize: "32px", 
          margin: "0",
          fontWeight: "600",
          color: currentColors.primary
        }}>
          {title}
        </h1>
        {fileName && (
          <p style={{ 
            margin: "5px 0 0 0", 
            fontSize: "14px",
            color: currentColors.text
          }}>
            File: {fileName} • Last updated: {lastUpdated}
          </p>
        )}
      </div>

      <div className="navigation" style={{
        display: "flex",
        gap: "15px",
        alignItems: "center"
      }}>
        <nav style={{
          display: "flex",
          gap: "20px",
          marginRight: "30px"
        }}>
          <Link 
            href="/" 
            style={{
              color: isActive('/') ? currentColors.primary : currentColors.text,
              textDecoration: "none",
              fontWeight: isActive('/') ? "bold" : "normal",
              fontSize: "16px"
            }}
          >
            Dashboard
          </Link>
          <Link 
            href="/chat" 
            style={{
              color: isActive('/chat') ? currentColors.primary : currentColors.text,
              textDecoration: "none",
              fontWeight: isActive('/chat') ? "bold" : "normal",
              fontSize: "16px"
            }}
          >
            Chat
          </Link>
        </nav>
        
        <button
          onClick={onThemeToggle}
          style={{
            background: "transparent",
            border: `1px solid ${currentColors.border}`,
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: "pointer",
            color: currentColors.text,
            transition: "all 0.2s ease"
          }}
        >
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
        
        <div style={{ position: "relative" }}>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => onFileSelect(e.target.files[0])}
            id="file-upload"
            style={{ display: "none" }}
          />
          <label 
            htmlFor="file-upload" 
            style={{
              padding: "8px 16px",
              backgroundColor: currentColors.primary,
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              display: "inline-block",
              transition: "background-color 0.2s ease"
            }}
          >
            Select File
          </label>
        </div>
        
        <button 
          onClick={onAnalyze} 
          disabled={loading || !file}
          style={{
            padding: "8px 16px",
            background: loading || !file ? currentColors.border : currentColors.accent,
            color: loading || !file ? currentColors.text : "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !file ? "not-allowed" : "pointer",
            fontWeight: "600",
            transition: "all 0.2s ease"
          }}
        >
          {loading ? "Analyzing..." : "Generate Dashboard"}
        </button>
      </div>
    </header>
  );
};

export default Header;
