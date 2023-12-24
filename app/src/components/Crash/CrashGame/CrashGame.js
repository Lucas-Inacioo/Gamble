import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import CryptoJS from 'crypto-js';

import './CrashGame.css';

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

const clientSeed =
    "0000000000000000000415ebb64b0d51ccee0bb55826e43846e5bea777d91966"; // Exemplo de clientSeed

function getPoint(hash) {
    const divisible = (hash, mod) => {
        let val = 0;
        let o = hash.length % 4;
        for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
        val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
        }
        return val === 0;
    };

    if (divisible(hash, 15)) return 0;
    let h = parseInt(hash.slice(0, 52 / 4), 16);
    let e = Math.pow(2, 52);
    return Math.floor((100 * e - h) / (e - h)) / 100;
}

const CrashGame = () => {
    const [dataPoints, setDataPoints] = useState([{ x: 0, y: 1 }]);
    const [isActive, setIsActive] = useState(true);
    const [finalValue, setFinalValue] = useState(null);
    const serverSeed = useRef(Math.random().toString(36).substring(2, 15)); // Initialize serverSeed ref
    const targetValue = useRef(); // Initialize targetValue ref as an empty ref
    const chartRef = useRef(null);
    const [isCooldown, setIsCooldown] = useState(false);

    useEffect(() => {
        let interval;
        
        if (isActive && chartRef.current) {
            let currentSeed = serverSeed.current;
            let hash = CryptoJS.HmacSHA256(currentSeed, clientSeed).toString(CryptoJS.enc.Hex);
            targetValue.current = getPoint(hash);
            
            const incrementX = 0.01;
            let incrementY = 1.0006;
            
            interval = setInterval(() => {
                setDataPoints(points => {

                    if (points.length === 0) {
                        return [{ x: 0, y: 1 }];
                    }
    
                    const lastPoint = points[points.length - 1];
                    const newX = lastPoint.x + incrementX;
                    const newY = lastPoint.y * incrementY;
                    incrementY *= 1.000001;
    
                    console.log(targetValue.current);
                    if (newY >= targetValue.current) {
                        setDataPoints([{ x: 0, y: 1 }]);
                        clearInterval(interval);
                        setFinalValue(targetValue.current);
                        setIsActive(false);
                        setIsCooldown(true);
                        setTimeout(() => {
                            setIsActive(true);
                            setFinalValue(null);
                            setIsCooldown(false); 
                            serverSeed.current = Math.random().toString(36).substring(2, 15);
                        }, 5000);
                        return [...points, { x: newX, y: newY }];
                    } else {
                        return [...points, { x: newX, y: newY }];
                    }
                });
            }, 10);
    
            return () => {
                if (interval) clearInterval(interval);
            };
        }
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
                    content: () => {
                        if (isCooldown && finalValue !== null) {
                            return `${finalValue.toFixed(2)}X`;
                        }
                        return `${dataPoints[dataPoints.length - 1]?.y.toFixed(2)}X`;
                    },
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
            {dataPoints && (
                <Line ref={chartRef} data={data} options={options} />
            )}
            
            {isCooldown && finalValue && (
            <div className="crash-container">
                <span className="crash-value">{finalValue.toFixed(2)}X</span>
                <span className="crash-label">CRASHED</span>
            </div>
            )}
        </div>
    );
};

export default CrashGame;
