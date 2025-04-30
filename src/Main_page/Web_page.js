import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Web_page.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const WebPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Search component states
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Form submission and ingredients states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(100); // Default 100g total

  // Ingredient sourcing states
  const [ingredientSources, setIngredientSources] = useState({});
  const [ingredientControls, setIngredientControls] = useState({});

  // Raw material states for chart
  const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  // Expanded raw material tariff data to include all ingredients
  const rawMaterialTariffData = {
    'Cocoa Butter': [
      { country: 'USA', tariff: 10 },
      { country: 'China', tariff: 15 },
      { country: 'Germany', tariff: 8 },
      { country: 'India', tariff: 12 },
      { country: 'Brazil', tariff: 7 },
      { country: 'European Union', tariff: 9 },
      { country: 'New Zealand', tariff: 6 },
      { country: 'Madagascar', tariff: 11 }
    ],
    'Sugar': [
      { country: 'USA', tariff: 5 },
      { country: 'China', tariff: 10 },
      { country: 'Germany', tariff: 7 },
      { country: 'India', tariff: 8 },
      { country: 'Brazil', tariff: 4 },
      { country: 'European Union', tariff: 6 },
      { country: 'New Zealand', tariff: 3 },
      { country: 'Madagascar', tariff: 9 }
    ],
    'Milk Powder': [
      { country: 'USA', tariff: 8 },
      { country: 'China', tariff: 12 },
      { country: 'Germany', tariff: 6 },
      { country: 'India', tariff: 10 },
      { country: 'Brazil', tariff: 7 },
      { country: 'European Union', tariff: 5 },
      { country: 'New Zealand', tariff: 3 },
      { country: 'Madagascar', tariff: 14 }
    ],
    'Vanilla Extract': [
      { country: 'USA', tariff: 12 },
      { country: 'China', tariff: 18 },
      { country: 'Germany', tariff: 9 },
      { country: 'India', tariff: 15 },
      { country: 'Brazil', tariff: 11 },
      { country: 'European Union', tariff: 8 },
      { country: 'New Zealand', tariff: 7 },
      { country: 'Madagascar', tariff: 4 }
    ],
    'Lecithin': [
      { country: 'USA', tariff: 4 },
      { country: 'China', tariff: 9 },
      { country: 'Germany', tariff: 5 },
      { country: 'India', tariff: 7 },
      { country: 'Brazil', tariff: 6 },
      { country: 'European Union', tariff: 3 },
      { country: 'New Zealand', tariff: 2 },
      { country: 'Madagascar', tariff: 8 }
    ],
    'Steel': [
      { country: 'USA', tariff: 5 },
      { country: 'China', tariff: 25 },
      { country: 'Germany', tariff: 10 },
      { country: 'India', tariff: 20 },
      { country: 'Brazil', tariff: 15 },
      { country: 'European Union', tariff: 8 },
      { country: 'New Zealand', tariff: 12 },
      { country: 'Madagascar', tariff: 18 }
    ],
    'Aluminum': [
      { country: 'USA', tariff: 7 },
      { country: 'China', tariff: 20 },
      { country: 'Germany', tariff: 8 },
      { country: 'India', tariff: 15 },
      { country: 'Brazil', tariff: 12 },
      { country: 'European Union', tariff: 6 },
      { country: 'New Zealand', tariff: 9 },
      { country: 'Madagascar', tariff: 14 }
    ],
    'Rubber': [
      { country: 'USA', tariff: 8 },
      { country: 'China', tariff: 15 },
      { country: 'Germany', tariff: 5 },
      { country: 'India', tariff: 25 },
      { country: 'Brazil', tariff: 10 },
      { country: 'European Union', tariff: 7 },
      { country: 'New Zealand', tariff: 9 },
      { country: 'Madagascar', tariff: 12 }
    ],
    'Plastic': [
      { country: 'USA', tariff: 3 },
      { country: 'China', tariff: 5 },
      { country: 'Germany', tariff: 4 },
      { country: 'India', tariff: 10 },
      { country: 'Brazil', tariff: 7 },
      { country: 'European Union', tariff: 2 },
      { country: 'New Zealand', tariff: 6 },
      { country: 'Madagascar', tariff: 8 }
    ],
    'Copper': [
      { country: 'USA', tariff: 2 },
      { country: 'China', tariff: 8 },
      { country: 'Germany', tariff: 3 },
      { country: 'India', tariff: 7 },
      { country: 'Brazil', tariff: 5 },
      { country: 'European Union', tariff: 1 },
      { country: 'New Zealand', tariff: 4 },
      { country: 'Madagascar', tariff: 6 }
    ],
    'Coffee Beans': [
      { country: 'USA', tariff: 7 },
      { country: 'China', tariff: 12 },
      { country: 'Germany', tariff: 5 },
      { country: 'India', tariff: 10 },
      { country: 'Brazil', tariff: 4 },
      { country: 'European Union', tariff: 6 },
      { country: 'New Zealand', tariff: 8 },
      { country: 'Madagascar', tariff: 9 }
    ],
    'Tea Leaves': [
      { country: 'USA', tariff: 8 },
      { country: 'China', tariff: 10 },
      { country: 'Germany', tariff: 6 },
      { country: 'India', tariff: 5 },
      { country: 'Brazil', tariff: 7 },
      { country: 'European Union', tariff: 4 },
      { country: 'New Zealand', tariff: 9 },
      { country: 'Madagascar', tariff: 11 }
    ],
    'Cotton': [
      { country: 'USA', tariff: 5 },
      { country: 'China', tariff: 15 },
      { country: 'Germany', tariff: 8 },
      { country: 'India', tariff: 10 },
      { country: 'Brazil', tariff: 7 },
      { country: 'European Union', tariff: 6 },
      { country: 'New Zealand', tariff: 9 },
      { country: 'Madagascar', tariff: 12 }
    ],
    'Silk': [
      { country: 'USA', tariff: 12 },
      { country: 'China', tariff: 8 },
      { country: 'Germany', tariff: 10 },
      { country: 'India', tariff: 7 },
      { country: 'Brazil', tariff: 9 },
      { country: 'European Union', tariff: 11 },
      { country: 'New Zealand', tariff: 13 },
      { country: 'Madagascar', tariff: 15 }
    ],
    'Wool': [
      { country: 'USA', tariff: 6 },
      { country: 'China', tariff: 10 },
      { country: 'Germany', tariff: 8 },
      { country: 'India', tariff: 12 },
      { country: 'Brazil', tariff: 9 },
      { country: 'European Union', tariff: 7 },
      { country: 'New Zealand', tariff: 5 },
      { country: 'Madagascar', tariff: 11 }
    ],
    'Chemicals': [
      { country: 'USA', tariff: 4 },
      { country: 'China', tariff: 8 },
      { country: 'Germany', tariff: 3 },
      { country: 'India', tariff: 7 },
      { country: 'Brazil', tariff: 5 },
      { country: 'European Union', tariff: 2 },
      { country: 'New Zealand', tariff: 6 },
      { country: 'Madagascar', tariff: 9 }
    ]
  };

  // Product-specific raw materials mapping with percentages
  const productRawMaterials = {
    'Automotive': {
      'Cars': [
        { name: 'Steel', percentage: 60 },
        { name: 'Aluminum', percentage: 25 },
        { name: 'Rubber', percentage: 10 },
        { name: 'Plastic', percentage: 5 }
      ],
      'Tires': [
        { name: 'Rubber', percentage: 70 },
        { name: 'Steel', percentage: 30 }
      ]
    },
    'Electronics': {
      'Smartphones': [
        { name: 'Plastic', percentage: 40 },
        { name: 'Copper', percentage: 30 },
        { name: 'Aluminum', percentage: 30 }
      ],
      'Laptops': [
        { name: 'Aluminum', percentage: 50 },
        { name: 'Plastic', percentage: 30 },
        { name: 'Copper', percentage: 20 }
      ],
      'Tablets': [
        { name: 'Aluminum', percentage: 45 },
        { name: 'Plastic', percentage: 35 },
        { name: 'Copper', percentage: 20 }
      ],
      'TV Sets': [
        { name: 'Plastic', percentage: 60 },
        { name: 'Copper', percentage: 40 }
      ]
    },
    'Food & Beverages': {
      'Chocolate': [
        { name: 'Cocoa Butter', percentage: 32.79 },
        { name: 'Sugar', percentage: 38.26 },
        { name: 'Milk Powder', percentage: 27.37 },
        { name: 'Vanilla Extract', percentage: 1.09 },
        { name: 'Lecithin', percentage: 0.49 }
      ],
      'Coffee': [
        { name: 'Coffee Beans', percentage: 80 },
        { name: 'Sugar', percentage: 20 }
      ],
      'Tea': [
        { name: 'Tea Leaves', percentage: 85 },
        { name: 'Sugar', percentage: 15 }
      ],
      'Processed Foods': [
        { name: 'Sugar', percentage: 40 },
        { name: 'Milk Powder', percentage: 60 }
      ]
    },
    'Textiles': {
      'Cotton Fabric': [
        { name: 'Cotton', percentage: 100 }
      ],
      'Silk Fabric': [
        { name: 'Silk', percentage: 100 }
      ],
      'Wool Garments': [
        { name: 'Wool', percentage: 100 }
      ],
      'Synthetic Fiber': [
        { name: 'Plastic', percentage: 100 }
      ]
    },
    'Chemicals': {
      'Industrial Chemicals': [
        { name: 'Chemicals', percentage: 100 }
      ],
      'Pharmaceuticals': [
        { name: 'Chemicals', percentage: 100 }
      ],
      'Plastics': [
        { name: 'Plastic', percentage: 100 }
      ],
      'Fertilizers': [
        { name: 'Chemicals', percentage: 100 }
      ]
    },
    'Machinery': {
      'Industrial Machinery': [
        { name: 'Steel', percentage: 70 },
        { name: 'Aluminum', percentage: 30 }
      ],
      'Agricultural Equipment': [
        { name: 'Steel', percentage: 60 },
        { name: 'Rubber', percentage: 40 }
      ],
      'Construction Equipment': [
        { name: 'Steel', percentage: 80 },
        { name: 'Rubber', percentage: 20 }
      ]
    }
  };

  // Get ingredients for the selected product
  const getIngredients = () => {
    if (selectedCategory && selectedProduct && productRawMaterials[selectedCategory]?.[selectedProduct]) {
      return productRawMaterials[selectedCategory][selectedProduct];
    }
    return [];
  };

  // Get all available raw materials
  const getAllRawMaterials = () => {
    return Object.keys(rawMaterialTariffData);
  };

  // Helper function to get available raw materials for selected category and product
  const getRawMaterialOptions = () => {
    const ingredients = getIngredients();
    return ingredients.map(ing => ing.name);
  };

  // Get tariff data for current selections
  const getTariffData = () => {
    if (selectedRawMaterial && rawMaterialTariffData[selectedRawMaterial]) {
      return rawMaterialTariffData[selectedRawMaterial];
    }
    return [];
  };

  // Update selected raw material when product changes
  useEffect(() => {
    const materials = getRawMaterialOptions();
    if (materials.length > 0) {
      setSelectedRawMaterial(materials[0]);
    } else {
      setSelectedRawMaterial('');
    }
  }, [selectedProduct]);

  // Country options
  const countryOptions = [
    'United States',
    'China',
    'India',
    'Brazil',
    'European Union',
    'New Zealand',
    'Madagascar'
  ];
 
 

 
