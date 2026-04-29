import React from 'react';
import '../../styles/components.css';

function BarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const padding = 40;
  const chartHeight = 300;
  const chartWidth = 400;
  const barWidth = (chartWidth - 2 * padding) / data.length;
  const barSpacing = 10;

  return (
    <div className="chart-container">
      <svg width="100%" height="350" viewBox="0 0 500 350" style={{ maxWidth: '100%' }}>
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight} stroke="#ddd" strokeWidth="2" />
        <line x1={padding} y1={chartHeight} x2={chartWidth + padding} y2={chartHeight} stroke="#ddd" strokeWidth="2" />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = Math.round(maxValue * ratio);
          const y = chartHeight - ratio * (chartHeight - 2 * padding);
          return (
            <g key={index}>
              <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="#ddd" strokeWidth="1" />
              <text x={padding - 10} y={y + 4} fontSize="10" textAnchor="end" fill="#999">
                {value}
              </text>
            </g>
          );
        })}

        {/* Bars and labels */}
        {data.map((item, index) => {
          const x = padding + index * barWidth + barSpacing;
          const barHeight = (item.value / maxValue) * (chartHeight - 2 * padding);
          const y = chartHeight - barHeight;
          const width = barWidth - 2 * barSpacing;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill="#2196F3"
                rx="2"
              />
              <text
                x={x + width / 2}
                y={chartHeight + 20}
                fontSize="12"
                textAnchor="middle"
                fill="#333"
              >
                {item.label}
              </text>
              <text
                x={x + width / 2}
                y={y - 5}
                fontSize="11"
                textAnchor="middle"
                fill="#2196F3"
                fontWeight="bold"
              >
                {item.value.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BarChart;
