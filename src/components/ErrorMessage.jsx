// src/components/ErrorMessage.jsx
import React from 'react'

/**
 * Componente para exibir mensagens de erro
 * @param {Object} props - Propriedades do componente
 * @param {String} props.message - Mensagem de erro a ser exibida
 */
export default function ErrorMessage({ message }) {
  return (
    <div className="error-message">
      <p>⚠️ {message}</p>
    </div>
  )
}
