import React from 'react';

/**
 * Displays a KPI (Key Performance Indicator) card with value, label and trends
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the KPI
 * @param {number|string} props.value - Main value to display
 * @param {string} props.label - Label for the value (e.g., "total", "avg")
 * @param {Object} props.stats - Additional statistics to show (e.g., min, max)
 * @param {boolean} props.isHighlighted - Whether the card should be highlighted
 * @param {Function} props.onClick - Function to call when card is clicked
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {string} props.color - Primary color for the value
 * @param {Object} props.trend - Trend data {value: number, direction: "up"|"down"|"flat"}
 */
const KpiCard = ({ 
  title, 
  value, 
  label, 
  stats, 
  isHighlighted = false,
  onClick,
  theme = "light",
  color = "#0078D4",
  trend
}) => {
  // Generate theme-specific colors
  const backgroundColor = isHighlighted 
    ? `${color}20` 
    : theme === 'light' ? '#f9f9f9' : '#2d2d2d';
  
  const borderColor = isHighlighted 
    ? color 
    : theme === 'light' ? '#e0e0e0' : '#444444';
  
  const textColor = theme === 'light' ? '#333333' : '#f0f0f0';
  const subTextColor = theme === 'light' ? '#666666' : '#aaaaaa';
  
  // Determine trend color and icon
  let trendColor = '#666666';
  let trendIcon = null;
  
  if (trend) {
    if (trend.direction === 'up') {
      trendColor = '#107C10'; // green
      trendIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2">
          <path d="M7 14l5-5 5 5" />
        </svg>
      );
    } else if (trend.direction === 'down') {
      trendColor = '#D83B01'; // red
      trendIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2">
          <path d="M7 10l5 5 5-5" />
        </svg>
      );
    } else {
      trendColor = '#666666'; // neutral
      trendIcon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2">
          <path d="M5 12h14" />
        </svg>
      );
    }
  }

  return (
    <div 
      className="kpi-card"
      onClick={onClick}
      style={{
        backgroundColor,
        borderColor,
        boxShadow: isHighlighted ? `0 0 0 2px ${color}` : '0 4px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <h3 className="kpi-title" style={{ color: textColor }}>{title}</h3>
      
      <div className="kpi-value-container">
        <span className="kpi-value" style={{ color }}>{value}</span>
        <span className="kpi-label" style={{ color: subTextColor }}>{label}</span>
        
        {trend && (
          <div className="kpi-trend" style={{ color: trendColor, marginLeft: '8px' }}>
            {trendIcon}
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>{trend.value}</span>
          </div>
        )}
      </div>
      
      {stats && (
        <div className="kpi-stats" style={{ color: subTextColor }}>
          {Object.entries(stats).map(([key, val], idx) => (
            <span key={idx}>{key}: {val}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
