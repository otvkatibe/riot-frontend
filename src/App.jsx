// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChampionDetailsPage from './pages/ChampionDetailsPage'
import './styles/Home.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/champion/:championId" element={<ChampionDetailsPage />} />
    </Routes>
  )
}

export default App