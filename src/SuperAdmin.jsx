/**
 * SuperAdmin.jsx — Painel de Controle Victor & Marcos
 * URL: /sadmin — invisível para clientes
 */
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const ALL_MODULES = [
  {id:'dash',    label:'Dashboard',         group:'core'},
  {id:'ia',      label:'Assistente IA',     group:'core'},
  {id:'agenda',  label:'Agenda',            group:'core'},
  {id:'crm',     label:'CRM Eleitores',     group:'core'},
  {id:'demandas',label:'Demandas',          group:'core'},
  {id:'comm',    label:'Comunicação',       group:'core'},
  {id:'config',  label:'Configurações',     group:'core'},
  {id:'diag',    label:'Diagnóstico',       group:'pro'},
  {id:'mon',     label:'Monitoramento',     group:'pro'},
  {id:'vol',     label:'Voluntários',       group:'pro'},
  {id:'fund',    label:'Arrecadação',       group:'pro'},
  {id:'prod',    label:'Produção IA',       group:'pro'},
  {id:'estr',    label:'Estratégica',       group:'pro'},
  {id:'pesq',    label:'Pesquisas',         group:'pro'},
  {id:'gotv',    label:'Dia da Eleição',    group:'enterprise'},
  {id:'mapa',    label:'Mapa Eleitoral',    group:'enterprise'},
  {id:'debate',  label:'Simulador Debate',  group:'enterprise'},
  {id:'relat',   label:'Relatórios',        group:'enterprise'},
  {id:'social',  label:'Publicação Social', group:'enterprise'},
];

const GROUP_COLOR  = {core:'#06b6d4', pro:'#8b5cf6', enterprise:'#f59e0b'};
const STATUS_COLOR = {active:'#22c55e', trial:'#06b6d4', paused:'#f59e0b', cancelled:'#ef4444'};
const STATUS_LABEL = {active:'Ativo', trial:'Trial', paused:'Pausado', cancelled:'Cancelado'};

const g = {
  bg:'rgba(8,8,18,0.98)', card:'rgba(255,255,255,0.05)',
  border:'rgba(255,255,255,0.08)',
  t1:'rgba(255,255,255,0.95)', t2:'rgba(148,163,184,0.9)',
  t3:'rgba(100,116,139,0.8)', t4:'rgba(71,85,105,0.7)',
  red:'#ef4444', cyan:'#06b6d4', gn:'#22c55e', am:'#f59e0b', pu:'#8b5cf6',
};

