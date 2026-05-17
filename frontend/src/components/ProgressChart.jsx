import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const ProgressChart = ({ 
  data, 
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
  title, 
  color = 'rgb(34, 197, 94)' 
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: '#222',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.05)',
        },
        ticks: {
          color: '#4b5563',
          font: {
            size: 10,
            family: 'monospace',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#4b5563',
          font: {
            size: 10,
            family: 'monospace',
          },
        },
      },
    },
  };

  const chartData = {
    labels: labels,
    datasets: [
      {
        fill: true,
        data: data || [65, 59, 80, 81, 56, 55, 40],
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.05)'),
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  return (
    <div className="h-full w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ProgressChart;
