import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HomeLoggedPage from './pages/HomeLoggedPage'
import ChampionDetailsPage from './pages/ChampionDetailsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import './styles/Home.css'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const token = localStorage.getItem('token');
  return (
    <Routes>
      <Route path="/" element={token ? <HomeLoggedPage /> : <HomePage />} />
      <Route path="/champion/:championId" element={<ChampionDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      } />
    </Routes>
  )
}

export default App