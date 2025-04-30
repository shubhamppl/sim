import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import './TariffChart.css';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TariffChart = ({ results, supplierAbsorption, manufacturerAbsorption, customerAbsorption, remainingImpact }) => {
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

  return (
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
  );
};

export default TariffChart;
