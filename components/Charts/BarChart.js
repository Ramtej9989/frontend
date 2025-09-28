import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const BarChart = ({ 
  data,
  title = "Bar Chart",
  xAxisTitle = "Categories",
  yAxisTitle = "Values",
  colors,
  height = "100%",
  width = "100%",
  selectedCategory = null,
  onClick,
  theme = "light"
}) => {
  const [chartData, setChartData] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    if (!data || !data.x || !data.y) return;

    // Set colors based on theme and selection
    const barColors = data.x.map((item) => 
      selectedCategory === item 
        ? colors[0] 
        : selectedCategory 
          ? `${colors[0]}40` // Faded color if something else is selected
          : colors[0]
    );

    // Create Plotly data
    setChartData([{
      type: 'bar',
      x: data.x,
      y: data.y,
      marker: {
        color: barColors,
        line: {
          color: colors[0],
          width: 1
        }
      },
      name: data.name || 'Values',
      hoverinfo: 'x+y+text',
      hovertext: data.hovertext || null,
      error_y: data.error_y || null
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
      margin: { t: 40, b: 80, l: 60, r: 30 },
      xaxis: {
        title: {
          text: xAxisTitle,
          font: {
            family: "'Segoe UI', Roboto, Arial, sans-serif",
            size: 14,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          }
        },
        tickangle: -45,
        gridcolor: theme === 'light' ? '#e0e0e080' : '#44444480'
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          font: {
            family: "'Segoe UI', Roboto, Arial, sans-serif",
            size: 14,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          }
        },
        gridcolor: theme === 'light' ? '#e0e0e080' : '#44444480'
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h',
        bgcolor: theme === 'light' ? '#f9f9f9' : '#2d2d2d',
        font: {
          family: "'Segoe UI', Roboto, Arial, sans-serif",
          color: theme === 'light' ? '#333333' : '#f0f0f0'
        }
      }
    });
  }, [data, colors, selectedCategory, title, xAxisTitle, yAxisTitle, theme]);

  if (!data || !data.x || !data.y) {
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
        No data available for bar chart visualization
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

export default BarChart;
