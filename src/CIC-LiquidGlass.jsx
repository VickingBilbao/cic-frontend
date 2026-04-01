import { useState, useEffect, useRef } from "react";
import { LoginConnected, CampaignSelectorConnected } from './CIC-App.jsx';
import { useChat } from './hooks/useChat.js';
import { useDemandas, useMonitoramento, useCRM, useFundraising,
         useVoluntarios, useAgenda, useDebate, useEstrategia,
         useGOTV, useDiagnostico } from './hooks/useDataHooks.js';
import useAppStore from './store/useAppStore.js';
import { config as configApi } from './api/endpoints.js';
import { useTheme } from './hooks/useTheme.js';
import SuperAdmin from './SuperAdmin.jsx';
const LOGO_SRC="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAGGklEQVR4nO2cTWxj1RXHf+fe52c7dhJGU6oKGMEsqCgShdnNpuzosqpKUZlKZQWrWVNUjQRFiAUVnxLsWgkqBAs2IFh10RapQmIFC6aMBENV8T2hhEnGSez3zrld2AnJJGPf5NkPO7yfFMl+vrk+7+/7ce655z4Jt/w0UHFg3HdtwKxTCViQJKZQANT7CZsyXXgzJIwe3aIEFDOSzkpho2YDgRCg0YRa2n89hKECBhEkz7hw5Gr+9NvTYzVzWnEhkKcNfvfmG5z48CxWb+KCXbH8cAERRJWlhat44lf3jt3YqcRymG9w4qNznHj/HawxhxvSCKO6cGJGbWWZAAj9MfGw4k1RW6Se9UBkZPnoSST3/nshYJD+hBkixIPKjSlMJWBBKgELUglYkErAglQCFqQSsCCVgAWpBCxIJWBBopZy42Arvha3QvrO8KaIalQsEEoUUFvzEBOUDSFqET8pclNo1+lGxAKhLAFF+MVbf+MHF5dJrhSKCP34Y5YkJJrjIlvAuHFmaKPJTz77D9TSkXaUJKDj6Zef4/j5f7P6w2vwpruKBIRUc2oXl7H5BdbTBjIkkDkhQ4FAQKjnGaT1ocFUKEtA58h8wtu3nuT2h/+M31jDtnVTb0benOPEh2f51x/u4Ten/8gbJ+8g6aygrty9GG9K3l7kxWfOcNc/XydvL5Ls8YNvUtoYmJhCgF5aB9Od45wZpHW6SUqiSuYTevUGvawLJQuIKaT16B+uNAEBhICo4lR3tUBVxQcdvO+X86poyUOhN0WncRbeJIhs/e26NvBxguxdrkz7Yqkc6YKU3gJdCLtcAxcCIYTobiMhTMwf37IlsnypApoIVksxzXdMImYGtZRuUouqJyQJQSbTecwUaikaWX9pApoIzazHsQuf4rrrW+Md8q3zemx5afS2nwhHV5Zpb2xgTpDNrcLtjNo+3OuzwTUXFO2s0u6ugcjIlliOgKZ06g1uOf8+791/Cm+286ZDf+IAwHnkCnfuTdH2Io//5TFO/eM1stZwH+3AiFDLM2i29nT6t1NiC3S4LGPhqy/hcu9+s0XU4rpwmmfUN9ap1eo4HbOAm7aIjG9jvTDimOtt8NF1x3no1Gl8r7vDD3TBsLTO9V98wiN/fYpRQ7iJELxHnR//ZBIAx5T5gSKkec7nR47y4s9/Ces9cINbD/S9/7kGN557j0deeDIq5CWDWTv2RvfFPqosrQsHEWp5TrJ6CbfHWlg146q1S1F1TVNIsVQ3JoiQO49zfoeAAUGdR93s+fWzZzHTldw0kwJOUxeeSQGniZkUsOrCh4iZFLAaAw8RMylgNQYeIkqPSI+DIII5h4nDhh3iOFDlgBC9zp5BAYVG1sOtd0h92g9EjJ3QP+blEkYNGDMlYEDAlA9+dIx3b7qNvDmPH3P2goSAec/xC59xZPUiYUiAF2ZMQHMONtY4c+e9nPn1fRP6EoX2Ii89/ntO/f1VdFoyE8aK9VvdJPxBZ4qpRic3zaaAAyblzuyn3sqNKUglYEFKTi7q7wF7M+SykD5mW7l4LoStcmWvfL0ZIfK4P5S8J9LzCdZq9WdT960wqgZzc6w2WpgIl+pNrNWgZxqXFjxGVBVaDXpJbYpSfIE0y7j26yV+9s5b+O7G7k2leoObPj6Py3qcPH+WjfYCyVoHc25rUN/8j5j3+ym7/b0zQ5strlleAp8M9QEBZNiDd0wcrrvOuRt+zM2PPn/wA9fO8cqzD3Lzfz+ApDZwEbbXMkitFSH3CV510J0P8m3FjoQLfX/z2q+XWOhcIjg3dBApKbXDuOv0w3HZ93vlupSImBLai7z8xAPcPVWOdAhRY0q/7GRNGYYzQ/cxiVRuTEEqAQtSCViQSsCCVAIWpBKwIJWABakELEglYEEqAQtSCViQ6LXw5tpwmhJ7JsF+E9cjnx8omE8Grw83uQgkSfSJzSgBvSlHOivfiwcwelNy+od5YsJvQwOqfQLqPN+05veM9G5VtMe1yz+LOdJ22QmwK17bb72jbN1eVxBhfq0T9RjQiBYoeFWOfvO/0UUPE86P8aiXCCHyKOphYey7chM5UnUIqPzAglQCFuT/uz11OEr5kAUAAAAASUVORK5CYII=";
function CICLogo({ size = 36 }) { return <img src={LOGO_SRC} alt="CIC" width={size} height={size} style={{ display:"block",flexShrink:0,objectFit:"contain",imageRendering:"auto" }} />; }
const g={card:{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16},surface:{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12},sidebar:{background:"rgba(20,20,28,0.65)",backdropFilter:"blur(60px) saturate(200%)",WebkitBackdropFilter:"blur(60px) saturate(200%)",borderRight:"1px solid rgba(255,255,255,0.08)"},input:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:10,color:"#F0EDE8",outline:"none"},red:"#FF2D2D",rg:"rgba(255,45,45,0.18)",cyan:"#00E5FF",cg:"rgba(0,229,255,0.14)",gn:"#34D399",am:"#FBBF24",t1:"#F0EDE8",t2:"#B8B3AB",t3:"#7A756E",t4:"#4A463F"};
const G=(s={})=>({...g.card,padding:16,...s});const GS=(s={})=>({...g.surface,padding:12,...s});
const rg=(cols,mobCols="1fr 1fr")=>{try{return window.innerWidth<768?mobCols:cols}catch(e){return cols}};
const Badge=({color,children})=><span style={{fontSize:9,fontWeight:600,color,background:color+"18",padding:"2px 8px",borderRadius:8}}>{children}</span>;
const SL=({children})=><div style={{fontSize:10,fontWeight:600,color:g.t3,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>{children}</div>;
const Accent=()=><div style={{width:3,height:22,borderRadius:2,background:`linear-gradient(180deg,${g.red},${g.cyan})`,boxShadow:`0 0 12px ${g.red}40`}}/>;
const MODS=[{id:"dash",label:"Dashboard",ic:"▣"},{id:"demandas",label:"Demandas",ic:"✦"},{id:"diag",label:"Diagnóstico",ic:"◉"},{id:"mon",label:"Monitoramento",ic:"◎"},{id:"crm",label:"CRM Eleitores",ic:"◈"},{id:"fund",label:"Arrecadação",ic:"$"},{id:"comm",label:"Comunicação",ic:"✉"},{id:"vol",label:"Voluntários",ic:"♟"},{id:"prod",label:"Produção",ic:"✎"},{id:"social",label:"Publicação Social",ic:"◎"},{id:"agenda",label:"Agenda",ic:"☰"},{id:"debate",label:"Simulador Debate",ic:"⚔"},{id:"relat",label:"Relatórios",ic:"◫"},{id:"pesq",label:"Pesquisas",ic:"?"},{id:"gotv",label:"Dia da Eleição",ic:"✓"},{id:"mapa",label:"Mapa Eleitoral",ic:"⊞"},{id:"estr",label:"Estratégica",ic:"◈"},{id:"ia",label:"Assistente IA",ic:"⬡"},{id:"config",label:"Configurações",ic:"⚙"}];
const CAMPS=[{id:1,name:"João Silva",cargo:"Prefeito",city:"São Paulo - SP",color:g.red,initials:"JS"},{id:2,name:"Maria Souza",cargo:"Dep. Estadual",city:"Belo Horizonte - MG",color:g.cyan,initials:"MS"},{id:3,name:"Carlos Lima",cargo:"Vereador",city:"Recife - PE",color:g.am,initials:"CL"},{id:4,name:"Ana Torres",cargo:"Governadora",city:"Curitiba - PR",color:g.gn,initials:"AT"}];
const TEAM=[
{id:1,name:"Marcos Oliveira",initials:"MO",email:"marcos@cic.com",role:"Gerente de Campanha",perfil:"gerente",cor:g.cyan,online:true,modulos:"todos",ultimoAcesso:"Agora"},
{id:2,name:"Lucas Costa",initials:"LC",email:"lucas@cic.com",role:"Produtor de Conteúdo",perfil:"produtor",cor:"#E1306C",online:true,modulos:"dash,demandas,prod,social,comm",ultimoAcesso:"Agora"},
{id:3,name:"Ana Martins",initials:"AM",email:"ana@cic.com",role:"Coordenadora de Campo",perfil:"coordenador",cor:g.am,online:true,modulos:"dash,demandas,crm,comm,vol,mapa,gotv,pesq",ultimoAcesso:"Há 15min"},
{id:4,name:"Rafael Pereira",initials:"RP",email:"rafael@cic.com",role:"Analista de Monitoramento",perfil:"analista",cor:g.gn,online:false,modulos:"dash,demandas,diag,mon,relat,pesq,mapa",ultimoAcesso:"Há 2h"},
{id:5,name:"Juliana Mendes",initials:"JM",email:"juliana@cic.com",role:"Financeira",perfil:"financeiro",cor:"#9B59B6",online:false,modulos:"dash,demandas,fund,relat",ultimoAcesso:"Ontem"},
{id:6,name:"Pedro Santos",initials:"PS",email:"pedro@cic.com",role:"Coordenador de Campo",perfil:"coordenador",cor:g.am,online:true,modulos:"dash,demandas,crm,comm,vol,mapa,gotv,pesq",ultimoAcesso:"Agora"},
{id:7,name:"Diana Rocha",initials:"DR",email:"diana@cic.com",role:"Curadora de Pesquisa",perfil:"curador",cor:"#3B82F6",online:true,modulos:"dash,demandas,diag,mon,pesq,mapa,relat",ultimoAcesso:"Há 30min"},
{id:8,name:"Bruno Tavares",initials:"BT",email:"bruno@cic.com",role:"Roteirista de TV",perfil:"roteiristaTV",cor:"#F97316",online:false,modulos:"dash,demandas,prod,social,debate,comm",ultimoAcesso:"Há 1h"},
{id:9,name:"Camila Freitas",initials:"CF",email:"camila@cic.com",role:"Roteirista de Rádio",perfil:"roteiristaRadio",cor:"#06B6D4",online:true,modulos:"dash,demandas,prod,comm,agenda",ultimoAcesso:"Agora"}
];
const PERFIS={admin:{label:"Administrador",cor:g.red,desc:"Acesso total a todos os módulos e configurações",mods:"todos",perms:"Ler, Criar, Editar, Excluir, Aprovar, Configurar"},gerente:{label:"Gerente de Campanha",cor:g.cyan,desc:"Acesso total, gerencia demandas e equipe",mods:"todos",perms:"Ler, Criar, Editar, Aprovar"},produtor:{label:"Produtor de Conteúdo",cor:"#E1306C",desc:"Produção IA, Publicação Social, Comunicação",mods:"dash,demandas,prod,social,comm",perms:"Ler, Criar, Editar"},analista:{label:"Analista",cor:g.gn,desc:"Monitoramento, Diagnóstico, Relatórios, Pesquisas",mods:"dash,demandas,diag,mon,relat,pesq,mapa",perms:"Ler, Criar, Exportar"},coordenador:{label:"Coordenador de Campo",cor:g.am,desc:"Voluntários, CRM, Comunicação, Mapa, GOTV",mods:"dash,demandas,crm,comm,vol,mapa,gotv,pesq",perms:"Ler, Criar, Editar"},financeiro:{label:"Financeiro",cor:"#9B59B6",desc:"Arrecadação, Compliance, Relatórios financeiros",mods:"dash,demandas,fund,relat",perms:"Ler, Criar, Exportar"},curador:{label:"Curador de Pesquisa",cor:"#3B82F6",desc:"Diagnóstico, Pesquisas, Monitoramento, Mapa Eleitoral, Relatórios",mods:"dash,demandas,diag,mon,pesq,mapa,relat",perms:"Ler, Criar, Editar, Exportar"},roteiristaTV:{label:"Roteirista de TV",cor:"#F97316",desc:"Produção IA (roteiros e vídeo), Publicação Social, Debate, Comunicação",mods:"dash,demandas,prod,social,debate,comm",perms:"Ler, Criar, Editar"},roteiristaRadio:{label:"Roteirista de Rádio",cor:"#06B6D4",desc:"Produção IA (jingles e locução), Comunicação, Agenda",mods:"dash,demandas,prod,comm,agenda",perms:"Ler, Criar, Editar"}};
function AreaChart({data,color=g.cyan,h=38,w=110}){const max=Math.max(...data),min=Math.min(...data),r=max-min||1;const pts=data.map((v,i)=>({x:(i/(data.length-1))*w,y:h-((v-min)/r)*(h-6)-3}));const line=pts.map(p=>`${p.x},${p.y}`).join(" ");const id=`a${Math.random().toString(36).slice(2,7)}`;return<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><polygon points={`0,${h} ${line} ${w},${h}`} fill={`url(#${id})`}/><polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{filter:`drop-shadow(0 0 3px ${color}50)`}}/><circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="3" fill={color} style={{filter:`drop-shadow(0 0 5px ${color}70)`}}><animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/></circle></svg>;}
function HBar({label,value,max,color,delay=0}){const[w,setW]=useState(0);useEffect(()=>{setTimeout(()=>setW((value/max)*100),80+delay)},[]);return<div style={{marginBottom:11}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:g.t2}}>{label}</span><span style={{color:g.t1,fontWeight:700}}>{value}%</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,width:`${w}%`,background:`linear-gradient(90deg,${color}BB,${color})`,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 10px ${color}35`}}><div style={{width:"100%",height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,0.15),transparent)",borderRadius:"4px 4px 0 0"}}/></div></div></div>;}
function Donut({segments,size=110}){const total=segments.reduce((s,x)=>s+x.value,0);let cum=0;const r=38,c=2*Math.PI*r;const[a,setA]=useState(false);useEffect(()=>{setTimeout(()=>setA(true),200)},[]);return<svg width={size} height={size} viewBox="0 0 110 110"><defs>{segments.map((_,i)=><filter key={i} id={`gl${i}`}><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>)}</defs><circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10"/>{segments.map((seg,i)=>{const off=(cum/total)*c,len=(seg.value/total)*c;cum+=seg.value;return<circle key={i} cx="55" cy="55" r={r} fill="none" stroke={seg.color} strokeWidth="10" strokeDasharray={a?`${len} ${c-len}`:`0 ${c}`} strokeDashoffset={-off} strokeLinecap="round" filter={`url(#gl${i})`} style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)"}}/>})}<circle cx="55" cy="55" r="24" fill="rgba(255,255,255,0.02)"/><text x="55" y="52" textAnchor="middle" fill={g.t1} fontSize="15" fontWeight="700">{total}%</text><text x="55" y="64" textAnchor="middle" fill={g.t4} fontSize="8">total</text></svg>;}
function MiniGauge({value,max,color,size=42}){const r=16,c=2*Math.PI*r,pct=value/max;const[a,setA]=useState(false);useEffect(()=>{setTimeout(()=>setA(true),300)},[]);return<svg width={size} height={size} viewBox="0 0 42 42"><circle cx="21" cy="21" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3.5"/><circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={a?`${pct*c} ${c-pct*c}`:`0 ${c}`} strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dasharray 1.5s ease",filter:`drop-shadow(0 0 3px ${color}50)`}}/></svg>;}
function Counter({end,suffix=""}){const[v,setV]=useState(0);useEffect(()=>{let s=0;const step=end/50;const t=setInterval(()=>{s+=step;if(s>=end){setV(end);clearInterval(t)}else setV(Math.floor(s))},20);return()=>clearInterval(t)},[end]);return<span>{typeof end==="number"&&end%1!==0?v.toFixed(1):v.toLocaleString("pt-BR")}{suffix}</span>;}
function HealthScore({score=74}){const color=score>=70?g.gn:score>=40?g.am:g.red;const label=score>=70?"Saudável":score>=40?"Atenção":"Crítica";const r=44,c=2*Math.PI*r;const[a,setA]=useState(false);useEffect(()=>{setTimeout(()=>setA(true),400)},[]);return<div style={{textAlign:"center"}}><svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"/><circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={a?`${(score/100)*c} ${c-(score/100)*c}`:`0 ${c}`} strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dasharray 2s cubic-bezier(0.4,0,0.2,1)",filter:`drop-shadow(0 0 6px ${color}60)`}}/><text x="55" y="50" textAnchor="middle" fill={g.t1} fontSize="22" fontWeight="800">{score}</text><text x="55" y="66" textAnchor="middle" fill={color} fontSize="9" fontWeight="600">{label}</text></svg></div>;}
function Countdown(){const el=new Date("2026-10-04");const now=new Date();const diff=Math.max(0,Math.floor((el-now)/86400000));const h=Math.floor((el-now)/3600000)%24;const m=Math.floor((el-now)/60000)%60;return<div style={{display:"flex",gap:8,justifyContent:"center"}}>{[{v:diff,l:"dias"},{v:h,l:"horas"},{v:m,l:"min"}].map((x,i)=><div key={i} style={{textAlign:"center"}}><div style={{...GS({padding:"8px 12px",minWidth:44}),fontSize:20,fontWeight:800,color:g.t1,lineHeight:1}}>{x.v}</div><div style={{fontSize:8,color:g.t4,marginTop:4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{x.l}</div></div>)}</div>;}
function AlertBanner({alerts}){const[idx,setIdx]=useState(0);useEffect(()=>{if(alerts.length<=1)return;const t=setInterval(()=>setIdx(p=>(p+1)%alerts.length),5000);return()=>clearInterval(t)},[alerts]);if(!alerts.length)return null;const a=alerts[idx];return<div style={{...G({padding:"10px 14px",borderRadius:10,background:`${a.color}10`,border:`1px solid ${a.color}25`}),display:"flex",alignItems:"center",gap:10,marginBottom:14,animation:"fadeUp .3s ease"}}><div style={{width:8,height:8,borderRadius:"50%",background:a.color,boxShadow:`0 0 8px ${a.color}60`,animation:"pulse 2s infinite",flexShrink:0}}/><div style={{flex:1,fontSize:11,color:g.t1}}><span style={{fontWeight:700,color:a.color,marginRight:6}}>{a.level}</span>{a.text}</div><span style={{fontSize:9,color:g.t4}}>{idx+1}/{alerts.length}</span></div>;}
function WeekCalendar(){const days=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];const today=new Date().getDay();const todayIdx=today===0?6:today-1;const events=[[{t:"Reunião",c:g.cyan}],[{t:"Gravação",c:g.red}],[{t:"Debate TV",c:g.am}],[{t:"Comício",c:g.gn}],[{t:"Lives",c:"#E1306C"}],[{t:"Caminhada",c:g.red}],[]];return<div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>{days.map((d,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:9,color:i===todayIdx?g.cyan:g.t4,fontWeight:i===todayIdx?700:400,marginBottom:4}}>{d}</div><div style={{...GS({padding:"6px 2px",minHeight:36,borderRadius:8,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}),border:i===todayIdx?`1px solid ${g.cyan}30`:"1px solid rgba(255,255,255,0.04)",background:i===todayIdx?g.cg:"rgba(255,255,255,0.02)"}}>{events[i]?.map((ev,j)=><div key={j} style={{fontSize:7,color:ev.c,fontWeight:600,lineHeight:1.3}}>{ev.t}</div>)}</div></div>)}</div>;}
function PhoneMockup({type="feed",content}){const isFeed=type==="feed";return<div style={{width:isFeed?150:85,background:"#000",borderRadius:12,border:"2px solid rgba(255,255,255,0.08)",overflow:"hidden"}}><div style={{height:12,background:"#111",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:28,height:3,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/></div><div style={{padding:"3px 5px",display:"flex",alignItems:"center",gap:3,borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{width:10,height:10,borderRadius:"50%",background:`linear-gradient(135deg,${g.red},${g.cyan})`}}/><div style={{fontSize:5,color:g.t2,fontWeight:600}}>candidato_oficial</div></div><div style={{height:isFeed?140:130,background:`linear-gradient(135deg,${g.red}15,${g.cyan}10)`,display:"flex",alignItems:"center",justifyContent:"center",padding:6}}><div style={{fontSize:6,color:g.t1,textAlign:"center",lineHeight:1.5}}>{content||"Preview"}</div></div><div style={{padding:"3px 5px"}}><div style={{display:"flex",gap:5,marginBottom:1}}>{["♡","💬","➤"].map((e,i)=><span key={i} style={{fontSize:7,color:g.t3}}>{e}</span>)}</div><div style={{fontSize:4,color:g.t4}}>1.247 curtidas</div></div></div>;}
function GlassBG(){return<div style={{position:"fixed",inset:0,background:"#060610",zIndex:0,overflow:"hidden"}}><div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%,#0D0818 0%,#060610 50%,#040408 100%)"}}/><div style={{position:"absolute",top:"-25%",left:"-15%",width:"65%",height:"70%",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,45,45,0.14) 0%,transparent 70%)",animation:"od1 30s cubic-bezier(0.4,0,0.6,1) infinite",filter:"blur(20px)"}}/><div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"60%",height:"65%",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,229,255,0.10) 0%,transparent 70%)",animation:"od2 35s cubic-bezier(0.4,0,0.6,1) infinite",filter:"blur(25px)"}}/><div style={{position:"absolute",top:"50%",left:"20%",width:"30%",height:"35%",borderRadius:"50%",background:"radial-gradient(circle,rgba(255,45,45,0.06) 0%,transparent 60%)",animation:"od3 22s cubic-bezier(0.4,0,0.6,1) infinite",filter:"blur(15px)"}}/><div style={{position:"absolute",top:"15%",right:"20%",width:"25%",height:"28%",borderRadius:"50%",background:"radial-gradient(circle,rgba(0,229,255,0.05) 0%,transparent 60%)",animation:"od4 28s ease-in-out infinite",filter:"blur(18px)"}}/><div style={{position:"absolute",inset:0,animation:"gf 60s linear infinite"}}><div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"100% 44px"}}/></div><div style={{position:"absolute",inset:0,animation:"gfh 80s linear infinite"}}><div style={{position:"absolute",inset:"-100%",width:"300%",height:"300%",backgroundImage:"linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)",backgroundSize:"44px 100%"}}/></div><div style={{position:"absolute",top:0,left:"-100%",width:"60%",height:"200%",background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.008) 50%,transparent 60%)",animation:"ls 15s ease infinite",transform:"rotate(-15deg)"}}/><div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.4) 100%)"}}/></div>;}
function Login({onGo}){
const[loaded,setLoaded]=useState(false);const[typing,setTyping]=useState(0);
useEffect(()=>{setTimeout(()=>setLoaded(true),300)},[]);
const feats=[{ic:"◉",t:"Diagnóstico",d:"Pesquisas e cenário"},{ic:"◎",t:"Monitoramento",d:"Redes sociais 24/7"},{ic:"✎",t:"Produção IA",d:"Jingles, fotos, roteiros"},{ic:"◈",t:"Estratégia",d:"Curadoria + IA"},{ic:"✦",t:"Demandas",d:"Hub de operações"},{ic:"⬡",t:"Assistente IA",d:"Fernando Carreiro"}];
const particles=Array.from({length:25},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:Math.random()*3+1,dur:Math.random()*20+15,delay:Math.random()*10}));
const orbs=[{x:20,y:30,size:300,color:g.red,opacity:0.06,dur:25},{x:80,y:70,size:250,color:g.cyan,opacity:0.05,dur:30},{x:50,y:20,size:200,color:"#1B3A7B",opacity:0.08,dur:20},{x:70,y:40,size:180,color:g.red,opacity:0.04,dur:35}];

return<div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>

{orbs.map((o,i)=><div key={i} style={{position:"absolute",left:`${o.x}%`,top:`${o.y}%`,width:o.size,height:o.size,borderRadius:"50%",background:`radial-gradient(circle,${o.color} 0%,transparent 70%)`,opacity:o.opacity,filter:"blur(60px)",animation:`od${(i%4)+1} ${o.dur}s ease-in-out infinite`,transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>)}

{particles.map(p=><div key={p.id} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:p.size,height:p.size,borderRadius:"50%",background:p.id%3===0?g.red:p.id%3===1?g.cyan:"rgba(255,255,255,0.3)",opacity:0.4,animation:`loginFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,pointerEvents:"none"}}/>)}

<div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)`,backgroundSize:"80px 80px",animation:"loginGrid 40s linear infinite",pointerEvents:"none"}}/>

<div style={{display:"flex",gap:50,alignItems:"center",maxWidth:900,position:"relative",zIndex:2}}>

<div style={{flex:1,minWidth:340}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(20px)",transition:"all 1s cubic-bezier(0.16,1,0.3,1)"}}>
<div style={{position:"relative"}}><div style={{position:"absolute",inset:-8,borderRadius:"50%",background:`radial-gradient(circle,${g.red}25,transparent 70%)`,animation:"loginLogoPulse 3s ease-in-out infinite"}}/><CICLogo size={52}/></div>
<div><div style={{fontSize:18,fontWeight:800,color:g.t1,letterSpacing:"-0.02em"}}>CIC</div><div style={{fontSize:8,color:g.cyan,fontWeight:500,letterSpacing:"0.15em",textTransform:"uppercase"}}>Centro de Inteligência</div></div>
</div>

<h1 style={{fontSize:34,fontWeight:800,color:g.t1,lineHeight:1.15,marginBottom:14,letterSpacing:"-0.02em"}}>
<span style={{display:"block",opacity:loaded?1:0,transform:loaded?"translateX(0)":"translateX(-30px)",transition:"all .8s cubic-bezier(0.16,1,0.3,1) .3s"}}>Um novo jeito</span>
<span style={{display:"block",opacity:loaded?1:0,transform:loaded?"translateX(0)":"translateX(-30px)",transition:"all .8s cubic-bezier(0.16,1,0.3,1) .5s"}}>de fazer <span style={{color:g.cyan,textShadow:`0 0 40px ${g.cg}`}}>campanhas</span></span>
</h1>

<p style={{fontSize:13,color:g.t2,lineHeight:1.8,marginBottom:28,opacity:loaded?1:0,transition:"opacity 1s ease 1s",maxWidth:380}}>Estratégia de alto nível, monitoramento em tempo real e produção em escala — com IA treinada na metodologia de <strong style={{color:g.red}}>Fernando Carreiro</strong>.</p>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
{feats.map((f,i)=><div key={i} style={{...GS({padding:"10px 10px",display:"flex",gap:7,alignItems:"center"}),opacity:loaded?1:0,transform:loaded?"translateY(0) scale(1)":"translateY(15px) scale(0.95)",transition:`all .6s cubic-bezier(0.16,1,0.3,1) ${0.8+i*0.1}s`}}><span style={{fontSize:14,color:i%2===0?g.cyan:g.red}}>{f.ic}</span><div><div style={{fontSize:9,fontWeight:600,color:g.t1}}>{f.t}</div><div style={{fontSize:7,color:g.t4}}>{f.d}</div></div></div>)}
</div>

<div style={{display:"flex",gap:16,marginTop:20,opacity:loaded?1:0,transition:"opacity 1s ease 1.6s"}}>
{[{v:"19",l:"módulos"},{v:"80+",l:"features"},{v:"50+",l:"campanhas"},{v:"24/7",l:"monitoramento"}].map((s,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:g.t1}}>{s.v}</div><div style={{fontSize:7,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{s.l}</div></div>)}
</div>
</div>

<div style={{width:340,opacity:loaded?1:0,transform:loaded?"translateY(0) scale(1)":"translateY(30px) scale(0.96)",transition:"all 1s cubic-bezier(0.16,1,0.3,1) .6s"}}>
<div style={{...G({padding:"32px 28px",borderRadius:24,position:"relative",overflow:"hidden"})}}>
<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${g.cyan}40,transparent)`,animation:"loginCardShimmer 3s ease-in-out infinite"}}/>

<div style={{textAlign:"center",marginBottom:24}}>
<div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:48,height:48,borderRadius:16,background:`linear-gradient(135deg,${g.red}20,${g.cyan}15)`,marginBottom:12}}><CICLogo size={28}/></div>
<h2 style={{fontSize:19,fontWeight:700,color:g.t1,marginBottom:3}}>Acessar plataforma</h2>
<p style={{fontSize:10,color:g.t4}}>Entre no seu centro de inteligência</p>
</div>

<label style={{fontSize:10,color:g.t3,display:"block",marginBottom:4,fontWeight:500}}>E-mail</label>
<input placeholder="seu@email.com" style={{...g.input,width:"100%",padding:"12px 14px",fontSize:12,boxSizing:"border-box",marginBottom:14,borderRadius:12}}/>
<label style={{fontSize:10,color:g.t3,display:"block",marginBottom:4,fontWeight:500}}>Senha</label>
<input type="password" placeholder="••••••••" style={{...g.input,width:"100%",padding:"12px 14px",fontSize:12,boxSizing:"border-box",marginBottom:20,borderRadius:12}}/>

<button onClick={onGo} style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 6px 24px ${g.rg}`,position:"relative",overflow:"hidden"}}><span style={{position:"relative",zIndex:1}}>Entrar no CIC</span><div style={{position:"absolute",top:0,left:"-100%",width:"100%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",animation:"loginBtnShimmer 2.5s ease-in-out infinite"}}/></button>

<div style={{display:"flex",justifyContent:"space-between",marginTop:14}}>
<span style={{fontSize:10,color:g.t4}}>Esqueceu? <span style={{color:g.cyan,cursor:"pointer"}}>Recuperar</span></span>
<span style={{fontSize:10,color:g.t4}}>Novo? <span style={{color:g.cyan,cursor:"pointer"}}>Solicitar</span></span>
</div>

<div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}>
<div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Metodologia</div>
<div style={{fontSize:11,color:g.red,fontWeight:600}}>{cfgUser?.nome||cfgUser?.name||"Fernando Carreiro"}</div>
<div style={{fontSize:8,color:g.t4}}>20+ anos · 50+ campanhas vitoriosas</div>
</div>
</div>
</div>
</div>
</div>;
}
function CampSel({onPick}){
  const [showNew, setShowNew] = useState(false);
  const [newTab, setNewTab] = useState("dados");
  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [cargo, setCargo] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [slogan, setSlogan] = useState("");
  const [bio, setBio] = useState("");
  const [aiFiles, setAiFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [camps, setCamps] = useState(CAMPS);

  const cargos = ["Prefeito(a)", "Vice-Prefeito(a)", "Vereador(a)", "Deputado(a) Estadual", "Deputado(a) Federal", "Senador(a)", "Governador(a)", "Vice-Governador(a)", "Presidente"];
  const estados = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  const colors = [g.red, g.cyan, g.gn, g.am, "#9B59B6", "#E1306C", "#4267B2", "#00F2EA"];

  const handleCreate = () => {
    if (!nome.trim()) return;
    const newCamp = {
      id: camps.length + 1,
      name: nome,
      cargo: cargo || "Candidato",
      city: `${municipio || "—"} - ${estado || "—"}`,
      color: colors[camps.length % colors.length],
      initials: nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    };
    setCamps(p => [...p, newCamp]);
    setShowNew(false);
    setNome(""); setPartido(""); setCargo(""); setEstado(""); setMunicipio(""); setSlogan(""); setBio("");
    setNewTab("dados"); setAiFiles([]);
  };

  const handleUploadAI = (source) => {
    setUploading(true);
    setTimeout(() => {
      setAiFiles(p => [...p, { source, name: `dados_${source.toLowerCase()}_${Date.now()}.json`, size: `${(Math.random()*2+0.5).toFixed(1)} MB`, time: new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"}) }]);
      setUploading(false);
    }, 1500);
  };

  const inp = (s={}) => ({...g.input, width:"100%", padding:"9px 11px", fontSize:11, boxSizing:"border-box", ...s});
  const sel = (s={}) => ({...g.input, width:"100%", padding:"9px 11px", fontSize:11, boxSizing:"border-box", appearance:"none", WebkitAppearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237A756E' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:28, ...s});

  if (showNew) {
    return (
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:560,animation:"fadeUp .5s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button onClick={()=>setShowNew(false)} style={{width:32,height:32,borderRadius:8,border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.04)",color:g.t2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
            <h2 style={{fontSize:20,fontWeight:700,color:g.t1,margin:0}}>Nova Campanha</h2>
            <div style={{marginLeft:"auto",filter:"drop-shadow(0 2px 8px rgba(255,45,45,0.2))"}}><CICLogo size={28}/></div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:3,marginBottom:16,...GS({padding:3,borderRadius:10})}}>
            {[{id:"dados",label:"Dados do Candidato"},{id:"detalhes",label:"Detalhes da Campanha"},{id:"ia",label:"Integração IA"}].map(t=>
              <button key={t.id} onClick={()=>setNewTab(t.id)} style={{flex:1,padding:"8px 0",border:"none",borderRadius:7,fontSize:10,fontWeight:600,cursor:"pointer",background:newTab===t.id?"rgba(0,229,255,0.12)":"transparent",color:newTab===t.id?g.cyan:g.t4,transition:"all .2s"}}>{t.label}</button>
            )}
          </div>

          <div style={G({padding:"24px 22px",borderRadius:18})}>

            {/* TAB 1: Dados do Candidato */}
            {newTab === "dados" && (
              <div style={{animation:"fadeUp .3s ease"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Nome completo *</label>
                    <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do candidato" style={inp()}/>
                  </div>
                  <div>
                    <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Partido</label>
                    <input value={partido} onChange={e=>setPartido(e.target.value)} placeholder="Ex: PSD, MDB, PT..." style={inp()}/>
                  </div>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Cargo pretendido *</label>
                  <select value={cargo} onChange={e=>setCargo(e.target.value)} style={sel()}>
                    <option value="" style={{background:"#1A1A1F"}}>Selecione o cargo...</option>
                    {cargos.map(c=><option key={c} value={c} style={{background:"#1A1A1F"}}>{c}</option>)}
                  </select>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  <div>
                    <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Estado *</label>
                    <select value={estado} onChange={e=>setEstado(e.target.value)} style={sel()}>
                      <option value="" style={{background:"#1A1A1F"}}>UF...</option>
                      {estados.map(e=><option key={e} value={e} style={{background:"#1A1A1F"}}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Município</label>
                    <input value={municipio} onChange={e=>setMunicipio(e.target.value)} placeholder="Nome da cidade" style={inp()}/>
                  </div>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Número do candidato</label>
                  <input placeholder="Ex: 45, 13, 22..." style={inp({width:120})}/>
                </div>

                <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
                  <button onClick={()=>setNewTab("detalhes")} style={{padding:"10px 20px",background:`linear-gradient(135deg,${g.cyan},${g.cyan}CC)`,color:"#000",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>Próximo →</button>
                </div>
              </div>
            )}

            {/* TAB 2: Detalhes da Campanha */}
            {newTab === "detalhes" && (
              <div style={{animation:"fadeUp .3s ease"}}>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Slogan da campanha</label>
                  <input value={slogan} onChange={e=>setSlogan(e.target.value)} placeholder="Ex: Cidade que funciona, vida que melhora" style={inp()}/>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Biografia / histórico político</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Conte a trajetória do candidato, experiências, propostas principais..." rows={4} style={{...g.input,width:"100%",padding:"10px 12px",fontSize:11,boxSizing:"border-box",resize:"vertical",minHeight:80}}/>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Principais propostas</label>
                  <textarea placeholder="Liste as propostas separadas por linha..." rows={3} style={{...g.input,width:"100%",padding:"10px 12px",fontSize:11,boxSizing:"border-box",resize:"vertical",minHeight:60}}/>
                </div>

                <div style={{marginBottom:12}}>
                  <label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Adversários conhecidos</label>
                  <input placeholder="Nomes dos adversários separados por vírgula" style={inp()}/>
                </div>

                <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
                  <button onClick={()=>setNewTab("dados")} style={{padding:"10px 16px",border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.04)",color:g.t2,borderRadius:8,fontSize:11,cursor:"pointer"}}>← Voltar</button>
                  <button onClick={()=>setNewTab("ia")} style={{padding:"10px 20px",background:`linear-gradient(135deg,${g.cyan},${g.cyan}CC)`,color:"#000",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>Próximo →</button>
                </div>
              </div>
            )}

            {/* TAB 3: Integração IA */}
            {newTab === "ia" && (
              <div style={{animation:"fadeUp .3s ease"}}>
                <p style={{fontSize:11,color:g.t2,marginBottom:14,lineHeight:1.6}}>Conecte fontes de dados e carregue informações de APIs externas para alimentar a inteligência da campanha.</p>

                <SL>Carregar dados via API</SL>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                  {[
                    {name:"Google Gemini",icon:"✦",color:"#4285F4",desc:"Análise de cenário e pesquisas"},
                    {name:"ChatGPT",icon:"◆",color:"#10A37F",desc:"Dados de opinião e tendências"},
                    {name:"Claude AI",icon:"◈",color:"#D97706",desc:"Estratégia e posicionamento"},
                    {name:"Perplexity",icon:"◉",color:"#20B2AA",desc:"Pesquisa web em tempo real"},
                  ].map((api,i)=>(
                    <div key={i} style={{...GS({padding:"12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",transition:"all .3s"})}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${api.color}15`,border:`1px solid ${api.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:api.color}}>{api.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:600,color:g.t1}}>{api.name}</div>
                        <div style={{fontSize:8,color:g.t4}}>{api.desc}</div>
                      </div>
                      <button onClick={()=>handleUploadAI(api.name)} disabled={uploading} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${api.color}30`,background:`${api.color}10`,color:api.color,fontSize:9,fontWeight:600,cursor:uploading?"wait":"pointer",whiteSpace:"nowrap"}}>
                        {uploading ? "..." : "Importar"}
                      </button>
                    </div>
                  ))}
                </div>

                <SL>Upload de documentos</SL>
                <div style={{...GS({padding:"20px",textAlign:"center",borderStyle:"dashed",borderWidth:1,borderColor:"rgba(255,255,255,0.12)",cursor:"pointer",marginBottom:14})}}>
                  <div style={{fontSize:20,color:g.t4,marginBottom:6}}>⬆</div>
                  <div style={{fontSize:11,color:g.t2}}>Arraste arquivos aqui ou clique para selecionar</div>
                  <div style={{fontSize:9,color:g.t4,marginTop:4}}>PDF, DOC, XLSX, CSV, TXT · Máx 25MB</div>
                </div>

                {aiFiles.length > 0 && (<>
                  <SL>Arquivos importados</SL>
                  {aiFiles.map((f,i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<aiFiles.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:g.gn,boxShadow:`0 0 6px ${g.gn}60`}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:600,color:g.t1}}>{f.name}</div>
                        <div style={{fontSize:8,color:g.t4}}>via {f.source} · {f.size} · {f.time}</div>
                      </div>
                      <Badge color={g.gn}>Importado</Badge>
                    </div>
                  ))}
                </>)}

                <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
                  <button onClick={()=>setNewTab("detalhes")} style={{padding:"10px 16px",border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.04)",color:g.t2,borderRadius:8,fontSize:11,cursor:"pointer"}}>← Voltar</button>
                  <button onClick={handleCreate} style={{padding:"10px 24px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 16px ${g.rg}`}}>Criar Campanha</button>
                </div>
              </div>
            )}
          </div>

          {/* Step indicators */}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>
            {["dados","detalhes","ia"].map((t,i)=>(
              <div key={i} style={{width:newTab===t?20:6,height:6,borderRadius:3,background:newTab===t?g.cyan:"rgba(255,255,255,0.1)",transition:"all .3s",boxShadow:newTab===t?`0 0 8px ${g.cg}`:"none"}}/>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:520,animation:"fadeUp .5s ease"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"inline-block",marginBottom:8,filter:"drop-shadow(0 4px 16px rgba(255,45,45,0.25))"}}><CICLogo size={44}/></div>
          <h2 style={{fontSize:22,fontWeight:700,color:g.t1}}>Selecione a campanha</h2>
          <p style={{fontSize:11,color:g.t4,marginTop:4}}>Gerencie suas campanhas ou crie uma nova</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:12}}>
          {camps.map((c,i)=>
            <div key={c.id} onClick={()=>onPick(c)} style={{...G({padding:"16px 14px",borderRadius:16,cursor:"pointer",transition:"all .3s",animation:`fadeUp .4s ease ${i*0.06}s both`,position:"relative",overflow:"hidden"})}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color,boxShadow:`0 0 10px ${c.color}50`}}/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${c.color}30,${c.color}15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:c.color,border:`1px solid ${c.color}20`}}>{c.initials}</div>
                <div><div style={{fontSize:14,fontWeight:600,color:g.t1}}>{c.name}</div><div style={{fontSize:10,color:g.t4}}>{c.cargo}</div></div>
              </div>
              <div style={{fontSize:10,color:g.t3,marginBottom:4}}>{c.city}</div>
              <Badge color={c.color}>Ativa</Badge>
            </div>
          )}

          {/* ADD NEW CAMPAIGN BUTTON */}
          <div onClick={()=>setShowNew(true)} style={{...G({padding:"16px 14px",borderRadius:16,cursor:"pointer",transition:"all .3s",border:"1px dashed rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.02)"}),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:110,gap:8}}>
            <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${g.red}20,${g.cyan}20)`,border:`1px dashed ${g.cyan}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:g.cyan}}>+</div>
            <div style={{fontSize:12,fontWeight:600,color:g.t2}}>Nova Campanha</div>
            <div style={{fontSize:9,color:g.t4}}>Cadastrar candidato</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Dash({camp}){const dashKPIs=useAppStore(s=>s.dashKPIs);const loadDash=useAppStore(s=>s.loadDashboard);useEffect(()=>{loadDash&&loadDash()},[]);const alerts=[{level:"CRÍTICO",text:"Adversário: desinformação saúde — 847 posts/2h",color:g.red},{level:"ATENÇÃO",text:"#DebateHoje subindo — preparar resposta",color:g.am}];const kpiMock=[{t:"Intenção de Voto",v:34.7,s:"%",sp:[24,26,28,29,30,31,32,33,34,34.7],tr:"+2.3%",up:true,ga:true,gm:50},{t:"Menções Positivas",v:12480,sp:[5000,6200,7400,8000,9200,9800,10500,11200,11800,12480],tr:"+18%",up:true},{t:"Rejeição",v:18.2,s:"%",sp:[25,24,23,22,21,20.5,19.8,19.2,18.8,18.2],tr:"-3.1%",up:false,ga:true,gm:40},{t:"Engajamento",v:847000,sp:[320000,410000,530000,580000,620000,710000,780000,820000,847000],tr:"+23%",up:true}];const kpis=dashKPIs?[{t:"Intenção de Voto",v:dashKPIs.intencao_voto??34.7,s:"%",sp:[34.7],tr:dashKPIs.intencao_voto_trend||"+0pp",up:true,ga:true,gm:50},{t:"Menções Positivas",v:dashKPIs.mencoes_positivas??12480,sp:[12480],tr:dashKPIs.mencoes_trend||"+0%",up:true},{t:"Rejeição",v:dashKPIs.rejeicao??18.2,s:"%",sp:[18.2],tr:dashKPIs.rejeicao_trend||"+0pp",up:false,ga:true,gm:40},{t:"Engajamento",v:dashKPIs.engajamento??847000,sp:[847000],tr:dashKPIs.engajamento_trend||"+0%",up:true}]:kpiMock;return<div style={{animation:"fadeUp .4s ease"}}><AlertBanner alerts={alerts}/><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${camp?.color||g.red}40,${camp?.color||g.red}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:camp?.color||g.red,border:`1px solid ${camp?.color||g.red}25`,boxShadow:`0 0 12px ${camp?.color||g.red}20`}}>{camp?.initials||"?"}</div><div><h2 style={{fontSize:18,fontWeight:700,color:g.t1,margin:0}}>{camp?.name}</h2><div style={{fontSize:10,color:g.t3}}>{camp?.cargo} · {camp?.city}</div></div><span style={{marginLeft:"auto",fontSize:9,color:g.cyan,background:g.cg,padding:"3px 10px",borderRadius:10}}>⟳ Ao vivo</span><ExportBtn/></div><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr 2fr","1fr"),gap:10,marginBottom:14}}><div style={G({textAlign:"center"})}><SL>Saúde da Campanha</SL><HealthScore score={74}/></div><div style={G({textAlign:"center"})}><SL>Eleição 2026</SL><Countdown/><div style={{fontSize:9,color:g.t4,marginTop:8}}>04 de outubro de 2026</div></div><div style={G()}><SL>Agenda da Semana</SL><WeekCalendar/></div></div><div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:10,marginBottom:14}}>{kpis.map((k,i)=><div key={i} style={{...G({padding:"14px 12px"}),position:"relative",overflow:"hidden",animation:`fadeUp .4s ease ${i*0.06}s both`}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${k.up?g.cyan:g.red},transparent)`}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em"}}>{k.t}</div>{k.ga&&<MiniGauge value={k.v} max={k.gm} color={k.up?g.gn:g.red}/>}</div><div style={{fontSize:22,fontWeight:700,color:g.t1,lineHeight:1,marginBottom:6}}><Counter end={k.v} suffix={k.s||""}/></div><AreaChart data={k.sp} color={k.up?g.gn:g.red}/><div style={{marginTop:4,fontSize:9,fontWeight:600,color:k.up?g.gn:g.red}}>{k.up?"↑":"↓"} {k.tr}</div></div>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={G()}><SL>Cenário Eleitoral</SL><HBar label="Nosso candidato" value={34.7} max={50} color={g.red}/><HBar label="Adversário A" value={28.3} max={50} color={g.cyan} delay={80}/><HBar label="Adversário B" value={18.1} max={50} color="#8B7355" delay={160}/><HBar label="Indecisos" value={12.4} max={50} color={g.t4} delay={240}/></div><div style={G()}><SL>Sentimento</SL><div style={{display:"flex",alignItems:"center",gap:14}}><Donut segments={[{value:52,color:g.gn},{value:30,color:g.am},{value:18,color:g.red}]}/><div style={{flex:1}}>{[{l:"Positivo",v:"52%",c:g.gn,d:"+4%"},{l:"Neutro",v:"30%",c:g.am,d:"-1%"},{l:"Negativo",v:"18%",c:g.red,d:"-3%"}].map((x,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,padding:"5px 7px",borderRadius:6,background:`${x.c}08`}}><div style={{width:6,height:6,borderRadius:"50%",background:x.c,boxShadow:`0 0 6px ${x.c}50`}}/><span style={{color:g.t2,fontSize:10}}>{x.l}</span><span style={{marginLeft:"auto",color:g.t1,fontWeight:700,fontSize:12}}>{x.v}</span><span style={{fontSize:8,color:x.d[0]==="+"?g.gn:g.red}}>{x.d}</span></div>)}</div></div></div></div></div>;}
/* ══════════ CENTRAL DE DEMANDAS ══════════ */
function CentralDemandas(){const{demandas:dReal,loading:dLoad}=useDemandas();const[tab,setTab]=useState("novas");const[showForm,setShowForm]=useState(false);const[selDest,setSelDest]=useState([]);
const tabs=[{id:"novas",label:"Novas",ic:"📥",count:5},{id:"andamento",label:"Em Andamento",ic:"⚙️",count:8},{id:"concluidas",label:"Concluídas",ic:"✅",count:23},{id:"todas",label:"Todas",ic:"📋",count:36}];
const destinos=[{id:"prod",label:"Produção IA",ic:"✎",cor:"#E1306C"},{id:"comm",label:"Comunicação",ic:"✉",cor:g.cyan},{id:"estr",label:"Estratégica",ic:"◈",cor:g.am},{id:"mon",label:"Monitoramento",ic:"◎",cor:g.gn},{id:"social",label:"Publicação Social",ic:"◎",cor:"#1DA1F2"},{id:"vol",label:"Voluntários",ic:"♟",cor:"#9B59B6"},{id:"agenda",label:"Agenda",ic:"☰",cor:g.red},{id:"ia",label:"Assistente IA",ic:"⬡",cor:g.cyan}];
const demandas=dReal.length>0?dReal:[
{id:1,titulo:"Vídeo sobre proposta de saúde para TikTok",atribuido:"LC",cliente:"Fernando Carreiro",data:"Hoje 14:32",prioridade:"URGENTE",status:"Nova",destino:["Produção IA","Publicação Social"],descricao:"Preciso de um vídeo curto (30s) sobre nossas 3 propostas de saúde. Tom empático, dados concretos. Para TikTok e Reels.",cor:g.red},
{id:2,titulo:"Resposta ao ataque sobre educação",atribuido:"RP",cliente:"Fernando Carreiro",data:"Hoje 11:20",prioridade:"URGENTE",status:"Em andamento",destino:["Estratégica","Produção IA","Comunicação"],descricao:"Adversário publicou vídeo distorcendo nossa proposta de educação. Precisamos de resposta rápida com dados reais.",cor:g.red},
{id:3,titulo:"Material para comício de sábado",atribuido:"LC",cliente:"Coord. Zona Sul",data:"Hoje 09:15",prioridade:"ALTA",status:"Nova",destino:["Produção IA"],descricao:"Flyers, adesivos e banner para comício na Praça da Sé. Tema: saúde + transporte. 2.000 unidades.",cor:g.am},
{id:4,titulo:"Jingle regional para rádio interior",atribuido:"LC",cliente:"Fernando Carreiro",data:"Ontem 18:40",prioridade:"ALTA",status:"Em andamento",destino:["Produção IA"],descricao:"Jingle 30s para rádios do interior. Estilo forró/sertanejo. Mensagem: cidade que funciona.",cor:g.am},
{id:5,titulo:"Campanha WhatsApp para indecisos zona leste",atribuido:"AM",cliente:"Coord. Marketing",data:"Ontem 15:00",prioridade:"ALTA",status:"Nova",destino:["Comunicação","CRM Eleitores"],descricao:"Disparo segmentado para 4.200 indecisos da zona leste. Tema: transporte. Incluir link para proposta.",cor:g.am},
{id:6,titulo:"Preparação para debate TV — quarta",atribuido:"RP",cliente:"Fernando Carreiro",data:"Ontem 10:30",prioridade:"URGENTE",status:"Em andamento",destino:["Estratégica","Assistente IA"],descricao:"Debate na Band quarta 21h. Preciso de briefing completo: temas, respostas, ataques esperados, tom.",cor:g.red},
{id:7,titulo:"Posts Instagram da semana",atribuido:"LC",cliente:"Coord. Marketing",data:"2 dias atrás",prioridade:"MÉDIA",status:"Em andamento",destino:["Produção IA","Publicação Social"],descricao:"7 posts para Instagram: 3 carrosseis + 2 reels + 2 stories. Temas variados conforme calendário editorial.",cor:g.cyan},
{id:8,titulo:"Relatório semanal para financiadores",atribuido:"JM",cliente:"Fernando Carreiro",data:"2 dias atrás",prioridade:"MÉDIA",status:"Em andamento",destino:["Estratégica"],descricao:"Relatório executivo da semana para enviar aos financiadores. Incluir pesquisas, arrecadação e próximos passos.",cor:g.cyan},
{id:9,titulo:"Pesquisa de opinião bairro Penha",atribuido:"AM",cliente:"Coord. Zona Leste",data:"3 dias atrás",prioridade:"MÉDIA",status:"Nova",destino:["Comunicação","CRM Eleitores"],descricao:"Pesquisa rápida com 5 perguntas sobre temas prioritários no bairro da Penha. Enviar por WhatsApp.",cor:g.cyan},
{id:10,titulo:"Locução para carro de som",atribuido:"LC",cliente:"Coord. Campo",data:"3 dias atrás",prioridade:"BAIXA",status:"Nova",destino:["Produção IA"],descricao:"Locução 45s para carro de som. Tom animado. Mensagem: convite para comício + propostas principais.",cor:g.t3},
{id:11,titulo:"Fotos candidato para material gráfico",atribuido:"LC",cliente:"Fernando Carreiro",data:"4 dias atrás",prioridade:"MÉDIA",status:"Concluída",destino:["Produção IA"],descricao:"5 fotos profissionais: UBS, escola, metrô, praça, escritório. Geradas pela IA.",cor:g.gn},
{id:12,titulo:"Thread X sobre transporte",atribuido:"LC",cliente:"Coord. Marketing",data:"5 dias atrás",prioridade:"MÉDIA",status:"Concluída",destino:["Produção IA","Publicação Social"],descricao:"Thread com 8 tweets sobre proposta de transporte com dados e infográficos.",cor:g.gn},
];
const filtered=tab==="novas"?demandas.filter(d=>d.status==="Nova"):tab==="andamento"?demandas.filter(d=>d.status==="Em andamento"):tab==="concluidas"?demandas.filter(d=>d.status==="Concluída"):demandas;
const toggleDest=(id)=>setSelDest(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Central de Demandas</h2><Badge color={g.red}>Hub de Operações</Badge><div style={{marginLeft:"auto",display:"flex",gap:6}}><button onClick={()=>setShowForm(!showForm)} style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 12px ${g.rg}`}}>+ Nova Demanda</button><ExportBtn/></div></div>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>{[{l:"Novas",v:"5",d:"aguardando",c:g.red},{l:"Em andamento",v:"8",d:"nas centrais",c:g.cyan},{l:"Concluídas",v:"23",d:"este mês",c:g.gn},{l:"Tempo médio",v:"4.2h",d:"resolução",c:g.cyan},{l:"SLA",v:"94%",d:"no prazo",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 8px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

{/* Form Nova Demanda */}
{showForm&&<div style={{...G({background:`${g.red}06`,border:`1px solid ${g.red}18`,marginBottom:14,padding:"16px"}),animation:"fadeUp .3s ease"}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:16}}>📥</span><div><div style={{fontSize:13,fontWeight:700,color:g.t1}}>Nova Demanda do Cliente</div><div style={{fontSize:9,color:g.t3}}>Registre a solicitação e distribua para as centrais</div></div><button onClick={()=>setShowForm(false)} style={{marginLeft:"auto",padding:"4px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.10)",background:"rgba(255,255,255,0.04)",color:g.t3,fontSize:10,cursor:"pointer"}}>× Fechar</button></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Título da Demanda</label><input placeholder="Ex: Vídeo sobre saúde para TikTok..." style={{...g.input,width:"100%",padding:"9px 12px",fontSize:11,boxSizing:"border-box"}}/></div>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Atribuir a</label><select style={{...g.input,width:"100%",padding:"9px 12px",fontSize:11,boxSizing:"border-box",marginBottom:8}}>{TEAM.map(m=><option key={m.id}>{m.name} — {PERFIS[m.perfil].label}</option>)}</select><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Solicitante</label><select style={{...g.input,width:"100%",padding:"9px 12px",fontSize:11,boxSizing:"border-box"}}><option>Fernando Carreiro</option><option>Coord. Marketing</option><option>Coord. Zona Sul</option><option>Coord. Zona Leste</option><option>Coord. Campo</option></select></div>
</div>
<div style={{marginBottom:10}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Descrição detalhada</label><textarea rows={3} placeholder="Descreva o que o cliente precisa com o máximo de detalhe..." style={{...g.input,width:"100%",padding:"9px 12px",fontSize:11,boxSizing:"border-box",resize:"vertical"}}/></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Prioridade</label><div style={{display:"flex",gap:4}}>{[{l:"URGENTE",c:g.red},{l:"ALTA",c:g.am},{l:"MÉDIA",c:g.cyan},{l:"BAIXA",c:g.t3}].map(p=><button key={p.l} style={{flex:1,padding:"6px",borderRadius:6,border:`1px solid ${p.c}30`,background:`${p.c}08`,color:p.c,fontSize:9,fontWeight:600,cursor:"pointer"}}>{p.l}</button>)}</div></div>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Prazo</label><input type="datetime-local" style={{...g.input,width:"100%",padding:"8px 10px",fontSize:10,boxSizing:"border-box"}}/></div>
</div>
<div style={{marginBottom:10}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:6}}>Atribuir para</label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{TEAM.map(m=><button key={m.id} style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:g.t2,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}><div style={{width:20,height:20,borderRadius:6,background:`${m.cor}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:m.cor}}>{m.initials}</div>{m.name.split(" ").slice(0,2).join(" ")}</button>)}</div></div>
<div style={{marginBottom:12}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:6}}>Distribuir para quais centrais?</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{destinos.map(d=><button key={d.id} onClick={()=>toggleDest(d.id)} style={{padding:"8px 14px",borderRadius:10,border:selDest.includes(d.id)?`1px solid ${d.cor}50`:"1px solid rgba(255,255,255,0.08)",background:selDest.includes(d.id)?`${d.cor}15`:"rgba(255,255,255,0.03)",color:selDest.includes(d.id)?d.cor:g.t3,fontSize:10,fontWeight:selDest.includes(d.id)?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}><span>{d.ic}</span>{d.label}{selDest.includes(d.id)&&<span style={{marginLeft:2}}>✓</span>}</button>)}</div></div>
<div style={{display:"flex",gap:6}}><button style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${g.rg}`}}>📨 Registrar e Distribuir</button><button style={{padding:"11px 18px",background:g.cg,border:`1px solid ${g.cyan}30`,borderRadius:10,color:g.cyan,fontSize:11,fontWeight:600,cursor:"pointer"}}>⚡ IA Sugerir Destinos</button></div>
</div>}

{/* Tabs */}
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}<span style={{background:tab===t.id?`${g.cyan}20`:"rgba(255,255,255,0.06)",padding:"1px 6px",borderRadius:8,fontSize:8,color:tab===t.id?g.cyan:g.t4}}>{t.count}</span></button>)}</div>

{/* List */}
<div style={G()}>{filtered.length===0?<div style={{textAlign:"center",padding:20,color:g.t4,fontSize:11}}>Nenhuma demanda nesta categoria</div>:filtered.map((d,i)=><div key={d.id} style={{padding:"12px 0",borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
<div style={{width:6,height:6,borderRadius:"50%",background:d.cor,marginTop:6,flexShrink:0,boxShadow:d.prioridade==="URGENTE"?`0 0 8px ${d.cor}60`:"none",animation:d.prioridade==="URGENTE"?"pulse 2s infinite":"none"}}/>
<div style={{flex:1}}>
<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:g.t1}}>{d.titulo}</span><Badge color={d.cor}>{d.prioridade}</Badge>{d.status==="Nova"&&<Badge color={g.red}>Nova</Badge>}{d.status==="Em andamento"&&<Badge color={g.cyan}>Em andamento</Badge>}{d.status==="Concluída"&&<Badge color={g.gn}>Concluída</Badge>}</div>
<div style={{fontSize:10,color:g.t2,lineHeight:1.6,marginBottom:6}}>{d.descricao}</div>
<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
<span style={{fontSize:8,color:g.t4}}>👤 {d.cliente}</span>
<span style={{fontSize:8,color:g.t4}}>📅 {d.data}</span>
<div style={{display:"flex",gap:3}}>{d.destino.map((dest,j)=><span key={j} style={{padding:"2px 6px",borderRadius:5,background:"rgba(255,255,255,0.04)",fontSize:7,color:g.cyan,fontWeight:600}}>→ {dest}</span>)}</div>
{d.status!=="Concluída"&&<div style={{marginLeft:"auto",display:"flex",gap:3}}><button style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${g.gn}28`,background:`${g.gn}08`,color:g.gn,fontSize:8,fontWeight:600,cursor:"pointer"}}>{d.status==="Nova"?"Iniciar":"Concluir"}</button><button style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${g.cyan}28`,background:`${g.cyan}08`,color:g.cyan,fontSize:8,fontWeight:600,cursor:"pointer"}}>Redistribuir</button></div>}
</div></div></div></div>)}</div>
</div>;}

function Diag(){const{pesquisas:diagPesq,swot:diagSwot,cenarios:diagCen,loading:diagLoad}=useDiagnostico();const[tab,setTab]=useState("pesquisas");
const pesquisas=diagPesq.length>0?diagPesq:[{inst:"DataPoder360",data:"22/03/2026",margem:"±2.0pp",nosso:34.7,advA:28.3,advB:18.1,indecisos:18.9},{inst:"Ipec",data:"20/03/2026",margem:"±1.8pp",nosso:35.2,advA:27.8,advB:17.5,indecisos:19.5},{inst:"Quaest",data:"18/03/2026",margem:"±2.2pp",nosso:33.9,advA:29.1,advB:18.8,indecisos:18.2},{inst:"AtlasIntel",data:"15/03/2026",margem:"±1.5pp",nosso:32.4,advA:28.9,advB:19.2,indecisos:19.5}];
const evolucao=[30.1,30.8,31.2,31.9,32.4,33.1,33.9,34.2,34.7,35.0,34.8,35.2];
const evolAdv=[29.5,29.2,29.0,28.8,28.5,28.9,29.1,28.7,28.3,27.9,28.1,27.8];
const tabs=[{id:"pesquisas",label:"Pesquisas",ic:"📊"},{id:"swot",label:"SWOT",ic:"⚡"},{id:"cenario",label:"Cenário",ic:"🎯"},{id:"posicionamento",label:"Posicionamento",ic:"🧭"}];
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Central de Diagnóstico</h2><div style={{marginLeft:"auto"}}><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Intenção de voto",v:"34.7%",d:"▲ +1.5pp/mês",c:g.gn},{l:"Rejeição",v:"18.2%",d:"▼ -0.8pp/mês",c:g.gn},{l:"Espontânea",v:"21.3%",d:"▲ +2.1pp/mês",c:g.cyan},{l:"Score geral",v:"74",d:"Saudável",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="pesquisas"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
<div style={G()}><SL>Evolução Intenção de Voto (12 semanas)</SL><div style={{display:"flex",gap:10,marginBottom:6}}><span style={{fontSize:8,color:g.red}}>● Nosso candidato</span><span style={{fontSize:8,color:g.cyan}}>● Adversário A</span></div><AreaChart data={evolucao} color={g.red} h={60} w={280}/></div>
<div style={G()}><SL>Última Pesquisa — {pesquisas[0].inst}</SL><HBar label="Nosso candidato" value={pesquisas[0].nosso} max={50} color={g.red}/><HBar label="Adversário A" value={pesquisas[0].advA} max={50} color={g.cyan} delay={60}/><HBar label="Adversário B" value={pesquisas[0].advB} max={50} color={g.am} delay={120}/><HBar label="Indecisos" value={pesquisas[0].indecisos} max={50} color={g.t3} delay={180}/></div>
</div>
<div style={G()}><SL>Agregador de Pesquisas</SL><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",overflowX:"auto",minWidth:600,gap:4,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:6}}>{["Instituto","Data","Margem","Nosso","Adv A","Adv B","Indecisos"].map(h=><div key={h} style={{fontSize:8,color:g.t4,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</div>)}</div>{pesquisas.map((p,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr 1fr",overflowX:"auto",minWidth:600,gap:4,padding:"6px 0",borderBottom:i<pesquisas.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}><span style={{fontSize:10,color:g.t1,fontWeight:600}}>{p.inst}</span><span style={{fontSize:10,color:g.t3}}>{p.data}</span><span style={{fontSize:10,color:g.t4}}>{p.margem}</span><span style={{fontSize:10,color:g.red,fontWeight:700}}>{p.nosso}%</span><span style={{fontSize:10,color:g.cyan}}>{p.advA}%</span><span style={{fontSize:10,color:g.am}}>{p.advB}%</span><span style={{fontSize:10,color:g.t3}}>{p.indecisos}%</span></div>)}</div>
<div style={{...G({background:`${g.cyan}08`,marginTop:10}),display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:16}}>⚡</span><div><div style={{fontSize:11,fontWeight:600,color:g.t1}}>Insight — IA Fernando Carreiro</div><div style={{fontSize:10,color:g.t2,marginTop:2,lineHeight:1.6}}>Crescimento constante de 1.5pp/mês nas últimas 12 semanas. Projeção: 38% em 3 semanas. Rejeição caindo — sinal forte. Priorizar conversão de indecisos na Zona Leste (maior concentração: 42%).</div></div></div>
</div>}

{tab==="swot"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{t:"Forças",items:[{i:"Aprovação alta em saúde (68%)",w:90},{i:"Presença digital forte (+210k TikTok)",w:85},{i:"Discurso claro e propositivo",w:80},{i:"Equipe de campanha experiente",w:75},{i:"Endorsement de lideranças-chave",w:70}],c:g.gn},{t:"Fraquezas",items:[{i:"Rejeição no interior (24%)",w:70},{i:"Capilaridade baixa zona leste",w:65},{i:"Pouco tempo de TV",w:60},{i:"Orçamento menor que adversário A",w:55},{i:"Baixo reconhecimento em jovens 18-22",w:50}],c:g.red},{t:"Oportunidades",items:[{i:"Pauta transporte em alta (+180%)",w:85},{i:"Adversário A cometeu gafe em debate",w:80},{i:"Voto jovem disponível (42% indecisos)",w:75},{i:"Aliança com partido X possível",w:70},{i:"Copa do Mundo gerando pauta positiva",w:60}],c:g.cyan},{t:"Ameaças",items:[{i:"Campanha de fake news crescendo",w:90},{i:"Possível aliança adversários A+B",w:80},{i:"Crise econômica afeta humor eleitoral",w:75},{i:"Operação policial pode mudar cenário",w:65},{i:"Abstenção alta na periferia",w:60}],c:g.am}].map((q,i)=><div key={i} style={{...G({background:`${q.c}06`,border:`1px solid ${q.c}18`})}}><div style={{fontSize:12,fontWeight:700,color:q.c,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>{q.t}</div>{q.items.map((it,j)=><div key={j} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:g.t2}}>{it.i}</span><span style={{fontSize:9,color:q.c,fontWeight:600}}>{it.w}%</span></div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${it.w}%`,height:"100%",borderRadius:2,background:q.c,opacity:0.6}}/></div></div>)}</div>)}</div></div>}

