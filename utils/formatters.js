/**
 * Utility functions for formatting data values
 */

/**
 * Format a number with the appropriate suffix (K, M, B) and precision
 * @param {number} num - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} - Formatted number string
 */
export const formatNumber = (num, precision = 2) => {
  if (num === null || num === undefined || isNaN(num)) {
    return "N/A";
  }
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(precision) + "B";
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(precision) + "M";
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(precision) + "K";
  } else if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(precision);
  }
};

/**
 * Format a percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} precision - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercent = (value, precision = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }
  
  return (value * 100).toFixed(precision) + "%";
};

/**
 * Format a date value
 * @param {string|Date} date - Date to format
 * @param {string} format - Format style ('short', 'long', 'full')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return "N/A";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }
    
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'full':
        return dateObj.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'short':
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Error";
  }
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (ms) => {
  if (!ms || isNaN(ms)) return "N/A";
  
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Format file size in bytes to human-readable string
 * @param {number} bytes - Size in bytes
 * @param {number} precision - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, precision = 1) => {
  if (bytes === 0) return "0 Bytes";
  if (!bytes || isNaN(bytes)) return "N/A";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(precision)) + " " + sizes[i];
};

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

/**
 * Format column names to be more readable
 * @param {string} columnName - Raw column name
 * @returns {string} - Formatted column name
 */
export const formatColumnName = (columnName) => {
  if (!columnName) return "";
  
  // Replace underscores with spaces
  let formatted = columnName.replace(/_/g, " ");
  
  // Capitalize each word
  formatted = formatted
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  return formatted;
};

/**
 * Format a value based on data type
 * @param {any} value - Value to format
 * @param {string} type - Data type ('number', 'date', 'percent', etc)
 * @returns {string} - Formatted value
 */
export const formatValue = (value, type) => {
  if (value === null || value === undefined) return "N/A";
  
  switch (type) {
    case 'number':
      return formatNumber(value);
    case 'percent':
      return formatPercent(value);
    case 'date':
      return formatDate(value);
    case 'fileSize':
      return formatFileSize(value);
    case 'duration':
      return formatDuration(value);
    default:
      return String(value);
  }
};
