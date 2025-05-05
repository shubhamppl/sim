import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TariffChart from './TariffChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import TariffSidebar from './TariffSidebar';
// Import IngredientList from Main_page
import IngredientList from '../Main_page/IngredientList';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Location state:', location.state);
  }, [location]);

  const [country, setCountry] = useState(location.state?.selectedCountry || 'United States');
  const [category, setCategory] = useState(location.state?.selectedCategory || 'Food & Beverages');
  const [product, setProduct] = useState(location.state?.selectedProduct || 'Snickers');
  const [quantity, setQuantity] = useState(location.state?.selectedQuantity || 1);

  // Get ingredients from passed data instead of hardcoding
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (location.state) {
      setCountry(location.state.selectedCountry);
      setCategory(location.state.selectedCategory);
      setProduct(location.state.selectedProduct);
      setQuantity(location.state.selectedQuantity);
      
      console.log("Ingredient sources from state:", location.state.ingredientSources);
      console.log("Raw ingredients from state:", location.state.ingredients);
      
      // Extract ingredients directly from ingredientSources
      if (location.state.ingredientSources) {
        const extractedIngredients = [];
        Object.keys(location.state.ingredientSources).forEach((name, index) => {
          // Find percentage from ingredients array if available
          let ingredientPercentage = 20; // Default fallback percentage
          
          if (location.state.ingredients && Array.isArray(location.state.ingredients)) {
            const foundIngredient = location.state.ingredients.find(ing => ing.name === name);
            if (foundIngredient) {
              ingredientPercentage = foundIngredient.percentage || ingredientPercentage;
            }
          }
          
          extractedIngredients.push({
            id: index + 1,
            name: name,
            percentage: ingredientPercentage,
            details: ''
          });
        });
        
        console.log("Extracted ingredients:", extractedIngredients);
        setIngredients(extractedIngredients);
      }
    }
  }, [location.state]);

  const [tariffRate, setTariffRate] = useState(30);
  const [supplierAbsorption, setSupplierAbsorption] = useState(25);
  const [manufacturerAbsorption, setManufacturerAbsorption] = useState(25);
  const [customerAbsorption, setCustomerAbsorption] = useState(25);
  const [remainingImpact, setRemainingImpact] = useState(25);

  const [showIngredientConfig, setShowIngredientConfig] = useState(false);
  const [expandedIngredient, setExpandedIngredient] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(100);
  const [ingredientSources, setIngredientSources] = useState(
    location.state?.ingredientSources || {}
  );

  useEffect(() => {
    if (location.state?.ingredientSources) {
      setIngredientSources(location.state.ingredientSources);
    }
  }, [location.state]);

  const countryOptions = [
    'United States', 'China', 'India', 'Brazil', 'European Union', 'New Zealand', 'Madagascar'
  ];

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

  const addCountrySource = (ingredientId) => {
    const currentSources = ingredientSources[ingredientId] || [];
    const currentTotal = currentSources.reduce((sum, source) => sum + (parseFloat(source.percentage) || 0), 0);

    if (currentTotal < 100) {
      const newSources = [...currentSources, { country: '', percentage: 100 - currentTotal, supplierAbsorption: 0, manufacturerAbsorption: 0, cashPaymentDelay: 0 }];
      setIngredientSources(prev => ({ ...prev, [ingredientId]: newSources }));
    } else {
      alert("Total percentage already equals 100%. Adjust existing values before adding more.");
    }
  };

  const removeCountrySource = (ingredientId, index) => {
    const newSources = [...ingredientSources[ingredientId]];
    newSources.splice(index, 1);
    if (newSources.length === 0) {
      newSources.push({ country: '', percentage: 100, supplierAbsorption: 0, manufacturerAbsorption: 0, cashPaymentDelay: 0 });
    }
    setIngredientSources(prev => ({ ...prev, [ingredientId]: newSources }));
  };

  const handleSourceCountryChange = (ingredientId, index, country) => {
    setIngredientSources(prev => {
      const updatedSources = [...(prev[ingredientId] || [])];
      updatedSources[index] = {
        ...updatedSources[index],
        country: country,
        percentage: updatedSources[index?.percentage || 100],
        supplierAbsorption: updatedSources[index]?.supplierAbsorption || 0,
        manufacturerAbsorption: updatedSources[index]?.manufacturerAbsorption || 0,
        cashPaymentDelay: updatedSources[index]?.cashPaymentDelay || 0
      };
      return {
        ...prev,
        [ingredientId]: updatedSources
      };
    });
  };

  const handleSourcePercentageChange = (ingredientId, index, percentage) => {
    const value = Math.min(100, Math.max(0, parseFloat(percentage) || 0));
    const newSources = [...ingredientSources[ingredientId]];
    newSources[index].percentage = value;
    setIngredientSources(prev => ({ ...prev, [ingredientId]: newSources }));
  };

  const handleSliderChange = (ingredientId, index, field, value) => {
    setIngredientSources(prev => {
      const updatedSources = [...(prev[ingredientId] || [])];
      updatedSources[index] = {
        ...updatedSources[index],
        [field]: parseInt(value, 10)
      };
      return {
        ...prev,
        [ingredientId]: updatedSources
      };
    });
  };

  useEffect(() => {
    if (expandedIngredient) {
      const sources = ingredientSources[expandedIngredient] || [];
      sources.forEach((source, index) => {
        if (!source.country) {
          setIngredientSources(prev => {
            const updatedSources = [...prev[expandedIngredient]];
            updatedSources[index] = {
              ...source,
              percentage: source.percentage || 100,
              supplierAbsorption: source.supplierAbsorption || 0,
              manufacturerAbsorption: source.manufacturerAbsorption || 0,
              cashPaymentDelay: source.cashPaymentDelay || 0
            };
            return {
              ...prev,
              [expandedIngredient]: updatedSources
            };
          });
        }
      });
    }
  }, [expandedIngredient, ingredientSources]);

  const calculateSourceWeight = (ingredientPercentage, sourcePercentage) => {
    const baseWeight = (ingredientPercentage * totalQuantity / 100);
    const sourceWeight = (baseWeight * (sourcePercentage / 100) * (quantity || 1)).toFixed(2);
    return sourceWeight;
  };

  // Modify toggleIngredient for better debugging
  const toggleIngredient = (id) => {
    console.log("Toggling ingredient ID:", id);
    const ingredientItem = ingredients.find(ing => ing.id === id);
    console.log("Found ingredient:", ingredientItem);
    
    if (expandedIngredient === id) {
      setExpandedIngredient(null);
    } else {
      setExpandedIngredient(id);
      if (ingredientItem) {
        console.log("Checking sources for:", ingredientItem.name);
        console.log("Available sources:", ingredientSources[ingredientItem.name]);
        
        if (!ingredientSources[ingredientItem.name]) {
          console.log("Initializing sources for:", ingredientItem.name);
          initializeIngredientSources(ingredientItem.name);
        }
      }
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

  const calculateTariffImpact = () => {
    // Calculate tariff impact based on actual ingredient data from passed sources
    let totalCost = 0;
    let totalTariff = 0;
    
    // Loop through all ingredients and their sources to calculate totals
    Object.entries(ingredientSources).forEach(([ingredientName, sources]) => {
      const ingredient = ingredients.find(ing => ing.name === ingredientName);
      if (ingredient) {
        sources.forEach(source => {
          if (source.country && source.percentage) {
            const ingredientWeight = calculateIngredientWeight(ingredient.percentage);
            const sourceWeight = (ingredientWeight * source.percentage / 100);
            const sourceCost = sourceWeight * (source.basePrice || 10); // Use basePrice or default
            const sourceTariff = sourceCost * (tariffRate / 100);
            
            totalCost += sourceCost;
            totalTariff += sourceTariff;
          }
        });
      }
    });
    
    // If no data, use default calculation
    if (totalCost === 0) {
      totalCost = quantity * 100;
      totalTariff = totalCost * (tariffRate / 100);
    }
    
    // Calculate absorption amounts
    const supplierAmount = totalTariff * (supplierAbsorption / 100)
    const manufacturerAmount = totalTariff * (manufacturerAbsorption / 100);
    const customerAmount = totalTariff * (customerAbsorption / 100);
    const remainingAmount = totalTariff * (remainingImpact / 100);

    return {
      withoutTariff: totalCost,
      withTariff: totalCost + totalTariff,
      tariffAmount: totalTariff,
      supplierAmount,
      manufacturerAmount,
      customerAmount,
      remainingAmount,
      effectiveRate: (totalTariff / totalCost) * 100
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

  // Add this function to calculate cash flow data
  const calculateCashFlow = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentTariff = results.tariffAmount;
    const futureTariff = currentTariff * 1.2; // Assuming 20% increase in future

    return months.map((month, index) => ({
      month,
      immediatePayment: -currentTariff,
      delayedPayment: index < 2 ? 0 : -futureTariff, // Showing impact after 2 months
    }));
  };

  // Add handlers for table buttons
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ headers: [], rows: [], title: '' });

  const handleShowUpdatedTable = () => {
    // Use the imported function with the necessary parameters
    IngredientList(
      country,
      product,
      "TariffDB",
      "files",
      setModalData,
      setIsTableModalOpen
    );
  };

  const handleShowProductTable = () => {
    alert('View Product Table functionality will be implemented here');
  };

  const handleShowSupplyTable = () => {
    alert('View Supply Table functionality will be implemented here');
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
        <TariffSidebar 
          country={country}
          category={category}
          product={product}
          quantity={quantity}
          showIngredientConfig={showIngredientConfig}
          setShowIngredientConfig={setShowIngredientConfig}
          ingredients={ingredients}
          handleBackClick={handleBackClick}
        />

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
          
          <TariffChart 
            results={results}
            supplierAbsorption={supplierAbsorption}
            manufacturerAbsorption={manufacturerAbsorption}
            customerAbsorption={customerAbsorption}
            remainingImpact={remainingImpact}
          />

          <section className="cash-flow-chart">
            <h3>Cash Flow Impact Analysis</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={calculateCashFlow()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="immediatePayment"
                    stroke="#8884d8"
                    name="Immediate Payment"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="delayedPayment"
                    stroke="#82ca9d"
                    name="Delayed Payment"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>

      {/* Add table modal */}
      {isTableModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalData.title}</h2>
              <button className="close-modal" onClick={() => setIsTableModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {modalData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
