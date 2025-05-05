import React, { useState } from 'react';
import './Dashboard.css';
import IngredientList from '../Main_page/IngredientList';

const TariffSidebar = ({ 
  country, 
  category, 
  product, 
  quantity, 
  showIngredientConfig, 
  setShowIngredientConfig, 
  ingredients, 
  handleBackClick 
}) => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ headers: [], rows: [], title: '' });

  // Add the loadUpdatedSupplyTable function that was previously imported from SourceManagement.js
  const loadUpdatedSupplyTable = async (
    selectedCountry,
    selectedProduct,
    dbName,
    storeName,
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

  const handleShowUpdatedTable = () => {
    loadUpdatedSupplyTable(
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
    <aside className="tariff-sidebar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>Tariff Simulator</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={handleShowUpdatedTable}
            title="Show Updated Table"
            style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            UT
          </button>
          <button 
            onClick={handleShowProductTable}
            title="View Product Table"
            style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            PT
          </button>
          <button 
            onClick={handleShowSupplyTable}
            title="View Supply Table"
            style={{ 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ST
          </button>
        </div>
      </div>
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
            onClick={() => {
              console.log("Toggling ingredient panel, current state:", !showIngredientConfig);
              console.log("Available ingredients:", ingredients);
              setShowIngredientConfig(!showIngredientConfig);
            }}
          >
            {showIngredientConfig ? 'Hide Ingredients' : 'Configure Ingredients'}
          </button>
        </div>

        <button onClick={handleBackClick} className="simulate-button">Back to Simulator</button>
      </div>

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
    </aside>
  );
};

export default TariffSidebar;
