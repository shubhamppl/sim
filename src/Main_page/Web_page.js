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

  // State for ingredient sourcing
  const [ingredientSources, setIngredientSources] = useState({});
  const [ingredientControls, setIngredientControls] = useState({}); // Add new state for sliders

  // Updated ingredients data with percentages
  const ingredients = [
    { id: 1, name: 'Cocoa Butter', percentage: 32.79, details: '' },
    { id: 2, name: 'Sugar', percentage: 38.26, details: '' },
    { id: 3, name: 'Milk Powder', percentage: 27.37, details: '' },
    { id: 4, name: 'Vanilla Extract', percentage: 1.09, details: '' },
    { id: 5, name: 'Lecithin', percentage: 0.49, details: '' }
  ];

  // Updated country options
  const countryOptions = [
    'United States',
    'China',
    'India',
    'Brazil',
    'European Union',
    'New Zealand',
    'Madagascar'
  ];

  // Add predefined options
  const categoryOptions = [
    'Electronics',
    'Textiles',
    'Automotive',
    'Food & Beverages',
    'Chemicals',
    'Machinery'
  ];

  const productOptions = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'TV Sets'],
    'Textiles': ['Cotton Fabric', 'Silk Fabric', 'Wool Garments', 'Synthetic Fiber'],
    'Automotive': ['Cars', 'Spare Parts', 'Tires', 'Accessories'],
    'Food & Beverages': ['Chocolate', 'Coffee', 'Tea', 'Processed Foods'],
    'Chemicals': ['Industrial Chemicals', 'Pharmaceuticals', 'Plastics', 'Fertilizers'],
    'Machinery': ['Industrial Machinery', 'Agricultural Equipment', 'Construction Equipment']
  };

  // Initialize ingredient sources and controls when ingredient is expanded
  const initializeIngredientSources = (ingredientId) => {
    if (!ingredientSources[ingredientId]) {
      setIngredientSources(prev => ({
        ...prev,
        [ingredientId]: [{ 
          country: '', 
          percentage: 100,
          supplierAbsorption: 0,
          manufacturerAbsorption: 0,
          cashPaymentDelay: 0
        }]
      }));
    }
  };

  // Handle adding a new country for an ingredient
  const addCountrySource = (ingredientId) => {
    const currentSources = ingredientSources[ingredientId] || [];
    // Only add if there's room to add more (sum < 100%)
    const currentTotal = currentSources.reduce((sum, source) => sum + (parseFloat(source.percentage) || 0), 0);

    if (currentTotal < 100) {
      const newSources = [
        ...currentSources,
        { country: '', percentage: 100 - currentTotal, supplierAbsorption: 0, manufacturerAbsorption: 0, cashPaymentDelay: 0 }
      ];
      setIngredientSources(prev => ({
        ...prev,
        [ingredientId]: newSources
      }));
    } else {
      alert("Total percentage already equals 100%. Adjust existing values before adding more.");
    }
  };

  // Handle removing a country source
  const removeCountrySource = (ingredientId, index) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources.splice(index, 1);

    // If removing the last source, add one empty source
    if (newSources.length === 0) {
      newSources.push({ country: '', percentage: 100, supplierAbsorption: 0, manufacturerAbsorption: 0, cashPaymentDelay: 0 });
    }

    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  // Handle country change for a source
  const handleSourceCountryChange = (ingredientId, index, country) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index].country = country;
    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  // Handle percentage change for a source
  const handleSourcePercentageChange = (ingredientId, index, percentage) => {
    const value = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index].percentage = value;

    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  // Handle slider changes
  const handleSliderChange = (ingredientId, index, field, value) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index][field] = value;
    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  // Calculate weight based on ingredient percentage, total quantity, and source percentage
  const calculateSourceWeight = (ingredientPercentage, sourcePercentage) => {
    const baseWeight = (ingredientPercentage * totalQuantity / 100);
    const sourceWeight = (baseWeight * (sourcePercentage / 100) * (selectedType || 1)).toFixed(2);
    return sourceWeight;
  };

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
      initializeIngredientSources(id);
    }
  };

  const calculateIngredientWeight = (percentage) => {
    const baseWeight = (percentage * totalQuantity / 100);
    return (baseWeight * (selectedType || 1)).toFixed(2);
  };

  // Update category selection handler
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedProduct(''); // Reset product when category changes
  };

  // Add tariff constant
  const TARIFF_PERCENTAGE = 5;

  // Add new state variables for preview functionality
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({ headers: [], rows: [] });

  // Add function to handle preview click
  const handlePreviewClick = async () => {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open("TariffDB", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const files = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      if (files.length > 0) {
        // Get the most recent file
        const latestFile = files[files.length - 1];
        setPreviewData({
          headers: latestFile.headers,
          rows: latestFile.rows
        });
        setShowPreview(true);
      } else {
        alert('No uploaded files found');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Error loading preview data');
    }
  };

  const handleShowResults = () => {
    navigate('/results');
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
          <button
            className="upload-btn"
            onClick={handleSignOut}
            style={{ transform: 'translateY(-1px)' }}
          >
            Return to Home
          </button>
        </div>
      </div>

      <div className="filter-info">
        <div className="filter-header">
          <span>Configure your tariff analysis parameters:</span>
          <button className="preview-btn" onClick={handlePreviewClick}>
            Preview Data
          </button>
        </div>
        {showPreview && (
          <div className="preview-overlay">
            <div className="preview-modal">
              <div className="preview-header">
                <h3>Uploaded Data Preview</h3>
                <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
              </div>
              <div className="preview-content">
                {previewData.headers.length > 0 ? (
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {previewData.headers.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          </div>
        )}
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
            <option value="UnitedUnited Statess" />
            <option value="China" />
            <option value="India" />
            <option value="European Union" />
          </datalist>
        </div>

        <div className="search-item">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="search-input"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="search-item">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="search-input"
            disabled={!selectedCategory}
          >
            <option value="">Select Product</option>
            {selectedCategory && productOptions[selectedCategory]?.map((product) => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
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
                <div className="ingredient-row" onClick={() => toggleIngredient(ingredient.id)} style={{ display: 'flex', alignItems: 'center', padding: '15px', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div className="ingredient-info" style={{ display: 'flex', gap: '20px' }}>
                    <div className="ingredient-name">{ingredient.name}</div>
                    <div className="ingredient-percentage">percent: {ingredient.percentage}%</div>
                    <div className="ingredient-weight">weight: {calculateIngredientWeight(ingredient.percentage)}g</div>
                  </div>
                  <div className="expand-icon">
                    {expandedIngredient === ingredient.id ? '▼' : '▶'}
                  </div>
                </div>

                {expandedIngredient === ingredient.id && (
                  <div className="ingredient-expanded-content" style={{ padding: '15px', borderTop: '1px solid #eee' }}>
                    {ingredient.details && (
                      <div className="ingredient-details" style={{ marginBottom: '15px' }}>
                        <div className="details-text">{ingredient.details}</div>
                      </div>
                    )}

                    <div className="ingredient-sourcing-container">
                      {/* Wrapper for individual source rows */}
                      <div className="ingredient-sources-wrapper">
                        {ingredientSources[ingredient.id]?.map((source, index) => (
                          // Individual source row - uses flexbox to put items in a line
                          <div key={index} className="ingredient-source-row">
                            {/* Country Select */}
                            <select
                              className="source-select"
                              value={source.country}
                              onChange={(e) => handleSourceCountryChange(ingredient.id, index, e.target.value)}
                            >
                              <option value="">Select Country</option>
                              {countryOptions.map(country => (
                                <option key={country} value={country}>{country}</option>
                              ))}
                            </select>

                            <div className="slider-controls">
                              <div className="slider-group">
                                <label>Supplier Absorption (%)</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={source.supplierAbsorption || 0}
                                  onChange={(e) => handleSliderChange(ingredient.id, index, 'supplierAbsorption', parseInt(e.target.value))}
                                />
                                <span>{source.supplierAbsorption || 0}%</span>
                              </div>

                              <div className="slider-group">
                                <label>Manufacturer Absorption (%)</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={source.manufacturerAbsorption || 0}
                                  onChange={(e) => handleSliderChange(ingredient.id, index, 'manufacturerAbsorption', parseInt(e.target.value))}
                                />
                                <span>{source.manufacturerAbsorption || 0}%</span>
                              </div>

                              <div className="slider-group">
                                <label>Cash Payment Delay (days)</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="90"
                                  value={source.cashPaymentDelay || 0}
                                  onChange={(e) => handleSliderChange(ingredient.id, index, 'cashPaymentDelay', parseInt(e.target.value))}
                                />
                                <span>{source.cashPaymentDelay || 0} days</span>
                              </div>
                            </div>

                            {/* Percentage Input */}
                            <input
                              type="number"
                              value={source.percentage}
                              onChange={(e) => handleSourcePercentageChange(ingredient.id, index, e.target.value)}
                              min="0"
                              max="100"
                              placeholder="%"
                              className="source-percentage-input"
                            />

                            {/* Weight Display */}
                            <span className="source-weight">
                              weight: {calculateSourceWeight(ingredient.percentage, source.percentage)}g
                            </span>

                            {/* Tariff Display */}
                            <span className="source-tariff">
                              tariff: {TARIFF_PERCENTAGE}%
                            </span>

                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent toggling the ingredient
                                removeCountrySource(ingredient.id, index);
                              }}
                              className="remove-source-btn"
                              disabled={ingredientSources[ingredient.id]?.length <= 1}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Country Button - in a separate div for new line and right alignment */}
                      <div className="add-country-btn-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent toggling the ingredient
                            addCountrySource(ingredient.id);
                          }}
                          className="add-country-btn"
                        >
                          Add Country
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="show-results-container">
            <button className="show-results-btn" onClick={handleShowResults}>
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebPage;
