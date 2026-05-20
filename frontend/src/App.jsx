import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ListPage from './pages/ListPage'
import HealthPage from './pages/HealthPage'
import { ToastProvider } from './hooks/useToast'
import { ThemeProvider } from './hooks/useTheme'
import { fetchDisciplines, fetchLessonPlans } from './services/api'

export default function App() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [disciplinaAtiva, setDisciplinaAtiva] = useState('')
  // Lista de disciplinas com contagem de planos para exibir na sidebar
  const [disciplinasSidebar, setDisciplinasSidebar] = useState([])

  // Carrega as disciplinas com contagem para a sidebar
  const atualizarDisciplinas = async () => {
    try {
      const nomes = await fetchDisciplines()
      // Busca a contagem por disciplina em paralelo (número pequeno de disciplinas)
      const comContagem = await Promise.all(
        nomes.map(async (nome) => {
          try {
            const res = await fetchLessonPlans({ discipline: nome, per_page: 1, page: 1 })
            return { name: nome, count: res.pagination.total }
          } catch {
            return { name: nome, count: 0 }
          }
        })
      )
      setDisciplinasSidebar(comContagem)
    } catch {
      // Falha silenciosa — disciplinas na sidebar não são críticas
    }
  }

  useEffect(() => { atualizarDisciplinas() }, [])

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="layout">
          <Sidebar
            onNewPlan={() => setMostrarFormulario(true)}
            disciplines={disciplinasSidebar}
            activeDiscipline={disciplinaAtiva}
            onFilterDiscipline={setDisciplinaAtiva}
          />
          <div className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <ListPage
                    showForm={mostrarFormulario}
                    onFormClose={(val = false) => setMostrarFormulario(val)}
                    externalDiscipline={disciplinaAtiva}
                    onFilterDiscipline={setDisciplinaAtiva}
                    onDataChange={atualizarDisciplinas}
                  />
                }
              />
              <Route path="/health" element={<HealthPage />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
