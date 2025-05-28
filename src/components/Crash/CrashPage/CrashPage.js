import React, { useState } from 'react';
import CrashGame from '../CrashGame/CrashGame';
import CrashPlayMenu from '../CrashPlayMenu/CrashPlayMenu';

const CrashPage = ({ setCurrentGame }) => {
    // Shared states between play menu and CrashGame
    const [betMode, setBetMode] = useState('Normal');
    const [betAmount, setBetAmount] = useState(50);
    const [autoRetire, setAutoRetire] = useState(2);

    // Função para apostar na próxima rodada
    const handleStartGame = () => {
        console.log('Iniciando jogo com:', { betMode, betAmount, autoRetire });
    };

    return (
        <>
            {/* Left bar: Play menu (only for Crash) */}
            <div className="left-bar">
                <CrashPlayMenu
                    betMode={betMode}
                    setBetMode={setBetMode}
                    betAmount={betAmount}
                    setBetAmount={setBetAmount}
                    autoRetire={autoRetire}
                    setAutoRetire={setAutoRetire}
                    onStartGame={handleStartGame}
                />
            </div>

            {/* Right bar: CrashGame rendering */}
            <div className="right-bar">
                <CrashGame
                    betMode={betMode}
                    betAmount={betAmount}
                    autoRetire={autoRetire}
                    setCurrentGame={setCurrentGame}
                    onStartGame={handleStartGame}
                />
            </div>
        </>
    );
    
}

export default CrashPage;