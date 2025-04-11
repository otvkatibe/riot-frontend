import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChampionCard from '../components/ChampionCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import "../styles/Home.css";

export default function HomePage() {
  const [formData, setFormData] = useState({ nome: '', tag: '' });
  const [masteryData, setMasteryData] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlayerInfo(null);
    setMasteryData(null);

    try {
      // 1. Busca PUUID
      const puuidResponse = await fetch(
        `https://riot-backend.vercel.app/api/puuid?nome=${encodeURIComponent(formData.nome)}&tag=${encodeURIComponent(formData.tag)}`
      );

      if (!puuidResponse.ok) {
        const errorData = await puuidResponse.json();
        throw new Error(errorData.error || 'Erro ao buscar conta do jogador');
      }

      const { puuid } = await puuidResponse.json();

      // 2. Busca informações do perfil
      const profileResponse = await fetch(
        `https://riot-backend.vercel.app/api/perfil?puuid=${puuid}`
      );

      if (!profileResponse.ok) {
        throw new Error('Erro ao buscar perfil do jogador');
      }

      const profileData = await profileResponse.json();
      setPlayerInfo(profileData);

      // 3. Busca dados de maestria
      const masteryResponse = await fetch(
        `https://riot-backend.vercel.app/api/dados?nome=${encodeURIComponent(formData.nome)}&tag=${encodeURIComponent(formData.tag)}&tipo=maestria`
      );

      if (!masteryResponse.ok) {
        throw new Error('Erro ao buscar dados de maestria');
      }

      const { dados } = await masteryResponse.json();
      setMasteryData(dados);

    } catch (err) {
      setError(err.message || 'Erro ao buscar dados');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChampionClick = (championId) => {
    navigate(`/champion/${championId}?nome=${formData.nome}&tag=${formData.tag}`);
  };

  return (
    <div className="home-container">
      <h1>Consultar Maestria de Campeões</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Nome do invocador"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          required
          className="search-input"
        />
        <input
          type="text"
          placeholder="Tag (ex: BR1)"
          value={formData.tag}
          onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
          required
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {playerInfo && (
        <div className="player-profile">
          <div className="profile-header">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${playerInfo.profileIconId}.png`}
              alt="Ícone do invocador"
              className="profile-icon"
            />
            <div className="profile-info">
              <h2>{playerInfo.name}</h2>
              <p>Nível {playerInfo.summonerLevel}</p>
              
              {playerInfo.ranks && (
                <div className="rank-container">
                  {playerInfo.ranks.soloDuo && (
                    <div className="rank-card">
                      <h3>{playerInfo.ranks.soloDuo.queueType}</h3>
                      <p className="rank-tier">
                        {playerInfo.ranks.soloDuo.tier} {playerInfo.ranks.soloDuo.rank}
                      </p>
                      <p className="rank-lp">{playerInfo.ranks.soloDuo.leaguePoints} LP</p>
                      <p className="win-loss">
                        {playerInfo.ranks.soloDuo.wins}V / {playerInfo.ranks.soloDuo.losses}D
                      </p>
                    </div>
                  )}

                  {playerInfo.ranks.flex && (
                    <div className="rank-card">
                      <h3>{playerInfo.ranks.flex.queueType}</h3>
                      <p className="rank-tier">
                        {playerInfo.ranks.flex.tier} {playerInfo.ranks.flex.rank}
                      </p>
                      <p className="rank-lp">{playerInfo.ranks.flex.leaguePoints} LP</p>
                      <p className="win-loss">
                        {playerInfo.ranks.flex.wins}V / {playerInfo.ranks.flex.losses}D
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {masteryData && (
        <div className="mastery-results">
          <h2>Top 10 Maestrias</h2>
          <div className="champion-grid">
            {masteryData.map((champ) => (
              <ChampionCard
                key={champ.championIcon}
                champ={champ}
                onClick={() => handleChampionClick(champ.championIcon)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}