import React from 'react';
import '../../styles/components.css';

function TimelineChart({ startDate, endDate, durationDays, durationWeeks, durationSprints, tasks }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Generate week markers
  const weeks = [];
  const currentDate = new Date(start);
  let weekCount = 0;

  while (currentDate <= end) {
    weeks.push({
      startDate: new Date(currentDate),
      weekNumber: weekCount + 1,
    });
    currentDate.setDate(currentDate.getDate() + 7);
    weekCount++;
  }

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = 400 / Math.max(totalDays, 1);

  return (
    <div className="chart-container">
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(600, totalDays * 8)} height="300" style={{ minWidth: '100%' }}>
          {/* Timeline background */}
          <defs>
            <pattern id="grid" width={pixelsPerDay * 7} height="100%" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="100%" stroke="#eee" strokeWidth="1" />
              <line x1={pixelsPerDay * 7} y1="0" x2={pixelsPerDay * 7} y2="100%" stroke="#ddd" strokeWidth="2" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Week markers */}
          {weeks.map((week, index) => {
            const offset = Math.ceil((week.startDate - start) / (1000 * 60 * 60 * 24)) * pixelsPerDay;
            return (
              <g key={index}>
                <text
                  x={offset + (pixelsPerDay * 7) / 2}
                  y="25"
                  fontSize="12"
                  textAnchor="middle"
                  fill="#666"
                  fontWeight="bold"
                >
                  W{week.weekNumber}
                </text>
              </g>
            );
          })}

          {/* Timeline bar */}
          <rect
            x="10"
            y="50"
            width={totalDays * pixelsPerDay}
            height="30"
            fill="#2196F3"
            opacity="0.8"
            rx="4"
          />

          {/* Start and end dates */}
          <text x="10" y="100" fontSize="12" fill="#333">
            {startDate}
          </text>
          <text
            x={10 + totalDays * pixelsPerDay}
            y="100"
            fontSize="12"
            fill="#333"
            textAnchor="end"
          >
            {endDate}
          </text>

          {/* Sprint markers */}
          {Array.from({ length: durationSprints }).map((_, index) => {
            const sprintDays = Math.ceil(totalDays / durationSprints);
            const offset = 10 + index * sprintDays * pixelsPerDay;
            return (
              <g key={index}>
                <line
                  x1={offset}
                  y1="45"
                  x2={offset}
                  y2="85"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <text
                  x={offset}
                  y="115"
                  fontSize="10"
                  fill="#4CAF50"
                  textAnchor="middle"
                >
                  Sprint {index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary */}
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        <div className="stat-card">
          <div className="stat-value">{durationDays}</div>
          <div className="stat-label">Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{durationWeeks}</div>
          <div className="stat-label">Weeks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{durationSprints}</div>
          <div className="stat-label">Sprints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{startDate}</div>
          <div className="stat-label">Start Date</div>
        </div>
      </div>
    </div>
  );
}

export default TimelineChart;
