import React from 'react';

/**
 * Application footer with links and copyright information
 * 
 * @param {Object} props
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {string} props.processingTime - Time taken to process the data (optional)
 */
const Footer = ({
  theme = "light",
  processingTime = null
}) => {
  const year = new Date().getFullYear();
  
  // Theme colors
  const colors = {
    light: {
      background: "#f5f5f5",
      text: "#666666",
      link: "#0078D4",
      border: "#e0e0e0"
    },
    dark: {
      background: "#252525",
      text: "#aaaaaa",
      link: "#2899f5",
      border: "#444444"
    }
  };
  
  const currentColors = colors[theme];

  return (
    <footer style={{
      padding: "20px",
      backgroundColor: currentColors.background,
      color: currentColors.text,
      borderTop: `1px solid ${currentColors.border}`,
      marginTop: "40px",
      fontSize: "14px",
      transition: "all 0.3s ease-in-out"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        maxWidth: "1600px",
        margin: "0 auto"
      }}>
        <div>
          <p style={{ margin: 0 }}>
            &copy; {year} Dynamic Data Insight Dashboard
          </p>
          {processingTime && (
            <p style={{ margin: "5px 0 0 0", fontSize: "13px" }}>
              Data processed in {processingTime} seconds
            </p>
          )}
        </div>
        
        <div style={{
          display: "flex",
          gap: "20px"
        }}>
          <a 
            href="#help" 
            style={{
              color: currentColors.link,
              textDecoration: "none"
            }}
          >
            Help
          </a>
          <a 
            href="#privacy" 
            style={{
              color: currentColors.link,
              textDecoration: "none"
            }}
          >
            Privacy Policy
          </a>
          <a 
            href="#terms" 
            style={{
              color: currentColors.link,
              textDecoration: "none"
            }}
          >
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
