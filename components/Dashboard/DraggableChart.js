import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

/**
 * A draggable wrapper component for charts that can be rearranged in a dashboard
 * 
 * @param {Object} props
 * @param {string} props.id - Unique ID for this chart
 * @param {number} props.index - Current position in the layout array
 * @param {Object} props.chart - Chart configuration object
 * @param {Function} props.moveChart - Function to handle moving charts
 * @param {React.ReactNode} props.children - Chart component to render inside wrapper
 */
const DraggableChart = ({ id, index, chart, moveChart, children }) => {
  const ref = useRef(null);
  
  // Setup drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'CHART',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Setup drop target
  const [, drop] = useDrop({
    accept: 'CHART',
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;
      
      // Call the move function
      moveChart(dragIndex, hoverIndex);
      
      // Update the index for the dragged item
      item.index = hoverIndex;
    },
  });
  
  // Apply drag and drop refs to the same element
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`chart-card ${isDragging ? 'is-dragging' : ''}`}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        gridColumn: `span ${chart.w || 1}`,
        gridRow: `span ${chart.h || 1}`
      }}
    >
      <div className="drag-handle">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

export default DraggableChart;