{tab==="cenario"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
<div style={G()}><SL>Cenário 1 — Se Eleição Fosse Hoje</SL><div style={{textAlign:"center",marginBottom:10}}><Donut segments={[{value:34.7,color:g.red},{value:28.3,color:g.cyan},{value:18.1,color:g.am},{value:18.9,color:g.t4}]} size={120}/></div>{[{l:"Nosso candidato",v:"34.7%",c:g.red},{l:"Adversário A",v:"28.3%",c:g.cyan},{l:"Adversário B",v:"18.1%",c:g.am},{l:"Indecisos/Outros",v:"18.9%",c:g.t4}].map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:10,color:s.c}}>● {s.l}</span><span style={{fontSize:10,fontWeight:700,color:s.c}}>{s.v}</span></div>)}</div>
<div style={G()}><SL>Cenário 2 — 2º Turno Simulado</SL><div style={{textAlign:"center",marginBottom:10}}><Donut segments={[{value:52.3,color:g.red},{value:38.1,color:g.cyan},{value:9.6,color:g.t4}]} size={120}/></div>{[{l:"Nosso candidato",v:"52.3%",c:g.red},{l:"Adversário A",v:"38.1%",c:g.cyan},{l:"Brancos/Nulos",v:"9.6%",c:g.t4}].map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:10,color:s.c}}>● {s.l}</span><span style={{fontSize:10,fontWeight:700,color:s.c}}>{s.v}</span></div>)}</div>
</div>
<div style={G()}><SL>Projeção IA — Próximas 8 Semanas</SL><AreaChart data={[34.7,35.2,35.8,36.3,36.9,37.4,37.8,38.2]} color={g.red} h={60} w={560}/><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:7,color:g.t4}}>Hoje</span><span style={{fontSize:7,color:g.t4}}>+2 sem</span><span style={{fontSize:7,color:g.t4}}>+4 sem</span><span style={{fontSize:7,color:g.t4}}>+6 sem</span><span style={{fontSize:7,color:g.gn,fontWeight:700}}>Eleição: 38.2%</span></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:10}}>{[{titulo:"Cenário Otimista",prob:"30%",voto:"41.5%",cond:"Se converter 60% indecisos zona leste",c:g.gn},{titulo:"Cenário Base",prob:"50%",voto:"38.2%",cond:"Manutenção do crescimento atual",c:g.cyan},{titulo:"Cenário Pessimista",prob:"20%",voto:"33.8%",cond:"Se aliança adversários A+B se concretizar",c:g.red}].map((c,i)=><div key={i} style={{...G({background:`${c.c}06`,border:`1px solid ${c.c}18`})}}><div style={{fontSize:11,fontWeight:700,color:c.c,marginBottom:4}}>{c.titulo}</div><div style={{fontSize:20,fontWeight:800,color:g.t1}}>{c.voto}</div><div style={{fontSize:8,color:g.t4,marginTop:2}}>Probabilidade: {c.prob}</div><div style={{fontSize:9,color:g.t2,marginTop:6,lineHeight:1.5}}>{c.cond}</div></div>)}</div>
</div>}

