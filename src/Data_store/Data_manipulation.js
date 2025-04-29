// src/Data_store/Data_manipulation.js
import Papa from 'papaparse';

// Function to filter CSV data based on To_Country, Product_Category, and Product_Sub_Category
export const filterCSVData = (csvContent, filters) => {
  // Parse CSV content
  const parsedData = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    trimHeaders: true
  });
  
  // Apply filters if provided
  if (filters && Object.keys(filters).length > 0) {
    return parsedData.data.filter(row => {
      return (!filters.country || row.To_Country === filters.country) &&
             (!filters.category || row.Product_Category === filters.category) &&
             (!filters.subCategory || row.Product_Sub_Category === filters.subCategory);
    });
  }
  
  return parsedData.data;
};

// Function to get unique values for a column from CSV data
export const getUniqueValuesForColumn = (data, columnName) => {
  if (!data || !data.length) return [];
  
  return [...new Set(data.map(row => row[columnName]))].filter(Boolean);
};

// Group data by Raw_Material_Name
export const groupByRawMaterial = (data) => {
  const result = {};
  
  if (!data || !data.length) return result;
  
  data.forEach(item => {
    const material = item.Raw_Material_Name;
    if (!result[material]) {
      result[material] = [];
    }
    result[material].push(item);
  });
  
  return result;
};

// Calculate statistics for raw materials from different countries
export const calculateMaterialStats = (groupedData) => {
  const stats = {};
  
  for (const [material, items] of Object.entries(groupedData)) {
    stats[material] = {
      avgPrice: items.reduce((sum, item) => sum + item.Base_Price_Per_Unit, 0) / items.length,
      minPrice: Math.min(...items.map(item => item.Base_Price_Per_Unit)),
      maxPrice: Math.max(...items.map(item => item.Base_Price_Per_Unit)),
      countryData: items.map(item => ({
        country: item.From_Country,
        price: item.Base_Price_Per_Unit,
        currentTariff: item.Current_Tariff_Percent,
        futureTariff: item.Future_Tariff_Percent,
        paymentTermDays: item.payment_term_days,
        implementationDate: item.Future_Tariff_Implementation_Date
      }))
    };
  }
  
  return stats;
};