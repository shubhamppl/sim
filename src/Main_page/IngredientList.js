import React, { useState, useEffect } from 'react';
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
  selectedCountry,
  dbName,
  storeName,
  fetchCountryBasePrice,  // Add this prop
  setIngredientSources   // Add this prop
}) => {
  // State to track which sources are being edited
  const [editingSources, setEditingSources] = useState({});
  // New state for filtered country options
  const [filteredCountryOptions, setFilteredCountryOptions] = useState({});
  // New state to store tariffs by ingredient and country
  const [countryTariffRates, setCountryTariffRates] = useState({});

  /**
   * Add a new country source to an ingredient
   * @param {string} ingredientId - ID/name of the ingredient
   * @returns {object|null} - The newly added source or null if not added
   */
  const addCountrySource = (ingredientId) => {
    const currentSources = ingredientSources[ingredientId] || [];
    // Only add if there's room to add more (sum < 100%)
    const currentTotal = currentSources.reduce((sum, source) => sum + (parseFloat(source.percentage) || 0), 0);

    if (currentTotal < 100) {
      const newSource = { 
        country: '', 
        percentage: 100 - currentTotal, 
        supplierAbsorption: 0, 
        manufacturerAbsorption: 100, 
        cashPaymentDelay: 0,
        basePrice: 0 // Add basePrice field
      };
      
      const newSources = [...currentSources, newSource];
      
      setIngredientSources(prev => ({
        ...prev,
        [ingredientId]: newSources
      }));
      
      return newSource;
    } else {
      alert("Total percentage already equals 100%. Adjust existing values before adding more.");
      return null;
    }
  };

  /**
   * Remove a country source from an ingredient
   * @param {string} ingredientId - ID/name of the ingredient
   * @param {number} index - Index of the source to remove
   */
  const removeCountrySource = (ingredientId, index) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources.splice(index, 1);

    // If removing the last source, add one empty source
    if (newSources.length === 0) {
      newSources.push({ country: '', percentage: 100, supplierAbsorption: 0, manufacturerAbsorption: 100, cashPaymentDelay: 0 });
    }

    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  /**
   * Handle country change for a source
   * @param {string} ingredientId - ID/name of the ingredient
   * @param {number} index - Index of the source to update
   * @param {string} country - New country value
   */
  const localHandleSourceCountryChange = (ingredientId, index, country) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index].country = country;
    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  /**
   * Handle percentage change for a source
   * @param {string} ingredientId - ID/name of the ingredient
   * @param {number} index - Index of the source to update
   * @param {number} percentage - New percentage value
   */
  const localHandleSourcePercentageChange = (ingredientId, index, percentage) => {
    const value = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index].percentage = value;

    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  /**
   * Handle slider changes for a source
   * @param {string} ingredientId - ID/name of the ingredient
   * @param {number} index - Index of the source to update
   * @param {string} field - Field to update (e.g., 'supplierAbsorption')
   * @param {number} value - New value for the field
   */
  const localHandleSliderChange = (ingredientId, index, field, value) => {
    const newSources = [...ingredientSources[ingredientId]];
    
    // For supplier and manufacturer absorption, maintain sum = 100%
    if (field === 'supplierAbsorption') {
      newSources[index][field] = value;
      newSources[index]['manufacturerAbsorption'] = 100 - value;
    } 
    else if (field === 'manufacturerAbsorption') {
      newSources[index][field] = value;
      newSources[index]['supplierAbsorption'] = 100 - value;
    }
    // For other sliders like cashPaymentDelay
    else {
      newSources[index][field] = value;
    }
    
    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  };

  /**
   * Initialize sources for an ingredient if not already initialized
   * @param {string} ingredientId - ID/name of the ingredient
   */
  const initializeIngredientSources = (ingredientId) => {
    if (!ingredientSources[ingredientId]) {
      setIngredientSources(prev => ({
        ...prev,
        [ingredientId]: [{ 
          country: '', 
          percentage: 100,
          supplierAbsorption: 0,
          manufacturerAbsorption: 100,
          cashPaymentDelay: 0
        }]
      }));
    }
  };

  /**
   * Load and display updated supply chain data filtered by country and product
   * @param {string} selectedCountry - Currently selected country
   * @param {string} selectedProduct - Currently selected product
   * @param {function} setModalData - Function to set modal data
   * @param {function} setIsTableModalOpen - Function to open modal
   */
  const loadUpdatedSupplyTable = async (
    selectedCountry,
    selectedProduct,
    setModalData,
    setIsTableModalOpen
  ) => {
    if (!selectedCountry || !selectedProduct) {
      alert('Please select a country and product first.');
      return;
    }
    
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const supplyFiles = files.filter(file => file.fileType === 'supplyChain');
          
          if (supplyFiles.length > 0) {
            const latestFile = supplyFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            // Get column indices
            const importCountryIndex = latestFile.headers.indexOf('Import_country');
            const productSubCategoryIndex = latestFile.headers.indexOf('Product_Sub_Category');
            
            if (importCountryIndex !== -1 && productSubCategoryIndex !== -1) {
              // Filter rows based on selection
              const filteredRows = latestFile.rows.filter(row => 
                row[importCountryIndex] === selectedCountry && 
                row[productSubCategoryIndex] === selectedProduct
              );
              
              setModalData({
                headers: latestFile.headers,
                rows: filteredRows,
                title: 'Updated Supply Chain Data for ' + selectedProduct + ' in ' + selectedCountry
              });
              setIsTableModalOpen(true);
            } else {
              alert('Could not find required columns in the supply chain data.');
            }
          } else {
            alert('No supply chain data available. Please upload a file first.');
          }
        };
      };
    } catch (error) {
      console.error('Error loading updated supply data:', error);
      alert('Error loading data. Please try again.');
    }
  };

  // Fetch filtered source countries from supply chain data
  const fetchFilteredCountries = async (ingredientName) => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const supplyFiles = files.filter(file => file.fileType === 'supplyChain');
          
          if (supplyFiles.length > 0) {
            const latestFile = supplyFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            // Get column indices
            const rawMaterialIndex = latestFile.headers.indexOf('Raw_Material_Name');
            const exportCountryIndex = latestFile.headers.indexOf('Export_Country');
            const importCountryIndex = latestFile.headers.indexOf('Import_country');
            const contractDateIndex = latestFile.headers.indexOf('contract_end_date');
            const tariffIndex = latestFile.headers.indexOf('Tariffs');
            
            if (rawMaterialIndex !== -1 && exportCountryIndex !== -1 && importCountryIndex !== -1 && 
                contractDateIndex !== -1 && tariffIndex !== -1) {
              // Filter rows based on ingredient name, selected country, and contract month
              const filteredRows = latestFile.rows.filter(row => 
                row[rawMaterialIndex] === ingredientName && 
                row[importCountryIndex] === selectedCountry &&
                new Date(row[contractDateIndex]).getMonth() + 1 === 5
              );
              
              // Extract export countries with their tariff rates
              const countriesWithTariffs = filteredRows.map(row => ({
                country: row[exportCountryIndex],
                tariff: parseFloat(row[tariffIndex]) || 0
              }));
              
              // Store tariffs by country for this ingredient
              const tariffRates = {};
              filteredRows.forEach(row => {
                const country = row[exportCountryIndex];
                const tariff = parseFloat(row[tariffIndex]) || 0;
                tariffRates[country] = tariff;
              });
              
              setCountryTariffRates(prev => ({
                ...prev,
                [ingredientName]: tariffRates
              }));
              
              // Sort by tariff rate (lowest first)
              countriesWithTariffs.sort((a, b) => a.tariff - b.tariff);
              
              setFilteredCountryOptions(prev => ({
                ...prev,
                [ingredientName]: countriesWithTariffs
              }));
            }
          }
        };
      };
    } catch (error) {
      console.error('Error fetching filtered countries:', error);
    }
  };

  // Handle country selection with tariff update
  const handleSourceCountrySelection = (ingredientId, index, country) => {
    // First update the country in the source
    localHandleSourceCountryChange(ingredientId, index, country);
    
    // Then update the tariff rate if we have it from month 5 contracts
    if (country && countryTariffRates[ingredientId] && countryTariffRates[ingredientId][country] !== undefined) {
      // Update the source with the tariff rate from month 5
      const tariffRate = countryTariffRates[ingredientId][country];
      
      // We need to update the ingredient source with this tariff using the prop function
      const updatedSource = { ...ingredientSources[ingredientId][index], tariffRate };
      const updatedSources = [...ingredientSources[ingredientId]];
      updatedSources[index] = updatedSource;
      
      setIngredientSources(prev => ({
        ...prev,
        [ingredientId]: updatedSources
      }));
    }
    
    // Fetch base price when country changes using the prop function
    if (country) {
      fetchCountryBasePrice(ingredientId, country);
    }
  };

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
        // Start editing - but DON'T reset values
        newState[key] = true;
        
        // Fetch filtered countries for this ingredient
        fetchFilteredCountries(ingredientName);
      }
      
      return newState;
    });
  };

  // Check if a source is in edit mode
  const isEditing = (ingredientName, sourceIndex) => {
    const key = `${ingredientName}-${sourceIndex}`;
    return editingSources[key] === true;
  };

  // Get tariff rate from ingredient source or fall back to general getTariffRate function
  const getSourceTariffRate = (source, ingredientName, selectedCountry) => {
    // If the source has a specific tariff rate (from month 5 contracts), use that
    if (source.tariffRate !== undefined) {
      return source.tariffRate;
    }
    
    // Check if we have tariff rates for this ingredient and country
    if (countryTariffRates[ingredientName] && 
        source.country && 
        countryTariffRates[ingredientName][source.country] !== undefined) {
      return countryTariffRates[ingredientName][source.country];
    }
    
    // Fall back to the general tariff rate lookup
    return getTariffRate(source.country, selectedCountry);
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
                      const countryOptionsToUse = editing && filteredCountryOptions[ingredient.name] 
                        ? filteredCountryOptions[ingredient.name] 
                        : sourceCountryOptions.map(country => ({ country }));
                        
                      return (
                        // Individual source row - uses flexbox to put items in a line
                        <div key={index} className="ingredient-source-row">
                          {/* Country Select - Different display for edit vs view mode */}
                          {editing ? (
                            <select
                              className="source-select"
                              value={source.country}
                              onChange={(e) => handleSourceCountrySelection(ingredient.name, index, e.target.value)}
                            >
                              <option value="">Select Country</option>
                              {countryOptionsToUse.map(option => (
                                <option key={option.country} value={option.country}>
                                  {option.country}{option.tariff !== undefined ? ` (${option.tariff}%)` : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="source-country-display">
                              {source.country || "No country selected"}
                            </div>
                          )}

                          {/* Show guidance text when in edit mode */}
                          {editing && filteredCountryOptions[ingredient.name]?.length > 0 && (
                            <div className="country-guidance">
                              Showing {filteredCountryOptions[ingredient.name].length} countries from month 5 contracts
                            </div>
                          )}

                          <div className="slider-controls">
                            <div className="slider-group">
                              <label>Supplier Absorption (%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={source.supplierAbsorption || 0}
                                onChange={(e) => localHandleSliderChange(ingredient.name, index, 'supplierAbsorption', parseInt(e.target.value))}
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
                                onChange={(e) => localHandleSliderChange(ingredient.name, index, 'manufacturerAbsorption', parseInt(e.target.value))}
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
                                onChange={(e) => localHandleSliderChange(ingredient.name, index, 'cashPaymentDelay', parseInt(e.target.value))}
                              />
                              <span>{source.cashPaymentDelay || 0} days</span>
                            </div>
                          </div>

                          {/* Volume Input - Changed from Percentage Input */}
                          <div className="volume-input-container">
                            <label htmlFor={`volume-${ingredient.name}-${index}`}>Volume:</label>
                            {editing ? (
                              <input
                                id={`volume-${ingredient.name}-${index}`}
                                type="number"
                                value={source.percentage}
                                onChange={(e) => localHandleSourcePercentageChange(ingredient.name, index, e.target.value)}
                                min="0"
                                max="100"
                                placeholder="Volume"
                                className="source-percentage-input"
                              />
                            ) : (
                              <span className="volume-display">{source.percentage}%</span>
                            )}
                          </div>

                          {/* Weight Display */}
                          <span className="source-weight">
                            Weight: {calculateSourceWeight(ingredient.percentage, source.percentage)}kg
                          </span>
 
                          {/* Tariff Display */}
                          <span className="source-tariff">
                            Tariff: {getSourceTariffRate(source, ingredient.name, selectedCountry)}%
                          </span>

                          {/* Edit/Save Button */}
                          <button
                            onClick={(e) => toggleEditMode(ingredient.name, index, e)}
                            className={editing ? "save-source-btn" : "edit-source-btn"}
                          >
                            {editing ? 'Save' : 'Edit'}
                          </button>

                          {/* Remove Button - only enabled in edit mode */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggling the ingredient
                              removeCountrySource(ingredient.name, index);
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
    </div>
  );
};

export default IngredientList;