{tab==="posicionamento"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={G()}><SL>Mapa de Posicionamento por Tema</SL><div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>{[{tema:"Saúde",nosso:85,advA:42,advB:35},{tema:"Transporte",nosso:62,advA:55,advB:48},{tema:"Educação",nosso:70,advA:58,advB:65},{tema:"Segurança",nosso:45,advA:72,advB:40},{tema:"Economia",nosso:58,advA:65,advB:52},{tema:"Meio Ambiente",nosso:72,advA:30,advB:55}].map((t,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"100px 1fr 1fr 1fr",overflowX:"auto",minWidth:600,gap:8,alignItems:"center",padding:"6px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:g.t1,fontWeight:600}}>{t.tema}</span><div><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:8,color:g.red}}>Nosso</span><span style={{fontSize:8,color:g.red,fontWeight:700}}>{t.nosso}%</span></div><div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${t.nosso}%`,height:"100%",borderRadius:3,background:g.red}}/></div></div><div><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:8,color:g.cyan}}>Adv A</span><span style={{fontSize:8,color:g.cyan}}>{t.advA}%</span></div><div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${t.advA}%`,height:"100%",borderRadius:3,background:g.cyan}}/></div></div><div><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:8,color:g.am}}>Adv B</span><span style={{fontSize:8,color:g.am}}>{t.advB}%</span></div><div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${t.advB}%`,height:"100%",borderRadius:3,background:g.am}}/></div></div></div>)}</div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
<div style={G()}><SL>Temas Onde Lideramos</SL>{[{t:"Saúde",v:"+43pp vs Adv A",c:g.gn},{t:"Meio Ambiente",v:"+42pp vs Adv A",c:g.gn},{t:"Educação",v:"+12pp vs Adv A",c:g.cyan},{t:"Transporte",v:"+7pp vs Adv A",c:g.cyan}].map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:g.t1}}>{t.t}</span><Badge color={t.c}>{t.v}</Badge></div>)}</div>
<div style={G()}><SL>Temas Onde Precisamos Melhorar</SL>{[{t:"Segurança",v:"-27pp vs Adv A",c:g.red},{t:"Economia",v:"-7pp vs Adv A",c:g.am}].map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<1?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:g.t1}}>{t.t}</span><Badge color={t.c}>{t.v}</Badge></div>)}<div style={{marginTop:10,...GS({background:`${g.cyan}06`})}}><div style={{fontSize:9,color:g.cyan,fontWeight:600,marginBottom:2}}>Recomendação IA</div><div style={{fontSize:9,color:g.t2,lineHeight:1.6}}>Focar em segurança com abordagem propositiva (não reativa). Dados: 68% dos eleitores querem propostas concretas, não ataques. Sugestão: vídeo com dados de redução de criminalidade em cidades modelo.</div></div></div>
</div></div>}
</div>;}
function Mon(){const{redes:monRedes,crises:monCrises,adversarios:monAdv,loading:monLoad}=useMonitoramento();const[tab,setTab]=useState("redes");const tabs=[{id:"redes",label:"Redes Sociais",ic:"📱"},{id:"imprensa",label:"Imprensa",ic:"📰"},{id:"adversarios",label:"Adversários",ic:"⚔️"},{id:"territorio",label:"Território & Crises",ic:"🗺️"}];
const redesData={plataformas:[{nome:"Instagram",seguidores:"142k",crescimento:"+2.3%",engajamento:"4.8%",posts:847,cor:"#E1306C"},{nome:"X / Twitter",seguidores:"89k",crescimento:"+1.1%",engajamento:"3.2%",posts:1247,cor:"#1DA1F2"},{nome:"TikTok",seguidores:"210k",crescimento:"+5.7%",engajamento:"8.1%",posts:312,cor:"#000"},{nome:"Facebook",seguidores:"180k",crescimento:"+0.4%",engajamento:"1.9%",posts:156,cor:"#1877F2"},{nome:"YouTube",seguidores:"34k",crescimento:"+3.2%",engajamento:"6.4%",posts:28,cor:"#FF0000"}],virais:[{plat:"TikTok",desc:"Candidato no mercadão — 2.4M views",eng:"184k",tom:"Positivo"},{plat:"Instagram",desc:"Carrossel proposta saúde — 890k alcance",eng:"67k",tom:"Positivo"},{plat:"X",desc:"Thread sobre educação — 12k RTs",eng:"45k",tom:"Neutro"}],volumeHora:[120,98,85,110,145,190,280,420,510,680,590,847,920,780,650,540,480,520,610,750,830,720,610,500]};
const imprensaData={clipping:[{veiculo:"Folha de S.Paulo",titulo:"Candidato lidera pesquisa na capital",tom:"Positivo",data:"Hoje 14:32",alcance:"2.1M"},{veiculo:"G1",titulo:"Debate esquenta entre líderes",tom:"Neutro",data:"Hoje 11:15",alcance:"4.8M"},{veiculo:"UOL",titulo:"Proposta de transporte gera polêmica",tom:"Negativo",data:"Hoje 09:40",alcance:"1.5M"},{veiculo:"Estadão",titulo:"Aliança com partido surpreende",tom:"Positivo",data:"Ontem 18:20",alcance:"1.8M"},{veiculo:"Band",titulo:"Entrevista exclusiva ao vivo",tom:"Positivo",data:"Ontem 20:00",alcance:"3.2M"}],resumo:{total:47,positivas:28,neutras:12,negativas:7},radio:[{emissora:"CBN",mencoes:12,tom:"Neutro"},{emissora:"Band News",mencoes:8,tom:"Positivo"},{emissora:"Jovem Pan",mencoes:15,tom:"Negativo"}]};
const advData={candidatos:[{nome:"Adversário A",partido:"PXX",intencao:28,variacao:-1.2,sentimento:45,cor:g.am},{nome:"Adversário B",partido:"PYY",intencao:18,variacao:+0.5,sentimento:52,cor:"#9B59B6"},{nome:"Nosso Candidato",partido:"PZZ",intencao:34,variacao:+2.3,sentimento:72,cor:g.cyan}],movimentos:[{adv:"Adversário A",acao:"Mudou discurso para segurança pública",tempo:"2h atrás",risco:"ALTO"},{adv:"Adversário B",acao:"Anunciou aliança com partido X",tempo:"5h atrás",risco:"MÉDIO"},{adv:"Adversário A",acao:"Investiu R$ 200k em ads no Instagram",tempo:"1 dia",risco:"ALTO"}]};
const criseData={ativas:[{tipo:"Ataque Coordenado",desc:"847 posts negativos sobre saúde em 2h — possíveis bots detectados",nivel:"CRÍTICO",cor:g.red,hora:"14:32"},{tipo:"Fake News",desc:"Vídeo editado distorcendo fala sobre impostos",nivel:"ALTO",cor:g.am,hora:"11:20"}],regioes:[{nome:"SP Capital",mencoes:4200,sentimento:68,cor:g.cyan},{nome:"Interior SP",mencoes:1800,sentimento:72,cor:g.gn},{nome:"Grande SP",mencoes:2400,sentimento:55,cor:g.am},{nome:"Litoral",mencoes:890,sentimento:78,cor:g.gn},{nome:"Vale do Paraíba",mencoes:560,sentimento:42,cor:g.red}],acoesSugeridas:[{acao:"Publicar vídeo-resposta sobre saúde com dados concretos",prioridade:"URGENTE",prazo:"2h"},{acao:"Acionar equipe jurídica sobre vídeo fake",prioridade:"ALTA",prazo:"4h"},{acao:"Intensificar campanha positiva no Interior SP",prioridade:"MÉDIA",prazo:"24h"}]};

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Central de Monitoramento</h2><div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:g.gn,boxShadow:`0 0 8px ${g.gn}60`,animation:"pulse 2s infinite"}}/><span style={{fontSize:10,color:g.gn,fontWeight:600}}>AO VIVO</span><ExportBtn/></div></div>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Menções/hora",v:"1.247",d:"+18%",c:g.gn},{l:"Sentimento geral",v:"72%",d:"positivo",c:g.gn},{l:"Alertas ativos",v:"5",d:"2 críticos",c:g.red},{l:"Alcance 24h",v:"4.8M",d:"+32%",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

{/* Tabs */}
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{/* Tab: Redes Sociais */}
{tab==="redes"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>{redesData.plataformas.map((p,i)=><div key={i} style={{...G({padding:"12px 8px"}),textAlign:"center"}}><div style={{fontSize:12,marginBottom:4}}>{["📸","𝕏","🎵","📘","▶️"][i]}</div><div style={{fontSize:9,fontWeight:600,color:g.t1,marginBottom:2}}>{p.nome}</div><div style={{fontSize:16,fontWeight:700,color:g.t1}}>{p.seguidores}</div><div style={{fontSize:8,color:p.crescimento.includes("+")?g.gn:g.red}}>{p.crescimento}</div><div style={{fontSize:7,color:g.t4,marginTop:3}}>Eng: {p.engajamento}</div></div>)}</div>
<div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Volume de Menções (24h)</SL><AreaChart data={redesData.volumeHora} color={g.cyan} h={60} w={280}/><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:7,color:g.t4}}>00h</span><span style={{fontSize:7,color:g.t4}}>06h</span><span style={{fontSize:7,color:g.t4}}>12h</span><span style={{fontSize:7,color:g.red,fontWeight:700}}>agora</span></div></div>
<div style={G()}><SL>Posts Virais</SL>{redesData.virais.map((v,i)=><div key={i} style={{display:"flex",gap:8,padding:"7px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><Badge color={v.tom==="Positivo"?g.gn:v.tom==="Negativo"?g.red:g.am}>{v.plat}</Badge><div style={{flex:1}}><div style={{fontSize:10,color:g.t2}}>{v.desc}</div><div style={{fontSize:8,color:g.t4,marginTop:1}}>{v.eng} interações · {v.tom}</div></div></div>)}</div>
</div>
<div style={{...G(),marginTop:10}}><SL>Temas em Ascensão</SL><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{["#SaúdeParaTodos 4.2k","#TransportePúblico 3.1k","#DebateHoje 2.8k","#EducaçãoJá 1.9k","#EmpregoJovem 1.4k","#MoradiaDigna 980"].map((t,i)=><span key={i} style={{padding:"4px 10px",borderRadius:12,...GS({background:i<2?g.rg:"rgba(255,255,255,0.03)"}),fontSize:10,color:i<2?g.t1:g.t3}}>{t}</span>)}</div></div>
</div>}

{/* Tab: Imprensa */}
{tab==="imprensa"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:10,marginBottom:12}}>
<div style={G()}><SL>Clipping de Imprensa</SL>{imprensaData.clipping.map((c,i)=><div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<imprensaData.clipping.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"flex-start"}}><Badge color={c.tom==="Positivo"?g.gn:c.tom==="Negativo"?g.red:g.am}>{c.tom}</Badge><div style={{flex:1}}><div style={{fontSize:11,color:g.t1,fontWeight:600}}>{c.titulo}</div><div style={{fontSize:8,color:g.t4,marginTop:2}}>{c.veiculo} · {c.data} · Alcance: {c.alcance}</div></div></div>)}</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={G()}><SL>Resumo</SL><div style={{display:"flex",flexDirection:"column",gap:6}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:g.t2}}>Total</span><span style={{fontSize:14,fontWeight:700,color:g.t1}}>{imprensaData.resumo.total}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:g.gn}}>Positivas</span><span style={{fontSize:12,fontWeight:700,color:g.gn}}>{imprensaData.resumo.positivas}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:g.am}}>Neutras</span><span style={{fontSize:12,fontWeight:700,color:g.am}}>{imprensaData.resumo.neutras}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:g.red}}>Negativas</span><span style={{fontSize:12,fontWeight:700,color:g.red}}>{imprensaData.resumo.negativas}</span></div></div></div>
<div style={G()}><SL>Rádio & TV</SL>{imprensaData.radio.map((r,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:g.t2}}>{r.emissora}</span><span style={{fontSize:9,color:g.t4}}>{r.mencoes} menções</span><Badge color={r.tom==="Positivo"?g.gn:r.tom==="Negativo"?g.red:g.am}>{r.tom}</Badge></div>)}</div>
</div></div>
</div>}

