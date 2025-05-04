# Tariff Simulator Application

A comprehensive web application for simulating and analyzing the impact of tariffs on product supply chains, ingredients, and pricing strategies.

## Overview

The Tariff Simulator is a React-based application that helps businesses analyze and visualize the impact of tariffs on their supply chains. It allows users to:

- Upload supply chain and product data
- Analyze tariff impacts on specific products and ingredients
- Simulate different sourcing strategies
- Visualize tariff effects through interactive charts and graphs
- Model cost absorption scenarios between suppliers, manufacturers, and customers

## Project Structure

### Root Directory

- `package.json`: Contains project dependencies and scripts
- `Final_Snickers_Dataset.xlsx`: Sample dataset for the application
- `productcsv2.csv`, `supplycsv.csv`: Sample CSV data files for testing
- `App.py`: Backend Python script for data processing (if integrated with a Python backend)

### `/public` Directory

Contains static assets served directly:

- `favicon.ico`, `logo192.png`, `logo512.png`: Application icons
- `manifest.json`: Web app manifest for PWA functionality
- `robots.txt`: Instructions for web crawlers
- `Final_Snickers_Dataset.csv`: Sample dataset in CSV format
- `/images`: Contains application images
  - `mu-sigma-logo-1.png`: Company logo
  - `user.png`: User profile icon

### `/src` Directory

Contains the application source code:

#### Root Components

- `App.js`: Main application component that sets up routing between different pages
- `App.css`: Global application styles
- `index.js`: Application entry point that renders the root React component
- `index.css`: Global CSS styles
- `reportWebVitals.js`: Performance measurement utilities
- `setupTests.js`: Test configuration for Jest

#### `/Data_store` Directory

Contains data manipulation and storage utilities:

- `Data_manipulation.js`: Utilities for filtering, transforming, and analyzing data from CSV/Excel files, including:
  - `filterCSVData()`: Filters CSV data based on criteria
  - `getUniqueValuesForColumn()`: Extracts unique values from a specific column
  - `groupByRawMaterial()`: Groups data by raw material names
  - `calculateMaterialStats()`: Calculates statistics for raw materials from different countries

#### `/graph_page` Directory

Components for visualizing tariff analysis results:

- `Dashboard.js`: Main results page that displays tariff analysis, featuring:
  - Interactive charts showing tariff impacts
  - Configuration panel for adjusting absorption scenarios
  - Cash flow impact analysis
  - Ingredient management options
- `Dashboard.css`: Styles for the Dashboard components
- `TariffChart.js`: Specialized chart component for visualizing tariff impacts, implementing:
  - Bar charts comparing costs with and without tariffs
  - Cost breakdown visualization showing supplier/manufacturer/customer absorption
- `TariffChart.css`: Styles for the tariff chart components

#### `/Import_data` Directory

Data import and management components:

- `Uplode.js`: Component for uploading and managing supply chain and product data files:
  - CSV and Excel file parsing
  - Data preview functionality
  - Integration with IndexedDB for client-side storage
  - Optional backend processing capabilities
- `Upload.css`: Styles for the upload interface

#### `/Login_page` Directory

Authentication components:

- `login.js`: Simple login interface providing access to the application
- `login.css`: Styling for the login page

#### `/Main_page` Directory

Core simulator interface components:

- `Web_page.js`: Main simulator interface allowing users to:
  - Select countries, categories, and products
  - View and manage ingredients and their sources
  - Configure tariff simulation parameters
  - Visualize tariff impacts
- `Web_page.css`: Styles for the main simulator interface
- `IngredientList.js`: Component for displaying and managing product ingredients:
  - Shows ingredient percentages, weights, and sources
  - Allows editing of ingredient sources and proportions
  - Displays country-specific tariff rates
- `IngredientGraph.js`: Visualization component for comparing tariff impacts on specific ingredients
- `SourceManagement.js`: Utilities for managing ingredient sources:
  - Adding/removing country sources
  - Managing percentages, supplier absorption rates, etc.
  - Calculating weights and impacts
- `Country_Comparison.js`: Component for comparing tariff rates across different countries

## Key Features

- **Data Management**: Upload, preview, and store supply chain and product data
- **Dynamic Filtering**: Filter products by country, category, and other attributes
- **Interactive Simulation**: Adjust sourcing strategies and see real-time impacts
- **Visual Analysis**: Multiple chart types to visualize different aspects of tariff impacts
- **Cost Absorption Modeling**: Simulate how tariff costs can be distributed among suppliers, manufacturers, and customers
- **Cash Flow Analysis**: Visualize the time-based impact of tariffs on cash flow

## Getting Started

### Prerequisites

- Node.js and npm installed on your system
- Optional: Python environment for backend processing (if used)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

  others:
npx create-react-app sim
# OR with Vite (recommended)
npm create vite@latest sim -- --template react

npm install -D vite sass @types/react @types/react-dom

npm install chart.js react-chartjs-2
# OR
npm install recharts

npm install react-redux @reduxjs/toolkit
# OR
npm install zustand
npm install react react-dom react-router-dom
4. Open http://localhost:3000 to view the application

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the build configuration (one-way operation)

## Data Format Requirements

### Supply Chain Data

Supply chain files should include columns for:
- Raw_Material_Name: Name of the ingredient/material
- Export_Country: Country of origin
- Import_country: Destination country
- Tariffs: Tariff percentage
- Base_Price_Per_Unit: Base price per unit
- contract_end_date: End date of contracts

### Product Data

Product files should include:
- Product_Category: Category of the product
- Product_Sub_Category: Specific product type
- Raw_Material_Name: Ingredient/material name
- From_Country: Source country
- To_Country: Destination country
- Current_Tariff_Percent: Current tariff percentage
- Product_percent_requied: Percentage of ingredient in product

## Usage Flow

1. **Login**: Access the application through the login page
2. **Upload Data**: Go to the upload page to import supply chain and product data
3. **Configure Simulation**: Select country, product category, and product
4. **Manage Ingredients**: Adjust ingredient sources and parameters
5. **View Results**: Analyze the tariff impacts through the results dashboard

## Development Notes

The application uses:
- React for the UI components
- React Router for navigation
- IndexedDB for client-side data storage
- Recharts and Chart.js for data visualization
- CSS for styling without external UI libraries

## License

[License information]

## Contributors

[List of contributors]
