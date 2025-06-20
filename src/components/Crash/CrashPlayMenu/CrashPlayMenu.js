import React from 'react';
import './CrashPlayMenu.css';

const CrashPlayMenu = ({
  betMode,
  setBetMode,
  betAmount,
  setBetAmount,
  autoRetire,
  setAutoRetire,
  onStartGame,
}) => {
  const handleModeChange = (mode) => {
    setBetMode(mode);
  };

  const handleBetAmountChange = (e) => {
    setBetAmount(Number(e.target.value));
  };

  const handleAutoRetireChange = (e) => {
    setAutoRetire(Number(e.target.value));
  };

  return (
    <div className="panel-light play-menu">
      <div className="bet-controls">
        <div className="bet-mode">
          <button
            className={`mode-button ${betMode === 'Normal' ? 'active' : ''}`}
            onClick={() => handleModeChange('Normal')}
          >
            Normal
          </button>
          <button
            className={`mode-button ${betMode === 'Auto' ? 'active' : ''}`}
            onClick={() => handleModeChange('Auto')}
          >
            Auto
          </button>
        </div>

        <div className="bet-amount">
          <label htmlFor="betValue">Quantidade</label>
          <div className="amount-input">
            <input
              id="betValue"
              type="number"
              value={betAmount}
              onChange={handleBetAmountChange}
              placeholder="R$ 5"
            />
            <button onClick={() => setBetAmount(betAmount / 2)}>1/2</button>
            <button onClick={() => setBetAmount(betAmount * 2)}>x2</button>
          </div>
        </div>

        <div className="auto-retirar">
          <label htmlFor="autoRetirar">Auto Retirar (Multiplicador)</label>
          <input
            id="autoRetirar"
            type="number"
            value={autoRetire}
            onChange={handleAutoRetireChange}
            placeholder="2x"
          />
        </div>

        <button className="start-button" onClick={onStartGame}>
          Começar o jogo
        </button>
      </div>
    </div>
  );
};

export default CrashPlayMenu;