{/* Tab: Adversários */}
{tab==="adversarios"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:10,marginBottom:12}}>{advData.candidatos.map((c,i)=><div key={i} style={{...G({border:c.nome.includes("Nosso")?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.12)"}),textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c.cor,marginBottom:2}}>{c.nome}</div><div style={{fontSize:8,color:g.t4,marginBottom:8}}>{c.partido}</div><div style={{fontSize:28,fontWeight:800,color:g.t1}}>{c.intencao}%</div><div style={{fontSize:9,color:c.variacao>0?g.gn:g.red,marginTop:2}}>{c.variacao>0?"+":""}{c.variacao}%</div><div style={{marginTop:8}}><div style={{fontSize:7,color:g.t4,marginBottom:3}}>Sentimento positivo</div><div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${c.sentimento}%`,height:"100%",borderRadius:3,background:c.cor,transition:"width 1.5s ease"}}/></div><div style={{fontSize:8,color:c.cor,marginTop:2}}>{c.sentimento}%</div></div></div>)}</div>
<div style={G()}><SL>Movimentações Recentes</SL>{advData.movimentos.map((m,i)=><div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<advData.movimentos.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><Badge color={m.risco==="ALTO"?g.red:g.am}>{m.risco}</Badge><div style={{flex:1}}><div style={{fontSize:10,color:g.t2}}><strong style={{color:g.t1}}>{m.adv}:</strong> {m.acao}</div><div style={{fontSize:8,color:g.t4,marginTop:1}}>{m.tempo}</div></div></div>)}</div>
</div>}

{/* Tab: Território & Crises */}
{tab==="territorio"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
<div style={G()}><SL>Crises Ativas</SL>{criseData.ativas.map((c,i)=><div key={i} style={{padding:"10px 12px",borderRadius:10,background:`${c.cor}10`,border:`1px solid ${c.cor}20`,marginBottom:i<criseData.ativas.length-1?8:0}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:6,height:6,borderRadius:"50%",background:c.cor,boxShadow:`0 0 8px ${c.cor}60`,animation:"pulse 2s infinite"}}/><Badge color={c.cor}>{c.nivel}</Badge><span style={{fontSize:8,color:g.t4,marginLeft:"auto"}}>{c.hora}</span></div><div style={{fontSize:11,fontWeight:600,color:g.t1,marginBottom:3}}>{c.tipo}</div><div style={{fontSize:9,color:g.t2,lineHeight:1.5}}>{c.desc}</div></div>)}</div>
<div style={G()}><SL>Menções por Região</SL>{criseData.regioes.map((r,i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:g.t2}}>{r.nome}</span><span style={{fontSize:9,color:g.t4}}>{r.mencoes.toLocaleString("pt-BR")} menções</span></div><div style={{display:"flex",gap:4,alignItems:"center"}}><div style={{flex:1,height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${(r.mencoes/4200)*100}%`,height:"100%",borderRadius:3,background:r.cor}}/></div><span style={{fontSize:8,color:r.cor,width:30,textAlign:"right"}}>{r.sentimento}%</span></div></div>)}</div>
</div>
<div style={G()}><SL>Ações Sugeridas pela IA</SL>{criseData.acoesSugeridas.map((a,i)=><div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<criseData.acoesSugeridas.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><Badge color={a.prioridade==="URGENTE"?g.red:a.prioridade==="ALTA"?g.am:g.cyan}>{a.prioridade}</Badge><div style={{flex:1,fontSize:10,color:g.t2}}>{a.acao}</div><span style={{fontSize:8,color:g.t4}}>⏱ {a.prazo}</span><button style={{padding:"4px 8px",borderRadius:5,border:`1px solid ${g.gn}28`,background:`${g.gn}08`,color:g.gn,fontSize:8,fontWeight:600,cursor:"pointer"}}>Executar</button></div>)}</div>
</div>}
</div>;}
function Prod(){const[at,setAt]=useState(null);const[gen,setGen]=useState(false);const[done,setDone]=useState(false);const[aiMsg,setAiMsg]=useState("");const[aiThinking,setAiThinking]=useState(false);const[aiResp,setAiResp]=useState("");
const tools=[{id:"foto",icon:"📸",label:"Criar Fotos",desc:"Fotos profissionais com IA",color:"#E1306C",fields:["Cena","Estilo"]},{id:"flyer",icon:"📄",label:"Criar Flyer",desc:"Materiais gráficos",color:g.am,fields:["Tema","Formato"]},{id:"jingle",icon:"🎵",label:"Criar Jingle",desc:"Músicas de campanha",color:g.gn,fields:["Mensagem","Estilo","Duração"]},{id:"eleitores",icon:"👥",label:"Fotos Eleitores",desc:"Eleitores com IA",color:"#9B59B6",fields:["Perfil","Cenário"]},{id:"locucao",icon:"🎙️",label:"Locução IA",desc:"Áudios e locuções",color:g.cyan,fields:["Texto","Tom"]},{id:"video",icon:"🎬",label:"Roteiro Vídeo",desc:"Vídeos e reels",color:g.red,fields:["Tema","Plataforma"]}];
const results={foto:"Candidato visitando UBS, tom acolhedor, iluminação natural.",flyer:"Flyer A4 com propostas de saúde, QR code e CTA.",jingle:"♪ Cidade que funciona, povo que confia ♪ — 30s, forró.",eleitores:"3 perfis gerados: jovem universitário, mãe trabalhadora, idoso aposentado.",locucao:"'São Paulo merece quem trabalha de verdade' — 15s, tom firme.",video:"Abertura impactante 3s → Problema 10s → Proposta 15s → CTA 5s."};
const doGen=()=>{setGen(true);setDone(false);setTimeout(()=>{setGen(false);setDone(true)},2500)};
const sendAi=()=>{if(!aiMsg.trim())return;setAiThinking(true);setAiResp("");setTimeout(()=>{setAiThinking(false);setAiResp("Com base na metodologia Fernando Carreiro e no monitoramento atual, recomendo produzir: 1) Vídeo curto (30s) sobre saúde pública para TikTok e Reels — tom empático, dados concretos. 2) Carrossel Instagram com 5 slides sobre propostas de transporte. 3) Jingle regional para rádio do interior. Posso gerar qualquer um desses agora.")},2000)};

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Central de Produção</h2><div style={{marginLeft:"auto"}}><ExportBtn/></div></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Peças geradas",v:"247",d:"este mês",c:g.cyan},{l:"Aprovadas",v:"198",d:"80.2% taxa",c:g.gn},{l:"Aguardando",v:"12",d:"revisão",c:g.am},{l:"Tempo médio",v:"3.2m",d:"por geração",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

{/* AI Quick Ask Box */}
<div style={{...G({background:`${g.cyan}06`,border:`1px solid ${g.cyan}18`,marginBottom:16,padding:"14px 16px"})}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{filter:"drop-shadow(0 2px 8px rgba(255,45,45,0.3))"}}><CICLogo size={22}/></div><div><div style={{fontSize:12,fontWeight:700,color:g.t1}}>Peça algo à IA</div><div style={{fontSize:8,color:g.cyan}}>Descreva o que precisa e a IA produz pra você</div></div></div>
<div style={{display:"flex",gap:6}}><input value={aiMsg} onChange={e=>setAiMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAi()} placeholder="Ex: Crie um vídeo curto sobre saúde para TikTok..." style={{...g.input,flex:1,padding:"10px 14px",fontSize:11}}/><button onClick={sendAi} style={{background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:11,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${g.rg}`,whiteSpace:"nowrap"}}>⚡ Gerar</button></div>
{aiThinking&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,animation:"fadeUp .3s ease"}}><div style={{filter:"drop-shadow(0 2px 6px rgba(255,45,45,0.2))"}}><CICLogo size={16}/></div>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:g.cyan,animation:`thinkDot 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}<span style={{fontSize:10,color:g.t3,marginLeft:4}}>Analisando e produzindo...</span></div>}
{aiResp&&<div style={{marginTop:10,padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",animation:"fadeUp .3s ease"}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:5}}><div style={{filter:"drop-shadow(0 2px 4px rgba(255,45,45,0.2))"}}><CICLogo size={14}/></div><span style={{fontSize:9,fontWeight:600,color:g.cyan}}>Assistente CIC</span></div><div style={{fontSize:10,color:g.t2,lineHeight:1.7}}>{aiResp}</div></div>}
</div>

<SL>Ferramentas IA</SL>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:10,marginBottom:14}}>{tools.map(t=><div key={t.id} onClick={()=>{setAt(t.id===at?null:t.id);setDone(false);setGen(false)}} style={{...G({padding:"16px 14px",cursor:"pointer",transition:"all .3s",position:"relative",overflow:"hidden",background:at===t.id?`${t.color}10`:"rgba(255,255,255,0.06)",border:`1px solid ${at===t.id?t.color+"30":"rgba(255,255,255,0.10)"}`})}}>{at===t.id&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:t.color,boxShadow:`0 0 8px ${t.color}40`}}/>}<div style={{textAlign:"center"}}><div style={{width:48,height:48,borderRadius:14,background:t.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 8px",border:`1px solid ${at===t.id?t.color+"30":"transparent"}`,transition:"all .3s"}}>{t.icon}</div><div style={{fontSize:11,fontWeight:600,color:at===t.id?g.t1:g.t2}}>{t.label}</div><div style={{fontSize:8,color:g.t4,marginTop:2}}>{t.desc}</div></div></div>)}</div>

{at&&(()=>{const tool=tools.find(x=>x.id===at);return<div style={{...G({background:`${tool.color}06`,border:`1px solid ${tool.color}18`,marginBottom:14}),animation:"fadeUp .3s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:36,height:36,borderRadius:10,background:tool.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{tool.icon}</div><div><div style={{fontSize:13,fontWeight:700,color:g.t1}}>{tool.label}</div><div style={{fontSize:9,color:tool.color}}>IA · Metodologia Fernando Carreiro</div></div></div>{tool.fields.map((f,i)=><div key={i} style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>{f}</label><input placeholder={`Descreva ${f.toLowerCase()}...`} style={{...g.input,width:"100%",padding:"9px 12px",fontSize:11,boxSizing:"border-box"}}/></div>)}<button onClick={doGen} style={{width:"100%",padding:"11px",marginTop:4,background:gen?"rgba(255,255,255,0.05)":`linear-gradient(135deg,${tool.color},${tool.color}CC)`,color:"#fff",border:"none",borderRadius:10,fontSize:12,fontWeight:600,cursor:gen?"wait":"pointer",boxShadow:gen?"none":`0 4px 14px ${tool.color}25`}}>{gen?<span style={{display:"inline-flex",alignItems:"center",gap:6}}><span style={{display:"inline-block",width:12,height:12,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Gerando...</span>:done?"✓ Gerar novamente":"⚡ Gerar com IA"}</button>{done&&<div style={{marginTop:12,animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{display:"flex",gap:5}}><PhoneMockup type="feed" content={results[tool.id]}/><PhoneMockup type="story" content={results[tool.id]}/></div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}><div style={{width:6,height:6,borderRadius:"50%",background:g.gn,boxShadow:`0 0 5px ${g.gn}60`}}/><span style={{fontSize:11,fontWeight:600,color:g.gn}}>Gerado com sucesso</span></div><div style={{fontSize:11,color:g.t2,lineHeight:1.7,marginBottom:10}}>{results[tool.id]}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{[{l:"✓ Aprovar",c:g.gn},{l:"✎ Editar",c:g.cyan},{l:"↻ Refazer",c:g.am},{l:"⬇ Baixar",c:g.t3}].map((b,i)=><button key={i} style={{padding:"5px 10px",borderRadius:6,border:`1px solid ${b.c}28`,background:`${b.c}08`,color:b.c,fontSize:9,fontWeight:600,cursor:"pointer"}}>{b.l}</button>)}</div></div></div></div>}</div>})()}</div>;}

function ExportBtn({label="Exportar Relatório"}){
  const[exporting,setExporting]=useState(false);
  const[done,setDone]=useState(false);
  const handleExport=()=>{setExporting(true);setTimeout(()=>{setExporting(false);setDone(true);setTimeout(()=>setDone(false),3000)},2000)};
  return<button onClick={handleExport} disabled={exporting} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${done?g.gn+"30":"rgba(255,255,255,0.10)"}`,background:done?`${g.gn}10`:"rgba(255,255,255,0.03)",color:done?g.gn:g.t2,fontSize:9,fontWeight:600,cursor:exporting?"wait":"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
    {exporting?<><span style={{display:"inline-block",width:10,height:10,border:"2px solid rgba(255,255,255,0.2)",borderTopColor:g.cyan,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>Gerando...</>:done?"✓ Relatório pronto — Baixar":<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>{label}</>}
  </button>;
}

/* ══════════ MAPA ELEITORAL ══════════ */
function MapaEleitoral(){const[tab,setTab]=useState("visao");const[nivel,setNivel]=useState("zonas");
const tabs=[{id:"visao",label:"Visão Geral",ic:"🗺️"},{id:"zonas",label:"Zonas Eleitorais",ic:"📍"},{id:"demografico",label:"Demográfico",ic:"👥"},{id:"prioridades",label:"Prioridades IA",ic:"⚡"}];
const regioes=[{nome:"Zona Sul",eleitores:"3.1M",nosso:41.5,advA:24.2,indecisos:22.8,cor:g.gn,destaque:true},{nome:"Zona Norte",eleitores:"2.8M",nosso:32.1,advA:29.8,indecisos:26.4,cor:g.am},{nome:"Zona Leste",eleitores:"4.2M",nosso:28.7,advA:31.2,indecisos:28.6,cor:g.red},{nome:"Zona Oeste",eleitores:"2.5M",nosso:35.9,advA:26.1,indecisos:24.5,cor:g.cyan},{nome:"Centro",eleitores:"1.2M",nosso:42.1,advA:22.8,indecisos:20.3,cor:g.gn},{nome:"Região Metropolitana",eleitores:"8.1M",nosso:26.3,advA:28.9,indecisos:32.1,cor:g.red}];
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Mapa Eleitoral</h2><div style={{marginLeft:"auto"}}><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Eleitorado total",v:"21.9M",d:"seções: 48.200",c:g.cyan},{l:"Lideramos em",v:"4/6",d:"regiões",c:g.gn},{l:"Maior potencial",v:"Zona Leste",d:"4.2M · 28.6% indecisos",c:g.am},{l:"Prioridade IA",v:"RM + Z.Leste",d:"12.3M eleitores",c:g.red}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="visao"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Mapa de Apoio por Região</SL><svg viewBox="0 0 300 200" style={{width:"100%",height:200}}>
{regioes.map((r,i)=>{const pos=[{x:150,y:160},{x:150,y:50},{x:230,y:100},{x:70,y:100},{x:150,y:105},{x:240,y:160}][i];const sz=[35,30,40,28,18,38][i];return<g key={i}><circle cx={pos.x} cy={pos.y} r={sz} fill={r.cor} opacity={0.15} stroke={r.cor} strokeWidth={1.5} strokeOpacity={0.4}/><circle cx={pos.x} cy={pos.y} r={sz*r.nosso/100} fill={r.cor} opacity={0.4}/><text x={pos.x} y={pos.y-4} textAnchor="middle" fill={g.t1} fontSize="8" fontWeight="700">{r.nosso}%</text><text x={pos.x} y={pos.y+7} textAnchor="middle" fill={g.t3} fontSize="6">{r.nome}</text></g>})}
</svg></div>
<div style={G()}><SL>Comparativo por Região</SL>{regioes.map((r,i)=><div key={i} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:g.t1,fontWeight:600}}>{r.nome}</span><span style={{fontSize:8,color:g.t4}}>{r.eleitores} eleitores</span></div><div style={{display:"flex",gap:2,height:6}}><div style={{width:`${r.nosso}%`,background:g.red,borderRadius:"3px 0 0 3px"}} title={`Nosso: ${r.nosso}%`}/><div style={{width:`${r.advA}%`,background:g.cyan}} title={`Adv A: ${r.advA}%`}/><div style={{width:`${r.indecisos}%`,background:g.t4,borderRadius:"0 3px 3px 0"}} title={`Indecisos: ${r.indecisos}%`}/></div><div style={{display:"flex",gap:8,marginTop:2}}><span style={{fontSize:7,color:g.red}}>Nosso: {r.nosso}%</span><span style={{fontSize:7,color:g.cyan}}>Adv A: {r.advA}%</span><span style={{fontSize:7,color:g.t4}}>Indecisos: {r.indecisos}%</span></div></div>)}</div>
</div></div>}

{tab==="zonas"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Zonas Eleitorais — Detalhamento</SL>{[{zona:"ZE 001 — Sé/República",secoes:42,eleitores:"89.400",nosso:44.2,tipo:"Forte"},{zona:"ZE 012 — Vila Mariana",secoes:38,eleitores:"76.800",nosso:41.8,tipo:"Forte"},{zona:"ZE 045 — Pinheiros",secoes:35,eleitores:"68.200",nosso:38.5,tipo:"Forte"},{zona:"ZE 078 — Santana",secoes:44,eleitores:"92.100",nosso:29.4,tipo:"Disputada"},{zona:"ZE 112 — Penha",secoes:51,eleitores:"108.300",nosso:25.7,tipo:"Fraca"},{zona:"ZE 156 — Itaquera",secoes:62,eleitores:"134.500",nosso:22.3,tipo:"Fraca"},{zona:"ZE 189 — Grajaú",secoes:55,eleitores:"118.700",nosso:23.5,tipo:"Fraca"},{zona:"ZE 201 — Osasco",secoes:48,eleitores:"98.600",nosso:24.1,tipo:"Fraca"}].map((z,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"2.5fr 0.8fr 1fr 1fr 0.8fr",overflowX:"auto",minWidth:600,gap:4,padding:"8px 0",borderBottom:i<7?"1px solid rgba(255,255,255,0.03)":"none",alignItems:"center"}}><span style={{fontSize:10,color:g.t1,fontWeight:600}}>{z.zona}</span><span style={{fontSize:9,color:g.t4}}>{z.secoes} seções</span><span style={{fontSize:9,color:g.t3}}>{z.eleitores}</span><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:40,height:5,borderRadius:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${z.nosso*2}%`,height:"100%",borderRadius:3,background:z.nosso>=35?g.gn:z.nosso>=28?g.am:g.red}}/></div><span style={{fontSize:9,fontWeight:700,color:z.nosso>=35?g.gn:z.nosso>=28?g.am:g.red}}>{z.nosso}%</span></div><Badge color={z.tipo==="Forte"?g.gn:z.tipo==="Disputada"?g.am:g.red}>{z.tipo}</Badge></div>)}</div></div>}

{tab==="demografico"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Apoio por Faixa Etária</SL>{[{fx:"18-25 anos",nosso:28,advA:22,ind:38,pop:"18%"},{fx:"26-35 anos",nosso:35,advA:26,ind:24,pop:"22%"},{fx:"36-50 anos",nosso:38,advA:28,ind:18,pop:"28%"},{fx:"51-65 anos",nosso:36,advA:32,ind:16,pop:"20%"},{fx:"65+ anos",nosso:32,advA:34,ind:14,pop:"12%"}].map((f,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:g.t1}}>{f.fx}</span><span style={{fontSize:8,color:g.t4}}>{f.pop} do eleitorado</span></div><div style={{display:"flex",gap:2,height:6}}><div style={{width:`${f.nosso}%`,background:g.red,borderRadius:"3px 0 0 3px"}}/><div style={{width:`${f.advA}%`,background:g.cyan}}/><div style={{width:`${f.ind}%`,background:g.t4,borderRadius:"0 3px 3px 0"}}/></div></div>)}</div>
<div style={G()}><SL>Apoio por Gênero</SL>{[{g2:"Mulheres",nosso:37,advA:25,ind:24,pop:"52%"},{g2:"Homens",nosso:32,advA:31,ind:22,pop:"48%"}].map((f,i)=><div key={i} style={{padding:"8px 0",borderBottom:i<1?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:g.t1}}>{f.g2}</span><span style={{fontSize:8,color:g.t4}}>{f.pop}</span></div><div style={{display:"flex",gap:2,height:6}}><div style={{width:`${f.nosso}%`,background:g.red,borderRadius:"3px 0 0 3px"}}/><div style={{width:`${f.advA}%`,background:g.cyan}}/><div style={{width:`${f.ind}%`,background:g.t4,borderRadius:"0 3px 3px 0"}}/></div></div>)}</div>
<div style={G()}><SL>Apoio por Renda</SL>{[{fx:"Até 2 SM",nosso:30,advA:28,ind:28},{fx:"2-5 SM",nosso:34,advA:27,ind:22},{fx:"5-10 SM",nosso:38,advA:26,ind:20},{fx:"Acima 10 SM",nosso:40,advA:24,ind:18}].map((f,i)=><HBar key={i} label={f.fx} value={f.nosso} max={50} color={f.nosso>=35?g.gn:g.am} delay={i*80}/>)}</div>
<div style={G()}><SL>Apoio por Escolaridade</SL>{[{fx:"Fundamental",nosso:28,c:g.am},{fx:"Médio",nosso:33,c:g.cyan},{fx:"Superior",nosso:39,c:g.gn},{fx:"Pós-graduação",nosso:42,c:g.gn}].map((f,i)=><HBar key={i} label={f.fx} value={f.nosso} max={50} color={f.c} delay={i*80}/>)}</div>
</div></div>}

{tab==="prioridades"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{...G({background:`${g.red}06`,border:`1px solid ${g.red}18`,marginBottom:12})}}>
<div style={{fontSize:11,fontWeight:700,color:g.red,marginBottom:6}}>🎯 Análise IA — Fernando Carreiro</div>
<div style={{fontSize:10,color:g.t2,lineHeight:1.7}}>Com base nos dados eleitorais, identifico 3 prioridades territoriais para as próximas 4 semanas:</div></div>
{[{regiao:"Zona Leste",eleitores:"4.2M",indecisos:"28.6%",potencial:"+4.8pp se converter 40% indecisos",acoes:["Canvassing intensivo Itaquera + Penha","Comício central sábado","Disparo WhatsApp segmentado","Material sobre transporte (tema #1 da região)"],investimento:"R$ 45k",roi:"Estimativa: +120k votos",cor:g.red},{regiao:"Região Metropolitana",eleitores:"8.1M",indecisos:"32.1%",potencial:"+3.2pp se converter 25% indecisos",acoes:["Campanha digital geolocalizada","Parcerias com lideranças locais","Material sobre emprego e economia","Phone banking 5k ligações/dia"],investimento:"R$ 60k",roi:"Estimativa: +180k votos",cor:g.am},{regiao:"Zona Norte — Santana",eleitores:"2.8M",indecisos:"26.4%",potencial:"+2.5pp se converter 30% indecisos",acoes:["Evento com Dr. Roberto (influenciador saúde)","Panfletagem metrô + feiras","Campanha jovens TikTok localizada"],investimento:"R$ 25k",roi:"Estimativa: +65k votos",cor:g.cyan}].map((p,i)=><div key={i} style={{...G({marginBottom:10})}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:16,fontWeight:800,color:p.cor}}>#{i+1}</span><div><div style={{fontSize:13,fontWeight:700,color:g.t1}}>{p.regiao}</div><div style={{fontSize:9,color:g.t4}}>{p.eleitores} eleitores · {p.indecisos} indecisos</div></div><Badge color={p.cor}>{p.potencial}</Badge></div>
<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{p.acoes.map((a,j)=><span key={j} style={{padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.04)",fontSize:9,color:g.t2}}>{a}</span>)}</div>
<div style={{display:"flex",gap:12}}><span style={{fontSize:9,color:g.am}}>💰 {p.investimento}</span><span style={{fontSize:9,color:g.gn}}>📈 {p.roi}</span></div>
</div>)}</div>}
</div>;}
function Estr(){const{decisoes:estrDec,narrativa:estrNar,timeline:estrTl,loading:estrLoad,decidir:estrDec_fn}=useEstrategia();const[tab,setTab]=useState("decisoes");
const tabs=[{id:"decisoes",label:"Decisões",ic:"⚡"},{id:"matriz",label:"Matriz",ic:"📋"},{id:"narrativa",label:"Narrativa",ic:"📝"},{id:"timeline",label:"Timeline",ic:"📅"}];
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Central Estratégica</h2><Badge color={g.red}>Curadoria Humana + IA</Badge><div style={{marginLeft:"auto"}}><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Decisões pendentes",v:"7",d:"3 urgentes",c:g.red},{l:"Eixos narrativos",v:"4",d:"ativos",c:g.cyan},{l:"Ações esta semana",v:"18",d:"12 concluídas",c:g.gn},{l:"Score estratégico",v:"82",d:"Forte",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="decisoes"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:10}}>
<div style={G()}><SL>Decisões Pendentes</SL>{[{t:"Aprovar resposta ao ataque sobre saúde",ctx:"847 posts negativos em 2h. IA recomenda vídeo com dados.",p:"URGENTE",c:g.red},{t:"Validar roteiro de debate para TV",ctx:"Debate em 3 dias. Temas: saúde, transporte, segurança.",p:"URGENTE",c:g.red},{t:"Aprovar aliança com Partido X",ctx:"Oferecem 2min de TV + estrutura zona leste. Pedem 1 vaga.",p:"URGENTE",c:g.red},{t:"Definir posicionamento sobre greve de ônibus",ctx:"Greve marcada para sexta. Eleitores divididos.",p:"ALTA",c:g.am},{t:"Aprovar campanha de arrecadação online",ctx:"Meta: R$ 200k em 7 dias. Landing page pronta.",p:"ALTA",c:g.am},{t:"Validar distribuição de material zona norte",ctx:"20k flyers + 5k adesivos. Custo: R$ 8.400.",p:"MÉDIA",c:g.cyan},{t:"Confirmar participação em podcast popular",ctx:"Podcast com 500k ouvintes. Tema aberto.",p:"MÉDIA",c:g.cyan}].map((d,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<6?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><Badge color={d.c}>{d.p}</Badge><span style={{fontSize:11,color:g.t1,fontWeight:600}}>{d.t}</span><div style={{marginLeft:"auto",display:"flex",gap:3}}><button style={{width:24,height:24,borderRadius:6,border:`1px solid ${g.gn}28`,background:`${g.gn}08`,color:g.gn,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✓</button><button style={{width:24,height:24,borderRadius:6,border:`1px solid ${g.red}28`,background:`${g.red}08`,color:g.red,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div></div><div style={{fontSize:9,color:g.t3,lineHeight:1.5,paddingLeft:52}}>{d.ctx}</div></div>)}</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={G()}><SL>Integração em Tempo Real</SL>{[{mod:"Diagnóstico",status:"Pesquisa nova detectada",c:g.gn},{mod:"Monitoramento",status:"Crise ativa — saúde",c:g.red},{mod:"Produção",status:"3 peças aguardando aprovação",c:g.am},{mod:"CRM",status:"1.2k novos contatos hoje",c:g.cyan},{mod:"Comunicação",status:"Disparo SMS agendado 19h",c:g.gn}].map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{width:5,height:5,borderRadius:"50%",background:m.c,boxShadow:`0 0 4px ${m.c}60`}}/><span style={{fontSize:10,color:g.t1,fontWeight:600}}>{m.mod}</span><span style={{marginLeft:"auto",fontSize:9,color:m.c}}>{m.status}</span></div>)}</div>
<div style={{...G({background:`${g.cyan}06`})}}><div style={{fontSize:9,color:g.cyan,fontWeight:600,marginBottom:4}}>Recomendação IA — Fernando Carreiro</div><div style={{fontSize:10,color:g.t2,lineHeight:1.7}}>Prioridade 1: Responder ataque saúde em 2h com vídeo curto + dados concretos (3 UBS inauguradas). Prioridade 2: Preparar candidato para debate — simulador disponível. Prioridade 3: Fechar aliança com Partido X antes da sexta.</div></div>
</div></div></div>}

{tab==="matriz"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Matriz de Comunicação Semanal</SL><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>{[{t:"O QUÊ",items:[{i:"Saúde — UBS inauguradas",pr:"Alta"},{i:"Transporte — proposta metrô",pr:"Alta"},{i:"Educação — creches",pr:"Média"},{i:"Resposta greve ônibus",pr:"Urgente"}],c:g.red},{t:"COMO",items:[{i:"Vídeo 30s TikTok/Reels",pr:"Alta"},{i:"Carrossel 5 slides IG",pr:"Alta"},{i:"Thread X com dados",pr:"Média"},{i:"Nota + vídeo rápido",pr:"Urgente"}],c:g.cyan},{t:"ONDE",items:[{i:"TikTok + Instagram Reels",pr:"Alta"},{i:"Instagram + Facebook",pr:"Alta"},{i:"X + LinkedIn",pr:"Média"},{i:"Todas as redes + WhatsApp",pr:"Urgente"}],c:g.gn},{t:"POR QUÊ",items:[{i:"Consolidar liderança no tema",pr:""},{i:"Converter indecisos zona leste",pr:""},{i:"Conquistar voto jovem",pr:""},{i:"Neutralizar crise antes que cresça",pr:""}],c:g.am}].map((col,i)=><div key={i}><div style={{fontSize:9,fontWeight:700,color:col.c,marginBottom:8,letterSpacing:"0.1em",textTransform:"uppercase"}}>{col.t}</div>{col.items.map((it,j)=><div key={j} style={{fontSize:9,color:g.t2,padding:"6px 8px",marginBottom:4,...GS({borderLeft:`2px solid ${col.c}30`}),lineHeight:1.5}}>{it.i}{it.pr&&<span style={{display:"block",fontSize:7,color:col.c,marginTop:2}}>{it.pr}</span>}</div>)}</div>)}</div></div></div>}

{tab==="narrativa"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={G()}><SL>Eixos Narrativos Ativos</SL>{[{eixo:"Saúde que funciona",desc:"Candidato como líder em saúde pública. Foco em UBS, vacinas, fila zero.",perc:85,status:"Principal",c:g.gn},{eixo:"Cidade que se move",desc:"Mobilidade urbana: metrô, ônibus, ciclovias. Dados comparativos.",perc:72,status:"Secundário",c:g.cyan},{eixo:"Futuro para os jovens",desc:"Educação, primeiro emprego, tecnologia. Tom inspirador.",perc:60,status:"Em crescimento",c:g.am},{eixo:"Gestão eficiente",desc:"Economia, transparência, resultados concretos. Anti-corrupção.",perc:45,status:"Suporte",c:g.t3}].map((e,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:e.c}}>{e.eixo}</span><Badge color={e.c}>{e.status}</Badge><span style={{marginLeft:"auto",fontSize:12,fontWeight:700,color:e.c}}>{e.perc}%</span></div><div style={{fontSize:9,color:g.t2,lineHeight:1.5,marginBottom:6}}>{e.desc}</div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:`${e.perc}%`,height:"100%",borderRadius:2,background:e.c,opacity:0.6}}/></div></div>)}</div>
<div style={{...G({background:`${g.red}06`,border:`1px solid ${g.red}18`,marginTop:10})}}>
<div style={{fontSize:9,color:g.red,fontWeight:600,marginBottom:4}}>Mensagem Central da Campanha</div>
<div style={{fontSize:14,color:g.t1,fontWeight:700,lineHeight:1.5,marginBottom:6}}>"São Paulo merece quem trabalha de verdade — com resultado na saúde, no transporte e na educação."</div>
<div style={{fontSize:9,color:g.t3}}>Tom: Propositivo, empático, concreto. Evitar: ataques pessoais, promessas vagas.</div>
</div></div>}

{tab==="timeline"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Timeline Estratégica — Próximas 4 Semanas</SL>{[{sem:"Semana 1 (atual)",acoes:["Responder crise saúde","Preparar debate TV","Fechar aliança Partido X","Lançar campanha arrecadação"],foco:"Defesa + preparação",c:g.red},{sem:"Semana 2",acoes:["Debate TV (quarta)","Intensificar zona leste","Lançar eixo transporte","Campanha jovens TikTok"],foco:"Ataque + expansão",c:g.cyan},{sem:"Semana 3",acoes:["Comício central (sábado)","Blitz mídia — entrevistas","Pesquisa interna","Ajustar mensagem se necessário"],foco:"Consolidação",c:g.am},{sem:"Semana 4 — ELEIÇÃO",acoes:["GOTV ativado","Disparos finais WhatsApp/SMS","Fiscais posicionados","Transporte eleitores"],foco:"Execução total",c:g.gn}].map((s,i)=><div key={i} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{width:3,borderRadius:2,background:s.c,alignSelf:"stretch",flexShrink:0}}/><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:12,fontWeight:700,color:s.c}}>{s.sem}</span><Badge color={s.c}>{s.foco}</Badge></div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{s.acoes.map((a,j)=><span key={j} style={{padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.04)",fontSize:9,color:g.t2}}>{a}</span>)}</div></div></div>)}</div></div>}
</div>;}
function IA(){const[msgs,setMsgs]=useState([{r:"ai",t:"Olá! Sou o assistente do CIC, treinado com a metodologia Fernando Carreiro — 20+ anos, 50+ campanhas. Como posso ajudar?"}]);const[inp,setInp]=useState("");const[thinking,setThinking]=useState(false);const send=(txt)=>{const m=txt||inp;if(!m.trim())return;setMsgs(p=>[...p,{r:"user",t:m}]);setInp("");setThinking(true);setTimeout(()=>{setThinking(false);setMsgs(p=>[...p,{r:"ai",t:"Com base na metodologia Fernando Carreiro e nos dados de monitoramento, recomendo priorizar resposta ao ataque sobre saúde com vídeo curto + dados concretos. Timing: próximas 2h para máximo impacto via TikTok e Instagram."}])},2000)};return<div style={{animation:"fadeUp .4s ease",display:"flex",flexDirection:"column",height:"calc(100vh - 100px)"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Assistente IA</h2><span style={{fontSize:8,color:g.cyan,background:g.cg,padding:"2px 8px",borderRadius:8,fontWeight:600}}>Fernando Carreiro</span></div><div style={{flex:1,overflowY:"auto",marginBottom:10}}>{msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.r==="user"?"flex-end":"flex-start",marginBottom:8}}>{m.r==="ai"&&<div style={{marginRight:6,marginTop:2,filter:"drop-shadow(0 2px 6px rgba(255,45,45,0.2))"}}><CICLogo size={20}/></div>}<div style={{maxWidth:"78%",padding:"10px 14px",fontSize:11,lineHeight:1.6,color:g.t1,borderRadius:m.r==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",...(m.r==="user"?{background:`linear-gradient(135deg,${g.red},#CC1E1E)`,boxShadow:`0 4px 14px ${g.rg}`}:G({borderRadius:"14px 14px 14px 4px"}))}}>{m.t}</div></div>)}{thinking&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,animation:"fadeUp .3s ease"}}><div style={{filter:"drop-shadow(0 2px 6px rgba(255,45,45,0.2))"}}><CICLogo size={20}/></div><div style={{...G({borderRadius:"14px 14px 14px 4px",padding:"12px 18px"}),display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:g.cyan,animation:`thinkDot 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}<span style={{fontSize:10,color:g.t3,marginLeft:6}}>Analisando...</span></div></div>}</div>{msgs.length<=2&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{["Analise o cenário","Gere roteiro","Avenidas de crescimento?","Crie jingle"].map((s,i)=><button key={i} onClick={()=>send(s)} style={{padding:"5px 10px",borderRadius:12,...GS({cursor:"pointer"}),color:g.t2,fontSize:9}}>{s}</button>)}</div>}<div style={{display:"flex",gap:6}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pergunte ao assistente..." style={{...g.input,flex:1,padding:"10px 14px",fontSize:11}}/><button onClick={()=>send()} style={{background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:11,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${g.rg}`}}>Enviar</button></div></div>;}

/* ══════════ IA REAL (streaming via Claude) ══════════ */
function IARealChat(){
  const{messages,send,isStreaming,clearHistory}=useChat('geral');
  const[inp,setInp]=useState("");
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'})},[messages]);
  const handleSend=(txt)=>{const m=txt||inp;if(!m.trim()||isStreaming)return;send(m);setInp("");};
  return<div style={{animation:"fadeUp .4s ease",display:"flex",flexDirection:"column",height:"calc(100vh - 100px)"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Assistente IA</h2>
      <span style={{fontSize:8,color:g.cyan,background:g.cg,padding:"2px 8px",borderRadius:8,fontWeight:600}}>Fernando Carreiro</span>
      {messages.length>0&&<button onClick={clearHistory} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:8,border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.04)",color:g.t3,fontSize:9,cursor:"pointer"}}>Limpar histórico</button>}
    </div>
    <div style={{flex:1,overflowY:"auto",marginBottom:10}}>
      {messages.length===0&&<div style={{...G({padding:"20px",textAlign:"center"}),marginBottom:12}}>
        <div style={{fontSize:28,marginBottom:8,filter:"drop-shadow(0 2px 8px rgba(255,45,45,0.3))"}}><CICLogo size={36}/></div>
        <p style={{fontSize:12,color:g.t2,lineHeight:1.7,margin:0}}>Olá! Sou o assistente do CIC, treinado com a metodologia <strong style={{color:g.red}}>Fernando Carreiro</strong> — 20+ anos, 50+ campanhas vitoriosas. Como posso ajudar?</p>
      </div>}
      {messages.map((m,i)=>{
        const isUser=m.role==="user";
        return<div key={i} style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:8}}>
          {!isUser&&<div style={{marginRight:6,marginTop:2,filter:"drop-shadow(0 2px 6px rgba(255,45,45,0.2))"}}><CICLogo size={20}/></div>}
          <div style={{maxWidth:"78%",padding:"10px 14px",fontSize:11,lineHeight:1.6,color:g.t1,borderRadius:isUser?"14px 14px 4px 14px":"14px 14px 14px 4px",...(isUser?{background:`linear-gradient(135deg,${g.red},#CC1E1E)`,boxShadow:`0 4px 14px ${g.rg}`}:G({borderRadius:"14px 14px 14px 4px"}))}}>
            {m.content&&<span style={{whiteSpace:"pre-wrap"}}>{m.content}</span>}
            {m.streaming&&!m.content&&<span style={{display:"inline-flex",gap:4,alignItems:"center"}}>{[0,1,2].map(k=><span key={k} style={{width:5,height:5,borderRadius:"50%",background:g.cyan,display:"inline-block",animation:`thinkDot 1.4s ease-in-out ${k*0.2}s infinite`}}/>)}</span>}
            {!m.streaming&&m.meta&&<div style={{fontSize:8,color:g.t4,marginTop:5,paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.06)"}}>{m.meta.model?.split('-').slice(0,2).join('-')} · {m.meta.tokens} tokens{m.meta.ragUsed?" · RAG ✓":""}</div>}
          </div>
        </div>;
      })}
      <div ref={bottomRef}/>
    </div>
    {messages.length===0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
      {["Analise o cenário eleitoral","Gere roteiro de discurso","Como crescer nas pesquisas?","Estratégia anti-crise"].map((s,i)=><button key={i} onClick={()=>handleSend(s)} style={{padding:"5px 10px",borderRadius:12,...GS({cursor:"pointer"}),color:g.t2,fontSize:9,border:"none"}}>{s}</button>)}
    </div>}
    <div style={{display:"flex",gap:6}}>
      <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="Pergunte ao assistente..." style={{...g.input,flex:1,padding:"10px 14px",fontSize:11}} disabled={isStreaming}/>
      <button onClick={()=>handleSend()} disabled={isStreaming} style={{background:isStreaming?"#444":`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:11,fontWeight:600,cursor:isStreaming?"not-allowed":"pointer",boxShadow:`0 4px 14px ${g.rg}`,transition:"all .2s"}}>{isStreaming?"⏳":"Enviar"}</button>
    </div>
  </div>;
}

/* ══════════ NOTIFICATIONS PANEL ══════════ */
function NotifPanel({show,onClose}){
  const[notifs,setNotifs]=useState([
    {id:1,type:"alert",title:"Ataque coordenado detectado",desc:"847 posts sobre saúde em 2 horas — adversário A",time:"14:32",read:false},
    {id:2,type:"success",title:"Pesquisa registrada",desc:"DataPoder360 — intenção de voto subiu 1.2pp",time:"13:15",read:false},
    {id:3,type:"info",title:"Conteúdos publicados",desc:"12 peças aprovadas e publicadas no Instagram e TikTok",time:"12:48",read:true},
    {id:4,type:"warn",title:"Pauta emergente",desc:"Transporte público em alta nas redes — oportunidade de posicionamento",time:"11:20",read:true},
    {id:5,type:"info",title:"Briefing diário",desc:"Briefing estratégico gerado pela IA e enviado à equipe",time:"09:00",read:true},
    {id:6,type:"alert",title:"Menção negativa viral",desc:"Post com 50k compartilhamentos criticando proposta de educação",time:"Ontem",read:true},
  ]);
  const markAll=()=>setNotifs(p=>p.map(n=>({...n,read:true})));
  const unread=notifs.filter(n=>!n.read).length;
  if(!show)return null;
  return(
    <div style={{position:"fixed",top:0,right:0,width:window.innerWidth<768?"calc(100vw - 24px)":"340px",height:"100vh",zIndex:100,animation:"slideIn .3s ease"}}>
      <div style={{position:"absolute",inset:0,...g.sidebar,borderRight:"none",borderLeft:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <h3 style={{fontSize:15,fontWeight:700,color:g.t1,margin:0}}>Notificações</h3>
            {unread>0&&<span style={{fontSize:9,fontWeight:700,color:"#fff",background:g.red,padding:"1px 6px",borderRadius:10,minWidth:16,textAlign:"center"}}>{unread}</span>}
          </div>
          <div style={{display:"flex",gap:6}}>
            {unread>0&&<button onClick={markAll} style={{padding:"4px 10px",borderRadius:6,border:`1px solid rgba(255,255,255,0.08)`,background:"rgba(255,255,255,0.03)",color:g.t3,fontSize:9,cursor:"pointer"}}>Marcar todas como lidas</button>}
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:`1px solid rgba(255,255,255,0.08)`,background:"rgba(255,255,255,0.03)",color:g.t2,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
          {notifs.map((n,i)=>{
            const colors={alert:g.red,success:g.gn,warn:g.am,info:g.cyan};
            const c=colors[n.type]||g.t4;
            return(
              <div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}
                style={{padding:"12px 14px",marginBottom:4,borderRadius:10,background:n.read?"transparent":"rgba(255,255,255,0.03)",border:`1px solid ${n.read?"transparent":"rgba(255,255,255,0.06)"}`,cursor:"pointer",transition:"all .2s",animation:`fadeUp .3s ease ${i*0.04}s both`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:c,boxShadow:n.read?"none":`0 0 8px ${c}60`,marginTop:3,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:n.read?500:700,color:n.read?g.t2:g.t1}}>{n.title}</span>
                      {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:g.cyan}}/>}
                    </div>
                    <div style={{fontSize:10,color:g.t3,lineHeight:1.5,marginBottom:4}}>{n.desc}</div>
                    <span style={{fontSize:8,color:g.t4}}>{n.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:-1}}/>
    </div>
  );
}


/* ══════════ CRM ELEITORES ══════════ */
function CRMEleitores(){const{eleitores:crmEleits,loading:crmLoad}=useCRM();const[tab,setTab]=useState("base");const[search,setSearch]=useState("");
const eleitores=crmEleits.length>0?crmEleits:[
{nome:"Ana Maria Silva",bairro:"Vila Mariana",idade:42,genero:"F",perfil:"Apoiador firme",score:92,tags:["Saúde","Mulheres"],contatos:5,ultimo:"Hoje"},
{nome:"Carlos Eduardo Santos",bairro:"Pinheiros",idade:35,genero:"M",perfil:"Indeciso",score:55,tags:["Transporte","Jovem"],contatos:2,ultimo:"3 dias"},
{nome:"Dona Maria José",bairro:"Penha",idade:68,genero:"F",perfil:"Apoiador firme",score:88,tags:["Saúde","Idosos"],contatos:8,ultimo:"Ontem"},
{nome:"João Pedro Lima",bairro:"Mooca",idade:28,genero:"M",perfil:"Contra",score:15,tags:["Segurança"],contatos:1,ultimo:"7 dias"},
{nome:"Fernanda Oliveira",bairro:"Santana",idade:51,genero:"F",perfil:"Leaning",score:68,tags:["Educação","Mãe"],contatos:3,ultimo:"2 dias"},
{nome:"Roberto Almeida",bairro:"Itaquera",idade:45,genero:"M",perfil:"Apoiador firme",score:95,tags:["Emprego","Voluntário"],contatos:12,ultimo:"Hoje"},
{nome:"Luciana Torres",bairro:"Butantã",idade:33,genero:"F",perfil:"Indeciso",score:48,tags:["Moradia","Jovem"],contatos:1,ultimo:"5 dias"},
{nome:"Paulo Henrique Costa",bairro:"Consolação",idade:56,genero:"M",perfil:"Leaning",score:72,tags:["Saúde","Transporte"],contatos:4,ultimo:"Hoje"}
];
const tabs=[{id:"base",label:"Base Eleitoral",ic:"👥"},{id:"segmentos",label:"Segmentos",ic:"🎯"},{id:"interacoes",label:"Interações",ic:"💬"},{id:"scoring",label:"Scoring IA",ic:"⚡"}];
const scoreColor=(s)=>s>=70?g.gn:s>=40?g.am:g.red;
const perfilColor=(p)=>p==="Apoiador firme"?g.gn:p==="Leaning"?g.cyan:p==="Indeciso"?g.am:g.red;
const filtered=eleitores.filter(e=>!search||e.nome.toLowerCase().includes(search.toLowerCase())||e.bairro.toLowerCase().includes(search.toLowerCase()));

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>CRM de Eleitores</h2><Badge color={g.cyan}>{eleitores.length.toLocaleString("pt-BR")} contatos</Badge><div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 12px ${g.rg}`}}>+ Novo Contato</button><ExportBtn/></div></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Total na base",v:"24.847",d:"+1.2k esta semana",c:g.cyan},{l:"Apoiadores firmes",v:"8.412",d:"33.8%",c:g.gn},{l:"Indecisos",v:"9.203",d:"37.0%",c:g.am},{l:"Score médio",v:"64",d:"+3 pts vs semana",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="base"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>📥 Importar Lista</button><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>📋 Importar do TSE</button><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>🏷️ Criar Segmento</button></div><div style={{marginBottom:12}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar por nome, bairro, tag..." style={{...g.input,width:"100%",padding:"10px 14px",fontSize:11,boxSizing:"border-box"}}/></div>
<div style={G()}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 0.5fr",overflowX:"auto",minWidth:600,gap:8,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:6}}>{["Nome","Bairro","Perfil","Score","Tags","Último"].map(h=><div key={h} style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600}}>{h}</div>)}</div>
{filtered.map((e,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 0.5fr",overflowX:"auto",minWidth:600,gap:8,padding:"8px 0",borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.03)":"none",alignItems:"center",cursor:"pointer",transition:"all .2s"}} onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
<div><div style={{fontSize:11,color:g.t1,fontWeight:600}}>{e.nome}</div><div style={{fontSize:8,color:g.t4}}>{e.genero} · {e.idade} anos</div></div>
<div style={{fontSize:10,color:g.t2}}>{e.bairro}</div>
<div><Badge color={perfilColor(e.perfil)}>{e.perfil}</Badge></div>
<div style={{display:"flex",alignItems:"center",gap:4}}><MiniGauge value={e.score} max={100} color={scoreColor(e.score)} size={24}/><span style={{fontSize:11,fontWeight:700,color:scoreColor(e.score)}}>{e.score}</span></div>
<div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{e.tags.map((t,j)=><span key={j} style={{fontSize:7,padding:"2px 6px",borderRadius:6,background:"rgba(255,255,255,0.04)",color:g.t3}}>{t}</span>)}</div>
<div style={{fontSize:9,color:g.t4}}>{e.ultimo}</div>
</div>)}</div></div>}

{tab==="segmentos"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Por Perfil</SL>{[{l:"Apoiador firme",v:8412,c:g.gn},{l:"Leaning",v:4130,c:g.cyan},{l:"Indeciso",v:9203,c:g.am},{l:"Contra",v:3102,c:g.red}].map((s,i)=><HBar key={i} label={s.l} value={Math.round(s.v/248.47)} max={100} color={s.c} delay={i*100}/>)}</div>
<div style={G()}><SL>Por Região</SL>{[{l:"Zona Sul",v:7800,c:g.cyan},{l:"Zona Leste",v:6200,c:g.gn},{l:"Centro",v:4100,c:g.am},{l:"Zona Norte",v:3800,c:g.cyan},{l:"Zona Oeste",v:2947,c:g.t3}].map((s,i)=><HBar key={i} label={s.l} value={Math.round(s.v/248.47)} max={100} color={s.c} delay={i*100}/>)}</div>
<div style={G()}><SL>Por Tema de Interesse</SL>{[{l:"Saúde",v:42,c:g.gn},{l:"Transporte",v:28,c:g.cyan},{l:"Educação",v:18,c:g.am},{l:"Segurança",v:12,c:g.red}].map((s,i)=><HBar key={i} label={s.l} value={s.v} max={50} color={s.c} delay={i*100}/>)}</div>
<div style={G()}><SL>Por Faixa Etária</SL>{[{l:"18-25",v:15,c:g.cyan},{l:"26-35",v:28,c:g.gn},{l:"36-50",v:32,c:g.cyan},{l:"51-65",v:18,c:g.am},{l:"65+",v:7,c:g.t3}].map((s,i)=><HBar key={i} label={s.l} value={s.v} max={35} color={s.c} delay={i*100}/>)}</div>
</div></div>}

{tab==="interacoes"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Histórico de Interações</SL>{[{tipo:"WhatsApp",nome:"Ana Maria Silva",msg:"Respondeu pesquisa sobre saúde — favorável",hora:"Hoje 14:32",c:g.gn},{tipo:"Visita",nome:"Carlos Eduardo Santos",msg:"Porta a porta Vila Mariana — indeciso, quer saber sobre transporte",hora:"Hoje 11:20",c:g.am},{tipo:"Evento",nome:"Roberto Almeida",msg:"Confirmou presença no comício de sábado",hora:"Ontem 18:45",c:g.cyan},{tipo:"Ligação",nome:"Fernanda Oliveira",msg:"Ligação de 3min — interesse em proposta de educação",hora:"Ontem 15:10",c:g.cyan},{tipo:"SMS",nome:"Dona Maria José",msg:"Abriu SMS sobre saúde — clicou no link",hora:"2 dias atrás",c:g.gn},{tipo:"WhatsApp",nome:"Paulo Henrique Costa",msg:"Perguntou sobre proposta de transporte",hora:"2 dias atrás",c:g.am}].map((h,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"flex-start"}}><Badge color={h.c}>{h.tipo}</Badge><div style={{flex:1}}><div style={{fontSize:11,color:g.t1,fontWeight:600}}>{h.nome}</div><div style={{fontSize:10,color:g.t2,marginTop:2}}>{h.msg}</div></div><span style={{fontSize:8,color:g.t4,whiteSpace:"nowrap"}}>{h.hora}</span></div>)}</div></div>}

{tab==="scoring"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Como funciona o Score IA</SL><div style={{fontSize:10,color:g.t2,lineHeight:1.7}}>O scoring é calculado pela IA com base na metodologia Fernando Carreiro, considerando:</div><div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>{[{f:"Histórico de interações",peso:"25%",c:g.cyan},{f:"Perfil demográfico",peso:"20%",c:g.gn},{f:"Temas de interesse",peso:"20%",c:g.am},{f:"Comportamento digital",peso:"15%",c:g.cyan},{f:"Localização estratégica",peso:"10%",c:g.gn},{f:"Rede de influência",peso:"10%",c:g.am}].map((f,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:g.t2}}>{f.f}</span><Badge color={f.c}>{f.peso}</Badge></div>)}</div></div>
<div style={G()}><SL>Distribuição de Scores</SL><div style={{display:"flex",gap:2,alignItems:"end",height:100,marginBottom:8}}>{[5,8,12,18,25,35,42,55,68,72,85,78,62,48,35,22,15,8,4,2].map((v,i)=><div key={i} style={{flex:1,background:i<7?g.red:i<14?g.am:g.gn,borderRadius:"2px 2px 0 0",height:`${v}%`,opacity:0.7,transition:"height 1s ease"}}/>)}</div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:7,color:g.red}}>0</span><span style={{fontSize:7,color:g.am}}>50</span><span style={{fontSize:7,color:g.gn}}>100</span></div></div>
</div></div>}
</div>;}

/* ══════════ FUNDRAISING ══════════ */
function Fundraising(){const{overview:fundOv,doadores:fundDoads,loading:fundLoad}=useFundraising();const[tab,setTab]=useState("visao");const fundStats={arrecadado:fundOv?.total||847000,meta:fundOv?.meta||1067250,doadores:fundOv?.doadores||1847,ticket:fundOv?.ticket_medio||458,recorrentes:fundOv?.recorrentes||342,pct:fundOv?.percentual||79.4};
const tabs=[{id:"visao",label:"Visão Geral",ic:"📊"},{id:"doadores",label:"Doadores",ic:"💰"},{id:"compliance",label:"Compliance TSE",ic:"📋"}];

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Arrecadação</h2><Badge color={g.gn}>R$ 847.200</Badge><div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.gn},#22B07D)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 12px ${g.gn}30`}}>+ Nova Doação</button><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>🔗 Link de Doação</button><ExportBtn/></div></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Arrecadado",v:"R$ "+(fundStats.arrecadado/1000).toFixed(0)+"k",d:"de R$ "+(fundStats.meta/1000).toFixed(0)+"k meta",c:g.gn},{l:"Doadores",v:fundStats.doadores.toLocaleString("pt-BR"),d:"+124 esta semana",c:g.cyan},{l:"Ticket médio",v:"R$ "+fundStats.ticket,d:"+12% vs mês",c:g.gn},{l:"Recorrentes",v:fundStats.recorrentes.toString(),d:"18.5% do total",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="visao"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{...G(),marginBottom:12}}><SL>Progresso da Meta</SL><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:700,color:g.t1}}>R$ 847.200</span><span style={{fontSize:12,color:g.t4}}>R$ 1.200.000</span></div><div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{width:"70.6%",height:"100%",borderRadius:5,background:`linear-gradient(90deg,${g.gn},${g.cyan})`,transition:"width 2s ease",boxShadow:`0 0 12px ${g.gn}40`}}/></div><div style={{fontSize:9,color:g.gn,marginTop:4,textAlign:"center"}}>70.6% da meta · Faltam R$ 352.800</div></div>
<div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Arrecadação por Semana</SL><AreaChart data={[42,58,45,72,68,95,110,125,140,118,155,180]} color={g.gn} h={60} w={280}/></div>
<div style={G()}><SL>Por Faixa de Valor</SL>{[{l:"Até R$ 100",v:45,c:g.cyan},{l:"R$ 100-500",v:30,c:g.gn},{l:"R$ 500-2.000",v:15,c:g.am},{l:"Acima de R$ 2.000",v:10,c:g.red}].map((s,i)=><HBar key={i} label={s.l} value={s.v} max={50} color={s.c} delay={i*100}/>)}</div>
</div></div>}

{tab==="doadores"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.gn},#22B07D)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.gn}30`}}>+ Cadastrar Doador</button><button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>📥 Importar Doadores</button><button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>📊 Relatório TSE</button></div><div style={G()}>
<SL>Principais Doadores</SL>
{[{nome:"Instituto Renovar",valor:"R$ 50.000",tipo:"PJ",data:"15/03",status:"Confirmado"},{nome:"Maria Helena Costa",valor:"R$ 15.000",tipo:"PF",data:"12/03",status:"Confirmado"},{nome:"Assoc. Comercial SP",valor:"R$ 25.000",tipo:"PJ",data:"10/03",status:"Pendente"},{nome:"Dr. Roberto Mendes",valor:"R$ 8.000",tipo:"PF",data:"08/03",status:"Confirmado"},{nome:"Sindicato Metalúrgicos",valor:"R$ 20.000",tipo:"PJ",data:"05/03",status:"Confirmado"},{nome:"Ana Beatriz Lima",valor:"R$ 5.000",tipo:"PF",data:"03/03",status:"Confirmado"}].map((d,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><div style={{width:32,height:32,borderRadius:8,background:d.tipo==="PJ"?`${g.cyan}15`:`${g.gn}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{d.tipo==="PJ"?"🏢":"👤"}</div><div style={{flex:1}}><div style={{fontSize:11,color:g.t1,fontWeight:600}}>{d.nome}</div><div style={{fontSize:8,color:g.t4}}>{d.tipo} · {d.data}</div></div><span style={{fontSize:13,fontWeight:700,color:g.gn}}>{d.valor}</span><Badge color={d.status==="Confirmado"?g.gn:g.am}>{d.status}</Badge></div>)}
</div></div>}

{tab==="compliance"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Status Prestação de Contas</SL>{[{item:"Parcial 1 (30 dias)",status:"✅ Enviada",data:"15/02"},{item:"Parcial 2 (60 dias)",status:"✅ Enviada",data:"15/03"},{item:"Parcial 3 (90 dias)",status:"⏳ Pendente",data:"15/04"},{item:"Final",status:"⏳ Pendente",data:"30 dias após"}].map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:g.t1}}>{c.item}</span><span style={{fontSize:9,color:c.status.includes("✅")?g.gn:g.am}}>{c.status}</span><span style={{fontSize:8,color:g.t4}}>{c.data}</span></div>)}</div>
<div style={G()}><SL>Alertas de Compliance</SL>{[{msg:"3 doações PF acima de R$ 10k precisam de comprovante",nivel:"ATENÇÃO",c:g.am},{msg:"Prazo parcial 3: faltam 17 dias",nivel:"INFO",c:g.cyan},{msg:"Todos os limites de doação dentro da lei",nivel:"OK",c:g.gn}].map((a,i)=><div key={i} style={{display:"flex",gap:8,padding:"8px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><Badge color={a.c}>{a.nivel}</Badge><span style={{fontSize:10,color:g.t2}}>{a.msg}</span></div>)}</div>
</div></div>}
</div>;}

/* ══════════ COMUNICAÇÃO MULTI-CANAL ══════════ */
function Comunicacao(){const[tab,setTab]=useState("disparos");const[canal,setCanal]=useState("whatsapp");
const tabs=[{id:"disparos",label:"Disparos",ic:"📨"},{id:"templates",label:"Templates",ic:"📝"},{id:"automacoes",label:"Automações",ic:"🤖"},{id:"metricas",label:"Métricas",ic:"📊"}];

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Comunicação</h2><div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 12px ${g.rg}`}}>+ Novo Disparo</button><ExportBtn/></div></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Mensagens enviadas",v:"48.2k",d:"esta semana",c:g.cyan},{l:"Taxa de abertura",v:"67%",d:"+8% vs média",c:g.gn},{l:"Cliques",v:"12.4k",d:"25.7% CTR",c:g.cyan},{l:"Respostas",v:"3.8k",d:"7.9% taxa",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="disparos"&&<div style={{animation:"fadeUp .3s ease"}}>
<div style={{display:"flex",gap:6,marginBottom:14}}>{[{id:"whatsapp",l:"WhatsApp",ic:"💬",c:"#25D366"},{id:"sms",l:"SMS",ic:"📱",c:g.cyan},{id:"email",l:"E-mail",ic:"✉️",c:g.am},{id:"phone",l:"Ligação",ic:"📞",c:g.gn}].map(c=><button key={c.id} onClick={()=>setCanal(c.id)} style={{flex:1,...G({padding:"14px 10px",cursor:"pointer",textAlign:"center",border:canal===c.id?`1px solid ${c.c}40`:"1px solid rgba(255,255,255,0.10)",background:canal===c.id?`${c.c}10`:"rgba(255,255,255,0.06)"}),transition:"all .3s"}}><div style={{fontSize:20,marginBottom:4}}>{c.ic}</div><div style={{fontSize:10,fontWeight:600,color:canal===c.id?g.t1:g.t3}}>{c.l}</div></button>)}</div>
<div style={G()}><SL>Novo Disparo — {canal==="whatsapp"?"WhatsApp":canal==="sms"?"SMS":canal==="email"?"E-mail":"Ligação"}</SL>
<div style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Segmento</label><select style={{...g.input,width:"100%",padding:"9px 11px",fontSize:11,boxSizing:"border-box"}}><option>Todos os apoiadores (8.412)</option><option>Indecisos zona sul (2.100)</option><option>Mulheres 30-50 (3.400)</option><option>Jovens 18-25 (1.200)</option></select></div>
<div style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Mensagem</label><textarea rows={3} placeholder="Digite sua mensagem ou peça à IA para gerar..." style={{...g.input,width:"100%",padding:"9px 11px",fontSize:11,boxSizing:"border-box",resize:"vertical"}}/></div>
<div style={{display:"flex",gap:6}}><button style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer"}}>📨 Enviar Agora</button><button style={{padding:"10px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:10,color:g.cyan,fontSize:11,fontWeight:600,cursor:"pointer"}}>⚡ Gerar com IA</button><button style={{padding:"10px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:10,color:g.t3,fontSize:11,cursor:"pointer"}}>⏰ Agendar</button></div>
</div></div>}

{tab==="templates"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Criar Template</button><button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>⚡ Gerar com IA</button></div><div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:10}}>
{[{nome:"Boas-vindas",canal:"WhatsApp",uso:847,c:"#25D366"},{nome:"Convite Comício",canal:"SMS",uso:2400,c:g.cyan},{nome:"Proposta Saúde",canal:"E-mail",uso:5200,c:g.am},{nome:"Pesquisa Rápida",canal:"WhatsApp",uso:1100,c:"#25D366"},{nome:"Agradecimento Doação",canal:"E-mail",uso:342,c:g.am},{nome:"Lembrete Eleição",canal:"SMS",uso:0,c:g.cyan}].map((t,i)=><div key={i} style={{...G({padding:"16px",cursor:"pointer"}),transition:"all .3s"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><Badge color={t.c}>{t.canal}</Badge>{t.uso===0&&<Badge color={g.am}>Novo</Badge>}</div><div style={{fontSize:12,fontWeight:600,color:g.t1,marginBottom:4}}>{t.nome}</div><div style={{fontSize:9,color:g.t4}}>{t.uso>0?`Usado ${t.uso.toLocaleString("pt-BR")}x`:"Ainda não usado"}</div></div>)}
</div></div>}

{tab==="automacoes"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.cyan},#00B8E6)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.cyan}30`}}>+ Nova Automação</button></div><div style={G()}>
<SL>Fluxos Ativos</SL>
{[{nome:"Boas-vindas novo contato",trigger:"Cadastro na base",acoes:"WhatsApp → espera 2 dias → SMS com proposta",status:"Ativo",execucoes:847},{nome:"Nutrição de indeciso",trigger:"Score entre 40-60",acoes:"E-mail semanal → WhatsApp quinzenal → Convite evento",status:"Ativo",execucoes:2100},{nome:"Reengajamento",trigger:"Sem interação há 14 dias",acoes:"SMS personalizado → WhatsApp com vídeo",status:"Ativo",execucoes:380},{nome:"Pós-evento",trigger:"Participou de evento",acoes:"Agradecimento → Pesquisa satisfação → Convite voluntário",status:"Pausado",execucoes:156}].map((a,i)=><div key={i} style={{padding:"12px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:12,fontWeight:600,color:g.t1}}>{a.nome}</span><Badge color={a.status==="Ativo"?g.gn:g.am}>{a.status}</Badge><span style={{marginLeft:"auto",fontSize:9,color:g.t4}}>{a.execucoes.toLocaleString("pt-BR")} execuções</span></div><div style={{fontSize:9,color:g.t3}}>Trigger: {a.trigger}</div><div style={{fontSize:9,color:g.t2,marginTop:2}}>{a.acoes}</div></div>)}
</div></div>}

{tab==="metricas"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Performance por Canal</SL>{[{canal:"WhatsApp",enviados:"18.4k",abertura:"82%",cliques:"34%",c:"#25D366"},{canal:"SMS",enviados:"12.1k",abertura:"71%",cliques:"18%",c:g.cyan},{canal:"E-mail",enviados:"15.2k",abertura:"45%",cliques:"12%",c:g.am},{canal:"Ligação",enviados:"2.5k",abertura:"—",cliques:"62% atend.",c:g.gn}].map((c,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4,padding:"8px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><span style={{fontSize:10,color:c.c,fontWeight:600}}>{c.canal}</span><span style={{fontSize:10,color:g.t2}}>{c.enviados}</span><span style={{fontSize:10,color:g.t2}}>{c.abertura}</span><span style={{fontSize:10,color:g.t2}}>{c.cliques}</span></div>)}</div>
<div style={G()}><SL>Engajamento Semanal</SL><AreaChart data={[3200,4100,3800,5200,4800,6100,7200,6800,8400,9100,8200,9800]} color={g.cyan} h={60} w={280}/></div>
</div></div>}
</div>;}

/* ══════════ VOLUNTÁRIOS ══════════ */
function Voluntarios(){const{voluntarios:volReal,ranking:rankReal,loading:volLoad}=useVoluntarios();const[tab,setTab]=useState("equipe");
const tabs=[{id:"equipe",label:"Equipe",ic:"👥"},{id:"tarefas",label:"Tarefas",ic:"✅"},{id:"campo",label:"Ações de Campo",ic:"🗺️"},{id:"ranking",label:"Ranking",ic:"🏆"}];

return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Gestão de Voluntários</h2><Badge color={g.gn}>247 ativos</Badge><div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4,boxShadow:`0 4px 12px ${g.rg}`}}>+ Novo Voluntário</button><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>📥 Importar</button><ExportBtn/></div></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Total cadastrados",v:"412",d:"+28 esta semana",c:g.cyan},{l:"Ativos",v:"247",d:"60% do total",c:g.gn},{l:"Horas esta semana",v:"1.840",d:"+15% vs anterior",c:g.cyan},{l:"Portas batidas",v:"4.2k",d:"esta semana",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>

<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .3s"}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tab==="equipe"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}>
{(volReal.length>0?volReal.map(v=>({nome:v.nome||v.name,funcao:v.funcao||v.cargo||"Voluntário",horas:v.horas||v.hours||0,tarefas:v.tarefas||"—",status:v.status||"Ativo",foto:v.foto||v.initials||(v.nome||"X").slice(0,2).toUpperCase()})):[{nome:"Marcos Oliveira",funcao:"Coord. Zona Sul",horas:32,tarefas:"12/15",status:"Ativo",foto:"MO"},{nome:"Juliana Santos",funcao:"Coord. Zona Leste",horas:28,tarefas:"9/12",status:"Ativo",foto:"JS"},{nome:"Pedro Henrique",funcao:"Líder Canvassing",horas:24,tarefas:"18/20",status:"Ativo",foto:"PH"},{nome:"Carla Mendes",funcao:"Social Media",horas:20,tarefas:"8/10",status:"Ativo",foto:"CM"},{nome:"Lucas Ferreira",funcao:"Phone Banking",horas:16,tarefas:"45/50",status:"Ativo",foto:"LF"},{nome:"Beatriz Alves",funcao:"Eventos",horas:12,tarefas:"5/8",status:"Licença",foto:"BA"}]).map((v,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${g.red}30,${g.cyan}30)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:g.t1}}>{v.foto}</div><div style={{flex:1}}><div style={{fontSize:11,color:g.t1,fontWeight:600}}>{v.nome}</div><div style={{fontSize:9,color:g.t4}}>{v.funcao}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:g.t1}}>{v.horas}h</div><div style={{fontSize:7,color:g.t4}}>esta semana</div></div><div style={{textAlign:"center"}}><div style={{fontSize:11,color:g.cyan}}>{v.tarefas}</div><div style={{fontSize:7,color:g.t4}}>tarefas</div></div><Badge color={v.status==="Ativo"?g.gn:g.am}>{v.status}</Badge></div>)}
</div></div>}

{tab==="tarefas"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Nova Tarefa</button><button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>📋 Atribuir em Lote</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
{[{titulo:"A Fazer",cor:g.am,items:[{t:"Panfletagem Metrô Sé",p:"Pedro",d:"Amanhã"},{t:"Ligar lista zona norte",p:"Lucas",d:"Hoje"},{t:"Montar barraca feira",p:"Marcos",d:"Sábado"}]},{titulo:"Em Andamento",cor:g.cyan,items:[{t:"Canvassing Vila Mariana",p:"Pedro",d:"Hoje"},{t:"Phone banking indecisos",p:"Lucas",d:"Hoje"},{t:"Preparar comício",p:"Juliana",d:"Sexta"}]},{titulo:"Concluído",cor:g.gn,items:[{t:"Coleta assinaturas centro",p:"Carla",d:"Ontem"},{t:"Treinamento novos vol.",p:"Marcos",d:"Ontem"},{t:"Entrega material gráfico",p:"Beatriz",d:"2 dias"}]}].map((col,i)=><div key={i} style={G()}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:col.cor}}/><SL>{col.titulo}</SL></div>{col.items.map((item,j)=><div key={j} style={{...GS({marginBottom:6,padding:"10px",cursor:"pointer"}),transition:"all .2s"}}><div style={{fontSize:10,color:g.t1,fontWeight:600,marginBottom:3}}>{item.t}</div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:8,color:g.t4}}>{item.p}</span><span style={{fontSize:8,color:g.t4}}>{item.d}</span></div></div>)}</div>)}
</div></div>}

