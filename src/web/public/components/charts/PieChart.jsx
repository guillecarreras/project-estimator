import React from 'react';
import '../../styles/components.css';

function PieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <p>No data available</p>
      </div>
    );
  }

  const colors = [
    '#2196F3',
    '#4CAF50',
    '#FF9800',
    '#f44336',
    '#9C27B0',
    '#00BCD4',
    '#CDDC39',
    '#795548',
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const paths = data.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = colors[index % colors.length];

    currentAngle = endAngle;

    return { path, color, label: item.label, value: item.value.toFixed(1) };
  });

  const legendY = 20;
  const legendItemHeight = 20;

  return (
    <div className="chart-container">
      <svg width="100%" height="400" viewBox="0 0 500 400" style={{ maxWidth: '100%' }}>
        {/* Pie Chart */}
        {paths.map((item, index) => (
          <g key={index}>
            <path
              d={item.path}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Legend */}
        <g>
          {data.map((item, index) => (
            <g key={index} transform={`translate(250, ${legendY + index * legendItemHeight})`}>
              <rect width="12" height="12" fill={colors[index % colors.length]} />
              <text
                x="18"
                y="10"
                fontSize="12"
                fill="#333"
              >
                {item.label}: {item.value.toFixed(1)}%
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default PieChart;
