import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChampionCard from '../components/ChampionCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import "../styles/Home.css";

export default function HomeLoggedPage() {
  const [formData, setFormData] = useState({ nome: '', tag: '' });
  const [masteryData, setMasteryData] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favError, setFavError] = useState(null);
  const [favMessage, setFavMessage] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlayerInfo(null);
    setMasteryData(null);

    try {
      const puuidResponse = await fetch(
        `https://riot-backend.vercel.app/riot/puuid?nome=${encodeURIComponent(formData.nome)}&tag=${encodeURIComponent(formData.tag)}`
      );

      if (!puuidResponse.ok) {
        const errorData = await puuidResponse.json();
        if (puuidResponse.status === 500) {
          throw new Error('Não foi possível encontrar o jogador. Verifique se o nome e a tag estão corretos ou tente novamente mais tarde.');
        }
        throw new Error(errorData.message || 'Erro ao buscar conta do jogador');
      }

      const { puuid } = await puuidResponse.json();

      const profileResponse = await fetch(
        `https://riot-backend.vercel.app/riot/profile?puuid=${puuid}`
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Erro ao buscar perfil do jogador');
      }

      const profileData = await profileResponse.json();
      setPlayerInfo(profileData);

      const masteryResponse = await fetch(
        `https://riot-backend.vercel.app/riot/maestria?nome=${encodeURIComponent(formData.nome)}&tag=${encodeURIComponent(formData.tag)}`
      );

      if (!masteryResponse.ok) {
        const errorData = await masteryResponse.json();
        throw new Error(errorData.message || 'Erro ao buscar dados de maestria');
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

  // Buscar favoritos
  const fetchFavorites = async () => {
    setFavError(null);
    try {
      const res = await fetch('https://riot-backend.vercel.app/riot/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao buscar favoritos');
      setFavorites(data);
    } catch (err) {
      setFavError(err.message);
    }
  };

  // Favoritar player
  const handleFavorite = async () => {
    if (!playerInfo) {
      setFavError('Busque um jogador antes de favoritar!');
      setFavMessage(null);
      return;
    }
    setFavError(null);
    setFavMessage(null);

    const jaFavoritado = favorites.some(
      fav => fav.nome === playerInfo.name && fav.tag === formData.tag
    );
    if (jaFavoritado) {
      setFavError('Este jogador já está nos seus favoritos!');
      setFavMessage(null);
      return;
    }

    try {
      const res = await fetch('https://riot-backend.vercel.app/riot/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nome: playerInfo.name || formData.nome,
          tag: formData.tag,
          tipo: 'player'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setFavError(data.message || 'Este jogador já está nos seus favoritos!');
          setFavMessage(null);
          return;
        }
        throw new Error(data.message || 'Erro ao favoritar');
      }
      setFavError(null);
      setFavMessage('Jogador adicionado aos favoritos com sucesso!');
      fetchFavorites();
    } catch (err) {
      setFavError(err.message);
      setFavMessage(null);
    }
  };

  // Apagar favorito individual
  const handleDeleteFavorite = async (id) => {
    setFavError(null);
    try {
      const res = await fetch(`https://riot-backend.vercel.app/riot/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao apagar favorito');
      fetchFavorites();
    } catch (err) {
      setFavError(err.message);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/';
  };

  // Ativa modo de listar favoritos
  const handleListFavorites = () => {
    fetchFavorites();
    setShowFavorites(true);
    setDeleteMode(false);
  };

  // Ativa modo de apagar favoritos (seleção)
  const handleDeleteMode = () => {
    fetchFavorites();
    setShowFavorites(true);
    setDeleteMode(true);
  };

  // Fecha a lista de favoritos
  const handleCloseFavorites = () => {
    setShowFavorites(false);
    setDeleteMode(false);
  };

  const handleFavoriteRowClick = (fav) => {
    setFormData({ nome: fav.nome, tag: fav.tag });
    buscarPlayerFavorito(fav.nome, fav.tag);
  };

  // Função auxiliar para buscar player favorito
  const buscarPlayerFavorito = async (nome, tag) => {
    setLoading(true);
    setError(null);
    setPlayerInfo(null);
    setMasteryData(null);

    try {
      const puuidResponse = await fetch(
        `https://riot-backend.vercel.app/riot/puuid?nome=${encodeURIComponent(nome)}&tag=${encodeURIComponent(tag)}`
      );

      if (!puuidResponse.ok) {
        const errorData = await puuidResponse.json();
        if (puuidResponse.status === 500) {
          throw new Error('Não foi possível encontrar o jogador. Verifique se o nome e a tag estão corretos ou tente novamente mais tarde.');
        }
        throw new Error(errorData.message || 'Erro ao buscar conta do jogador');
      }

      const { puuid } = await puuidResponse.json();

      const profileResponse = await fetch(
        `https://riot-backend.vercel.app/riot/profile?puuid=${puuid}`
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.message || 'Erro ao buscar perfil do jogador');
      }

      const profileData = await profileResponse.json();
      setPlayerInfo(profileData);

      const masteryResponse = await fetch(
        `https://riot-backend.vercel.app/riot/maestria?nome=${encodeURIComponent(nome)}&tag=${encodeURIComponent(tag)}`
      );

      if (!masteryResponse.ok) {
        const errorData = await masteryResponse.json();
        throw new Error(errorData.message || 'Erro ao buscar dados de maestria');
      }

      const { dados } = await masteryResponse.json();
      setMasteryData(dados);

    } catch (err) {
      setError(err.message || 'Erro ao buscar dados');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
      setShowFavorites(false); // Fecha a lista ao buscar
      setDeleteMode(false);
    }
  };

  return (
    <div className="home-container">
      {/* Barra de navegação superior */}
      <nav style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #333',
        paddingBottom: '0.5rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button
            className="search-button"
            style={{ background: 'none', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, padding: 0 }}
            onClick={handleFavorite}
          >
            Favoritar Player
          </button>
          <button
            className="search-button"
            style={{ background: 'none', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, padding: 0 }}
            onClick={handleListFavorites}
          >
            Listar Favoritos
          </button>
          <button
            className="search-button"
            style={{ background: 'none', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, padding: 0 }}
            onClick={handleDeleteMode}
          >
            Apagar Favoritos
          </button>
        </div>
        <button className="search-button" style={{ background: '#ff007f', color: '#fff', marginLeft: 'auto' }} onClick={handleLogout}>Logout</button>
      </nav>

      {/* Mensagem de erro de favoritos */}
      {favError && <ErrorMessage message={favError} />}
      {favMessage && (
        <div className="success-message">
          <p>✅ {favMessage}</p>
        </div>
      )}

      {/* Lista de favoritos */}
      {showFavorites && (
        <div style={{ margin: '2rem 0' }}>
          <div style={{ textAlign: 'right', marginBottom: 8 }}>
            <button className="search-button" style={{ padding: '0.3rem 0.8rem', fontSize: '0.9em' }} onClick={handleCloseFavorites}>
              Fechar
            </button>
          </div>
          <h2 style={{ textAlign: 'center', color: '#ff007f', marginBottom: '1.5rem' }}>Players Favoritos</h2>
          <table className="favorites-table">
            <thead>
              <tr>
                <th>User</th>
                <th>#TAG</th>
                {deleteMode && <th>Ação</th>}
              </tr>
            </thead>
            <tbody>
              {favorites.map(fav => (
                <tr
                  key={fav._id}
                  style={{ cursor: !deleteMode ? 'pointer' : 'default' }}
                  onClick={!deleteMode ? () => handleFavoriteRowClick(fav) : undefined}
                  className={!deleteMode ? '' : 'no-hover'}
                >
                  <td style={{ fontWeight: 500, letterSpacing: 0.5 }}>{fav.nome}</td>
                  <td style={{ color: '#ff007f', fontWeight: 600 }}>{fav.tag}</td>
                  {deleteMode && (
                    <td>
                      <button
                        className="search-button"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteFavorite(fav._id);
                        }}
                      >
                        Apagar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {favorites.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#fff' }}>Nenhum favorito encontrado.</div>
          )}
        </div>
      )}

      {/* Mensagem de boas-vindas */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-block',
          background: '#222',
          borderRadius: 8,
          padding: '1rem 2rem',
          fontWeight: 600,
          fontSize: '1.1rem',
          border: '1.5px solid #444'
        }}>
          Seja bem vindo(a){userName ? `, ${userName}!` : '!'}
        </div>
      </div>

      {/* Campo de busca */}
      <form onSubmit={handleSubmit} className="search-form" style={{ flexDirection: 'row', gap: 0 }}>
        <input
          type="text"
          placeholder="Nome do invocador"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          required
          className="search-input"
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        />
        <input
          type="text"
          placeholder="Tag (ex: BR1)"
          value={formData.tag}
          onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
          required
          className="search-input"
          style={{ borderRadius: 0 }}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, minWidth: 100 }}
        >
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
            {masteryData.map((champ, index) => (
              <ChampionCard
                key={champ.championIcon}
                champ={champ}
                index={index} // Passa o índice do campeão
                onClick={() => handleChampionClick(champ.championIcon)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}