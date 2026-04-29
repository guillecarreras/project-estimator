import React, { useState } from 'react';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import TimelineChart from './charts/TimelineChart';
import '../styles/components.css';

function ResultsDashboard({ estimation, project, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!estimation || !estimation.resultJson) {
    return (
      <div className="card">
        <h2>No Results Available</h2>
        <p>The estimation data is not available. Please try again.</p>
        <button onClick={onBack}>Back to Estimation</button>
      </div>
    );
  }

  const result = estimation.resultJson;
  const backlog = estimation.backlogJson || [];

  // Calculate totals
  const totalBaseHours = result.totalBaseHours || 0;
  const totalCost = result.totalCost || 0;
  const durationDays = result.durationDays || 0;
  const durationWeeks = result.durationWeeks || Math.ceil(durationDays / 5);
  const durationSprints = result.durationSprints || Math.ceil(durationWeeks / 2);

  // Team composition data
  const teamCompositionData = result.teamComposition || [];
  const roleEffortsData = result.roleEfforts || [];

  // Prepare chart data
  const teamPieData = teamCompositionData.map(team => ({
    label: team.role,
    value: team.allocationPercentage,
  }));

  const effortBarData = roleEffortsData.map(effort => ({
    label: effort.role,
    value: Math.round(effort.totalHours),
  }));

  const costBreakdownData = roleEffortsData.map(effort => ({
    label: effort.role,
    value: Math.round(effort.cost),
  }));

  // Export function
  const handleExport = () => {
    const data = {
      project: project.name,
      estimation: {
        backlog,
        config: estimation.configJson,
        result: estimation.resultJson,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estimation-${project.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Estimation Results</h2>
          <p style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
            Project: <strong>{project.name}</strong>
          </p>
        </div>
        <button className="btn-secondary" onClick={onBack}>Back</button>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{backlog.length}</div>
          <div className="stat-label">Backlog Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalBaseHours.toFixed(0)}</div>
          <div className="stat-label">Base Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{durationDays}</div>
          <div className="stat-label">Duration (Days)</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">${(totalCost / 1000).toFixed(1)}k</div>
          <div className="stat-label">Total Cost</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: '30px' }}>
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Team Composition
        </button>
        <button
          className={`tab-button ${activeTab === 'effort' ? 'active' : ''}`}
          onClick={() => setActiveTab('effort')}
        >
          Effort & Cost
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content active" style={{ marginTop: '20px' }}>
          <div className="results-detail-grid">
            <div className="result-section">
              <h3>Project Summary</h3>
              <div className="result-item">
                <div className="result-label">Total Backlog Items</div>
                <div className="result-value"><strong>{backlog.length}</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Base Effort</div>
                <div className="result-value"><strong>{totalBaseHours.toFixed(1)} hours</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Project Duration</div>
                <div className="result-value">
                  <strong>{durationDays} days</strong> ({durationWeeks} weeks, {durationSprints} sprints)
                </div>
              </div>
              <div className="result-item">
                <div className="result-label">Total Cost</div>
                <div className="result-value"><strong>${totalCost.toLocaleString()}</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Timeline</div>
                <div className="result-value">
                  <strong>{result.startDate}</strong> to <strong>{result.endDate}</strong>
                </div>
              </div>
            </div>

            <div className="result-section">
              <h3>Configuration</h3>
              <div className="result-item">
                <div className="result-label">Hours per Day</div>
                <div className="result-value"><strong>{estimation.configJson.hoursPerDay}</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Sprint Length</div>
                <div className="result-value"><strong>{estimation.configJson.sprintLengthWeeks} weeks</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Unit Testing</div>
                <div className="result-value"><strong>{estimation.configJson.unitTestingPercentage}%</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Bug Fixing</div>
                <div className="result-value"><strong>{estimation.configJson.bugFixingPercentage}%</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Documentation</div>
                <div className="result-value"><strong>{estimation.configJson.documentationPercentage}%</strong></div>
              </div>
              <div className="result-item">
                <div className="result-label">Contingency</div>
                <div className="result-value"><strong>{estimation.configJson.contingencyPercentage}%</strong></div>
              </div>
            </div>
          </div>

          {result.assumptions && result.assumptions.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Assumptions</h3>
              <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {result.assumptions.map((assumption, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn-success" onClick={handleExport} style={{ width: '100%', marginTop: '30px' }}>
            Export Results
          </button>
        </div>
      )}

      {/* Team Composition Tab */}
      {activeTab === 'team' && (
        <div className="tab-content active" style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h3>Team Allocation %</h3>
              <PieChart data={teamPieData} />
            </div>
            <div>
              <h3>Team Breakdown</h3>
              <div className="team-breakdown">
                {teamCompositionData.map((team, idx) => (
                  <div key={idx} className="team-item">
                    <div className="team-role">{team.role}</div>
                    <div className="team-allocation">
                      <div className="allocation-bar">
                        <div
                          className="allocation-fill"
                          style={{ width: `${team.allocationPercentage}%` }}
                        ></div>
                      </div>
                      <div className="allocation-label">{team.allocationPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Effort & Cost Tab */}
      {activeTab === 'effort' && (
        <div className="tab-content active" style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h3>Effort by Role (Hours)</h3>
              <BarChart data={effortBarData} />
            </div>
            <div>
              <h3>Cost Breakdown by Role</h3>
              <BarChart data={costBreakdownData} />
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Detailed Role Breakdown</h3>
            <div className="role-details">
              {roleEffortsData.map((effort, idx) => (
                <div key={idx} className="role-card">
                  <div className="role-header">
                    <span className="role-name">{effort.role}</span>
                    <span className="role-cost">${effort.cost.toLocaleString()}</span>
                  </div>
                  <div className="role-stats">
                    <div className="role-stat">
                      <div className="stat-label">Base Hours</div>
                      <div className="stat-value">{effort.baseHours.toFixed(1)}</div>
                    </div>
                    <div className="role-stat">
                      <div className="stat-label">Total Hours</div>
                      <div className="stat-value">{effort.totalHours.toFixed(1)}</div>
                    </div>
                    <div className="role-stat">
                      <div className="stat-label">FTE</div>
                      <div className="stat-value">{effort.fte.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="tab-content active" style={{ marginTop: '20px' }}>
          <h3>Project Timeline</h3>
          <TimelineChart
            startDate={result.startDate}
            endDate={result.endDate}
            durationDays={durationDays}
            durationWeeks={durationWeeks}
            durationSprints={durationSprints}
            tasks={result.ganttData || []}
          />
        </div>
      )}
    </div>
  );
}

export default ResultsDashboard;