function useApi(token) {
  const call = useCallback(async (method, path, body) => {
    const r = await fetch(`${API_URL}${path}`, {
      method, headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Erro');
    return d;
  }, [token]);
  return { get:p=>call('GET',p), post:(p,b)=>call('POST',p,b), patch:(p,b)=>call('PATCH',p,b) };
}

const Chip = ({c='#06b6d4',children}) => (
  <span style={{padding:'2px 8px',borderRadius:99,fontSize:9,fontWeight:700,
    background:`${c}18`,color:c,border:`1px solid ${c}28`}}>{children}</span>
);
const Stat = ({label,value,sub,color=g.cyan}) => (
  <div style={{padding:'16px 20px',borderRadius:12,background:g.card,
    border:`1px solid ${g.border}`,flex:1,minWidth:110}}>
    <div style={{fontSize:9,color:g.t3,marginBottom:4,textTransform:'uppercase',
      letterSpacing:'0.06em'}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color,letterSpacing:'-0.03em'}}>{value}</div>
    {sub&&<div style={{fontSize:9,color:g.t4,marginTop:2}}>{sub}</div>}
  </div>
);
const Btn = ({onClick,color=g.cyan,children,sm,outline,danger,disabled,full}) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding:sm?'5px 12px':'8px 18px', borderRadius:8,
    cursor:disabled?'not-allowed':'pointer',
    border:outline||danger?`1px solid ${danger?g.red:color}30`:'none',
    background:danger?`${g.red}15`:outline?`${color}08`:color,
    color:danger?g.red:outline?color:'#fff',
    fontSize:sm?10:11, fontWeight:600, opacity:disabled?.5:1,
    width:full?'100%':'auto', whiteSpace:'nowrap',
  }}>{children}</button>
);
const Inp = ({label,value,onChange,type='text',placeholder,half,mono,readonly,rows}) => (
  <div style={{flex:half?'1 1 calc(50% - 8px)':'1 1 100%',minWidth:0}}>
    {label&&<div style={{fontSize:9,color:g.t3,marginBottom:4,fontWeight:600,
      textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>}
    {rows
      ? <textarea value={value||''} onChange={e=>onChange?.(e.target.value)}
          rows={rows} placeholder={placeholder}
          style={{width:'100%',padding:'8px 12px',borderRadius:8,
            border:`1px solid ${g.border}`,background:'rgba(255,255,255,0.04)',
            color:g.t1,fontSize:11,outline:'none',resize:'vertical',
            boxSizing:'border-box',fontFamily:'inherit'}}/>
      : <input type={type} value={value||''} readOnly={readonly}
          onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}
          style={{width:'100%',padding:'8px 12px',borderRadius:8,
            border:`1px solid ${g.border}`,
            background:readonly?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.04)',
            color:g.t1,fontSize:11,outline:'none',
            fontFamily:mono?'monospace':'inherit',boxSizing:'border-box'}}/>}
  </div>
);
const Sel = ({label,value,onChange,options,half}) => (
  <div style={{flex:half?'1 1 calc(50% - 8px)':'1 1 100%',minWidth:0}}>
    {label&&<div style={{fontSize:9,color:g.t3,marginBottom:4,fontWeight:600,
      textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</div>}
    <select value={value||''} onChange={e=>onChange(e.target.value)}
      style={{width:'100%',padding:'8px 12px',borderRadius:8,
        border:`1px solid ${g.border}`,background:'rgba(20,20,35,0.8)',
        color:g.t1,fontSize:11,outline:'none'}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function Dashboard({ api, onNav }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sadmin/stats').then(setStats).catch(console.error).finally(()=>setLoading(false));
  }, []);

  const fmt = n => n?.toLocaleString('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0}) || 'R$ 0';

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:18,fontWeight:800,color:g.t1,marginBottom:4}}>Visão Geral</h2>
        <p style={{fontSize:11,color:g.t3}}>Métricas do negócio em tempo real</p>
      </div>

      {loading ? <div style={{color:g.t3,fontSize:12}}>Carregando...</div> : (
        <>
          <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
            <Stat label="MRR" value={fmt(stats?.mrr)} sub="receita mensal recorrente" color={g.gn}/>
            <Stat label="ARR" value={fmt(stats?.arr)} sub="receita anual projetada" color={g.pu}/>
            <Stat label="Clientes Ativos" value={stats?.active_orgs||0} sub="pagando" color={g.cyan}/>
            <Stat label="Em Trial" value={stats?.trial_orgs||0} sub="para converter" color={g.am}/>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:g.t1,marginBottom:12}}>Planos disponíveis</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {(stats?.plans||[]).map(p=>(
                <div key={p.id} style={{padding:'14px 18px',borderRadius:12,background:g.card,
                  border:`1px solid ${g.border}`,flex:'1',minWidth:180}}>
                  <div style={{fontSize:11,fontWeight:700,color:g.t1,marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:18,fontWeight:800,color:g.cyan,marginBottom:2}}>
                    R$ {Number(p.price_monthly).toLocaleString('pt-BR')}
                    <span style={{fontSize:9,color:g.t4,fontWeight:400}}>/mês</span>
                  </div>
                  <div style={{fontSize:9,color:g.t3}}>
                    {(p.modules||[]).length} módulos · até {p.max_candidates===999?'∞':p.max_candidates} candidatos
                  </div>
                  <div style={{fontSize:9,color:g.t4,marginTop:4}}>
                    Setup R$ {Number(p.price_setup).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Org List Screen ───────────────────────────────────────────────────────────
function OrgList({ api, onEdit, onNew }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/sadmin/orgs').then(setOrgs).catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:800,color:g.t1,marginBottom:2}}>Clientes</h2>
          <p style={{fontSize:11,color:g.t3}}>{orgs.length} organização{orgs.length!==1?'s':''} cadastrada{orgs.length!==1?'s':''}</p>
        </div>
        <Btn onClick={onNew} color={g.cyan}>+ Novo Cliente</Btn>
      </div>

      {loading ? <div style={{color:g.t3,fontSize:12}}>Carregando...</div> : orgs.length === 0 ? (
        <div style={{padding:40,textAlign:'center',color:g.t3,fontSize:12,
          border:`1px dashed ${g.border}`,borderRadius:12}}>
          Nenhum cliente ainda.{' '}
          <span style={{color:g.cyan,cursor:'pointer'}} onClick={onNew}>Criar o primeiro →</span>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {orgs.map(org => (
            <div key={org.id} onClick={()=>onEdit(org)}
              style={{padding:'14px 18px',borderRadius:12,background:g.card,
                border:`1px solid ${g.border}`,cursor:'pointer',
                display:'flex',alignItems:'center',gap:16,
                transition:'border-color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(6,182,212,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor=g.border}>

              <div style={{width:36,height:36,borderRadius:10,background:`${g.cyan}18`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:14,fontWeight:800,color:g.cyan,flexShrink:0}}>
                {(org.product_name||'?').charAt(0)}
              </div>

              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:g.t1,marginBottom:2}}>
                  {org.product_name}
                </div>
                <div style={{fontSize:9,color:g.t3}}>
                  Persona: {org.persona_name} · {org.persona_title}
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                <Chip c={STATUS_COLOR[org.plan_status]||g.t3}>
                  {STATUS_LABEL[org.plan_status]||org.plan_status}
                </Chip>
                {org.monthly_value&&(
                  <span style={{fontSize:10,fontWeight:700,color:g.gn}}>
                    R$ {Number(org.monthly_value).toLocaleString('pt-BR')}/mês
                  </span>
                )}
                <div style={{fontSize:9,color:g.t4}}>
                  {(org.modules_enabled||[]).length} módulos
                </div>
                {org.has_api_key&&<Chip c={g.gn}>API ✓</Chip>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Module Picker ────────────────────────────────────────────────────────────
function ModulePicker({ value, onChange }) {
  const enabled = value || [];
  const toggle = id => {
    if (enabled.includes(id)) onChange(enabled.filter(x=>x!==id));
    else onChange([...enabled, id]);
  };
  const selectPlan = plan => {
    const planMods = {
      essencial: ['dash','ia','agenda','crm','demandas','comm','config'],
      profissional: ['dash','ia','agenda','crm','demandas','comm','config',
                     'diag','mon','vol','fund','prod','estr','pesq'],
      estrategico: ALL_MODULES.map(m=>m.id),
    };
    onChange(planMods[plan] || []);
  };

  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
        {['essencial','profissional','estrategico'].map(p=>(
          <Btn key={p} sm outline color={GROUP_COLOR[p==='essencial'?'core':p==='profissional'?'pro':'enterprise']}
            onClick={()=>selectPlan(p)}>
            Preencher {p.charAt(0).toUpperCase()+p.slice(1)}
          </Btn>
        ))}
      </div>
      {['core','pro','enterprise'].map(grp=>(
        <div key={grp} style={{marginBottom:10}}>
          <div style={{fontSize:9,fontWeight:700,color:GROUP_COLOR[grp],
            textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>
            {grp==='core'?'Essencial':grp==='pro'?'Profissional':'Estratégico'}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {ALL_MODULES.filter(m=>m.group===grp).map(m=>{
              const on = enabled.includes(m.id);
              return (
                <div key={m.id} onClick={()=>toggle(m.id)}
                  style={{padding:'5px 10px',borderRadius:8,fontSize:10,cursor:'pointer',
                    fontWeight:on?600:400,
                    background:on?`${GROUP_COLOR[grp]}18`:'rgba(255,255,255,0.03)',
                    border:`1px solid ${on?GROUP_COLOR[grp]+'40':g.border}`,
                    color:on?GROUP_COLOR[grp]:g.t3,transition:'all .15s',userSelect:'none'}}>
                  {m.label}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{fontSize:9,color:g.t4,marginTop:4}}>
        {enabled.length} módulo{enabled.length!==1?'s':''} selecionado{enabled.length!==1?'s':''}
      </div>
    </div>
  );
}

// ─── Org Editor (create or edit) ──────────────────────────────────────────────
function OrgEditor({ api, org, onBack, onSaved }) {
  const isNew = !org?.id;
  const [form, setForm] = useState({
    product_name: org?.product_name || '',
    owner_name: org?.owner_name || '',
    owner_email: org?.owner_email || '',
    owner_password: '',
    persona_name: org?.persona_name || 'Aria',
    persona_title: org?.persona_title || 'Inteligência de Campanha',
    persona_description: org?.persona_description || 'Sua estrategista política com IA avançada',
    persona_short_desc: org?.persona_short_desc || 'IA Estratégica',
    modules_enabled: org?.modules_enabled || ['dash','ia','agenda','crm','demandas','comm','config'],
    max_candidates: org?.max_candidates || 1,
    claude_api_key: '',
    claude_model: org?.claude_model || 'claude-sonnet-4-6',
    plan_status: org?.plan_status || 'trial',
    monthly_value: org?.monthly_value || '5000',
    setup_paid: org?.setup_paid || false,
    font_family: org?.font_family || 'Inter',
    notes: org?.notes || '',
    colors: org?.colors || {},
  });
  const [tab, setTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setSaving(true); setErr('');
    try {
      if (isNew) {
        await api.post('/sadmin/orgs', form);
      } else {
        const {owner_email, owner_password, ...rest} = form;
        await api.patch(`/sadmin/orgs/${org.id}`, rest);
      }
      onSaved();
    } catch(e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const TABS = [{id:'info',label:'Básico'},{id:'persona',label:'Persona IA'},
                {id:'modulos',label:'Módulos'},{id:'faturamento',label:'Faturamento'},
                {id:'visual',label:'Visual'}];

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:g.t3,
          cursor:'pointer',fontSize:18,lineHeight:1}}>←</button>
        <div>
          <h2 style={{fontSize:16,fontWeight:800,color:g.t1,marginBottom:2}}>
            {isNew ? 'Novo Cliente' : `Editando: ${org.product_name}`}
          </h2>
          <p style={{fontSize:10,color:g.t3}}>
            {isNew ? 'Cria conta, org e config em um passo' : 'Alterações salvas imediatamente'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:`1px solid ${g.border}`,
        paddingBottom:0,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 14px',borderRadius:'8px 8px 0 0',border:'none',
              background:tab===t.id?'rgba(6,182,212,0.1)':'transparent',
              color:tab===t.id?g.cyan:g.t3,fontSize:10,fontWeight:600,cursor:'pointer',
              borderBottom:tab===t.id?`2px solid ${g.cyan}`:'2px solid transparent',
              marginBottom:-1,whiteSpace:'nowrap'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
        {tab==='info'&&<>
          <Inp label="Nome do Produto/Sistema" value={form.product_name} onChange={v=>set('product_name',v)} placeholder="Ex: CIC, Campanha Pro, etc."/>
          {isNew&&<>
            <Inp label="Nome do Responsável" value={form.owner_name} onChange={v=>set('owner_name',v)} half placeholder="Fernando Carreiro"/>
            <Inp label="E-mail de Acesso" value={form.owner_email} onChange={v=>set('owner_email',v)} half type="email" placeholder="fernando@email.com"/>
            <Inp label="Senha Inicial" value={form.owner_password} onChange={v=>set('owner_password',v)} half type="password" placeholder="Deixe vazio para CicTemp@2026!"/>
          </>}
          <Inp label="Chave API Claude (do cliente)" value={form.claude_api_key}
            onChange={v=>set('claude_api_key',v)} mono
            placeholder={org?.has_api_key?'••••••••• (salva — cole para atualizar)':'sk-ant-...'}/>
          <Sel label="Modelo Claude" value={form.claude_model} onChange={v=>set('claude_model',v)} half
            options={[
              {value:'claude-haiku-4-5-20251001',label:'Haiku (mais barato)'},
              {value:'claude-sonnet-4-6',label:'Sonnet (recomendado)'},
              {value:'claude-opus-4-6',label:'Opus (mais poderoso)'},
            ]}/>
          <Inp label="Família de Fonte" value={form.font_family} onChange={v=>set('font_family',v)} half placeholder="Inter"/>
          <Inp label="Notas internas (não visível ao cliente)" value={form.notes} onChange={v=>set('notes',v)} rows={3}/>
        </>}

        {tab==='persona'&&<>
          <div style={{width:'100%',padding:'10px 14px',borderRadius:10,
            background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',
            fontSize:10,color:g.t2,marginBottom:4}}>
            🤖 A "persona" é como a IA se apresenta para o cliente. Cada marketeiro pode ter sua própria IA com nome, título e personalidade únicos.
          </div>
          <Inp label="Nome da IA" value={form.persona_name} onChange={v=>set('persona_name',v)} half placeholder="Aria"/>
          <Inp label="Título curto" value={form.persona_short_desc} onChange={v=>set('persona_short_desc',v)} half placeholder="IA Estratégica"/>
          <Inp label="Título completo" value={form.persona_title} onChange={v=>set('persona_title',v)} placeholder="Inteligência de Campanha"/>
          <Inp label="Descrição da IA" value={form.persona_description} onChange={v=>set('persona_description',v)} rows={3} placeholder="Descreva a personalidade e especialidade da IA para este cliente"/>
        </>}

        {tab==='modulos'&&<>
          <div style={{width:'100%'}}>
            <ModulePicker value={form.modules_enabled} onChange={v=>set('modules_enabled',v)}/>
          </div>
          <Sel label="Máx. de candidatos" value={String(form.max_candidates)}
            onChange={v=>set('max_candidates',Number(v))} half
            options={[{value:'1',label:'1'},{value:'3',label:'3'},{value:'5',label:'5'},
                      {value:'10',label:'10'},{value:'999',label:'Ilimitado'}]}/>
        </>}

        {tab==='faturamento'&&<>
          <Sel label="Status" value={form.plan_status} onChange={v=>set('plan_status',v)} half
            options={[{value:'trial',label:'Trial'},{value:'active',label:'Ativo'},
                      {value:'paused',label:'Pausado'},{value:'cancelled',label:'Cancelado'}]}/>
          <Inp label="Valor Mensal (R$)" value={form.monthly_value}
            onChange={v=>set('monthly_value',v)} half type="number" placeholder="2497"/>
          <div style={{flex:'1 1 100%',display:'flex',alignItems:'center',gap:8}}>
            <input type="checkbox" checked={!!form.setup_paid}
              onChange={e=>set('setup_paid',e.target.checked)}
              style={{width:16,height:16,accentColor:g.cyan}}/>
            <span style={{fontSize:11,color:g.t2}}>Setup pago (R$ 2.500)</span>
          </div>
        </>}

        {tab==='visual'&&<>
          <div style={{width:'100%',padding:'10px 14px',borderRadius:10,
            background:'rgba(6,182,212,0.06)',border:`1px solid ${g.border}`,
            fontSize:10,color:g.t2}}>
            🎨 Defina as cores do tema do cliente. Deixe em branco para usar o padrão CIC.
          </div>
          {['red','cyan','green','amber','accent_primary','accent_secondary'].map(k=>(
            <div key={k} style={{flex:'1 1 calc(33% - 8px)',minWidth:120}}>
              <div style={{fontSize:9,color:g.t3,marginBottom:4,fontWeight:600,
                textTransform:'uppercase',letterSpacing:'0.06em'}}>{k.replace(/_/g,' ')}</div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <input type="color" value={form.colors?.[k]||'#06b6d4'}
                  onChange={e=>set('colors',{...form.colors,[k]:e.target.value})}
                  style={{width:32,height:32,border:'none',background:'none',cursor:'pointer',padding:0}}/>
                <input value={form.colors?.[k]||''} onChange={e=>set('colors',{...form.colors,[k]:e.target.value})}
                  placeholder="#06b6d4"
                  style={{flex:1,padding:'6px 10px',borderRadius:8,border:`1px solid ${g.border}`,
                    background:'rgba(255,255,255,0.04)',color:g.t1,fontSize:10,outline:'none',
                    fontFamily:'monospace'}}/>
              </div>
            </div>
          ))}
        </>}
      </div>

      {err&&<div style={{marginTop:12,padding:'8px 12px',borderRadius:8,
        background:`${g.red}15`,border:`1px solid ${g.red}30`,fontSize:10,color:g.red}}>{err}</div>}

      <div style={{display:'flex',gap:8,marginTop:20,justifyContent:'flex-end'}}>
        <Btn outline onClick={onBack} color={g.t3}>Cancelar</Btn>
        <Btn onClick={save} disabled={saving} color={g.cyan}>
          {saving ? 'Salvando...' : isNew ? '✓ Criar Cliente' : '✓ Salvar Alterações'}
        </Btn>
      </div>
    </div>
  );
}

// ─── Plans Manager ────────────────────────────────────────────────────────────
function PlansManager({ api }) {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/sadmin/plans').then(setPlans).catch(console.error);
  useEffect(load, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editing.id) await api.patch(`/sadmin/plans/${editing.id}`, editing);
      else await api.post('/sadmin/plans', editing);
      setEditing(null); load();
    } catch(e) { alert(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:800,color:g.t1,marginBottom:2}}>Planos</h2>
          <p style={{fontSize:11,color:g.t3}}>Configure os pacotes que você vende</p>
        </div>
        <Btn onClick={()=>setEditing({name:'',slug:'',price_monthly:'',price_setup:2500,
          modules:[],max_candidates:1,features:[],is_active:true})} color={g.pu}>
          + Novo Plano
        </Btn>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {plans.map(p=>(
          <div key={p.id} style={{padding:'14px 18px',borderRadius:12,background:g.card,
            border:`1px solid ${g.border}`,display:'flex',alignItems:'center',gap:16}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:g.t1}}>{p.name}</span>
                {!p.is_active&&<Chip c={g.t4}>Inativo</Chip>}
              </div>
              <div style={{fontSize:10,color:g.t2}}>
                R$ {Number(p.price_monthly).toLocaleString('pt-BR')}/mês · Setup R$ {Number(p.price_setup).toLocaleString('pt-BR')} · {(p.modules||[]).length} módulos · {p.max_candidates===999?'∞':p.max_candidates} candidatos
              </div>
            </div>
            <Btn sm outline onClick={()=>setEditing({...p})}>Editar</Btn>
          </div>
        ))}
      </div>

      {editing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',
          backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',
          justifyContent:'center',padding:20}}>
          <div style={{background:'rgba(10,10,25,0.98)',border:`1px solid ${g.border}`,
            borderRadius:16,padding:24,width:'100%',maxWidth:600,maxHeight:'85vh',overflowY:'auto'}}>
            <h3 style={{fontSize:14,fontWeight:700,color:g.t1,marginBottom:16}}>
              {editing.id?'Editar Plano':'Novo Plano'}
            </h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16}}>
              <Inp label="Nome" value={editing.name} onChange={v=>setEditing(e=>({...e,name:v}))} half/>
              <Inp label="Slug" value={editing.slug} onChange={v=>setEditing(e=>({...e,slug:v}))} half mono placeholder="essencial"/>
              <Inp label="Preço Mensal (R$)" value={editing.price_monthly} type="number"
                onChange={v=>setEditing(e=>({...e,price_monthly:v}))} half/>
              <Inp label="Setup (R$)" value={editing.price_setup} type="number"
                onChange={v=>setEditing(e=>({...e,price_setup:v}))} half/>
              <Sel label="Máx. Candidatos" value={String(editing.max_candidates)}
                onChange={v=>setEditing(e=>({...e,max_candidates:Number(v)}))} half
                options={[{value:'1',label:'1'},{value:'3',label:'3'},{value:'5',label:'5'},{value:'999',label:'Ilimitado'}]}/>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:g.t3,marginBottom:8,fontWeight:600,
                textTransform:'uppercase',letterSpacing:'0.06em'}}>Módulos incluídos</div>
              <ModulePicker value={editing.modules} onChange={v=>setEditing(e=>({...e,modules:v}))}/>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <Btn outline onClick={()=>setEditing(null)} color={g.t3}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving} color={g.pu}>
                {saving?'Salvando...':'✓ Salvar Plano'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main SuperAdmin App ───────────────────────────────────────────────────────
export default function SuperAdmin({ token, onLogout }) {
  const api   = useApi(token);
  const [nav, setNav]     = useState('dashboard');
  const [editOrg, setEditOrg] = useState(null); // null | {} | org object

  const NAV = [
    {id:'dashboard', label:'Dashboard',   icon:'▣'},
    {id:'clientes',  label:'Clientes',    icon:'◈'},
    {id:'planos',    label:'Planos',      icon:'$'},
  ];

  const goEdit = org => { setEditOrg(org || {}); setNav('editor'); };
  const goBack = () => { setEditOrg(null); setNav('clientes'); };

  return (
    <div style={{minHeight:'100vh',background:g.bg,color:g.t1,display:'flex',
      fontFamily:"'Inter',sans-serif"}}>

      {/* Sidebar */}
      <div style={{width:200,minWidth:200,height:'100vh',position:'sticky',top:0,
        background:'rgba(5,5,15,0.9)',borderRight:`1px solid ${g.border}`,
        display:'flex',flexDirection:'column',padding:'16px 0'}}>

        <div style={{padding:'0 16px 16px',borderBottom:`1px solid ${g.border}`,marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:800,color:g.cyan,letterSpacing:'0.08em'}}>
            ⚡ SADMIN
          </div>
          <div style={{fontSize:9,color:g.t4,marginTop:2}}>Painel de Controle</div>
        </div>

        {NAV.map(n=>(
          <button key={n.id} onClick={()=>{setNav(n.id);setEditOrg(null);}}
            style={{width:'100%',padding:'9px 16px',border:'none',
              background:nav===n.id||editOrg&&n.id==='clientes'?'rgba(6,182,212,0.08)':'transparent',
              color:nav===n.id?g.cyan:g.t3,fontSize:11,fontWeight:nav===n.id?700:400,
              cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:8,
              borderLeft:nav===n.id?`2px solid ${g.cyan}`:'2px solid transparent'}}>
            <span style={{fontSize:12}}>{n.icon}</span>{n.label}
          </button>
        ))}

        <div style={{marginTop:'auto',padding:'12px 16px',borderTop:`1px solid ${g.border}`}}>
          <button onClick={onLogout}
            style={{width:'100%',padding:'7px 12px',borderRadius:8,border:`1px solid ${g.border}`,
              background:'transparent',color:g.t4,fontSize:10,cursor:'pointer'}}>
            Sair do Admin
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflow:'auto',padding:'28px 32px',maxWidth:900}}>
        {nav==='dashboard' && <Dashboard api={api} onNav={setNav}/>}
        {(nav==='clientes'&&!editOrg) && (
          <OrgList api={api} onEdit={goEdit} onNew={()=>goEdit(null)}/>
        )}
        {nav==='editor' && (
          <OrgEditor api={api} org={editOrg?.id?editOrg:null}
            onBack={goBack} onSaved={goBack}/>
        )}
        {nav==='planos' && <PlansManager api={api}/>}
      </div>
    </div>
  );
}
