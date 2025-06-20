import React, {
    useState,
    useCallback,
    useRef,
    useEffect,
} from 'react';
import CrashGame from '../CrashGame/CrashGame';
import CrashPlayMenu from '../CrashPlayMenu/CrashPlayMenu';
import { useBalance } from '../../../contexts/BalanceContext';

import './CrashPage.css';

const BETTING_TIME = 5;   // tempo para apostar (s)
const RESULT_TIME = 5;   // tempo exibindo resultado (s)

const CrashPage = ({ setCurrentGame }) => {
    const { balance, setBalance } = useBalance();

    const [betMode, setBetMode] = useState('Normal');
    const [betAmount, setBetAmount] = useState(50);
    const [autoRetire, setAutoRetire] = useState(2);

    const [bet, setBet] = useState(null);              // { amount, autoRetire }

    /* fases: betting → active → result */
    const [gamePhase, setGamePhase] = useState('betting');
    const [gameKey, setGameKey] = useState(0);         // força re-montagem do CrashGame
    const [countdown, setCountdown] = useState(BETTING_TIME);

    const [lastGames, setLastGames] = useState([]);    // histórico de crash

    const currentMultRef = useRef(1);
    const cashedOutRef = useRef(false);

    /* ------------ CONTAGEM REGRESSIVA ------------ */
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

    /* --------------- TIMERS DE FASE --------------- */
    useEffect(() => {
        let timer;
        if (gamePhase === 'betting') {
            timer = setTimeout(() => {
                setGamePhase('active');
                setGameKey((k) => k + 1);       // nova rodada
            }, BETTING_TIME * 1000);
        } else if (gamePhase === 'result') {
            timer = setTimeout(() => {
                setGamePhase('betting');        // abre nova janela de apostas
            }, RESULT_TIME * 1000);
        }
        return () => clearTimeout(timer);
    }, [gamePhase]);

    /* ---------------- APOSTAR ---------------- */
    const placeBet = () => {
        /* já apostou ou não está na janela de apostas? */
        if (gamePhase !== 'betting' || bet) return;

        if (balance < betAmount) {
            alert('Saldo insuficiente.');
            return;
        }

        setBalance((b) => b - betAmount);              // debita
        setBet({ amount: betAmount, autoRetire });     // registra aposta
        cashedOutRef.current = false;                  // libera para 1º cash-out
    };

    /* ---------------- RETIRAR ---------------- */
    const cashOut = useCallback(
        (mult) => {
            if (!bet || cashedOutRef.current || gamePhase !== 'active') return;

            // Round multiplier to 2 decimal places
            mult = Math.round(mult * 100) / 100;

            const winnings = bet.amount * mult;
            setBalance((b) => +(b + winnings).toFixed(2));
            setBet(null);

            cashedOutRef.current = true;
        },
        [bet, gamePhase, setBalance]
    );

    /* ----------- CALLBACKS DO JOGO ----------- */
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
                    key={gameKey}                  /* remonta a cada rodada */
                    betMode={betMode}
                    betAmount={betAmount}
                    autoRetire={autoRetire}
                    setCurrentGame={setCurrentGame}
                    gamePhase={gamePhase}
                    countdown={countdown}
                    lastGames={lastGames}          /* histórico persistente */
                    onMultiplierChange={onMultiplierChange}
                    onCrash={onCrash}
                />
            </div>
        </>
    );
};

export default CrashPage;
