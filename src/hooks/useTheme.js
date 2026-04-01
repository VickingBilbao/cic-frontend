/**
 * CIC — Sistema de Temas White-Label
 *
 * Cada org tem seu próprio tema: cores, nome do produto, persona da IA.
 * O tema padrão é o CIC (vermelho + ciano), mas pode ser sobrescrito
 * via org_configs no Supabase, tornando o sistema replicável para
 * qualquer marketeiro político.
 *
 * Uso:
 *   const theme = useTheme()
 *   theme.primary   → '#FF2D2D'
 *   theme.accent    → '#00E5FF'
 *   theme.persona   → 'Fernando Carreiro'
 *   theme.apply()   → injeta CSS variables no :root
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client.js'
import useAppStore from '../store/useAppStore.js'

// ─────────────────────────────────────────────
// Tema default (CIC original)
// ─────────────────────────────────────────────
export const DEFAULT_THEME = {
  // Identidade
  productName:    'CIC',
  productVersion: 'v4',
  logoUrl:        null,   // null = usa CICLogo SVG embutido

  // Persona da IA
  persona: {
    name:         'Fernando Carreiro',
    title:        'Estrategista-chefe',
    description:  'Metodologia Fernando Carreiro — 20+ anos, 50+ campanhas vitoriosas',
    shortDesc:    'Metodologia Fernando Carreiro',
  },

  // Paleta de cores (hex)
  colors: {
    primary:      '#FF2D2D',   // vermelho CIC
    primaryGlow:  'rgba(255,45,45,0.18)',
    accent:       '#00E5FF',   // ciano
    accentGlow:   'rgba(0,229,255,0.14)',
    success:      '#34D399',
    warning:      '#FBBF24',
    text1:        '#F0EDE8',
    text2:        '#B8B3AB',
    text3:        '#7A756E',
    text4:        '#4A463F',
    bgCard:       'rgba(255,255,255,0.06)',
    bgSurface:    'rgba(255,255,255,0.04)',
    bgSidebar:    'rgba(20,20,28,0.65)',
  },

  // Tipografia
  font:  'Outfit',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
}

// ─────────────────────────────────────────────
// Aplica o tema como CSS variables no :root
// ─────────────────────────────────────────────
export function applyTheme(theme) {
  const c = theme.colors
  const root = document.documentElement
  root.style.setProperty('--cic-primary',       c.primary)
  root.style.setProperty('--cic-primary-glow',  c.primaryGlow)
  root.style.setProperty('--cic-accent',        c.accent)
  root.style.setProperty('--cic-accent-glow',   c.accentGlow)
  root.style.setProperty('--cic-success',       c.success)
  root.style.setProperty('--cic-warning',       c.warning)
  root.style.setProperty('--cic-t1',            c.text1)
  root.style.setProperty('--cic-t2',            c.text2)
  root.style.setProperty('--cic-t3',            c.text3)
  root.style.setProperty('--cic-t4',            c.text4)
  root.style.setProperty('--cic-bg-card',       c.bgCard)
  root.style.setProperty('--cic-bg-surface',    c.bgSurface)
  root.style.setProperty('--cic-bg-sidebar',    c.bgSidebar)
  root.style.setProperty('--cic-font',          theme.font)
}

// ─────────────────────────────────────────────
// Merge org config com defaults
// ─────────────────────────────────────────────
function mergeWithDefaults(orgConfig) {
  if (!orgConfig) return DEFAULT_THEME
  return {
    ...DEFAULT_THEME,
    ...orgConfig,
    colors:  { ...DEFAULT_THEME.colors,  ...(orgConfig.colors  || {}) },
    persona: { ...DEFAULT_THEME.persona, ...(orgConfig.persona || {}) },
  }
}

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────
export function useTheme() {
  const [theme, setTheme]               = useState(DEFAULT_THEME)
  const [modulesEnabled, setModulesEnabled] = useState(null)   // null = ainda carregando
  const [loading, setLoading]           = useState(true)
  const isLoggedIn = useAppStore(s => s.isLoggedIn)

  const loadOrgTheme = useCallback(async () => {
    try {
      const data = await api.get('/org/config')
      if (data?.theme) {
        const merged = mergeWithDefaults(data.theme)
        setTheme(merged)
        applyTheme(merged)
      }
      if (data?.modules_enabled) {
        setModulesEnabled(data.modules_enabled)
      }
    } catch {
      // sem config de org → mantém default (todos os módulos liberados)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { applyTheme(DEFAULT_THEME) }, [])

  useEffect(() => {
    if (isLoggedIn) loadOrgTheme()
    else setLoading(false)
  }, [isLoggedIn, loadOrgTheme])

  return { theme, persona: theme.persona, modulesEnabled, loading }
}

// ─────────────────────────────────────────────
// Objeto `g` compatível com o código existente
// Retorna as cores do tema atual via CSS vars
// (para uso direto em style={{ color: g.red }})
// ─────────────────────────────────────────────
export function makeG(theme) {
  const c = theme.colors
  return {
    card:    { background: c.bgCard,    backdropFilter:'blur(40px) saturate(180%)', WebkitBackdropFilter:'blur(40px) saturate(180%)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16 },
    surface: { background: c.bgSurface, backdropFilter:'blur(24px)',               WebkitBackdropFilter:'blur(24px)',                border:'1px solid rgba(255,255,255,0.08)', borderRadius:12 },
    sidebar: { background: c.bgSidebar, backdropFilter:'blur(60px) saturate(200%)', WebkitBackdropFilter:'blur(60px) saturate(200%)', borderRight:'1px solid rgba(255,255,255,0.08)' },
    input:   { background: c.bgSurface, border:'1px solid rgba(255,255,255,0.10)', borderRadius:10, color:c.text1, outline:'none' },
    red:  c.primary,
    rg:   c.primaryGlow,
    cyan: c.accent,
    cg:   c.accentGlow,
    gn:   c.success,
    am:   c.warning,
    t1:   c.text1,
    t2:   c.text2,
    t3:   c.text3,
    t4:   c.text4,
  }
}
