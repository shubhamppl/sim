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
  
  // New state for form submission and ingredients
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(100); // Default 100g total

  // Updated ingredients data with percentages
  const ingredients = [
    { id: 1, name: 'Cocoa Butter', percentage: 32.79, details: 'Origin: Ghana, Price: $12.50/kg, Quality: Premium' },
    { id: 2, name: 'Sugar', percentage: 38.26, details: 'Origin: Brazil, Price: $2.30/kg, Quality: Refined' },
    { id: 3, name: 'Milk Powder', percentage: 27.37, details: 'Origin: New Zealand, Price: $8.75/kg, Quality: Full Cream' },
    { id: 4, name: 'Vanilla Extract', percentage: 1.09, details: 'Origin: Madagascar, Price: $45.20/L, Quality: Pure' },
    { id: 5, name: 'Lecithin', percentage: 0.49, details: 'Origin: USA, Price: $15.60/kg, Quality: Soy-based' }
  ];

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

  const handleSubmit = () => {
    // Validate inputs if needed
    if (selectedCountry && selectedType && selectedCategory && selectedProduct) {
      setIsSubmitted(true);
    } else {
      alert('Please fill in all fields before submitting');
    }
  };

  const toggleIngredient = (id) => {
    if (expandedIngredient === id) {
      setExpandedIngredient(null);
    } else {
      setExpandedIngredient(id);
    }
  };

  const calculateIngredientWeight = (percentage) => {
    const baseWeight = (percentage * totalQuantity / 100);
    return (baseWeight * (selectedType || 1)).toFixed(2);
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

        <div className="search-item">
          <input 
            type="number"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="search-input"
            placeholder="Enter units"
            min="0"
            step="1"
          />
        </div>
      </div>
      
      <div className="submit-container">
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      {isSubmitted && (
        <div className="ingredients-container">
          <h2>Ingredients for {selectedProduct}</h2>
          <p className="config-text">Configure the ingredients quantities and specifications:</p>
          <div className="ingredients-list">
            {ingredients.map(ingredient => (
              <div key={ingredient.id} className="ingredient-item">
                <div 
                  className="ingredient-header" 
                  onClick={() => toggleIngredient(ingredient.id)}
                >
                  <div className="ingredient-info">
                    <div className="ingredient-name">{ingredient.name}</div>
                    <div className="ingredient-percentage">{ingredient.percentage}%</div>
                    <div className="ingredient-weight">{calculateIngredientWeight(ingredient.percentage)}g</div>
                  </div>
                  <div className="expand-icon">
                    {expandedIngredient === ingredient.id ? '▼' : '▶'}
                  </div>
                </div>
                {expandedIngredient === ingredient.id && (
                  <div className="ingredient-details">
                    {ingredient.details}
                    <div className="ingredient-filters">
                      <input 
                        type="number" 
                        value={calculateIngredientWeight(ingredient.percentage)}
                        readOnly
                        className="ingredient-input"
                      />
                      <select className="ingredient-input">
                        <option value="">Select Quality</option>
                        <option value="premium">Premium</option>
                        <option value="standard">Standard</option>
                        <option value="basic">Basic</option>
                      </select>
                      <select className="ingredient-input">
                        <option value="">Select Origin</option>
                        <option value="domestic">Domestic</option>
                        <option value="imported">Imported</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="show-results-container">
            <button className="show-results-btn">Show Results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebPage;