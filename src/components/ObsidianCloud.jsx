/**
 * CIC — Obsidian Thought Cloud v3
 * Grafo de conhecimento com D3 force-simulation (mesmo motor do Obsidian).
 * D3 é dono do SVG; React gerencia apenas UI state (seleção, filtro, forms).
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { useObsidian } from '../hooks/useDataHooks.js'
import useAppStore from '../store/useAppStore.js'
import { obsidian as obsidianApi } from '../api/endpoints.js'

const g = {
  card: { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(40px) saturate(180%)', WebkitBackdropFilter:'blur(40px) saturate(180%)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16 },
  t1:'#F0EDE8', t2:'#B8B3AB', t3:'#7A756E', t4:'#4A463F',
  red:'#FF2D2D', cyan:'#00E5FF', gn:'#34D399', am:'#FBBF24', purple:'#7c3aed',
}

const TYPE_LABELS = {
  campanha:'Campanha', decisao:'Decisão',
  swot_forca:'Força', swot_fraqueza:'Fraqueza',
  swot_oportunidade:'Oportunidade', swot_ameaca:'Ameaça',
  conteudo:'Conteúdo', segmento:'Segmento',
  topico_monitoramento:'Monitoramento', estrategia:'Estratégia',
  nota:'Nota', nota_ia:'Nota IA', conhecimento:'Conhecimento',
}

const NODE_R = (w) => 5 + (w || 1) * 2.2

export default function ObsidianCloud() {
  const { nodes, edges, meta, loading, error, refetch } = useObsidian()
  const cid = useAppStore(s => s.currentCampaign?.id)

  const svgRef  = useRef(null)
  const simRef  = useRef(null)   // d3 simulation instance
  const gRef    = useRef(null)   // d3 main group

  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType,   setFilterType]   = useState(null)
  const [showNote,     setShowNote]     = useState(false)
  const [noteTitle,    setNoteTitle]    = useState('')
  const [noteBody,     setNoteBody]     = useState('')
  const [noteTags,     setNoteTags]     = useState('')
  const [seeding,      setSeeding]      = useState(false)
  const [seedMsg,      setSeedMsg]      = useState(null)

  // ── Inicializa o grafo D3 quando os dados chegam ───────────────────────
  useEffect(() => {
    if (!nodes.length || !svgRef.current) return

    const el   = svgRef.current
    const rect = el.getBoundingClientRect()
    const W    = rect.width  || 900
    const H    = rect.height || 600

    // Limpa render anterior
    d3.select(el).selectAll('*').remove()
    if (simRef.current) simRef.current.stop()

    // Copia profunda dos dados para o D3 (ele mutará x, y, vx, vy)
    const simNodes = nodes.map(n => ({ ...n }))
    const idSet    = new Set(simNodes.map(n => n.id))
    const simEdges = edges
      .filter(e => idSet.has(e.source) && idSet.has(e.target))
      .map(e => ({ ...e }))   // D3 vai substituir source/target por objetos

    // ── SVG base ──────────────────────────────────────────────────────────
    const svg = d3.select(el)
      .attr('width', '100%')
      .attr('height', '100%')

    // Clica no fundo → deseleciona
    svg.on('click', () => setSelectedNode(null))

    // Grupo principal (zoom/pan vai transladar este grupo)
    const group = svg.append('g')
    gRef.current = group

    // ── Zoom / Pan ────────────────────────────────────────────────────────
    const zoom = d3.zoom()
      .scaleExtent([0.08, 6])
      .on('zoom', (event) => { group.attr('transform', event.transform) })

    svg.call(zoom)

    // Centraliza zoom inicial
    svg.call(zoom.transform, d3.zoomIdentity.translate(W/2, H/2).scale(1))

    // ── Camada de edges ───────────────────────────────────────────────────
    const linkG = group.append('g').attr('class', 'links')
    const link  = linkG.selectAll('line')
      .data(simEdges)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', d => Math.sqrt(d.weight || 1))
      .attr('stroke-dasharray', d => d.type === 'relacionado' ? '4 3' : null)

    // ── Camada de nodes ───────────────────────────────────────────────────
    const nodeG = group.append('g').attr('class', 'nodes')
    const node  = nodeG.selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')

    // Halo de seleção (oculto por padrão)
    node.append('circle')
      .attr('class', 'halo')
      .attr('r', d => NODE_R(d.weight) + 7)
      .attr('fill', 'none')
      .attr('stroke', d => d.color || g.cyan)
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)

    // Círculo principal
    node.append('circle')
      .attr('class', 'body')
      .attr('r', d => NODE_R(d.weight))
      .attr('fill', d => d.color || '#6366f1')
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .attr('stroke-width', 1)

    // Label
    node.append('text')
      .attr('class', 'label')
      .attr('dy', d => NODE_R(d.weight) + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
      .attr('fill', '#B8B3AB')
      .attr('pointer-events', 'none')
      .text(d => (d.label?.length > 20) ? d.label.slice(0, 18) + '…' : (d.label || ''))

    // ── Drag ─────────────────────────────────────────────────────────────
    node.call(
      d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x; d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simRef.current?.alphaTarget(0)
          d.fx = null; d.fy = null
        })
    )

    // ── Click no nó ──────────────────────────────────────────────────────
    node.on('click', (event, d) => {
      event.stopPropagation()
      setSelectedNode(prev => prev?.id === d.id ? null : d)
    })

    // ── Hover: destaca conexões ────────────────────────────────────────
    node
      .on('mouseenter', (_, d) => {
        const connIds = new Set(
          simEdges.filter(e => e.source.id === d.id || e.target.id === d.id)
            .flatMap(e => [e.source.id, e.target.id])
        )
        link.attr('stroke', e =>
          (e.source.id === d.id || e.target.id === d.id)
            ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)')
        node.select('.body').attr('opacity', n =>
          n.id === d.id || connIds.has(n.id) ? 1 : 0.3)
        node.select('.label').attr('opacity', n =>
          n.id === d.id || connIds.has(n.id) ? 1 : 0.25)
      })
      .on('mouseleave', () => {
        link.attr('stroke', 'rgba(255,255,255,0.12)')
        node.select('.body').attr('opacity', 1)
        node.select('.label').attr('opacity', 1)
      })

    // ── Simulação de força ────────────────────────────────────────────────
    const sim = d3.forceSimulation(simNodes)
      .force('link',      d3.forceLink(simEdges).id(d => d.id).distance(120).strength(0.4))
      .force('charge',    d3.forceManyBody().strength(-400).distanceMax(500))
      .force('center',    d3.forceCenter(0, 0).strength(0.06))
      .force('collision', d3.forceCollide().radius(d => NODE_R(d.weight) + 5).strength(0.8))
      .alphaDecay(0.025)
      .velocityDecay(0.4)

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    simRef.current = sim

    return () => { sim.stop(); d3.select(el).on('.zoom', null) }
  }, [nodes, edges])

  // ── Atualiza halo de seleção sem recriar o grafo ──────────────────────
  useEffect(() => {
    if (!gRef.current) return
    gRef.current.selectAll('.node .halo')
      .attr('opacity', d => selectedNode?.id === d.id ? 0.6 : 0)
    gRef.current.selectAll('.node .body')
      .attr('stroke', d => selectedNode?.id === d.id ? '#fff' : 'rgba(255,255,255,0.2)')
      .attr('stroke-width', d => selectedNode?.id === d.id ? 2 : 1)
  }, [selectedNode])

  // ── Filtra nodes/edges visíveis sem recriar o grafo ───────────────────
  useEffect(() => {
    if (!gRef.current) return
    gRef.current.selectAll('.node')
      .attr('opacity', d => !filterType || filterType === d.type || d.type === 'campanha' ? 1 : 0.08)
    gRef.current.selectAll('.links line')
      .attr('opacity', d => {
        if (!filterType) return 1
        const srcType = d.source.type, tgtType = d.target.type
        return (srcType === filterType || srcType === 'campanha') &&
               (tgtType === filterType || tgtType === 'campanha') ? 1 : 0.04
      })
  }, [filterType])

  // ── Salvar nota ───────────────────────────────────────────────────────
  const saveNote = async () => {
    if (!noteTitle.trim() || !noteBody.trim() || !cid) return
    try {
      await obsidianApi.addNote(cid, {
        titulo: noteTitle.trim(),
        corpo:  noteBody.trim(),
        tags:   noteTags.split(',').map(t => t.trim()).filter(Boolean),
      })
      setNoteTitle(''); setNoteBody(''); setNoteTags('')
      setShowNote(false); refetch()
    } catch(err) { console.error('saveNote:', err) }
  }

  // ── Seed IA ───────────────────────────────────────────────────────────
  const triggerSeedIA = async () => {
    if (!cid || seeding) return
    setSeeding(true)
    setSeedMsg({ type:'info', text:'Gerando base de conhecimento com IA… 30–60 segundos.' })
    try {
      const res  = await obsidianApi.seedIA(cid)
      const data = res.data ?? res
      if (data.pulado) {
        setSeedMsg({ type:'warn', text:'Esta campanha já tem base IA. Recarregando grafo…' })
        setTimeout(() => { refetch(); setSeedMsg(null) }, 3000)
      } else {
        setSeedMsg({ type:'ok', text:'Base IA iniciada! Recarregando em 8 segundos…' })
        setTimeout(() => { refetch(); setSeedMsg(null) }, 8000)
      }
    } catch(err) {
      setSeedMsg({ type:'err', text: err?.response?.data?.error || err.message || 'Erro ao gerar.' })
    } finally {
      setSeeding(false)
    }
  }

  const nodeTypes = [...new Set(nodes.map(n => n.type))].filter(t => t !== 'campanha')

  // ── Painel de detalhe do nó selecionado ───────────────────────────────
  const connectedNodes = selectedNode
    ? edges
        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
        .map(e => {
          const cId = e.source === selectedNode.id ? e.target : e.source
          return nodes.find(n => n.id === cId)
        })
        .filter(Boolean)
        .slice(0, 8)
    : []

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{fontSize:28}}>⬡</div>
      <div style={{fontSize:12,color:g.t3}}>Carregando nuvem de pensamento...</div>
    </div>
  )

  // ── Vazio ─────────────────────────────────────────────────────────────
  if (!nodes.length) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:14}}>
      <div style={{fontSize:48}}>🧠</div>
      <div style={{fontSize:15,color:g.t2,fontWeight:700}}>Nuvem de Pensamento vazia</div>
      <div style={{fontSize:11,color:g.t3,textAlign:'center',maxWidth:340,lineHeight:1.7}}>
        {error || 'A base de conhecimento está vazia. Gere automaticamente com IA ou adicione dados manualmente.'}
      </div>
      {seedMsg && (
        <div style={{padding:'8px 16px',borderRadius:10,fontSize:10,fontWeight:500,maxWidth:340,textAlign:'center',
          background:seedMsg.type==='ok'?'rgba(52,211,153,0.12)':seedMsg.type==='err'?'rgba(255,45,45,0.12)':'rgba(0,229,255,0.10)',
          border:`1px solid ${seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:g.cyan}30`,
          color:seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:g.cyan}}>
          {seedMsg.text}
        </div>
      )}
      <div style={{display:'flex',gap:10,marginTop:4}}>
        <button onClick={triggerSeedIA} disabled={seeding} style={{padding:'9px 22px',borderRadius:10,fontSize:11,fontWeight:700,cursor:seeding?'not-allowed':'pointer',border:'none',color:'#fff',background:seeding?'rgba(124,58,237,0.3)':`linear-gradient(135deg,#7c3aed,#4f46e5)`,opacity:seeding?.7:1,boxShadow:seeding?'none':'0 0 24px rgba(124,58,237,0.4)'}}>
          {seeding ? '⟳ Gerando…' : '✦ Gerar Base IA'}
        </button>
        <button onClick={refetch} style={{padding:'9px 16px',borderRadius:10,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.2)',color:g.cyan,fontSize:11,cursor:'pointer'}}>Recarregar</button>
      </div>
    </div>
  )

  // ── Render principal ──────────────────────────────────────────────────
  return (
    <div style={{height:'calc(100vh - 110px)',display:'flex',flexDirection:'column',gap:10}}>

      {/* Toolbar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:3,height:22,borderRadius:2,background:`linear-gradient(180deg,${g.red},${g.cyan})`}}/>
          <h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Nuvem de Pensamento</h2>
          <span style={{fontSize:8,color:g.cyan,background:'rgba(0,229,255,0.14)',padding:'2px 8px',borderRadius:8,fontWeight:600}}>
            {meta.totalNodes || nodes.length} nós · {meta.totalEdges || edges.length} arestas
          </span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={() => setFilterType(null)} style={{padding:'4px 10px',borderRadius:8,fontSize:9,cursor:'pointer',border:'1px solid rgba(255,255,255,0.1)',background:!filterType?'rgba(0,229,255,0.15)':'rgba(255,255,255,0.04)',color:!filterType?g.cyan:g.t3}}>Todos</button>
          {nodeTypes.map(type => (
            <button key={type} onClick={() => setFilterType(filterType===type?null:type)}
              style={{padding:'4px 10px',borderRadius:8,fontSize:9,cursor:'pointer',border:'1px solid rgba(255,255,255,0.1)',background:filterType===type?'rgba(0,229,255,0.15)':'rgba(255,255,255,0.04)',color:filterType===type?g.cyan:g.t3}}>
              {TYPE_LABELS[type]||type}
            </button>
          ))}
          <button onClick={() => setShowNote(true)} style={{padding:'4px 12px',borderRadius:8,fontSize:9,cursor:'pointer',background:`linear-gradient(135deg,${g.red},#CC1E1E)`,border:'none',color:'#fff',fontWeight:600}}>+ Nota</button>
          <button onClick={triggerSeedIA} disabled={seeding} style={{padding:'4px 12px',borderRadius:8,fontSize:9,cursor:seeding?'not-allowed':'pointer',border:seeding?`1px solid ${g.am}40`:'none',background:seeding?`rgba(251,191,36,0.1)`:`linear-gradient(135deg,#7c3aed,#4f46e5)`,color:seeding?g.am:'#fff',fontWeight:600,opacity:seeding?.75:1}}>
            {seeding ? '⟳ Gerando…' : '✦ Gerar Base IA'}
          </button>
        </div>
      </div>

      {/* Seed message */}
      {seedMsg && (
        <div style={{padding:'8px 14px',borderRadius:10,fontSize:10,fontWeight:500,flexShrink:0,
          background:seedMsg.type==='ok'?'rgba(52,211,153,0.12)':seedMsg.type==='err'?'rgba(255,45,45,0.12)':seedMsg.type==='warn'?'rgba(251,191,36,0.12)':'rgba(0,229,255,0.10)',
          border:`1px solid ${seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:seedMsg.type==='warn'?g.am:g.cyan}30`,
          color:seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:seedMsg.type==='warn'?g.am:g.cyan,
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <span>{seedMsg.text}</span>
          <button onClick={() => setSeedMsg(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:12,opacity:.6}}>✕</button>
        </div>
      )}

      {/* Grafo + painel */}
      <div style={{flex:1,display:'flex',gap:10,minHeight:0}}>

        {/* Canvas SVG */}
        <div style={{flex:1,...g.card,overflow:'hidden',position:'relative'}}>
          <svg ref={svgRef} style={{width:'100%',height:'100%',display:'block'}}/>
          <div style={{position:'absolute',bottom:10,left:12,fontSize:8,color:g.t4,padding:'3px 8px',borderRadius:6,background:'rgba(0,0,0,0.4)',pointerEvents:'none'}}>
            Scroll: zoom · Arrastar fundo: pan · Arrastar nó: mover
          </div>
        </div>

        {/* Painel de detalhe */}
        {selectedNode && (
          <div style={{width:230,...g.card,padding:14,display:'flex',flexDirection:'column',gap:10,overflowY:'auto',flexShrink:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:8,fontWeight:600,marginBottom:6,display:'inline-flex',padding:'2px 8px',borderRadius:8,
                  background:(selectedNode.color||g.cyan)+'20',color:selectedNode.color||g.cyan}}>
                  {TYPE_LABELS[selectedNode.type]||selectedNode.type}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:g.t1,lineHeight:1.35,wordBreak:'break-word'}}>{selectedNode.label}</div>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{background:'none',border:'none',color:g.t4,cursor:'pointer',fontSize:14,flexShrink:0}}>✕</button>
            </div>

            {/* Descrição / corpo */}
            {(selectedNode.meta?.descricao || selectedNode.meta?.corpo || selectedNode.meta?.preview) && (
              <div style={{fontSize:10,color:g.t2,lineHeight:1.65}}>
                {(selectedNode.meta.corpo || selectedNode.meta.descricao || selectedNode.meta.preview || '').slice(0,220)}
                {((selectedNode.meta.corpo||selectedNode.meta.descricao||selectedNode.meta.preview||'').length > 220) ? '…' : ''}
              </div>
            )}

            {/* Meta extra */}
            {selectedNode.meta && Object.entries(selectedNode.meta)
              .filter(([k,v]) => !['descricao','corpo','preview'].includes(k) && v != null && String(v).length < 60)
              .length > 0 && (
              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:8}}>
                <div style={{fontSize:8,color:g.t4,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Info</div>
                {Object.entries(selectedNode.meta)
                  .filter(([k,v]) => !['descricao','corpo','preview'].includes(k) && v != null && String(v).length < 60)
                  .map(([k,v]) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:4,gap:6}}>
                    <span style={{fontSize:9,color:g.t3,flexShrink:0,textTransform:'capitalize'}}>{k}</span>
                    <span style={{fontSize:9,color:g.t2,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>
                      {typeof v==='object'?JSON.stringify(v):String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {selectedNode.tags?.length > 0 && (
              <div>
                <div style={{fontSize:8,color:g.t4,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Tags</div>
                <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                  {selectedNode.tags.map(t => (
                    <span key={t} style={{fontSize:7,color:g.cyan,background:g.cyan+'14',padding:'2px 6px',borderRadius:6}}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Conexões */}
            {connectedNodes.length > 0 && (
              <div>
                <div style={{fontSize:8,color:g.t4,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Conectado a ({connectedNodes.length})</div>
                {connectedNodes.map(cn => (
                  <div key={cn.id} onClick={() => setSelectedNode(cn)}
                    style={{display:'flex',alignItems:'center',gap:6,padding:'5px 0',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:cn.color||g.cyan,flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:9,color:g.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cn.label}</div>
                      <div style={{fontSize:7,color:g.t4}}>{TYPE_LABELS[cn.type]||cn.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de nota */}
      {showNote && (
        <div onClick={() => setShowNote(false)}
          style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e => e.stopPropagation()}
            style={{...g.card,padding:22,width:370,display:'flex',flexDirection:'column',gap:12}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:g.t1}}>Nova Nota Estratégica</h3>
            <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
              placeholder="Título da nota..."
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:g.t1,padding:'8px 12px',fontSize:11,outline:'none'}}/>
            <textarea value={noteBody} onChange={e => setNoteBody(e.target.value)}
              placeholder="Conteúdo estratégico..." rows={5}
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:g.t1,padding:10,fontSize:11,resize:'none',outline:'none'}}/>
            <input value={noteTags} onChange={e => setNoteTags(e.target.value)}
              placeholder="Tags: estratégia, crise, eleitores…"
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:g.t1,padding:'8px 12px',fontSize:11,outline:'none'}}/>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={() => setShowNote(false)}
                style={{padding:'7px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:g.t3,fontSize:10,cursor:'pointer'}}>Cancelar</button>
              <button onClick={saveNote} disabled={!noteTitle.trim()||!noteBody.trim()}
                style={{padding:'7px 16px',borderRadius:8,border:'none',color:'#fff',fontSize:10,fontWeight:600,cursor:'pointer',
                  background:`linear-gradient(135deg,${g.red},#CC1E1E)`,
                  opacity:(!noteTitle.trim()||!noteBody.trim())?.5:1}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
