import React, { useState } from 'react';
import '../styles/components.css';

function ProjectCreateForm({ onCreateProject }) {
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    try {
      await onCreateProject(projectName);
      setProjectName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create New Project</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">Project created successfully!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            type="text"
            placeholder="e.g., E-Commerce Platform"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-success"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>About Projects</h3>
        <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
          Projects are containers for your estimations. Create a new project for each initiative,
          product release, or major feature you want to estimate. You can then add multiple
          estimations to a single project.
        </p>
      </div>
    </div>
  );
}

export default ProjectCreateForm;
