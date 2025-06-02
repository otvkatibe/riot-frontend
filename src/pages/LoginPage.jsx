import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('https://riot-backend.vercel.app/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao fazer login');
      localStorage.setItem('token', data.token);
      if (data.user && data.user.name) {
        localStorage.setItem('userName', data.user.name);
      }
      navigate('/dashboard');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000); // Redireciona para HomeLogada após mensagem de boas-vindas
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="home-container" style={{ maxWidth: 400, margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: '2rem', color: '#ff007f' }}>Login</h1>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          className="search-input"
          type="email"
          placeholder="E-mail"
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
        <button className="search-button" type="submit">Entrar</button>
      </form>
      {error && <ErrorMessage message={error} />}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <span>Não tem conta? </span>
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
          onClick={() => navigate('/register')}
        >
          Registre-se aqui
        </button>
      </div>
    </div>
  );
}