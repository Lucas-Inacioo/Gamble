import React from 'react';
import { useBalance } from '../../../contexts/BalanceContext';
import './CrashPlayMenu.css';

const CrashPlayMenu = ({
  betMode,
  setBetMode,
  betAmount,
  setBetAmount,
  autoRetire,
  setAutoRetire,
  gamePhase,     // 'betting' | 'active' | 'result'
  betPlaced,
  onPlaceBet,
  onCashOut,
}) => {
  const { balance } = useBalance();

  const handleModeChange = (mode) => setBetMode(mode);
  const handleBetAmountChange = (e) => setBetAmount(Number(e.target.value));
  const handleAutoRetireChange = (e) => setAutoRetire(Number(e.target.value));

  const renderActionButton = () => {
    /* janela de apostas */
    if (gamePhase === 'betting') {
      if (betPlaced) {
        return (
          <button className="start-button" disabled>
            Aguardando...
          </button>
        );
      }
      return (
        <button className="start-button" onClick={onPlaceBet}>
          Fazer aposta
        </button>
      );
    }

    /* jogo em andamento */
    if (gamePhase === 'active' && betPlaced) {
      return (
        <button className="start-button" onClick={onCashOut}>
          Retirar
        </button>
      );
    }

    /* todas as demais situações */
    return (
      <button className="start-button" disabled>
        Aguarde...
      </button>
    );
  };

  return (
    <div className="bet-controls play-menu">
      <p>
        <strong>Saldo:</strong> R$ {balance.toFixed(2)}
      </p>

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

      {renderActionButton()}
    </div>
  );
};

export default CrashPlayMenu;
