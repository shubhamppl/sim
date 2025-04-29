import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [country, setCountry] = useState('United States');
  const [category, setCategory] = useState('Automotive');
  const [productValue, setProductValue] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('2025-04-23');
  const [model, setModel] = useState('advanced');
  const [tariffRate, setTariffRate] = useState(30);  // Hardcoded to 30%
  const [supplierAbsorption, setSupplierAbsorption] = useState(25);
  const [manufacturerAbsorption, setManufacturerAbsorption] = useState(25);
  const [customerAbsorption, setCustomerAbsorption] = useState(25);
  const [remainingImpact, setRemainingImpact] = useState(25);

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
    const totalCost = productValue * quantity;
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
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                <option>United States</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>

            <div>
              <label>Product Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Automotive</option>
                <option>Electronics</option>
                <option>Textiles</option>
              </select>
            </div>

            <div>
              <label>Product Value ($)</label>
              <input 
                type="number" 
                value={productValue} 
                onChange={(e) => setProductValue(Number(e.target.value))} 
                min="1"
              />
            </div>

            <div>
              <label>Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                min="1"
              />
            </div>

            <div>
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="tariff-model">
              <label>Tariff Model</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    value="basic" 
                    checked={model === 'basic'} 
                    onChange={() => setModel('basic')} 
                  /> 
                  Basic
                </label>
                <label>
                  <input 
                    type="radio" 
                    value="advanced" 
                    checked={model === 'advanced'} 
                    onChange={() => setModel('advanced')} 
                  /> 
                  Advanced
                </label>
              </div>
            </div>

            {/* Tariff Rate Slider */}
            <div className="slider-control">
              <div className="current-tariff">Current Tariff Rate: 25%</div> {/* Show current tariff rate */}
              <label>Change IN Tariff Rate: {tariffRate}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={tariffRate}
                onChange={(e) => setTariffRate(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-ticks">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Absorption Sliders */}
            <div className="slider-control">
              <label>
                Supplier Absorption: {supplierAbsorption}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={supplierAbsorption}
                onChange={(e) => handleAbsorptionChange('supplier', e.target.value)}
                className="slider"
              />
            </div>

            <div className="slider-control">
              <label>
                Manufacturer Absorption: {manufacturerAbsorption}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={manufacturerAbsorption}
                onChange={(e) => handleAbsorptionChange('manufacturer', e.target.value)}
                className="slider"
              />
            </div>

            <div className="slider-control">
              <label>
                Customer Absorption: {customerAbsorption}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={customerAbsorption}
                onChange={(e) => handleAbsorptionChange('customer', e.target.value)}
                className="slider"
              />
            </div>

            <div className="absorption-summary">
              <p>Total Allocated: {supplierAbsorption + manufacturerAbsorption + customerAbsorption}%</p>
              <p>Remaining Impact: {remainingImpact}%</p>
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
