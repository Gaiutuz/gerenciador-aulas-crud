import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null

  const { page, pages, total, per_page } = pagination
  const de = (page - 1) * per_page + 1
  const ate = Math.min(page * per_page, total)

  // Gera intervalo de páginas ao redor da página atual
  const intervalo = []
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    intervalo.push(i)
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {intervalo[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          {intervalo[0] > 2 && <span className="page-info">…</span>}
        </>
      )}

      {intervalo.map(p => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {intervalo[intervalo.length - 1] < pages && (
        <>
          {intervalo[intervalo.length - 1] < pages - 1 && <span className="page-info">…</span>}
          <button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
      >
        <ChevronRight size={16} />
      </button>

      <span className="page-info">{de}–{ate} de {total}</span>
    </div>
  )
}
