import React, { forwardRef } from 'react';

/**
 * Reusable Button component with various styles and states
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant ("primary", "secondary", "outline", "text")
 * @param {string} props.size - Button size ("sm", "md", "lg")
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether to show loading state
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.type - Button type (e.g., "button", "submit")
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {React.CSSProperties} props.style - Additional inline styles
 */
const Button = forwardRef(({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  children,
  type = "button",
  theme = "light",
  style = {},
  ...rest
}, ref) => {
  // Theme-based colors
  const colors = {
    light: {
      primary: {
        bg: "#0078D4",
        text: "#ffffff",
        hover: "#0069c0",
        active: "#005aa7"
      },
      secondary: {
        bg: "#107C10",
        text: "#ffffff", 
        hover: "#0e6e0e",
        active: "#0c5c0c"
      },
      outline: {
        bg: "transparent",
        text: "#0078D4",
        border: "#0078D4",
        hover: "#f0f8ff",
        active: "#e0f0ff"
      },
      text: {
        bg: "transparent",
        text: "#0078D4",
        hover: "#f0f8ff",
        active: "#e0f0ff"
      },
      disabled: {
        bg: "#f0f0f0",
        text: "#a0a0a0",
        border: "#e0e0e0"
      }
    },
    dark: {
      primary: {
        bg: "#2899f5",
        text: "#ffffff",
        hover: "#38a5fd",
        active: "#1c8deb"
      },
      secondary: {
        bg: "#3BB44A",
        text: "#ffffff",
        hover: "#45c156",
        active: "#35a142"
      },
      outline: {
        bg: "transparent",
        text: "#2899f5",
        border: "#2899f5",
        hover: "#1c2837",
        active: "#1e3247"
      },
      text: {
        bg: "transparent",
        text: "#2899f5",
        hover: "#1c2837",
        active: "#1e3247"
      },
      disabled: {
        bg: "#2a2a2a",
        text: "#666666",
        border: "#444444"
      }
    }
  };

  // Size properties
  const sizes = {
    sm: {
      padding: "6px 12px",
      fontSize: "14px",
      borderRadius: "4px"
    },
    md: {
      padding: "8px 16px",
      fontSize: "16px",
      borderRadius: "4px"
    },
    lg: {
      padding: "12px 24px",
      fontSize: "18px",
      borderRadius: "6px"
    }
  };

  // Get current theme colors
  const themeColors = colors[theme];

  // Determine button style based on variant and state
  const buttonStyle = {
    ...sizes[size],
    backgroundColor: disabled 
      ? themeColors.disabled.bg 
      : themeColors[variant].bg,
    color: disabled 
      ? themeColors.disabled.text 
      : themeColors[variant].text,
    border: variant === "outline" && !disabled
      ? `1px solid ${themeColors.outline.border}`
      : disabled && variant === "outline"
        ? `1px solid ${themeColors.disabled.border}`
        : "none",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
    fontWeight: variant === "text" ? "normal" : "500",
    transition: "all 0.2s ease",
    outline: "none",
    position: "relative",
    textDecoration: variant === "text" ? "none" : "none",
    opacity: loading ? 0.8 : 1,
    ...style
  };

  // Handle hover and active states via CSS
  const getClassName = () => {
    const baseClass = "custom-button";
    const variantClass = `button-${variant}`;
    const sizeClass = `button-${size}`;
    const stateClasses = [
      disabled ? "button-disabled" : "",
      loading ? "button-loading" : ""
    ].filter(Boolean).join(" ");

    return `${baseClass} ${variantClass} ${sizeClass} ${stateClasses} ${className}`.trim();
  };

  return (
    <>
      <button
        ref={ref}
        type={type}
        onClick={disabled || loading ? undefined : onClick}
        style={buttonStyle}
        className={getClassName()}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="button-spinner" style={{ marginRight: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="0" fill="currentColor">
                <animate 
                  attributeName="r" 
                  values="0;8;0" 
                  dur="1.2s" 
                  repeatCount="indefinite" 
                  begin="0" 
                  keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" 
                  calcMode="spline" 
                />
                <animate 
                  attributeName="opacity" 
                  values="1;0;1" 
                  dur="1.2s" 
                  repeatCount="indefinite" 
                  begin="0" 
                />
              </circle>
            </svg>
          </span>
        )}
        {children}
      </button>
      
      {/* CSS for hover and active states */}
      <style jsx>{`
        .custom-button:hover:not(.button-disabled) {
          background-color: ${variant === "primary" ? themeColors.primary.hover :
                            variant === "secondary" ? themeColors.secondary.hover :
                            variant === "outline" ? themeColors.outline.hover :
                            themeColors.text.hover};
        }
        
        .custom-button:active:not(.button-disabled) {
          background-color: ${variant === "primary" ? themeColors.primary.active :
                            variant === "secondary" ? themeColors.secondary.active :
                            variant === "outline" ? themeColors.outline.active :
                            themeColors.text.active};
          transform: scale(0.98);
        }
        
        .custom-button:focus:not(.button-disabled) {
          box-shadow: 0 0 0 2px ${theme === "light" ? "rgba(0, 120, 212, 0.25)" : "rgba(40, 153, 245, 0.25)"};
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .button-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
});

Button.displayName = 'Button';

export default Button;