{tab==="campo"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:12}}><button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.gn},#22B07D)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.gn}30`}}>+ Nova Ação de Campo</button><button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>🗺️ Planejar Rota</button></div><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Ações de Campo esta Semana</SL>{[{acao:"Canvassing Vila Mariana",tipo:"Porta a porta",portas:420,conversoes:68,data:"Hoje"},{acao:"Panfletagem Av. Paulista",tipo:"Panfletagem",portas:1200,conversoes:180,data:"Ontem"},{acao:"Barraca Feira Pinheiros",tipo:"Barraca",portas:340,conversoes:95,data:"Sábado"},{acao:"Comício Itaquera",tipo:"Comício",portas:2800,conversoes:450,data:"Domingo"}].map((a,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:g.t1,fontWeight:600}}>{a.acao}</span><Badge color={g.cyan}>{a.tipo}</Badge></div><div style={{display:"flex",gap:12}}><span style={{fontSize:9,color:g.t2}}>📍 {a.portas.toLocaleString("pt-BR")} contatos</span><span style={{fontSize:9,color:g.gn}}>✓ {a.conversoes} favoráveis</span><span style={{fontSize:8,color:g.t4}}>{a.data}</span></div></div>)}</div>
<div style={G()}><SL>Próximas Ações</SL>{[{acao:"Canvassing Mooca",data:"Amanhã 8h",vol:12,area:"300 portas"},{acao:"Phone banking geral",data:"Amanhã 14h",vol:8,area:"500 ligações"},{acao:"Comício Santana",data:"Sábado 16h",vol:45,area:"Praça central"},{acao:"Panfletagem Centro",data:"Domingo 9h",vol:20,area:"Metrô + ruas"}].map((p,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{fontSize:11,color:g.t1,fontWeight:600,marginBottom:2}}>{p.acao}</div><div style={{display:"flex",gap:10}}><span style={{fontSize:9,color:g.cyan}}>📅 {p.data}</span><span style={{fontSize:9,color:g.t2}}>👥 {p.vol} vol.</span><span style={{fontSize:9,color:g.t4}}>{p.area}</span></div></div>)}</div>
</div></div>}