// Step 2: Dynamically generate a distinct color per label using HSL
const generateColors = (count) =>
  Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`);
 
const colors = generateColors(countryOptions.length);
 
// Step 3: Map each label to a color
const colorMap = Object.fromEntries(countryOptions.map((label, i) => [label, colors[i]]));

  // Category options
  const categoryOptions = [
    'Electronics',
    'Textiles',
    'Automotive',
    'Food & Beverages',
    'Chemicals',
    'Machinery'
  ];

  // Product options by category
  const productOptions = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'TV Sets'],
    'Textiles': ['Cotton Fabric', 'Silk Fabric', 'Wool Garments', 'Synthetic Fiber'],
    'Automotive': ['Cars', 'Tires'],
    'Food & Beverages': ['Chocolate', 'Coffee', 'Tea', 'Processed Foods'],
    'Chemicals': ['Industrial Chemicals', 'Pharmaceuticals', 'Plastics', 'Fertilizers'],
    'Machinery': ['Industrial Machinery', 'Agricultural Equipment', 'Construction Equipment']
  };

  // Initialize ingredient sources when expanded
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

  // Add country source for an ingredient
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

  // Remove a country source
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

  // Calculate weight based on ingredient percentage and source percentage
  const calculateSourceWeight = (ingredientPercentage, sourcePercentage) => {
    const baseWeight = (ingredientPercentage * totalQuantity / 100);
    const multiplier = selectedType ? parseFloat(selectedType) : 1;
    const sourceWeight = (baseWeight * (sourcePercentage / 100) * multiplier).toFixed(2);
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
    // Validate inputs
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
    const multiplier = selectedType ? parseFloat(selectedType) : 1;
    return (baseWeight * multiplier).toFixed(2);
  };

  // Update category selection handler
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedProduct(''); // Reset product when category changes
  };

  // Handle raw material selection
  const handleRawMaterialChange = (e) => {
    setSelectedRawMaterial(e.target.value);
  };

  // Add tariff constant
  const TARIFF_PERCENTAGE = 5;

  // Add this new function before the return statement
  const handleShowResults = () => {
    navigate("/results", {
      state: {
        selectedCountry,
        selectedCategory,
        selectedProduct,
        selectedQuantity: selectedType,
        ingredientSources
      }
    });
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
            {countryOptions.map((country) => (
              <option key={country} value={country} />
            ))}
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
        <>
          <div className="ingredients-container">
            <h2>Raw Materials for {selectedProduct}</h2>
            
            {/* Tariff graph section */}
            <div className="tariff-graph-container">
  <div className="graph-header" onClick={() => setIsChartExpanded(!isChartExpanded)}>
    <h3>Tariff on Raw Materials (Country Comparison)</h3>
    <span className="expand-icon">
      {isChartExpanded ? '▼' : '▶'}
    </span>
  </div>
  
  {isChartExpanded && (
    <>
      <div className="graph-controls">
        <select
          value={selectedRawMaterial}
          onChange={handleRawMaterialChange}
          className="raw-material-select"
        >
          <option value="">Select Raw Material</option>
          {getRawMaterialOptions().map(material => (
            <option key={material} value={material}>{material}</option>
          ))}
        </select>
      </div>
      
      {selectedRawMaterial && (
        <div className="graph-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={getTariffData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis label={{ value: 'Tariff Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar 
                dataKey="tariff" 
                barSize={30}
                name={`${selectedRawMaterial} Tariff`} 
                label={{ position: 'top' }}
                activeBar={{fill : "#82ca9d"}}
              >
                {getTariffData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.country] || '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )}
</div>

            <p className="config-text">Configure the ingredients quantities and specifications:</p>
            
            <div className="ingredients-list">
              {getIngredients().map(ingredient => (
                <div key={ingredient.name} className="ingredient-item">
                  <div className="ingredient-row" onClick={() => toggleIngredient(ingredient.name)} style={{ display: 'flex', alignItems: 'center', padding: '15px', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div className="ingredient-info" style={{ display: 'flex', gap: '20px' }}>
                      <div className="ingredient-name">{ingredient.name}</div>
                      <div className="ingredient-percentage">percent: {ingredient.percentage}%</div>
                      <div className="ingredient-weight">weight: {calculateIngredientWeight(ingredient.percentage)}g</div>
                    </div>
                    <div className="expand-icon">
                      {expandedIngredient === ingredient.name ? '▼' : '▶'}
                    </div>
                  </div>

                  {expandedIngredient === ingredient.name && (
                    <div className="ingredient-expanded-content" style={{ padding: '15px', borderTop: '1px solid #eee' }}>
                      <div className="ingredient-sourcing-container">
                        {/* Wrapper for individual source rows */}
                        <div className="ingredient-sources-wrapper">
                          {ingredientSources[ingredient.name]?.map((source, index) => (
                            // Individual source row - uses flexbox to put items in a line
                            <div key={index} className="ingredient-source-row">
                              {/* Country Select */}
                              <select
                                className="source-select"
                                value={source.country}
                                onChange={(e) => handleSourceCountryChange(ingredient.name, index, e.target.value)}
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
                                    onChange={(e) => handleSliderChange(ingredient.name, index, 'supplierAbsorption', parseInt(e.target.value))}
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
                                    onChange={(e) => handleSliderChange(ingredient.name, index, 'manufacturerAbsorption', parseInt(e.target.value))}
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
                                    onChange={(e) => handleSliderChange(ingredient.name, index, 'cashPaymentDelay', parseInt(e.target.value))}
                                  />
                                  <span>{source.cashPaymentDelay || 0} days</span>
                                </div>
                              </div>

                              {/* Percentage Input */}
                              <input
                                type="number"
                                value={source.percentage}
                                onChange={(e) => handleSourcePercentageChange(ingredient.name, index, e.target.value)}
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
                                  removeCountrySource(ingredient.name, index);
                                }}
                                className="remove-source-btn"
                                disabled={ingredientSources[ingredient.name]?.length <= 1}
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
                              addCountrySource(ingredient.name);
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
              <button onClick={handleShowResults} className="show-results-btn">Show Results</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebPage;