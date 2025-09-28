import React, { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Modal component for dialogs, forms, and other overlay content
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content (defaults to Close button)
 * @param {string} props.size - Modal size ("sm", "md", "lg", "xl")
 * @param {boolean} props.closeOnEsc - Whether to close modal when Escape key is pressed
 * @param {boolean} props.closeOnOverlayClick - Whether to close modal when overlay is clicked
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {string} props.className - Additional CSS classes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnEsc = true,
  closeOnOverlayClick = true,
  theme = "light",
  className = ""
}) => {
  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (closeOnEsc && event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = ""; // Restore scrolling when modal closes
    };
  }, [closeOnEsc, isOpen, onClose]);

  // Handle clicks outside the modal content
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  // Theme colors
  const colors = {
    light: {
      background: "#ffffff",
      text: "#333333",
      border: "#e0e0e0",
      overlay: "rgba(0, 0, 0, 0.5)"
    },
    dark: {
      background: "#2d2d2d",
      text: "#f0f0f0",
      border: "#444444",
      overlay: "rgba(0, 0, 0, 0.7)"
    }
  };

  const currentColors = colors[theme];

  // Size configuration
  const sizes = {
    sm: { width: "300px", maxWidth: "95vw" },
    md: { width: "500px", maxWidth: "95vw" },
    lg: { width: "800px", maxWidth: "95vw" },
    xl: { width: "1100px", maxWidth: "95vw" }
  };

  const modalSize = sizes[size];

  // Default footer if none provided
  const renderFooter = () => {
    if (footer === null) return null;
    if (footer) return footer;

    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
      }}>
        <Button 
          onClick={onClose}
          theme={theme}
          variant="outline"
        >
          Close
        </Button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: currentColors.overlay,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
      transition: "opacity 0.2s ease",
      animation: "fadeIn 0.2s"
    }}>
      <div 
        ref={modalRef}
        className={`modal-content ${className}`}
        style={{
          backgroundColor: currentColors.background,
          color: currentColors.text,
          borderRadius: "6px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          width: modalSize.width,
          maxWidth: modalSize.maxWidth,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "scaleIn 0.2s",
          transition: "all 0.2s ease"
        }}
      >
        {/* Modal Header */}
        {title && (
          <div className="modal-header" style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${currentColors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: currentColors.text
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: currentColors.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "4px",
                padding: 0
              }}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Modal Body */}
        <div className="modal-body" style={{
          padding: "20px",
          overflowY: "auto"
        }}>
          {children}
        </div>
        
        {/* Modal Footer */}
        {renderFooter() && (
          <div className="modal-footer" style={{
            padding: "16px 20px",
            borderTop: `1px solid ${currentColors.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
          }}>
            {renderFooter()}
          </div>
        )}
      </div>
      
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-body::-webkit-scrollbar-track {
          background: ${theme === "light" ? "#f1f1f1" : "#333"};
          border-radius: 4px;
        }
        
        .modal-body::-webkit-scrollbar-thumb {
          background: ${theme === "light" ? "#c1c1c1" : "#666"};
          border-radius: 4px;
        }
        
        .modal-body::-webkit-scrollbar-thumb:hover {
          background: ${theme === "light" ? "#a1a1a1" : "#888"};
        }
      `}</style>
    </div>
  );
};

export default Modal;
