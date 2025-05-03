

import React from 'react'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Component to display ingredient tariff comparison graph in a modal
 * @param {object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.ingredientName - Name of the ingredient
 * @param {array} props.sources - Array of country sources for the ingredient
 * @param {object} props.tariffData - Map of country pairs to tariff rates
 * @param {string} props.selectedCountry - Currently selected destination country
 * @param {number} props.basePrice - Base price per unit for the ingredient
 */
const IngredientGraph = ({
  isOpen,
  onClose,
  ingredientName,
  sources = [],
  tariffData = {},
  selectedCountry = '',
  basePrice = 0
}) => {
  if (!isOpen) return null;

  // Get tariff rate for country pair
  const getTariffRate = (fromCountry, toCountry) => {
    const key = `${fromCountry}-${toCountry}`;
    const rate = tariffData[key];
    return rate !== undefined ? rate : 0; // Default to 0 if not found
  };

  // Generate chart data based on number of sources using actual prices
  const generateChartData = () => {
    // If no sources or no country selected, return empty data
    if (!sources.length || !sources.some(source => source.country)) {
      return { data: [], keys: [] };
    }

    // Filter sources that have a country selected
    const validSources = sources.filter(source => source.country);

    if (validSources.length === 1) {
      // For single country, show with/without tariff
      const source = validSources[0];
      const tariffRate = getTariffRate(source.country, selectedCountry);
      // Use country-specific base price if available, otherwise fall back to the default
      const countryBasePrice = source.basePrice || basePrice;
      const withoutTariffPrice = countryBasePrice;
      const withTariffPrice = countryBasePrice * (1 + tariffRate / 100);
      
      return {
        data: [
          { 
            name: source.country, 
            withoutTariff: withoutTariffPrice,
            withTariff: withTariffPrice,
            tariffRate: tariffRate
          }
        ],
        keys: ['withoutTariff', 'withTariff']
      };
    } else {
      // For multiple countries, show each country with both prices
      const data = validSources.map(source => {
        const tariffRate = getTariffRate(source.country, selectedCountry);
        // Use country-specific base price if available
        const countryBasePrice = source.basePrice || basePrice;
        const withoutTariffPrice = countryBasePrice;
        const withTariffPrice = countryBasePrice * (1 + tariffRate / 100);
        
        return {
          name: source.country,
          withoutTariff: withoutTariffPrice,
          withTariff: withTariffPrice,
          tariffRate: tariffRate
        };
      });
      
      return {
        data,
        keys: ['withoutTariff', 'withTariff']
      };
    }
  };

  const { data, keys } = generateChartData();
  const barColors = {
    withoutTariff: '#3498db', // Blue
    withTariff: '#e74c3c'     // Red
  };

  // Format price values for tooltip
  const formatPrice = (value) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Tariff Impact: {ingredientName}</h2>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {data.length > 0 ? (
            <div className="graph-wrapper" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatPrice} />
                  <Tooltip formatter={formatPrice} />
                  <Legend />
                  <Bar 
                    dataKey="withoutTariff" 
                    name="Without Tariff" 
                    fill={barColors.withoutTariff}
                    barSize={30} 
                  />
                  <Bar 
                    dataKey="withTariff" 
                    name="With Tariff" 
                    fill={barColors.withTariff}
                    barSize={30} 
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-details" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p>Base Price: Country-specific prices are shown in the chart</p>
                {data.map((item, index) => (
                  <div key={index} style={{margin: '5px 0'}}>
                    <p>{item.name} - Base Price: ${item.withoutTariff.toFixed(2)} | Tariff: {item.tariffRate}%</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No country sources selected for this ingredient.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngredientGraph;
