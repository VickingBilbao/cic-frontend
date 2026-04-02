/**
 * CIC — Rede Neural (Segundo Cérebro do Marketeiro)
 * Visual minimalista estilo Obsidian: nós pequenos, linhas finas,
 * labels apenas no hover. D3 force-simulation.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { useObsidian } from '../hooks/useDataHooks.js'
import useAppStore from '../store/useAppStore.js'
import { obsidian as obsidianApi } from '../api/endpoints.js'

// ── Paleta minimalista ─────────────────────────────────────────────────────
// Nós são pequenos e cinza por padrão; cor apenas em tipos relevantes
const NODE_COLOR = {
  campanha:             '#a78bfa',   // hub central — lilás
  conhecimento:         '#67e8f9',   // ciano suave
  nota_ia:              '#86efac',   // verde suave
  nota:                 '#d8b4fe',   // lilás claro
  decisao:              '#fde68a',   // âmbar suave
  estrategia:           '#f9a8d4',   // rosa suave
  segmento:             '#93c5fd',   // azul suave
  topico_monitoramento: '#fca5a5',   // vermelho suave
  swot_forca:           '#6ee7b7',   // verde
  swot_fraqueza:        '#fca5a5',   // vermelho
  swot_oportunidade:    '#7dd3fc',   // azul
  swot_ameaca:          '#fdba74',   // laranja
  conteudo:             '#c4b5fd',   // violeta
}

// Raio do nó por tipo — hub grande, leafs pequenos
const NODE_R = {
  campanha:             14,
  conhecimento:         7,
  nota_ia:              6,
  decisao:              6,
  estrategia:           5,
  segmento:             5,
  nota:                 5,
  topico_monitoramento: 4,
  swot_forca:           4,
  swot_fraqueza:        4,
  swot_oportunidade:    4,
  swot_ameaca:          4,
  conteudo:             4,
}

const TYPE_LABELS = {
  campanha:'Campanha', decisao:'Decisão',
  swot_forca:'Força', swot_fraqueza:'Fraqueza',
  swot_oportunidade:'Oportunidade', swot_ameaca:'Ameaça',
  conteudo:'Conteúdo', segmento:'Segmento',
  topico_monitoramento:'Monitoramento', estrategia:'Estratégia',
  nota:'Nota', nota_ia:'Insight IA', conhecimento:'Conhecimento',
}

const ui = {
  bg:   'rgba(255,255,255,0.04)',
  bdr:  '1px solid rgba(255,255,255,0.08)',
  t1:   '#F0EDE8', t2:'#B8B3AB', t3:'#7A756E', t4:'#4A463F',
  red:  '#FF2D2D', cyan:'#00E5FF', gn:'#34D399', am:'#FBBF24',
}

export default function ObsidianCloud() {
  const { nodes, edges, meta, loading, error, refetch } = useObsidian()
  const cid  = useAppStore(s => s.currentCampaign?.id)
  const user = useAppStore(s => s.user)

  const svgRef  = useRef(null)
  const simRef  = useRef(null)
  const gRef    = useRef(null)
  const ttRef   = useRef(null)   // tooltip DOM element

  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType,   setFilterType]   = useState(null)
  const [showNote,     setShowNote]     = useState(false)
  const [noteTitle,    setNoteTitle]    = useState('')
  const [noteBody,     setNoteBody]     = useState('')
  const [noteTags,     setNoteTags]     = useState('')
  const [seeding,      setSeeding]      = useState(false)
  const [seedMsg,      setSeedMsg]      = useState(null)

  // ── Monta o grafo D3 ────────────────────────────────────────────────────
  useEffect(() => {
    if (!nodes.length || !svgRef.current) return

    const el   = svgRef.current
    const W    = el.clientWidth  || 960
    const H    = el.clientHeight || 620

    d3.select(el).selectAll('*').remove()
    if (simRef.current) simRef.current.stop()

    // Hub central = nome do marketeiro, não o nome da campanha
    const marketerName = user?.name || 'Rede Neural'
    const simNodes = nodes.map(n => ({
      ...n,
      label: n.type === 'campanha' ? marketerName : n.label,
    }))
    const idSet    = new Set(simNodes.map(n => n.id))
    const simEdges = edges
      .filter(e => idSet.has(e.source) && idSet.has(e.target))
      .map(e => ({ ...e }))

    // ── SVG + zoom ─────────────────────────────────────────────────────────
    const svg = d3.select(el)
    svg.on('click', () => setSelectedNode(null))

    const group = svg.append('g')
    gRef.current = group

    const zoom = d3.zoom()
      .scaleExtent([0.05, 8])
      .on('zoom', ev => group.attr('transform', ev.transform))

    svg.call(zoom)
    svg.call(zoom.transform, d3.zoomIdentity.translate(W/2, H/2))

    // ── Edges ──────────────────────────────────────────────────────────────
    const linkLayer = group.append('g')
    const link = linkLayer.selectAll('line')
      .data(simEdges).join('line')
      .attr('stroke', 'rgba(255,255,255,0.07)')
      .attr('stroke-width', 0.7)

    // ── Nodes ──────────────────────────────────────────────────────────────
    const nodeLayer = group.append('g')
    const node = nodeLayer.selectAll('g')
      .data(simNodes).join('g')
      .attr('cursor', 'pointer')

    // Halo (seleção)
    node.append('circle').attr('class','halo')
      .attr('r', d => (NODE_R[d.type] || 4) + 6)
      .attr('fill', 'none')
      .attr('stroke', d => NODE_COLOR[d.type] || 'rgba(255,255,255,0.4)')
      .attr('stroke-width', 1)
      .attr('opacity', 0)

    // Círculo principal
    node.append('circle').attr('class','body')
      .attr('r', d => NODE_R[d.type] || 4)
      .attr('fill', d => NODE_COLOR[d.type] || 'rgba(255,255,255,0.35)')
      .attr('stroke', 'rgba(0,0,0,0.25)')
      .attr('stroke-width', 0.5)

    // Label — aparece só no hover via CSS opacity
    node.append('text').attr('class','lbl')
      .attr('dy', d => (NODE_R[d.type] || 4) + 11)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('font-family', 'inherit')
      .attr('fill', 'rgba(240,237,232,0.0)')   // invisível por padrão
      .attr('pointer-events', 'none')
      .text(d => (d.label?.length > 22) ? d.label.slice(0,20)+'…' : (d.label||''))

    // ── Interações ─────────────────────────────────────────────────────────
    node
      .on('mouseenter', (event, d) => {
        // Mostra label
        d3.select(event.currentTarget).select('.lbl')
          .attr('fill', 'rgba(240,237,232,0.85)')
        // Destaca conexões
        const connIds = new Set(
          simEdges.filter(e => e.source.id===d.id || e.target.id===d.id)
            .flatMap(e => [e.source.id, e.target.id])
        )
        link
          .attr('stroke', e =>
            e.source.id===d.id || e.target.id===d.id
              ? (NODE_COLOR[d.type]||'rgba(255,255,255,0.5)')+'99'
              : 'rgba(255,255,255,0.03)')
          .attr('stroke-width', e =>
            e.source.id===d.id || e.target.id===d.id ? 1.2 : 0.5)
        node.select('.body')
          .attr('opacity', n => n.id===d.id || connIds.has(n.id) ? 1 : 0.15)
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).select('.lbl')
          .attr('fill', d => d.id === (selectedNode?.id) ? 'rgba(240,237,232,0.85)' : 'rgba(240,237,232,0.0)')
        link
          .attr('stroke', 'rgba(255,255,255,0.07)')
          .attr('stroke-width', 0.7)
        node.select('.body').attr('opacity', d =>
          !filterType || filterType===d.type || d.type==='campanha' ? 1 : 0.06)
      })
      .on('click', (event, d) => {
        event.stopPropagation()
        setSelectedNode(prev => prev?.id===d.id ? null : d)
      })

    // ── Drag ───────────────────────────────────────────────────────────────
    node.call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simRef.current?.alphaTarget(0.25).restart()
        d.fx=d.x; d.fy=d.y
      })
      .on('drag', (event, d) => { d.fx=event.x; d.fy=event.y })
      .on('end', (event, d) => {
        if (!event.active) simRef.current?.alphaTarget(0)
        d.fx=null; d.fy=null
      })
    )

    // ── Simulação ──────────────────────────────────────────────────────────
    const sim = d3.forceSimulation(simNodes)
      .force('link',      d3.forceLink(simEdges).id(d=>d.id).distance(80).strength(0.35))
      .force('charge',    d3.forceManyBody().strength(-280).distanceMax(400))
      .force('center',    d3.forceCenter(0,0).strength(0.04))
      .force('collision', d3.forceCollide().radius(d=>(NODE_R[d.type]||4)+3).strength(0.9))
      .alphaDecay(0.022)
      .velocityDecay(0.45)

    sim.on('tick', () => {
      link
        .attr('x1', d=>d.source.x).attr('y1', d=>d.source.y)
        .attr('x2', d=>d.target.x).attr('y2', d=>d.target.y)
      node.attr('transform', d=>`translate(${d.x},${d.y})`)
    })

    simRef.current = sim

    return () => { sim.stop(); d3.select(el).on('.zoom', null) }
  }, [nodes, edges, user])

  // ── Atualiza seleção via D3 (sem re-render React) ──────────────────────
  useEffect(() => {
    if (!gRef.current) return
    gRef.current.selectAll('.node .halo, g.node .halo, g .halo')
    // Usa selectAll nos grupos de nó
    gRef.current.selectAll('g').each(function(d) {
      if (!d) return
      const isSel = d.id === selectedNode?.id
      d3.select(this).select('.halo').attr('opacity', isSel ? 0.55 : 0)
      d3.select(this).select('.body')
        .attr('stroke', isSel ? '#fff' : 'rgba(0,0,0,0.25)')
        .attr('stroke-width', isSel ? 1.5 : 0.5)
      d3.select(this).select('.lbl')
        .attr('fill', isSel ? 'rgba(240,237,232,0.85)' : 'rgba(240,237,232,0.0)')
    })
  }, [selectedNode])

  // ── Atualiza filtro via D3 ─────────────────────────────────────────────
  useEffect(() => {
    if (!gRef.current) return
    gRef.current.selectAll('g').each(function(d) {
      if (!d) return
      const vis = !filterType || filterType===d.type || d.type==='campanha'
      d3.select(this).select('.body').attr('opacity', vis ? 1 : 0.05)
      d3.select(this).select('.halo').attr('opacity', d.id===selectedNode?.id && vis ? 0.55 : 0)
    })
    gRef.current.selectAll('line').attr('opacity', e => {
      if (!filterType) return 1
      const st = e.source?.type, tt = e.target?.type
      return (st===filterType||st==='campanha') && (tt===filterType||tt==='campanha') ? 1 : 0.03
    })
  }, [filterType, selectedNode])

  // ── Salvar nota ────────────────────────────────────────────────────────
  const saveNote = async () => {
    if (!noteTitle.trim() || !noteBody.trim() || !cid) return
    try {
      await obsidianApi.addNote(cid, {
        titulo: noteTitle.trim(),
        corpo:  noteBody.trim(),
        tags:   noteTags.split(',').map(t=>t.trim()).filter(Boolean),
      })
      setNoteTitle(''); setNoteBody(''); setNoteTags('')
      setShowNote(false); refetch()
    } catch(err) { console.error(err) }
  }

  // ── Seed IA ────────────────────────────────────────────────────────────
  const triggerSeedIA = async () => {
    if (!cid || seeding) return
    setSeeding(true)
    setSeedMsg({ type:'info', text:'Analisando campanha e alimentando a rede neural… 30–60s.' })
    try {
      const res  = await obsidianApi.seedIA(cid)
      const data = res.data ?? res
      if (data.pulado) {
        setSeedMsg({ type:'warn', text:'Rede já populada. Recarregando…' })
        setTimeout(()=>{ refetch(); setSeedMsg(null) }, 3000)
      } else {
        setSeedMsg({ type:'ok', text:'Rede neural atualizada! Recarregando em 8s…' })
        setTimeout(()=>{ refetch(); setSeedMsg(null) }, 8000)
      }
    } catch(err) {
      setSeedMsg({ type:'err', text: err?.response?.data?.error || err.message || 'Erro.' })
    } finally { setSeeding(false) }
  }

  const nodeTypes = [...new Set(nodes.map(n=>n.type))].filter(t=>t!=='campanha')

  // Conexões do nó selecionado
  const connectedNodes = selectedNode
    ? edges
        .filter(e=>e.source===selectedNode.id||e.target===selectedNode.id)
        .map(e=>{ const cId=e.source===selectedNode.id?e.target:e.source; return nodes.find(n=>n.id===cId) })
        .filter(Boolean).slice(0,10)
    : []

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'rgba(167,139,250,0.6)',boxShadow:'0 0 20px rgba(167,139,250,0.5)',animation:'pulse 1.5s infinite'}}/>
      <div style={{fontSize:11,color:ui.t3,letterSpacing:'0.06em'}}>Carregando rede neural...</div>
    </div>
  )

  // ── Vazio ──────────────────────────────────────────────────────────────
  if (!nodes.length) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{width:i===3?10:i===2||i===4?7:5,height:i===3?10:i===2||i===4?7:5,borderRadius:'50%',background:`rgba(167,139,250,${0.15+(i===3?.5:i===2||i===4?.3:.15)})`}}/>
        ))}
      </div>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:14,color:ui.t2,fontWeight:600,marginBottom:6}}>Rede Neural vazia</div>
        <div style={{fontSize:10,color:ui.t4,maxWidth:300,lineHeight:1.7}}>
          {error || 'A IA ainda não mapeou esta campanha. Gere a base de conhecimento para a rede começar a se formar.'}
        </div>
      </div>
      {seedMsg && (
        <div style={{padding:'7px 14px',borderRadius:8,fontSize:10,maxWidth:300,textAlign:'center',
          background:seedMsg.type==='ok'?'rgba(134,239,172,0.08)':seedMsg.type==='err'?'rgba(255,45,45,0.08)':'rgba(167,139,250,0.08)',
          border:`1px solid ${seedMsg.type==='ok'?ui.gn:seedMsg.type==='err'?ui.red:'rgba(167,139,250,0.3)'}`,
          color:seedMsg.type==='ok'?ui.gn:seedMsg.type==='err'?ui.red:'rgba(196,181,253,0.9)'}}>
          {seedMsg.text}
        </div>
      )}
      <button onClick={triggerSeedIA} disabled={seeding}
        style={{padding:'9px 24px',borderRadius:8,fontSize:11,fontWeight:600,cursor:seeding?'not-allowed':'pointer',border:'1px solid rgba(167,139,250,0.3)',background:'rgba(167,139,250,0.1)',color:'rgba(196,181,253,0.9)',letterSpacing:'0.04em',opacity:seeding?.6:1}}>
        {seeding ? '· · · Gerando…' : '⬡  Gerar Rede Neural'}
      </button>
    </div>
  )

  // ── Render principal ───────────────────────────────────────────────────
  return (
    <div style={{height:'calc(100vh - 110px)',display:'flex',flexDirection:'column',gap:8}}>

      {/* Header minimalista */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:6,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'rgba(167,139,250,0.7)',boxShadow:'0 0 8px rgba(167,139,250,0.5)'}}/>
          <span style={{fontSize:15,fontWeight:600,color:ui.t2,letterSpacing:'0.01em'}}>Rede Neural</span>
          <span style={{fontSize:9,color:ui.t4,letterSpacing:'0.04em'}}>{meta.totalNodes||nodes.length} nós · {meta.totalEdges||edges.length} conexões</span>
        </div>

        {/* Filtros */}
        <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setFilterType(null)}
            style={{padding:'3px 9px',borderRadius:6,fontSize:8,cursor:'pointer',letterSpacing:'0.04em',
              border:`1px solid ${!filterType?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.06)'}`,
              background:!filterType?'rgba(167,139,250,0.1)':'transparent',
              color:!filterType?'rgba(196,181,253,0.9)':ui.t4}}>
            todos
          </button>
          {nodeTypes.map(type=>(
            <button key={type} onClick={()=>setFilterType(filterType===type?null:type)}
              style={{padding:'3px 9px',borderRadius:6,fontSize:8,cursor:'pointer',letterSpacing:'0.04em',
                border:`1px solid ${filterType===type?`${NODE_COLOR[type]||'rgba(255,255,255,0.2)'}60`:'rgba(255,255,255,0.06)'}`,
                background:filterType===type?`${NODE_COLOR[type]||'rgba(255,255,255,0.1)'}18`:'transparent',
                color:filterType===type?(NODE_COLOR[type]||ui.t2):ui.t4}}>
              {TYPE_LABELS[type]||type}
            </button>
          ))}
          <div style={{width:1,height:16,background:'rgba(255,255,255,0.08)',margin:'0 2px'}}/>
          <button onClick={()=>setShowNote(true)}
            style={{padding:'3px 10px',borderRadius:6,fontSize:8,cursor:'pointer',letterSpacing:'0.04em',border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:ui.t3}}>
            + nota
          </button>
          <button onClick={triggerSeedIA} disabled={seeding}
            style={{padding:'3px 10px',borderRadius:6,fontSize:8,cursor:seeding?'not-allowed':'pointer',letterSpacing:'0.04em',
              border:`1px solid rgba(167,139,250,${seeding?.2:.4})`,
              background:`rgba(167,139,250,${seeding?.05:.1})`,
              color:`rgba(196,181,253,${seeding?.5:.9})`,opacity:seeding?.7:1}}>
            {seeding?'gerando…':'⬡ alimentar rede'}
          </button>
        </div>
      </div>

      {/* Mensagem seed */}
      {seedMsg && (
        <div style={{padding:'6px 12px',borderRadius:8,fontSize:9,flexShrink:0,
          background:seedMsg.type==='ok'?'rgba(134,239,172,0.07)':seedMsg.type==='err'?'rgba(255,45,45,0.07)':seedMsg.type==='warn'?'rgba(253,230,138,0.07)':'rgba(167,139,250,0.07)',
          border:`1px solid ${seedMsg.type==='ok'?ui.gn:seedMsg.type==='err'?ui.red:seedMsg.type==='warn'?ui.am:'rgba(167,139,250,0.3)'}30`,
          color:seedMsg.type==='ok'?ui.gn:seedMsg.type==='err'?ui.red:seedMsg.type==='warn'?ui.am:'rgba(196,181,253,0.8)',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <span>{seedMsg.text}</span>
          <button onClick={()=>setSeedMsg(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',opacity:.5,fontSize:11}}>✕</button>
        </div>
      )}

      {/* Canvas + painel */}
      <div style={{flex:1,display:'flex',gap:8,minHeight:0}}>

        {/* SVG */}
        <div style={{flex:1,borderRadius:12,overflow:'hidden',position:'relative',background:'rgba(8,8,12,0.6)',border:'1px solid rgba(255,255,255,0.05)'}}>
          <svg ref={svgRef} style={{width:'100%',height:'100%',display:'block'}}/>
          <div style={{position:'absolute',bottom:10,left:12,fontSize:7,color:'rgba(255,255,255,0.18)',letterSpacing:'0.06em',pointerEvents:'none'}}>
            scroll · zoom    arrastar fundo · pan    arrastar nó · mover
          </div>
        </div>

        {/* Painel lateral — só aparece quando há seleção */}
        {selectedNode && (
          <div style={{width:220,borderRadius:12,background:'rgba(8,8,12,0.7)',border:'1px solid rgba(255,255,255,0.07)',backdropFilter:'blur(20px)',padding:16,display:'flex',flexDirection:'column',gap:10,overflowY:'auto',flexShrink:0}}>

            {/* Header do nó */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:7}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:NODE_COLOR[selectedNode.type]||'rgba(255,255,255,0.4)',flexShrink:0}}/>
                  <span style={{fontSize:8,color:NODE_COLOR[selectedNode.type]||ui.t3,letterSpacing:'0.06em',textTransform:'uppercase'}}>
                    {TYPE_LABELS[selectedNode.type]||selectedNode.type}
                  </span>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:ui.t1,lineHeight:1.4,wordBreak:'break-word'}}>
                  {selectedNode.label}
                </div>
              </div>
              <button onClick={()=>setSelectedNode(null)} style={{background:'none',border:'none',color:ui.t4,cursor:'pointer',fontSize:13,flexShrink:0,lineHeight:1}}>✕</button>
            </div>

            {/* Corpo / descrição */}
            {(selectedNode.meta?.corpo||selectedNode.meta?.descricao||selectedNode.meta?.preview) && (
              <div style={{fontSize:10,color:ui.t3,lineHeight:1.7,paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                {(selectedNode.meta.corpo||selectedNode.meta.descricao||selectedNode.meta.preview||'').slice(0,240)}
                {((selectedNode.meta.corpo||selectedNode.meta.descricao||selectedNode.meta.preview||'').length>240)?'…':''}
              </div>
            )}

            {/* Meta */}
            {selectedNode.meta && Object.entries(selectedNode.meta)
              .filter(([k,v])=>!['descricao','corpo','preview'].includes(k)&&v!=null&&String(v).length<80)
              .length > 0 && (
              <div>
                {Object.entries(selectedNode.meta)
                  .filter(([k,v])=>!['descricao','corpo','preview'].includes(k)&&v!=null&&String(v).length<80)
                  .map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:5,gap:6}}>
                    <span style={{fontSize:8,color:ui.t4,flexShrink:0,textTransform:'capitalize'}}>{k}</span>
                    <span style={{fontSize:8,color:ui.t2,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>
                      {typeof v==='object'?JSON.stringify(v):String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {selectedNode.tags?.length>0 && (
              <div style={{display:'flex',gap:3,flexWrap:'wrap',paddingTop:4}}>
                {selectedNode.tags.map(t=>(
                  <span key={t} style={{fontSize:7,color:NODE_COLOR[selectedNode.type]||ui.t3,background:`${NODE_COLOR[selectedNode.type]||'rgba(255,255,255,0.1)'}18`,padding:'2px 6px',borderRadius:4,border:`1px solid ${NODE_COLOR[selectedNode.type]||'rgba(255,255,255,0.08)'}30`}}>{t}</span>
                ))}
              </div>
            )}

            {/* Conexões */}
            {connectedNodes.length>0 && (
              <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:8}}>
                <div style={{fontSize:7,color:ui.t4,marginBottom:6,letterSpacing:'0.08em',textTransform:'uppercase'}}>Conectado a {connectedNodes.length}</div>
                {connectedNodes.map(cn=>(
                  <div key={cn.id} onClick={()=>setSelectedNode(cn)} style={{display:'flex',alignItems:'center',gap:7,padding:'4px 0',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                    <div style={{width:5,height:5,borderRadius:'50%',background:NODE_COLOR[cn.type]||'rgba(255,255,255,0.3)',flexShrink:0}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:9,color:ui.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cn.label}</div>
                      <div style={{fontSize:7,color:ui.t4}}>{TYPE_LABELS[cn.type]||cn.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal nota */}
      {showNote && (
        <div onClick={()=>setShowNote(false)} style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:'rgba(12,12,18,0.95)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:22,width:370,display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:13,fontWeight:600,color:ui.t1,marginBottom:2}}>Nova Nota</div>
            <input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)}
              placeholder="Título..."
              style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:ui.t1,padding:'8px 12px',fontSize:11,outline:'none',fontFamily:'inherit'}}/>
            <textarea value={noteBody} onChange={e=>setNoteBody(e.target.value)}
              placeholder="Conteúdo estratégico..." rows={5}
              style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:ui.t1,padding:10,fontSize:11,resize:'none',outline:'none',fontFamily:'inherit'}}/>
            <input value={noteTags} onChange={e=>setNoteTags(e.target.value)}
              placeholder="Tags: estratégia, crise…"
              style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:ui.t1,padding:'8px 12px',fontSize:11,outline:'none',fontFamily:'inherit'}}/>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowNote(false)}
                style={{padding:'7px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,0.08)',background:'transparent',color:ui.t3,fontSize:10,cursor:'pointer'}}>Cancelar</button>
              <button onClick={saveNote} disabled={!noteTitle.trim()||!noteBody.trim()}
                style={{padding:'7px 16px',borderRadius:7,border:'1px solid rgba(167,139,250,0.3)',background:'rgba(167,139,250,0.12)',color:'rgba(196,181,253,0.9)',fontSize:10,fontWeight:600,cursor:'pointer',opacity:(!noteTitle.trim()||!noteBody.trim())?.4:1}}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
