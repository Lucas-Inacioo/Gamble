import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

import './SimulateCrashGames.css';

const clientSeed =
    "0000000000000000000415ebb64b0d51ccee0bb55826e43846e5bea777d91966";

function getPoint(hash) {
    const divisible = (hash, mod) => {
        let val = 0;
        let o = hash.length % 4;
        for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
            val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
        }
        return val === 0;
    };

    if (divisible(hash, 15)) return 0;

    let h = parseInt(hash.slice(0, 52 / 4), 16);
    let e = Math.pow(2, 52);
    return Math.floor((100 * e - h) / (e - h)) / 100;
}

const SimulateCrashGames = () => {
    const [valorApostado, setValorApostado] = useState('');
    const [multiplicadorRetirada, setMultiplicadorRetirada] = useState('');
    const [numJogos, setNumJogos] = useState('');
    const [resultados, setResultados] = useState([]);
    const [totalApostadoAcumulado, setTotalApostadoAcumulado] = useState(0);
    const [totalRestanteAcumulado, setTotalRestanteAcumulado] = useState(0);

    const iniciarSimulacao = () => {
        const aposta = parseFloat(valorApostado);
        const multiplicador = parseFloat(multiplicadorRetirada);
        const jogos = parseInt(numJogos, 10);

        if (isNaN(aposta) || isNaN(multiplicador) || isNaN(jogos) || jogos <= 0) {
            alert("Por favor, insira valores válidos em todos os campos.");
            return;
        }

        const resultadosSimulacao = [];
        let totalRestante = 0;
        const totalApostado = aposta * jogos;

        for (let i = 0; i < jogos; i++) {
            // Gera um seed aleatório para o servidor e calcula o crash point
            const serverSeed = Math.random().toString(36).substring(2, 15);
            const hash = CryptoJS.HmacSHA256(serverSeed, clientSeed).toString(CryptoJS.enc.Hex);
            const crashPoint = getPoint(hash);

            let dinheiroRestante = 0;
            let resultado = "";
            // Se o multiplicador de retirada for maior que o crash point, o jogo crasha antes de retirar
            if (multiplicador > crashPoint) {
                dinheiroRestante = 0;
                resultado = "Explodiu";
            } else {
                // Caso contrário, o jogador retira com sucesso e recebe a aposta multiplicada
                dinheiroRestante = aposta * multiplicador;
                resultado = "Retirado";
            }
            totalRestante += dinheiroRestante;
            resultadosSimulacao.push({
                jogo: i + 1,
                crashPoint: crashPoint.toFixed(2),
                multiplicadorRetirada: multiplicador.toFixed(2),
                resultado,
                dinheiroRestante: dinheiroRestante.toFixed(2)
            });
        }

        // Atualiza os totais acumulados
        setTotalApostadoAcumulado(totalApostadoAcumulado + totalApostado);
        setTotalRestanteAcumulado(totalRestanteAcumulado + totalRestante);

        setResultados(resultadosSimulacao);
    };

    return (
        <div className="simulate-crash-games">
            <h2>Simular Crash Games</h2>
            <div>
                <label htmlFor="valorApostado">Valor Apostado:</label>
                <input
                    type="number"
                    id="valorApostado"
                    value={valorApostado}
                    onChange={(e) => setValorApostado(e.target.value)}
                    placeholder="Insira o valor apostado"
                />
            </div>
            <div>
                <label htmlFor="multiplicadorRetirada">Multiplicador de Retirada:</label>
                <input
                    type="number"
                    id="multiplicadorRetirada"
                    value={multiplicadorRetirada}
                    onChange={(e) => setMultiplicadorRetirada(e.target.value)}
                    placeholder="Insira o multiplicador para retirar"
                />
            </div>
            <div>
                <label htmlFor="numJogos">Número de Jogos para Simular:</label>
                <input
                    type="number"
                    id="numJogos"
                    value={numJogos}
                    onChange={(e) => setNumJogos(e.target.value)}
                    placeholder="Insira o número de jogos"
                />
            </div>
            <button onClick={iniciarSimulacao}>Iniciar Simulação</button>

            <div className="simulation-summary">
                <p><strong>Total apostado:</strong> {totalApostadoAcumulado.toFixed(2)}</p>
                <p><strong>Total restante:</strong> {totalRestanteAcumulado.toFixed(2)}</p>
            </div>

            {resultados.length > 0 && (
                <div className="simulation-results">
                    <h3>Resultados da Simulação</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Jogo</th>
                                <th>Crash Point</th>
                                <th>Multiplicador de Retirada</th>
                                <th>Resultado</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((res, index) => (
                                <tr key={index}>
                                    <td>{res.jogo}</td>
                                    <td>{res.crashPoint}</td>
                                    <td>{res.multiplicadorRetirada}</td>
                                    <td>{res.resultado}</td>
                                    <td>{res.dinheiroRestante}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SimulateCrashGames;
