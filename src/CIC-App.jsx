/**
 * CIC-App.jsx — Camada de integração frontend ↔ backend
 *
 * Estratégia: o CIC-LiquidGlass.jsx é 100% visual (mock data).
 * Este arquivo é o ponto de entrada real que:
 *   1. Gerencia autenticação real via Supabase/Fastify
 *   2. Carrega campanhas reais da API
 *   3. Provê contexto global (CICContext) para os painéis
 *   4. Substitui chamadas mock por dados reais progressivamente
 *
 * main.jsx importa este arquivo, não o CIC-LiquidGlass diretamente.
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import useAppStore from './store/useAppStore.js'
import { auth, campaigns, dashboard, ia } from './api/endpoints.js'
import { useChat } from './hooks/useChat.js'

// ── Contexto Global CIC ───────────────────────────────────────
export const CICContext = createContext(null)
export const useCIC = () => useContext(CICContext)

// ── Provider que envolve toda a aplicação ────────────────────
export function CICProvider({ children }) {
  const store       = useAppStore()
  const chatGeral   = useChat('geral')
  const chatRoteiro = useChat('roteiros')
  const chatEstr    = useChat('estrategia')

  const [dashData,   setDashData]   = useState(null)
  const [campaigns_,  setCampaigns]  = useState([])
  const [loadingDash, setLoadingDash] = useState(false)

  // ── Carrega campanhas após login ──────────────────────────
  useEffect(() => {
    if (!store.isLoggedIn) return
    campaigns.list()
      .then(d => setCampaigns(d.campaigns || []))
      .catch(() => {})
  }, [store.isLoggedIn])

  // ── Carrega dashboard ao selecionar campanha ──────────────
  useEffect(() => {
    if (!store.currentCampaign?.id) return
    setLoadingDash(true)
    Promise.all([
      dashboard.kpis(store.currentCampaign.id),
      dashboard.alerts(store.currentCampaign.id)
    ]).then(([kpis, alerts]) => {
      setDashData({ ...kpis, alertas: alerts.alerts || [] })
    }).catch(() => {}).finally(() => setLoadingDash(false))
  }, [store.currentCampaign?.id])

  // ── Função de login que chama o backend real ──────────────
  const login = useCallback(async (email, password) => {
    return store.login(email, password)
  }, [store])

  // ── Função de logout ──────────────────────────────────────
  const logout = useCallback(() => store.logout(), [store])

  const value = {
    // Auth
    user:            store.user,
    isLoggedIn:      store.isLoggedIn,
    login,
    logout,

    // Campanhas
    campaignList:    campaigns_,
    currentCampaign: store.currentCampaign,
    selectCampaign:  store.selectCampaign,

    // Dashboard
    dashData,
    loadingDash,

    // Chats por agente
    chatGeral,
    chatRoteiro,
    chatEstr,

    // Helpers
    cid: store.currentCampaign?.id
  }

  return <CICContext.Provider value={value}>{children}</CICContext.Provider>
}

// ── HOC: conecta o botão de login real sem reescrever o componente visual
// Uso no CIC-LiquidGlass: trocar <Login onGo={handleMockLogin} />
// por  <LoginConnected onSuccess={handleAfterLogin} />
export function LoginConnected({ onSuccess }) {
  const { login } = useCIC()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const g = {
    card:  { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(40px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16 },
    input: { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, color:'#F0EDE8', outline:'none' },
    red: '#FF2D2D', cyan: '#00E5FF', t1: '#F0EDE8', t2: '#B8B3AB', t3: '#7A756E', t4: '#4A463F'
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha email e senha'); return }
    setLoading(true); setError('')
    const result = await login(email, password)
    setLoading(false)
    if (result.ok) { onSuccess?.() }
    else { setError(result.error || 'Erro ao fazer login') }
  }

  return (
    <div style={{ width:340 }}>
      <div style={{ ...g.card, padding:'32px 28px', borderRadius:24 }}>
        <h2 style={{ fontSize:19, fontWeight:700, color:g.t1, marginBottom:3, textAlign:'center' }}>
          Acessar plataforma
        </h2>
        <p style={{ fontSize:10, color:g.t4, textAlign:'center', marginBottom:24 }}>
          Entre no seu centro de inteligência
        </p>

        {error && (
          <div style={{ background:'rgba(255,45,45,0.12)', border:'1px solid rgba(255,45,45,0.25)',
            borderRadius:8, padding:'8px 12px', fontSize:11, color:g.red, marginBottom:14 }}>
            {error}
          </div>
        )}

        <label style={{ fontSize:10, color:g.t3, display:'block', marginBottom:4, fontWeight:500 }}>E-mail</label>
        <input
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ ...g.input, width:'100%', padding:'12px 14px', fontSize:12, boxSizing:'border-box', marginBottom:14, borderRadius:12 }}
        />

        <label style={{ fontSize:10, color:g.t3, display:'block', marginBottom:4, fontWeight:500 }}>Senha</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ ...g.input, width:'100%', padding:'12px 14px', fontSize:12, boxSizing:'border-box', marginBottom:20, borderRadius:12 }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width:'100%', padding:14, background: loading ? '#666' : `linear-gradient(135deg,${g.red},#CC1E1E)`,
            color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700,
            cursor: loading ? 'not-allowed' : 'pointer', transition:'all .2s' }}
        >
          {loading ? 'Entrando...' : 'Entrar no CIC'}
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:14 }}>
          <span style={{ fontSize:10, color:g.t4 }}>
            Esqueceu? <span style={{ color:g.cyan, cursor:'pointer' }}>Recuperar</span>
          </span>
          <span style={{ fontSize:10, color:g.t4 }}>
            Novo? <span style={{ color:g.cyan, cursor:'pointer' }}>Solicitar</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Selector de campanha conectado ao backend real ────────────
export function CampaignSelectorConnected({ onSelect }) {
  const { campaignList, selectCampaign } = useCIC()

  if (!campaignList.length) {
    return (
      <div style={{ color:'#7A756E', fontSize:13, padding:24, textAlign:'center' }}>
        Carregando campanhas...
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, padding:16 }}>
      {campaignList.map(camp => (
        <button
          key={camp.id}
          onClick={() => { selectCampaign(camp); onSelect?.(camp) }}
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)',
            borderRadius:12, padding:'14px 16px', color:'#F0EDE8', cursor:'pointer',
            display:'flex', alignItems:'center', gap:12, textAlign:'left' }}
        >
          <div style={{ width:36, height:36, borderRadius:10, background:camp.color || '#FF2D2D',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>
            {camp.initials}
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600 }}>{camp.name}</div>
            <div style={{ fontSize:10, color:'#7A756E' }}>{camp.cargo} · {camp.city}/{camp.state}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
