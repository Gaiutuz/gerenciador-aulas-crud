import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, ArrowUpDown, BookOpen } from 'lucide-react'
import {
  fetchLessonPlans, createLessonPlan, updateLessonPlan,
  deleteLessonPlan, fetchDisciplines, fetchTags,
} from '../services/api'
import { useToast } from '../hooks/useToast'
import { useSound } from '../hooks/useSound'
import LessonPlanCard from '../components/LessonPlanCard'
import LessonPlanForm from '../components/LessonPlanForm'
import LessonPlanDetail from '../components/LessonPlanDetail'
import DeleteConfirm from '../components/DeleteConfirm'
import Pagination from '../components/Pagination'

const ITENS_POR_PAGINA = 9

export default function ListPage({ showForm, onFormClose, externalDiscipline, onFilterDiscipline, onDataChange }) {
  const toast = useToast()
  const { playConfirm, playDelete } = useSound()

  // Dados principais
  const [planos, setPlanos] = useState([])
  const [paginacao, setPaginacao] = useState(null)
  const [disciplinas, setDisciplinas] = useState([])
  const [tags, setTags] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroDisciplina, setFiltroDisciplina] = useState('')
  const [filtroTag, setFiltroTag] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('created_at')
  const [ordem, setOrdem] = useState('desc')
  const [pagina, setPagina] = useState(1)

  // Modais
  const [planoEdicao, setPlanoEdicao] = useState(null)
  const [planoVisualizacao, setPlanoVisualizacao] = useState(null)
  const [planoExclusao, setPlanoExclusao] = useState(null)

  // Sincroniza o filtro de disciplina vindo da sidebar com o dropdown interno
  useEffect(() => {
    setFiltroDisciplina(externalDiscipline || '')
    setFiltroTag('')  // reseta o filtro de tag ao trocar de disciplina
    setPagina(1)
  }, [externalDiscipline])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const dados = await fetchLessonPlans({
        page: pagina,
        per_page: ITENS_POR_PAGINA,
        search: busca,
        discipline: filtroDisciplina,
        tag: filtroTag,
        date_from: dataInicio,
        date_to: dataFim,
        sort_by: ordenarPor,
        order: ordem,
      })
      setPlanos(dados.items)
      setPaginacao(dados.pagination)
    } catch {
      toast.error('Erro ao carregar planos de aula.')
    } finally {
      setCarregando(false)
    }
  }, [pagina, busca, filtroDisciplina, filtroTag, dataInicio, dataFim, ordenarPor, ordem])

  useEffect(() => { carregar() }, [carregar])

  // Carrega metadados de filtro — tags filtradas pela disciplina ativa
  useEffect(() => {
    fetchDisciplines().then(setDisciplinas).catch(() => {})
    fetchTags(filtroDisciplina).then(setTags).catch(() => {})
  }, [planos, filtroDisciplina])

  const handleCriar = async (dados) => {
    setSalvando(true)
    try {
      await createLessonPlan(dados)
      playConfirm()                          // 🎵 toque de confirmação
      toast.success('Plano criado com sucesso!')
      onFormClose()
      setPagina(1)
      carregar()
      onDataChange?.()                       // atualiza contagem de disciplinas na sidebar
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao criar plano.'
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  const handleAtualizar = async (dados) => {
    setSalvando(true)
    try {
      await updateLessonPlan(planoEdicao.id, dados)
      playConfirm()                          // 🎵 toque ao salvar
      toast.success('Plano atualizado!')
      setPlanoEdicao(null)
      carregar()
      onDataChange?.()
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao atualizar plano.'
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async () => {
    setSalvando(true)
    try {
      await deleteLessonPlan(planoExclusao.id)
      playDelete()                           // 🎵 baque descendente ao excluir
      toast.success('Plano excluído.')
      setPlanoExclusao(null)
      carregar()
      onDataChange?.()
    } catch {
      toast.error('Erro ao excluir plano.')
    } finally {
      setSalvando(false)
    }
  }

  const alternarOrdem = (campo) => {
    if (ordenarPor === campo) setOrdem(o => o === 'desc' ? 'asc' : 'desc')
    else { setOrdenarPor(campo); setOrdem('desc') }
    setPagina(1)
  }

  const limparFiltros = () => {
    setBusca(''); setFiltroDisciplina(''); setFiltroTag('')
    setDataInicio(''); setDataFim(''); setOrdenarPor('created_at'); setOrdem('desc')
    setPagina(1)
    onFilterDiscipline?.('')  // remove destaque na sidebar
  }

  // Sincroniza a seleção do dropdown com o destaque na sidebar
  const handleMudarDisciplina = (valor) => {
    setFiltroDisciplina(valor)
    setFiltroTag('')
    setPagina(1)
    onFilterDiscipline?.(valor)
  }

  const temFiltros = busca || filtroDisciplina || filtroTag || dataInicio || dataFim

  // Título reflete o filtro de disciplina ativo
  const tituloPagina = filtroDisciplina ? filtroDisciplina : 'Planos de Aula'
  const subtituloPagina = paginacao
    ? `${paginacao.total} plano${paginacao.total !== 1 ? 's' : ''} cadastrado${paginacao.total !== 1 ? 's' : ''}`
    : 'Carregando…'

  return (
    <>
      {/* ── Barra superior ── */}
      <div className="topbar">
        <div>
          <div className="topbar-title">{tituloPagina}</div>
          <div className="topbar-subtitle">{subtituloPagina}</div>
        </div>
        <button className="btn btn-primary" onClick={() => onFormClose(true)}>
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      <div className="page-body">
        {/* ── Filtros ── */}
        <div className="filters-bar">
          <div className="filter-group" style={{ flex: 2, minWidth: '200px' }}>
            <label>Buscar por título</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: '.65rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--ink-faint)',
              }} />
              <input
                className="filter-control"
                value={busca}
                onChange={e => { setBusca(e.target.value); setPagina(1) }}
                placeholder="Buscar…"
                style={{ paddingLeft: '2rem' }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Disciplina</label>
            <select
              className="filter-control"
              value={filtroDisciplina}
              onChange={e => handleMudarDisciplina(e.target.value)}
            >
              <option value="">Todas</option>
              {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Tag</label>
            <select
              className="filter-control"
              value={filtroTag}
              onChange={e => { setFiltroTag(e.target.value); setPagina(1) }}
            >
              <option value="">Todas</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Data de</label>
            <input type="date" className="filter-control" value={dataInicio}
              onChange={e => { setDataInicio(e.target.value); setPagina(1) }} />
          </div>

          <div className="filter-group">
            <label>Data até</label>
            <input type="date" className="filter-control" value={dataFim}
              onChange={e => { setDataFim(e.target.value); setPagina(1) }} />
          </div>

          <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ opacity: 0 }}>-</label>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button
                className={`btn btn-ghost btn-sm ${ordenarPor === 'title' ? 'active' : ''}`}
                onClick={() => alternarOrdem('title')}
                title="Ordenar por título"
              >
                <ArrowUpDown size={13} /> Título
              </button>
              <button
                className={`btn btn-ghost btn-sm ${ordenarPor === 'created_at' ? 'active' : ''}`}
                onClick={() => alternarOrdem('created_at')}
                title="Ordenar por data de cadastro"
              >
                <ArrowUpDown size={13} /> Data
              </button>
              {temFiltros && (
                <button className="btn btn-ghost btn-sm" onClick={limparFiltros}>
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Grade de planos ── */}
        {carregando ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '200px', borderRadius: 'var(--radius-md)' }} className="skeleton" />
            ))}
          </div>
        ) : planos.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>Nenhum plano encontrado</h3>
            <p>{temFiltros ? 'Tente ajustar os filtros.' : 'Crie seu primeiro plano de aula.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {planos.map(plano => (
              <LessonPlanCard
                key={plano.id}
                plan={plano}
                onView={setPlanoVisualizacao}
                onEdit={setPlanoEdicao}
                onDelete={setPlanoExclusao}
              />
            ))}
          </div>
        )}

        <Pagination pagination={paginacao} onPageChange={setPagina} />
      </div>

      {/* ── Modais ── */}
      {(showForm || planoEdicao) && (
        <LessonPlanForm
          initial={planoEdicao || null}
          onSubmit={planoEdicao ? handleAtualizar : handleCriar}
          onClose={() => { setPlanoEdicao(null); onFormClose(false) }}
          loading={salvando}
        />
      )}

      {planoVisualizacao && (
        <LessonPlanDetail
          plan={planoVisualizacao}
          onClose={() => setPlanoVisualizacao(null)}
          onEdit={(p) => { setPlanoVisualizacao(null); setPlanoEdicao(p) }}
        />
      )}

      {planoExclusao && (
        <DeleteConfirm
          plan={planoExclusao}
          onConfirm={handleExcluir}
          onClose={() => setPlanoExclusao(null)}
          loading={salvando}
        />
      )}
    </>
  )
}
