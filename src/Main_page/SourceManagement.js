/**
 * Add a new country source to an ingredient
 * @param {string} ingredientId - ID/name of the ingredient
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const addCountrySource = (ingredientId, ingredientSources, setIngredientSources) => {
  const currentSources = ingredientSources[ingredientId] || [];
  // Only add if there's room to add more (sum < 100%)
  const currentTotal = currentSources.reduce((sum, source) => sum + (parseFloat(source.percentage) || 0), 0);

  if (currentTotal < 100) {
    const newSources = [
      ...currentSources,
      { country: '', percentage: 100 - currentTotal, supplierAbsorption: 0, manufacturerAbsorption: 100, cashPaymentDelay: 0 }
    ];
    setIngredientSources(prev => ({
      ...prev,
      [ingredientId]: newSources
    }));
  } else {
    alert("Total percentage already equals 100%. Adjust existing values before adding more.");
  }
};

/**
 * Remove a country source from an ingredient
 * @param {string} ingredientId - ID/name of the ingredient
 * @param {number} index - Index of the source to remove
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const removeCountrySource = (ingredientId, index, ingredientSources, setIngredientSources) => {
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
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const handleSourceCountryChange = (ingredientId, index, country, ingredientSources, setIngredientSources) => {
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
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const handleSourcePercentageChange = (ingredientId, index, percentage, ingredientSources, setIngredientSources) => {
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
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const handleSliderChange = (ingredientId, index, field, value, ingredientSources, setIngredientSources) => {
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
 * @param {object} ingredientSources - Current ingredient sources state
 * @param {function} setIngredientSources - Function to set ingredient sources state
 */
export const initializeIngredientSources = (ingredientId, ingredientSources, setIngredientSources) => {
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
 * Calculate weight based on ingredient percentage and source percentage
 * @param {number} ingredientPercentage - Percentage of ingredient in the product
 * @param {number} sourcePercentage - Percentage of source in the ingredient
 * @param {number} totalQuantity - Total quantity of the product
 * @param {number|string} multiplier - Quantity multiplier (units)
 * @returns {string} - Calculated weight with 2 decimal places (in grams)
 */
export const calculateSourceWeight = (ingredientPercentage, sourcePercentage, totalQuantity, multiplier) => {
  const baseWeight = (ingredientPercentage * totalQuantity / 100);
  const actualMultiplier = multiplier ? parseFloat(multiplier) : 1;
  return (baseWeight * (sourcePercentage / 100) * actualMultiplier).toFixed(2);
};
