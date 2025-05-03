import React, { useState, useEffect } from 'react';
import './Web_page.css';

// Backend API URL
const API_URL = "http://localhost:8000";

/**
 * IngredientList Component
 * 
 * This component handles the rendering and management of ingredients and their sources.
 * It displays a list of ingredients with their details and allows for adding, editing, 
 * and removing ingredient sources.
 */
const IngredientList = ({
  ingredients,
  ingredientSources,
  expandedIngredient,
  toggleIngredient,
  calculateIngredientWeight,
  calculateSourceWeight,
  getTariffRate,
  sourceCountryOptions,
  handleCountrySourceChange,
  handleSourceSliderChange,
  handlePercentageChange,
  handleRemoveCountrySource,
  handleAddCountrySource,
  handleViewGraph,
  selectedCountry,
  setIngredientSources
}) => {
  // State to track which sources are being edited
  const [editingSources, setEditingSources] = useState({});
  
  // State to track API loading and errors
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [apiData, setApiData] = useState({});

  // Fetch ingredient data from API
  const fetchSourceData = async (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    
    try {
      // Mark as loading
      setLoading(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: null }));
      
      // Get the current source
      const source = ingredientSources[ingredientName]?.[sourceIndex];
      
      if (!source || !source.country) {
        throw new Error("Country must be selected before fetching data");
      }
      
      // Make API request
      const response = await fetch(`${API_URL}/ingredient-source-details/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient_name: ingredientName,
          product_name: selectedCountry, // Using selected country as product name for now
          country: source.country,
          import_country: selectedCountry,
          cash_payment_delay: source.cashPaymentDelay || 0
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (!data.success) {
        throw new Error(data.message || "Unknown error");
      }
      
      // Store API data
      setApiData(prev => ({ ...prev, [key]: data.data }));
      
      // Update source with API data
      if (data.data) {
        updateSourceFromApi(ingredientName, sourceIndex, data.data);
      }
      
      return data.data;
      
    } catch (error) {
      console.error("Error fetching source data:", error);
      setErrors(prev => ({ ...prev, [key]: error.message }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };
  
  // Update source data from API response
  const updateSourceFromApi = (ingredientName, sourceIndex, apiData) => {
    // Copy the current sources
    const updatedSources = [...(ingredientSources[ingredientName] || [])];
    
    // Update the specific source with API data
    if (updatedSources[sourceIndex]) {
      updatedSources[sourceIndex] = {
        ...updatedSources[sourceIndex],
        basePrice: apiData.base_price_per_unit || updatedSources[sourceIndex].basePrice || 0,
        tariffPercent: apiData.tariff_percent || 0,
        contractEndDate: apiData.contract_end_date,
        supplierDetails: apiData.supplier_details || {}
      };
      
      // Update the ingredient sources
      setIngredientSources(prev => ({
        ...prev,
        [ingredientName]: updatedSources
      }));
    }
  };

  // Toggle edit mode for a specific source
  const toggleEditMode = async (ingredientName, sourceIndex, e) => {
    e.stopPropagation(); // Prevent toggling the ingredient
    
    const key = `${ingredientName}-${sourceIndex}`;
    const isCurrentlyEditing = editingSources[key];
    
    // If not currently editing, fetch data from API when starting edit mode
    if (!isCurrentlyEditing) {
      await fetchSourceData(ingredientName, sourceIndex);
    } else {
      // If saving (ending edit mode), you could add API call to save data here
      console.log("Saving changes for", ingredientName, sourceIndex);
    }
    
    // Toggle edit mode in state
    setEditingSources(prev => {
      const newState = { ...prev };
      
      if (newState[key]) {
        delete newState[key]; // Turn off edit mode
      } else {
        newState[key] = true; // Turn on edit mode
      }
      
      return newState;
    });
  };

  // Check if a source is in edit mode
  const isEditing = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return editingSources[key] === true;
  };
  
  // Check if a source is loading
  const isLoading = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return loading[key] === true;
  };
  
  // Get error for a source
  const getError = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return errors[key];
  };
  
  // Get API data for a source
  const getSourceApiData = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return apiData[key];
  };
  
  // Handle cash payment delay changes
  const handleCashPaymentDelayChange = (ingredientName, sourceIndex, value) => {
    // First update the source data
    handleSourceSliderChange(ingredientName, sourceIndex, 'cashPaymentDelay', value);
    
    // Then refetch data with new cashPaymentDelay value to update contract end date
    const source = ingredientSources[ingredientName]?.[sourceIndex];
    if (source && source.country && isEditing(ingredientName, sourceIndex)) {
      setTimeout(() => {
        fetchSourceData(ingredientName, sourceIndex);
      }, 300); // Add small delay to ensure state is updated
    }
  };
  
  return (
    <div className="ingredients-container">
      <p className="config-text">Configure the ingredients quantities and specifications (source countries auto-populated from data):</p>
      
      <div className="ingredients-list">
        {ingredients.map(ingredient => (
          <div key={ingredient.name} className="ingredient-item">
            <div className="ingredient-row" onClick={() => toggleIngredient(ingredient.name)} style={{ display: 'flex', alignItems: 'center', padding: '15px', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div className="ingredient-info" style={{ display: 'flex', gap: '20px' }}>
                <div className="ingredient-name">{ingredient.name}</div>
                <div className="ingredient-percentage">percent: {ingredient.percentage}%</div>
                <div className="ingredient-weight">Total Weight: {calculateIngredientWeight(ingredient.percentage)}kg</div>
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
                    {ingredientSources[ingredient.name]?.map((source, index) => {
                      const editing = isEditing(ingredient.name, index);
                      const loading = isLoading(ingredient.name, index);
                      const error = getError(ingredient.name, index);
                      const sourceData = getSourceApiData(ingredient.name, index);
                      
                      return (
                        // Individual source row - uses flexbox to put items in a line
                        <div key={index} className="ingredient-source-row">
                          {/* Country Select */}
                          <select
                            className="source-select"
                            value={source.country}
                            onChange={(e) => handleCountrySourceChange(ingredient.name, index, e.target.value)}
                            disabled={!editing || loading}
                          >
                            <option value="">Select Country</option>
                            {sourceCountryOptions.map(country => (
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
                                onChange={(e) => handleSourceSliderChange(ingredient.name, index, 'supplierAbsorption', parseInt(e.target.value))}
                                disabled={!editing || loading}
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
                                onChange={(e) => handleSourceSliderChange(ingredient.name, index, 'manufacturerAbsorption', parseInt(e.target.value))}
                                disabled={!editing || loading}
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
                                onChange={(e) => handleCashPaymentDelayChange(ingredient.name, index, parseInt(e.target.value))}
                                disabled={!editing || loading}
                              />
                              <span>{source.cashPaymentDelay || 0} days</span>
                            </div>
                          </div>

                          {/* Percentage Input */}
                          <input
                            type="number"
                            value={source.percentage}
                            onChange={(e) => handlePercentageChange(ingredient.name, index, e.target.value)}
                            min="0"
                            max="100"
                            placeholder="%"
                            className="source-percentage-input"
                            disabled={!editing || loading}
                          />

                          {/* Weight Display */}
                          <span className="source-weight">
                            Weight: {calculateSourceWeight(ingredient.percentage, source.percentage)}kg
                          </span>

                          {/* Tariff Display */}
                          <span className="source-tariff">
                            tariff: {source.tariffPercent || getTariffRate(source.country, selectedCountry)}%
                          </span>

                          {/* Contract End Date - Show if available */}
                          {source.contractEndDate && (
                            <span className="source-contract-date">
                              Contract End: {new Date(source.contractEndDate).toLocaleDateString()}
                            </span>
                          )}

                          {/* Edit/Save Button */}
                          <button
                            onClick={(e) => toggleEditMode(ingredient.name, index, e)}
                            className={editing ? "save-source-btn" : "edit-source-btn"}
                            disabled={loading}
                          >
                            {loading ? 'Loading...' : editing ? 'Save' : 'Edit'}
                          </button>

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the ingredient
                              handleRemoveCountrySource(ingredient.name, index);
                            }}
                            className="remove-source-btn"
                            disabled={ingredientSources[ingredient.name]?.length <= 1 || !editing || loading}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    
                    {/* Error Display */}
                    {ingredientSources[ingredient.name]?.map((_, index) => {
                      const error = getError(ingredient.name, index);
                      return error ? (
                        <div key={`error-${index}`} className="source-error">
                          Error: {error}
                        </div>
                      ) : null;
                    })}
                  </div>

                  {/* Add Country Button container */}
                  <div className="add-country-btn-container">
                    <button
                      onClick={(e) => handleViewGraph(ingredient.name, e)}
                      className="view-graph-btn"
                    >
                      View Graph
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Simulating for:', ingredient.name);
                      }}
                      className="simulate-btn"
                    >
                      Simulate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCountrySource(ingredient.name);
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
    </div>
  );
};

export default IngredientList;
