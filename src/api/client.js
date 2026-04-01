/**
 * CIC — Cliente HTTP centralizado
 * Todas as chamadas ao backend passam por aqui.
 * Gerencia token JWT, refresh automático e erros globais.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

// ── Obtém token do localStorage
export function getToken() {
  return localStorage.getItem('cic_token')
}

// ── Salva token e dados do usuário
export function setSession(token, user) {
  localStorage.setItem('cic_token', token)
  if (user) localStorage.setItem('cic_user', JSON.stringify(user))
}

// ── Limpa sessão (logout)
export function clearSession() {
  localStorage.removeItem('cic_token')
  localStorage.removeItem('cic_user')
  localStorage.removeItem('cic_campaign')
}

// ── Usuário logado atual
export function getUser() {
  try { return JSON.parse(localStorage.getItem('cic_user') || 'null') } catch { return null }
}

// ── Campanha selecionada atual
export function getCurrentCampaign() {
  try { return JSON.parse(localStorage.getItem('cic_campaign') || 'null') } catch { return null }
}

export function setCurrentCampaign(campaign) {
  localStorage.setItem('cic_campaign', JSON.stringify(campaign))
}

// ── Fetch base com headers de autenticação
async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expirado — redireciona para login
  if (res.status === 401) {
    clearSession()
    window.location.href = '/'
    return
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ── Métodos HTTP
export const api = {
  get:    (path)         => apiFetch(path),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' })
}

// ── SSE Streaming — para chat IA e Content API
export function createSSEStream(path, onToken, onDone, onError) {
  const token   = getToken()
  const url     = `${BASE_URL}${path}`

  // Usa fetch com ReadableStream para SSE com POST não é suportado pelo EventSource
  // Então usamos uma abordagem com fetch diretamente
  const controller = new AbortController()

  fetch(url, {
    method:  'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
    signal:  controller.signal
  }).then(async (res) => {
    if (!res.ok) { onError?.(`HTTP ${res.status}`); return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // guarda linha incompleta

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.token)  onToken?.(event.token)
          if (event.done)   onDone?.(event)
          if (event.error)  onError?.(event.error)
        } catch {}
      }
    }
  }).catch((err) => {
    if (err.name !== 'AbortError') onError?.(err.message)
  })

  return { cancel: () => controller.abort() }
}

// ── SSE para POST (chat IA) — usando fetch com body
export function createSSEPost(path, body, onToken, onDone, onError) {
  const token      = getToken()
  const url        = `${BASE_URL}${path}`
  const controller = new AbortController()

  fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream'
    },
    body:   JSON.stringify(body),
    signal: controller.signal
  }).then(async (res) => {
    if (!res.ok) { onError?.(`HTTP ${res.status}`); return }
    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.token)  onToken?.(event.token)
          if (event.done)   onDone?.(event)
          if (event.error)  onError?.(event.error)
          if (event.status) onToken?.('') // keep-alive
        } catch {}
      }
    }
  }).catch((err) => { if (err.name !== 'AbortError') onError?.(err.message) })

  return { cancel: () => controller.abort() }
}
