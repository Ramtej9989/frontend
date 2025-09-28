import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const HeatmapChart = ({ 
  data,
  title = "Correlation Heatmap",
  xAxisTitle = "",
  yAxisTitle = "",
  height = "100%",
  width = "100%",
  theme = "light"
}) => {
  const [chartData, setChartData] = useState([]);
  const [layout, setLayout] = useState({});

  useEffect(() => {
    if (!data || !data.z) return;

    // Default to z values if x and y aren't provided
    const xValues = data.x || Array.from({length: data.z[0].length}, (_, i) => `x${i+1}`);
    const yValues = data.y || Array.from({length: data.z.length}, (_, i) => `y${i+1}`);

    // Create Plotly data
    setChartData([{
      type: 'heatmap',
      z: data.z,
      x: xValues,
      y: yValues,
      colorscale: [
        [0, theme === 'light' ? '#FD625E' : '#F07427'],
        [0.5, theme === 'light' ? '#FFFFFF' : '#2d2d2d'],
        [1, theme === 'light' ? '#01B8AA' : '#3BB44A']
      ],
      showscale: true,
      hoverongaps: false,
      hoverinfo: 'x+y+z',
      colorbar: {
        title: 'Correlation',
        titleside: 'right',
        titlefont: {
          family: "'Segoe UI', Roboto, Arial, sans-serif",
          size: 14,
          color: theme === 'light' ? '#333333' : '#f0f0f0'
        }
      }
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
      margin: { t: 40, b: 40, l: 80, r: 40 },
      xaxis: {
        title: {
          text: xAxisTitle,
          font: {
            family: "'Segoe UI', Roboto, Arial, sans-serif",
            size: 14,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          }
        },
        tickangle: -45
      },
      yaxis: {
        title: {
          text: yAxisTitle,
          font: {
            family: "'Segoe UI', Roboto, Arial, sans-serif",
            size: 14,
            color: theme === 'light' ? '#333333' : '#f0f0f0'
          }
        }
      },
      annotations: data.annotations || []
    });
  }, [data, title, xAxisTitle, yAxisTitle, theme]);

  if (!data || !data.z) {
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
        No data available for heatmap visualization
      </div>
    );
  }

  return (
    <Plot
      data={chartData}
      layout={layout}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: width, height: height }}
    />
  );
};

export default HeatmapChart;
