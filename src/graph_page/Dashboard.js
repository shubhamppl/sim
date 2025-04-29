import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Add logging to debug state passing
  useEffect(() => {
    console.log('Location state:', location.state);
  }, [location]);

  // Get and set default values from location state
  const [country, setCountry] = useState(location.state?.selectedCountry || 'United States');
  const [category, setCategory] = useState(location.state?.selectedCategory || 'Food & Beverages');
  const [product, setProduct] = useState(location.state?.selectedProduct || 'Snickers');
  const [quantity, setQuantity] = useState(location.state?.selectedQuantity || 1);

  // Update values when location state changes
  useEffect(() => {
    if (location.state) {
      setCountry(location.state.selectedCountry);
      setCategory(location.state.selectedCategory);
      setProduct(location.state.selectedProduct);
      setQuantity(location.state.selectedQuantity);
    }
  }, [location.state]);

  const [tariffRate, setTariffRate] = useState(30);  // Hardcoded to 30%
  const [supplierAbsorption, setSupplierAbsorption] = useState(25);
  const [manufacturerAbsorption, setManufacturerAbsorption] = useState(25);
  const [customerAbsorption, setCustomerAbsorption] = useState(25);
  const [remainingImpact, setRemainingImpact] = useState(25);

  // Add state for ingredients configuration
  const [showIngredientConfig, setShowIngredientConfig] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0); // Changed from 100 to 0
  const [ingredientSources, setIngredientSources] = useState({});

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

  const productOptions = {
    'Automotive': ['Cars', 'Spare Parts', 'Tires'],
    'Electronics': ['Smartphones', 'Laptops', 'Tablets'],
    'Textiles': ['Cotton', 'Silk', 'Wool'],
    'Food & Beverages': ['Snickers', 'Mars', 'Twix']
  };

  // Add tariff constant
  const TARIFF_PERCENTAGE = 5;

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
    const sourceWeight = (baseWeight * (sourcePercentage / 100) * (quantity || 1)).toFixed(2);
    return sourceWeight;
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
    return (baseWeight * (quantity || 1)).toFixed(2);
  };

  const handleDocumentation = () => {
    alert('Documentation coming soon!');
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleReturn = () => {
    navigate('/dashboard');
  };

  // Calculate tariff impact
  const calculateTariffImpact = () => {
    const totalCost = quantity * 100; // Assuming a fixed product value of 100 for simplicity
    const tariffAmount = totalCost * (tariffRate / 100);
    
    // Calculate absorption amounts based on percentages
    const supplierAmount = tariffAmount * (supplierAbsorption / 100);
    const manufacturerAmount = tariffAmount * (manufacturerAbsorption / 100);
    const customerAmount = tariffAmount * (customerAbsorption / 100);
    const remainingAmount = tariffAmount * (remainingImpact / 100);

    return {
      withoutTariff: totalCost,
      withTariff: totalCost + tariffAmount,
      tariffAmount,
      supplierAmount,
      manufacturerAmount,
      customerAmount,
      remainingAmount,
      effectiveRate: (tariffAmount / totalCost) * 100
    };
  };

  useEffect(() => {
    const total = supplierAbsorption + manufacturerAbsorption + customerAbsorption;
    if (total > 100) {
      const scale = 100 / total;
      setSupplierAbsorption(Math.round(supplierAbsorption * scale));
      setManufacturerAbsorption(Math.round(manufacturerAbsorption * scale));
      setCustomerAbsorption(Math.round(customerAbsorption * scale));
    } else {
      setRemainingImpact(100 - total);
    }
  }, [supplierAbsorption, manufacturerAbsorption, customerAbsorption]);

  const results = calculateTariffImpact();

  const costChartData = {
    labels: ['Without Tariff', 'With Tariff'],
    datasets: [
      {
        label: 'Base Cost',
        data: [results.withoutTariff, results.withoutTariff],
        backgroundColor: '#3b82f6'
      },
      {
        label: 'Supplier Absorption',
        data: [0, results.supplierAmount],
        backgroundColor: '#f59e0b'
      },
      {
        label: 'Manufacturer Absorption',
        data: [0, results.manufacturerAmount],
        backgroundColor: '#10b981'
      },
      {
        label: 'Customer Absorption',
        data: [0, results.customerAmount],
        backgroundColor: '#ef4444'
      },
      {
        label: 'Remaining Impact',
        data: [0, results.remainingAmount],
        backgroundColor: '#9ca3af'
      }
    ]
  };

  const chartOptions = {
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          },
          afterLabel: function(context) {
            if (results.tariffAmount === 0) return '';
            const percentage = ((context.raw / results.tariffAmount) * 100).toFixed(1);
            return `(${percentage}% of tariff)`;
          }
        }
      }
    },
    scales: { 
      x: { stacked: true },
      y: { 
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      } 
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const handleAbsorptionChange = (type, value) => {
    const numValue = Number(value);
    switch(type) {
      case 'supplier':
        setSupplierAbsorption(numValue);
        break;
      case 'manufacturer':
        setManufacturerAbsorption(numValue);
        break;
      case 'customer':
        setCustomerAbsorption(numValue);
        break;
      default:
        break;
    }
  };

  const handleBackClick = () => {
    navigate('/simulator');
  };

  return (
    <div>
      <div className="tariff-header">
        <img src="/images/mu-sigma-logo-1.png" alt="Mu Sigma" className="musigma-logo" />
        <div className="header-content">
          <button className="header-btn" onClick={handleDocumentation}>
            Documentation
          </button>
          <button className="header-btn" onClick={handleUpload}>
            Upload
          </button>
          <button className="header-btn" onClick={handleReturn}>
            Return to Dashboard
          </button>
        </div>
      </div>
      
      <div className="tariff-container">
        <aside className="tariff-sidebar">
          <div>Tariff Simulator</div>
          <p>Analyze tariff impacts on your business</p>

          <div className="tariff-form">
            <div>
              <label>Country</label>
              <input 
                type="text" 
                value={country}
                disabled
                className="tariff-input-disabled"
              />
            </div>

            <div>
              <label>Product Category</label>
              <input 
                type="text" 
                value={category}
                disabled
                className="tariff-input-disabled"
              />
            </div>

            <div>
              <label>Product</label>
              <input 
                type="text" 
                value={product}
                disabled
                className="tariff-input-disabled"
              />
            </div>

            <div>
              <label>Quantity</label>
              <input 
                type="number" 
                value={quantity}
                disabled
                className="tariff-input-disabled"
              />
            </div>

            <div className="ingredient-config-section">
              <button 
                className="ingredient-config-toggle" 
                onClick={() => setShowIngredientConfig(!showIngredientConfig)}
              >
                {showIngredientConfig ? 'Hide Ingredients' : 'Configure Ingredients'}
              </button>
              
              {showIngredientConfig && (
                <div className="ingredients-panel">
                  <p className="config-text">Configure the ingredients quantities and specifications:</p>
                  <div className="ingredients-list-sidebar">
                    {ingredients.map(ingredient => (
                      <div key={ingredient.id} className="ingredient-item-sidebar">
                        <div 
                          className="ingredient-row-sidebar" 
                          onClick={() => toggleIngredient(ingredient.id)}
                        >
                          <div className="ingredient-name-sidebar">{ingredient.name}</div>
                          <div className="ingredient-details-sidebar">
                            <span>{ingredient.percentage}%</span>
                            <span>{calculateIngredientWeight(ingredient.percentage)}g</span>
                            <span>{expandedIngredient === ingredient.id ? '▼' : '▶'}</span>
                          </div>
                        </div>

                        {expandedIngredient === ingredient.id && (
                          <div className="ingredient-expanded-sidebar">
                            {ingredientSources[ingredient.id]?.map((source, index) => (
                              <div key={index} className="source-row-sidebar">
                                <select
                                  className="source-select-sidebar"
                                  value={source.country}
                                  onChange={(e) => handleSourceCountryChange(ingredient.id, index, e.target.value)}
                                >
                                  <option value="">Country</option>
                                  {countryOptions.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                  ))}
                                </select>
                                
                                <div className="source-inputs-sidebar">
                                  <div className="source-input-group">
                                    <input
                                      type="number"
                                      value={source.percentage}
                                      onChange={(e) => handleSourcePercentageChange(ingredient.id, index, e.target.value)}
                                      min="0"
                                      max="100"
                                      className="source-percentage-input-sidebar"
                                    />
                                    <span>%</span>
                                  </div>
                                  
                                  <div className="source-weight-sidebar">
                                    {calculateSourceWeight(ingredient.percentage, source.percentage)}g
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeCountrySource(ingredient.id, index);
                                    }}
                                    className="remove-source-btn-sidebar"
                                    disabled={ingredientSources[ingredient.id]?.length <= 1}
                                  >
                                    ✕
                                  </button>
                                </div>

                                <div className="sliders-sidebar">
                                  <div className="slider-group-sidebar">
                                    <label>Supplier: {source.supplierAbsorption}%</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={source.supplierAbsorption || 0}
                                      onChange={(e) => handleSliderChange(ingredient.id, index, 'supplierAbsorption', parseInt(e.target.value))}
                                    />
                                  </div>
                                  
                                  <div className="slider-group-sidebar">
                                    <label>Manufacturer: {source.manufacturerAbsorption}%</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={source.manufacturerAbsorption || 0}
                                      onChange={(e) => handleSliderChange(ingredient.id, index, 'manufacturerAbsorption', parseInt(e.target.value))}
                                    />
                                  </div>
                                  
                                  <div className="slider-group-sidebar">
                                    <label>Payment Delay: {source.cashPaymentDelay} days</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="90"
                                      value={source.cashPaymentDelay || 0}
                                      onChange={(e) => handleSliderChange(ingredient.id, index, 'cashPaymentDelay', parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addCountrySource(ingredient.id);
                              }}
                              className="add-country-btn-sidebar"
                            >
                              Add Country
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="simulate-button">Update Simulation</button>
          </div>
        </aside>

        <main className="tariff-main">
          <section className="tariff-stats">
            <div className="tariff-card">
              <h4>Tariff Rate</h4>
              <p>{tariffRate.toFixed(1)}%</p>
            </div>
            <div className="tariff-card">
              <h4>Tariff Amount</h4>
              <p>${results.tariffAmount.toFixed(2)}</p>
            </div>
            <div className="tariff-card">
              <h4>Effective Rate</h4>
              <p>{results.effectiveRate.toFixed(1)}%</p>
            </div>
          </section>

          <section className="tariff-charts">
            <div className="chart-container">
              <h3>Tariff Impact Breakdown</h3>
              <div className="amount-labels">
                <span>${results.withTariff.toFixed(2)}</span>
                <span>${results.withoutTariff.toFixed(2)}</span>
                <span>$0</span>
              </div>
              <div className="chart-wrapper">
                <Bar data={costChartData} options={chartOptions} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;