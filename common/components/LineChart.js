import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from 'faker';

import { daysInCurrentMonth, daysInTheMonth } from '../../util/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    maintainAspectRatio: false, // set to false to allow adjusting chart size
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Daily Usage',
        },
    },
    scales: {
        y: {
            title : {
                display: true,
                text: 'Time (minutes)'
            }
        },
        x: {
            title : {
                display: true,
                text: 'Date'
            }
        }
    }
};

export default function LineChart({daily_data}) {
    // console.log("daily data : ", daily_data);

    const days_in_month = daysInCurrentMonth();
    const current_month = new Date().getMonth() + 1;

    const labels = []
    for (var i = 1; i <= days_in_month; i++) {
        labels.push(current_month + '/' + i);
    }

    const backgroundColor = [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)", 
        "rgba(255, 206, 86, 1)", 
        "rgba(75, 192, 192, 1)", 
        "rgba(153, 102, 255, 1)", 
        "rgba(255, 159, 64, 1)", 
    ];

    const borderColor = [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)", 
        "rgba(255, 206, 86, 1)", 
        "rgba(75, 192, 192, 1)", 
        "rgba(153, 102, 255, 1)", 
        "rgba(255, 159, 64, 1)", 
    ];

    const data = {
        labels,
        datasets: 
            daily_data.map((item, index) => {
                return {
                    label: item.username,
                    data: item.data,
                    backgroundColor : backgroundColor[index],
                    borderColor : borderColor[index],
                }
            })
         
            // {
            //     label: 'Dataset 1',
            //     data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            // },
            // {
            //     label: 'Dataset 2',
            //     data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
            // },
        
    };

    // console.log(data);

    return <Line options={options} data={data} height={400} width={400}/>;
}