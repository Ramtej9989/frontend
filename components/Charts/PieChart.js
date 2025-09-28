import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const PieChart = ({ 
  data,
  title = "Pie Chart",
  colors,
  height = "100%",
  width = "100%",
  selectedCategory = null,
  onClick,
  theme = "light",
  donut = true
}) => {
  const [chartData, setChartData] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    if (!data || !data.labels || !data.values) return;

    // Set colors based on theme and selection
    const pieColors = data.labels.map((item, index) => 
      selectedCategory === item 
        ? colors[index % colors.length] 
        : selectedCategory 
          ? `${colors[index % colors.length]}40` // Faded color if something else is selected
          : colors[index % colors.length]
    );

    // Create Plotly data
    setChartData([{
      type: 'pie',
      labels: data.labels,
      values: data.values,
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      marker: {
        colors: pieColors,
        line: {
          color: theme === 'light' ? '#FFFFFF' : '#2d2d2d',
          width: 2
        }
      },
      hole: donut ? 0.4 : 0,
      pull: data.labels.map(item => selectedCategory === item ? 0.1 : 0),
      name: data.name || 'Categories'
    }]);

    // Create Plotly layout
    setLayout({
      title: {
        text: title,
        font: {
          family: "'Segoe UI', Roboto, Arial, sans-serif",
          size: 18,
          color: theme === 'light' ? '#333333' : '#f0f0f0'
        }
      },
      plot_bgcolor: theme === 'light' ? '#f9f9f9' : '#2d2d2d',
      paper_bgcolor: theme === 'light' ? '#f9f9f9' : '#2d2d2d',
      font: {
        family: "'Segoe UI', Roboto, Arial, sans-serif",
        color: theme === 'light' ? '#333333' : '#f0f0f0'
      },
      margin: { t: 40, b: 20, l: 20, r: 20 },
      showlegend: data.labels.length > 10, // Show legend only for many categories
      legend: {
        orientation: 'v',
        x: 1.05,
        y: 0.5,
        bgcolor: theme === 'light' ? '#f9f9f9' : '#2d2d2d',
        font: {
          family: "'Segoe UI', Roboto, Arial, sans-serif",
          color: theme === 'light' ? '#333333' : '#f0f0f0'
        }
      },
      annotations: donut ? [
        {
          text: data.centerText || 'Total',
          x: 0.5,
          y: 0.5,
          font: {
            size: 16,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          },
          showarrow: false
        }
      ] : []
    });
  }, [data, colors, selectedCategory, title, theme, donut]);

  if (!data || !data.labels || !data.values) {
    return (
      <div 
        style={{
          height: height, 
          width: width, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#f9f9f9' : '#2d2d2d',
          color: theme === 'light' ? '#333333' : '#f0f0f0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        No data available for pie chart visualization
      </div>
    );
  }

  return (
    <Plot
      data={chartData}
      layout={layout}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: width, height: height }}
      onClick={onClick}
    />
  );
};

export default PieChart;
