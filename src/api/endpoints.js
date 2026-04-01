/**
 * CIC — Endpoints da API
 * Funções tipadas para cada módulo do backend.
 * Importar onde precisar: import { auth, campaigns, ia } from '../api/endpoints'
 */

import { api, createSSEPost, setSession, clearSession } from './client.js'

const cid = () => {
  const c = JSON.parse(localStorage.getItem('cic_campaign') || 'null')
  return c?.id
}

// ── Auth ──────────────────────────────────────────────────────
export const auth = {
  login:   (email, password)  => api.post('/auth/login', { email, password }),
  logout:  ()                 => api.post('/auth/logout'),
  me:      ()                 => api.get('/auth/me'),
  forgot:  (email)            => api.post('/auth/forgot-password', { email })
}

// ── Campanhas ─────────────────────────────────────────────────
export const campaigns = {
  list:   ()             => api.get('/campaigns'),
  get:    (id)           => api.get(`/campaigns/${id}`),
  create: (body)         => api.post('/campaigns', body),
  update: (id, body)     => api.patch(`/campaigns/${id}`, body),
  delete: (id)           => api.delete(`/campaigns/${id}`)
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboard = {
  kpis:   (id = cid()) => api.get(`/campaigns/${id}/dashboard`),
  health: (id = cid()) => api.get(`/campaigns/${id}/dashboard/health`),
  alerts: (id = cid()) => api.get(`/campaigns/${id}/dashboard/alerts`)
}

// ── Demandas ──────────────────────────────────────────────────
export const demandas = {
  list:        (params = {})      => api.get(`/campaigns/${cid()}/demandas?${new URLSearchParams(params)}`),
  create:      (body)             => api.post(`/campaigns/${cid()}/demandas`, body),
  setStatus:   (did, status)      => api.patch(`/campaigns/${cid()}/demandas/${did}/status`, { status }),
  aiSuggest:   (did)              => api.post(`/campaigns/${cid()}/demandas/${did}/ai-suggest`)
}

// ── Diagnóstico ───────────────────────────────────────────────
export const diagnostico = {
  pesquisas:     () => api.get(`/campaigns/${cid()}/diagnostico/pesquisas`),
  swot:          () => api.get(`/campaigns/${cid()}/diagnostico/swot`),
  cenarios:      () => api.get(`/campaigns/${cid()}/diagnostico/cenarios`),
  posicionamento:() => api.get(`/campaigns/${cid()}/diagnostico/posicionamento`)
}

// ── Monitoramento ─────────────────────────────────────────────
export const monitoramento = {
  redes:      () => api.get(`/campaigns/${cid()}/monitoramento/redes`),
  crises:     () => api.get(`/campaigns/${cid()}/monitoramento/crises`),
  adversarios:() => api.get(`/campaigns/${cid()}/monitoramento/adversarios`)
}

// ── CRM ───────────────────────────────────────────────────────
export const crm = {
  eleitores: (params = {}) => api.get(`/campaigns/${cid()}/crm/eleitores?${new URLSearchParams(params)}`),
  criar:     (body)        => api.post(`/campaigns/${cid()}/crm/eleitores`, body),
  segmentos: ()            => api.get(`/campaigns/${cid()}/crm/segmentos`),
  scoring:   ()            => api.get(`/campaigns/${cid()}/crm/scoring`)
}

// ── Arrecadação ───────────────────────────────────────────────
export const fundraising = {
  overview:   () => api.get(`/campaigns/${cid()}/fundraising/overview`),
  doadores:   () => api.get(`/campaigns/${cid()}/fundraising/doadores`),
  compliance: () => api.get(`/campaigns/${cid()}/fundraising/compliance`),
  doacao:   (body) => api.post(`/campaigns/${cid()}/fundraising/doacoes`, body)
}

// ── Produção ──────────────────────────────────────────────────
export const producao = {
  gerar:    (body)  => api.post(`/campaigns/${cid()}/producao/gerar`, body),
  listar:   ()      => api.get(`/campaigns/${cid()}/producao/gerados`),
  aprovar:  (gid, fc_note) => api.put(`/campaigns/${cid()}/producao/gerados/${gid}`, { status: 'approved', fc_note }),
  rejeitar: (gid, fc_note) => api.put(`/campaigns/${cid()}/producao/gerados/${gid}`, { status: 'rejected', fc_note })
}

// ── Content API (streaming) ───────────────────────────────────
export const content = {
  generate: (body) => api.post('/content/generate', body),
  stream:   (jobId, onToken, onDone, onError) => createSSEPost(`/content/stream/${jobId}`, {}, onToken, onDone, onError),
  list:     (campaignId, params = {}) => api.get(`/content/${campaignId}?${new URLSearchParams(params)}`),
  jobStatus:(jobId) => api.get(`/content/job/${jobId}/status`)
}

// ── Social ────────────────────────────────────────────────────
export const social = {
  agendar:   (body) => api.post(`/campaigns/${cid()}/social/agendar`, body),
  agendados: ()     => api.get(`/campaigns/${cid()}/social/agendados`),
  calendario:()     => api.get(`/campaigns/${cid()}/social/calendario`),
  analytics: ()     => api.get(`/campaigns/${cid()}/social/analytics`)
}

// ── Voluntários ───────────────────────────────────────────────
export const voluntarios = {
  list:    ()     => api.get(`/campaigns/${cid()}/voluntarios`),
  criar:   (body) => api.post(`/campaigns/${cid()}/voluntarios`, body),
  tarefas: ()     => api.get(`/campaigns/${cid()}/voluntarios/tarefas`),
  ranking: ()     => api.get(`/campaigns/${cid()}/voluntarios/ranking`)
}

// ── Agenda ────────────────────────────────────────────────────
export const agenda = {
  list:    (vista = 'semana') => api.get(`/campaigns/${cid()}/agenda?vista=${vista}`),
  criar:   (body)             => api.post(`/campaigns/${cid()}/agenda`, body),
  remover: (aid)              => api.delete(`/campaigns/${cid()}/agenda/${aid}`),
  briefing:(aid)              => api.get(`/campaigns/${cid()}/agenda/${aid}/briefing`)
}

// ── Debate ────────────────────────────────────────────────────
export const debate = {
  iniciar:   (oponente) => api.post(`/campaigns/${cid()}/debate/iniciar`, { oponente }),
  responder: (sessaoId, resposta) => api.post(`/campaigns/${cid()}/debate/responder`, { sessaoId, resposta }),
  stats:     ()         => api.get(`/campaigns/${cid()}/debate/stats`)
}

// ── IA (chat + streaming) ─────────────────────────────────────
export const ia = {
  chat: (mensagem, agente, historico, onToken, onDone, onError) =>
    createSSEPost(
      `/campaigns/${cid()}/ia/chat`,
      { mensagem, agente, historico },
      onToken, onDone, onError
    ),
  historico:      ()    => api.get(`/campaigns/${cid()}/ia/historico`),
  notificacoes:   ()    => api.get(`/campaigns/${cid()}/ia/notificacoes`),
  marcarLida:     (nid) => api.patch(`/campaigns/${cid()}/ia/notificacoes/${nid}/ler`)
}

// ── Estratégia ────────────────────────────────────────────────
export const estrategia = {
  decisoes: ()            => api.get(`/campaigns/${cid()}/estrategia/decisoes`),
  decidir:  (did, acao, nota) => api.patch(`/campaigns/${cid()}/estrategia/decisoes/${did}`, { acao, nota }),
  narrativa:()            => api.get(`/campaigns/${cid()}/estrategia/narrativa`),
  timeline: ()            => api.get(`/campaigns/${cid()}/estrategia/timeline`)
}

// ── GOTV ──────────────────────────────────────────────────────
export const gotv = {
  status:    ()         => api.get(`/campaigns/${cid()}/gotv/status`),
  checklist: ()         => api.get(`/campaigns/${cid()}/gotv/checklist`),
  marcar:    (cid2, concluido) => api.patch(`/campaigns/${cid()}/gotv/checklist/${cid2}`, { concluido })
}

// ── Configurações ─────────────────────────────────────────────
export const config = {
  me:     ()     => api.get('/users/me'),
  update: (body) => api.put('/users/me', body),
  equipe: ()     => api.get(`/campaigns/${cid()}/equipe`),
  convidar:(email, role) => api.post(`/campaigns/${cid()}/equipe`, { email, role })
}

// ── Imagem (Nano Banana 2) ────────────────────────────────────
export const imagem = {
  gerar:  (prompt, campaign_id) => api.post('/image/generate', { prompt, campaign_id }),
  listar: (campaign_id = cid()) => api.get(`/image/${campaign_id}`)
}

// ── Avatar (HeyGen) ───────────────────────────────────────────
export const avatar = {
  criar:   (campaign_id, videoUrl) => api.post('/avatar/create', { campaign_id, videoUrl }),
  gerar:   (campaign_id, script, avatar_id) => api.post('/avatar/generate', { campaign_id, script, avatar_id }),
  status:  (jobId) => api.get(`/avatar/status/${jobId}`)
}
