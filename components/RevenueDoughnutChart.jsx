// RevenueDoughnutChart.jsx

'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function for currency formatting (Philippines Pesos)
const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};


// --- COMPONENT: RevenueDoughnutChart ---
const RevenueDoughnutChart = ({ items, filterTitle }) => {
    // Ensure items are a non-null array
    const validItems = items || [];
    
    // 1. Sort by Gross Revenue (baseRevenue) and take the top 5
    // Note: .slice() is used to avoid mutating the prop array
    const topItems = validItems
        .slice() 
        .sort((a, b) => b.baseRevenue - a.baseRevenue)
        .slice(0, 5)
        .filter(item => item.baseRevenue > 0); // Only include items with revenue

    // 2. Calculate the "Other" revenue
    const topRevenue = topItems.reduce((sum, item) => sum + item.baseRevenue, 0);
    const totalRevenue = validItems.reduce((sum, item) => sum + item.baseRevenue, 0);
    const otherRevenue = totalRevenue - topRevenue;

    // 3. Prepare Chart Data
    const itemNames = topItems.map(item => item.name);
    const itemRevenues = topItems.map(item => item.baseRevenue);

    // Add "Other" if there are more than 5 items and remaining revenue
    if (otherRevenue > 0 && validItems.length > 5) {
        itemNames.push('Other Items');
        itemRevenues.push(otherRevenue);
    }

    // Helper function for consistent colors
    const getColors = (count) => {
        // Tailwind/Dark-mode friendly colors
        const baseColors = [
            '#ec4899', // Pink-500
            '#f97316', // Orange-500
            '#eab308', // Yellow-500
            '#22c55e', // Green-500
            '#3b82f6', // Blue-500
            '#8b5cf6', // Violet-500
            '#64748b', // Slate-500 (for 'Other')
        ];
        return baseColors.slice(0, count);
    };

    const data = {
        labels: itemNames,
        datasets: [
            {
                label: `Gross Revenue (${filterTitle})`,
                data: itemRevenues,
                backgroundColor: getColors(itemNames.length),
                borderColor: '#171717', // Neutral-900 background for separation
                borderWidth: 1,
                cutout: '75%', // Doughnut style
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right', // Put the legend on the right side
                labels: {
                    color: '#a3a3a3', // Neutral-400
                    font: {
                        size: 10,
                    },
                    boxWidth: 10,
                    padding: 10,
                },
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#e5e7eb',
                borderColor: '#374151',
                borderWidth: 1,
                cornerRadius: 4,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed;
                        const formattedValue = formatCurrency(value);
                        // Calculate percentage of total revenue
                        const percentage = ((value / totalRevenue) * 100).toFixed(1);
                        return ` ${context.label}: ${formattedValue} (${percentage}%)`;
                    }
                }
            }
        },
    };

    return (
        <div className="bg-neutral-800 p-6 rounded-xl shadow-2xl h-full border border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
                Top 5 Gross Revenue Breakdown ({filterTitle})
            </h3>
            <div className="h-[250px] md:h-[300px] flex justify-center items-center">
                {totalRevenue > 0 ? (
                    <Doughnut data={data} options={options} />
                ) : (
                    <p className="text-neutral-500">No revenue data for this period.</p>
                )}
            </div>
        </div>
    );
};

export default RevenueDoughnutChart;