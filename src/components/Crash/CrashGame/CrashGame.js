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
ChartJS.defaults.color = '#adb5bd';
ChartJS.defaults.borderColor = 'rgba(255,255,255,.08)';

const canvasBgPlugin = {
    id: 'canvas_bg',
    beforeDraw(chart, args, opts) {
        const { ctx, width, height } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = opts.color || '#0d1117';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    },
};
ChartJS.register(canvasBgPlugin);

const clientSeed = "0000000000000000000415ebb64b0d51ccee0bb55826e43846e5bea777d91966";

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

const CrashGame = (
    {
        betMode,
        setBetMode,
        betAmount,
        setBetAmount,
        autoRetire,
        setAutoRetire,
        onStartGame,
        setCurrentGame,
    } = {}
) => {
    const [dataPoints, setDataPoints] = useState([{ x: 0, y: 1 }]);
    const [isActive, setIsActive] = useState(true);
    const [finalValue, setFinalValue] = useState(null);
    const serverSeed = useRef(Math.random().toString(36).substring(2, 15));
    const targetValue = useRef();
    const chartRef = useRef(null);
    const [isCooldown, setIsCooldown] = useState(false);
    const [lastGamesCrashValue, setLastGamesCrashValue] = useState([]);

    const intervalRef = useRef(null);
    const hasCrashedRef = useRef(false);

    useEffect(() => {
        onStartGame();
        hasCrashedRef.current = false;

        if (isActive && chartRef.current) {
            const currentSeed = serverSeed.current;
            const hash = CryptoJS.HmacSHA256(currentSeed, clientSeed).toString(CryptoJS.enc.Hex);
            targetValue.current = getPoint(hash);

            const incrementX = 0.01;
            let incrementY = 1.0006;

            intervalRef.current = setInterval(() => {
                setDataPoints((points) => {
                    if (points.length === 0) {
                        return [{ x: 0, y: 1 }];
                    }

                    const lastPoint = points[points.length - 1];
                    const newX = lastPoint.x + incrementX;
                    const newY = lastPoint.y * incrementY;
                    incrementY *= 1.000001;

                    if (newY >= targetValue.current && !hasCrashedRef.current) {
                        hasCrashedRef.current = true;
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        setFinalValue(targetValue.current);

                        setLastGamesCrashValue((prevValues) => {
                            if (prevValues.length >= 10) {
                                return [...prevValues.slice(1), targetValue.current];
                            } else {
                                return [...prevValues, targetValue.current];
                            }
                        });

                        setIsActive(false);
                        setIsCooldown(true);

                        setTimeout(() => {
                            setDataPoints([{ x: 0, y: 1 }]);
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
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [isActive, betAmount, onStartGame]);

    const data = {
        datasets: [
            {
                label: 'Crash line',
                data: dataPoints,
                borderColor: '#ff0050',
                backgroundColor: '#ff0050',
                pointRadius: 0,
                tension: 0.02,
            },
            {
                // keeps the moving dot red as well
                label: 'Current Position',
                data: [dataPoints[dataPoints.length - 1]],
                backgroundColor: '#ff0050',
                borderColor: '#ff0050',
                pointRadius: 6,
            },
        ],
    };

    const currentX = dataPoints[dataPoints.length - 1]?.x ?? 0;
    const currentY = dataPoints[dataPoints.length - 1]?.y ?? 1;

    const options = {
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: Math.max(5, currentX + 0.5),
            },
            y: {
                type: 'linear',
                min: 1,
                max: Math.max(1.3, currentY + 0.5),
            },
        },
        animation: { duration: 0 },
        plugins: {
            canvas_bg: { color: '#0d1117' },
            legend: {
                display: false,
            },
            annotation: {
                annotations: {
                    textLabel: {
                        type: 'label',
                        position: 'top',
                        content: () => {
                            if (isCooldown && finalValue !== null) {
                                return [
                                    `${finalValue.toFixed(2)}X`,
                                    'CRASHED',
                                ];
                            }
                            return `${dataPoints[dataPoints.length - 1]?.y.toFixed(2)}X`;
                        },
                        backgroundColor: () => isCooldown
                            ? 'rgba(255, 0, 0, 0.85)'
                            : 'rgba(40, 40, 40, 0.85)',
                        color: '#fff',
                        borderRadius: 8,
                        padding: 25,
                        font: {
                            size: 36,
                            weight: 'bold',
                            family: 'Arial',
                        },
                    },
                },
            },
        },
    };

    const renderLastGames = () => (
        <div className="last-games-list">
            {lastGamesCrashValue.map((value, index) => (
                <div
                    key={index}
                    className={`crash-history ${value > 2 ? 'crash-green' : ''}`}
                >
                    <span className="crash-value">{value.toFixed(2)}X</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="crash-game" style={{ color: 'white' }}>
            <div className="panel-light chart-wrapper">
                <div className="chart-container">
                    <Line ref={chartRef} data={data} options={options} />
                </div>
            </div>
            <div className="last-games-container">
                <h3>Últimos 10 Jogos</h3>
                <div className="panel-light history-bar">
                    {renderLastGames()}
                </div>
            </div>
            <button onClick={() => setCurrentGame('simulateCrashGames')}>
                Simular Jogos de Crash
            </button>
        </div>
    );
};

export default CrashGame;
