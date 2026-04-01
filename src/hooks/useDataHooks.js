/**
 * CIC — Hooks de dados por módulo
 * Cada hook encapsula fetch + loading + error para um módulo.
 * Uso: const { data, loading, error, refetch } = useDemandas()
 */

import { useState, useEffect, useCallback } from 'react'
import { demandas, crm, monitoramento, fundraising, producao,
         agenda, voluntarios, debate, estrategia, gotv,
         social, diagnostico, ia as iaApi } from '../api/endpoints.js'
import useAppStore from '../store/useAppStore.js'

// ── Helper base ───────────────────────────────────────────────
function useQuery(fetcher, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const cid = useAppStore(s => s.currentCampaign?.id)

  const fetch_ = useCallback(async () => {
    if (!cid) return
    setLoading(true); setError(null)
    try   { setData(await fetcher()) }
    catch (e) { setError(e.message) }
    finally   { setLoading(false) }
  }, [cid, ...deps])

  useEffect(() => { fetch_() }, [fetch_])
  return { data, loading, error, refetch: fetch_ }
}

// ── Hooks por módulo ──────────────────────────────────────────

export function useDemandas(params = {}) {
  const { data, loading, error, refetch } = useQuery(() => demandas.list(params))
  return { demandas: data?.demandas || [], loading, error, refetch }
}

export function useMonitoramento() {
  const [data, setData] = useState({ redes: [], crises: [], adversarios: [] })
  const [loading, setLoading] = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    Promise.all([
      monitoramento.redes(),
      monitoramento.crises(),
      monitoramento.adversarios()
    ]).then(([r, c, a]) => {
      setData({ redes: r.eventos || [], crises: c.crises || [], adversarios: a.adversarios || [] })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  return { ...data, loading }
}

export function useCRM() {
  const { data, loading, error, refetch } = useQuery(() => crm.eleitores())
  const [scoring, setScoring] = useState(null)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    crm.scoring().then(d => setScoring(d)).catch(() => {})
  }, [cid])

  return { eleitores: data?.eleitores || [], scoring, loading, error, refetch }
}

export function useFundraising() {
  const [overview, setOverview]     = useState(null)
  const [doadores, setDoadores]     = useState([])
  const [compliance, setCompliance] = useState(null)
  const [loading, setLoading]       = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    Promise.all([
      fundraising.overview(),
      fundraising.doadores(),
      fundraising.compliance()
    ]).then(([o, d, c]) => {
      setOverview(o); setDoadores(d.doadores || []); setCompliance(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  return { overview, doadores, compliance, loading }
}

export function useProducao() {
  const { data, loading, error, refetch } = useQuery(() => producao.listar())
  const [gerando, setGerando] = useState(false)

  const gerar = useCallback(async (body) => {
    setGerando(true)
    try { const r = await producao.gerar(body); refetch(); return r }
    finally { setGerando(false) }
  }, [refetch])

  return {
    conteudos: data?.conteudos || [], loading, error,
    gerando, gerar,
    aprovar: (gid, nota) => producao.aprovar(gid, nota).then(refetch),
    rejeitar: (gid, nota) => producao.rejeitar(gid, nota).then(refetch)
  }
}

export function useAgenda(vista = 'semana') {
  const { data, loading, error, refetch } = useQuery(() => agenda.list(vista), [vista])
  return {
    compromissos: data?.compromissos || [], loading, error,
    criar: (body) => agenda.criar(body).then(refetch),
    remover: (aid) => agenda.remover(aid).then(refetch)
  }
}

export function useVoluntarios() {
  const [vol,     setVol]     = useState([])
  const [tarefas, setTarefas] = useState({ pendente: [], fazendo: [], concluida: [] })
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    Promise.all([
      voluntarios.list(),
      voluntarios.tarefas(),
      voluntarios.ranking()
    ]).then(([v, t, r]) => {
      setVol(v.voluntarios || [])
      setTarefas(t.kanban || { pendente:[], fazendo:[], concluida:[] })
      setRanking(r.ranking || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  return { voluntarios: vol, tarefas, ranking, loading }
}

export function useDebate() {
  const [sessao,  setSessao]  = useState(null)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(false)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    debate.stats().then(d => setStats(d)).catch(() => {})
  }, [cid])

  const iniciar = async (oponente) => {
    setLoading(true)
    const s = await debate.iniciar(oponente)
    setSessao(s); setLoading(false)
    return s
  }

  const responder = async (resposta) => {
    if (!sessao) return
    return debate.responder(sessao.sessaoId, resposta)
  }

  return { sessao, stats, loading, iniciar, responder }
}

export function useEstrategia() {
  const [decisoes, setDecisoes] = useState([])
  const [narrativa, setNarrativa] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  const load = useCallback(() => {
    if (!cid) return
    Promise.all([
      estrategia.decisoes(),
      estrategia.narrativa(),
      estrategia.timeline()
    ]).then(([d, n, t]) => {
      setDecisoes(d.decisoes || [])
      setNarrativa(n.narrativa)
      setTimeline(t.timeline || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  useEffect(() => { load() }, [load])

  const decidir = async (did, acao, nota) => {
    await estrategia.decidir(did, acao, nota)
    load()
  }

  return { decisoes, narrativa, timeline, loading, decidir }
}

export function useGOTV() {
  const [status,    setStatus]    = useState(null)
  const [checklist, setChecklist] = useState([])
  const [loading,   setLoading]   = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  const load = useCallback(() => {
    if (!cid) return
    Promise.all([gotv.status(), gotv.checklist()])
      .then(([s, c]) => { setStatus(s); setChecklist(c.checklist || []) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  useEffect(() => { load() }, [load])

  const marcar = async (itemId, concluido) => {
    await gotv.marcar(itemId, concluido)
    load()
  }

  return { status, checklist, loading, marcar }
}

export function useDiagnostico() {
  const [pesquisas, setPesquisas]       = useState([])
  const [swot, setSwot]                 = useState(null)
  const [cenarios, setCenarios]         = useState([])
  const [loading, setLoading]           = useState(true)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!cid) return
    Promise.all([
      diagnostico.pesquisas(),
      diagnostico.swot(),
      diagnostico.cenarios()
    ]).then(([p, s, c]) => {
      setPesquisas(p.pesquisas || [])
      setSwot(s.swot)
      setCenarios(c.cenarios || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [cid])

  return { pesquisas, swot, cenarios, loading }
}

export function useNotificacoes() {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(false)
  const cid = useAppStore(s => s.currentCampaign?.id)

  const load = useCallback(() => {
    if (!cid) return
    setLoading(true)
    iaApi.notificacoes()
      .then(d => setNotifs(d.notificacoes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cid])

  useEffect(() => {
    load()
    // Atualiza a cada 60 segundos
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  const marcarLida = async (nid) => {
    await iaApi.marcarLida(nid)
    setNotifs(prev => prev.filter(n => n.id !== nid))
  }

  return { notificacoes: notifs, loading, marcarLida, total: notifs.length }
}
