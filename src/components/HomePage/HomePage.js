import React, { useState } from 'react';
import CrashPage from '../Crash/CrashPage/CrashPage';
import SimulateCrashGames from '../Crash/SimulateCrashGames/SimulateCrashGames';
import Menu from '../Menu/Menu';
import { FaRocket } from 'react-icons/fa';
import { GiDiceSixFacesFive, GiCardPick } from 'react-icons/gi';
import './HomePage.css';

const games = [
  { id: 'Crash', label: 'Crash', icon: <FaRocket /> },
  { id: 'Double', label: 'Double', icon: <GiCardPick /> },
  { id: 'Dice', label: 'Dice', icon: <GiDiceSixFacesFive /> },
];

const HomePage = () => {
  const [currentGame, setCurrentGame] = useState(null);

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
        {!currentGame && (
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