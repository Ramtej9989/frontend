import React, { useState } from 'react';

/**
 * FilterBar component for displaying active filters and providing clear options
 * 
 * @param {Object} props
 * @param {Object} props.activeFilters - Object with active filter key-value pairs
 * @param {Function} props.onClearFilter - Function to clear a specific filter
 * @param {Function} props.onClearAll - Function to clear all filters
 * @param {string} props.theme - Current theme ("light" or "dark")
 */
const FilterBar = ({ 
  activeFilters = {},
  onClearFilter,
  onClearAll,
  theme = "light"
}) => {
  // If no active filters, don't render anything
  if (Object.keys(activeFilters).length === 0) return null;

  // Get theme colors
  const backgroundColor = theme === 'light' 
    ? 'rgba(0, 120, 212, 0.1)' // light blue background
    : 'rgba(40, 153, 245, 0.1)'; // dark blue background
    
  const textColor = theme === 'light' ? '#333333' : '#f0f0f0';
  const primaryColor = theme === 'light' ? '#0078D4' : '#2899f5';

  return (
    <div className="filter-bar" style={{
      padding: '10px 15px',
      backgroundColor,
      borderRadius: '4px',
      marginBottom: '20px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '10px'
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        color: textColor 
      }}>
        Active Filters:
      </div>
      
      {Object.keys(activeFilters).map((filter) => (
        <div 
          key={filter} 
          className="filter-tag"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: primaryColor,
            color: 'white',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '14px'
          }}
        >
          {filter}: {typeof activeFilters[filter] === 'string' ? activeFilters[filter] : 'Selected'}
          
          <button
            onClick={() => onClearFilter(filter)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              marginLeft: '5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              borderRadius: '50%'
            }}
          >
            ✕
          </button>
        </div>
      ))}
      
      <button
        onClick={onClearAll}
        style={{
          marginLeft: 'auto',
          backgroundColor: 'transparent',
          border: `1px solid ${primaryColor}`,
          color: primaryColor,
          borderRadius: '4px',
          padding: '4px 10px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        Clear All
      </button>
    </div>
  );
};

export default FilterBar;
