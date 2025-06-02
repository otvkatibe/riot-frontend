import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('https://riot-backend.vercel.app/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="home-container" style={{ maxWidth: 400, margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', color: '#ff007f' }}>Registrar</h1>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="text"
          placeholder="Usuário"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="search-input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="search-input"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />
        <button className="search-button" type="submit">Registrar</button>
      </form>
      {error && <ErrorMessage message={error} />}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <span>Já está registrado? </span>
        <button
          type="button"
          className="search-button"
          style={{
            background: 'none',
            color: '#ff007f',
            textDecoration: 'underline',
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            fontWeight: 600,
            fontSize: '1em',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/login')}
        >
          Faça o login aqui
        </button>
      </div>
    </div>
  );
}