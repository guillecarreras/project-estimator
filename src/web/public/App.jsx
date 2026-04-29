import React, { useState, useEffect, useCallback } from 'react';
import ProjectListPage from './components/ProjectListPage';
import ProjectCreateForm from './components/ProjectCreateForm';
import EstimationForm from './components/EstimationForm';
import ResultsDashboard from './components/ResultsDashboard';
import './styles/App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [estimations, setEstimations] = useState([]);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEstimations = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/estimations?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch estimations');
      const data = await response.json();
      setEstimations(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching estimations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateProject = async (projectName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName }),
      });
      if (!response.ok) throw new Error('Failed to create project');
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setCurrentPage('projects');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchEstimations(project.id);
    setCurrentPage('estimation');
  };

  const handleCreateEstimation = async (backlog, config) => {
    if (!selectedProject) {
      setError('No project selected');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Call the backend estimation API
      const response = await fetch(`${API_BASE_URL}/estimations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          backlogJson: backlog,
          configJson: config,
          resultJson: {}, // This will be populated by the backend
        }),
      });

      if (!response.ok) throw new Error('Failed to create estimation');
      const estimation = await response.json();
      setSelectedEstimation(estimation);
      fetchEstimations(selectedProject.id);
      setCurrentPage('results');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setSelectedEstimation(null);
    setCurrentPage('projects');
    setSelectedProject(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Project Estimator Dashboard</h1>
          <p>AI-assisted project estimation for agile teams</p>
        </div>
        {selectedProject && (
          <div className="header-project">
            <span>Project: <strong>{selectedProject.name}</strong></span>
            <button className="btn-back" onClick={handleBackClick}>
              ← Back to Projects
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {!loading && (
          <>
            {currentPage === 'projects' && !selectedProject && (
              <div className="page-container">
                <div className="page-row">
                  <ProjectListPage
                    projects={projects}
                    onSelectProject={handleSelectProject}
                    onRefresh={fetchProjects}
                  />
                  <ProjectCreateForm onCreateProject={handleCreateProject} />
                </div>
              </div>
            )}

            {currentPage === 'estimation' && selectedProject && (
              <div className="page-container">
                <EstimationForm
                  project={selectedProject}
                  onCreateEstimation={handleCreateEstimation}
                  existingEstimations={estimations}
                />
              </div>
            )}

            {currentPage === 'results' && selectedEstimation && (
              <div className="page-container">
                <ResultsDashboard
                  estimation={selectedEstimation}
                  project={selectedProject}
                  onBack={() => setCurrentPage('estimation')}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Project Estimator v1.0 | Real-time estimation powered by AI</p>
      </footer>
    </div>
  );
}

export default App;
