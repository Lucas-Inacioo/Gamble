import React, { useState } from 'react';
import CrashGame from '../Crash/CrashGame/CrashGame';
import CrashPlayMenu from '../Crash/CrashPlayMenu/CrashPlayMenu';
import SimulateCrashGames from '../Crash/GameSimulation/GameSimulation';

const HomePage = () => {
  const [currentGame, setCurrentGame] = useState(null);

  // Shared states between play menu and CrashGame
  const [betMode, setBetMode] = useState('Normal');
  const [betAmount, setBetAmount] = useState(5);
  const [autoRetire, setAutoRetire] = useState(2);

  // Function to trigger the start of the game.
  const handleStartGame = () => {
    console.log('Iniciando jogo com:', { betMode, betAmount, autoRetire });
  };

  return (
    <div className="homepage">
      <aside className="menu-lateral">
        <h2>Menu de Jogos</h2>
        <ul>
          <li>
            <button onClick={() => setCurrentGame('Crash')}>Crash</button>
          </li>
          {/* Outros jogos futuros */}
        </ul>
      </aside>

      <main className="conteudo-principal">
        {currentGame === 'Crash' && (
          <div className="crash-container">
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
              />
            </div>
          </div>
        )}

        {currentGame === 'simulateCrashGames' && <SimulateCrashGames />}
      </main>
    </div>
  );
};

export default HomePage;
