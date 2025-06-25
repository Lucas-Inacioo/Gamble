import React, { useState } from 'react';
import CrashPage from '../Crash/CrashPage/CrashPage';
import SimulateCrashGames from '../Crash/SimulateCrashGames/SimulateCrashGames';
import Menu, { games } from '../Menu/Menu';
import './HomePage.css';

const HomePage = () => {
  const [currentGame, setCurrentGame] = useState('mainPage');

  return (
    <div className="homepage">
      <aside className="menu-lateral">
        <ul>
          {games.map(game => (
            <li key={game.id}>
              <button
                className={`menu-btn ${currentGame === game.id ? 'active' : ''
                  }`}
                onClick={() => setCurrentGame(game.id)}
              >
                {game.icon}
                <span>{game.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-page">
        {/* Main Page */}
        {currentGame === 'mainPage' && (
          <div className="menu">
            <Menu setCurrentGame={setCurrentGame} />
          </div>
        )}

        {/* Crash */}
        {currentGame === 'crash' && (
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