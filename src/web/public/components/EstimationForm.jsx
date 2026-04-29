import React, { useState } from 'react';
import '../styles/components.css';

const ROLES = ['Fullstack', 'QA', 'DevOps', 'BA', 'SM', 'UX'];

const TSHIRT_SIZES = [
  { value: 'XS', label: 'XS - Extra Small (1 day)' },
  { value: 'S', label: 'S - Small (2 days)' },
  { value: 'M', label: 'M - Medium (3 days)' },
  { value: 'L', label: 'L - Large (5 days)' },
  { value: 'XL', label: 'XL - Extra Large (8 days)' },
  { value: 'XXL', label: 'XXL - Double Extra Large (13 days)' },
  { value: 'XXXL', label: 'XXXL - Triple Extra Large (21 days)' },
];

function EstimationForm({ project, onCreateEstimation, existingEstimations }) {
  const [activeTab, setActiveTab] = useState('backlog');
  const [backlogItems, setBacklogItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Backlog form state
  const [epic, setEpic] = useState('');
  const [feature, setFeature] = useState('');
  const [tshirtSize, setTshirtSize] = useState('');
  const [selectedRoles, setSelectedRoles] = useState({});

  // Config form state
  const [config, setConfig] = useState({
    hoursPerDay: 6,
    sprintLengthWeeks: 2,
    unitTestingPercentage: 15,
    bugFixingPercentage: 20,
    documentationPercentage: 10,
    contingencyPercentage: 15,
    startDate: new Date().toISOString().split('T')[0],
  });

  const toggleRole = (role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const addBacklogItem = () => {
    setError(null);

    if (!epic.trim()) {
      setError('Epic name is required');
      return;
    }

    if (!feature.trim()) {
      setError('Feature description is required');
      return;
    }

    if (!tshirtSize) {
      setError('T-Shirt size is required');
      return;
    }

    const selectedRolesList = Object.keys(selectedRoles).filter(role => selectedRoles[role]);
    if (selectedRolesList.length === 0) {
      setError('At least one role is required');
      return;
    }

    setBacklogItems([
      ...backlogItems,
      {
        epic,
        feature,
        tshirt_size: tshirtSize,
        roles: selectedRolesList,
      },
    ]);

    // Clear form
    setEpic('');
    setFeature('');
    setTshirtSize('');
    setSelectedRoles({});
  };

  const removeBacklogItem = (index) => {
    setBacklogItems(backlogItems.filter((_, i) => i !== index));
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (backlogItems.length === 0) {
      setError('Add at least one backlog item');
      return;
    }

    setLoading(true);
    try {
      await onCreateEstimation(backlogItems, config);
    } catch (err) {
      setError(err.message || 'Failed to create estimation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Estimation for {project.name}</h2>

      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          Backlog Items ({backlogItems.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
      </div>

      {activeTab === 'backlog' && (
        <div className="tab-content active">
          <div className="form-group">
            <label htmlFor="epic">Epic Name</label>
            <input
              id="epic"
              type="text"
              placeholder="e.g., User Authentication"
              value={epic}
              onChange={(e) => setEpic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="feature">Feature Description</label>
            <input
              id="feature"
              type="text"
              placeholder="e.g., Login with Email"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tshirtSize">Effort (T-Shirt Size)</label>
            <select
              id="tshirtSize"
              value={tshirtSize}
              onChange={(e) => setTshirtSize(e.target.value)}
            >
              <option value="">Select Size</option>
              {TSHIRT_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Required Roles</label>
            <div className="roles-grid">
              {ROLES.map(role => (
                <label key={role} className="role-label">
                  <input
                    type="checkbox"
                    checked={selectedRoles[role] || false}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <button type="button" className="btn-primary" onClick={addBacklogItem}>
            Add Item
          </button>

          {backlogItems.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Backlog Items</h3>
              <ul className="backlog-list">
                {backlogItems.map((item, index) => (
                  <li key={index} className="backlog-item">
                    <div className="backlog-item-content">
                      <div className="backlog-item-title">{item.feature}</div>
                      <div className="backlog-item-meta">{item.epic}</div>
                      <div className="badge-group">
                        <span className="badge primary">{item.tshirt_size}</span>
                        {item.roles.map(role => (
                          <span key={role} className="badge primary">{role}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeBacklogItem(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="tab-content active">
          <div className="form-group">
            <label htmlFor="hoursPerDay">Hours Per Day</label>
            <input
              id="hoursPerDay"
              type="number"
              min="1"
              max="12"
              value={config.hoursPerDay}
              onChange={(e) => handleConfigChange('hoursPerDay', parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sprintLengthWeeks">Sprint Length (weeks)</label>
            <input
              id="sprintLengthWeeks"
              type="number"
              min="1"
              max="4"
              value={config.sprintLengthWeeks}
              onChange={(e) => handleConfigChange('sprintLengthWeeks', parseInt(e.target.value))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unitTestingPercentage">Unit Testing %</label>
              <input
                id="unitTestingPercentage"
                type="number"
                min="0"
                max="100"
                value={config.unitTestingPercentage}
                onChange={(e) => handleConfigChange('unitTestingPercentage', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bugFixingPercentage">Bug Fixing %</label>
              <input
                id="bugFixingPercentage"
                type="number"
                min="0"
                max="100"
                value={config.bugFixingPercentage}
                onChange={(e) => handleConfigChange('bugFixingPercentage', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="documentationPercentage">Documentation %</label>
              <input
                id="documentationPercentage"
                type="number"
                min="0"
                max="100"
                value={config.documentationPercentage}
                onChange={(e) => handleConfigChange('documentationPercentage', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contingencyPercentage">Contingency %</label>
              <input
                id="contingencyPercentage"
                type="number"
                min="0"
                max="100"
                value={config.contingencyPercentage}
                onChange={(e) => handleConfigChange('contingencyPercentage', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={config.startDate}
              onChange={(e) => handleConfigChange('startDate', e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-success"
            onClick={handleSubmit}
            disabled={loading || backlogItems.length === 0}
            style={{ width: '100%' }}
          >
            {loading ? 'Running Estimation...' : 'Run Estimation'}
          </button>
        </div>
      )}

      {backlogItems.length === 0 && (
        <div className="empty-state" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon">📋</div>
          <h3>No backlog items added</h3>
          <p>Add backlog items to create an estimation</p>
        </div>
      )}
    </div>
  );
}

export default EstimationForm;
