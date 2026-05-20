import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const adicionar = useCallback((mensagem, tipo = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensagem, tipo }])
    // Remove o toast automaticamente após 4 segundos
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const toast = {
    success: (msg) => adicionar(msg, 'success'),
    error:   (msg) => adicionar(msg, 'error'),
    info:    (msg) => adicionar(msg, 'info'),
  }

  const icones = {
    success: <CheckCircle size={16} />,
    error:   <XCircle size={16} />,
    info:    <Info size={16} />,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            {icones[t.tipo]}
            {t.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
