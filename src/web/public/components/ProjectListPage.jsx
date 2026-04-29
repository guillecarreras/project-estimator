import React, { useState } from 'react';
import '../styles/components.css';

function ProjectListPage({ projects, onSelectProject, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card">
      <h2>Projects</h2>

      <div className="form-group">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button className="btn-secondary" onClick={onRefresh} style={{ marginBottom: '20px' }}>
        Refresh List
      </button>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects found</h3>
          <p>Create your first project to get started with estimations</p>
        </div>
      ) : (
        <ul className="list">
          {filteredProjects.map((project) => (
            <li key={project.id} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{project.name}</div>
                <div className="list-item-meta">
                  ID: {project.id}
                </div>
              </div>
              <div className="list-item-action">
                <button
                  className="btn-primary"
                  onClick={() => onSelectProject(project)}
                >
                  Estimate
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectListPage;
