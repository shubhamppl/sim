import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Web_page.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { 
  addCountrySource, 
  removeCountrySource, 
  handleSourceCountryChange, 
  handleSourcePercentageChange, 
  handleSliderChange,
  initializeIngredientSources,
  calculateSourceWeight as computeSourceWeight,
  loadUpdatedSupplyTable
} from './SourceManagement';
import CountryComparison from './Country_Comparison';
import IngredientGraph from './IngredientGraph';
import IngredientList from './IngredientList'; // Import the new component

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

  // Using imported functions with state passed in
  const handleAddCountrySource = async (ingredientId) => {
    const newSource = await addCountrySource(ingredientId, ingredientSources, setIngredientSources);
    
    // After adding source, we'll add an effect to update base prices when country changes
    if (newSource) {
      // This will trigger the useEffect below that watches ingredientSources
      console.log("New source added, will fetch prices when country is selected");
    }
  };

  const handleRemoveCountrySource = (ingredientId, index) => {
    removeCountrySource(ingredientId, index, ingredientSources, setIngredientSources);
  };

  const handleCountrySourceChange = (ingredientId, index, country) => {
    handleSourceCountryChange(ingredientId, index, country, ingredientSources, setIngredientSources);
    
    // Fetch base price when country changes
    if (country) {
      fetchCountryBasePrice(ingredientId, country);
    }
  };

  const handlePercentageChange = (ingredientId, index, percentage) => {
    handleSourcePercentageChange(ingredientId, index, percentage, ingredientSources, setIngredientSources);
  };

  const handleSourceSliderChange = (ingredientId, index, field, value) => {
    handleSliderChange(ingredientId, index, field, value, ingredientSources, setIngredientSources);
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
          const productFiles = files.filter(file => file.fileType === 'product');
          
          if (supplyFiles.length > 0 && productFiles.length > 0) {
            const latestSupplyFile = supplyFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            const latestProductFile = productFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
            
            // Get relevant column indices from supply chain file
            const rawMaterialIndex = latestSupplyFile.headers.indexOf('Raw_Material_Name');
            const exportCountryIndex = latestSupplyFile.headers.indexOf('Export_Country');
            const importCountryIndex = latestSupplyFile.headers.indexOf('Import_country');
            const tariffIndex = latestSupplyFile.headers.indexOf('Tariffs');
            const contractDateIndex = latestSupplyFile.headers.indexOf('contract_end_date');
            const productSubCategoryIndex = latestSupplyFile.headers.indexOf('Product_Sub_Category');
            
            // Get Product_percent_requied column index from product file
            const productRawMaterialIndex = latestProductFile.headers.indexOf('Raw_Material_Name');
            const percentRequiredIndex = latestProductFile.headers.indexOf('Product_percent_requied');
            
            if (rawMaterialIndex !== -1 && exportCountryIndex !== -1 && importCountryIndex !== -1 && 
                tariffIndex !== -1 && contractDateIndex !== -1 && productSubCategoryIndex !== -1) {
              
              // Filter rows by selected country and product
              const filteredRows = latestSupplyFile.rows.filter(row => 
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
                    // Get percentage from product file if available
                    let materialPercentage = 0;
                    
                    if (productRawMaterialIndex !== -1 && percentRequiredIndex !== -1) {
                      // Find the matching row in product file
                      const productRow = latestProductFile.rows.find(pRow => 
                        pRow[productRawMaterialIndex] === rawMaterialName
                      );
                      
                      if (productRow && productRow[percentRequiredIndex]) {
                        materialPercentage = parseFloat(productRow[percentRequiredIndex]) || 0;
                      }
                    }
                    
                    // Extract base price from supply chain file
                    const basePrice = parseFloat(row[latestSupplyFile.headers.indexOf('Base_Price_Per_Unit')]) || 0;
                    rawMaterials[rawMaterialName] = { 
                      name: rawMaterialName, 
                      percentage: materialPercentage,
                      basePrice: basePrice 
                    };
                  }
                }
              });
              
              // If no percentages were found in Product_percent_requied, distribute equally
              const materialCount = Object.keys(rawMaterials).length;
              let totalPercentage = 0;
              
              Object.keys(rawMaterials).forEach(key => {
                totalPercentage += rawMaterials[key].percentage;
              });
              
              // If total percentage is 0, distribute equally
              if (totalPercentage === 0 && materialCount > 0) {
                const equalPercentage = 100 / materialCount;
                Object.keys(rawMaterials).forEach(key => {
                  rawMaterials[key].percentage = equalPercentage;
                });
              }
              
              // Create product raw materials structure
              const newProductRawMaterials = {
                [selectedCategory]: {
                  [selectedProduct]: Object.values(rawMaterials)
                }
              };
              
              setProductRawMaterials(newProductRawMaterials);
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
      // Check if sources already exist, if not, fetch them
      if (!ingredientSources[id]) {
        fetchIngredientSources(id);
      }
    }
  };

  // Update weight calculation to interpret units as tons (1 unit = 1 ton = 1000kg)
  const calculateIngredientWeight = (percentage) => {
    // Convert percentage to decimal (e.g., 10% -> 0.1)
    const percentDecimal = percentage / 100;
    // If selectedType is 1, it means 1 ton (1000kg)
    const multiplier = selectedType ? parseFloat(selectedType) : 0;
    // Calculate weight in kg (percentage of the total tons, converted to kg)
    return (percentDecimal * multiplier * 1000).toFixed(1);
  };
  
  // Fix the recursive function call by renaming the local function
  // and using the renamed imported function but adjusted for tons
  const calculateSourceWeight = (ingredientPercentage, sourcePercentage) => {
    // First calculate the total ingredient weight in kg
    const ingredientWeight = calculateIngredientWeight(ingredientPercentage);
    // Then calculate the source's portion of that weight
    return ((sourcePercentage / 100) * ingredientWeight).toFixed(1);
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
        ingredientSources,
        ingredients: getIngredients() // Pass the actual ingredients data too
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

  // Add states for ingredient graph modal
  const [isIngredientGraphOpen, setIsIngredientGraphOpen] = useState(false);
  const [selectedIngredientForGraph, setSelectedIngredientForGraph] = useState(null);

  // Handle View Graph button click
  const handleViewGraph = (ingredientName, e) => {
    e.stopPropagation(); // Prevent toggling the ingredient
    setSelectedIngredientForGraph(ingredientName);
    setIsIngredientGraphOpen(true);
  };

  // Close ingredient graph modal
  const closeIngredientGraph = () => {
    setIsIngredientGraphOpen(false);
    setSelectedIngredientForGraph(null);
  };

  // New function to fetch ingredient sources from product table
  const fetchIngredientSources = async (ingredientName) => {
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
            
            const rawMaterialIndex = latestFile.headers.indexOf('Raw_Material_Name');
            const fromCountryIndex = latestFile.headers.indexOf('From_Country');
            const percentRequiredIndex = latestFile.headers.indexOf('Product_percent_requied');
            
            if (rawMaterialIndex !== -1 && fromCountryIndex !== -1) {
              // Filter rows by ingredient name
              const ingredientRows = latestFile.rows.filter(row => 
                row[rawMaterialIndex] === ingredientName
              );
              
              // Get unique source countries
              const sourceCountries = [...new Set(ingredientRows.map(row => row[fromCountryIndex]))].filter(Boolean);
              
              if (sourceCountries.length > 0) {
                // Get ingredient percentage from the Product_percent_requied column if available
                let ingredientPercentage = 100; // Default
                
                if (percentRequiredIndex !== -1) {
                  // Find the first valid percentage for this ingredient
                  const percentRow = ingredientRows.find(row => row[percentRequiredIndex] && !isNaN(parseFloat(row[percentRequiredIndex])));
                  if (percentRow) {
                    ingredientPercentage = parseFloat(percentRow[percentRequiredIndex]);
                  }
                }
                
                // Calculate equal distribution of the ingredient percentage for each country source
                const equalPercentage = Math.floor(100 / sourceCountries.length);
                const remainder = 100 - (equalPercentage * sourceCountries.length);
                
                // Create sources array
                const sources = sourceCountries.map((country, index) => ({
                  country,
                  // Add the remainder to the first country
                  percentage: index === 0 ? equalPercentage + remainder : equalPercentage,
                  supplierAbsorption: 0,
                  manufacturerAbsorption: 100,
                  cashPaymentDelay: 0
                }));
                
                // Update ingredient sources
                setIngredientSources(prev => ({
                  ...prev,
                  [ingredientName]: sources
                }));
              } else {
                // Fall back to default initialization if no sources found
                initializeIngredientSources(ingredientName, ingredientSources, setIngredientSources);
              }
            }
          }
        };
      };
    } catch (error) {
      console.error('Error fetching ingredient sources:', error);
      // Fall back to default initialization on error
      initializeIngredientSources(ingredientName, ingredientSources, setIngredientSources);
    }
  };

  // Add a new function to fetch country-specific base prices
  const fetchCountryBasePrice = async (ingredientName, country) => {
    if (!country) return null;
    
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
            
            const rawMaterialIndex = latestFile.headers.indexOf('Raw_Material_Name');
            const fromCountryIndex = latestFile.headers.indexOf('From_Country');
            const basePriceIndex = latestFile.headers.indexOf('Base_Price_Per_Unit');
            
            if (rawMaterialIndex !== -1 && fromCountryIndex !== -1 && basePriceIndex !== -1) {
              // Find the matching row for this ingredient and country
              const matchingRow = latestFile.rows.find(row => 
                row[rawMaterialIndex] === ingredientName && 
                row[fromCountryIndex] === country
              );
              
              if (matchingRow) {
                const basePrice = parseFloat(matchingRow[basePriceIndex]) || 0;
                
                // Update the ingredient source with the base price
                setIngredientSources(prev => {
                  const updatedSources = {...prev};
                  const sourceIndex = updatedSources[ingredientName]?.findIndex(s => s.country === country);
                  
                  if (sourceIndex !== -1 && updatedSources[ingredientName]) {
                    updatedSources[ingredientName][sourceIndex].basePrice = basePrice;
                  }
                  
                  return updatedSources;
                });
              }
            }
          }
        };
      };
    } catch (error) {
      console.error('Error fetching base price:', error);
    }
  };

  // Watch for country changes in ingredient sources and fetch base prices
  useEffect(() => {
    // Check each ingredient
    Object.entries(ingredientSources).forEach(([ingredientName, sources]) => {
      // Check each source
      sources.forEach(source => {
        if (source.country && !source.basePrice) {
          fetchCountryBasePrice(ingredientName, source.country);
        }
      });
    });
  }, [ingredientSources]);

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
            onClick={() => loadUpdatedSupplyTable(
              selectedCountry,
              selectedProduct,
              dbName,
              storeName,
              setModalData,
              setIsTableModalOpen
            )}
          >
            Show Updated Table
          </button>
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
            
            {/* Replace the chart code with our new component */}
            <CountryComparison rawMaterialTariffData={rawMaterialTariffData} />

            {/* Replace the ingredient list with the new component */}
            <IngredientList 
              ingredients={getIngredients()}
              ingredientSources={ingredientSources}
              expandedIngredient={expandedIngredient}
              toggleIngredient={toggleIngredient}
              calculateIngredientWeight={calculateIngredientWeight}
              calculateSourceWeight={calculateSourceWeight}
              getTariffRate={getTariffRate}
              sourceCountryOptions={sourceCountryOptions}
              handleCountrySourceChange={handleCountrySourceChange}
              handleSourceSliderChange={handleSourceSliderChange}
              handlePercentageChange={handlePercentageChange}
              handleRemoveCountrySource={handleRemoveCountrySource}
              handleAddCountrySource={handleAddCountrySource}
              handleViewGraph={handleViewGraph}
              selectedCountry={selectedCountry}
              dbName={dbName}
              storeName={storeName}
              fetchCountryBasePrice={fetchCountryBasePrice}
              setIngredientSources={setIngredientSources}
            />

            <div className="show-results-container">
              <button onClick={handleShowResults} className="show-results-btn">Show Results</button>
            </div>
          </div>
        </>
      )}

      {/* Add ingredient graph modal */}
      <IngredientGraph
        isOpen={isIngredientGraphOpen}
        onClose={closeIngredientGraph}
        ingredientName={selectedIngredientForGraph}
        sources={selectedIngredientForGraph ? ingredientSources[selectedIngredientForGraph] : []}
        tariffData={tariffData}
        selectedCountry={selectedCountry}
        basePrice={selectedIngredientForGraph ? 
          getIngredients().find(item => item.name === selectedIngredientForGraph)?.basePrice || 0 
          : 0
        }
      />
    </div>
  );
};


export default WebPage;