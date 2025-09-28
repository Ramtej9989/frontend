"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { v4 as uuidv4 } from 'uuid';

// Import components
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import KpiCard from '../components/Dashboard/KpiCard';
import FilterBar from '../components/Dashboard/FilterBar';
import DraggableChart from '../components/Dashboard/DraggableChart';
import Modal from '../components/UI/Modal';

// Dynamically import React Plotly for interactive charts
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Use the appropriate backend based on device capability
const DndBackend = typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0) 
  ? TouchBackend 
  : HTML5Backend;

// Define dashboard templates
const DASHBOARD_TEMPLATES = {
  executive: {
    name: "Executive View",
    description: "High-level KPIs and summary charts",
    layout: [
      { id: "kpi-section", type: "kpi", w: 12, h: 1 },
      { id: "main-viz-1", type: "chart", w: 6, h: 2 },
      { id: "main-viz-2", type: "chart", w: 6, h: 2 },
      { id: "details", type: "chart", w: 12, h: 2 }
    ]
  },
  analytical: {
    name: "Analytical View",
    description: "Detailed analysis with multiple visualizations",
    layout: [
      { id: "kpi-summary", type: "kpi", w: 12, h: 1 },
      { id: "viz-1", type: "chart", w: 4, h: 2 },
      { id: "viz-2", type: "chart", w: 4, h: 2 },
      { id: "viz-3", type: "chart", w: 4, h: 2 },
      { id: "viz-4", type: "chart", w: 6, h: 2 },
      { id: "viz-5", type: "chart", w: 6, h: 2 }
    ]
  },
  compact: {
    name: "Compact View",
    description: "Space-efficient layout for smaller screens",
    layout: [
      { id: "mini-kpi", type: "kpi", w: 12, h: 1 },
      { id: "main-chart", type: "chart", w: 12, h: 2 },
      { id: "secondary-charts", type: "chart", w: 12, h: 3 }
    ]
  }
};

