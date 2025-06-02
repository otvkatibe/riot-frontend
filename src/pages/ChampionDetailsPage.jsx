import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/ChampionDetailsPage.css';

export default function ChampionDetailsPage() {
  const { championId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [championDetails, setChampionDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const nome = searchParams.get('nome');
        const tag = searchParams.get('tag');

        if (!nome || !tag) {
          throw new Error('Nome e tag são obrigatórios');
        }

        // Buscar dados do campeão e estatísticas em paralelo
        const [detailsRes, championRes] = await Promise.all([
          fetch(`https://riot-backend.vercel.app/riot/champion-stats?nome=${encodeURIComponent(nome)}&tag=${encodeURIComponent(tag)}&champion=${championId}`),
          fetch(`https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion/${championId}.json`)
        ]);

        if (!detailsRes.ok) {
          const errorData = await detailsRes.json();
          throw new Error(errorData.message || 'Erro ao buscar estatísticas');
        }

        if (!championRes.ok) {
          throw new Error('Erro ao buscar dados do campeão');
        }

        const statsData = await detailsRes.json();
        const championData = await championRes.json();

        setStats(statsData);
        setChampionDetails(championData.data[championId]);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [championId, location.search]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="champion-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        Voltar
      </button>

      <div className="champion-header">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${championId}.png`}
          alt={championDetails?.name || championId}
          className="champion-image"
        />
        <div className="champion-info">
          <h1>{championDetails?.name || championId}</h1>
          <p className="champion-title">{championDetails?.title}</p>
        </div>
      </div>

      <div className="stats-section">
        <h2>Estatísticas Recentes</h2>
        <div className="stats-grid">
          <div className="stat-card winrate">
            <h3>Win Rate</h3>
            <div className="stat-value">
              {stats.total > 0 ? ((stats.vitorias / stats.total) * 100).toFixed(1) : 0}%
            </div>
            <div className="stat-detail">
              {stats.vitorias}V / {stats.total - stats.vitorias}D
            </div>
          </div>

          <div className="stat-card kda">
            <h3>KDA Médio</h3>
            <div className="stat-value">
              {stats.total > 0 ? ((stats.totalKills + stats.totalAssists) / stats.totalDeaths).toFixed(2) : 0}
            </div>
            <div className="stat-detail">
              {stats.totalKills}K / {stats.totalDeaths}D / {stats.totalAssists}A
            </div>
          </div>

          <div className="stat-card cs">
            <h3>CS por Minuto</h3>
            <div className="stat-value">
              {stats.total > 0 ? (stats.totalCS / stats.totalGameDuration).toFixed(1) : 0}
            </div>
            <div className="stat-detail">
              {stats.totalCS} CS total
            </div>
          </div>
        </div>
      </div>

      <div className="matches-section">
        <h2>Partidas Recentes</h2>
        {stats.matches.length > 0 ? (
          <div className="matches-list">
            {stats.matches.map((match, index) => (
              <div key={index} className={`match-card ${match.win ? 'victory' : 'defeat'}`}>
                <div className="match-result">
                  {match.win ? 'Vitória' : 'Derrota'}
                </div>
                <div className="match-details">
                  <div className="match-stats">
                    <div className="kda">
                      {match.kills}/{match.deaths}/{match.assists}
                      <span className="kda-ratio">
                        (KDA: {((match.kills + match.assists) / Math.max(match.deaths, 1)).toFixed(2)})
                      </span>
                    </div>
                    <div className="cs">
                      {match.totalCS} CS ({Math.round(match.totalCS / (match.gameDuration / 60))}/min)
                    </div>
                    <div className="lane">
                      {match.lane} ({match.role})
                    </div>
                  </div>
                  <div className="match-duration">
                    {Math.floor(match.gameDuration / 60)}:{String(match.gameDuration % 60).padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-matches">Nenhuma partida recente encontrada com este campeão</p>
        )}
      </div>
    </div>
  );
}