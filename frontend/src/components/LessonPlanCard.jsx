import React from 'react'
import { Calendar, Pencil, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LessonPlanCard({ plan, onEdit, onDelete, onView }) {
  const formattedDate = plan.planned_date
    ? format(new Date(plan.planned_date + 'T00:00:00'), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  return (
    <div className="plan-card">
      <div className="plan-card-discipline">{plan.discipline}</div>
      <h3 className="plan-card-title">{plan.title}</h3>
      <p className="plan-card-summary">{plan.summary}</p>

      {formattedDate && (
        <div className="plan-card-meta">
          <Calendar size={13} />
          {formattedDate}
        </div>
      )}

      {plan.tags?.length > 0 && (
        <div className="tags-row">
          {plan.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="plan-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onView(plan)}>
          <Eye size={14} /> Ver
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(plan)}>
          <Pencil size={14} /> Editar
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(plan)}>
          <Trash2 size={14} /> Excluir
        </button>
      </div>
    </div>
  )
}
