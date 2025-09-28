/**
 * API client for interacting with the backend services
 */

/**
 * Analyze a file and get insights
 * @param {File} file - The file object to analyze
 * @returns {Promise<Object>} - The analysis results
 */
export const analyzeFile = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("https://fastapi-backend-9lje.onrender.com/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to analyze dataset: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

/**
 * Send a chat message and get a response about the dataset
 * @param {string} message - The user's message
 * @param {Object} datasetInfo - The dataset information
 * @returns {Promise<Object>} - The chat response
 */
export const sendChatMessage = async (message, datasetInfo) => {
  if (!message || !datasetInfo) {
    throw new Error("Message and dataset info are required");
  }

  try {
    const response = await fetch("https://fastapi-backend-9lje.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        dataset_info: datasetInfo,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get chat response");
    }

    return await response.json();
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};

/**
 * Save a dashboard layout to the server (could be implemented in future)
 * @param {Object} layout - The layout configuration to save
 * @param {string} name - Name of the layout
 * @returns {Promise<Object>} - The saved layout with ID
 */
export const saveLayoutToServer = async (layout, name) => {
  // This is a placeholder for future implementation
  // Currently layouts are only saved in localStorage
  
  console.log("Server-side layout saving not implemented yet");
  console.log("Layout would be saved with name:", name);
  
  // Return a mock response that mimics what a server would return
  return {
    id: `local-${Date.now()}`,
    name,
    layout,
    date: new Date().toISOString(),
    success: true
  };
};

/**
 * Load previously saved layouts from the server (could be implemented in future)
 * @returns {Promise<Array>} - Array of saved layouts
 */
export const loadLayoutsFromServer = async () => {
  // This is a placeholder for future implementation
  // Currently layouts are only loaded from localStorage
  
  console.log("Server-side layout loading not implemented yet");
  
  // Return an empty array as if no layouts were found on the server
  return [];
};