export default function Home() {
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('dashboardTheme');
      return savedTheme || 'light';
    }
    return 'light';
  });
  const [fileName, setFileName] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [interactiveData, setInteractiveData] = useState({});
  
  // Dashboard customization state
  const [currentTemplate, setCurrentTemplate] = useState("analytical");
  const [layouts, setLayouts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('savedDashboardLayouts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  
  // Add new state for Add Chart functionality
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [availableCharts, setAvailableCharts] = useState([]);

  // Remove default dashboard by clearing localStorage on mount
  useEffect(() => {
    // Clear saved insights to prevent auto-loading a dashboard
    localStorage.removeItem('datasetInfo');
    localStorage.removeItem('fileName');
    localStorage.removeItem('lastUpdated');
    localStorage.removeItem('currentDashboardLayout');
    
    // But keep theme preference
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  // Initialize layout when insights change (but not on component mount)
  useEffect(() => {
    if (insights) {
      const savedCurrentLayout = localStorage.getItem('currentDashboardLayout');
      
      if (savedCurrentLayout) {
        try {
          const parsed = JSON.parse(savedCurrentLayout);
          setLayouts(parsed);
        } catch (e) {
          initializeDefaultLayout();
        }
      } else {
        initializeDefaultLayout();
      }
    }
  }, [insights, currentTemplate]);

  const initializeDefaultLayout = () => {
    if (!insights) return;
    
    // Start with template layout
    const templateLayout = [...DASHBOARD_TEMPLATES[currentTemplate].layout];
    
    // Assign actual charts to template positions
    const chartLayout = templateLayout.map((item, index) => {
      const newItem = {...item};
      
      if (item.type === 'kpi') {
        newItem.contentType = 'kpi';
      } else {
        // Assign chart types based on available insights
        const chartTypes = getAvailableChartTypes();
        if (chartTypes.length > 0) {
          const chartIndex = index % chartTypes.length;
          newItem.contentType = chartTypes[chartIndex];
        } else {
          newItem.contentType = 'placeholder';
        }
      }
      
      // Generate unique ID if not present
      if (!newItem.id) {
        newItem.id = uuidv4();
      }
      
      return newItem;
    });
    
    setLayouts(chartLayout);
    // Save to localStorage
    localStorage.setItem('currentDashboardLayout', JSON.stringify(chartLayout));
    
    // Prepare available charts for the Add Chart modal
    prepareAvailableCharts(insights);
  };

  const getAvailableChartTypes = () => {
    if (!insights) return [];
    
    const chartTypes = [];
    
    // Basic chart types
    if (insights.correlation_heatmap) chartTypes.push('correlation_heatmap');
    if (insights.pca) chartTypes.push('pca');
    if (insights.clusters || insights.kmeans) chartTypes.push('clusters');
    if (insights.numeric_bar) chartTypes.push('numeric_bar');
    if (insights.numeric_line) chartTypes.push('numeric_line');
    if (insights.numeric_stacked_bar) chartTypes.push('numeric_stacked_bar');
    
    // New chart types
    if (insights.line_chart) chartTypes.push('line_chart');
    if (insights.area_chart) chartTypes.push('area_chart');
    if (insights.waterfall_chart) chartTypes.push('waterfall_chart');
    if (insights.table_chart) chartTypes.push('table_chart');
    if (insights.ribbon_chart) chartTypes.push('ribbon_chart');
    if (insights.matrix_chart) chartTypes.push('matrix_chart');
    if (insights.donut_chart) chartTypes.push('donut_chart');
    if (insights.gauge_chart) chartTypes.push('gauge_chart');
    if (insights.funnel_chart) chartTypes.push('funnel_chart');
    if (insights.bubble_chart) chartTypes.push('bubble_chart');
    if (insights.radar_chart) chartTypes.push('radar_chart');
    if (insights.pareto_chart) chartTypes.push('pareto_chart');
    if (insights.boxplot) chartTypes.push('boxplot');
    if (insights.histograms) chartTypes.push('histograms');
    if (insights.scatter_plot) chartTypes.push('scatter_plot');
    if (insights.network_graph) chartTypes.push('network_graph');
    if (insights.calendar_heatmap) chartTypes.push('calendar_heatmap');
    
    // Add categorical charts
    Object.keys(insights).forEach(key => {
      if (key.endsWith('_bar') && !key.includes('numeric_')) {
        chartTypes.push(key);
      } else if (key.endsWith('_pie')) {
        chartTypes.push(key);
      } else if (key.endsWith('_word_count')) {
        chartTypes.push(key);
      } else if (key.endsWith('_donut')) {
        chartTypes.push(key);
      } else if (key.endsWith('_tree_map')) {
        chartTypes.push(key);
      } else if (key.endsWith('_wordcloud')) {
        chartTypes.push(key);
      }
    });
    
    return chartTypes;
  };

  // Prepare available charts for the Add Chart modal
  const prepareAvailableCharts = (data) => {
    if (!data) return;
    
    const charts = [];
    
    // Detect all available chart types in the data
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string' && data[key].length > 1000) {  // Check if it's likely a base64 image
        let title = '';
        
        // Determine chart title based on key
        if (key === 'correlation_heatmap') title = 'Correlation Heatmap';
        else if (key === 'pca') title = 'PCA Projection';
        else if (key === 'clusters' || key === 'kmeans') title = 'Data Clusters';
        else if (key === 'numeric_bar') title = 'Numeric Column Averages';
        else if (key === 'numeric_line') title = 'Trend Analysis';
        else if (key === 'numeric_stacked_bar') title = 'Multi-dimension Comparison';
        else if (key === 'line_chart') title = 'Line Chart';
        else if (key === 'area_chart') title = 'Area Chart';
        else if (key === 'waterfall_chart') title = 'Waterfall Chart';
        else if (key === 'table_chart') title = 'Data Table';
        else if (key === 'ribbon_chart') title = 'Ribbon Chart';
        else if (key === 'matrix_chart') title = 'Matrix Chart';
        else if (key === 'gauge_chart') title = 'Gauge Chart';
        else if (key === 'funnel_chart') title = 'Funnel Chart';
        else if (key === 'bubble_chart') title = 'Bubble Chart';
        else if (key === 'radar_chart') title = 'Radar Chart';
        else if (key === 'pareto_chart') title = 'Pareto Chart';
        else if (key === 'boxplot') title = 'Box Plot';
        else if (key === 'histograms') title = 'Histograms';
        else if (key === 'scatter_plot') title = 'Scatter Plot';
        else if (key === 'network_graph') title = 'Network Graph';
        else if (key === 'calendar_heatmap') title = 'Calendar Heatmap';
        else if (key.endsWith('_bar')) title = `${key.replace('_bar', '')} Bar Chart`;
        else if (key.endsWith('_pie')) title = `${key.replace('_pie', '')} Pie Chart`;
        else if (key.endsWith('_donut')) title = `${key.replace('_donut', '')} Donut Chart`;
        else if (key.endsWith('_word_count')) title = `${key.replace('_word_count', '')} Word Frequency`;
        else if (key.endsWith('_tree_map')) title = `${key.replace('_tree_map', '')} Tree Map`;
        else if (key.endsWith('_wordcloud')) title = `${key.replace('_wordcloud', '')} Word Cloud`;
        else title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        charts.push({
          id: key,
          title: title,
          image: data[key]
        });
      }
    });
    
    setAvailableCharts(charts);
  };
  
  // Function to add a new chart to the dashboard
  const addChartToDashboard = (chart) => {
    const newChart = {
      id: uuidv4(),
      type: "chart",
      contentType: chart.id,
      w: 6, // Default width: half of the dashboard width
      h: 2  // Default height
    };
    
    const newLayouts = [...layouts, newChart];
    setLayouts(newLayouts);
    localStorage.setItem('currentDashboardLayout', JSON.stringify(newLayouts));
    setShowAddChartModal(false);
  };

  const moveChart = (dragIndex, hoverIndex) => {
    const dragChart = layouts[dragIndex];
    const newLayouts = [...layouts];
    
    // Remove the dragged item
    newLayouts.splice(dragIndex, 1);
    // Insert it at the new position
    newLayouts.splice(hoverIndex, 0, dragChart);
    
    setLayouts(newLayouts);
    // Save to localStorage
    localStorage.setItem('currentDashboardLayout', JSON.stringify(newLayouts));
  };

  const handleChartTypeChange = (index, newType) => {
    const newLayouts = [...layouts];
    newLayouts[index].contentType = newType;
    setLayouts(newLayouts);
    // Save to localStorage
    localStorage.setItem('currentDashboardLayout', JSON.stringify(newLayouts));
  };

  const handleSaveLayout = () => {
    if (!newLayoutName.trim()) {
      alert("Please enter a name for your layout");
      return;
    }
    
    const newLayout = {
      id: uuidv4(),
      name: newLayoutName,
      layout: layouts,
      date: new Date().toISOString(),
      template: currentTemplate
    };
    
    const updatedSavedLayouts = [...savedLayouts, newLayout];
    setSavedLayouts(updatedSavedLayouts);
    localStorage.setItem('savedDashboardLayouts', JSON.stringify(updatedSavedLayouts));
    
    setShowLayoutModal(false);
    setNewLayoutName("");
  };

  const handleLoadLayout = (layout) => {
    setLayouts(layout.layout);
    setCurrentTemplate(layout.template);
    localStorage.setItem('currentDashboardLayout', JSON.stringify(layout.layout));
  };

  const handleShareLayout = (layout) => {
    // Create a shareable link or code
    const shareableData = {
      type: 'dashboard-layout',
      layout: layout
    };
    
    const shareableCode = btoa(JSON.stringify(shareableData));
    
    // Copy to clipboard
    navigator.clipboard.writeText(`${window.location.origin}?layout=${shareableCode}`)
      .then(() => {
        alert("Layout sharing link copied to clipboard!");
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        alert("Layout code: " + shareableCode);
      });
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setLoading(true);
    setError(null);
    setFileName(file.name);
    setLastUpdated(new Date().toLocaleString());
    setSelectedCategory(null);
    setActiveFilters({});

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://fastapi-backend-9lje.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to analyze dataset");

      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setInsights(data);
        prepareInteractiveData(data);
        prepareAvailableCharts(data);
        
        // Save the dataset info and file data for persistence
        localStorage.setItem("datasetInfo", JSON.stringify(data));
        localStorage.setItem("fileName", file.name);
        localStorage.setItem("lastUpdated", new Date().toLocaleString());
        
        // Auto-switch to dashboard tab when data loads
        setActiveTab("dashboard");
        
        // Initialize default layout
        initializeDefaultLayout();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for interactive charts
  const prepareInteractiveData = (data) => {
    const interactiveCharts = {};
    
    // Numeric data for bar chart
    if (data.numeric_columns) {
      const numericColumns = data.numeric_columns;
      const means = Object.keys(numericColumns).map(col => ({
        column: col,
        mean: numericColumns[col].mean,
        min: numericColumns[col].min,
        max: numericColumns[col].max
      }));
      
      interactiveCharts.numericBar = {
        x: means.map(item => item.column),
        y: means.map(item => item.mean),
        min: means.map(item => item.min),
        max: means.map(item => item.max),
        type: 'bar'
      };
    }
    
    // Categorical data
    const categoryData = {};
    Object.keys(data).forEach(key => {
      if (key.endsWith('_pie') || key.endsWith('_bar')) {
        const colName = key.replace('_pie', '').replace('_bar', '');
        if (data[`${colName}_counts`]) {
          categoryData[colName] = data[`${colName}_counts`];
        }
      }
    });
    
    interactiveCharts.categories = categoryData;
    setInteractiveData(interactiveCharts);
  };

  // Handle click on chart elements - implement cross-filtering
  const handleChartClick = (data) => {
    if (data.points && data.points.length > 0) {
      const pointData = data.points[0];
      const category = pointData.x || pointData.label;
      
      // Toggle category selection
      if (selectedCategory === category) {
        setSelectedCategory(null);
      } else {
        setSelectedCategory(category);
        
        // Apply cross-filtering
        setActiveFilters(prev => ({
          ...prev,
          [pointData.data.name || 'category']: category
        }));
      }
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory(null);
    setActiveFilters({});
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Save to localStorage
    localStorage.setItem('dashboardTheme', newTheme);
  };

  // Format numbers for display
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    } else {
      return num.toFixed(2);
    }
  };

  // Get theme colors based on current theme
  const themeColors = {
    light: {
      background: "#ffffff",
      text: "#333333",
      primary: "#0078D4",
      secondary: "#0050B3",
      accent: "#107C10",
      card: "#f9f9f9",
      border: "#e0e0e0",
      chartColors: ["#0078D4", "#107C10", "#FFB900", "#D83B01", "#B4009E", "#00B294", "#0099BC", "#E74856", "#8764B8", "#038387"]
    },
    dark: {
      background: "#1f1f1f",
      text: "#f0f0f0",
      primary: "#2899f5",
      secondary: "#6CB4F3",
      accent: "#3BB44A",
      card: "#2d2d2d",
      border: "#444444",
      chartColors: ["#2899f5", "#3BB44A", "#FFD23E", "#F07427", "#D067CE", "#00B294", "#52B0EF", "#FF7B83", "#A992D4", "#50C2C9"]
    }
  };
  
  const colors = themeColors[theme];

  // Render a specific chart based on type
  const renderChart = (chartType) => {
    // If chart type is not available in insights, show placeholder
    if (!insights || !chartType || (chartType !== 'kpi' && !insights[chartType])) {
      return (
        <div className="chart-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <p>No chart available</p>
        </div>
      );
    }
    
    // KPI section is special
    if (chartType === 'kpi') {
      return (
        <div className="kpi-section">
          {/* Dataset KPI Card */}
          <KpiCard
            title="Dataset Size"
            value={insights.shape[0].toLocaleString()}
            label="rows"
            stats={{ columns: insights.shape[1] }}
            theme={theme}
            color={colors.primary}
          />
          
          {/* Generate KPI cards from available numeric column KPIs */}
          {Object.keys(insights)
            .filter(k => k.endsWith("_kpi"))
            .slice(0, 4)
            .map((key, idx) => {
              const kpi = insights[key];
              const colName = key.replace("_kpi", "");
              const isHighlighted = selectedCategory === colName || 
                                    (activeFilters[colName] !== undefined);
              
              return (
                <KpiCard
                  key={idx}
                  title={colName}
                  value={formatNumber(kpi.mean)}
                  label="avg"
                  stats={{ 
                    Min: formatNumber(kpi.min),
                    Max: formatNumber(kpi.max)
                  }}
                  isHighlighted={isHighlighted}
                  theme={theme}
                  color={colors.primary}
                  onClick={() => {
                    if (isHighlighted) {
                      setSelectedCategory(null);
                      setActiveFilters(prev => {
                        const newFilters = {...prev};
                        delete newFilters[colName];
                        return newFilters;
                      });
                    } else {
                      setSelectedCategory(colName);
                      setActiveFilters(prev => ({
                        ...prev,
                        [colName]: true
                      }));
                    }
                  }}
                />
              );
            })}
            
          {/* Missing Data KPI Card */}
          <KpiCard
            title="Missing Values"
            value={Object.values(insights.missing).reduce((a, b) => a + b, 0).toLocaleString()}
            label="total"
            stats={{ 
              'affected columns': Object.keys(insights.missing).filter(k => insights.missing[k] > 0).length
            }}
            theme={theme}
            color="#e74c3c"
          />
        </div>
      );
    }
    
    // For all other chart types
    let chartTitle = "";
    let chartImage = null;
    
    // Determine chart title and image based on type
    if (chartType.includes('correlation')) {
      chartTitle = "Correlation Analysis";
      chartImage = insights.correlation_heatmap;
    } else if (chartType === 'pca') {
      chartTitle = "Dimension Reduction (PCA)";
      chartImage = insights.pca;
    } else if (chartType === 'clusters' || chartType === 'kmeans') {
      chartTitle = "Data Clusters";
      chartImage = insights.clusters || insights.kmeans;
    } else if (chartType === 'numeric_bar') {
      chartTitle = "Numeric Column Averages";
      chartImage = insights.numeric_bar;
    } else if (chartType === 'numeric_line') {
      chartTitle = "Trend Analysis";
      chartImage = insights.numeric_line;
    } else if (chartType === 'numeric_stacked_bar') {
      chartTitle = "Multi-dimension Comparison";
      chartImage = insights.numeric_stacked_bar;
    } else if (chartType === 'line_chart') {
      chartTitle = "Line Chart Analysis";
      chartImage = insights.line_chart;
    } else if (chartType === 'area_chart') {
      chartTitle = "Area Chart Analysis";
      chartImage = insights.area_chart;
    } else if (chartType === 'waterfall_chart') {
      chartTitle = "Waterfall Chart";
      chartImage = insights.waterfall_chart;
    } else if (chartType === 'table_chart') {
      chartTitle = "Data Table View";
      chartImage = insights.table_chart;
    } else if (chartType === 'ribbon_chart') {
      chartTitle = "Ribbon Chart";
      chartImage = insights.ribbon_chart;
    } else if (chartType === 'matrix_chart') {
      chartTitle = "Matrix Chart";
      chartImage = insights.matrix_chart;
    } else if (chartType === 'gauge_chart') {
      chartTitle = "Performance Gauge";
      chartImage = insights.gauge_chart;
    } else if (chartType === 'funnel_chart') {
      chartTitle = "Conversion Funnel";
      chartImage = insights.funnel_chart;
    } else if (chartType === 'bubble_chart') {
      chartTitle = "Bubble Chart";
      chartImage = insights.bubble_chart;
    } else if (chartType === 'radar_chart') {
      chartTitle = "Radar Chart";
      chartImage = insights.radar_chart;
    } else if (chartType === 'pareto_chart') {
      chartTitle = "Pareto Chart";
      chartImage = insights.pareto_chart;
    } else if (chartType === 'boxplot') {
      chartTitle = "Box Plot Distribution";
      chartImage = insights.boxplot;
    } else if (chartType === 'histograms') {
      chartTitle = "Histogram Distributions";
      chartImage = insights.histograms;
    } else if (chartType === 'scatter_plot') {
      chartTitle = "Scatter Plot";
      chartImage = insights.scatter_plot;
    } else if (chartType === 'network_graph') {
      chartTitle = "Network Graph";
      chartImage = insights.network_graph;
    } else if (chartType === 'calendar_heatmap') {
      chartTitle = "Calendar Heatmap";
      chartImage = insights.calendar_heatmap;
    } else if (chartType.endsWith('_bar') && !chartType.includes('numeric_')) {
      // Categorical bar chart
      chartTitle = `${chartType.replace('_bar', '')} Distribution`;
      chartImage = insights[chartType];
    } else if (chartType.endsWith('_pie')) {
      // Pie chart
      chartTitle = `${chartType.replace('_pie', '')} Distribution`;
      chartImage = insights[chartType];
    } else if (chartType.endsWith('_donut')) {
      // Donut chart
      chartTitle = `${chartType.replace('_donut', '')} Donut Chart`;
      chartImage = insights[chartType];
    } else if (chartType.endsWith('_word_count')) {
      // Word frequency
      chartTitle = `${chartType.replace('_word_count', '')} Word Frequency`;
      chartImage = insights[chartType];
    } else if (chartType.endsWith('_tree_map')) {
      // Tree map
      chartTitle = `${chartType.replace('_tree_map', '')} Tree Map`;
      chartImage = insights[chartType];
    } else if (chartType.endsWith('_wordcloud')) {
      // Word cloud
      chartTitle = `${chartType.replace('_wordcloud', '')} Word Cloud`;
      chartImage = insights[chartType];
    }
    
    // Check if this chart should be filtered based on active filters
    const chartName = chartType.replace('_bar', '')
                              .replace('_pie', '')
                              .replace('_word_count', '');
    
    const shouldFilter = Object.keys(activeFilters).length > 0 && 
                         !Object.keys(activeFilters).includes(chartName);
    
    return (
      <>
        <h3 className="chart-title">{chartTitle}</h3>
        <div className="chart-container">
          {shouldFilter ? (
            <div className="filtered-overlay">
              <div className="filtered-message">
                <p>Filtered by other selections</p>
                <button 
                  className="clear-filters-btn"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </button>
              </div>
              <img
                src={`data:image/png;base64,${chartImage}`}
                alt={chartTitle}
                className="chart-image filtered"
              />
            </div>
          ) : (
            <img
              src={`data:image/png;base64,${chartImage}`}
              alt={chartTitle}
              className="chart-image"
              onClick={() => {
                if (chartType.endsWith('_bar') || chartType.endsWith('_pie')) {
                  const colName = chartType.replace('_bar', '').replace('_pie', '');
                  if (selectedCategory === colName) {
                    setSelectedCategory(null);
                    setActiveFilters(prev => {
                      const newFilters = {...prev};
                      delete newFilters[colName];
                      return newFilters;
                    });
                  } else {
                                        setSelectedCategory(colName);
                    setActiveFilters(prev => ({
                      ...prev,
                      [colName]: true
                    }));
                  }
                }
              }}
            />
          )}
        </div>
        
        {/* Chart Type Selector (only in edit mode) */}
        {editMode && (
          <div className="chart-type-selector">
            <select 
              value={chartType} 
              onChange={(e) => handleChartTypeChange(
                layouts.findIndex(item => item.contentType === chartType),
                e.target.value
              )}
            >
              {getAvailableChartTypes().map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        )}
      </>
    );
  };

  return (
    <DndProvider backend={DndBackend}>
      <div className="dashboard-container">
        <Header 
          title="Dynamic Data Insight Dashboard"
          fileName={fileName}
          lastUpdated={lastUpdated}
          theme={theme}
          onThemeToggle={toggleTheme}
          onFileSelect={setFile}
          onAnalyze={handleUpload}
          loading={loading}
          file={file}
        />

        {/* Tabs Navigation */}
        {insights && (
          <div className="tabs-container">
            <div 
              onClick={() => setActiveTab("dashboard")} 
              className={`tab ${activeTab === "dashboard" ? "active" : ""}`}
            >
              Dashboard
            </div>
            <div 
              onClick={() => setActiveTab("data")} 
              className={`tab ${activeTab === "data" ? "active" : ""}`}
            >
              Data Summary
            </div>
            
            {/* Customize dashboard button */}
            <div style={{marginLeft: "20px", display: 'flex', alignItems: 'center'}}>
              <button 
                onClick={() => setEditMode(!editMode)} 
                className={`customize-button ${editMode ? 'active' : ''}`}
              >
                {editMode ? 'Done Customizing' : 'Customize Dashboard'}
              </button>
            </div>
            
            {/* Dashboard templates dropdown */}
            {editMode && (
              <div className="dashboard-actions">
                <div className="template-selector">
                  <select
                    value={currentTemplate}
                    onChange={(e) => {
                      setCurrentTemplate(e.target.value);
                      initializeDefaultLayout();
                    }}
                  >
                    <option value="executive">Executive View</option>
                    <option value="analytical">Analytical View</option>
                    <option value="compact">Compact View</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setShowLayoutModal(true)}
                  className="save-layout-button"
                >
                  Save Layout
                </button>
                
                <div className="layout-dropdown">
                  <button className="layouts-button">
                    Saved Layouts
                    <span style={{ marginLeft: '5px' }}>▼</span>
                  </button>
                  
                  <div className="layouts-dropdown-content">
                    {savedLayouts.length === 0 ? (
                      <div className="no-layouts">
                        No saved layouts
                      </div>
                    ) : (
                      savedLayouts.map((layout) => (
                        <div key={layout.id} className="layout-item">
                          <div>
                            <div className="layout-name">{layout.name}</div>
                            <div className="layout-date">
                              {new Date(layout.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => handleLoadLayout(layout)}
                              className="load-button"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleShareLayout(layout)}
                              className="share-button"
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add New Chart button */}
            <div style={{marginLeft: "15px"}}>
              <button 
                onClick={() => setShowAddChartModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 12px',
                  backgroundColor: theme === 'light' ? '#0078D4' : '#2899f5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add New Chart
              </button>
            </div>

            {/* Chat button */}
            <div style={{marginLeft: "auto"}}>
              <Link href="/chat" className="chat-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor" />
                </svg>
                Chat with Data
              </Link>
            </div>
          </div>
        )}

        {/* Save Layout Modal */}
        {showLayoutModal && (
          <Modal
            isOpen={showLayoutModal}
            onClose={() => setShowLayoutModal(false)}
            title="Save Dashboard Layout"
            theme={theme}
            size="sm"
          >
            <p>Give this layout a name to save it for future use.</p>
            <input
              type="text"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Layout name..."
              className="layout-name-input"
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowLayoutModal(false)} 
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLayout}
                className="save-button" 
              >
                Save Layout
              </button>
            </div>
          </Modal>
        )}
        
        {/* Add Chart Modal */}
        {showAddChartModal && (
          <Modal
            isOpen={showAddChartModal}
            onClose={() => setShowAddChartModal(false)}
            title="Add New Chart"
            theme={theme}
            size="md"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {availableCharts.map(chart => (
                <div 
                  key={chart.id} 
                  onClick={() => addChartToDashboard(chart)}
                  style={{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: theme === 'light' ? '#f5f5f5' : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ margin: '0 0 10px 0' }}>{chart.title}</h4>
                  <div style={{ 
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={`data:image/png;base64,${chart.image}`}
                      alt={chart.title}
                      style={{ maxWidth: '100%', maxHeight: '120px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {/* Active Filters Bar */}
        {Object.keys(activeFilters).length > 0 && (
          <FilterBar 
            activeFilters={activeFilters}
            onClearFilter={(filter) => {
              setActiveFilters(prev => {
                const newFilters = {...prev};
                delete newFilters[filter];
                return newFilters;
              });
              if (selectedCategory === filter) {
                setSelectedCategory(null);
              }
            }}
            onClearAll={clearAllFilters}
            theme={theme}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <p>Suggestions:</p>
            <ul>
              <li>Try with a smaller file</li>
              <li>Make sure your file is properly formatted</li>
              <li>Restart the API server if it's unresponsive</li>
            </ul>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing your data and generating visualizations...</p>
            <p className="loading-subtext">
              This may take a few moments depending on the file size and complexity.
            </p>
          </div>
        )}

        {/* Dashboard Tab Content */}
        {insights && activeTab === "dashboard" && (
          <div className="dashboard-content">
            {/* Slicers Row */}
            <div className="slicers-row">
              {/* Categorical Data Slicer */}
              {Object.keys(insights).filter(k => k.endsWith('_counts')).slice(0, 2).map((key, idx) => {
                const fieldName = key.replace('_counts', '');
                const countData = insights[key] || {};
                
                return (
                  <div key={idx} className="slicer-container">
                    <h3 className="slicer-title">{fieldName} Filter</h3>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="slicer-search"
                    />
                    <div className="slicer-items">
                      {Object.keys(countData).slice(0, 8).map((item, i) => {
                        const isSelected = activeFilters[fieldName] === item;
                        
                        return (
                          <div
                            key={i}
                            className={`slicer-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setActiveFilters(prev => {
                                  const newFilters = {...prev};
                                  delete newFilters[fieldName];
                                  return newFilters;
                                });
                              } else {
                                setActiveFilters(prev => ({
                                  ...prev,
                                  [fieldName]: item
                                }));
                              }
                              setSelectedCategory(isSelected ? null : fieldName);
                            }}
                          >
                            {item} ({countData[item]})
                          </div>
                        );
                      })}
                      {Object.keys(countData).length > 8 && (
                        <div className="slicer-item more-items">
                          +{Object.keys(countData).length - 8} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Quick Filter Cards */}
              <div className="slicer-container">
                <h3 className="slicer-title">Quick Filters</h3>
                <div className="quick-filters">
                  <button
                    onClick={() => {
                      // Apply top 20% filter logic
                      if (!insights || !insights.numeric_columns) return;
                      
                      const numericColumns = insights.numeric_columns;
                      const topColumn = Object.keys(numericColumns).sort((a, b) => 
                        numericColumns[b].mean - numericColumns[a].mean
                      )[0];
                      
                      if (topColumn) {
                        setSelectedCategory(topColumn);
                        setActiveFilters(prev => ({
                          ...prev,
                          [topColumn]: 'Top 20%'
                        }));
                      }
                    }}
                    className="quick-filter-button top-filter"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                    <span>Top 20%</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Reset all filters
                      clearAllFilters();
                    }}
                    className="quick-filter-button reset-filter"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5"></path>
                      <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    <span>Reset All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard grid - draggable in edit mode */}
            <div className={`dashboard-grid ${editMode ? 'edit-mode' : ''}`}>
              {layouts.map((item, index) => (
                editMode ? (
                  <DraggableChart 
                    key={item.id} 
                    id={item.id} 
                    index={index} 
                    chart={item} 
                    moveChart={moveChart}
                  >
                    {renderChart(item.contentType)}
                  </DraggableChart>
                ) : (
                  <div key={item.id} className="chart-card">
                    {renderChart(item.contentType)}
                  </div>
                )
              ))}
            </div>

            {/* Empty state */}
            {layouts.length === 0 && !loading && (
              <div className="empty-dashboard">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <h3>No charts added yet</h3>
                <p>
                  Click "Add New Chart" to create your custom dashboard
                </p>
                <button
                  onClick={() => setShowAddChartModal(true)}
                  className="customize-button"
                  style={{
                    backgroundColor: theme === 'light' ? '#0078D4' : '#2899f5',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Add New Chart
                </button>
              </div>
            )}
          </div>
        )}

        {/* Data Summary Tab Content */}
        {insights && activeTab === "data" && (
          <div className="data-summary">
            <div className="data-summary-container">
              <h2 className="section-title">Dataset Overview</h2>
              
              <div className="info-section">
                <h3 className="subsection-title">Dimensions</h3>
                <p className="info-text">
                  <strong>Rows:</strong> {insights.shape[0].toLocaleString()} | <strong>Columns:</strong> {insights.shape[1]}
                </p>
              </div>
              
              <div className="info-section">
                <h3 className="subsection-title">Column Types</h3>
                <div className="tags-container">
                  {Object.entries(insights.dtypes || {}).map(([col, type], idx) => {
                    const isHighlighted = selectedCategory === col;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`type-tag ${isHighlighted ? 'highlighted' : ''} ${
                          type.includes('float') ? 'float' : 
                          type.includes('int') ? 'int' : 
                          type.includes('object') ? 'object' : 'other'
                        }`}
                        onClick={() => setSelectedCategory(isHighlighted ? null : col)}
                      >
                        <strong>{col}:</strong> {type}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="info-section">
                <h3 className="subsection-title">Missing Values</h3>
                <div className="tags-container">
                  {Object.entries(insights.missing || {}).map(([col, count], idx) => {
                    const isHighlighted = selectedCategory === col;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`missing-tag ${isHighlighted ? 'highlighted' : ''} ${count > 0 ? 'has-missing' : 'no-missing'}`}
                        onClick={() => setSelectedCategory(isHighlighted ? null : col)}
                      >
                        <strong>{col}:</strong> {count} {count === 1 ? "value" : "values"} missing
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Numeric Column Statistics */}
              <div className="info-section">
                <h3 className="subsection-title">Numeric Column Statistics</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Mean</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(insights).filter(k => k.includes("_kpi")).map((key, idx) => {
                        const kpi = insights[key];
                        const colName = key.replace("_kpi", "");
                        const isHighlighted = selectedCategory === colName;
                        
                        return (
                          <tr 
                            key={idx} 
                            className={isHighlighted ? "highlighted-row" : ""}
                            onClick={() => setSelectedCategory(isHighlighted ? null : colName)}
                          >
                            <td>{colName}</td>
                            <td>{formatNumber(kpi.mean)}</td>
                            <td>{formatNumber(kpi.min)}</td>
                            <td>{formatNumber(kpi.max)}</td>
                            <td>{formatNumber(kpi.sum)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer 
          theme={theme} 
          processingTime={insights ? ((new Date() - new Date(lastUpdated)) / 1000).toFixed(2) : null}
        />
      </div>
    </DndProvider>
  );
}


