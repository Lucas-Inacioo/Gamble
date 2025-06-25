import React, {
    useState,
    useCallback,
    useRef,
    useEffect,
} from 'react';
import CrashPlayMenu from '../CrashPlayMenu/CrashPlayMenu';
import { useBalance } from '../../../contexts/BalanceContext';
import CrashGame, { getPoint } from '../CrashGame/CrashGame';
import CryptoJS from 'crypto-js';

import './CrashPage.css';

const BETTING_TIME = 5; // betting time (s)
const RESULT_TIME = 5; // result display time (s)

const CrashPage = ({ setCurrentGame }) => {
    const { balance, setBalance } = useBalance();

    const [betMode, setBetMode] = useState('Normal');
    const [betAmount, setBetAmount] = useState(50);
    const [autoRetire, setAutoRetire] = useState(2);

    const [bet, setBet] = useState(null); // { amount, autoRetire }

    /* Phases: betting → active → result */
    const [gamePhase, setGamePhase] = useState('betting');
    const [gameKey, setGameKey] = useState(0); // Forces re-render on new game
    const [countdown, setCountdown] = useState(BETTING_TIME);

    const [lastGames, setLastGames] = useState([]); // Crash history

    const [payoutInfo, setPayoutInfo] = useState(null);

    const currentMultRef = useRef(1);
    const cashedOutRef = useRef(false);

    /* ------------ COUNTDOWN ------------ */
    useEffect(() => {
        let tick;
        if (gamePhase === 'betting') {
            setCountdown(BETTING_TIME);
            tick = setInterval(() => {
                setCountdown((c) => {
                    if (c <= 0.1) {
                        clearInterval(tick);
                        return 0;
                    }
                    return +(c - 0.1).toFixed(1);
                });
            }, 100);
        }
        return () => clearInterval(tick);
    }, [gamePhase]);

    /* --------------- PHASE TIMERS --------------- */
    useEffect(() => {
        let timer;
        if (gamePhase === 'betting') {
            timer = setTimeout(() => {
                setGamePhase('active');
                setGameKey((k) => k + 1); // New Round
            }, BETTING_TIME * 1000);
        } else if (gamePhase === 'result') {
            timer = setTimeout(() => {
                setGamePhase('betting'); // Open betting phase again
            }, RESULT_TIME * 1000);
        }
        return () => clearTimeout(timer);
    }, [gamePhase]);

    useEffect(() => {
        if (gamePhase === 'betting') setPayoutInfo(null);
    }, [gamePhase]);

    /* ---------------- BETTING ---------------- */
    const placeBet = () => {
        if (gamePhase !== 'betting' || bet) return;
        if (balance < betAmount) {
            alert('Saldo insuficiente.');
            return;
        }
        setBalance((b) => b - betAmount);
        setBet({ amount: betAmount, autoRetire });
        cashedOutRef.current = false;
        setPayoutInfo(null); // Clean previous toast info
    };

    /* ---------------- CASH OUT ---------------- */
    const cashOut = useCallback(
        (mult) => {
            if (!bet || cashedOutRef.current || gamePhase !== 'active') return;

            mult = Math.round(mult * 100) / 100;

            const winnings = bet.amount * mult;
            setBalance((b) => b + winnings);
            setBet(null);
            cashedOutRef.current = true;

            /* Register info for toast */
            setPayoutInfo({ mult, amount: winnings });
        },
        [bet, gamePhase, setBalance]
    );

    /* ------------------ FILL HISTORY ------------------ */
    useEffect(() => {
        // If there is already a history of last games, do not fill it again
        if (lastGames.length) return;

        const clientSeed = "0000000000000000000415ebb64b0d51ccee0bb55826e43846e5bea777d91966";

        const initialHistory = Array.from({ length: 10 }, () => {
            const serverSeed = Math.random().toString(36).substring(2, 15);
            const hash = CryptoJS.HmacSHA256(serverSeed, clientSeed).toString(CryptoJS.enc.Hex);
            const value = getPoint(hash);
            return +value.toFixed(2); // 2 decimal places
        });
        setLastGames(initialHistory);
    }, [lastGames.length]);

    /* ----------- GAME CALLBACKS ----------- */
    const onMultiplierChange = useCallback(
        (mult) => {
            currentMultRef.current = mult;
            if (bet && !cashedOutRef.current && mult >= bet.autoRetire) cashOut(mult);
        },
        [bet, cashOut]
    );

    const onCrash = useCallback(
        (crashValue) => {
            setGamePhase('result');
            setBet(null);

            setLastGames((prev) =>
                prev.length >= 10 ? [...prev.slice(1), crashValue] : [...prev, crashValue]
            );
        },
        [setGamePhase, setLastGames]
    );

    return (
        <>
            <div className="left-bar panel-light">
                <CrashPlayMenu
                    betMode={betMode}
                    setBetMode={setBetMode}
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    autoRetire={autoRetire}
                    setAutoRetire={setAutoRetire}
                    gamePhase={gamePhase}
                    betPlaced={!!bet}
                    onPlaceBet={placeBet}
                    onCashOut={() => cashOut(currentMultRef.current)}
                />
            </div>

            <div className="right-bar">
                <CrashGame
                    key={gameKey}
                    betMode={betMode}
                    betAmount={betAmount}
                    autoRetire={autoRetire}
                    setCurrentGame={setCurrentGame}
                    gamePhase={gamePhase}
                    countdown={countdown}
                    lastGames={lastGames}
                    payoutInfo={payoutInfo}
                    onMultiplierChange={onMultiplierChange}
                    onCrash={onCrash}
                />
            </div>
        </>
    );
};

export default CrashPage;