{tab==="ranking"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}>
<SL>Top Voluntários da Semana</SL>
{[{pos:1,nome:"Pedro Henrique",pontos:980,portas:420,horas:24,medal:"🥇"},{pos:2,nome:"Lucas Ferreira",pontos:870,portas:0,horas:16,medal:"🥈"},{pos:3,nome:"Marcos Oliveira",pontos:750,portas:280,horas:32,medal:"🥉"},{pos:4,nome:"Juliana Santos",pontos:680,portas:180,horas:28,medal:""},{pos:5,nome:"Carla Mendes",pontos:520,portas:0,horas:20,medal:""}].map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"12px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><div style={{width:28,height:28,borderRadius:8,background:i<3?`${g.am}15`:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?16:11,color:i<3?g.am:g.t4}}>{r.medal||r.pos}</div><div style={{flex:1}}><div style={{fontSize:12,color:g.t1,fontWeight:600}}>{r.nome}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:g.cyan}}>{r.pontos}</div><div style={{fontSize:7,color:g.t4}}>pontos</div></div><div style={{textAlign:"center"}}><div style={{fontSize:11,color:g.t2}}>{r.horas}h</div><div style={{fontSize:7,color:g.t4}}>horas</div></div><div style={{textAlign:"center"}}><div style={{fontSize:11,color:r.portas>0?g.gn:g.t4}}>{r.portas||"—"}</div><div style={{fontSize:7,color:g.t4}}>portas</div></div></div>)}
</div></div>}
</div>;}



