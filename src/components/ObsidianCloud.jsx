/**
 * CIC — Obsidian Thought Cloud
 * Grafo de conhecimento estilo Obsidian. Sem dependências externas.
 * Física via requestAnimationFrame + SVG nativo.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useObsidian } from '../hooks/useDataHooks.js'
import useAppStore from '../store/useAppStore.js'
import { obsidian as obsidianApi } from '../api/endpoints.js'

// Pulso animado para o botão de seed
const PULSE_KF = `@keyframes cidPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(.97)} }`
if (!document.getElementById('cid-pulse-kf')) {
  const s = document.createElement('style'); s.id='cid-pulse-kf'; s.textContent=PULSE_KF; document.head.appendChild(s)
}

const g = {
  card: { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(40px) saturate(180%)', WebkitBackdropFilter:'blur(40px) saturate(180%)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16 },
  t1:'#F0EDE8', t2:'#B8B3AB', t3:'#7A756E', t4:'#4A463F',
  red:'#FF2D2D', cyan:'#00E5FF', gn:'#34D399', am:'#FBBF24',
}

const TYPE_LABELS = {
  campanha:'Campanha', decisao:'Decisão', swot_forca:'Força', swot_fraqueza:'Fraqueza',
  swot_oportunidade:'Oportunidade', swot_ameaca:'Ameaça', conteudo:'Conteúdo',
  segmento:'Segmento', topico_monitoramento:'Monitoramento', estrategia:'Estratégia', nota:'Nota',
}

const NR = (w) => 6 + (w || 1) * 2.5

export default function ObsidianCloud() {
  const { nodes, edges, meta, loading, error, refetch } = useObsidian()
  const svgRef = useRef(null)
  const [simNodes, setSimNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState(null)
  const [vb, setVb] = useState({ x:0, y:0, w:800, h:580 })
  const animRef = useRef(null)
  const nRef = useRef([])
  const emRef = useRef({})
  const panRef = useRef(null)
  const dragId = useRef(null)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteTags, setNoteTags] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState(null)
  const cid = useAppStore(s => s.currentCampaign?.id)

  useEffect(() => {
    if (!nodes.length) return
    cancelAnimationFrame(animRef.current)
    const W=800, H=580
    const initialized = nodes.map(n => ({
      ...n,
      x: W/2 + (Math.random()-.5)*480,
      y: H/2 + (Math.random()-.5)*360,
      vx:0, vy:0,
    }))
    nRef.current = initialized
    setSimNodes([...initialized])
    const em = {}
    edges.forEach(e => {
      em[e.source] = em[e.source]||[]; em[e.target] = em[e.target]||[]
      em[e.source].push(e.target); em[e.target].push(e.source)
    })
    emRef.current = em
    let alpha=1
    const tick = () => {
      if (alpha < 0.002) { cancelAnimationFrame(animRef.current); return }
      const ns = nRef.current
      for (let i=0; i<ns.length; i++) {
        if (ns[i]._fx) continue
        ns[i].vx += (W/2 - ns[i].x)*0.0015*alpha
        ns[i].vy += (H/2 - ns[i].y)*0.0015*alpha
        for (let j=i+1; j<ns.length; j++) {
          const dx=ns[j].x-ns[i].x||.01, dy=ns[j].y-ns[i].y||.01
          const d=Math.sqrt(dx*dx+dy*dy)||1, f=-1800/(d*d)*alpha
          ns[i].vx+=dx/d*f; ns[i].vy+=dy/d*f
          ns[j].vx-=dx/d*f; ns[j].vy-=dy/d*f
        }
        for (const nid of (em[ns[i].id]||[])) {
          const j=ns.findIndex(n=>n.id===nid); if(j<0) continue
          const dx=ns[j].x-ns[i].x, dy=ns[j].y-ns[i].y
          const d=Math.sqrt(dx*dx+dy*dy)||1, k=(d-90)/d*0.08*alpha
          ns[i].vx+=dx*k; ns[i].vy+=dy*k
          ns[j].vx-=dx*k; ns[j].vy-=dy*k
        }
      }
      for (const n of ns) {
        if (n._fx) continue
        n.vx*=0.82; n.vy*=0.82; n.x+=n.vx; n.y+=n.vy
      }
      alpha*=0.994
      setSimNodes([...ns])
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [nodes, edges])

  const nodeTypes = [...new Set(nodes.map(n=>n.type))]
  const visNodes = filterType ? simNodes.filter(n=>n.type===filterType||n.type==='campanha') : simNodes
  const visIds = new Set(visNodes.map(n=>n.id))
  const visEdges = edges.filter(e=>visIds.has(e.source)&&visIds.has(e.target))

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const f=e.deltaY>0?1.12:.88
    setVb(v => {
      const r=svgRef.current?.getBoundingClientRect(); if(!r) return v
      const mx=(e.clientX-r.left)/r.width*v.w+v.x, my=(e.clientY-r.top)/r.height*v.h+v.y
      return { x:mx-(mx-v.x)*f, y:my-(my-v.y)*f, w:v.w*f, h:v.h*f }
    })
  },[])

  const onSvgDown = useCallback((e) => {
    if (e.target===svgRef.current||e.target.tagName==='line'||e.target.tagName==='svg') {
      panRef.current={mx:e.clientX,my:e.clientY,vbx:vb.x,vby:vb.y}
    }
  },[vb])

  const onSvgMove = useCallback((e) => {
    if (panRef.current) {
      const r=svgRef.current?.getBoundingClientRect(); if(!r) return
      const dx=(e.clientX-panRef.current.mx)*vb.w/r.width
      const dy=(e.clientY-panRef.current.my)*vb.h/r.height
      setVb(v=>({...v, x:panRef.current.vbx-dx, y:panRef.current.vby-dy}))
    }
    if (dragId.current) {
      const r=svgRef.current?.getBoundingClientRect(); if(!r) return
      const nx=vb.x+(e.clientX-r.left)/r.width*vb.w
      const ny=vb.y+(e.clientY-r.top)/r.height*vb.h
      const idx=nRef.current.findIndex(n=>n.id===dragId.current)
      if (idx>=0) { nRef.current[idx].x=nx; nRef.current[idx].y=ny; nRef.current[idx].vx=0; nRef.current[idx].vy=0; setSimNodes([...nRef.current]) }
    }
  },[vb])

  const onSvgUp = useCallback(() => {
    panRef.current=null
    if (dragId.current) { const idx=nRef.current.findIndex(n=>n.id===dragId.current); if(idx>=0) nRef.current[idx]._fx=false; dragId.current=null }
  },[])

  const onNodeDown = useCallback((e,id) => {
    e.stopPropagation(); dragId.current=id
    const idx=nRef.current.findIndex(n=>n.id===id); if(idx>=0) nRef.current[idx]._fx=true
  },[])

  const onNodeClick = useCallback((e,n) => { e.stopPropagation(); setSelectedNode(n) },[])

  const saveNote = async () => {
    if (!noteText.trim()||!cid) return
    try {
      await obsidianApi.addNote(cid,{conteudo:noteText, tags:noteTags.split(',').map(t=>t.trim()).filter(Boolean)})
      setNoteText(''); setNoteTags(''); setShowNote(false); refetch()
    } catch(err) { console.error(err) }
  }

  const triggerSeedIA = async () => {
    if (!cid || seeding) return
    setSeeding(true)
    setSeedMsg({ type:'info', text:'Gerando base de conhecimento com IA… isso pode levar 30–60 segundos.' })
    try {
      const res = await obsidianApi.seedIA(cid)
      const data = res.data ?? res
      if (data.status === 'already_seeded') {
        setSeedMsg({ type:'warn', text:'Esta campanha já possui uma base de conhecimento gerada.' })
      } else {
        setSeedMsg({ type:'ok', text:'Base IA iniciada! Recarregando o grafo em alguns segundos…' })
        setTimeout(() => { refetch(); setSeedMsg(null) }, 6000)
      }
    } catch(err) {
      setSeedMsg({ type:'err', text: err?.response?.data?.error || err.message || 'Erro ao gerar base IA.' })
    } finally {
      setSeeding(false)
    }
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{fontSize:28}}>⬡</div>
      <div style={{fontSize:12,color:g.t3}}>Carregando nuvem de pensamento...</div>
    </div>
  )

  if (!nodes.length) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:14}}>
      <div style={{fontSize:48}}>🧠</div>
      <div style={{fontSize:15,color:g.t2,fontWeight:700}}>Nuvem de Pensamento vazia</div>
      <div style={{fontSize:11,color:g.t3,textAlign:'center',maxWidth:340,lineHeight:1.7}}>
        {error||'A base de conhecimento estratégico está vazia. Use IA para gerar automaticamente SWOT, segmentos, decisões e notas — ou adicione dados manualmente.'}
      </div>
      {seedMsg&&(
        <div style={{padding:'8px 16px',borderRadius:10,fontSize:10,fontWeight:500,
          background:seedMsg.type==='ok'?'rgba(52,211,153,0.12)':seedMsg.type==='err'?'rgba(255,45,45,0.12)':'rgba(0,229,255,0.10)',
          border:`1px solid ${seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:g.cyan}30`,
          color:seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:g.cyan,maxWidth:340,textAlign:'center'}}>
          {seedMsg.text}
        </div>
      )}
      <div style={{display:'flex',gap:10,marginTop:4}}>
        <button onClick={triggerSeedIA} disabled={seeding} style={{padding:'9px 22px',borderRadius:10,fontSize:11,cursor:seeding?'not-allowed':'pointer',background:seeding?'rgba(124,58,237,0.15)':`linear-gradient(135deg,#7c3aed,#4f46e5)`,border:seeding?'1px solid rgba(124,58,237,0.3)':'none',color:'#fff',fontWeight:700,opacity:seeding?.7:1,animation:seeding?'cidPulse 1.4s infinite':undefined,boxShadow:seeding?'none':'0 0 24px rgba(124,58,237,0.4)'}}>
          {seeding?'⟳ Gerando base de conhecimento…':'✦ Gerar Base IA'}
        </button>
        <button onClick={refetch} style={{padding:'9px 16px',borderRadius:10,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.2)',color:g.cyan,fontSize:11,cursor:'pointer'}}>Recarregar</button>
      </div>
    </div>
  )

  return (
    <div style={{animation:'fadeUp .4s ease',height:'calc(100vh - 110px)',display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:3,height:22,borderRadius:2,background:`linear-gradient(180deg,${g.red},${g.cyan})`,boxShadow:`0 0 12px ${g.red}40`}}/>
          <h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Nuvem de Pensamento</h2>
          <span style={{fontSize:8,color:g.cyan,background:'rgba(0,229,255,0.14)',padding:'2px 8px',borderRadius:8,fontWeight:600}}>
            {meta.totalNodes||nodes.length} nós · {meta.totalEdges||edges.length} conexões
          </span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setFilterType(null)} style={{padding:'4px 10px',borderRadius:8,fontSize:9,cursor:'pointer',border:'1px solid rgba(255,255,255,0.1)',background:!filterType?'rgba(0,229,255,0.15)':'rgba(255,255,255,0.04)',color:!filterType?g.cyan:g.t3}}>Todos</button>
          {nodeTypes.filter(t=>t!=='campanha').map(type=>(
            <button key={type} onClick={()=>setFilterType(filterType===type?null:type)} style={{padding:'4px 10px',borderRadius:8,fontSize:9,cursor:'pointer',border:'1px solid rgba(255,255,255,0.1)',background:filterType===type?'rgba(0,229,255,0.15)':'rgba(255,255,255,0.04)',color:filterType===type?g.cyan:g.t3}}>
              {TYPE_LABELS[type]||type}
            </button>
          ))}
          <button onClick={()=>setShowNote(true)} style={{padding:'4px 12px',borderRadius:8,fontSize:9,cursor:'pointer',background:`linear-gradient(135deg,${g.red},#CC1E1E)`,border:'none',color:'#fff',fontWeight:600}}>+ Nota</button>
          <button onClick={triggerSeedIA} disabled={seeding} style={{padding:'4px 12px',borderRadius:8,fontSize:9,cursor:seeding?'not-allowed':'pointer',background:seeding?'rgba(251,191,36,0.12)':`linear-gradient(135deg,#7c3aed,#4f46e5)`,border:seeding?'1px solid rgba(251,191,36,0.3)':'none',color:seeding?g.am:'#fff',fontWeight:600,opacity:seeding?.75:1,animation:seeding?'cidPulse 1.4s infinite':undefined}}>
            {seeding?'⟳ Gerando…':'✦ Gerar Base IA'}
          </button>
        </div>
      </div>
      {seedMsg&&(
        <div style={{padding:'8px 14px',borderRadius:10,fontSize:10,fontWeight:500,
          background:seedMsg.type==='ok'?'rgba(52,211,153,0.12)':seedMsg.type==='err'?'rgba(255,45,45,0.12)':seedMsg.type==='warn'?'rgba(251,191,36,0.12)':'rgba(0,229,255,0.10)',
          border:`1px solid ${seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:seedMsg.type==='warn'?g.am:g.cyan}30`,
          color:seedMsg.type==='ok'?g.gn:seedMsg.type==='err'?g.red:seedMsg.type==='warn'?g.am:g.cyan,
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <span>{seedMsg.text}</span>
          <button onClick={()=>setSeedMsg(null)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',fontSize:12,opacity:.6,padding:'0 2px'}}>✕</button>
        </div>
      )}

      <div style={{flex:1,display:'flex',gap:10,minHeight:0}}>
        <div style={{flex:1,...g.card,overflow:'hidden',position:'relative',cursor:'grab'}}>
          <svg ref={svgRef} width="100%" height="100%"
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            onWheel={onWheel} onMouseDown={onSvgDown} onMouseMove={onSvgMove}
            onMouseUp={onSvgUp} onMouseLeave={onSvgUp} style={{userSelect:'none'}}>
            <g>
              {visEdges.map(e=>{
                const s=simNodes.find(n=>n.id===e.source), t=simNodes.find(n=>n.id===e.target)
                if(!s||!t) return null
                return <line key={e.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="rgba(255,255,255,0.1)" strokeWidth={e.weight||1}
                  strokeDasharray={e.type==='relacionado'?'4 3':undefined}/>
              })}
            </g>
            <g>
              {visNodes.map(n=>{
                const r=NR(n.weight), sel=selectedNode?.id===n.id
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}
                    onClick={e=>onNodeClick(e,n)} onMouseDown={e=>onNodeDown(e,n.id)} style={{cursor:'pointer'}}>
                    {sel&&<circle r={r+7} fill="none" stroke={n.color||g.cyan} strokeWidth={1.5} opacity={0.5}/>}
                    <circle r={r} fill={n.color||'#6366f1'}
                      stroke={sel?'#fff':'rgba(255,255,255,0.2)'} strokeWidth={sel?2:1}/>
                    <text textAnchor="middle" dy={r+10} fontSize={8} fill={g.t2} style={{pointerEvents:'none'}}>
                      {n.label?.length>16?n.label.slice(0,14)+'…':n.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
          <div style={{position:'absolute',bottom:8,right:8,fontSize:8,color:g.t4,padding:'3px 8px',borderRadius:6,background:'rgba(0,0,0,0.35)'}}>
            Scroll: zoom · Drag: mover
          </div>
        </div>

        {selectedNode&&(
          <div style={{width:220,...g.card,padding:14,display:'flex',flexDirection:'column',gap:10,overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:8,color:selectedNode.color||g.cyan,background:(selectedNode.color||g.cyan)+'18',padding:'2px 8px',borderRadius:8,fontWeight:600,display:'inline-block',marginBottom:6}}>
                  {TYPE_LABELS[selectedNode.type]||selectedNode.type}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:g.t1,lineHeight:1.3}}>{selectedNode.label}</div>
              </div>
              <button onClick={()=>setSelectedNode(null)} style={{background:'none',border:'none',color:g.t4,cursor:'pointer',fontSize:14,padding:'0 2px'}}>✕</button>
            </div>
            {selectedNode.meta?.descricao&&<div style={{fontSize:10,color:g.t2,lineHeight:1.6}}>{selectedNode.meta.descricao}</div>}
            <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:8}}>
              <div style={{fontSize:8,color:g.t4,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Detalhes</div>
              {selectedNode.meta&&Object.entries(selectedNode.meta).filter(([k])=>k!=='descricao').map(([k,v])=>v&&(
                <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:9,color:g.t3}}>{k}</span>
                  <span style={{fontSize:9,color:g.t2,maxWidth:110,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{typeof v==='object'?JSON.stringify(v):String(v)}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:9,color:g.t3}}>Peso</span>
                <span style={{fontSize:9,color:g.t2}}>{selectedNode.weight}</span>
              </div>
            </div>
            {selectedNode.tags?.length>0&&(
              <div>
                <div style={{fontSize:8,color:g.t4,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Tags</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {selectedNode.tags.map(t=><span key={t} style={{fontSize:8,color:g.cyan,background:g.cyan+'18',padding:'2px 6px',borderRadius:6}}>{t}</span>)}
                </div>
              </div>
            )}
            <div>
              <div style={{fontSize:8,color:g.t4,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Conexões</div>
              {edges.filter(e=>e.source===selectedNode.id||e.target===selectedNode.id).slice(0,6).map(e=>{
                const cId=e.source===selectedNode.id?e.target:e.source
                const cn=nodes.find(n=>n.id===cId)
                return cn&&<div key={e.id} onClick={()=>setSelectedNode(simNodes.find(n=>n.id===cId))}
                  style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:cn.color||g.cyan,flexShrink:0}}/>
                  <span style={{fontSize:9,color:g.t2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{cn.label}</span>
                </div>
              })}
            </div>
          </div>
        )}
      </div>

      {showNote&&(
        <div onClick={()=>setShowNote(false)} style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{...g.card,padding:20,width:340,display:'flex',flexDirection:'column',gap:12}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:g.t1}}>Nova Nota Estratégica</h3>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Escreva sua nota estratégica..." rows={4}
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:g.t1,padding:10,fontSize:11,resize:'none',outline:'none'}}/>
            <input value={noteTags} onChange={e=>setNoteTags(e.target.value)} placeholder="Tags: estratégia, crise, eleitores..."
              style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:g.t1,padding:'8px 12px',fontSize:11,outline:'none'}}/>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowNote(false)} style={{padding:'7px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:g.t3,fontSize:10,cursor:'pointer'}}>Cancelar</button>
              <button onClick={saveNote} style={{padding:'7px 16px',borderRadius:8,background:`linear-gradient(135deg,${g.red},#CC1E1E)`,border:'none',color:'#fff',fontSize:10,fontWeight:600,cursor:'pointer'}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
