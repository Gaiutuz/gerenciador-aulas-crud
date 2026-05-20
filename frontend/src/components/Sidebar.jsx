import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  BookOpen, Plus, LayoutList, GraduationCap,
  ChevronDown, Library, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Sidebar({ onNewPlan, disciplines, onFilterDiscipline, activeDiscipline }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const [discAberto, setDiscAberto] = useState(true)

  const handleClicarDisciplina = (d) => {
    if (activeDiscipline === d) {
      onFilterDiscipline('')      // clicou na mesma — remove o filtro
    } else {
      onFilterDiscipline(d)
      navigate('/')
    }
  }

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <GraduationCap size={22} style={{ color: 'var(--gold-light)', marginBottom: '.4rem' }} />
          <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark'
              ? <Sun size={15} />
              : <Moon size={15} />
            }
          </button>
        </div>
        <h1>Planos de Aula</h1>
        <span>Gestão Pedagógica</span>
      </div>

      {/* ── Navegação ── */}
      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>

        <button
          className={`nav-item ${location.pathname === '/' && !activeDiscipline ? 'active' : ''}`}
          onClick={() => { onFilterDiscipline(''); navigate('/') }}
        >
          <LayoutList size={17} />
          Todos os Planos
        </button>

        <button className="nav-item" onClick={onNewPlan}>
          <Plus size={17} />
          Novo Plano
        </button>

        {/* ── Seção de disciplinas ── */}
        {disciplines.length > 0 && (
          <>
            <div className="nav-disc-header" style={{ marginTop: '1.25rem' }}>
              <span className="nav-label" style={{ margin: 0, padding: 0 }}>Disciplinas</span>
              <button
                onClick={() => setDiscAberto(o => !o)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '.25rem' }}
                aria-label={discAberto ? 'Recolher disciplinas' : 'Expandir disciplinas'}
              >
                <ChevronDown
                  size={13}
                  className={`nav-disc-chevron ${discAberto ? 'open' : ''}`}
                />
              </button>
            </div>

            {discAberto && disciplines.map(({ name, count }) => (
              <button
                key={name}
                className={`nav-item-discipline ${activeDiscipline === name ? 'active' : ''}`}
                onClick={() => handleClicarDisciplina(name)}
                title={`Filtrar por ${name}`}
              >
                <Library size={13} style={{ flexShrink: 0, opacity: .6 }} />
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {name}
                </span>
                <span className="nav-disc-badge">{count}</span>
              </button>
            ))}
          </>
        )}

        <div className="nav-label" style={{ marginTop: '1.5rem' }}>Sistema</div>
        <Link className="nav-item" to="/health">
          <BookOpen size={17} />
          Health Check
        </Link>
      </nav>

      {/* ── Rodapé ── */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderTop: '1px solid rgba(255,255,255,.06)',
        fontSize: '.72rem',
        color: 'rgba(255,255,255,.25)',
        lineHeight: 1.7,
      }}>
        <div style={{ marginBottom: '.25rem', fontWeight: 500, color: 'rgba(255,255,255,.35)' }}>
          Smart Assist
        </div>
        Powered by OpenAI GPT-4o-mini.<br />Sugestões pedagógicas em tempo real.
      </div>
    </aside>
  )
}
