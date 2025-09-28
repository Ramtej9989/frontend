/**
 * Utility functions for chart manipulation and data transformation
 */

/**
 * Transforms raw data into Plotly bar chart format
 * @param {Object} data - Raw data from API
 * @param {string} key - The key in data to transform
 * @returns {Object} - Formatted data for Plotly bar chart
 */
export const formatBarChartData = (data, key) => {
  if (!data || !data[key]) return null;
  
  // Handle different data formats
  if (key.endsWith('_counts')) {
    // Categorical count data
    const countData = data[key];
    return {
      x: Object.keys(countData),
      y: Object.values(countData),
      type: 'bar',
      name: key.replace('_counts', '')
    };
  } else if (data.numeric_columns && key in data.numeric_columns) {
    // Numeric column data
    const numericData = data.numeric_columns[key];
    return {
      x: [key],
      y: [numericData.mean],
      error_y: {
        type: 'data',
        array: [numericData.std || 0],
        visible: true
      },
      type: 'bar',
      name: key
    };
  }
  
  return null;
};

/**
 * Transforms raw data into Plotly pie chart format
 * @param {Object} data - Raw data from API
 * @param {string} key - The key in data to transform
 * @returns {Object} - Formatted data for Plotly pie chart
 */
export const formatPieChartData = (data, key) => {
  if (!data || !data[`${key}_counts`]) return null;
  
  const countData = data[`${key}_counts`];
  return {
    labels: Object.keys(countData),
    values: Object.values(countData),
    type: 'pie',
    name: key,
    hoverinfo: 'label+percent+value',
    textinfo: 'percent',
    insidetextorientation: 'radial'
  };
};

/**
 * Transforms raw data into Plotly heatmap chart format
 * @param {Object} data - Raw data from API
 * @returns {Object|null} - Formatted data for Plotly heatmap chart or null if no correlation data
 */
export const formatHeatmapData = (data) => {
  if (!data || !data.raw_data || !data.columns) return null;
  
  try {
    // Create a correlation matrix from raw data
    const numericColumns = data.columns.filter(col => 
      data.dtypes[col].includes('float') || data.dtypes[col].includes('int')
    );
    
    if (numericColumns.length < 2) return null;
    
    // Calculate correlation matrix (this is simplified - in a real app,
    // you would want to get this from the backend)
    const correlationData = {
      z: [],
      x: numericColumns,
      y: numericColumns,
      type: 'heatmap',
      colorscale: 'RdBu_r',
      zmin: -1,
      zmax: 1
    };
    
    // Add annotations for each cell
    const annotations = [];
    
    return {
      data: [correlationData],
      annotations: annotations
    };
  } catch (error) {
    console.error("Error creating correlation matrix:", error);
    return null;
  }
};

/**
 * Gets available chart types based on the data
 * @param {Object} insights - The data from the API
 * @returns {Array} - Array of available chart types
 */
export const getAvailableChartTypes = (insights) => {
  if (!insights) return [];
  
  const chartTypes = [];
  
  if (insights.correlation_heatmap) chartTypes.push('correlation_heatmap');
  if (insights.pca) chartTypes.push('pca');
  if (insights.clusters || insights.kmeans) chartTypes.push('clusters');
  if (insights.numeric_bar) chartTypes.push('numeric_bar');
  if (insights.numeric_line) chartTypes.push('numeric_line');
  if (insights.numeric_stacked_bar) chartTypes.push('numeric_stacked_bar');
  if (insights.boxplot) chartTypes.push('boxplot');
  
  // Add categorical charts
  Object.keys(insights).forEach(key => {
    if (key.endsWith('_bar') && !key.includes('numeric_')) {
      chartTypes.push(key);
    } else if (key.endsWith('_pie')) {
      chartTypes.push(key);
    } else if (key.endsWith('_word_count')) {
      chartTypes.push(key);
    }
  });
  
  return chartTypes;
};

/**
 * Apply cross-filtering to dataset
 * @param {Array} data - The dataset to filter
 * @param {Object} filters - Active filters
 * @returns {Array} - Filtered dataset
 */
export const applyFilters = (data, filters) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return data;
  
  return data.filter(row => {
    // Check if the row matches all filters
    return Object.entries(filters).every(([column, value]) => {
      // Handle range filters (e.g., {price_range: [10, 50]})
      if (Array.isArray(value) && value.length === 2) {
        return row[column] >= value[0] && row[column] <= value[1];
      }
      
      // Handle exact match filters
      return row[column] === value;
    });
  });
};

/**
 * Convert base64 image to downloadable format
 * @param {string} base64Data - The base64 encoded image
 * @param {string} filename - The filename to save as
 */
export const downloadChartImage = (base64Data, filename = 'chart.png') => {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64Data}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create a shareable link for a dashboard layout
 * @param {Object} layout - Dashboard layout configuration
 * @returns {string} - Encoded URL for sharing
 */
export const createShareableLink = (layout) => {
  const shareableData = {
    type: 'dashboard-layout',
    layout: layout
  };
  
  const encodedData = btoa(JSON.stringify(shareableData));
  return `${window.location.origin}?layout=${encodedData}`;
};

/**
 * Parse a shareable layout from URL parameters
 * @returns {Object|null} - The parsed layout or null if none found
 */
export const parseSharedLayout = () => {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const encodedLayout = urlParams.get('layout');
  
  if (!encodedLayout) return null;
  
  try {
    const decodedData = JSON.parse(atob(encodedLayout));
    if (decodedData.type === 'dashboard-layout' && decodedData.layout) {
      return decodedData.layout;
    }
  } catch (error) {
    console.error("Error parsing shared layout:", error);
  }
  
  return null;
};
