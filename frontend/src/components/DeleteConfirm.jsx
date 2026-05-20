import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirm({ plan, onConfirm, onClose, loading }) {
  if (!plan) return null

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(193,68,14,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={20} color="var(--terracotta)" />
            </div>
            <h2 style={{ fontSize: '1.1rem' }}>Excluir Plano</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            Tem certeza que deseja excluir o plano{' '}
            <strong style={{ color: 'var(--ink)' }}>"{plan.title}"</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn"
            style={{ background: 'var(--terracotta)', color: '#fff' }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <><div className="spinner" /> Excluindo…</> : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
