import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { backgroundColor, borderColor } from '../constants/colors.js';  

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, year, month }) {
    const graph_data = {
        labels: data.map((item) => item.username),
        datasets: [
        {
            label: "Used",
            data: data.map((item) => item.total_time > 0 ? item.total_time : 0),
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
        },
        ],
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false, // set to false to allow adjusting chart size
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    font: {
                        size: 18,
                    }
                }
            },
            title: {
                display: true,
                text: `${year}-${month}`,
                font: {
                    size: 20,
                }
            }
        }
    };
    
    return (
        <Pie
        data={graph_data}
        options={options}
        width={400}
        height={400}
        />
    );
}