import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Planos de Aula ────────────────────────────────────────
export const fetchLessonPlans = (params = {}) =>
  api.get('/lesson-plans/', { params }).then(r => r.data)

export const fetchLessonPlan = (id) =>
  api.get(`/lesson-plans/${id}`).then(r => r.data)

export const createLessonPlan = (data) =>
  api.post('/lesson-plans/', data).then(r => r.data)

export const updateLessonPlan = (id, data) =>
  api.put(`/lesson-plans/${id}`, data).then(r => r.data)

export const deleteLessonPlan = (id) =>
  api.delete(`/lesson-plans/${id}`).then(r => r.data)

// ── Smart Assist ──────────────────────────────────────────
// Timeout maior pois depende de chamada à API de IA
export const smartAssist = (data) =>
  api.post('/lesson-plans/smart-assist', data, { timeout: 60000 }).then(r => r.data)

// ── Metadados (disciplinas e tags) ────────────────────────
export const fetchDisciplines = () =>
  api.get('/lesson-plans/meta/disciplines').then(r => r.data)

export const fetchTags = (discipline = '') =>
  api.get('/lesson-plans/meta/tags', { params: discipline ? { discipline } : {} }).then(r => r.data)

export default api
