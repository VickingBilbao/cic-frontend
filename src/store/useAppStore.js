/**
 * CIC — Store Global (Zustand)
 * Estado compartilhado entre todos os módulos do frontend.
 */

import { create } from 'zustand'
import { setSession, clearSession, setCurrentCampaign } from '../api/client.js'
import { auth, campaigns, dashboard } from '../api/endpoints.js'

const useAppStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────
  user:          null,
  token:         null,
  isLoggedIn:    false,
  isLoading:     false,
  authError:     null,

  login: async (email, password) => {
    set({ isLoading: true, authError: null })
    try {
      const data = await auth.login(email, password)
      setSession(data.token, data.user)
      set({ user: data.user, token: data.token, isLoggedIn: true, isLoading: false })
      return { ok: true }
    } catch (err) {
      set({ authError: err.message, isLoading: false })
      return { ok: false, error: err.message }
    }
  },

  logout: async () => {
    try { await auth.logout() } catch {}
    clearSession()
    set({ user: null, token: null, isLoggedIn: false, currentCampaign: null })
  },

  // ── Campanha selecionada ────────────────────────────────────
  currentCampaign: (() => { try { return JSON.parse(localStorage.getItem('cic_campaign') || 'null') } catch { return null } })(),
  campaignList:    [],
  campaignLoading: false,

  loadCampaigns: async () => {
    set({ campaignLoading: true })
    try {
      const data = await campaigns.list()
      set({ campaignList: data.campaigns || [], campaignLoading: false })
    } catch {
      set({ campaignLoading: false })
    }
  },

  selectCampaign: (campaign) => {
    setCurrentCampaign(campaign)
    set({ currentCampaign: campaign })
  },

  // ── Dashboard ───────────────────────────────────────────────
  dashKPIs:     null,
  dashAlerts:   [],
  dashLoading:  false,

  loadDashboard: async () => {
    const cid = get().currentCampaign?.id
    if (!cid) return
    set({ dashLoading: true })
    try {
      const [kpisData, alertsData] = await Promise.all([
        dashboard.kpis(cid),
        dashboard.alerts(cid)
      ])
      set({ dashKPIs: kpisData, dashAlerts: alertsData.alerts || [], dashLoading: false })
    } catch {
      set({ dashLoading: false })
    }
  },

  // ── Notificações ─────────────────────────────────────────────
  notificacoes:       [],
  notificacoesCount:  0,

  // ── UI state ─────────────────────────────────────────────────
  sidebarCollapsed: false,
  activeModule:     'dash',

  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setActiveModule:     (m) => set({ activeModule: m })
}))

export default useAppStore
