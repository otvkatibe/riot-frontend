/**
 * Componente para exibir um card de campeão com informações básicas
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.champ - Dados do campeão
 * @param {Function} props.onClick - Função de clique no card
 * @param {Number} props.index - Posição do campeão na lista
 */
export default function ChampionCard({ champ, onClick, index }) {
  return (
    <div className="champion-card" onClick={onClick}>
      {/* Imagem do campeão usando a API do Data Dragon */}
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${champ.championIcon}.png`}
        alt={champ.nome}
        loading="lazy"
      />
      <h3>
        {index !== undefined ? `${index + 1}.` : ''} {champ.nome}
      </h3>
      <p>Pontos: {champ.championPoints.toLocaleString()}</p>
    </div>
  );
}