import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const LineChart = ({ 
  data,
  title = "Line Chart",
  xAxisTitle = "X-Axis",
  yAxisTitle = "Y-Axis",
  colors,
  height = "100%",
  width = "100%",
  selectedCategory = null,
  onClick,
  theme = "light",
  showMarkers = true
}) => {
  const [chartData, setChartData] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    if (!data || !data.series || data.series.length === 0) return;

    // Create Plotly data from series
    const plotData = data.series.map((series, index) => {
      const isSelected = selectedCategory === series.name;
      const isFiltered = selectedCategory && !isSelected;
      
      return {
        type: 'scatter',
        mode: showMarkers ? 'lines+markers' : 'lines',
        name: series.name,
        x: series.x || Array.from({length: series.y.length}, (_, i) => i),
        y: series.y,
        line: {
          color: isFiltered ? `${colors[index % colors.length]}40` : colors[index % colors.length],
          width: isSelected ? 3 : 2
        },
        marker: showMarkers ? {
          size: isSelected ? 8 : 6,
          color: isFiltered ? `${colors[index % colors.length]}40` : colors[index % colors.length],
          line: {
            width: 1,
            color: theme === 'light' ? '#FFFFFF' : '#2d2d2d'
          }
        } : {},
        hoverinfo: 'x+y+name',
        hovertemplate: series.hovertemplate || '%{y:.2f}<extra>%{name}</extra>'
      };
    });

    setChartData(plotData);

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
      margin: { t: 40, b: 50, l: 60, r: 20 },
      xaxis: {
        title: {
          text: xAxisTitle,
          font: {
            family: "'Segoe UI', Roboto, Arial, sans-serif",
            size: 14,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          }
        },
        gridcolor: theme === 'light' ? '#e0e0e080' : '#44444480',
        zeroline: false
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
        gridcolor: theme === 'light' ? '#e0e0e080' : '#44444480',
        zeroline: false
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
      },
      hovermode: 'closest'
    });
  }, [data, colors, selectedCategory, title, xAxisTitle, yAxisTitle, theme, showMarkers]);

  if (!data || !data.series || data.series.length === 0) {
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
        No data available for line chart visualization
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

export default LineChart;
