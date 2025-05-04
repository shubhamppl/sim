import React, { useState } from 'react';
import './Dashboard.css';
import { loadUpdatedSupplyTable } from '../Main_page/SourceManagement';

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
