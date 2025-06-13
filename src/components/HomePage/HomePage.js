import React, { useState } from 'react';
import CrashPage from '../Crash/CrashPage/CrashPage';
import SimulateCrashGames from '../Crash/SimulateCrashGames/SimulateCrashGames';
import './HomePage.css';

const HomePage = () => {
  const [currentGame, setCurrentGame] = useState(null);

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
            <CrashPage setCurrentGame={setCurrentGame} />
          </div>
        )}

        {currentGame === 'simulateCrashGames' && <SimulateCrashGames />}
      </main>
    </div>
  );
};

export default HomePage;
