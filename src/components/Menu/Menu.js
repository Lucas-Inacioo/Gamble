import React from 'react';
import { FaRocket } from 'react-icons/fa';
import { GiCardPick, GiDiceSixFacesFive } from 'react-icons/gi';
import './Menu.css';

/**
 * Landing menu shown on first access.
 * This component displays a grid of game options
 * with icons, titles, descriptions, and a button to play.
 */
const games = [
  {
    id: 'crash',
    label: 'Crash',
    description: 'Multiplicador cresce até estourar. Teste sua intuição!',
    icon: <FaRocket />,
  },
  {
    id: 'double',
    label: 'Double',
    description: 'Acerte a cor sorteada (vermelho ou preto) e dobre a aposta.',
    icon: <GiCardPick />,
  },
  {
    id: 'dice',
    label: 'Dice',
    description: 'Role o dado virtual e aposte no resultado.',
    icon: <GiDiceSixFacesFive />,
  },
];

function Menu({ setCurrentGame }) {
  return (
    <main className="landing">
      <section className="hero">
        <h1 className="hero-title">Simulador de Apostas</h1>
        <p className="hero-text">
          Este site é um <strong>simulador</strong> — não envolve dinheiro real.  
          O objetivo é facilitar o estudo de <em>probabilidade</em>, 
          <em>estatística</em> e gestão de risco, ajudando na conscientização
          sobre como funcionam os jogos de azar <strong>(e o porquê você não deve apostar)</strong>.
        </p>
      </section>

      <section className="games-grid">
        {games.map(({ id, label, description, icon }) => (
          <div key={id} className="game-card">
            <div className="game-icon">{icon}</div>
            <h3 className="game-title">{label}</h3>
            <p className="game-desc">{description}</p>
            <button
              type="button"
              className="play-button"
              onClick={() => setCurrentGame(id)}
            >
              Jogar
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default Menu;