import React, { useState, useEffect, useCallback } from 'react'
import { Activity, Database, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react'

export default function HealthPage() {
  const [status, setStatus] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [ultimaVerificacao, setUltimaVerificacao] = useState(null)
  const [latencia, setLatencia] = useState(null)

  const verificar = useCallback(async () => {
    setCarregando(true)
    const inicio = performance.now()
    try {
      // Usa fetch diretamente contra /health — NÃO usa a instância axios de /api
      const res = await fetch('/health', { signal: AbortSignal.timeout(8000) })
      const dados = await res.json()
      setLatencia(Math.round(performance.now() - inicio))
      setStatus({ ok: res.ok && dados.status === 'ok', dados })
    } catch {
      setLatencia(Math.round(performance.now() - inicio))
      setStatus({ ok: false, dados: { status: 'inacessível', database: 'desconhecido' } })
    } finally {
      setCarregando(false)
      setUltimaVerificacao(new Date())
    }
  }, [])

  useEffect(() => { verificar() }, [verificar])

  const sistemaOk = status?.ok
  const bancoOk = status?.dados?.database === 'ok'

  return (
    <div style={{ padding: '2rem', maxWidth: '560px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.35rem' }}>
          <Activity size={22} style={{ color: 'var(--gold-light)' }} />
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
            Health Check
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--ink-muted)' }}>
          Status dos serviços em tempo real
        </p>
      </div>

      {/* Banner de status geral */}
      <div style={{
        borderRadius: 'var(--radius-md)',
        padding: '1.15rem 1.35rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: carregando
          ? 'var(--surface-2)'
          : sistemaOk
            ? 'color-mix(in srgb, #22c55e 12%, var(--surface-2))'
            : 'color-mix(in srgb, #ef4444 12%, var(--surface-2))',
        border: `1px solid ${carregando ? 'var(--border)' : sistemaOk ? '#22c55e55' : '#ef444455'}`,
        transition: 'all .3s ease',
      }}>
        {carregando ? (
          <RefreshCw size={22} style={{ color: 'var(--ink-muted)', animation: 'spin 1s linear infinite' }} />
        ) : sistemaOk ? (
          <CheckCircle size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
        ) : (
          <XCircle size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: '.95rem' }}>
            {carregando ? 'Verificando…' : sistemaOk ? 'Sistema operacional' : 'Sistema degradado'}
          </div>
          {latencia != null && !carregando && (
            <div style={{ fontSize: '.76rem', color: 'var(--ink-muted)', marginTop: '.1rem' }}>
              Resposta em {latencia} ms
            </div>
          )}
        </div>
      </div>

      {/* Cards dos serviços */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
        <CartaoServico
          icon={<Activity size={16} />}
          label="API"
          value={carregando ? '—' : status?.dados?.status ?? '—'}
          ok={carregando ? null : sistemaOk}
          loading={carregando}
        />
        <CartaoServico
          icon={<Database size={16} />}
          label="Banco de dados"
          value={carregando ? '—' : status?.dados?.database ?? '—'}
          ok={carregando ? null : bancoOk}
          loading={carregando}
        />
      </div>

      {/* Rodapé */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '.78rem',
        color: 'var(--ink-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <Clock size={13} />
          {ultimaVerificacao
            ? `Atualizado às ${ultimaVerificacao.toLocaleTimeString('pt-BR')}`
            : 'Verificando…'}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={verificar}
          disabled={carregando}
          style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}
        >
          <RefreshCw size={13} style={carregando ? { animation: 'spin 1s linear infinite' } : {}} />
          Atualizar
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function CartaoServico({ icon, label, value, ok, loading }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.25rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ color: 'var(--ink-muted)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '.8rem', color: 'var(--ink-muted)', marginBottom: '.15rem' }}>{label}</div>
        <div style={{ fontSize: '.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{value}</div>
      </div>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: loading ? 'var(--border-dark)' : ok ? '#22c55e' : '#ef4444',
        boxShadow: loading || ok === null ? 'none' : ok ? '0 0 6px #22c55e88' : '0 0 6px #ef444488',
        transition: 'all .3s ease',
      }} />
    </div>
  )
}
