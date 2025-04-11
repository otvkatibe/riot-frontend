// src/components/Loading.jsx
import React from 'react'

/**
 * Componente de loading com spinner animado
 */
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading"></div>
      <p>Carregando dados...</p>
    </div>
  )
}