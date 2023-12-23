import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
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
  Legend
);

const CrashGraph = () => {
    const [dataPoints, setDataPoints] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        let interval;
        if (isActive) {
        interval = setInterval(() => {
            setDataPoints(prevDataPoints => [...prevDataPoints, getRandomValue()]);
        }, 1000);
        } else {
        clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive]);

    const getRandomValue = () => {
        return Math.random() * 10; // Simula um valor aleatório para o gráfico
    };

    const handleStart = () => {
        setIsActive(true);
        setDataPoints([]); // Reinicia os dados quando um novo jogo começa
    };

    const handleStop = () => {
        setIsActive(false);
    };

    const data = {
        labels: dataPoints.map((_, index) => index.toString()),
        datasets: [
        {
            label: 'Crash Value',
            data: dataPoints,
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)',
        },
        ],
    };

    const options = {
        scales: {
        x: {
            type: 'linear',
            position: 'bottom',
        },
        y: {
            type: 'linear',
        }
        }
    };

    return (
        <div>
        <Line ref={chartRef} data={data} options={options} />
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
        </div>
    );
};

export default CrashGraph;
