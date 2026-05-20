import React from 'react'
import { X, Calendar, BookOpen, Tag, FileText, Link2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LessonPlanDetail({ plan, onClose, onEdit }) {
  if (!plan) return null

  const formattedDate = plan.planned_date
    ? format(new Date(plan.planned_date + 'T00:00:00'), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  const formattedCreated = plan.created_at
    ? format(new Date(plan.created_at), "d MMM yyyy 'às' HH:mm", { locale: ptBR })
    : null

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div>
            <div style={{
              fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.3rem',
            }}>
              {plan.discipline}
            </div>
            <h2>{plan.title}</h2>
            {formattedCreated && (
              <p style={{ fontSize: '.78rem', color: 'var(--ink-faint)', marginTop: '.2rem' }}>
                Criado em {formattedCreated}
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {formattedDate && (
            <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <Calendar size={11} /> Data Prevista
              </div>
              <div className="detail-section-value" style={{ color: 'var(--gold)', fontWeight: 500 }}>
                {formattedDate}
              </div>
            </div>
          )}

          <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
            <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <BookOpen size={11} /> Objetivo
            </div>
            <div className="detail-section-value">{plan.objective}</div>
          </div>

          <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
            <div className="detail-section-label">Ementa / Resumo</div>
            <div className="detail-section-value">{plan.summary}</div>
          </div>

          {plan.contents && (
            <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <FileText size={11} /> Conteúdos
              </div>
              <div className="detail-section-value">{plan.contents}</div>
            </div>
          )}

          {plan.support_resources && (
            <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <Link2 size={11} /> Recursos de Apoio
              </div>
              <div className="detail-section-value">{plan.support_resources}</div>
            </div>
          )}

          {plan.tags?.length > 0 && (
            <div className="detail-section" style={{ gridColumn: '1 / -1' }}>
              <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                <Tag size={11} /> Tags
              </div>
              <div className="tags-row">
                {plan.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(plan) }}>
            Editar Plano
          </button>
        </div>
      </div>
    </div>
  )
}
