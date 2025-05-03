import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

/**
 * Raw Materials Tariff Comparison Chart component
 * @param {object} props - Component props
 * @param {object} props.rawMaterialTariffData - Raw material tariff data
 */
const CountryComparison = ({ rawMaterialTariffData }) => {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState('');

  // Get available raw materials for selection
  const getRawMaterialOptions = () => {
    return Object.keys(rawMaterialTariffData);
  };

  // Get tariff data for currently selected material
  const getTariffData = () => {
    if (selectedRawMaterial && rawMaterialTariffData[selectedRawMaterial]) {
      return rawMaterialTariffData[selectedRawMaterial];
    }
    return [];
  };

  // Handle raw material selection
  const handleRawMaterialChange = (e) => {
    setSelectedRawMaterial(e.target.value);
  };

  // Vibrant color palette for chart bars
  const vibrantColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#2ECC71', '#E74C3C',
    '#3498DB', '#F1C40F', '#9B59B6', '#1ABC9C'
  ];

  // Set initial selection if none selected and data available
  React.useEffect(() => {
    const materials = getRawMaterialOptions();
    if (materials.length > 0 && !selectedRawMaterial) {
      setSelectedRawMaterial(materials[0]);
    }
  }, [rawMaterialTariffData]);

  return (
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={vibrantColors[index % vibrantColors.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CountryComparison;
