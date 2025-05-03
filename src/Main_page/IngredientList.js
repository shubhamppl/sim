import React, { useState } from 'react';
import './Web_page.css';

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
  selectedCountry
}) => {
  // State to track which sources are being edited
  const [editingSources, setEditingSources] = useState({});

  // Toggle edit mode for a specific source
  const toggleEditMode = (ingredientName, sourceIndex, e) => {
    e.stopPropagation(); // Prevent toggling the ingredient
    
    setEditingSources(prev => {
      const key = `${ingredientName}-${sourceIndex}`;
      const newState = { ...prev };
      
      // If already editing, remove from edit state (save)
      if (newState[key]) {
        delete newState[key];
      } else {
        // Start editing
        newState[key] = true;
      }
      
      return newState;
    });
  };

  // Check if a source is in edit mode
  const isEditing = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return editingSources[key] === true;
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
                      return (
                        // Individual source row - uses flexbox to put items in a line
                        <div key={index} className="ingredient-source-row">
                          {/* Country Select */}
                          <select
                            className="source-select"
                            value={source.country}
                            onChange={(e) => handleCountrySourceChange(ingredient.name, index, e.target.value)}
                            disabled={!editing}
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
                                disabled={!editing}
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
                                disabled={!editing}
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
                                onChange={(e) => handleSourceSliderChange(ingredient.name, index, 'cashPaymentDelay', parseInt(e.target.value))}
                                disabled={!editing}
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
                            disabled={!editing}
                          />

                          {/* Weight Display */}
                          <span className="source-weight">
                            Weight: {calculateSourceWeight(ingredient.percentage, source.percentage)}kg
                          </span>

                          {/* Tariff Display */}
                          <span className="source-tariff">
                            tariff: {getTariffRate(source.country, selectedCountry)}%
                          </span>

                          {/* Edit/Save Button */}
                          <button
                            onClick={(e) => toggleEditMode(ingredient.name, index, e)}
                            className={editing ? "save-source-btn" : "edit-source-btn"}
                          >
                            {editing ? 'Save' : 'Edit'}
                          </button>

                          {/* Remove Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the ingredient
                              handleRemoveCountrySource(ingredient.name, index);
                            }}
                            className="remove-source-btn"
                            disabled={ingredientSources[ingredient.name]?.length <= 1 || !editing}
                          >
                            Remove
                          </button>
                        </div>
                      );
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
