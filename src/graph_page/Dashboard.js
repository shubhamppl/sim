import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState({
    overview: 'Overview content...',
    ingredients: 'Ingredients details...',
    costs: 'Cost analysis...',
    tariffs: 'Tariff impacts...',
    optimization: 'Optimization suggestions...'
  });

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleContentChange = (section, value) => {
    setEditableContent(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'ingredients', label: 'Ingredients', icon: '🧪' },
    { id: 'costs', label: 'Cost Analysis', icon: '💰' },
    { id: 'tariffs', label: 'Tariff Impact', icon: '📈' },
    { id: 'optimization', label: 'Optimization', icon: '⚡' }
  ];

  return (
    <div className="dashboard-container">
      <div className="header">
        <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
        <div className="header-controls">
          <button className="edit-btn" onClick={handleEdit}>
            {editMode ? 'Save Changes' : 'Edit Dashboard'}
          </button>
          <button className="back-btn" onClick={handleBack}>Back to Dashboard</button>
        </div>
      </div>
      <div className="dashboard-layout">
        <div className="sidebar">
          {sidebarItems.map(item => (
            <div
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="main-content">
          <h2>{sidebarItems.find(item => item.id === activeSection)?.label}</h2>
          {editMode ? (
            <textarea
              value={editableContent[activeSection]}
              onChange={(e) => handleContentChange(activeSection, e.target.value)}
              className="content-editor"
            />
          ) : (
            <div className="content-display">
              {editableContent[activeSection]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
