import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin 
);

const CrashGame = () => {
  const [dataPoints, setDataPoints] = useState([{ x: 0, y: 1 }]);
  const [isActive, setIsActive] = useState(true);
  const [finalValue, setFinalValue] = useState(null);
  const targetValue = useRef(Math.random() * 15 + 1); // Target value between 1 and 16
  const chartRef = useRef(null);

    useEffect(() => {
        let interval;
        if (isActive && chartRef.current) {
            interval = setInterval(() => {
                setDataPoints(points => {
                const lastPoint = points[points.length - 1];
                const newX = lastPoint.x + 0.01;
                const newY = lastPoint.y * 1.0006; // Exponential growth factor

                if (newY >= targetValue.current) {
                    clearInterval(interval);
                    setFinalValue(newY);
                    setIsActive(false);
                    setTimeout(() => {
                    setDataPoints([{ x: 0, y: 1 }]);
                    setIsActive(true);
                    setFinalValue(null);
                    targetValue.current = Math.random() * 15 + 1; // Reset target value
                    }, 5000);
                } else {
                    return [...points, { x: newX, y: newY }];
                }
                });
            }, 1);
        }

        return () => clearInterval(interval);
    }, [isActive]);

    const data = {
        datasets: [
        {
            label: 'Exponential Growth',
            data: dataPoints,
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)',
            showLine: true,
            pointRadius: 0,
        },
        {
            label: 'Current Position',
            data: [dataPoints[dataPoints.length - 1]],
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgba(255, 99, 132, 0.2)',
            pointRadius: 5,
        },
        ],
    };

    const options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                suggestedMin: 0,
                suggestedMax: 5,
            },
            y: {
                type: 'linear',
                suggestedMin: 1,
                suggestedMax: 1.3,
            }
        },
        animation: {
            duration: 0,
        },
        plugins: {
            legend: {
                display: false, // Oculta a legenda
            },
            annotation: {
                annotations: {
                    textLabel: {
                    type: 'label',
                    position: 'top',
                    content: () => `${dataPoints[dataPoints.length - 1].y.toFixed(2)}X`,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    font: {
                    size: 65,
                    weight: 'bold',
                    family: 'Arial',
                    },
                    color: '#fff',
                    },
                },
            },
        },
    };

    return (
        <div>
            <Line ref={chartRef} data={data} options={options} />
            {finalValue && <p>Final Value: {finalValue.toFixed(2)}</p>}
        </div>
    );
};

export default CrashGame;
