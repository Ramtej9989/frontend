import React, { useState } from 'react';

/**
 * Sidebar component with navigation, filters, and chart controls
 * 
 * @param {Object} props
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {boolean} props.isExpanded - Whether the sidebar is expanded
 * @param {Function} props.onToggle - Function to toggle sidebar expansion
 * @param {Array} props.filters - Available filters
 * @param {Object} props.activeFilters - Currently active filters
 * @param {Function} props.onFilterChange - Handler for filter changes
 * @param {Array} props.templates - Available dashboard templates
 * @param {Function} props.onTemplateChange - Handler for template changes
 * @param {string} props.currentTemplate - Current template
 */
const Sidebar = ({
  theme = "light",
  isExpanded = true,
  onToggle,
  filters = [],
  activeFilters = {},
  onFilterChange,
  templates = [],
  onTemplateChange,
  currentTemplate = "analytical"
}) => {
  const [activeSection, setActiveSection] = useState('filters');
  
  // Theme colors
  const colors = {
    light: {
      background: "#f9f9f9",
      text: "#333333",
      border: "#e0e0e0",
      primary: "#0078D4",
      hover: "#f0f0f0",
      selected: "#e3f2fd"
    },
    dark: {
      background: "#252525",
      text: "#f0f0f0",
      border: "#444444",
      primary: "#2899f5",
      hover: "#333333",
      selected: "#1e3a5a"
    }
  };
  
  const currentColors = colors[theme];

  // Sections for the sidebar
  const sections = [
    { id: 'filters', name: 'Filters', icon: 'filter' },
    { id: 'templates', name: 'Templates', icon: 'layout' },
    { id: 'settings', name: 'Settings', icon: 'settings' }
  ];

  // Render icons
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'filter':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        );
      case 'layout':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: isExpanded ? '250px' : '60px',
      backgroundColor: currentColors.background,
      borderRight: `1px solid ${currentColors.border}`,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '20px 15px',
        borderBottom: `1px solid ${currentColors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center'
      }}>
        {isExpanded && (
          <span style={{
            fontWeight: 'bold',
            color: currentColors.text,
            fontSize: '18px'
          }}>
            Dashboard
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: currentColors.text,
            padding: '5px'
          }}
        >
          {isExpanded ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexDirection: isExpanded ? 'row' : 'column',
        borderBottom: `1px solid ${currentColors.border}`,
        overflow: 'hidden'
      }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            style={{
              flex: isExpanded ? '1' : 'unset',
              padding: '15px',
              background: 'none',
              border: 'none',
              borderBottom: activeSection === section.id ? `2px solid ${currentColors.primary}` : 'none',
              color: activeSection === section.id ? currentColors.primary : currentColors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isExpanded ? 'center' : 'center',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            {renderIcon(section.icon)}
            {isExpanded && <span>{section.name}</span>}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        padding: isExpanded ? '15px' : '10px',
        overflowY: 'auto',
        flexGrow: 1,
        opacity: isExpanded ? 1 : 0,
        transition: 'opacity 0.3s ease',
        visibility: isExpanded ? 'visible' : 'hidden'
      }}>
        {/* Filters Section */}
        {activeSection === 'filters' && (
          <div>
            <h3 style={{ color: currentColors.text, fontSize: '16px', marginBottom: '15px' }}>Data Filters</h3>
            
            {filters.map((filter, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  color: currentColors.text,
                  fontSize: '14px'
                }}>
                  {filter.name}
                </label>
                
                {filter.type === 'category' && (
                  <select
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: `1px solid ${currentColors.border}`,
                      backgroundColor: currentColors.background,
                      color: currentColors.text
                    }}
                  >
                    <option value="">All</option>
                    {filter.options.map((option, idx) => (
                      <option key={idx} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                )}
                
                {filter.type === 'range' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: currentColors.text }}>
                        {filter.min}
                      </span>
                      <span style={{ fontSize: '12px', color: currentColors.text }}>
                        {filter.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      value={activeFilters[filter.id] || filter.min}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {filters.length === 0 && (
              <p style={{ color: currentColors.text, fontSize: '14px', textAlign: 'center' }}>
                No filters available for this dataset
              </p>
            )}
          </div>
        )}
        
        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div>
            <h3 style={{ color: currentColors.text, fontSize: '16px', marginBottom: '15px' }}>Dashboard Templates</h3>
            
            {templates.map((template, index) => (
              <div
                key={index}
                onClick={() => onTemplateChange(template.id)}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: currentTemplate === template.id ? currentColors.selected : currentColors.background,
                  border: `1px solid ${currentColors.border}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  fontWeight: currentTemplate === template.id ? 'bold' : 'normal',
                  color: currentColors.text,
                  fontSize: '14px'
                }}>
                  {template.name}
                </div>
                <div style={{ 
                  color: theme === 'light' ? '#666' : '#aaa',
                  fontSize: '12px', 
                  marginTop: '5px' 
                }}>
                  {template.description}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Settings Section */}
        {activeSection === 'settings' && (
          <div>
            <h3 style={{ color: currentColors.text, fontSize: '16px', marginBottom: '15px' }}>Settings</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                color: currentColors.text,
                fontSize: '14px'
              }}>
                Chart Animation
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.background,
                  color: currentColors.text
                }}
              >
                <option value="fast">Fast</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
                <option value="off">Off</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                color: currentColors.text,
                fontSize: '14px'
              }}>
                Auto-refresh
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.background,
                  color: currentColors.text
                }}
              >
                <option value="off">Off</option>
                <option value="30s">Every 30 seconds</option>
                <option value="1m">Every minute</option>
                <option value="5m">Every 5 minutes</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: currentColors.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  style={{ marginRight: '8px' }}
                />
                Show tooltips
              </label>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: currentColors.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  style={{ marginRight: '8px' }}
                />
                Cross-filtering enabled
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
