import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    // Recupera a preferência salva ou usa a preferência do sistema operacional
    const salvo = localStorage.getItem('lp-theme')
    if (salvo) return salvo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem('lp-theme', tema)
  }, [tema])

  const alternar = () => setTema(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme: tema, toggle: alternar }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