/* ══════════ SOCIAL PUBLISHER ══════════ */
function SocialPublisher(){const[tab,setTab]=useState("agendar");const[plat,setPlat]=useState("instagram");
const tabs=[{id:"agendar",label:"Agendar Post",ic:"📅"},{id:"calendario",label:"Calendário Editorial",ic:"📋"},{id:"analytics",label:"Analytics",ic:"📊"}];
const plats=[{id:"instagram",l:"Instagram",ic:"📸",c:"#E1306C"},{id:"tiktok",l:"TikTok",ic:"🎵",c:"#000"},{id:"x",l:"X / Twitter",ic:"𝕏",c:"#1DA1F2"},{id:"facebook",l:"Facebook",ic:"📘",c:"#1877F2"},{id:"youtube",l:"YouTube",ic:"▶️",c:"#FF0000"}];
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Publicação Social</h2><div style={{marginLeft:"auto",display:"flex",gap:6}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Novo Post</button><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Posts agendados",v:"24",d:"esta semana",c:g.cyan},{l:"Publicados hoje",v:"6",d:"de 8 planejados",c:g.gn},{l:"Engajamento médio",v:"4.8%",d:"+1.2% vs semana",c:g.gn},{l:"Melhor horário",v:"19:30",d:"IA recomenda",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>
{tab==="agendar"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"flex",gap:6,marginBottom:14}}>{plats.map(p=><button key={p.id} onClick={()=>setPlat(p.id)} style={{flex:1,...G({padding:"12px 8px",cursor:"pointer",textAlign:"center",border:plat===p.id?`1px solid ${p.c}40`:"1px solid rgba(255,255,255,0.10)",background:plat===p.id?`${p.c}10`:"rgba(255,255,255,0.06)"}),transition:"all .3s"}}><div style={{fontSize:18,marginBottom:4}}>{p.ic}</div><div style={{fontSize:9,fontWeight:600,color:plat===p.id?g.t1:g.t3}}>{p.l}</div></button>)}</div>
<div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Conteúdo do Post</SL><textarea rows={4} placeholder="Escreva o texto do post ou peça à IA..." style={{...g.input,width:"100%",padding:"10px",fontSize:11,boxSizing:"border-box",resize:"vertical",marginBottom:8}}/><div style={{display:"flex",gap:6}}><button style={{flex:1,padding:"8px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>📎 Anexar Mídia</button><button style={{flex:1,padding:"8px",background:g.cg,border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>⚡ Gerar com IA</button></div><div style={{marginTop:10}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Data e Horário</label><input type="datetime-local" style={{...g.input,width:"100%",padding:"8px 10px",fontSize:10,boxSizing:"border-box"}}/></div><div style={{marginTop:6}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Hashtags</label><input placeholder="#campanha #saude #votenojose" style={{...g.input,width:"100%",padding:"8px 10px",fontSize:10,boxSizing:"border-box"}}/></div><div style={{display:"flex",gap:6,marginTop:10}}><button style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}>📅 Agendar</button><button style={{padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:8,color:g.t2,fontSize:10,cursor:"pointer"}}>Publicar Agora</button></div></div>
<div style={G()}><SL>Preview</SL><PhoneMockup type="feed" content="Preview do post aparecerá aqui..."/><div style={{marginTop:10,padding:"8px 10px",borderRadius:8,background:`${g.cyan}08`,border:`1px solid ${g.cyan}15`}}><div style={{fontSize:9,color:g.cyan,fontWeight:600,marginBottom:3}}>💡 Recomendação IA</div><div style={{fontSize:9,color:g.t2,lineHeight:1.6}}>Melhor horário para {plat}: 19:30. Use carrossel para +42% engajamento. Inclua CTA no final.</div></div></div>
</div></div>}
{tab==="calendario"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Calendário Editorial — Próximos 7 dias</SL>{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i)=><div key={i} style={{display:"flex",gap:8,padding:"10px 0",borderBottom:i<6?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{width:40,fontSize:10,fontWeight:700,color:i===0?g.cyan:g.t3}}>{d}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",flex:1}}>{[{p:"📸",t:"Carrossel saúde",h:"09:00"},{p:"🎵",t:"Reels bastidor",h:"12:00"},{p:"𝕏",t:"Thread educação",h:"19:30"}].slice(0,i<5?3:i<6?2:1).map((post,j)=><span key={j} style={{padding:"3px 8px",borderRadius:6,background:"rgba(255,255,255,0.04)",fontSize:8,color:g.t2}}>{post.p} {post.t} · {post.h}</span>)}</div></div>)}</div></div>}
{tab==="analytics"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}><div style={G()}><SL>Engajamento por Plataforma</SL>{[{p:"Instagram",v:4.8,c:"#E1306C"},{p:"TikTok",v:8.1,c:"#000"},{p:"X",v:3.2,c:"#1DA1F2"},{p:"Facebook",v:1.9,c:"#1877F2"},{p:"YouTube",v:6.4,c:"#FF0000"}].map((s,i)=><HBar key={i} label={s.p} value={s.v*10} max={100} color={s.c} delay={i*80}/>)}</div><div style={G()}><SL>Crescimento Semanal</SL><AreaChart data={[1200,1400,1100,1800,2200,1900,2600,2400,3100,2800,3400,3800]} color={g.cyan} h={60} w={280}/></div></div></div>}
</div>;}

/* ══════════ AGENDA DO CANDIDATO ══════════ */
function AgendaCandidato(){const{compromissos:agendaReal,loading:agendaLoad}=useAgenda();const[view,setView]=useState("hoje");
const compromissosMock=[
{hora:"08:00",titulo:"Reunião equipe de campanha",local:"QG Central",tipo:"Reunião",cor:g.cyan,duracao:"1h",briefing:"Pauta: resultados da semana, próximos passos, aprovação de peças"},
{hora:"10:00",titulo:"Gravação vídeo saúde",local:"UBS Vila Mariana",tipo:"Gravação",cor:g.red,duracao:"2h",briefing:"Look casual, tom empático. Dados: 3 UBS inauguradas, 40% mais atendimentos"},
{hora:"13:00",titulo:"Almoço com lideranças zona sul",local:"Restaurante Bela Vista",tipo:"Articulação",cor:g.am,duracao:"1h30",briefing:"Presentes: Ver. Silva, Dep. Costa. Tema: apoio formal. Evitar tema segurança"},
{hora:"15:00",titulo:"Entrevista Rádio CBN",local:"Estúdio CBN SP",tipo:"Mídia",cor:"#E1306C",duracao:"30min",briefing:"Ao vivo. Temas prováveis: saúde, transporte. Adversário A atacou ontem — ter resposta pronta"},
{hora:"17:00",titulo:"Caminhada bairro Penha",local:"Largo da Penha",tipo:"Campo",cor:g.gn,duracao:"2h",briefing:"20 voluntários confirmados. Levar material de saúde. Região com 42% de indecisos"},
{hora:"20:00",titulo:"Live Instagram com Dr. Roberto",local:"Home studio",tipo:"Digital",cor:"#E1306C",duracao:"45min",briefing:"Tema: proposta de saúde. Dr. Roberto é influenciador com 200k. Perguntas abertas do público"}
];
const tipoColor=(t)=>t==="Reunião"?g.cyan:t==="Gravação"?g.red:t==="Articulação"?g.am:t==="Mídia"?"#E1306C":t==="Campo"?g.gn:g.cyan;
const compromissos=agendaReal.length>0?agendaReal.map(c=>({hora:c.hora||c.horario||"—",titulo:c.titulo||c.assunto||"Compromisso",local:c.local||"A definir",tipo:c.tipo||"Reunião",cor:tipoColor(c.tipo||"Reunião"),duracao:c.duracao||"—",briefing:c.briefing_ia||c.briefing||""})):compromissosMock;
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Agenda do Candidato</h2><div style={{marginLeft:"auto",display:"flex",gap:6}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Novo Compromisso</button><button style={{padding:"7px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>📅 Sync Google Calendar</button><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Compromissos hoje",v:"6",d:"próximo: 08:00",c:g.cyan},{l:"Esta semana",v:"28",d:"4/dia média",c:g.gn},{l:"Horas de campanha",v:"62h",d:"esta semana",c:g.am}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{[{id:"hoje",label:"Hoje",ic:"📅"},{id:"semana",label:"Semana",ic:"📋"},{id:"mes",label:"Mês",ic:"🗓️"}].map(t=><button key={t.id} onClick={()=>setView(t.id)} style={{padding:"7px 14px",borderRadius:10,border:view===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:view===t.id?g.cg:"rgba(255,255,255,0.03)",color:view===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{view==="hoje"&&<div style={G()}><SL>Hoje — Segunda-feira</SL>{compromissos.map((c,i)=><div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:i<compromissos.length-1?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"flex-start"}}><div style={{minWidth:50,textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:g.t1}}>{c.hora}</div><div style={{fontSize:8,color:g.t4}}>{c.duracao}</div></div><div style={{width:3,borderRadius:2,background:c.cor,alignSelf:"stretch",flexShrink:0}}/><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:g.t1}}>{c.titulo}</span><Badge color={c.cor}>{c.tipo}</Badge></div><div style={{fontSize:9,color:g.t3,marginBottom:4}}>📍 {c.local}</div><div style={{padding:"6px 10px",borderRadius:8,background:`${c.cor}08`,border:`1px solid ${c.cor}12`}}><div style={{fontSize:8,color:c.cor,fontWeight:600,marginBottom:2}}>📋 Briefing IA</div><div style={{fontSize:9,color:g.t2,lineHeight:1.6}}>{c.briefing}</div></div></div></div>)}</div>}

{view==="semana"&&<div style={G()}><SL>Esta Semana</SL>
{["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"].map((dia,i)=><div key={i} style={{padding:"10px 0",borderBottom:i<6?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,fontWeight:700,color:i===0?g.cyan:g.t2,minWidth:70}}>{dia}</span><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{[["Reunião equipe","Gravação","Almoço lideranças","Entrevista CBN","Caminhada","Live IG"],["Comitê","Gravação TV","Reunião partido"],["DEBATE TV","Preparação","Briefing"],["Comício centro","Entrevistas","Phone banking"],["Panfletagem","Reunião financ.","Gravação rádio"],["Comício Itaquera","Caminhada zona sul"],["Descanso","Live recap"]][i].map((ev,j)=><span key={j} style={{padding:"3px 8px",borderRadius:6,background:ev==="DEBATE TV"?`${g.red}15`:ev.includes("Comício")?`${g.gn}15`:"rgba(255,255,255,0.04)",fontSize:8,color:ev==="DEBATE TV"?g.red:ev.includes("Comício")?g.gn:g.t3}}>{ev}</span>)}</div></div></div>)}</div>}

{view==="mes"&&<div style={G()}><SL>Março 2026</SL><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>{["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d=><div key={d} style={{fontSize:8,color:g.t4,textAlign:"center",padding:"4px 0",fontWeight:600}}>{d}</div>)}{Array.from({length:31},(_, i)=>{const day=i+1;const hasEvent=day%2===0||day%3===0;const isToday=day===24;return<div key={i} style={{textAlign:"center",padding:"6px 2px",borderRadius:6,background:isToday?g.cg:hasEvent?"rgba(255,255,255,0.03)":"transparent",border:isToday?`1px solid ${g.cyan}40`:"1px solid transparent",cursor:"pointer"}}><div style={{fontSize:10,color:isToday?g.cyan:g.t2,fontWeight:isToday?700:400}}>{day}</div>{hasEvent&&<div style={{width:4,height:4,borderRadius:"50%",background:day%6===0?g.red:g.cyan,margin:"2px auto 0"}}/>}</div>})}</div></div>}
</div>;}

/* ══════════ SIMULADOR DE DEBATE ══════════ */
function SimuladorDebate(){const{stats:debStats,iniciar:debIniciar,responder:debResponder,loading:debLoad}=useDebate();const[fase,setFase]=useState("config");const[rodada,setRodada]=useState(0);const[msgs,setMsgs]=useState([]);const[thinking,setThinking]=useState(false);const[inp,setInp]=useState("");
const adversarios=[{nome:"Adversário A",partido:"PXX",estilo:"Agressivo, ataca saúde e segurança",cor:g.am},{nome:"Adversário B",partido:"PYY",estilo:"Técnico, foca em dados econômicos",cor:"#9B59B6"},{nome:"Moderador TV",partido:"Imprensa",estilo:"Perguntas difíceis e diretas",cor:g.cyan}];
const perguntas=["Candidato, o senhor foi acusado de não cumprir promessas na área de saúde. Como responde?","Seus números de investimento em transporte não batem com os dados oficiais. Pode explicar?","O adversário diz que seu plano de educação é inviável financeiramente. O que diz?","Como pretende financiar todas essas propostas sem aumentar impostos?","O senhor perdeu apoio entre os jovens. O que fez de errado?"];
const feedbacks=["✅ Boa resposta! Tom firme sem ser agressivo. Dados concretos fortalecem o argumento.","⚠️ Resposta longa demais. Em debate, seja direto nos primeiros 15 segundos. Termine com proposta.","✅ Excelente uso de storytelling. A história pessoal conecta com o eleitor.","⚠️ Evite atacar diretamente — isso favorece o adversário. Redirecione para suas propostas.","✅ Bom fechamento! O CTA final foi forte."];
const iniciar=(adv)=>{setFase("debate");setRodada(0);setMsgs([{r:"adv",t:perguntas[0],nome:adv.nome}])};
const responder=()=>{if(!inp.trim())return;setMsgs(p=>[...p,{r:"user",t:inp}]);setInp("");setThinking(true);setTimeout(()=>{setThinking(false);const fb=feedbacks[rodada%feedbacks.length];const nextQ=perguntas[(rodada+1)%perguntas.length];setMsgs(p=>[...p,{r:"feedback",t:fb},{r:"adv",t:nextQ,nome:"Adversário"}]);setRodada(r=>r+1)},2000)};
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Simulador de Debate</h2><Badge color={g.red}>Exclusivo CIC</Badge></div>

<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Sessões realizadas",v:"14",d:"este mês",c:g.cyan},{l:"Perguntas respondidas",v:"87",d:"+23 esta semana",c:g.gn},{l:"Score médio",v:"7.4",d:"de 10",c:g.gn},{l:"Tempo total",v:"4.2h",d:"de treino",c:g.am}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
{fase==="config"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{...G({background:`${g.red}06`,border:`1px solid ${g.red}18`,marginBottom:16,textAlign:"center",padding:"24px"})}}>
<div style={{fontSize:32,marginBottom:8}}>⚔️</div><div style={{fontSize:16,fontWeight:700,color:g.t1,marginBottom:4}}>Treine para o debate</div><div style={{fontSize:11,color:g.t2,lineHeight:1.7,maxWidth:400,margin:"0 auto"}}>A IA simula adversários reais com base no monitoramento. Receba perguntas difíceis, responda, e ganhe feedback instantâneo da metodologia Fernando Carreiro.</div></div>
<SL>Escolha o oponente</SL><div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:10}}>{adversarios.map((a,i)=><div key={i} onClick={()=>iniciar(a)} style={{...G({padding:"20px",cursor:"pointer",textAlign:"center",transition:"all .3s"}),":hover":{transform:"translateY(-2px)"}}}><div style={{width:48,height:48,borderRadius:14,background:`${a.cor}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 10px"}}>{"🗣️💼📺"[i]}</div><div style={{fontSize:13,fontWeight:700,color:a.cor}}>{a.nome}</div><div style={{fontSize:9,color:g.t4,marginTop:2}}>{a.partido}</div><div style={{fontSize:9,color:g.t3,marginTop:6,lineHeight:1.5}}>{a.estilo}</div></div>)}</div>
<div style={{...G(),marginTop:14}}><SL>Temas Quentes (do Monitoramento)</SL><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{["Saúde pública","Transporte","Segurança","Educação","Economia","Corrupção","Emprego jovem","Moradia"].map((t,i)=><span key={i} style={{padding:"4px 10px",borderRadius:8,background:i<3?`${g.red}12`:"rgba(255,255,255,0.04)",fontSize:9,color:i<3?g.red:g.t3,fontWeight:i<3?600:400}}>{t}</span>)}</div></div>
</div>}
{fase==="debate"&&<div style={{animation:"fadeUp .3s ease",display:"flex",flexDirection:"column",height:"calc(100vh - 140px)"}}>
<div style={{display:"flex",gap:8,marginBottom:12}}><Badge color={g.am}>Rodada {rodada+1}</Badge><span style={{fontSize:10,color:g.t2}}>Responda como responderia no debate real</span><button onClick={()=>setFase("config")} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,border:`1px solid ${g.red}28`,background:`${g.red}08`,color:g.red,fontSize:9,cursor:"pointer"}}>✕ Encerrar</button></div>
<div style={{flex:1,overflowY:"auto",marginBottom:10}}>{msgs.map((m,i)=><div key={i} style={{marginBottom:10,animation:"fadeUp .3s ease"}}>{m.r==="adv"&&<div style={{display:"flex",gap:8}}><div style={{width:28,height:28,borderRadius:8,background:`${g.am}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>🗣️</div><div style={{...G({borderRadius:"14px 14px 14px 4px",maxWidth:"80%"}),fontSize:11,color:g.t1,lineHeight:1.6}}><div style={{fontSize:8,color:g.am,fontWeight:600,marginBottom:3}}>{m.nome}</div>{m.t}</div></div>}{m.r==="user"&&<div style={{display:"flex",justifyContent:"flex-end"}}><div style={{maxWidth:"78%",padding:"10px 14px",fontSize:11,lineHeight:1.6,color:"#fff",borderRadius:"14px 14px 4px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,boxShadow:`0 4px 14px ${g.rg}`}}>{m.t}</div></div>}{m.r==="feedback"&&<div style={{padding:"8px 12px",borderRadius:10,background:`${g.cyan}08`,border:`1px solid ${g.cyan}15`,margin:"0 40px"}}><div style={{fontSize:8,color:g.cyan,fontWeight:600,marginBottom:2}}>Feedback IA · Fernando Carreiro</div><div style={{fontSize:10,color:g.t2,lineHeight:1.6}}>{m.t}</div></div>}</div>)}{thinking&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:g.cyan,animation:`thinkDot 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}<span style={{fontSize:10,color:g.t3}}>Analisando resposta...</span></div>}</div>
<div style={{display:"flex",gap:6}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&responder()} placeholder="Digite sua resposta ao debate..." style={{...g.input,flex:1,padding:"10px 14px",fontSize:11}}/><button onClick={responder} style={{background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,padding:"10px 18px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Responder</button></div>
</div>}
</div>;}

/* ══════════ RELATÓRIOS ══════════ */
function Relatorios(){const[tabR,setTabR]=useState("gerar");
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Relatórios</h2><div style={{marginLeft:"auto"}}><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Relatório semanal",v:"Seg 08:00",d:"automático",c:g.cyan},{l:"Último gerado",v:"Hoje",d:"24 páginas",c:g.gn},{l:"Enviados",v:"12",d:"este mês",c:g.am}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{[{id:"gerar",label:"Gerar Relatório",ic:"📊"},{id:"historico",label:"Histórico",ic:"📋"},{id:"config",label:"Configurar Envio",ic:"⚙️"}].map(t=><button key={t.id} onClick={()=>setTabR(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tabR===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tabR===t.id?g.cg:"rgba(255,255,255,0.03)",color:tabR===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>

{tabR==="gerar"&&<div style={{animation:"fadeUp .3s ease"}}><SL>Gerar Relatório</SL><div style={{display:"grid",gridTemplateColumns:rg("repeat(3,1fr)","1fr 1fr"),gap:10,marginBottom:14}}>
{[{titulo:"Relatório Semanal",desc:"Resumo completo: monitoramento, produção, CRM, finanças",icon:"📊",cor:g.cyan},{titulo:"Relatório para Partido",desc:"Versão executiva para lideranças e financiadores",icon:"🏛️",cor:g.am},{titulo:"Prestação de Contas",desc:"Formato TSE: receitas, despesas, doadores",icon:"📋",cor:g.gn},{titulo:"Performance Redes",desc:"Métricas de todas as plataformas sociais",icon:"📱",cor:"#E1306C"},{titulo:"Comparativo Adversários",desc:"Análise comparativa de posicionamento e menções",icon:"⚔️",cor:g.red},{titulo:"Relatório Personalizado",desc:"Monte seu relatório escolhendo os módulos",icon:"✨",cor:"#9B59B6"}].map((r,i)=><div key={i} style={{...G({padding:"16px",cursor:"pointer",transition:"all .3s"})}}>
<div style={{fontSize:24,marginBottom:8}}>{r.icon}</div><div style={{fontSize:12,fontWeight:700,color:g.t1,marginBottom:4}}>{r.titulo}</div><div style={{fontSize:9,color:g.t3,lineHeight:1.5,marginBottom:10}}>{r.desc}</div><button style={{width:"100%",padding:"8px",background:`linear-gradient(135deg,${r.cor},${r.cor}CC)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer"}}>📥 Gerar PDF</button></div>)}</div>
</div>}

{tabR==="historico"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Relatórios Gerados</SL>
{[{titulo:"Relatório Semanal — Sem. 12",data:"24/03/2026",paginas:24,formato:"PDF",status:"Enviado"},{titulo:"Prestação de Contas Parcial 2",data:"15/03/2026",paginas:18,formato:"PDF",status:"Enviado"},{titulo:"Performance Redes — Fevereiro",data:"01/03/2026",paginas:12,formato:"PDF + Excel",status:"Enviado"},{titulo:"Comparativo Adversários",data:"22/02/2026",paginas:8,formato:"PDF",status:"Enviado"},{titulo:"Relatório Semanal — Sem. 8",data:"24/02/2026",paginas:22,formato:"PDF",status:"Enviado"},{titulo:"Relatório para Partido",data:"15/02/2026",paginas:16,formato:"PDF",status:"Enviado"}].map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><div style={{width:36,height:36,borderRadius:8,background:`${g.cyan}10`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📄</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:g.t1}}>{r.titulo}</div><div style={{fontSize:8,color:g.t4}}>{r.data} · {r.paginas} páginas · {r.formato}</div></div><Badge color={g.gn}>{r.status}</Badge><button style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${g.cyan}20`,background:`${g.cyan}08`,color:g.cyan,fontSize:9,cursor:"pointer"}}>⬇ Baixar</button></div>)}</div></div>}

{tabR==="config"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Configurar Envio Automático</SL><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Frequência</label><select style={{...g.input,width:"100%",padding:"8px",fontSize:10,boxSizing:"border-box"}}><option>Semanal (segunda)</option><option>Diário</option><option>Quinzenal</option><option>Mensal</option></select></div>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Destinatários</label><input placeholder="email1@, email2@..." style={{...g.input,width:"100%",padding:"8px",fontSize:10,boxSizing:"border-box"}}/></div>
<div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Formato</label><select style={{...g.input,width:"100%",padding:"8px",fontSize:10,boxSizing:"border-box"}}><option>PDF</option><option>PDF + Excel</option><option>Link interativo</option></select></div>
</div><button style={{marginTop:10,padding:"8px 16px",background:g.cg,border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>💾 Salvar Configuração</button></div></div>}
</div>;}

/* ══════════ PESQUISAS / SURVEYS ══════════ */
function PesquisasSurveys(){const[tab,setTab]=useState("criar");
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Pesquisas & Surveys</h2><div style={{marginLeft:"auto",display:"flex",gap:6}}><button style={{padding:"7px 14px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Nova Pesquisa</button><ExportBtn/></div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Pesquisas ativas",v:"3",d:"rodando agora",c:g.gn},{l:"Respostas totais",v:"4.2k",d:"esta semana",c:g.cyan},{l:"Taxa resposta",v:"34%",d:"+8% vs anterior",c:g.gn},{l:"NPS candidato",v:"72",d:"Excelente",c:g.cyan}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"flex",gap:4,marginBottom:14}}>{[{id:"criar",label:"Criar Pesquisa",ic:"📝"},{id:"ativas",label:"Pesquisas Ativas",ic:"📊"},{id:"resultados",label:"Resultados",ic:"📈"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",borderRadius:10,border:tab===t.id?`1px solid ${g.cyan}40`:"1px solid rgba(255,255,255,0.06)",background:tab===t.id?g.cg:"rgba(255,255,255,0.03)",color:tab===t.id?g.t1:g.t3,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{t.ic}</span>{t.label}</button>)}</div>
{tab==="criar"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}><SL>Nova Pesquisa Rápida</SL>
<div style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Título</label><input placeholder="Ex: Qual tema mais importa pra você?" style={{...g.input,width:"100%",padding:"9px",fontSize:11,boxSizing:"border-box"}}/></div>
<div style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Opções de resposta</label>{["Saúde","Transporte","Educação","Segurança"].map((o,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:4}}><input value={o} style={{...g.input,flex:1,padding:"7px",fontSize:10,boxSizing:"border-box"}}/>{i>1&&<button style={{padding:"0 8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:g.red,fontSize:12,cursor:"pointer"}}>×</button>}</div>)}<button style={{padding:"5px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,color:g.cyan,fontSize:9,cursor:"pointer",marginTop:4}}>+ Adicionar opção</button></div>
<div style={{marginBottom:8}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Canal de envio</label><div style={{display:"flex",gap:4}}>{["WhatsApp","SMS","E-mail","Link público"].map((c,i)=><button key={i} style={{padding:"6px 12px",borderRadius:8,background:i===0?g.cg:"rgba(255,255,255,0.04)",border:i===0?`1px solid ${g.cyan}30`:"1px solid rgba(255,255,255,0.08)",color:i===0?g.cyan:g.t3,fontSize:9,cursor:"pointer"}}>{c}</button>)}</div></div>
<div style={{display:"flex",gap:6,marginTop:10}}><button style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}>🚀 Disparar Pesquisa</button><button style={{padding:"10px 14px",background:g.cg,border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>⚡ IA Criar Perguntas</button></div></div></div>}
{tab==="ativas"&&<div style={{animation:"fadeUp .3s ease"}}><div style={G()}>{[{titulo:"Qual tema mais importa?",respostas:1847,canal:"WhatsApp",status:"Ativa",criada:"2 dias"},{titulo:"Avaliação proposta saúde",respostas:923,canal:"SMS",status:"Ativa",criada:"5 dias"},{titulo:"NPS — Recomendaria o candidato?",respostas:1430,canal:"E-mail",status:"Ativa",criada:"7 dias"},{titulo:"Pesquisa bairro Penha",respostas:312,canal:"Link",status:"Encerrada",criada:"14 dias"}].map((p,i)=><div key={i} style={{display:"flex",gap:10,padding:"12px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.04)":"none",alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:g.t1}}>{p.titulo}</div><div style={{fontSize:9,color:g.t4,marginTop:2}}>{p.canal} · Criada há {p.criada}</div></div><div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:g.cyan}}>{p.respostas.toLocaleString("pt-BR")}</div><div style={{fontSize:7,color:g.t4}}>respostas</div></div><Badge color={p.status==="Ativa"?g.gn:g.t3}>{p.status}</Badge></div>)}</div></div>}
{tab==="resultados"&&<div style={{animation:"fadeUp .3s ease"}}><div style={{display:"grid",gridTemplateColumns:rg("1fr 1fr","1fr"),gap:10}}>
<div style={G()}><SL>Qual tema mais importa?</SL>{[{t:"Saúde",v:42,c:g.gn},{t:"Transporte",v:28,c:g.cyan},{t:"Educação",v:18,c:g.am},{t:"Segurança",v:12,c:g.red}].map((r,i)=><HBar key={i} label={r.t} value={r.v} max={50} color={r.c} delay={i*80}/>)}</div>
<div style={G()}><SL>NPS — Recomendaria?</SL><div style={{textAlign:"center"}}><HealthScore score={72}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>{[{l:"Promotores",v:"62%",c:g.gn},{l:"Neutros",v:"22%",c:g.am},{l:"Detratores",v:"16%",c:g.red}].map((s,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:g.t4}}>{s.l}</div></div>)}</div></div>
</div></div>}
</div>;}

/* ══════════ GOTV — DIA DA ELEIÇÃO ══════════ */
function GOTV(){const{status:gotvSt,checklist:gotvCk,loading:gotvLoad,marcar:gotvMarcar}=useGOTV();
return<div style={{animation:"fadeUp .4s ease"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Dia da Eleição</h2><div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:g.red,boxShadow:`0 0 8px ${g.red}60`,animation:"pulse 1.5s infinite"}}/><span style={{fontSize:10,color:g.red,fontWeight:600}}>MODO GOTV</span><ExportBtn/></div></div>
<div style={{...G({background:`${g.red}06`,border:`1px solid ${g.red}18`,marginBottom:16,textAlign:"center",padding:"20px"})}}>
<Countdown/><div style={{fontSize:11,color:g.t2,marginTop:8}}>para a eleição</div></div>
<div style={{display:"grid",gridTemplateColumns:rg("repeat(4,1fr)","1fr 1fr"),gap:8,marginBottom:14}}>{[{l:"Eleitores confirmados",v:gotvSt?.confirmados||"8.4k",d:"que vão votar",c:g.gn},{l:"Já votaram",v:gotvSt?.votaram||"2.1k",d:"25% do total",c:g.cyan},{l:"Falta contactar",v:gotvSt?.falta_contactar||"3.2k",d:"indecisos",c:g.am},{l:"Voluntários ativos",v:gotvSt?.voluntarios_ativos||"184",d:"em campo agora",c:g.gn}].map((m,i)=><div key={i} style={{...G({padding:"12px 10px"}),textAlign:"center"}}><div style={{fontSize:8,color:g.t4,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div><div style={{fontSize:22,fontWeight:700,color:g.t1}}>{m.v}</div><div style={{fontSize:8,color:m.c,marginTop:2}}>{m.d}</div></div>)}</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
<div style={G()}><SL>Checklist Dia D</SL>{(gotvCk.length>0?gotvCk.map(c=>({t:c.titulo||c.t,done:c.concluido??c.done})):[{t:"Material de boca de urna pronto",done:true},{t:"Voluntários posicionados (184/200)",done:true},{t:"Fiscais em todas as seções",done:false},{t:"Transporte para eleitores idosos",done:true},{t:"Central de denúncias ativa",done:false},{t:"Disparo SMS lembrete às 7h",done:true},{t:"Disparo WhatsApp às 10h",done:false},{t:"Apuração em tempo real ativa",done:false}]).map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:i<7?"1px solid rgba(255,255,255,0.04)":"none"}}><div style={{width:18,height:18,borderRadius:5,background:c.done?`${g.gn}15`:"rgba(255,255,255,0.04)",border:`1px solid ${c.done?g.gn+"40":"rgba(255,255,255,0.10)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:g.gn,cursor:"pointer"}}>{c.done?"✓":""}</div><span style={{fontSize:10,color:c.done?g.t2:g.t1,textDecoration:c.done?"line-through":"none"}}>{c.t}</span></div>)}</div>
<div style={G()}><SL>Ações Rápidas</SL><div style={{display:"flex",flexDirection:"column",gap:6}}>
<button style={{width:"100%",padding:"12px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 14px ${g.rg}`}}>📨 Disparar SMS "Não esqueça de votar!"</button>
<button style={{width:"100%",padding:"12px",background:`linear-gradient(135deg,${g.gn},#22B07D)`,color:"#fff",border:"none",borderRadius:10,fontSize:11,fontWeight:600,cursor:"pointer"}}>📱 WhatsApp para indecisos (3.2k)</button>
<button style={{width:"100%",padding:"12px",background:g.cg,border:`1px solid ${g.cyan}30`,borderRadius:10,color:g.cyan,fontSize:11,fontWeight:600,cursor:"pointer"}}>🚗 Acionar transporte para idosos</button>
<button style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:10,color:g.t2,fontSize:11,cursor:"pointer"}}>📊 Ativar painel de apuração</button>
</div><div style={{marginTop:10,...GS({background:`${g.cyan}06`})}}><div style={{fontSize:9,color:g.cyan,fontWeight:600,marginBottom:3}}>💡 IA recomenda agora:</div><div style={{fontSize:9,color:g.t2,lineHeight:1.6}}>Zona Sul tem 42% de indecisos e baixa taxa de contato. Priorize disparos WhatsApp para essa região nas próximas 2 horas.</div></div></div>
</div></div>;}


/* ══════════ CONFIG PAGE ══════════ */
function ConfigPage(){const[cfgUser,setCfgUser]=useState(null);const cfgCid=useAppStore(s=>s.currentCampaign?.id);useEffect(()=>{if(!cfgCid)return;configApi.me().then(d=>setCfgUser(d)).catch(()=>{})},[cfgCid]);
  const[tab,setTab]=useState("perfil");
  const[saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)};
  const inp=(s={})=>({...g.input,width:"100%",padding:"9px 11px",fontSize:11,boxSizing:"border-box",...s});

  return(
    <div style={{animation:"fadeUp .4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
        <Accent/><h2 style={{fontSize:19,fontWeight:700,color:g.t1,margin:0}}>Configurações</h2>
        {saved&&<span style={{marginLeft:"auto",fontSize:10,color:g.gn,background:`${g.gn}12`,padding:"4px 12px",borderRadius:8,animation:"fadeUp .3s ease"}}>✓ Salvo com sucesso</span>}
      </div>

      <div style={{display:"flex",gap:3,marginBottom:16,...GS({padding:3,borderRadius:10})}}>
        {[{id:"perfil",label:"Meu Perfil"},{id:"conta",label:"Conta e Segurança"},{id:"notif",label:"Notificações"},{id:"plano",label:"Plano"},{id:"equipe",label:"Equipe"}].map(t=>
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",border:"none",borderRadius:7,fontSize:10,fontWeight:600,cursor:"pointer",background:tab===t.id?`${g.cyan}15`:"transparent",color:tab===t.id?g.cyan:g.t4,transition:"all .2s"}}>{t.label}</button>
        )}
      </div>

      {tab==="perfil"&&(
        <div style={G({padding:"22px 20px",borderRadius:16})}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${g.red}30,${g.cyan}20)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:g.red}}>FC</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:g.t1}}>Fernando Carreiro</div>
              <div style={{fontSize:11,color:g.t3}}>{cfgUser?.cargo?""+cfgUser.cargo+" · ":"Estrategista-chefe · "}Administrador</div>
              <button style={{marginTop:6,padding:"4px 12px",borderRadius:6,border:`1px solid ${g.cyan}25`,background:`${g.cyan}08`,color:g.cyan,fontSize:9,fontWeight:600,cursor:"pointer"}}>Alterar foto</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Nome completo</label><input defaultValue="Fernando Carreiro" style={inp()}/></div>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>E-mail</label><input defaultValue="fernando@carreiro.com" style={inp()}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Telefone</label><input defaultValue="(11) 99999-0000" style={inp()}/></div>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Cargo</label><input defaultValue="Estrategista-chefe" style={inp()}/></div>
          </div>
          <div style={{marginBottom:16}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Bio</label><textarea defaultValue="20+ anos de experiência em campanhas eleitorais. Especialista em estratégia política e comunicação." rows={3} style={{...g.input,width:"100%",padding:"10px 12px",fontSize:11,boxSizing:"border-box",resize:"vertical"}}/></div>
          <button onClick={save} style={{padding:"10px 24px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 16px ${g.rg}`}}>Salvar alterações</button>
        </div>
      )}

      {tab==="conta"&&(
        <div style={G({padding:"22px 20px",borderRadius:16})}>
          <SL>Alterar Senha</SL>
          <div style={{marginBottom:12}}><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Senha atual</label><input type="password" placeholder="••••••••" style={inp()}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Nova senha</label><input type="password" placeholder="••••••••" style={inp()}/></div>
            <div><label style={{fontSize:9,color:g.t3,display:"block",marginBottom:3}}>Confirmar nova senha</label><input type="password" placeholder="••••••••" style={inp()}/></div>
          </div>
          <button onClick={save} style={{padding:"10px 24px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:20}}>Atualizar senha</button>

          <SL>Sessões Ativas</SL>
          {[{device:"Chrome · MacOS",loc:"São Paulo, SP",time:"Agora",active:true},{device:"Safari · iPhone",loc:"São Paulo, SP",time:"Há 2 horas",active:false},{device:"App CIC · Android",loc:"Belo Horizonte, MG",time:"Ontem",active:false}].map((s,i)=>
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:s.active?g.gn:g.t4,boxShadow:s.active?`0 0 6px ${g.gn}60`:"none"}}/>
              <div style={{flex:1}}><div style={{fontSize:10,fontWeight:600,color:g.t1}}>{s.device}</div><div style={{fontSize:8,color:g.t4}}>{s.loc} · {s.time}</div></div>
              {!s.active&&<button style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${g.red}25`,background:`${g.red}08`,color:g.red,fontSize:8,cursor:"pointer"}}>Encerrar</button>}
            </div>
          )}

          <div style={{marginTop:20,padding:14,borderRadius:10,border:`1px solid ${g.red}20`,background:`${g.red}06`}}>
            <div style={{fontSize:11,fontWeight:600,color:g.red,marginBottom:4}}>Zona de perigo</div>
            <div style={{fontSize:10,color:g.t3,marginBottom:8}}>Ações irreversíveis que afetam sua conta</div>
            <button style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${g.red}30`,background:`${g.red}10`,color:g.red,fontSize:10,fontWeight:600,cursor:"pointer"}}>Excluir minha conta</button>
          </div>
        </div>
      )}

      {tab==="notif"&&(
        <div style={G({padding:"22px 20px",borderRadius:16})}>
          <SL>Preferências de Notificação</SL>
          {[
            {t:"Alertas urgentes",d:"Ataques, crises e menções críticas",on:true},
            {t:"Novas pesquisas",d:"Quando uma pesquisa eleitoral for registrada",on:true},
            {t:"Conteúdos aprovados",d:"Quando conteúdos forem publicados",on:false},
            {t:"Briefing diário",d:"Resumo matinal gerado pela IA",on:true},
            {t:"Atualizações do sistema",d:"Novidades e melhorias na plataforma",on:false},
          ].map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <div><div style={{fontSize:11,fontWeight:600,color:g.t1}}>{n.t}</div><div style={{fontSize:9,color:g.t4}}>{n.d}</div></div>
              <div style={{width:36,height:20,borderRadius:10,background:n.on?g.cyan:"rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",transition:"all .3s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:n.on?18:2,transition:"all .3s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
              </div>
            </div>
          ))}
          <button onClick={save} style={{marginTop:14,padding:"10px 24px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>Salvar preferências</button>
        </div>
      )}

      {tab==="plano"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              {name:"Essencial",price:"R$ 2.900",period:"/mês",features:["1 campanha ativa","Dashboard + Diagnóstico","Monitoramento básico","50 gerações IA/mês","Suporte por e-mail"],color:g.t3,current:false},
              {name:"Profissional",price:"R$ 5.900",period:"/mês",features:["Até 5 campanhas","Todos os módulos","Monitoramento em tempo real","Gerações IA ilimitadas","Mapa eleitoral","Suporte prioritário"],color:g.cyan,current:true},
              {name:"Enterprise",price:"Sob consulta",period:"",features:["Campanhas ilimitadas","API dedicada","IA personalizada","Treinamento equipe","Consultor estratégico","SLA garantido"],color:g.red,current:false},
            ].map((plan,i)=>(
              <div key={i} style={{...G({padding:"20px 16px",borderRadius:16,position:"relative",overflow:"hidden",border:plan.current?`1px solid ${plan.color}30`:"1px solid rgba(255,255,255,0.08)"})}}>
                {plan.current&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:plan.color,boxShadow:`0 0 10px ${plan.color}40`}}/>}
                {plan.current&&<Badge color={plan.color}>Plano atual</Badge>}
                <div style={{fontSize:16,fontWeight:700,color:g.t1,marginTop:plan.current?8:0,marginBottom:2}}>{plan.name}</div>
                <div style={{marginBottom:14}}><span style={{fontSize:22,fontWeight:800,color:plan.color}}>{plan.price}</span><span style={{fontSize:10,color:g.t4}}>{plan.period}</span></div>
                {plan.features.map((f,j)=>
                  <div key={j} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",fontSize:10,color:g.t2}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:plan.color}}/>
                    {f}
                  </div>
                )}
                <button style={{width:"100%",marginTop:14,padding:"9px",borderRadius:8,border:plan.current?`1px solid ${plan.color}30`:`1px solid rgba(255,255,255,0.08)`,background:plan.current?`${plan.color}10`:"rgba(255,255,255,0.03)",color:plan.current?plan.color:g.t2,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                  {plan.current?"Plano ativo":"Upgrade"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="equipe"&&(
        <div style={{animation:"fadeUp .3s ease"}}>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            <button style={{padding:"8px 16px",background:`linear-gradient(135deg,${g.red},#CC1E1E)`,color:"#fff",border:"none",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 12px ${g.rg}`}}>+ Convidar Membro</button>
            <button style={{padding:"8px 16px",background:"rgba(255,255,255,0.06)",border:`1px solid ${g.cyan}30`,borderRadius:8,color:g.cyan,fontSize:10,fontWeight:600,cursor:"pointer"}}>Gerenciar Perfis</button>
          </div>
          <div style={G({padding:"18px 16px",borderRadius:16,marginBottom:14})}>
            <SL>Equipe — 9 Membros</SL>
            {TEAM.map((m,i)=>(
              <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<TEAM.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${m.cor}30,${m.cor}15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:m.cor,position:"relative"}}>
                  {m.initials}
                  <div style={{position:"absolute",bottom:-1,right:-1,width:10,height:10,borderRadius:"50%",background:m.online?g.gn:g.t4,border:"2px solid #1a1a24",boxShadow:m.online?`0 0 6px ${g.gn}60`:"none"}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:g.t1}}>{m.name}</div>
                  <div style={{fontSize:9,color:g.t4}}>{m.role} · {m.email}</div>
                </div>
                <Badge color={PERFIS[m.perfil].cor}>{PERFIS[m.perfil].label}</Badge>
                <div style={{textAlign:"center"}}><div style={{fontSize:9,color:m.online?g.gn:g.t4,fontWeight:600}}>{m.online?"Online":"Offline"}</div><div style={{fontSize:7,color:g.t4}}>{m.ultimoAcesso||""}</div></div>
                <div style={{display:"flex",gap:3}}><button style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${g.cyan}20`,background:`${g.cyan}08`,color:g.cyan,fontSize:9,cursor:"pointer"}}>Editar</button><button style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:g.t4,fontSize:9,cursor:"pointer"}}>Permissões</button></div>
              </div>
            ))}
          </div>
          <div style={G({padding:"18px 16px",borderRadius:16,marginBottom:14})}>
            <SL>Perfis de Acesso</SL>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {Object.entries(PERFIS).map(([key,p])=>(
                <div key={key} style={{...GS({padding:"14px"})}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:p.cor}}/>
                    <span style={{fontSize:11,fontWeight:600,color:p.cor}}>{p.label}</span>
                  </div>
                  <div style={{fontSize:9,color:g.t3,lineHeight:1.5,marginBottom:4}}>{p.desc}</div><div style={{fontSize:7,color:p.cor,marginBottom:6}}>{p.perms}</div>
                  <div style={{fontSize:8,color:g.t4}}>
                    {TEAM.filter(m=>m.perfil===key).map(m=>m.name.split(" ")[0]).join(", ")||"Nenhum"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={G({padding:"18px 16px",borderRadius:16})}>
            <SL>Matriz de Acesso por Módulo</SL>
            <div style={{display:"grid",gridTemplateColumns:"2fr repeat(9,1fr)",overflowX:"auto",minWidth:600,gap:2,marginBottom:8}}>
              <div style={{fontSize:8,color:g.t4,fontWeight:600}}>Módulo</div>
              {TEAM.map(m=><div key={m.id} style={{fontSize:7,color:m.cor,fontWeight:700,textAlign:"center"}}>{m.initials}</div>)}
            </div>
            {[{mod:"Dashboard",key:"dash"},{mod:"Demandas",key:"demandas"},{mod:"Diagnóstico",key:"diag"},{mod:"Monitoramento",key:"mon"},{mod:"CRM Eleitores",key:"crm"},{mod:"Arrecadação",key:"fund"},{mod:"Comunicação",key:"comm"},{mod:"Voluntários",key:"vol"},{mod:"Produção IA",key:"prod"},{mod:"Publicação Social",key:"social"},{mod:"Agenda",key:"agenda"},{mod:"Simulador Debate",key:"debate"},{mod:"Relatórios",key:"relat"},{mod:"Pesquisas",key:"pesq"},{mod:"Dia da Eleição",key:"gotv"},{mod:"Mapa Eleitoral",key:"mapa"},{mod:"Estratégica",key:"estr"},{mod:"Assistente IA",key:"ia"}].map((mod,i)=>(
              <div key={mod.key} style={{display:"grid",gridTemplateColumns:"2fr repeat(9,1fr)",overflowX:"auto",minWidth:600,gap:2,padding:"5px 0",borderBottom:i<17?"1px solid rgba(255,255,255,0.03)":"none",alignItems:"center"}}>
                <span style={{fontSize:9,color:g.t2}}>{mod.mod}</span>
                {TEAM.map(m=>{
                  const has=m.modulos==="todos"||m.modulos.split(",").includes(mod.key);
                  return<div key={m.id} style={{textAlign:"center",fontSize:11,color:has?g.gn:"rgba(255,255,255,0.08)"}}>
                    {has?<span style={{textShadow:`0 0 6px ${g.gn}40`}}>✓</span>:"—"}
                  </div>
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════ ONBOARDING ══════════ */
function Onboarding({onFinish}){
  const[step,setStep]=useState(0);
  const steps=[
    {title:"Bem-vindo ao CIC!",desc:"Seu centro virtual de inteligência de campanha. Aqui você vai monitorar, produzir e decidir tudo em tempo real.",icon:"🎯",color:g.red},
    {title:"Dashboard Inteligente",desc:"Acompanhe a saúde da campanha, intenção de voto, sentimento nas redes e contagem regressiva para a eleição.",icon:"📊",color:g.cyan},
    {title:"Produção com IA",desc:"Gere fotos, jingles, roteiros, locuções e flyers com inteligência artificial treinada na metodologia Fernando Carreiro.",icon:"⚡",color:g.am},
    {title:"Monitoramento 24/7",desc:"Receba alertas em tempo real sobre ataques, pautas emergentes e o que seus adversários estão fazendo.",icon:"🔔",color:g.gn},
    {title:"Tudo pronto!",desc:"Sua campanha começa agora. Explore cada módulo e conte com a IA do CIC para tomar as melhores decisões.",icon:"🚀",color:g.red},
  ];
  const s=steps[step];
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(16px)",animation:"fadeIn .4s ease"}}>
      <div style={{width:420,animation:"fadeUp .5s ease"}}>
        <div style={{...G({padding:"36px 30px",borderRadius:24,textAlign:"center"})}}>
          <div style={{fontSize:48,marginBottom:16}}>{s.icon}</div>
          <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:20}}>
            {steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:4,borderRadius:2,background:i===step?s.color:"rgba(255,255,255,0.1)",transition:"all .4s",boxShadow:i===step?`0 0 8px ${s.color}40`:"none"}}/>)}
          </div>
          <h2 style={{fontSize:20,fontWeight:700,color:g.t1,marginBottom:8}}>{s.title}</h2>
          <p style={{fontSize:12,color:g.t2,lineHeight:1.7,marginBottom:28,maxWidth:320,margin:"0 auto 28px"}}>{s.desc}</p>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {step>0&&<button onClick={()=>setStep(step-1)} style={{padding:"10px 20px",borderRadius:10,border:`1px solid rgba(255,255,255,0.08)`,background:"rgba(255,255,255,0.03)",color:g.t2,fontSize:12,cursor:"pointer"}}>Voltar</button>}
            <button onClick={()=>step<steps.length-1?setStep(step+1):onFinish()} style={{padding:"10px 28px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${s.color},${s.color}CC)`,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:`0 4px 16px ${s.color}30`}}>
              {step<steps.length-1?"Próximo":"Começar"}
            </button>
          </div>
          <button onClick={onFinish} style={{marginTop:14,background:"none",border:"none",color:g.t4,fontSize:10,cursor:"pointer"}}>Pular tour</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
const[scr,setScr]=useState(()=>{try{const t=localStorage.getItem('cic_token');const u=localStorage.getItem('cic_user');const c=localStorage.getItem('cic_campaign');if(t&&u)return c?"app":"camps"}catch{}return"login"});
const[act,setAct]=useState("dash");
const[camp,setCamp]=useState(()=>{try{return JSON.parse(localStorage.getItem('cic_campaign')||'null')}catch{return null}});const[col,setCol]=useState(false);const[fullscreen,setFullscreen]=useState(false);const[transitioning,setTransitioning]=useState(false);const[showNotif,setShowNotif]=useState(false);const[showOnboarding,setShowOnboarding]=useState(false);
const[mob,setMob]=useState(window.innerWidth<768);
const[mobMenu,setMobMenu]=useState(false);
useEffect(()=>{const h=()=>{setMob(window.innerWidth<768);if(window.innerWidth>=768)setMobMenu(false)};window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h)},[]);
const { theme, persona, modulesEnabled } = useTheme();
const MOB_NAV=["dash","ia","estr","agenda"];
const isSadmin = window.location.pathname==='/sadmin';

const switchPanel=(id)=>{setTransitioning(true);setMobMenu(false);setTimeout(()=>{setAct(id);setTransitioning(false)},200)};

const icons={dash:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,diag:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,mon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,prod:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,estr:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,ia:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>,mapa:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>,config:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"/><circle cx="12" cy="12" r="3"/></svg>};

const CSS=<style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
@keyframes loginFloat{0%,100%{transform:translateY(0) translateX(0);opacity:0.3}25%{transform:translateY(-30px) translateX(15px);opacity:0.6}50%{transform:translateY(-10px) translateX(-10px);opacity:0.2}75%{transform:translateY(-25px) translateX(20px);opacity:0.5}}
@keyframes loginGrid{0%{transform:translate(0,0)}100%{transform:translate(80px,80px)}}
@keyframes loginLogoPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.3);opacity:0.8}}
@keyframes loginCardShimmer{0%{transform:translateX(-200%)}50%{transform:translateX(200%)}100%{transform:translateX(200%)}}
@keyframes loginBtnShimmer{0%{left:-100%}50%{left:150%}100%{left:150%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes thinkDot{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-4px)}}
@keyframes skeletonPulse{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes od1{0%{transform:translate(0,0) scale(1)}25%{transform:translate(80px,50px) scale(1.05)}50%{transform:translate(40px,90px) scale(.95)}75%{transform:translate(-30px,40px) scale(1.03)}100%{transform:translate(0,0) scale(1)}}
@keyframes od2{0%{transform:translate(0,0) scale(1)}25%{transform:translate(-60px,-40px) scale(1.04)}50%{transform:translate(-20px,-80px) scale(.96)}75%{transform:translate(40px,-30px) scale(1.02)}100%{transform:translate(0,0) scale(1)}}
@keyframes od3{0%{transform:translate(0,0);opacity:.7}33%{transform:translate(100px,-60px);opacity:1}66%{transform:translate(-40px,70px);opacity:.6}100%{transform:translate(0,0);opacity:.7}}
@keyframes od4{0%{transform:translate(0,0);opacity:.6}50%{transform:translate(-70px,50px);opacity:1}100%{transform:translate(0,0);opacity:.6}}
@keyframes gf{0%{transform:translateY(0)}100%{transform:translateY(44px)}}
@keyframes gfh{0%{transform:translateX(0)}100%{transform:translateX(44px)}}
@keyframes ls{0%{left:-100%;opacity:0}10%{opacity:1}50%{left:150%;opacity:1}60%{opacity:0}100%{left:150%;opacity:0}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes emptyFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Outfit',sans-serif}

/* ── MOBILE-FIRST RESPONSIVE ── */
@media(max-width:767px){
  /* Grid overrides: collapse multi-column grids to 1 or 2 cols */
  [style*="gridTemplateColumns"]{grid-template-columns:1fr !important}
  [style*="repeat(4"]{grid-template-columns:repeat(2,1fr) !important}
  [style*="repeat(3"]{grid-template-columns:repeat(2,1fr) !important}
  [style*="repeat(2"]{grid-template-columns:1fr !important}

  /* KPI stat rows wrap gracefully */
  .kpi-row{flex-wrap:wrap;gap:8px !important}
  .kpi-row>*{flex:1 1 calc(50% - 8px);min-width:120px}

  /* Cards: full width, reduced padding */
  .glass-card{padding:12px !important;border-radius:12px !important}

  /* Horizontal scroll for tables */
  table{display:block;overflow-x:auto;white-space:nowrap;width:100%}

  /* Typography scale-down */
  h1,h2{font-size:clamp(14px,4vw,20px) !important}
  h3{font-size:clamp(12px,3.5vw,16px) !important}

  /* Module header stat blocks */
  .mod-header{flex-direction:column !important;gap:10px !important;align-items:flex-start !important}
  .mod-stats{flex-wrap:wrap;gap:6px !important}
  .mod-stats>*{flex:1 1 calc(50% - 6px);min-width:100px}

  /* Flex rows that should stack on mobile */
  .mob-stack{flex-direction:column !important;gap:8px !important}
  .mob-stack>*{width:100% !important;min-width:0 !important}

  /* Search/filter bars */
  .filter-bar{flex-wrap:wrap !important;gap:6px !important}
  .filter-bar>input,.filter-bar>select{width:100% !important;box-sizing:border-box}

  /* Charts fill container */
  .recharts-responsive-container{min-height:160px}

  /* Touch-friendly buttons */
  button{min-height:40px;min-width:40px}

  /* Tabs: scroll horizontally */
  .tab-row{overflow-x:auto;-webkit-overflow-scrolling:touch;flex-wrap:nowrap !important;padding-bottom:2px}
  .tab-row::-webkit-scrollbar{display:none}

  /* Chat: full width input area */
  .chat-input-row{flex-direction:column;gap:6px}
  .chat-input-row>input,.chat-input-row>textarea{width:100% !important}
  .chat-input-row>button{width:100%;justify-content:center}
}

@media(max-width:480px){
  [style*="repeat(2"]{grid-template-columns:1fr !important}
  .mod-stats>*{flex:1 1 100%}
}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06);border-radius:2px}
button,input,select,textarea{font-family:inherit}
input::placeholder,textarea::placeholder{color:#4A463F}

/* Focus glow on inputs */
input:focus,select:focus,textarea:focus{
  border-color:rgba(0,229,255,0.35) !important;
  box-shadow:0 0 12px rgba(0,229,255,0.12),0 0 4px rgba(0,229,255,0.08) !important;
  transition:all .4s ease !important;
}

/* Shimmer on buttons */
button{position:relative;overflow:hidden;transition:all .5s cubic-bezier(.25,.1,.25,1)}
button::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,.03) 35%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 65%,transparent 80%);background-size:250% 100%;opacity:0;transition:opacity .8s;pointer-events:none;border-radius:inherit}
button:hover::after{opacity:1;animation:shimmer 3.5s cubic-bezier(.4,0,.2,1) infinite}
button:hover{transform:translateY(-.5px)}
button:active{transform:translateY(0) scale(.99);transition:all .15s}

/* Tooltip for collapsed sidebar */
.sb-btn{position:relative}
.sb-btn .sb-tip{position:absolute;left:100%;top:50%;transform:translateY(-50%);margin-left:10px;padding:4px 10px;border-radius:6px;background:rgba(20,20,28,0.92);border:1px solid rgba(255,255,255,0.1);color:#F0EDE8;font-size:10px;font-weight:500;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;transform:translateY(-50%) translateX(-4px);backdrop-filter:blur(12px);z-index:99}
.sb-btn:hover .sb-tip{opacity:1;transform:translateY(-50%) translateX(0)}

/* Card hover */
.glass-card{transition:all .4s cubic-bezier(.25,.1,.25,1)}
.glass-card:hover{border-color:rgba(255,255,255,0.18) !important;box-shadow:0 4px 24px rgba(0,0,0,0.2),0 0 12px rgba(0,229,255,0.04);transform:translateY(-1px)}

/* Skeleton loading */
.skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%);background-size:200% 100%;animation:skeletonPulse 2s ease infinite;border-radius:6px}

/* Panel transition */
.panel-wrap{transition:opacity .25s ease,transform .25s ease}
.panel-wrap.out{opacity:0;transform:translateY(6px)}
`}

</style>;

// ── /sadmin route ─────────────────────────────────────────────────────────
if(isSadmin){
  const saToken=localStorage.getItem('cic_token');
  if(!saToken)return<>{CSS}<GlassBG/><div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}><div style={{fontSize:10,color:"rgba(6,182,212,0.7)",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>⚡ ADMIN ACCESS</div><LoginConnected onSuccess={()=>window.location.reload()}/></div></>;
  return<SuperAdmin token={saToken} onLogout={()=>{localStorage.removeItem('cic_token');localStorage.removeItem('cic_user');window.location.href='/'}}/>;
}

if(scr==="login")return<>{CSS}<GlassBG/><div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><LoginConnected onSuccess={()=>setScr("camps")}/></div></>;
if(scr==="camps")return<>{CSS}<GlassBG/><div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><h2 style={{color:"#F0EDE8",fontSize:18,fontWeight:700,marginBottom:16}}>Selecione a campanha</h2><div style={{width:400}}><CampaignSelectorConnected onSelect={c=>{setCamp(c);setScr("app");setShowOnboarding(true)}}/></div></div></>;

const modOk=(id)=>!modulesEnabled||modulesEnabled.includes(id);
const ModLock=({id})=>{const m=MODS.find(x=>x.id===id);return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:12}}><div style={{fontSize:36,opacity:.3}}>🔒</div><div style={{fontSize:15,fontWeight:700,color:g.t1}}>{m?.label||id}</div><div style={{fontSize:11,color:g.t3,maxWidth:320,textAlign:"center",lineHeight:1.6}}>Este módulo não está incluído no seu plano atual. Entre em contato com o suporte para desbloquear.</div></div>);};
const panel=()=>{switch(act){case"dash":return<Dash camp={camp}/>;case"demandas":return modOk("demandas")?<CentralDemandas/>:<ModLock id="demandas"/>;case"diag":return modOk("diag")?<Diag/>:<ModLock id="diag"/>;case"mon":return modOk("mon")?<Mon/>:<ModLock id="mon"/>;case"crm":return modOk("crm")?<CRMEleitores/>:<ModLock id="crm"/>;case"fund":return modOk("fund")?<Fundraising/>:<ModLock id="fund"/>;case"comm":return modOk("comm")?<Comunicacao/>:<ModLock id="comm"/>;case"vol":return modOk("vol")?<Voluntarios/>:<ModLock id="vol"/>;case"prod":return modOk("prod")?<Prod/>:<ModLock id="prod"/>;case"social":return modOk("social")?<SocialPublisher/>:<ModLock id="social"/>;case"agenda":return modOk("agenda")?<AgendaCandidato/>:<ModLock id="agenda"/>;case"debate":return modOk("debate")?<SimuladorDebate/>:<ModLock id="debate"/>;case"relat":return modOk("relat")?<Relatorios/>:<ModLock id="relat"/>;case"pesq":return modOk("pesq")?<PesquisasSurveys/>:<ModLock id="pesq"/>;case"gotv":return modOk("gotv")?<GOTV/>:<ModLock id="gotv"/>;case"mapa":return modOk("mapa")?<MapaEleitoral/>:<ModLock id="mapa"/>;case"estr":return modOk("estr")?<Estr/>:<ModLock id="estr"/>;case"ia":return modOk("ia")?<IARealChat/>:<ModLock id="ia"/>;case"config":return<ConfigPage/>;default:return<Dash camp={camp}/>}};

if(fullscreen)return<div style={{height:"100vh",width:"100vw",overflow:"auto",padding:"24px 32px",color:g.t1,position:"relative"}}>{CSS}<GlassBG/><div style={{position:"relative",zIndex:1}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10}}><CICLogo size={28}/><span style={{fontSize:16,fontWeight:700,color:g.t1}}>{camp?.name}</span><Badge color={camp?.color||g.red}>{camp?.cargo}</Badge></div><button onClick={()=>setFullscreen(false)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.04)",color:g.t2,fontSize:10,cursor:"pointer"}}>✕ Sair do modo apresentação</button></div>{panel()}</div></div>;

return(
<div style={{display:"flex",height:"100vh",width:"100vw",color:g.t1,overflow:"hidden",position:"relative"}}>
{CSS}<GlassBG/>

{/* SIDEBAR — hidden on mobile, uses bottom nav instead */}
<div style={{...g.sidebar,width:mob?0:col?52:190,minWidth:mob?0:col?52:190,height:"100vh",display:mob?"none":"flex",flexDirection:"column",transition:"all .3s ease",zIndex:2,overflow:"hidden"}}>
<div onClick={()=>setCol(!col)} style={{padding:col?"12px 8px":"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
<div style={{filter:"drop-shadow(0 2px 8px rgba(255,45,45,0.2))"}}><CICLogo size={col?28:30}/></div>
{!col&&<span style={{fontSize:12,fontWeight:700,color:g.t1}}>CIC <span style={{fontSize:9,color:g.t4,fontWeight:400}}>v4</span></span>}
</div>

{!col&&camp&&<div onClick={()=>setScr("camps")} style={{margin:"8px 8px 0",padding:"8px 10px",borderRadius:8,background:g.rg,border:`1px solid ${g.red}15`,cursor:"pointer"}}>
<div style={{fontSize:10,fontWeight:600,color:g.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{camp.name}</div>
<div style={{fontSize:8,color:g.t3}}>{camp.cargo} · <span style={{color:g.cyan}}>Trocar</span></div>
</div>}

<div style={{flex:1,padding:"8px 5px"}}>
{MODS.map(m=>(
<button key={m.id} className="sb-btn" onClick={()=>switchPanel(m.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:col?"9px 0":"9px 10px",justifyContent:col?"center":"flex-start",border:"none",borderRadius:8,background:act===m.id?"rgba(255,255,255,0.08)":"transparent",color:act===m.id?g.t1:g.t4,fontSize:11,fontWeight:act===m.id?600:400,cursor:"pointer",marginBottom:1,position:"relative"}}>
{act===m.id&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:16,borderRadius:2,background:g.red,boxShadow:`0 0 8px ${g.rg}`}}/>}
<span style={{display:"flex",alignItems:"center",justifyContent:"center",width:16}}>{icons[m.id]}</span>
{!col&&<span>{m.label}</span>}
{col&&<span className="sb-tip">{m.label}</span>}
</button>
))}
</div>

{/* Fullscreen button */}
{!col&&<div style={{padding:"6px 8px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
<button onClick={()=>setFullscreen(true)} style={{width:"100%",padding:"7px",borderRadius:6,border:`1px solid rgba(255,255,255,0.06)`,background:"rgba(255,255,255,0.02)",color:g.t3,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
Apresentação
</button>
</div>}

{!col&&<div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:8}}>
<div style={{filter:"drop-shadow(0 1px 4px rgba(255,45,45,0.15))"}}><CICLogo size={22}/></div>
<div><div style={{fontSize:10,fontWeight:600,color:g.t2}}>Fernando Carreiro</div><div style={{fontSize:8,color:g.t4}}>Estrategista-chefe</div></div>
</div>}
</div>

{/* MAIN CONTENT */}
<div style={{flex:1,overflow:"auto",padding:mob?"12px 10px 80px":"16px 20px",position:"relative",zIndex:1}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<div style={{fontSize:10,color:g.t4}}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<input placeholder="Buscar..." style={{...g.input,padding:"6px 12px",fontSize:10,width:150}}/>
<div onClick={()=>setShowNotif(!showNotif)} style={{position:"relative",width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={g.t2} strokeWidth="1.8"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
<div style={{position:"absolute",top:-2,right:-2,width:14,height:14,borderRadius:"50%",background:g.red,border:"2px solid #060610",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#fff",fontWeight:700}}>2</div>
</div>
</div>
</div>
<div className={`panel-wrap ${transitioning?"out":""}`} style={{animation:transitioning?"none":"slideIn .35s ease"}}>
{panel()}
</div>
</div>
<NotifPanel show={showNotif} onClose={()=>setShowNotif(false)}/>
{showOnboarding&&<Onboarding onFinish={()=>setShowOnboarding(false)}/>}

{/* MOBILE "MAIS" MODULE SHEET */}
{mob&&mobMenu&&<div onClick={()=>setMobMenu(false)} style={{position:"fixed",inset:0,zIndex:45,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)"}}>
<div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:64,left:0,right:0,background:"rgba(10,10,20,0.97)",backdropFilter:"blur(30px)",borderTop:"1px solid rgba(255,255,255,0.1)",padding:"16px 12px",maxHeight:"65vh",overflowY:"auto"}}>
<div style={{fontSize:9,color:g.t4,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10,paddingLeft:4}}>Todos os módulos</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
{MODS.filter(m=>!MOB_NAV.includes(m.id)).map(m=>(
<button key={m.id} onClick={()=>{switchPanel(m.id);setMobMenu(false)}} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:"12px 6px",borderRadius:10,border:`1px solid ${act===m.id?"rgba(0,229,255,0.3)":"rgba(255,255,255,0.07)"}`,background:act===m.id?"rgba(0,229,255,0.08)":"rgba(255,255,255,0.03)",color:act===m.id?g.cyan:g.t2,cursor:"pointer",fontSize:9,fontWeight:act===m.id?600:400,textAlign:"center",lineHeight:1.3}}>
<span style={{display:"flex",alignItems:"center",justifyContent:"center",opacity:0.85}}>{icons[m.id]||<span style={{fontSize:13}}>{m.ic}</span>}</span>
{m.label}
</button>
))}
</div>
{camp&&<div onClick={()=>{setMobMenu(false);setScr("camps")}} style={{marginTop:12,padding:"10px",borderRadius:8,background:"rgba(255,45,45,0.07)",border:"1px solid rgba(255,45,45,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
<div><div style={{fontSize:10,fontWeight:600,color:g.t1}}>{camp.name}</div><div style={{fontSize:8,color:g.t3}}>{camp.cargo}</div></div>
<span style={{fontSize:9,color:g.red}}>Trocar →</span>
</div>}
</div>
</div>}

{/* MOBILE BOTTOM NAVIGATION */}
{mob&&<nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:"rgba(8,8,18,0.94)",backdropFilter:"blur(24px) saturate(180%)",WebkitBackdropFilter:"blur(24px) saturate(180%)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"stretch",height:60,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
{[
{id:"dash",label:"Dashboard",icon:icons.dash},
{id:"ia",label:"IA",icon:icons.ia},
{id:"estr",label:"Estratégia",icon:icons.estr},
{id:"agenda",label:"Agenda",icon:icons.agenda},
].map(t=>(
<button key={t.id} onClick={()=>{switchPanel(t.id);setMobMenu(false)}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",color:act===t.id&&!mobMenu?g.cyan:g.t4,cursor:"pointer",fontSize:8,fontWeight:act===t.id&&!mobMenu?600:400,padding:"6px 2px",position:"relative",minHeight:44,WebkitTapHighlightColor:"transparent"}}>
{act===t.id&&!mobMenu&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,borderRadius:2,background:g.cyan,boxShadow:`0 0 8px ${g.cyan}80`}}/>}
<span style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{t.icon}</span>
{t.label}
</button>
))}
<button onClick={()=>setMobMenu(!mobMenu)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",color:mobMenu||(!MOB_NAV.includes(act))?g.cyan:g.t4,cursor:"pointer",fontSize:8,fontWeight:600,padding:"6px 2px",position:"relative",minHeight:44,WebkitTapHighlightColor:"transparent"}}>
{(mobMenu||!MOB_NAV.includes(act))&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,borderRadius:2,background:g.cyan,boxShadow:`0 0 8px ${g.cyan}80`}}/>}
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="5" cy="5" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="19" cy="5" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="19" r="1.5"/><circle cx="12" cy="19" r="1.5"/><circle cx="19" cy="19" r="1.5"/></svg>
Mais
</button>
</nav>}

</div>
);}
