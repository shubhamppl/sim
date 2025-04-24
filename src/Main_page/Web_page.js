import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Web_page.css';

const WebPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Add new state for search components
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const handleSignOut = () => {
    try {
      console.log('Signing out...');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/';
    }
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleDocumentation = () => {
    alert('Documentation coming soon!');
  };

  return (
    <div className="tariff-simulator">
      <div className="header">
        <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
        <div className="user-menu">
          <button 
            className="upload-btn" 
            onClick={handleDocumentation}
            style={{ marginRight: '10px' }}
          >
            Documentation
          </button>
          <button 
            className="upload-btn" 
            onClick={handleUpload}
            style={{ marginRight: '30px', transform: 'translateY(-1px)' }}
          >
            Upload
          </button>
          <img 
            src="/images/user.png" 
            alt="User" 
            className="user-icon" 
            onClick={handleUserClick}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="filter-info">
        Configure your tariff analysis parameters:
      </div>
      <div className="search-bar">
        <div className="search-item">
          <input 
            type="text"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="search-input"
            placeholder="Enter/Select Country"
            list="countries"
          />
          <datalist id="countries">
            <option value="United States" />
            <option value="China" />
            <option value="India" />
            <option value="European Union" />
          </datalist>
        </div>

        <div className="search-item">
          <input 
            type="text"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="search-input"
            placeholder="Enter/Select Type"
            list="types"
          />
          <datalist id="types">
            <option value="Import" />
            <option value="Export" />
          </datalist>
        </div>

        <div className="search-item">
          <input 
            type="text"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="search-input"
            placeholder="Enter/Select Category"
            list="categories"
          />
          <datalist id="categories">
            <option value="Electronics" />
            <option value="Textiles" />
            <option value="Automotive" />
            <option value="chocolate" />
          </datalist>
        </div>

        <div className="search-item">
          <input 
            type="text"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="search-input"
            placeholder="Search/Select Product"
            list="products"
          />
          <datalist id="products">
            <option value="snickers 100" />
            <option value="80% dark chocolate" />
            <option value="50% dark chocolate" />
          </datalist>
        </div>
      </div>
      
    </div>
  );
};

export default WebPage;