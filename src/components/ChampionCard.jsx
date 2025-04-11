// src/components/ChampionCard.jsx
import React from 'react'

/**
 * Componente para exibir um card de campeão com informações básicas
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.champ - Dados do campeão
 * @param {Function} props.onClick - Função de clique no card
 */
export default function ChampionCard({ champ, onClick }) {
  return (
    <li className="champion-item">
      <button 
        className="champion-link" 
        onClick={onClick}
        aria-label={`Ver detalhes de ${champ.nome}`}
      >
        {/* Imagem do campeão usando a API do Data Dragon */}
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.championIcon}.png`}
          alt={champ.nome}
          className="champion-icon"
          loading="lazy"
        />
        <div>
          <h3>{champ.nome}</h3>
          <p>Posição: {champ.posicao}º</p>
          <p>Pontos: {champ.championPoints.toLocaleString()}</p>
        </div>
      </button>
    </li>
  )
}