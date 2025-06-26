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

const clientSeed = '0000000000000000000415ebb64b0d51ccee0bb55826e43846e5bea777d91966';

export function getPoint(hash) {
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

const CrashGame = ({
    setCurrentGame,
    onMultiplierChange,
    onCrash,
    gamePhase,      // 'betting' | 'active' | 'result'
    countdown,      // segundos restantes durante betting
    lastGames = [], // histórico das 10 últimas partidas
    payoutInfo,     // { mult, amount } ou null
} = {}) => {
    const [dataPoints, setDataPoints] = useState([{ x: 0, y: 1 }]);
    const [finalValue, setFinalValue] = useState(null);
    const [isCooldown, setIsCooldown] = useState(false);

    const serverSeed = useRef(Math.random().toString(36).substring(2, 15));
    const targetValue = useRef(0);
    const intervalRef = useRef(null);
    const hasCrashed = useRef(false);

    /* mantém callbacks atuais */
    const multCbRef = useRef(onMultiplierChange);
    const crashCbRef = useRef(onCrash);
    useEffect(() => { multCbRef.current = onMultiplierChange; });
    useEffect(() => { crashCbRef.current = onCrash; });

    /* loop principal */
    useEffect(() => {
        if (gamePhase !== 'active') return;

        multCbRef.current?.(1);
        hasCrashed.current = false;

        const hash = CryptoJS.HmacSHA256(serverSeed.current, clientSeed)
            .toString(CryptoJS.enc.Hex);
        targetValue.current = getPoint(hash);

        const incrementX = 0.01;
        let incrementY = 1.0006;

        intervalRef.current = setInterval(() => {
            setDataPoints((pts) => {
                const last = pts[pts.length - 1];
                const newX = last.x + incrementX;
                const newY = last.y * incrementY;
                incrementY *= 1.000001;

                multCbRef.current?.(newY);

                if (newY >= targetValue.current && !hasCrashed.current) {
                    hasCrashed.current = true;
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;

                    setFinalValue(targetValue.current);
                    crashCbRef.current?.(targetValue.current);

                    setIsCooldown(true);
                    setTimeout(() => setIsCooldown(false), 5000);
                }
                return [...pts, { x: newX, y: newY }];
            });
        }, 10);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [gamePhase]);

    const currentX = dataPoints[dataPoints.length - 1]?.x ?? 0;
    const currentY = dataPoints[dataPoints.length - 1]?.y ?? 1;

    /* gráfico -------------------------------------------------------------- */
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
                label: 'Current Position',
                data: [dataPoints[dataPoints.length - 1]],
                backgroundColor: '#ff0050',
                borderColor: '#ff0050',
                pointRadius: 6,
            },
        ],
    };

    const options = {
        scales: {
            x: { type: 'linear', min: 0, max: Math.max(5, currentX * 1.1) },
            y: { type: 'linear', min: 1, max: Math.max(1.3, currentY * 1.1) },
        },
        animation: { duration: 0 },
        plugins: {
            canvas_bg: { color: '#0d1117' },
            legend: { display: false },
            annotation: {
                annotations: {
                    textLabel: {
                        type: 'label',
                        position: 'top',
                        content: () => {
                            if (gamePhase === 'betting')
                                return [`${countdown.toFixed(1)}s`, 'APOSTE!'];
                            if (isCooldown && finalValue !== null)
                                return [`${finalValue.toFixed(2)}X`, 'CRASHED'];
                            return `${currentY.toFixed(2)}X`;
                        },
                        backgroundColor: () => {
                            if (gamePhase === 'betting')
                                return 'rgba(0,123,255,0.85)';
                            return isCooldown
                                ? 'rgba(255,0,0,0.85)'
                                : 'rgba(40,40,40,0.85)';
                        },
                        color: '#fff',
                        borderRadius: 8,
                        padding: 25,
                        font: { size: 32, weight: 'bold', family: 'Arial' },
                    },
                },
            },
        },
    };

    /* render --------------------------------------------------------------- */
    return (
        <div className="crash-game" style={{ color: 'white' }}>
            <div className="panel-light chart-wrapper">
                {/* toast verde sobreposto */}
                {payoutInfo && (
                    <div className="payout-toast">
                        <div className="payout-mult">X{payoutInfo.mult.toFixed(2)}</div>
                        <div className="payout-amount">
                            VOCÊ&nbsp;GANHOU&nbsp;R$&nbsp;{payoutInfo.amount.toFixed(2)}
                        </div>
                    </div>
                )}

                <div className="chart-container">
                    <Line data={data} options={options} />
                </div>
            </div>

            <div className="last-games-container">
                <h3>Últimos 10 Jogos</h3>
                <div className="panel-light history-bar">
                    {lastGames.map((v, i) => (
                        <div key={i}
                            className={`crash-history ${v > 2 ? 'crash-green' : ''}`}>
                            <span className="crash-value">{v.toFixed(2)}X</span>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={() => setCurrentGame('simulateCrashGames')}>
                Simular Jogos de Crash
            </button>
        </div>
    );
};

export default CrashGame;
