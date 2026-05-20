import React, { useState, useEffect } from 'react'
import { Sparkles, X, Tag, Plus, Info } from 'lucide-react'
import { smartAssist } from '../services/api'
import { useToast } from '../hooks/useToast'

const FORM_VAZIO = {
  title: '',
  objective: '',
  summary: '',
  planned_date: '',
  discipline: '',
  contents: '',
  support_resources: '',
  tags: [],
}

// ── Componente de tooltip ─────────────────────────────────
function Tooltip({ text, children }) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className="tooltip-box">{text}</span>
    </span>
  )
}

export default function LessonPlanForm({ initial, onSubmit, onClose, loading }) {
  const toast = useToast()
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [inputTag, setInputTag] = useState('')
  const [carregandoIA, setCarregandoIA] = useState(false)
  const [erroIA, setErroIA] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({
        ...FORM_VAZIO,
        ...initial,
        planned_date: initial.planned_date || '',
        tags: initial.tags || [],
      })
    }
  }, [initial])

  const set = (campo) => (e) => {
    setForm(prev => ({ ...prev, [campo]: e.target.value }))
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: '' }))
  }

  const validar = () => {
    const errsEncontrados = {}
    if (!form.title.trim() || form.title.length < 3) errsEncontrados.title = 'Título deve ter ao menos 3 caracteres.'
    if (!form.objective.trim() || form.objective.length < 10) errsEncontrados.objective = 'Objetivo deve ter ao menos 10 caracteres.'
    if (!form.summary.trim() || form.summary.length < 10) errsEncontrados.summary = 'Ementa deve ter ao menos 10 caracteres.'
    if (!form.discipline.trim() || form.discipline.length < 2) errsEncontrados.discipline = 'Disciplina é obrigatória.'
    setErros(errsEncontrados)
    return Object.keys(errsEncontrados).length === 0
  }

  const handleSubmit = () => {
    if (!validar()) return
    onSubmit(form)
  }

  const handleSmartAssist = async () => {
    if (!form.title || !form.discipline || !form.summary) {
      setErroIA('Preencha Título, Disciplina e Ementa antes de usar o Smart Assist.')
      return
    }
    setCarregandoIA(true)
    setErroIA('')
    try {
      const resultado = await smartAssist({
        title: form.title,
        discipline: form.discipline,
        summary: form.summary,
      })
      setForm(prev => ({
        ...prev,
        contents: resultado.contents || prev.contents,
        support_resources: resultado.support_resources || prev.support_resources,
        tags: resultado.tags?.length ? resultado.tags : prev.tags,
      }))
      toast.success('Recomendações geradas com sucesso!')
    } catch (err) {
      const msg = err.response?.data?.error || 'Serviço de IA indisponível. Tente novamente.'
      setErroIA(msg)
      toast.error(msg)
    } finally {
      setCarregandoIA(false)
    }
  }

  const adicionarTag = () => {
    const t = inputTag.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t] }))
    }
    setInputTag('')
  }

  const removerTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      adicionarTag()
    }
  }

  const isEdicao = !!initial?.id

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{isEdicao ? 'Editar Plano de Aula' : 'Novo Plano de Aula'}</h2>
            <p style={{ fontSize: '.82rem', color: 'var(--ink-muted)', marginTop: '.2rem' }}>
              {isEdicao
                ? 'Atualize as informações do plano.'
                : 'Preencha as informações e use o Smart Assist para obter sugestões com IA.'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            {/* Título */}
            <div className="form-group">
              <label>Título da Aula *</label>
              <input className="form-control" value={form.title} onChange={set('title')}
                placeholder="Ex: Introdução ao OSPF" />
              {erros.title && <span className="form-error">{erros.title}</span>}
            </div>

            {/* Disciplina */}
            <div className="form-group">
              <label>Disciplina *</label>
              <input className="form-control" value={form.discipline} onChange={set('discipline')}
                placeholder="Ex: Redes de Computadores" />
              {erros.discipline && <span className="form-error">{erros.discipline}</span>}
            </div>

            {/* Objetivo */}
            <div className="form-group full">
              <label>Objetivo *</label>
              <textarea className="form-control" value={form.objective} onChange={set('objective')}
                placeholder="Descreva o objetivo de aprendizagem desta aula..." rows={3} />
              {erros.objective && <span className="form-error">{erros.objective}</span>}
            </div>

            {/* Ementa */}
            <div className="form-group full">
              <label>Ementa / Resumo *</label>
              <textarea className="form-control" value={form.summary} onChange={set('summary')}
                placeholder="Descreva brevemente os tópicos que serão abordados..." rows={3} />
              {erros.summary && <span className="form-error">{erros.summary}</span>}
            </div>

            {/* Data Prevista */}
            <div className="form-group">
              <label>Data Prevista</label>
              <input type="date" className="form-control" value={form.planned_date}
                onChange={set('planned_date')} />
            </div>

            {/* Botão Smart Assist com Tooltip */}
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label style={{ opacity: 0 }}>IA</label>
              <Tooltip text="Analisa o título, disciplina e ementa da aula e sugere automaticamente conteúdos complementares, recursos de apoio e tags usando inteligência artificial.">
                <button
                  className="smart-assist-btn"
                  onClick={handleSmartAssist}
                  disabled={carregandoIA}
                  type="button"
                >
                  {carregandoIA
                    ? <><div className="spinner" /> Gerando recomendações...</>
                    : <><Sparkles size={15} /> Gerar Recomendações com IA</>
                  }
                </button>
              </Tooltip>
            </div>

            {/* Feedback da IA */}
            {carregandoIA && (
              <div className="form-group full">
                <div className="ai-loading">
                  <div className="spinner" />
                  Assistente pedagógico está analisando o conteúdo…
                </div>
              </div>
            )}
            {erroIA && (
              <div className="form-group full">
                <div className="ai-error">{erroIA}</div>
              </div>
            )}

            {/* Conteúdos */}
            <div className="form-group full">
              <label>Conteúdos</label>
              <textarea className="form-control" value={form.contents} onChange={set('contents')}
                placeholder="Conteúdos e tópicos a serem abordados..." rows={4} />
            </div>

            {/* Recursos de Apoio */}
            <div className="form-group full">
              <label>Recursos de Apoio</label>
              <textarea className="form-control" value={form.support_resources}
                onChange={set('support_resources')}
                placeholder="Livros, sites, vídeos, ferramentas recomendados..." rows={3} />
            </div>

            {/* Tags */}
            <div className="form-group full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <Tag size={13} /> Tags
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input className="form-control" value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Digite uma tag e pressione Enter…" />
                <button className="btn btn-ghost" onClick={adicionarTag} type="button">
                  <Plus size={15} />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="tags-row" style={{ marginTop: '.5rem' }}>
                  {form.tags.map(tag => (
                    <span key={tag} className="tag" style={{ cursor: 'pointer' }}
                      onClick={() => removerTag(tag)}>
                      {tag} <X size={11} style={{ marginLeft: '.2rem' }} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><div className="spinner" /> Salvando…</>
              : isEdicao ? 'Salvar Alterações' : 'Criar Plano'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
