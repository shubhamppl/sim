import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Web_page.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const dbName = "TariffDB";
const storeName = "files";

const WebPage = () => {
  // Add new state for dynamic countries and categories
  const [countryOptions, setCountryOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]); 
  const [sourceCountryOptions, setSourceCountryOptions] = useState([]); // Add new state for source countries
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
  // Add state to store tariff data
  const [tariffData, setTariffData] = useState({});

  // Raw material states for chart
  const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  // Replace hardcoded tariff data with dynamic state
  const [rawMaterialTariffData, setRawMaterialTariffData] = useState({});
  
  // Replace static product raw materials mapping
  const [productRawMaterials, setProductRawMaterials] = useState({});

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
    return Object.keys(rawMaterialTariffData);
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

  // Add function to fetch unique countries
  const loadCountryOptions = async () => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const productFiles = files.filter(file => file.fileType === 'product');
          if (productFiles.length > 0) {
            // Get the latest product file
            const latestFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            // Get unique To_Country values from the rows
            const toCountryIndex = latestFile.headers.indexOf('To_Country');
            if (toCountryIndex !== -1) {
              const uniqueCountries = [...new Set(latestFile.rows.map(row => row[toCountryIndex]))].filter(Boolean);
              setCountryOptions(uniqueCountries.sort());
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  // Modify loadCategoryOptions to filter by selected country
  const loadCategoryOptions = async () => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const productFiles = files.filter(file => file.fileType === 'product');
          if (productFiles.length > 0) {
            const latestFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            const categoryIndex = latestFile.headers.indexOf('Product_Category');
            const countryIndex = latestFile.headers.indexOf('To_Country');
            
            if (categoryIndex !== -1 && countryIndex !== -1) {
              // Filter categories based on selected country
              const uniqueCategories = [...new Set(
                latestFile.rows
                  .filter(row => !selectedCountry || row[countryIndex] === selectedCountry)
                  .map(row => row[categoryIndex])
              )].filter(Boolean);
              setCategoryOptions(uniqueCategories.sort());
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Add useEffect to load countries when component mounts
  useEffect(() => {
    loadCountryOptions();
    loadCategoryOptions();
    loadSourceCountryOptions(); // Add this line to load source countries
  }, []);

  // Update useEffect to reload categories when country changes
  useEffect(() => {
    loadCategoryOptions();
  }, [selectedCountry]);

  // Update country selection handling to use the dynamic list
  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedCategory('');
    setSelectedProduct('');
  };

  // Step 2: Dynamically generate a distinct color per label using HSL
const generateColors = (count) =>
  Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / count}, 70%, 60%)`);
 
const colors = generateColors(countryOptions.length);
 
// Step 3: Map each label to a color
const colorMap = Object.fromEntries(countryOptions.map((label, i) => [label, colors[i]]));

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

  // Add function to load tariff data from supply chain file
  const loadTariffData = async () => {
    if (!selectedCountry || !selectedProduct) return;
    
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
            
            // Get relevant column indices
            const rawMaterialIndex = latestFile.headers.indexOf('Raw_Material_Name');
            const exportCountryIndex = latestFile.headers.indexOf('Export_Country');
            const importCountryIndex = latestFile.headers.indexOf('Import_country');
            const tariffIndex = latestFile.headers.indexOf('Tariffs');
            const contractDateIndex = latestFile.headers.indexOf('contract_end_date');
            const productSubCategoryIndex = latestFile.headers.indexOf('Product_Sub_Category');
            
            if (rawMaterialIndex !== -1 && exportCountryIndex !== -1 && importCountryIndex !== -1 && 
                tariffIndex !== -1 && contractDateIndex !== -1 && productSubCategoryIndex !== -1) {
              
              // Filter rows by selected country and product
              const filteredRows = latestFile.rows.filter(row => 
                row[importCountryIndex] === selectedCountry && 
                row[productSubCategoryIndex] === selectedProduct
              );
              
              // Filter for month 5 (May) in contract_end_date and group by raw material
              const tariffData = {};
              const rawMaterials = {};
              
              filteredRows.forEach(row => {
                const date = new Date(row[contractDateIndex]);
                const month = date.getMonth() + 1; // JavaScript months are 0-indexed
                
                // Check if month is 5 (May)
                if (month === 5) {
                  const rawMaterialName = row[rawMaterialIndex];
                  const exportCountry = row[exportCountryIndex];
                  const tariff = parseFloat(row[tariffIndex]);
                  
                  // Add to tariff data
                  if (!tariffData[rawMaterialName]) {
                    tariffData[rawMaterialName] = [];
                  }
                  
                  tariffData[rawMaterialName].push({
                    country: exportCountry,
                    tariff: tariff
                  });
                  
                  // Build product raw materials data
                  if (!rawMaterials[rawMaterialName]) {
                    // Extract percentage if available or default to equal distribution
                    const basePrice = parseFloat(row[latestFile.headers.indexOf('Base_Price_Per_Unit')]) || 0;
                    rawMaterials[rawMaterialName] = { name: rawMaterialName, percentage: 0, basePrice: basePrice };
                  }
                }
              });
              
              // Calculate percentages for materials if not explicitly given
              const materialCount = Object.keys(rawMaterials).length;
              if (materialCount > 0) {
                const equalPercentage = 100 / materialCount;
                Object.keys(rawMaterials).forEach(key => {
                  rawMaterials[key].percentage = equalPercentage;
                });
                
                // Create product raw materials structure
                const newProductRawMaterials = {
                  [selectedCategory]: {
                    [selectedProduct]: Object.values(rawMaterials)
                  }
                };
                
                setProductRawMaterials(newProductRawMaterials);
              }
              
              setRawMaterialTariffData(tariffData);
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading tariff data:', error);
    }
  };

  // Add effect to load tariff data when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      loadTariffData();
    }
  }, [isSubmitted, selectedCountry, selectedProduct]);

  // Update handleSubmit to reset the current tariff data
  const handleSubmit = () => {
    // Validate inputs
    if (selectedCountry && selectedType && selectedCategory && selectedProduct) {
      setRawMaterialTariffData({}); // Reset tariff data before loading new data
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

  // Get tariff rate for country pair
  const getTariffRate = (fromCountry, toCountry) => {
    const key = `${fromCountry}-${toCountry}`;
    const rate = tariffData[key];
    console.log(`Getting tariff for ${key}, found: ${rate}`);
    return rate !== undefined ? rate : 'N/A';
  };

  // Add effect to load tariff data when component mounts
  useEffect(() => {
    loadTariffData();
  }, []);

  // Add effect to reload tariff data when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadTariffData();
    }
  }, [selectedCountry]);

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

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ headers: [], rows: [], title: '' });

  const loadTableData = async (fileType) => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const latestFile = files
            .filter(file => file.fileType === fileType)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
          
          if (latestFile) {
            setModalData({
              headers: latestFile.headers,
              rows: latestFile.rows,
              title: fileType === 'supplyChain' ? 'Supply Chain Data' : 'Product Data'
            });
            setIsTableModalOpen(true);
          } else {
            alert('No data available. Please upload a file first.');
          }
        };
      };
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    }
  };

  // Add function to load products based on selected category and country
  const loadProductOptions = async () => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const productFiles = files.filter(file => file.fileType === 'product');
          if (productFiles.length > 0) {
            const latestFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            const productIndex = latestFile.headers.indexOf('Product_Sub_Category');
            const categoryIndex = latestFile.headers.indexOf('Product_Category');
            const countryIndex = latestFile.headers.indexOf('To_Country');
            
            if (productIndex !== -1 && categoryIndex !== -1 && countryIndex !== -1) {
              const uniqueProducts = [...new Set(
                latestFile.rows
                  .filter(row => 
                    (!selectedCountry || row[countryIndex] === selectedCountry) &&
                    (!selectedCategory || row[categoryIndex] === selectedCategory)
                  )
                  .map(row => row[productIndex])
              )].filter(Boolean);
              setProductOptions(uniqueProducts.sort());
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Add useEffect to reload products when category or country changes
  useEffect(() => {
    loadProductOptions();
  }, [selectedCategory, selectedCountry]);

  // Add function to load source countries
  const loadSourceCountryOptions = async () => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const productFiles = files.filter(file => file.fileType === 'product');
          if (productFiles.length > 0) {
            const latestFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            const fromCountryIndex = latestFile.headers.indexOf('From_Country');
            if (fromCountryIndex !== -1) {
              const uniqueSourceCountries = [...new Set(latestFile.rows.map(row => row[fromCountryIndex]))].filter(Boolean);
              setSourceCountryOptions(uniqueSourceCountries.sort());
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading source countries:', error);
    }
  };

  // Load tariff data from product table
  const loadProductTariffData = async () => {
    try {
      const db = await indexedDB.open(dbName, 1);
      db.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const files = request.result;
          const productFiles = files.filter(file => file.fileType === 'product');
          if (productFiles.length > 0) {
            const latestFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            const fromCountryIndex = latestFile.headers.indexOf('From_Country');
            const toCountryIndex = latestFile.headers.indexOf('To_Country');
            const tariffPercentIndex = latestFile.headers.indexOf('Current_Tariff_Percent');
            
            if (fromCountryIndex !== -1 && toCountryIndex !== -1 && tariffPercentIndex !== -1) {
              // Create map of country pair to tariff
              const tariffMap = {};
              latestFile.rows.forEach(row => {
                const fromCountry = row[fromCountryIndex];
                const toCountry = row[toCountryIndex];
                const tariffPercent = parseFloat(row[tariffPercentIndex]) || 0;
                
                if (fromCountry && toCountry) {
                  const key = `${fromCountry}-${toCountry}`;
                  tariffMap[key] = tariffPercent;
                }
              });
              
              setTariffData(tariffMap);
              console.log("Tariff data loaded:", tariffMap);
            }
          }
        };
      };
    } catch (error) {
      console.error('Error loading product tariff data:', error);
    }
  };

  // Replace existing useEffect that loads tariffData with this one
  useEffect(() => {
    loadProductTariffData();
  }, []);

  // Update the effect to reload tariff data when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadProductTariffData();
    }
  }, [selectedCountry]);

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingRight: '20px' }}>
        <div className="filter-info">
          Configure your tariff analysis parameters:
        </div>
        <div style={{ display: 'flex', gap: '10px', position: 'relative', right: '20px', marginTop: '15px' }}>
          <button 
            className="view-table-btn" 
            onClick={() => loadTableData('product')}
          >
            View Product Table
          </button>
          <button 
            className="view-table-btn" 
            onClick={() => loadTableData('supplyChain')}
          >
            View Supply Table
          </button>
        </div>
      </div>

      {/* Add modal component */}
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

      <div className="search-bar">
        <div className="search-item">
          <input
            type="text"
            value={selectedCountry}
            onChange={handleCountryChange}
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
            {productOptions.map((product) => (
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
                              {/* Country Select - Modified to use sourceCountryOptions */}
                              <select
                                className="source-select"
                                value={source.country}
                                onChange={(e) => handleSourceCountryChange(ingredient.name, index, e.target.value)}
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
                                tariff: {source.country ? getTariffRate(source.country, selectedCountry) : 'N/A'}%
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

                        {/* Add Country Button container - reordered buttons */}
                        <div className="add-country-btn-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add your simulation logic here
                              console.log('Simulating for:', ingredient.name);
                            }}
                            className="simulate-btn"
                          >
                            Simulate
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