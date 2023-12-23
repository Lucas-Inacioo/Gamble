import React, { useState } from 'react';
import CrashGraph from '../Crash/CrashGraph/CrashGraph';
import CrashGame from '../Crash/CrashGame/CrashGame';

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
          {/* Adicione mais jogos aqui */}
        </ul>
      </aside>

      <main className="conteudo-principal">
        {currentGame === 'Crash' && (
          <section className="simulacao-jogo">
            <h2>Simulação de Jogo: Crash</h2>
            <CrashGame />
          </section>
        )}

        <section className="resumo-valores">
          <h2>Resumo</h2>
          <p>Valores Apostados: R$0</p>
          <p>Ganhos: R$0</p>
          <p>Perdidos: R$0</p>
          <p>Retorno a cada R$100 gastos: R$0</p>
          <button>Explicação Matemática</button>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
