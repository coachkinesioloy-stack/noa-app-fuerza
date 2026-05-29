'use client'
// ═══════════════════════════════════════════════════
// NOAH v2.0 — Never Over, Always Higher
// Auth real · Panel Coach · Planificador · Calendario
// ═══════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────
// SUPABASE CLIENT (lazy load)
// ─────────────────────────────────────────
let _sb = null;
async function getSB() {
  if (_sb) return _sb;
  if (typeof window === "undefined") return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    _sb = createClient(url, key);
    return _sb;
  } catch { return null; }
}

// ─────────────────────────────────────────
// GROQ
// ─────────────────────────────────────────
async function askNOA(q, ctx = {}) {
  const key = process.env.NEXT_PUBLIC_GROQ_KEY;
  if (!key || key === "gsk_..." || !key.startsWith("gsk_")) return demoMsg(q);
  try {
    const sistema = `Sos NOAH Coach, el asistente de entrenamiento de la app NOAH (Never Over, Always Higher), creada por el Prof. Rodrigo Fernández.

SOBRE EL COACH:
El Prof. Rodrigo Fernández es quien diseña y supervisa todos los planes de entrenamiento. Es Profesor de Educación Física, Licenciado en Alto Rendimiento Deportivo, Preparador Físico (CENARD), Kinesiólogo, Osteópata, Especialista en Deportes y Científico de Datos. Toda planificación que el atleta tiene fue diseñada por él con criterio profesional y científico.

TU ROL:
- Sos un asistente orientativo, NO un coach que reemplaza a Rodrigo
- Explicás conceptos, aclarás dudas y orientás al atleta
- NUNCA contradecís ni modificás lo que el coach planificó
- Si algo del plan genera dudas, siempre derivás: consultale al Coach Rodri, él tiene el criterio sobre tu caso particular
- Respondés en español rioplatense, máximo 3 párrafos, conciso y técnico

BIBLIOGRAFÍA:
Cuando citás conceptos científicos, mencionás la fuente y aclarás que existen distintas corrientes. Autores de referencia: Zatsiorsky, Bompa, Issurin, Schoenfeld, Haff & Triplett, Verkhoshansky, Prilepin, Helms, Israetel. Siempre aclarás: según [autor], aunque el Coach Rodri puede aplicar distintas bibliografías según el perfil y objetivos de cada atleta.

EJERCICIOS:
Cuando el atleta pregunta cómo se ejecuta un ejercicio, explicás brevemente la técnica y agregás un link de YouTube orientativo con este formato exacto:
▶ Ver ejecución: https://www.youtube.com/results?search_query=NOMBRE+DEL+EJERCICIO+tecnica
Reemplazá los espacios con + en el término de búsqueda.

TONO:
- Motivador pero honesto
- Técnico pero accesible  
- La última palabra siempre la tiene el Coach Rodri

Contexto del atleta: ${JSON.stringify(ctx, null, 2)}
Áreas: periodización, tonelaje, %1RM, RIR, RPE, recuperación, ciclos de fuerza (adaptación, hipertrofia, fza resistencia, fza potencia, submáxima, neural), biomarcadores (HRV, sueño, DOMS).
Fórmula 1RM Epley: kg × (1 + reps/30). Carga para %: 1RM × % / 100.`;
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: sistema },
          { role: "user", content: q }
        ],
        temperature: 0.7, max_tokens: 500
      })
    });
    if (!r.ok) {
      const err = await r.json();
      return `Error Groq (${r.status}): ${err.error?.message||"Sin detalle"}`;
    }
    const d = await r.json();
    return d.choices?.[0]?.message?.content || "Sin respuesta.";
  } catch(e) { return `Error de conexión: ${e.message}`; }
}

function demoMsg(p) {
  const q = p.toLowerCase();
  if (q.includes("rir")) return "**RIR (Reps en Reserva):** Cuántas reps te quedan antes del fallo. RIR 2 = podías hacer 2 más. Más preciso que RPE para periodizar.\n\nEn bloques de potencia: RIR 2–3. En hipertrofia: RIR 1–2.";
  if (q.includes("neural")) return "**Ciclo Neural:** 90–100% del 1RM, 1–3 reps, 1–2 semanas. Adaptación puramente neuromuscular. Descansos 4–6 min. Máxima intención de velocidad en cada rep.";
  if (q.includes("hrv")) return "**HRV:** Si cae >15% respecto a tu baseline, reducí la carga un 10–15% o hacé sesión de recuperación activa. No canceles, adaptá.";
  return "**NOAH Coach (demo):** Configurá `NEXT_PUBLIC_GROQ_KEY` en Vercel con tu API key de Groq (gratis en console.groq.com) para respuestas en tiempo real.";
}

// ─────────────────────────────────────────
// USUARIOS — editá acá tus credenciales
// ─────────────────────────────────────────
const USUARIOS = [
  {
    email: "coachkinesioloy@gmail.com",
    password: "Rodri2025!",
    id: "2cd5e425-15f2-4667-8ac1-be3f78637f75",
    nombre: "Rodri",
    rol: "coach",
    atleta_codigo: null,
  },
  {
    email: "proferodrigomanuel@gmail.com",
    password: "Ro241178",
    id: "a9159992-7dc3-410d-aba5-cdb11de25ece",
    nombre: "rodrigo fernandez",
    rol: "atleta",
    atleta_codigo: "ATL-01",
  },
  {
    email: "Leobaena",
    password: "123456",
    id: "703fc4a2-dd61-4cec-ab08-46ecd007e221",
    nombre: "Leobaena",
    rol: "atleta",
    atleta_codigo: "ATL-02",
  },
  {
    email: "Facutarantino",
    password: "123456",
    id: "c83787ed-f8a6-4c37-a73b-702c070c378c",
    nombre: "Facutarantino",
    rol: "atleta",
    atleta_codigo: "ATL-03",
  },
  {
    email: "MarceL",
    password: "120876",
    id: "e7883999-573d-4473-8f36-54cb79ce2af5",
    nombre: "MarceL",
    rol: "atleta",
    atleta_codigo: "ATL-04",
  },
  {
    email: "Na",
    password: "180180",
    id: "4a18e027-9d6e-4908-bb00-8970cae1de09",
    nombre: "Na",
    rol: "atleta",
    atleta_codigo: "ATL-05",
  },
];

// ─────────────────────────────────────────
// PALETA + TIPOS
// ─────────────────────────────────────────
const C = {
  bg:"#070C18", deep:"#050913", surface:"#0D1425",
  card:"#101828", cardH:"#141f30",
  border:"#1E2D45", borderH:"#2A3F5F",
  jade:"#00E5A0", jade2:"#00BF86", jade3:"#007A56",
  blue:"#4D9FFF", amber:"#FFB84D", red:"#FF5C5C", violet:"#A78BFA",
  text:"#E8F0FE", textS:"#8899BB", textD:"#3A4F6A", white:"#F0F6FF",
};
const F = { serif:"'DM Serif Display',serif", sans:"'DM Sans',sans-serif" };

const DIAS = ["","Día 1","Día 2","Día 3","Día 4","Día 5","Día 6","Día 7"];
const CICLOS_TIPOS = [
  { key:"adaptacion",      label:"Adaptación",     color:"#4ade80", pct:"50–65", reps:"12–15" },
  { key:"hipertrofia",     label:"Hipertrofia",     color:"#4D9FFF", pct:"65–75", reps:"8–12"  },
  { key:"fza_resistencia", label:"Fza Resistencia", color:"#FFB84D", pct:"70–80", reps:"6–10"  },
  { key:"fza_potencia",    label:"Fza Potencia",    color:"#FF5C5C", pct:"75–85", reps:"3–6"   },
  { key:"submax",          label:"Submáxima",       color:"#A78BFA", pct:"85–92", reps:"1–4"   },
  { key:"neural",          label:"Neural / Pico",   color:"#00E5A0", pct:"90–100",reps:"1–3"   },
];
const PATRONES = ["Sentadilla","Bisagra","Empuje","Jale","Cargada","Core","Full body","Accesorio"];
const PERFILES_DEP = ["fitness","hibrido","cross","conjunto","individual","resistencia","musculacion"];

// ─────────────────────────────────────────
// COMPONENTES BASE
// ─────────────────────────────────────────
function Tag({ color=C.jade, children, sm }) {
  return <span style={{ background:color+"18",color,border:`1px solid ${color}40`,borderRadius:5,padding:sm?"1px 6px":"3px 9px",fontSize:sm?10:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",fontFamily:F.sans }}>{children}</span>;
}

function Card({ children, style={}, onClick, glow }) {
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ background:h&&onClick?C.cardH:C.card,border:`1px solid ${h&&onClick?C.borderH:C.border}`,borderRadius:14,padding:"18px 20px",cursor:onClick?"pointer":"default",transition:"all 0.2s",boxShadow:glow?`0 0 24px ${C.jade}18`:"none",...style }}>{children}</div>;
}

function Stat({ label, value, unit, color=C.jade }) {
  return <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",textAlign:"center" }}>
    <div style={{ fontSize:10,color:C.textS,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6,fontFamily:F.sans }}>{label}</div>
    <div style={{ fontSize:26,fontWeight:700,color,lineHeight:1,fontFamily:F.serif }}>{value}</div>
    {unit&&<div style={{ fontSize:11,color:C.textD,marginTop:3,fontFamily:F.sans }}>{unit}</div>}
  </div>;
}

function Bar({ value, max=100, color=C.jade, h=5 }) {
  return <div style={{ background:C.border,borderRadius:99,height:h,overflow:"hidden" }}><div style={{ width:`${Math.min(100,(value/max)*100)}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.7s ease" }}/></div>;
}

function Btn({ children, onClick, color=C.jade, outline, sm, full, disabled, style={} }) {
  const [h,setH]=useState(false);
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ width:full?"100%":"auto",padding:sm?"6px 14px":"10px 22px",borderRadius:9,border:outline?`1.5px solid ${color}`:"none",background:outline?"transparent":h?color+"DD":`linear-gradient(135deg,${color}99,${color})`,color:outline?color:C.deep,fontWeight:700,fontSize:sm?11:13,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,opacity:disabled?0.4:1,transition:"all 0.2s",boxShadow:(!outline&&!disabled)?`0 3px 14px ${color}44`:"none",...style }}>{children}</button>;
}

function FInput({ label, value, onChange, type="text", placeholder, min, max, step }) {
  return <div style={{ marginBottom:12 }}>
    {label&&<div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>{label}</div>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} step={step} style={{ width:"100%",padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box" }}/>
  </div>;
}

function FSelect({ label, value, onChange, options }) {
  return <div style={{ marginBottom:12 }}>
    {label&&<div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>{label}</div>}
    <select value={value} onChange={onChange} style={{ width:"100%",padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box" }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>;
}

function SectionHeader({ title, sub, tags=[] }) {
  return <div style={{ marginBottom:24 }}>
    {tags.length>0&&<div style={{ display:"flex",gap:6,marginBottom:10,flexWrap:"wrap" }}>{tags.map((t,i)=><Tag key={i} color={t.color||C.jade}>{t.label}</Tag>)}</div>}
    <h1 style={{ fontFamily:F.serif,fontSize:28,fontWeight:400,color:C.white,margin:0,lineHeight:1.1 }}>{title}</h1>
    {sub&&<div style={{ fontSize:13,color:C.textS,marginTop:5,fontFamily:F.sans }}>{sub}</div>}
  </div>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return <div style={{ position:"fixed",inset:0,background:"#000000CC",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{ background:C.card,border:`1px solid ${C.borderH}`,borderRadius:16,padding:"24px 28px",maxWidth:520,width:"100%",maxHeight:"85vh",overflowY:"auto" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div style={{ fontFamily:F.serif,fontSize:20,color:C.white }}>{title}</div>
        <button onClick={onClose} style={{ background:"none",border:"none",color:C.textS,fontSize:22,cursor:"pointer" }}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

function Spinner() {
  return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:48 }}>
    <div style={{ width:32,height:32,border:`3px solid ${C.border}`,borderTopColor:C.jade,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}

function EmptyState({ title, sub }) {
  return <Card style={{ textAlign:"center",padding:"48px 20px" }}>
    <div style={{ fontFamily:F.serif,fontSize:20,color:C.textS,marginBottom:8 }}>{title}</div>
    {sub&&<div style={{ fontSize:13,color:C.textD,fontFamily:F.sans }}>{sub}</div>}
  </Card>;
}

// ─────────────────────────────────────────
// GRÁFICAS SVG (sin dependencias externas)
// ─────────────────────────────────────────
function LineChart({ data, color, height, showDots }) {
  color=color||"#00E5A0"; height=height||140; showDots=showDots!==false;
  if (!data||data.length<2) return <div style={{ height,display:"flex",alignItems:"center",justifyContent:"center",color:"#3A4F6A",fontSize:12,fontFamily:"'DM Sans',sans-serif" }}>Sin datos suficientes</div>;
  const W=400,H=height,pl=48,pr=16,pt=16,pb=28;
  const vals=data.map(d=>d.y);
  const minV=Math.min(...vals),maxV=Math.max(...vals),range=maxV-minV||1;
  const toX=i=>pl+(i/(data.length-1))*(W-pl-pr);
  const toY=v=>pt+(1-(v-minV)/range)*(H-pt-pb);
  const pts=data.map((d,i)=>toX(i)+","+toY(d.y)).join(" ");
  const fill=data.map((d,i)=>toX(i)+","+toY(d.y)).join(" ")+" "+toX(data.length-1)+","+(H-pb)+" "+toX(0)+","+(H-pb);
  const gid="g"+color.replace("#","");
  return (
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height}} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0.02"/></linearGradient></defs>
      {[0,0.25,0.5,0.75,1].map((t,i)=>{const y=pt+t*(H-pt-pb);const val=maxV-t*range;return(<g key={i}><line x1={pl} y1={y} x2={W-pr} y2={y} stroke="#1E2D45" strokeWidth="1"/><text x={pl-4} y={y+4} textAnchor="end" fontSize="9" fill="#3A4F6A" fontFamily="DM Sans">{Math.round(val).toLocaleString("es")}</text></g>);})}
      <polygon points={fill} fill={"url(#"+gid+")"}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
      {data.map((d,i)=>(<g key={i}>{showDots&&<circle cx={toX(i)} cy={toY(d.y)} r="3.5" fill={color} stroke="#101828" strokeWidth="2"/>}<text x={toX(i)} y={H-pb+12} textAnchor="middle" fontSize="9" fill="#3A4F6A" fontFamily="DM Sans">{d.x}</text></g>))}
    </svg>
  );
}

function BarChart({ data, color, height }) {
  color=color||"#A78BFA"; height=height||120;
  if (!data||!data.length) return null;
  const W=400,H=height,pl=40,pr=10,pt=10,pb=24;
  const maxV=Math.max(...data.map(d=>d.y),1);
  const gap=(W-pl-pr)/data.length;
  const barW=gap*0.6;
  return (
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height}} preserveAspectRatio="none">
      {data.map((d,i)=>{const x=pl+i*gap+gap*0.2;const barH=(d.y/maxV)*(H-pt-pb);const y=H-pb-barH;return(<g key={i}><rect x={x} y={y} width={barW} height={barH} rx="3" fill={color} opacity="0.85"/><text x={x+barW/2} y={H-pb+12} textAnchor="middle" fontSize="9" fill="#3A4F6A" fontFamily="DM Sans">{d.x}</text><text x={x+barW/2} y={y-4} textAnchor="middle" fontSize="8" fill={color} fontFamily="DM Sans">{d.y}</text></g>);})}
    </svg>
  );
}

// ─────────────────────────────────────────
// DASHBOARD ATLETA
// ─────────────────────────────────────────
function DashboardAtleta({ user, perfil }) {
  const [loading,setLoading]=useState(true);
  const [ciclo,setCiclo]=useState(null);
  const [tonelaje,setTonelaje]=useState([]);
  const [bio,setBio]=useState([]);
  const [marcas,setMarcas]=useState([]);
  const [adherencia,setAdherencia]=useState(0);

  useEffect(()=>{ cargarDash(); },[]);

  const cargarDash=async()=>{
    const sb=await getSB(); if(!sb){setLoading(false);return;}
    const {data:ciclos}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).limit(1);
    const c=ciclos?.[0]; setCiclo(c);
    const {data:logs}=await sb.from("logs_entrenamiento").select("semana,carga_kg,reps_realizadas,series_realizadas,completado").eq("atleta_id",user.id).order("semana");
    const tonMap={}; let comp=0,tot=0;
    logs?.forEach(l=>{
      if(l.semana){
        const ton=(parseFloat(l.carga_kg)||0)*(parseInt(l.reps_realizadas)||0)*(parseInt(l.series_realizadas)||0);
        tonMap[l.semana]=(tonMap[l.semana]||0)+ton;
      }
      if(l.completado===true)comp++;tot++;
    });
    setTonelaje(Object.entries(tonMap).map(([k,v])=>({x:"S"+k,y:Math.round(v)})));
    setAdherencia(tot>0?Math.round(comp/tot*100):0);
    const {data:bioData}=await sb.from("biomarcadores").select("fecha,hrv,readiness_score").eq("atleta_id",user.id).order("fecha",{ascending:false}).limit(7);
    setBio((bioData||[]).reverse());
    const {data:mData}=await sb.from("marcas").select("*,ejercicios(nombre)").eq("atleta_id",user.id).order("fecha",{ascending:false}).limit(5);
    setMarcas(mData||[]);
    setLoading(false);
  };

  if(loading) return <div style={{padding:32}}><Spinner/></div>;
  const readinessHoy=bio.length?bio[bio.length-1]?.readiness_score:null;
  const rC=readinessHoy>=75?"#00E5A0":readinessHoy>=50?"#FFB84D":readinessHoy?"#FF5C5C":"#3A4F6A";
  const tipoColor=CICLOS_TIPOS.find(t=>t.key===ciclo?.tipo)?.color||"#00E5A0";

  return (
    <div style={{padding:"16px",maxWidth:960}}>
      <SectionHeader title="Progresión y métricas" sub={ciclo?ciclo.nombre+" · "+ciclo.semanas+" semanas":"Sin ciclo activo"} tags={ciclo?[{label:(ciclo.tipo||"ciclo").replace(/_/g," "),color:tipoColor}]:[]}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
        <Stat label="Adherencia" value={adherencia+"%"} color={adherencia>=80?"#00E5A0":"#FFB84D"} unit="sesiones completadas"/>
        <Stat label="Readiness hoy" value={readinessHoy||"—"} color={rC} unit="sobre 100"/>
        <Stat label="Semanas con datos" value={tonelaje.filter(t=>t.y>0).length} color="#4D9FFF" unit={"de "+(ciclo?.semanas||"—")}/>
        <Stat label="Tonelaje total" value={tonelaje.reduce((a,t)=>a+t.y,0).toLocaleString("es")} color="#A78BFA" unit="kg acumulado"/>
      </div>
      {tonelaje.length>=2&&<Card style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Tonelaje semanal (kg)</div><LineChart data={tonelaje} color="#00E5A0"/></Card>}
      {bio.length>=2&&<Card style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>HRV — últimos días (ms)</div><LineChart data={bio.map(b=>({x:(b.fecha||"").slice(5),y:b.hrv||0}))} color="#4D9FFF" height={120}/></Card>}
      {bio.length>=2&&<Card style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Readiness score</div><BarChart data={bio.map(b=>({x:(b.fecha||"").slice(5),y:b.readiness_score||0}))} color="#A78BFA" height={100}/></Card>}
      {marcas.length>0&&<Card><div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:12,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Marcas personales</div>{marcas.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1E2D45"}}><div style={{fontSize:13,color:"#E8F0FE",fontFamily:"'DM Sans',sans-serif"}}>{m.ejercicios?.nombre}</div><div style={{display:"flex",gap:12}}>{m.rm1_real&&<span style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:"#00E5A0"}}>{m.rm1_real}kg</span>}{m.rm1_estimado&&<span style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#4D9FFF"}}>~{m.rm1_estimado}kg</span>}</div></div>))}</Card>}
      {/* Mapa de calor de adherencia por semana */}
      {tonelaje.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:12,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Adherencia por semana</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Array.from({length:ciclo?.semanas||4},(_,i)=>{
              const s=i+1;
              const t=tonelaje.find(t=>t.x==="S"+s);
              const intensity=t?Math.min(1,t.y/10000):0;
              const col=t?(intensity>0.7?"#00E5A0":intensity>0.4?"#FFB84D":"#4D9FFF"):"#1E2D45";
              return (
                <div key={s} style={{textAlign:"center"}}>
                  <div style={{width:44,height:44,borderRadius:8,background:t?col+"33":"#1E2D45",border:`1.5px solid ${t?col:"#2A3F5F"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                    <span style={{fontSize:13,fontWeight:700,color:t?col:"#3A4F6A",fontFamily:"'DM Serif Display',serif"}}>{s}</span>
                    {t&&<span style={{fontSize:8,color:col}}>{(t.y/1000).toFixed(1)}t</span>}
                  </div>
                  <div style={{fontSize:9,color:"#3A4F6A",marginTop:3,fontFamily:"'DM Sans',sans-serif"}}>Sem {s}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {!tonelaje.length&&!bio.length&&!marcas.length&&<EmptyState title="Sin datos todavía" sub="Completá sesiones y registrá biomarcadores para ver tus gráficas"/>}
    </div>
  );
}

// ─────────────────────────────────────────
// DASHBOARD COACH
// ─────────────────────────────────────────
function DashboardCoach({ user }) {
  const [loading,setLoading]=useState(true);
  const [atletas,setAtletas]=useState([]);
  const [tonGrupal,setTonGrupal]=useState([]);

  useEffect(()=>{ cargarCoach(); },[]);

  const cargarCoach=async()=>{
    const sb=await getSB(); if(!sb){setLoading(false);return;}
    const {data:profs}=await sb.from("profiles").select("*").eq("rol","atleta").eq("activo",true).order("atleta_codigo");
    const today=new Date().toISOString().split("T")[0];
    const resumen=await Promise.all((profs||[]).map(async(p)=>{
      const {data:logs}=await sb.from("logs_entrenamiento").select("semana,carga_kg,reps_realizadas,series_realizadas,completado").eq("atleta_id",p.id).order("semana").limit(50);
      const tonMap={}; let comp=0,tot=0;
      logs?.forEach(l=>{
        if(l.semana){const ton=(parseFloat(l.carga_kg)||0)*(parseInt(l.reps_realizadas)||0)*(parseInt(l.series_realizadas)||0);tonMap[l.semana]=(tonMap[l.semana]||0)+ton;}
        if(l.completado===true)comp++;tot++;
      });
      const semanas=Object.keys(tonMap).sort((a,b)=>Number(b)-Number(a));
      const {data:bio}=await sb.from("biomarcadores").select("readiness_score,hrv").eq("atleta_id",p.id).eq("fecha",today).single().catch(()=>({data:null}));
      const {data:ciclo}=await sb.from("ciclos").select("nombre,tipo").eq("atleta_id",p.id).eq("activo",true).limit(1);
      return {...p,tonSemActual:semanas.length?Math.round(tonMap[semanas[0]]):0,adherencia:tot>0?Math.round(comp/tot*100):0,readiness:bio?.readiness_score||null,hrv:bio?.hrv||null,ciclo:ciclo?.[0]||null,tonHistorial:semanas.slice(0,6).reverse().map(s=>({x:"S"+s,y:Math.round(tonMap[s])}))};
    }));
    setAtletas(resumen);
    const tonGMap={};
    resumen.forEach(a=>a.tonHistorial?.forEach(t=>{if(!tonGMap[t.x])tonGMap[t.x]=[];tonGMap[t.x].push(t.y);}));
    setTonGrupal(Object.entries(tonGMap).map(([k,v])=>({x:k,y:Math.round(v.reduce((a,b)=>a+b,0)/v.length)})));
    setLoading(false);
  };

  if(loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{padding:"16px",maxWidth:980}}>
      <SectionHeader title="Panel de control" sub={atletas.length+" atletas activos"}/>
      {tonGrupal.length>=2&&<Card style={{marginBottom:16}}><div style={{fontSize:11,fontWeight:700,color:"#8899BB",marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>Tonelaje promedio grupal (kg)</div><LineChart data={tonGrupal} color="#00E5A0"/></Card>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {atletas.map(a=>{
          const rC=a.readiness>=75?"#00E5A0":a.readiness>=50?"#FFB84D":a.readiness?"#FF5C5C":"#3A4F6A";
          const tipo=CICLOS_TIPOS.find(t=>t.key===a.ciclo?.tipo);
          return (
            <Card key={a.id} glow={a.readiness>=75}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"#00E5A022",border:"1px solid #00E5A044",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Serif Display',serif",color:"#00E5A0",fontSize:14}}>{(a.nombre||a.atleta_codigo||"?")[0].toUpperCase()}</div>
                  <div><div style={{fontSize:13,fontWeight:700,color:"#E8F0FE",fontFamily:"'DM Sans',sans-serif"}}>{a.nombre||a.atleta_codigo}</div>{a.ciclo&&<Tag color={tipo?.color||"#00E5A0"} sm>{(a.ciclo.tipo||"ciclo").replace(/_/g," ")}</Tag>}</div>
                </div>
                {a.readiness&&<div style={{textAlign:"center"}}><div style={{fontSize:22,color:rC,fontFamily:"'DM Serif Display',serif",lineHeight:1}}>{a.readiness}</div><div style={{fontSize:8,color:rC,fontFamily:"'DM Sans',sans-serif",letterSpacing:"0.08em"}}>READINESS</div></div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                <div style={{textAlign:"center",padding:"6px",background:"#0D1425",borderRadius:8}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#00E5A0"}}>{a.tonSemActual>0?a.tonSemActual.toLocaleString("es"):"—"}</div><div style={{fontSize:9,color:"#3A4F6A",fontFamily:"'DM Sans',sans-serif"}}>kg sem.</div></div>
                <div style={{textAlign:"center",padding:"6px",background:"#0D1425",borderRadius:8}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#4D9FFF"}}>{a.adherencia}%</div><div style={{fontSize:9,color:"#3A4F6A",fontFamily:"'DM Sans',sans-serif"}}>adherencia</div></div>
                <div style={{textAlign:"center",padding:"6px",background:"#0D1425",borderRadius:8}}><div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#A78BFA"}}>{a.hrv||"—"}</div><div style={{fontSize:9,color:"#3A4F6A",fontFamily:"'DM Sans',sans-serif"}}>HRV ms</div></div>
              </div>
              {a.tonHistorial?.length>=2&&<LineChart data={a.tonHistorial} color={tipo?.color||"#00E5A0"} height={70} showDots={false}/>}
            </Card>
          );
        })}
      </div>
      {!atletas.length&&<EmptyState title="Sin atletas activos" sub="Creá atletas desde Mis atletas"/>}
    </div>
  );
}

// ─────────────────────────────────────────
// LOGIN — usa tabla USUARIOS local
// ─────────────────────────────────────────
function Login({ onLogin }) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const doLogin = async () => {
    if (!email||!pass){setError("Completá email y contraseña");return;}
    setLoading(true);setError("");

    // Buscar en tabla local de usuarios
    const usuario = USUARIOS.find(u => u.email.toLowerCase()===email.toLowerCase() && u.password===pass);

    if (!usuario) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    // Construir objetos user y perfil
    const fakeUser = { id: usuario.id, email: usuario.email };
    const fakePerfil = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      atleta_codigo: usuario.atleta_codigo || null,
    };

    // Conectar Supabase de fondo (para que las queries funcionen)
    await getSB();

    onLogin(fakeUser, fakePerfil);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key==="Enter") doLogin(); };

  return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:${F.sans}}input::placeholder{color:${C.textD}}select option{background:${C.card};color:${C.text}}`}</style>
      <div style={{ width:"100%",maxWidth:380 }}>
        <div style={{ textAlign:"center",marginBottom:32 }} dangerouslySetInnerHTML={{__html: `<svg viewBox="0 0 340 300" width="220" height="195" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lgL" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00E5A0"/><stop offset="100%" stop-color="#00B8CC"/></linearGradient>
    <linearGradient id="lgD" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD600"/><stop offset="45%" stop-color="#FF5A1F"/><stop offset="100%" stop-color="#E8002A"/></linearGradient>
    <linearGradient id="lgLs" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#007A58"/><stop offset="100%" stop-color="#005F80"/></linearGradient>
  </defs>
  <path d="M 68 14 C 67 40 65 68 64 100 C 63 130 63 155 64 182 L 96 182 C 95 155 95 130 96 102 C 97 70 99 42 100 16 Z" fill="url(#lgL)"/>
  <path d="M 68 14 L 62 18 L 62 182 L 70 182 Z" fill="url(#lgLs)" opacity="0.55"/>
  <path d="M 68 14 L 100 16 L 99 8 L 66 6 Z" fill="#00C896" opacity="0.7"/>
  <path d="M 100 16 C 108 32 118 52 130 74 C 144 100 156 126 166 150 C 174 170 181 190 186 214 L 218 214 C 212 188 204 166 194 142 C 183 116 169 88 154 60 C 138 32 124 12 114 0 Z" fill="url(#lgD)"/>
  <path d="M 114 0 L 106 6 L 196 214 L 206 214 Z" fill="#8A0018" opacity="0.3"/>
  <path d="M 176 14 C 177 40 179 68 180 100 C 181 130 181 155 180 182 L 212 182 C 213 155 213 130 211 102 C 209 70 207 42 206 16 Z" fill="url(#lgL)"/>
  <path d="M 206 16 L 212 20 L 212 182 L 204 182 Z" fill="url(#lgLs)" opacity="0.55"/>
  <path d="M 176 14 L 206 16 L 208 8 L 174 6 Z" fill="#00C896" opacity="0.7"/>
  <rect x="56" y="194" width="36" height="2" rx="1" fill="#00E5A0"/>
  <rect x="96" y="194" width="36" height="2" rx="1" fill="#0057D9"/>
  <rect x="136" y="194" width="36" height="2" rx="1" fill="#FFD600"/>
  <rect x="176" y="194" width="36" height="2" rx="1" fill="#E8002A"/>
  <text x="136" y="236" text-anchor="middle" font-family="'Inter','Helvetica Neue',Arial,sans-serif" font-weight="300" font-size="42" letter-spacing="12" fill="#FFFFFF">NOAH</text>
  <text x="136" y="260" text-anchor="middle" font-family="'Inter','Helvetica Neue',Arial,sans-serif" font-weight="300" font-size="8" letter-spacing="4" fill="#4A6658">NEVER OVER, ALWAYS HIGHER</text>
</svg>`}}/>
        <Card glow>
          <FInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="tu@email.com"/>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>Contraseña</div>
            <input
              type="password"
              value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••••••"
              style={{ width:"100%",padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box" }}
            />
          </div>
          {error&&<div style={{ fontSize:12,color:C.red,marginBottom:12,fontFamily:F.sans }}>{error}</div>}
          <Btn onClick={doLogin} disabled={loading} full>{loading?"Ingresando…":"Ingresar"}</Btn>
        </Card>
        <div style={{ textAlign:"center",marginTop:20,fontSize:11,color:C.textD,fontFamily:F.sans }}>Las cuentas las crea tu coach · NOAH v2.0</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────
const NAV_ATLETA = [
  {id:"hoy",         icon:"⚡",label:"Sesión de hoy"},
  {id:"dashboard",   icon:"📊",label:"Mi dashboard"},
  {id:"calendario",  icon:"◈", label:"Mi calendario"},
  {id:"biomarcadores",icon:"◆",label:"Biomarcadores"},
  {id:"marcas",      icon:"◎", label:"Mis marcas"},
  {id:"noa_coach",   icon:"✦", label:"NOAH Coach IA"},
];
const NAV_COACH = [
  {id:"c_dashboard", icon:"📊", label:"Dashboard"},
  {id:"c_atletas",   icon:"◈", label:"Mis atletas"},
  {id:"c_ciclos",    icon:"◉", label:"Ciclos"},
  {id:"c_planificar",icon:"◆", label:"Planificar"},
  {id:"c_ejercicios",icon:"◇", label:"Ejercicios"},
  {id:"c_vista",     icon:"◎", label:"Ver como atleta"},
];

function Sidebar({ sec, setSec, rol, perfil, onLogout, open, setOpen }) {
  const nav = rol==="coach"?NAV_COACH:NAV_ATLETA;
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div onClick={()=>setOpen(false)} style={{
          position:"fixed",inset:0,background:"#000000BB",
          zIndex:90,display:"block",
        }}/>
      )}

      <aside style={{
        width:224, minWidth:224,
        background:C.deep,
        borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        height:"100vh",
        position:"fixed", top:0, left:0,
        zIndex:100,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.25s ease",
      }}>
        {/* Logo + cerrar */}
        <div style={{ padding:"18px 16px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div dangerouslySetInnerHTML={__html: "<svg viewBox='0 0 250 50' width='150' height='38' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='sbL2' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#00E5A0'/><stop offset='100%' stop-color='#00B8CC'/></linearGradient><linearGradient id='sbD2' x1='0%' y1='100%' x2='100%' y2='0%'><stop offset='0%' stop-color='#FFD600'/><stop offset='45%' stop-color='#FF5A1F'/><stop offset='100%' stop-color='#E8002A'/></linearGradient><linearGradient id='sbLs2' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' stop-color='#007A58'/><stop offset='100%' stop-color='#005F80'/></linearGradient></defs><path d='M 6 4 C 6 14 5 24 5 36 L 18 36 C 18 26 19 16 19 6 Z' fill='url(#sbL2)'/><path d='M 6 4 L 3 6 L 3 36 L 7 36 Z' fill='url(#sbLs2)' opacity='0.55'/><path d='M 6 4 L 19 6 L 18 2 L 5 2 Z' fill='#00C896' opacity='0.7'/><path d='M 19 6 C 22 11 26 17 30 24 C 34 31 37 37 39 44 L 52 44 C 50 37 46 30 42 22 C 38 15 34 9 31 4 Z' fill='url(#sbD2)'/><path d='M 39 4 C 39 14 40 24 40 36 L 53 36 C 53 26 52 16 52 6 Z' fill='url(#sbL2)'/><path d='M 52 6 L 55 8 L 55 36 L 51 36 Z' fill='url(#sbLs2)' opacity='0.55'/><path d='M 39 4 L 52 6 L 53 2 L 38 2 Z' fill='#00C896' opacity='0.7'/><rect x='2' y='40' width='14' height='1.5' rx='0.75' fill='#00E5A0'/><rect x='18' y='40' width='14' height='1.5' rx='0.75' fill='#0057D9'/><rect x='34' y='40' width='14' height='1.5' rx='0.75' fill='#FFD600'/><rect x='50' y='40' width='14' height='1.5' rx='0.75' fill='#E8002A'/><text x='72' y='26' font-family='Arial,sans-serif' font-weight='300' font-size='22' letter-spacing='5' fill='#FFFFFF'>NOAH</text><text x='72' y='42' font-family='Arial,sans-serif' font-size='7' letter-spacing='3' fill='#4A6658'>NEVER OVER, ALWAYS HIGHER</text></svg>"}/>
          <button onClick={()=>setOpen(false)} style={{ background:"none",border:`1px solid ${C.border}`,borderRadius:7,color:C.textS,width:28,height:28,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>

        {/* Perfil */}
        <div style={{ padding:"10px 14px",borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:30,height:30,borderRadius:7,background:C.jade+"22",border:`1px solid ${C.jade}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,color:C.jade,fontSize:13,flexShrink:0 }}>
              {(perfil?.nombre||perfil?.atleta_codigo||"?")[0].toUpperCase()}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12,fontWeight:600,color:C.text,fontFamily:F.sans,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{perfil?.nombre||perfil?.atleta_codigo||"Usuario"}</div>
              <div style={{ fontSize:10,color:C.jade,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.sans }}>{rol}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1,padding:"10px 10px",overflowY:"auto" }}>
          {nav.map(item=>{
            const active=sec===item.id;
            return (
              <button key={item.id} onClick={()=>{setSec(item.id);setOpen(false);}} style={{
                display:"flex",alignItems:"center",gap:9,width:"100%",
                padding:"10px 12px",
                background:active?C.jade+"14":"transparent",
                border:"none",
                borderLeft:`2px solid ${active?C.jade:"transparent"}`,
                borderRadius:"0 8px 8px 0",
                color:active?C.jade:C.textS,
                fontSize:13,fontWeight:active?600:400,
                cursor:"pointer",textAlign:"left",
                transition:"all 0.15s",fontFamily:F.sans,marginBottom:2,
              }}>
                <span style={{ fontSize:15,opacity:active?1:0.5 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontSize:9,color:C.textD,fontFamily:F.sans }}>NOAH v2.0</div>
          <button onClick={onLogout} style={{ fontSize:10,color:C.textD,background:"none",border:"none",cursor:"pointer",fontFamily:F.sans }}>Salir →</button>
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────
// SESIÓN DE HOY (atleta)
// ─────────────────────────────────────────
function SesionHoy({ user }) {
  const [loading,setLoading]=useState(true);
  const [cicloInfo,setCicloInfo]=useState(null);
  const [plan,setPlan]=useState({});        // {sem:{dia:[ejercicios]}}
  const [logsDB,setLogsDB]=useState({});    // {sesion_plan_id: log}
  const [semSel,setSemSel]=useState(1);
  const [diaSel,setDiaSel]=useState(1);
  const [logs,setLogs]=useState({});        // inputs actuales
  const [nota,setNota]=useState("");
  const [saved,setSaved]=useState(false);
  const [sesionCumplida,setSesionCumplida]=useState(false);

  useEffect(()=>{ cargar(); },[]);

  // Semana activa: usa semana_activa del ciclo (controlada por coach) o calcula por fecha
  const getSemActiva=(ciclo)=>{
    if (ciclo.semana_activa) return Math.min(ciclo.semanas, ciclo.semana_activa);
    const inicio=new Date(ciclo.fecha_inicio);
    const hoy=new Date();
    const diff=Math.max(0,Math.floor((hoy-inicio)/(1000*60*60*24)));
    return Math.min(ciclo.semanas,Math.floor(diff/7)+1);
  };

  const cargar=async()=>{
    setLoading(true);
    const sb=await getSB();
    if (!sb||!user){setLoading(false);return;}
    // Ciclo activo
    const {data:ciclos}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).order("created_at",{ascending:false}).limit(1);
    if (!ciclos?.length){setLoading(false);return;}
    const c=ciclos[0]; setCicloInfo(c);
    // Plan completo
    const {data:sps}=await sb.from("sesiones_plan").select("*,ejercicios(nombre,grupo_muscular,patron_movimiento)").eq("ciclo_id",c.id).order("semana").order("dia").order("orden");
    const org={};
    sps?.forEach(s=>{
      if(!org[s.semana])org[s.semana]={};
      if(!org[s.semana][s.dia])org[s.semana][s.dia]=[];
      org[s.semana][s.dia].push(s);
    });
    setPlan(org);
    // Logs ya guardados
    const {data:lgs}=await sb.from("logs_entrenamiento").select("*").eq("atleta_id",user.id).eq("ciclo_id",c.id);
    const lMap={};
    lgs?.forEach(l=>{ if(l.sesion_plan_id) lMap[l.sesion_plan_id]=l; });
    setLogsDB(lMap);
    // Seleccionar semana/día actual
    const sem=getSemActiva(c);
    // Buscar primer día con ejercicios en la semana actual
    const diasSem=Object.keys(org[sem]||{}).map(Number).sort((a,b)=>a-b);
    const diaInicial=diasSem[0]||1;
    setSemSel(sem); setDiaSel(diaInicial);
    // Init logs inputs para ese día
    initLogsInputs(org[sem]?.[diaInicial]||[], lMap);
    setLoading(false);
  };

  const initLogsInputs=(ejerciciosDia, lMap)=>{
    const init={};
    ejerciciosDia.forEach(e=>{
      const prevLog=lMap[e.id];
      init[e.id]={
        kg: prevLog?.carga_kg!=null ? String(prevLog.carga_kg) : "",
        rpe: prevLog?.rpe!=null ? String(prevLog.rpe) : "",
        done: prevLog?.completado===true,
      };
    });
    setLogs(init);
    // Sesión cumplida = todos tienen completado=true en BD
    const allDone=ejerciciosDia.length>0&&ejerciciosDia.every(e=>lMap[e.id]?.completado===true);
    setSesionCumplida(allDone);
  };

  // Cambiar semana o día seleccionado
  const seleccionarDia=(sem,dia)=>{
    setSemSel(sem); setDiaSel(dia);
    const ejsDia=plan[sem]?.[dia]||[];
    initLogsInputs(ejsDia, logsDB);
    setNota("");setSaved(false);
  };

  const upd=(id,f,v)=>setLogs(p=>({...p,[id]:{...p[id],[f]:v}}));

  const sesionActual=plan[semSel]?.[diaSel]||[];
  const tonelaje=sesionActual.reduce((acc,e)=>acc+(e.series*(parseInt(e.reps)||0)*(parseFloat(logs[e.id]?.kg)||0)),0);
  const done=Object.values(logs).filter(l=>l.done).length;
  const todosHechos=sesionActual.length>0&&done===sesionActual.length;

  // Determinar estado de cada día
  const estadoDia=(sem,dia)=>{
    const ejs=plan[sem]?.[dia]||[];
    if (!ejs.length) return "vacio";
    const todos=ejs.every(e=>logsDB[e.id]?.completado===true);
    const alguno=ejs.some(e=>logsDB[e.id]!=null);
    const semActiva=getSemActiva(cicloInfo);
    const pasado=sem<semActiva||(sem===semActiva&&dia<diaSel);
    if (todos) return "cumplido";
    if (pasado&&!alguno) return "perdido";
    if (sem===semSel&&dia===diaSel) return "activo";
    return "pendiente";
  };

  const guardar=async(marcarCumplida=false)=>{
    const sb=await getSB();
    if (!sb){alert("Sin conexión a Supabase");return;}
    if (!cicloInfo){alert("Sin ciclo activo");return;}
    setSaved(false);
    const newLMap={...logsDB};
    let errores=0;
    for (const e of sesionActual) {
      const completado=marcarCumplida?true:(logs[e.id]?.done||false);
      const carga=logs[e.id]?.kg?parseFloat(logs[e.id].kg):null;
      const reps=parseInt(e.reps)||null;
      const row={
        atleta_id:user.id,
        ciclo_id:cicloInfo.id,
        sesion_plan_id:e.id,
        ejercicio_id:e.ejercicio_id,
        semana:semSel,
        dia:diaSel,
        carga_kg:carga,
        rpe:logs[e.id]?.rpe?parseFloat(logs[e.id].rpe):null,
        series_realizadas:e.series,
        reps_realizadas:reps,
        completado,
        notas:nota||null,
        e1rm:(carga&&reps)?Math.round(carga*(1+reps/30)*10)/10:null,
      };
      const existente=logsDB[e.id];
      if (existente?.id) {
        const {error}=await sb.from("logs_entrenamiento").update(row).eq("id",existente.id);
        if(error){console.error("update error:",error);errores++;}
        else newLMap[e.id]={...existente,...row};
      } else {
        const {data:inserted,error}=await sb.from("logs_entrenamiento").insert(row).select().single();
        if(error){console.error("insert error:",error);errores++;}
        else if(inserted) newLMap[e.id]=inserted;
      }
    }
    if(errores>0){alert("Hubo "+errores+" error(es) al guardar. Revisá la consola.");return;}
    setLogsDB(newLMap);
    if(marcarCumplida){
      setSesionCumplida(true);
      setLogs(p=>{const n={...p};Object.keys(n).forEach(k=>n[k]={...n[k],done:true});return n;});
    }
    setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;
  if (!cicloInfo) return <div style={{padding:"16px"}}><EmptyState title="Sin ciclo activo" sub="Tu coach todavía no te asignó un ciclo de entrenamiento"/></div>;

  const semsArr=Object.keys(plan).map(Number).sort((a,b)=>a-b);
  const tipoColor=CICLOS_TIPOS.find(t=>t.key===cicloInfo.tipo)?.color||C.jade;

  return (
    <div style={{ padding:"16px",maxWidth:960 }}>
      <SectionHeader title="Mis sesiones" sub={cicloInfo.nombre} tags={[{label:(cicloInfo.tipo||"").replace(/_/g," "),color:tipoColor}]}/>

      {/* Selector semana */}
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:10 }}>
        {semsArr.map(s=>(
          <button key={s} onClick={()=>{setSemSel(s);const dias=Object.keys(plan[s]||{}).map(Number).sort((a,b)=>a-b);if(dias.length)seleccionarDia(s,dias[0]);}} style={{ padding:"5px 12px",borderRadius:8,border:`1.5px solid ${semSel===s?tipoColor:C.border}`,background:semSel===s?tipoColor+"22":"transparent",color:semSel===s?tipoColor:C.textS,fontSize:12,fontWeight:semSel===s?700:400,cursor:"pointer",fontFamily:F.sans }}>
            Sem {s}
          </button>
        ))}
      </div>

      {/* Selector día con estado visual */}
      {plan[semSel]&&(
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:20 }}>
          {Object.keys(plan[semSel]).map(Number).sort((a,b)=>a-b).map(d=>{
            const estado=estadoDia(semSel,d);
            const colores={
              cumplido:{bg:C.jade+"22",border:C.jade,color:C.jade,icon:"✓"},
              perdido: {bg:C.red+"22", border:C.red, color:C.red, icon:"✗"},
              hoy:     {bg:tipoColor+"22",border:tipoColor,color:tipoColor,icon:"▶"},
              pendiente:{bg:"transparent",border:C.border,color:C.textS,icon:""},
              vacio:   {bg:"transparent",border:C.borderH,color:C.textD,icon:""},
            }[estado]||{bg:"transparent",border:C.border,color:C.textS,icon:""};
            const activo=diaSel===d&&semSel===semSel;
            return (
              <button key={d} onClick={()=>seleccionarDia(semSel,d)} style={{ padding:"8px 16px",borderRadius:9,border:`2px solid ${activo?colores.border:colores.border+"88"}`,background:activo?colores.bg:"transparent",color:colores.color,fontSize:12,fontWeight:activo?700:400,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6,transition:"all 0.15s" }}>
                {colores.icon&&<span style={{fontSize:11}}>{colores.icon}</span>}
                {DIAS[d]}
              </button>
            );
          })}
        </div>
      )}

      {/* Contenido de la sesión seleccionada */}
      {sesionActual.length===0?(
        <EmptyState title="Sin ejercicios este día" sub="Tu coach no planificó ejercicios para este día"/>
      ):(
        <>
          {/* Estado banner */}
          {sesionCumplida&&(
            <div style={{ padding:"10px 16px",background:C.jade+"18",border:`1px solid ${C.jade}44`,borderRadius:10,marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
              <span style={{fontSize:18}}>✅</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.jade,fontFamily:F.sans}}>Sesión cumplida</div>
                <div style={{fontSize:11,color:C.textS,fontFamily:F.sans}}>Podés seguir viendo tus registros o editarlos</div>
              </div>
            </div>
          )}

          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:16 }}>
            <Stat label="Tonelaje" value={tonelaje>0?Math.round(tonelaje).toLocaleString("es"):"—"} unit="kg · en vivo" color={C.jade}/>
            <Stat label="Completados" value={`${done}/${sesionActual.length}`} color={done===sesionActual.length?C.jade:C.amber}/>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:18 }}>
            {sesionActual.map((ej)=>{
              const log=logs[ej.id]||{};
              const kgN=parseFloat(log.kg);
              const diff=kgN&&ej.carga_kg?((kgN-ej.carga_kg)/ej.carga_kg*100):null;
              const yaGuardado=!!logsDB[ej.id];
              const bgColor=log.done?C.jade+"0A":yaGuardado?C.amber+"08":C.card;
              const borderColor=log.done?C.jade+"55":yaGuardado?C.amber+"44":C.border;
              return (
                <Card key={ej.id} style={{ padding:"14px 16px",background:bgColor,borderColor }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                    <div onClick={()=>upd(ej.id,"done",!log.done)} style={{ width:22,height:22,borderRadius:6,cursor:"pointer",border:`2px solid ${log.done?C.jade:C.borderH}`,background:log.done?C.jade:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.deep,fontWeight:900,flexShrink:0,marginTop:1 }}>{log.done?"✓":""}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:700,color:C.text,fontFamily:F.sans }}>{ej.ejercicios?.nombre}</div>
                      <div style={{ fontSize:11,color:C.textD,marginTop:1 }}>{ej.ejercicios?.patron_movimiento} · {ej.ejercicios?.grupo_muscular}</div>
                      {ej.notas_coach&&<div style={{ fontSize:11,color:C.amber,marginTop:3 }}>📌 {ej.notas_coach}</div>}
                    </div>
                    {yaGuardado&&!log.done&&<span style={{fontSize:10,color:C.amber,fontFamily:F.sans}}>editado</span>}
                  </div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:10,paddingLeft:32 }}>
                    <Tag color={C.jade} sm>{ej.series} series</Tag>
                    <Tag color={C.blue} sm>{ej.reps} reps</Tag>
                    {ej.intensidad_pct&&<Tag color={C.violet} sm>{ej.intensidad_pct}% 1RM</Tag>}
                    {ej.carga_kg&&<Tag color={C.textS} sm>Plan: {ej.carga_kg}kg</Tag>}
                    {ej.descanso_seg&&<Tag color={C.textD} sm>⏱{ej.descanso_seg}"</Tag>}
                    {ej.rir!=null&&ej.rir!==""&&<Tag color={C.amber} sm>RIR {ej.rir}</Tag>}
                  </div>
                  <div style={{ display:"flex",gap:10,alignItems:"center",paddingLeft:32 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10,color:C.textS,marginBottom:4,fontFamily:F.sans,letterSpacing:"0.06em",textTransform:"uppercase" }}>Kg real</div>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <input value={log.kg||""} onChange={e=>upd(ej.id,"kg",e.target.value)} placeholder={ej.carga_kg||"0"} type="number" style={{ width:"100%",padding:"8px 10px",background:C.surface,border:`1.5px solid ${kgN?C.jade+"AA":C.border}`,borderRadius:8,color:C.white,fontSize:15,fontWeight:700,outline:"none",fontFamily:F.serif }}/>
                        {diff!==null&&<span style={{ fontSize:10,color:diff>=0?C.jade:C.red,whiteSpace:"nowrap" }}>{diff>=0?"+":""}{diff.toFixed(0)}%</span>}
                      </div>
                    </div>
                    <div style={{ minWidth:80 }}>
                      <div style={{ fontSize:10,color:C.textS,marginBottom:4,fontFamily:F.sans,letterSpacing:"0.06em",textTransform:"uppercase" }}>RPE</div>
                      <select value={log.rpe||""} onChange={e=>upd(ej.id,"rpe",e.target.value)} style={{ width:"100%",padding:"8px 6px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.textS,fontSize:13,outline:"none" }}>
                        <option value="">—</option>
                        {[6,6.5,7,7.5,8,8.5,9,9.5,10].map(v=><option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:F.sans }}>Nota de sesión</div>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="¿Cómo te sentiste? ¿Algo a ajustar?" rows={2} style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,padding:"10px 13px",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.sans }}/>
          </Card>

          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            <Btn onClick={()=>guardar(false)} color={C.blue} outline>{saved?"✓ Guardado":"Guardar registros"}</Btn>
            {!sesionCumplida&&<Btn onClick={()=>guardar(true)} color={C.jade}>✓ Marcar sesión cumplida</Btn>}
            {sesionCumplida&&<Btn onClick={()=>setSesionCumplida(false)} color={C.amber} outline>Desmarcar cumplida</Btn>}
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans,alignSelf:"center" }}>{done}/{sesionActual.length} ejercicios ✓</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// CALENDARIO ATLETA
// ─────────────────────────────────────────
function CalendarioAtleta({ user }) {
  const [ciclo,setCiclo]=useState(null);
  const [plan,setPlan]=useState({});
  const [loading,setLoading]=useState(true);
  const [semSel,setSemSel]=useState(1);

  useEffect(()=>{cargar();},[]);

  const cargar=async()=>{
    const sb=await getSB();
    if (!sb){setLoading(false);return;}
    const {data:cs}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).order("created_at",{ascending:false}).limit(1);
    if (!cs?.length){setLoading(false);return;}
    const c=cs[0];setCiclo(c);
    const hoy=new Date();
    const inicio=new Date(c.fecha_inicio);
    const semActual=Math.min(c.semanas,Math.floor(Math.max(0,hoy-inicio)/(1000*60*60*24*7))+1);
    setSemSel(semActual);
    const {data:sps}=await sb.from("sesiones_plan").select("*,ejercicios(nombre,grupo_muscular)").eq("ciclo_id",c.id).order("semana").order("dia").order("orden");
    const org={};
    sps?.forEach(s=>{
      if (!org[s.semana]) org[s.semana]={};
      if (!org[s.semana][s.dia]) org[s.semana][s.dia]=[];
      org[s.semana][s.dia].push(s);
    });
    setPlan(org);
    setLoading(false);
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;
  if (!ciclo) return <div style={{padding:"28px 32px"}}><SectionHeader title="Mi calendario" sub="Sin ciclo activo"/><EmptyState title="Esperando plan del coach" sub="Tu coach todavía no creó tu ciclo de entrenamiento."/></div>;

  const tipoC=CICLOS_TIPOS.find(t=>t.key===ciclo.tipo)?.color||C.jade;
  const hoy=new Date();
  const inicio=new Date(ciclo.fecha_inicio);
  const semActual=Math.min(ciclo.semanas,Math.floor(Math.max(0,hoy-inicio)/(1000*60*60*24*7))+1);
  const semsArr=Array.from({length:ciclo.semanas},(_,i)=>i+1);
  const diasArr=Array.from({length:ciclo.sesiones_semana},(_,i)=>i+1);
  const semPlan=plan[semSel]||{};

  return (
    <div style={{ padding:"28px 32px",maxWidth:1000 }}>
      <SectionHeader title="Mi calendario" sub={`${ciclo.nombre} · ${ciclo.semanas} semanas · ${ciclo.sesiones_semana} días/semana`} tags={[{label:ciclo.tipo?.replace(/_/g," ")||"ciclo",color:tipoC}]}/>
      <div style={{ display:"flex",gap:8,marginBottom:24,flexWrap:"wrap" }}>
        {semsArr.map(s=>(
          <button key={s} onClick={()=>setSemSel(s)} style={{ padding:"7px 16px",borderRadius:9,border:`1.5px solid ${semSel===s?tipoC:s===semActual?tipoC+"55":C.border}`,background:semSel===s?tipoC+"1E":"transparent",color:semSel===s?tipoC:s===semActual?tipoC+"AA":C.textS,fontSize:12,fontWeight:semSel===s?700:400,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6 }}>
            Sem {s}
            {s<semActual&&<span style={{fontSize:10,color:tipoC}}>✓</span>}
            {s===semActual&&<Tag color={tipoC} sm>hoy</Tag>}
          </button>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${Math.min(ciclo.sesiones_semana,4)},1fr)`,gap:14 }}>
        {diasArr.map(dia=>{
          const ejsDia=semPlan[dia]||[];
          return (
            <Card key={dia} style={{ borderColor:ejsDia.length>0?C.borderH:C.border }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div style={{ fontFamily:F.serif,fontSize:16,color:C.white }}>{DIAS[dia]}</div>
                {ejsDia.length>0&&<Tag color={tipoC} sm>{ejsDia.length} ej.</Tag>}
              </div>
              {ejsDia.length===0?(
                <div style={{ fontSize:12,color:C.textD,fontFamily:F.sans,padding:"6px 0" }}>Descanso</div>
              ):ejsDia.map((ej,i)=>(
                <div key={ej.id} style={{ padding:"7px 0",borderBottom:i<ejsDia.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontSize:12,fontWeight:600,color:C.text,fontFamily:F.sans }}>{ej.ejercicios?.nombre}</div>
                  <div style={{ display:"flex",gap:8,marginTop:3,flexWrap:"wrap" }}>
                    <span style={{ fontSize:11,color:tipoC,fontFamily:F.sans }}>{ej.series}×{ej.reps}</span>
                    {ej.carga_kg&&<span style={{ fontSize:10,color:C.textS }}>{ej.carga_kg}kg</span>}
                    {ej.intensidad_pct&&<span style={{ fontSize:10,color:C.textS }}>{ej.intensidad_pct}%</span>}
                    {ej.notas_coach&&<span style={{ fontSize:10,color:C.amber }}>📌</span>}
                  </div>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
      {Object.keys(semPlan).length===0&&(
        <div style={{ marginTop:20,padding:"16px 20px",background:C.surface,border:`1px dashed ${C.border}`,borderRadius:12,textAlign:"center" }}>
          <span style={{ fontSize:13,color:C.textD,fontFamily:F.sans }}>Tu coach todavía no cargó ejercicios para esta semana</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// COACH — MIS ATLETAS (alta desde dashboard)
// ─────────────────────────────────────────
function nextCodigo(atletas) {
  const nums=atletas.map(a=>parseInt((a.atleta_codigo||"").replace("ATL-",""))||0).filter(n=>n>0);
  const max=nums.length?Math.max(...nums):0;
  return `ATL-${String(max+1).padStart(2,"0")}`;
}

function CoachAtletas({ onVerAtleta }) {
  const [atletas,setAtletas]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editando,setEditando]=useState(null);
  const [formEdit,setFormEdit]=useState({});
  const [nuevoModal,setNuevoModal]=useState(false);
  const [formNuevo,setFormNuevo]=useState({nombre:"",email:"",password:"",perfil_deporte:"",peso_actual:"",talla:""});
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState({tipo:"",texto:""});

  useEffect(()=>{cargar();},[]);

  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const {data}=await sb.from("profiles").select("*").eq("rol","atleta").order("atleta_codigo");
    setAtletas(data||[]);setLoading(false);
  };

  const guardarEdicion=async()=>{
    const sb=await getSB();
    await sb.from("profiles").update(formEdit).eq("id",editando.id);
    setEditando(null);cargar();
  };

  const crearAtleta=async()=>{
    if (!formNuevo.nombre||!formNuevo.email||!formNuevo.password){
      setMsg({tipo:"error",texto:"Nombre, email y contraseña son obligatorios"});return;
    }
    if (formNuevo.password.length<6){
      setMsg({tipo:"error",texto:"La contraseña debe tener al menos 6 caracteres"});return;
    }
    setSaving(true);setMsg({tipo:"",texto:""});
    try {
      // Generar UUID v4 en el cliente
      const newId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{
        const r=Math.random()*16|0;
        return (c==="x"?r:(r&0x3|0x8)).toString(16);
      });
      const codigo=nextCodigo(atletas);
      const sb=await getSB();
      // Insertar directo en profiles (sin pasar por Auth)
      const {error:profError}=await sb.from("profiles").insert({
        id:newId,
        atleta_codigo:codigo,
        nombre:formNuevo.nombre,
        rol:"atleta",
        perfil_deporte:formNuevo.perfil_deporte||null,
        peso_actual:formNuevo.peso_actual?parseFloat(formNuevo.peso_actual):null,
        talla:formNuevo.talla?parseFloat(formNuevo.talla):null,
        activo:true,
      });
      if (profError) throw new Error(profError.message);
      // Guardar en lista local USUARIOS para que pueda logearse
      USUARIOS.push({
        email:formNuevo.email,
        password:formNuevo.password,
        id:newId,
        nombre:formNuevo.nombre,
        rol:"atleta",
        atleta_codigo:codigo,
      });
      setMsg({tipo:"ok",texto:`✓ ${codigo} — ${formNuevo.nombre} creado. Ya puede ingresar.`});
      setFormNuevo({nombre:"",email:"",password:"",perfil_deporte:"",peso_actual:"",talla:""});
      await cargar();
    } catch(e) {
      setMsg({tipo:"error",texto:`Error: ${e.message}`});
    }
    setSaving(false);
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"16px",maxWidth:900 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
        <SectionHeader title="Mis atletas" sub={`${atletas.length} atletas registrados`}/>
        <Btn onClick={()=>{setNuevoModal(true);setMsg({tipo:"",texto:""});}}>+ Nuevo atleta</Btn>
      </div>

      {atletas.length===0?(
        <EmptyState title="Sin atletas todavía" sub="Creá el primero con el botón de arriba"/>
      ):(
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {atletas.map(a=>(
            <Card key={a.id}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                    <Tag color={C.jade} sm>{a.atleta_codigo||"—"}</Tag>
                    <Tag color={a.activo!==false?C.jade:C.textD} sm>{a.activo!==false?"Activo":"Inactivo"}</Tag>
                  </div>
                  <div style={{ fontSize:14,fontWeight:700,color:a.nombre?C.text:C.textD,fontFamily:F.sans,marginBottom:2 }}>{a.nombre||"Sin nombre"}</div>
                  <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>
                    {a.perfil_deporte||"Sin perfil"}{a.peso_actual?` · ${a.peso_actual}kg`:""}
                  </div>
                </div>
                <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                  <Btn sm onClick={()=>onVerAtleta&&onVerAtleta(a)} color={C.blue}>Ver</Btn>
                  <Btn sm outline onClick={()=>{setEditando(a);setFormEdit({nombre:a.nombre||"",perfil_deporte:a.perfil_deporte||"",peso_actual:a.peso_actual||"",talla:a.talla||"",activo:a.activo!==false});}}>Editar</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal editar */}
      <Modal open={!!editando} onClose={()=>setEditando(null)} title={`Editar ${editando?.atleta_codigo||"atleta"}`}>
        {/* Credenciales del atleta */}
        {editando&&(()=>{
          const u=USUARIOS.find(u=>u.id===editando.id);
          return u?(
            <div style={{ padding:"10px 14px",background:C.jade+"0E",border:`1px solid ${C.jade}30`,borderRadius:8,marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:700,color:C.jade,marginBottom:6,fontFamily:F.sans,letterSpacing:"0.06em" }}>CREDENCIALES DE ACCESO</div>
              <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>Email: <strong style={{color:C.text}}>{u.email}</strong></div>
              <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans,marginTop:3 }}>Contraseña: <strong style={{color:C.text}}>{u.password}</strong></div>
            </div>
          ):null;
        })()}
        <FInput label="Nombre completo" value={formEdit.nombre||""} onChange={e=>setFormEdit({...formEdit,nombre:e.target.value})}/>
        <FSelect label="Perfil deportivo" value={formEdit.perfil_deporte||""} onChange={e=>setFormEdit({...formEdit,perfil_deporte:e.target.value})} options={[{value:"",label:"Sin especificar"},...PERFILES_DEP.map(p=>({value:p,label:p}))]}/>
        <FInput label="Peso (kg)" value={formEdit.peso_actual||""} onChange={e=>setFormEdit({...formEdit,peso_actual:e.target.value})} type="number" step="0.1"/>
        <FInput label="Talla (cm)" value={formEdit.talla||""} onChange={e=>setFormEdit({...formEdit,talla:e.target.value})} type="number"/>
        <div style={{ display:"flex",gap:10,marginTop:4 }}>
          <Btn onClick={guardarEdicion} full>Guardar cambios</Btn>
          <Btn onClick={async()=>{
            if(!confirm("¿Borrar este atleta? Esta acción no se puede deshacer."))return;
            const sb=await getSB();
            await sb.from("profiles").delete().eq("id",editando.id);
            const idx=USUARIOS.findIndex(u=>u.id===editando.id);
            if(idx>=0)USUARIOS.splice(idx,1);
            setEditando(null);cargar();
          }} color={C.red} outline full>Borrar atleta</Btn>
          <Btn onClick={()=>setEditando(null)} outline full>Cancelar</Btn>
        </div>
      </Modal>

      {/* Modal nuevo atleta */}
      <Modal open={nuevoModal} onClose={()=>{setNuevoModal(false);setMsg({tipo:"",texto:""}); }} title="Nuevo atleta">
        <div style={{ padding:"10px 14px",background:C.jade+"0E",border:`1px solid ${C.jade}22`,borderRadius:8,marginBottom:16,fontSize:12,color:C.textS,fontFamily:F.sans }}>
          El código (ATL-01, ATL-02…) se asigna automáticamente. El atleta va a poder ingresar con el email y contraseña que definas acá.
        </div>
        <FInput label="Nombre completo" value={formNuevo.nombre} onChange={e=>setFormNuevo({...formNuevo,nombre:e.target.value})} placeholder="Ej: Juan Pérez"/>
        <FInput label="Email *" value={formNuevo.email} onChange={e=>setFormNuevo({...formNuevo,email:e.target.value})} type="email" placeholder="atleta@gmail.com"/>
        <FInput label="Contraseña *" value={formNuevo.password} onChange={e=>setFormNuevo({...formNuevo,password:e.target.value})} type="password" placeholder="Mínimo 6 caracteres"/>
        <FSelect label="Perfil deportivo" value={formNuevo.perfil_deporte} onChange={e=>setFormNuevo({...formNuevo,perfil_deporte:e.target.value})} options={[{value:"",label:"Sin especificar"},...PERFILES_DEP.map(p=>({value:p,label:p}))]}/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <FInput label="Peso (kg)" value={formNuevo.peso_actual} onChange={e=>setFormNuevo({...formNuevo,peso_actual:e.target.value})} type="number" step="0.1" placeholder="75"/>
          <FInput label="Talla (cm)" value={formNuevo.talla} onChange={e=>setFormNuevo({...formNuevo,talla:e.target.value})} type="number" placeholder="175"/>
        </div>
        {msg.texto&&(
          <div style={{ padding:"10px 14px",borderRadius:8,marginBottom:12,background:msg.tipo==="ok"?C.jade+"18":C.red+"18",border:`1px solid ${msg.tipo==="ok"?C.jade+"55":C.red+"55"}`,fontSize:12,color:msg.tipo==="ok"?C.jade:C.red,fontFamily:F.sans }}>
            {msg.texto}
          </div>
        )}
        <div style={{ display:"flex",gap:10 }}>
          {msg.tipo!=="ok"&&<Btn onClick={crearAtleta} disabled={saving||!formNuevo.email||!formNuevo.password} full>{saving?"Creando…":"Crear atleta"}</Btn>}
          <Btn onClick={()=>{setNuevoModal(false);setMsg({tipo:"",texto:""});}} outline full>{msg.tipo==="ok"?"Cerrar":"Cancelar"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────
// COACH — CICLOS
// ─────────────────────────────────────────
function CoachCiclos({ user }) {
  const [atletas,setAtletas]=useState([]);
  const [ciclos,setCiclos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({ atleta_id:"",nombre:"",tipo:"fza_potencia",fecha_inicio:new Date().toISOString().split("T")[0],semanas:4,sesiones_semana:3,notas:"" });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{cargar();},[]);

  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const [{data:ats},{data:cics}]=await Promise.all([
      sb.from("profiles").select("id,atleta_codigo,nombre").eq("rol","atleta").order("atleta_codigo"),
      sb.from("ciclos").select("*,profiles!ciclos_atleta_id_fkey(atleta_codigo,nombre)").order("created_at",{ascending:false}),
    ]);
    setAtletas(ats||[]);setCiclos(cics||[]);setLoading(false);
  };

  const crear=async()=>{
    if (!form.atleta_id||!form.nombre)return;
    setSaving(true);
    const sb=await getSB();
    const {error}=await sb.from("ciclos").insert({
      atleta_id:form.atleta_id,
      nombre:form.nombre,
      tipo:form.tipo,
      fecha_inicio:form.fecha_inicio,
      semanas:parseInt(form.semanas),
      sesiones_semana:parseInt(form.sesiones_semana),
      notas:form.notas||null,
      activo:true,
    });
    if (error){alert("Error al crear ciclo: "+error.message);setSaving(false);return;}
    await cargar();setModal(false);setSaving(false);
  };

  const toggleActivo=async(id,activo)=>{
    const sb=await getSB();
    await sb.from("ciclos").update({activo:!activo}).eq("id",id);
    cargar();
  };

  const cambiarSemana=async(id,sem)=>{
    const sb=await getSB();
    await sb.from("ciclos").update({semana_activa:sem}).eq("id",id);
    cargar();
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"28px 32px",maxWidth:900 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
        <SectionHeader title="Ciclos" sub="Creá y gestioná los bloques de tus atletas"/>
        <Btn onClick={()=>setModal(true)}>+ Nuevo ciclo</Btn>
      </div>
      {ciclos.length===0?<EmptyState title="Sin ciclos" sub="Creá el primer ciclo con el botón de arriba"/>:(
        <div style={{ display:"grid",gap:12 }}>
          {ciclos.map(c=>{
            const tipo=CICLOS_TIPOS.find(t=>t.key===c.tipo);
            return (
              <Card key={c.id}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                      <Tag color={tipo?.color||C.jade} sm>{c.tipo?.replace(/_/g," ")||"ciclo"}</Tag>
                      <Tag color={c.activo?C.jade:C.textD} sm>{c.activo?"Activo":"Inactivo"}</Tag>
                    </div>
                    <div style={{ fontFamily:F.serif,fontSize:17,color:C.white,marginBottom:2 }}>{c.nombre}</div>
                    <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>
                      {c.profiles?.atleta_codigo} — {c.profiles?.nombre||"Sin nombre"} · {c.semanas} sem · {c.sesiones_semana} días/sem · Inicio: {c.fecha_inicio}
                    </div>
                    {c.activo&&(
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap" }}>
                        <span style={{ fontSize:11,color:C.textS,fontFamily:F.sans }}>Semana activa:</span>
                        {Array.from({length:c.semanas},(_,i)=>i+1).map(s=>(
                          <button key={s} onClick={()=>cambiarSemana(c.id,s)} style={{ width:28,height:28,borderRadius:6,border:`1.5px solid ${(c.semana_activa||1)===s?C.jade:C.border}`,background:(c.semana_activa||1)===s?C.jade+"22":"transparent",color:(c.semana_activa||1)===s?C.jade:C.textS,fontSize:11,fontWeight:(c.semana_activa||1)===s?700:400,cursor:"pointer",fontFamily:F.sans }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Btn sm outline onClick={()=>toggleActivo(c.id,c.activo)} color={c.activo?C.red:C.jade}>
                    {c.activo?"Desactivar":"Activar"}
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo ciclo">
        <FSelect label="Atleta" value={form.atleta_id} onChange={e=>setForm({...form,atleta_id:e.target.value})}
          options={[{value:"",label:"— Elegir atleta —"},...atletas.map(a=>({value:a.id,label:`${a.atleta_codigo||"?"} — ${a.nombre||"Sin nombre"}`}))]}/>
        <FInput label="Nombre del ciclo *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Bloque Potencia Mayo 2025"/>
        <FSelect label="Tipo de ciclo" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}
          options={CICLOS_TIPOS.map(c=>({value:c.key,label:`${c.label} · ${c.pct}% · ${c.reps} reps`}))}/>
        <FInput label="Fecha de inicio" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})} type="date"/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>Semanas: <strong style={{color:C.text}}>{form.semanas}</strong></div>
            <input type="range" min={2} max={12} value={form.semanas} onChange={e=>setForm({...form,semanas:e.target.value})} style={{ width:"100%",accentColor:C.jade }}/>
          </div>
          <div>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>Días/sem: <strong style={{color:C.text}}>{form.sesiones_semana}</strong></div>
            <input type="range" min={2} max={5} value={form.sesiones_semana} onChange={e=>setForm({...form,sesiones_semana:e.target.value})} style={{ width:"100%",accentColor:C.blue }}/>
          </div>
        </div>
        <FInput label="Notas (opcional)" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} placeholder="Objetivos del bloque..."/>
        <div style={{ display:"flex",gap:10,marginTop:4 }}>
          <Btn onClick={crear} disabled={saving||!form.atleta_id||!form.nombre} full>{saving?"Creando…":"Crear ciclo"}</Btn>
          <Btn onClick={()=>setModal(false)} outline full>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────
// COACH — PLANIFICAR
// ─────────────────────────────────────────
function CoachPlanificar({ user }) {
  const [atletas,setAtletas]=useState([]);
  const [ciclos,setCiclos]=useState([]);
  const [ejercicios,setEjercicios]=useState([]);
  const [atletaSel,setAtletaSel]=useState("");
  const [cicloSel,setCicloSel]=useState("");
  const [semSel,setSemSel]=useState(1);
  const [diaSel,setDiaSel]=useState(1);
  const [plan,setPlan]=useState({});
  const [loading,setLoading]=useState(true);
  const [addModal,setAddModal]=useState(false);
  const [form,setForm]=useState({ejercicio_id:"",busqueda:"",series:3,reps:"8",intensidad_pct:"",carga_kg:"",descanso_seg:"120",rir:"",notas_coach:""});
  const [saving,setSaving]=useState(false);
  const [dupModal,setDupModal]=useState(false);
  const [dupTipo,setDupTipo]=useState("dia"); // "dia" | "semana"
  const [dupSemsDest,setDupSemsDest]=useState([]);
  const [dupDiaDest,setDupDiaDest]=useState(1);
  const [dupProgresion,setDupProgresion]=useState(0); // % extra por semana
  const [dupSaving,setDupSaving]=useState(false);

  useEffect(()=>{init();},[]);
  useEffect(()=>{if(atletaSel)cargarCiclos(atletaSel);},[atletaSel]);
  useEffect(()=>{if(cicloSel)cargarPlan(cicloSel);},[cicloSel]);

  const init=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const [{data:ats},{data:ejs}]=await Promise.all([
      sb.from("profiles").select("id,atleta_codigo,nombre").eq("rol","atleta").order("atleta_codigo"),
      sb.from("ejercicios").select("id,nombre,grupo_muscular").order("nombre"),
    ]);
    setAtletas(ats||[]);setEjercicios(ejs||[]);setLoading(false);
  };

  const cargarCiclos=async(id)=>{
    const sb=await getSB();
    const {data}=await sb.from("ciclos").select("*").eq("atleta_id",id).order("created_at",{ascending:false});
    setCiclos(data||[]);
    if (data?.length){setCicloSel(String(data[0].id));setSemSel(1);setDiaSel(1);}
    else{setCicloSel("");setPlan({});}
  };

  const cargarPlan=async(cId)=>{
    const sb=await getSB();
    const {data}=await sb.from("sesiones_plan").select("*,ejercicios(nombre,grupo_muscular)").eq("ciclo_id",parseInt(cId)).order("semana").order("dia").order("orden");
    const org={};
    data?.forEach(s=>{
      if(!org[s.semana])org[s.semana]={};
      if(!org[s.semana][s.dia])org[s.semana][s.dia]=[];
      org[s.semana][s.dia].push(s);
    });
    setPlan(org);
  };

  const agregar=async()=>{
    if (!form.ejercicio_id||!cicloSel)return;
    setSaving(true);
    const sb=await getSB();
    const orden=(plan[semSel]?.[diaSel]||[]).length+1;
    const {error:insErr}=await sb.from("sesiones_plan").insert({
      ciclo_id:parseInt(cicloSel),semana:semSel,dia:diaSel,orden,
      ejercicio_id:parseInt(form.ejercicio_id),
      series:parseInt(form.series)||3,
      reps:form.reps||"8",
      intensidad_pct:form.intensidad_pct?parseFloat(form.intensidad_pct):null,
      carga_kg:form.carga_kg?parseFloat(form.carga_kg):null,
      descanso_seg:form.descanso_seg?parseInt(form.descanso_seg):120,
      rir:form.rir?parseInt(form.rir):null,
      notas_coach:form.notas_coach||null,
    });
    if(insErr){alert("Error: "+insErr.message);setSaving(false);return;}
    await cargarPlan(cicloSel);
    setForm({ejercicio_id:"",busqueda:"",series:3,reps:"8",intensidad_pct:"",carga_kg:"",descanso_seg:"120",rir:"",notas_coach:""});
    setAddModal(false);setSaving(false);
  };

  const eliminar=async(id)=>{
    const sb=await getSB();
    await sb.from("sesiones_plan").delete().eq("id",id);
    cargarPlan(cicloSel);
  };

  // Duplicar día actual a otras semanas (con o sin progresión)
  const duplicarDia=async()=>{
    if (!dupSemsDest.length||!cicloSel)return;
    setDupSaving(true);
    const sb=await getSB();
    const origen=plan[semSel]?.[diaSel]||[];
    if (!origen.length){setDupSaving(false);return;}
    const rows=[];
    dupSemsDest.forEach(semDest=>{
      const factor=1+(parseFloat(dupProgresion)||0)/100*(semDest-semSel);
      origen.forEach((ej,i)=>{
        const nuevaCarga=ej.carga_kg?Math.round(ej.carga_kg*factor*100)/100:null;
        rows.push({
          ciclo_id:parseInt(cicloSel),
          semana:semDest,
          dia:dupTipo==="dia"?dupDiaDest:ej.dia,
          orden:i+1,
          ejercicio_id:ej.ejercicio_id,
          series:ej.series,
          reps:ej.reps,
          intensidad_pct:ej.intensidad_pct,
          carga_kg:nuevaCarga,
          descanso_seg:ej.descanso_seg,
          rir:ej.rir,
          notas_coach:ej.notas_coach,
        });
      });
    });
    const {error}=await sb.from("sesiones_plan").insert(rows);
    if (error){alert("Error al duplicar: "+error.message);}
    else{await cargarPlan(cicloSel);}
    setDupModal(false);setDupSaving(false);setDupSemsDest([]);
  };

  // Duplicar semana entera a otras semanas
  const duplicarSemana=async()=>{
    if (!dupSemsDest.length||!cicloSel)return;
    setDupSaving(true);
    const sb=await getSB();
    const semOrigen=plan[semSel]||{};
    const rows=[];
    dupSemsDest.forEach(semDest=>{
      const factor=1+(parseFloat(dupProgresion)||0)/100*(semDest-semSel);
      Object.entries(semOrigen).forEach(([dia,ejerciciosDia])=>{
        ejerciciosDia.forEach((ej,i)=>{
          const nuevaCarga=ej.carga_kg?Math.round(ej.carga_kg*factor*100)/100:null;
          rows.push({
            ciclo_id:parseInt(cicloSel),
            semana:semDest,
            dia:parseInt(dia),
            orden:i+1,
            ejercicio_id:ej.ejercicio_id,
            series:ej.series,
            reps:ej.reps,
            intensidad_pct:ej.intensidad_pct,
            carga_kg:nuevaCarga,
            descanso_seg:ej.descanso_seg,
            rir:ej.rir,
            notas_coach:ej.notas_coach,
          });
        });
      });
    });
    const {error}=await sb.from("sesiones_plan").insert(rows);
    if (error){alert("Error al duplicar: "+error.message);}
    else{await cargarPlan(cicloSel);}
    setDupModal(false);setDupSaving(false);setDupSemsDest([]);
  };

  const toggleSemDest=(s)=>{
    setDupSemsDest(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  };

  const cicloActual=ciclos.find(c=>String(c.id)===cicloSel);
  const diasDisp=cicloActual?Array.from({length:cicloActual.sesiones_semana},(_,i)=>i+1):[1,2,3];
  const semsDisp=cicloActual?Array.from({length:cicloActual.semanas},(_,i)=>i+1):[1,2,3,4];
  const ejsDia=plan[semSel]?.[diaSel]||[];

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"28px 32px",maxWidth:1000 }}>
      <SectionHeader title="Planificar" sub="Asigná ejercicios por atleta · semana · día"/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
        <FSelect label="Atleta" value={atletaSel} onChange={e=>setAtletaSel(e.target.value)}
          options={[{value:"",label:"— Elegir atleta —"},...atletas.map(a=>({value:a.id,label:`${a.atleta_codigo||"?"} — ${a.nombre||"Sin nombre"}`}))]}/>
        <FSelect label="Ciclo" value={cicloSel} onChange={e=>setCicloSel(e.target.value)}
          options={[{value:"",label:"— Elegir ciclo —"},...ciclos.map(c=>({value:String(c.id),label:`${c.nombre} (${c.semanas} sem)`}))]}/>
      </div>
      {cicloSel&&(
        <>
          <div style={{ display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center" }}>
            <span style={{ fontSize:11,color:C.textS,fontFamily:F.sans,minWidth:60 }}>SEMANA:</span>
            {semsDisp.map(s=>(
              <button key={s} onClick={()=>setSemSel(s)} style={{ padding:"6px 14px",borderRadius:8,border:`1.5px solid ${semSel===s?C.jade:C.border}`,background:semSel===s?C.jade+"18":"transparent",color:semSel===s?C.jade:C.textS,fontSize:12,fontWeight:semSel===s?700:400,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6 }}>
                Sem {s}
                {(Object.values(plan[s]||{}).flat().length>0)&&<span style={{ fontSize:9,background:C.jade+"33",color:C.jade,borderRadius:99,padding:"1px 5px" }}>{Object.values(plan[s]||{}).flat().length}</span>}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
            <span style={{ fontSize:11,color:C.textS,fontFamily:F.sans,minWidth:60 }}>DÍA:</span>
            {diasDisp.map(d=>(
              <button key={d} onClick={()=>setDiaSel(d)} style={{ padding:"6px 14px",borderRadius:8,border:`1.5px solid ${diaSel===d?C.blue:C.border}`,background:diaSel===d?C.blue+"18":"transparent",color:diaSel===d?C.blue:C.textS,fontSize:12,fontWeight:diaSel===d?700:400,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6 }}>
                {DIAS[d]}
                {(plan[semSel]?.[d]||[]).length>0&&<span style={{ fontSize:9,background:C.blue+"33",color:C.blue,borderRadius:99,padding:"1px 5px" }}>{(plan[semSel]?.[d]||[]).length}</span>}
              </button>
            ))}
          </div>
          <Card style={{ marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8 }}>
              <div style={{ fontFamily:F.serif,fontSize:17,color:C.white }}>
                Semana {semSel} · {DIAS[diaSel]}
                <span style={{ fontSize:12,color:C.textS,fontFamily:F.sans,marginLeft:10 }}>{ejsDia.length} ejercicios</span>
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {ejsDia.length>0&&<Btn sm outline color={C.amber} onClick={()=>{setDupTipo("dia");setDupSemsDest([]);setDupProgresion(0);setDupDiaDest(diaSel);setDupModal(true);}}>⧉ Duplicar día</Btn>}
                {Object.values(plan[semSel]||{}).flat().length>0&&<Btn sm outline color={C.violet} onClick={()=>{setDupTipo("semana");setDupSemsDest([]);setDupProgresion(0);setDupModal(true);}}>⧉ Duplicar semana</Btn>}
                <Btn sm onClick={()=>setAddModal(true)}>+ Agregar</Btn>
              </div>
            </div>
            {ejsDia.length===0?(
              <div style={{ textAlign:"center",padding:"24px 0",color:C.textD,fontFamily:F.sans,fontSize:13 }}>Sin ejercicios · hacé clic en "+ Agregar ejercicio"</div>
            ):(
              <div style={{ display:"grid",gap:8 }}>
                {ejsDia.map((ej,i)=>(
                  <div key={ej.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}` }}>
                    <div style={{ width:24,height:24,borderRadius:6,background:C.jade+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.jade,fontWeight:700,flexShrink:0 }}>{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans }}>{ej.ejercicios?.nombre}</div>
                      <div style={{ display:"flex",gap:8,marginTop:3,flexWrap:"wrap",alignItems:"center" }}>
                        <span style={{ fontSize:12,color:C.jade,fontWeight:700 }}>{ej.series}×{ej.reps}</span>
                        {ej.carga_kg&&<Tag color={C.blue} sm>{ej.carga_kg}kg</Tag>}
                        {ej.intensidad_pct&&<Tag color={C.violet} sm>{ej.intensidad_pct}%</Tag>}
                        {ej.descanso_seg&&<Tag color={C.textS} sm>⏱ {ej.descanso_seg}"</Tag>}
                        {ej.rir!=null&&ej.rir!==""&&<Tag color={C.amber} sm>RIR {ej.rir}</Tag>}
                        {ej.notas_coach&&<span style={{ fontSize:10,color:C.amber }}>📌 {ej.notas_coach}</span>}
                      </div>
                    </div>
                    <button onClick={()=>eliminar(ej.id)} style={{ background:"none",border:"none",color:C.textD,cursor:"pointer",fontSize:18,padding:"2px 6px",lineHeight:1 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
      {!atletaSel&&<EmptyState title="Elegí un atleta" sub="Seleccioná un atleta y su ciclo para empezar a planificar"/>}

      {/* Modal duplicar */}
      <Modal open={dupModal} onClose={()=>setDupModal(false)} title={dupTipo==="dia"?`Duplicar ${DIAS[diaSel]} (Sem ${semSel})`:`Duplicar Semana ${semSel} completa`}>
        <div style={{ padding:"10px 14px",background:dupTipo==="semana"?C.violet+"0E":C.amber+"0E",border:`1px solid ${dupTipo==="semana"?C.violet:C.amber}30`,borderRadius:8,marginBottom:16,fontSize:12,color:C.textS,fontFamily:F.sans }}>
          {dupTipo==="dia"
            ? `Se copiarán los ${ejsDia.length} ejercicios del ${DIAS[diaSel]} a las semanas que elijas.`
            : `Se copiarán todos los días de la Semana ${semSel} (${Object.values(plan[semSel]||{}).flat().length} ejercicios en total) a las semanas que elijas.`
          }
        </div>

        {/* Selector semanas destino */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>Copiar a las semanas:</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {semsDisp.filter(s=>s!==semSel).map(s=>(
              <button key={s} onClick={()=>toggleSemDest(s)} style={{ padding:"7px 16px",borderRadius:8,border:`1.5px solid ${dupSemsDest.includes(s)?(dupTipo==="semana"?C.violet:C.amber):C.border}`,background:dupSemsDest.includes(s)?(dupTipo==="semana"?C.violet+"22":C.amber+"22"):"transparent",color:dupSemsDest.includes(s)?(dupTipo==="semana"?C.violet:C.amber):C.textS,fontSize:12,fontWeight:dupSemsDest.includes(s)?700:400,cursor:"pointer",fontFamily:F.sans }}>
                Sem {s} {plan[s]&&Object.values(plan[s]).flat().length>0?"●":""}
              </button>
            ))}
          </div>
          {dupSemsDest.length>0&&(
            <div style={{ fontSize:11,color:C.textS,marginTop:6,fontFamily:F.sans }}>
              {dupSemsDest.length} semana{dupSemsDest.length>1?"s":""} seleccionada{dupSemsDest.length>1?"s":""}
              {plan[dupSemsDest[0]]&&Object.values(plan[dupSemsDest[0]]).flat().length>0&&
                <span style={{color:C.amber}}> · ⚠ ya tienen ejercicios (se agregarán)</span>
              }
            </div>
          )}
        </div>

        {/* Selector día destino (solo para duplicar día) */}
        {dupTipo==="dia"&&(
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>En qué día pegarlo:</div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {diasDisp.map(d=>(
                <button key={d} onClick={()=>setDupDiaDest(d)} style={{ padding:"7px 16px",borderRadius:8,border:`1.5px solid ${dupDiaDest===d?C.amber:C.border}`,background:dupDiaDest===d?C.amber+"22":"transparent",color:dupDiaDest===d?C.amber:C.textS,fontSize:12,fontWeight:dupDiaDest===d?700:400,cursor:"pointer",fontFamily:F.sans }}>
                  {DIAS[d]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Progresión */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>
            Progresión de carga por semana: <strong style={{color:dupProgresion>0?C.jade:C.text}}>{dupProgresion>0?`+${dupProgresion}%`:"Sin cambio (copia exacta)"}</strong>
          </div>
          <input type="range" min={0} max={10} step={2.5} value={dupProgresion} onChange={e=>setDupProgresion(parseFloat(e.target.value))} style={{ width:"100%",accentColor:C.jade }}/>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:C.textD,fontFamily:F.sans,marginTop:4 }}>
            <span>Copia exacta</span><span>+2.5%/sem</span><span>+5%/sem</span><span>+7.5%/sem</span><span>+10%/sem</span>
          </div>
          {dupProgresion>0&&<div style={{ fontSize:11,color:C.textS,marginTop:6,fontFamily:F.sans }}>
            Solo afecta la carga en kg. Series y reps se copian igual.
          </div>}
        </div>

        <div style={{ display:"flex",gap:10 }}>
          <Btn
            onClick={dupTipo==="dia"?duplicarDia:duplicarSemana}
            disabled={dupSaving||!dupSemsDest.length}
            color={dupTipo==="semana"?C.violet:C.amber}
            full
          >{dupSaving?"Duplicando…":`Duplicar a ${dupSemsDest.length} semana${dupSemsDest.length!==1?"s":""}`}</Btn>
          <Btn onClick={()=>setDupModal(false)} outline full>Cancelar</Btn>
        </div>
      </Modal>
      <Modal open={addModal} onClose={()=>setAddModal(false)} title={`Sem ${semSel} · ${DIAS[diaSel]} · Agregar ejercicio`}>
        {/* Búsqueda de ejercicio */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.sans }}>Ejercicio *</div>
          <input
            value={form.busqueda||""}
            onChange={e=>{
              setForm({...form,busqueda:e.target.value,ejercicio_id:""});
            }}
            placeholder="Escribí para buscar..."
            style={{ width:"100%",padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box",marginBottom:4 }}
          />
          {form.busqueda&&!form.ejercicio_id&&(
            <div style={{ maxHeight:180,overflowY:"auto",background:C.deep,border:`1px solid ${C.border}`,borderRadius:8 }}>
              {ejercicios.filter(e=>e.nombre.toLowerCase().includes((form.busqueda||"").toLowerCase())).slice(0,8).map(e=>(
                <div key={e.id} onClick={()=>setForm({...form,ejercicio_id:String(e.id),busqueda:e.nombre})}
                  style={{ padding:"9px 12px",cursor:"pointer",fontSize:12,color:C.text,fontFamily:F.sans,borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={ev=>ev.currentTarget.style.background=C.surface}
                  onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                  <strong>{e.nombre}</strong>
                  {e.grupo_muscular&&<span style={{color:C.textS}}> · {e.grupo_muscular}</span>}
                </div>
              ))}
              {ejercicios.filter(e=>e.nombre.toLowerCase().includes((form.busqueda||"").toLowerCase())).length===0&&(
                <div style={{ padding:"9px 12px",fontSize:12,color:C.textD,fontFamily:F.sans }}>Sin resultados</div>
              )}
            </div>
          )}
          {form.ejercicio_id&&<div style={{ fontSize:11,color:C.jade,fontFamily:F.sans }}>✓ {form.busqueda}</div>}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
          <FInput label="Series" value={form.series} onChange={e=>setForm({...form,series:e.target.value})} type="number" min="1" max="10"/>
          <FInput label="Reps" value={form.reps} onChange={e=>setForm({...form,reps:e.target.value})} placeholder="8 | 8-10 | AMRAP"/>
          <FInput label="Pausa (seg)" value={form.descanso_seg||""} onChange={e=>setForm({...form,descanso_seg:e.target.value})} type="number" min="0" step="15" placeholder="120"/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
          <FInput label="% 1RM" value={form.intensidad_pct} onChange={e=>setForm({...form,intensidad_pct:e.target.value})} type="number" min="0" max="110" step="2.5" placeholder="75"/>
          <FInput label="Carga kg" value={form.carga_kg} onChange={e=>setForm({...form,carga_kg:e.target.value})} type="number" min="0" step="2.5" placeholder="100"/>
          <FInput label="RIR" value={form.rir||""} onChange={e=>setForm({...form,rir:e.target.value})} type="number" min="0" max="5" placeholder="2"/>
        </div>
        <FInput label="Observación para el atleta" value={form.notas_coach} onChange={e=>setForm({...form,notas_coach:e.target.value})} placeholder="Pausa en fondo, explosivo en subida, técnica estricta..."/>
        <div style={{ display:"flex",gap:10 }}>
          <Btn onClick={agregar} disabled={saving||!form.ejercicio_id} full>{saving?"Guardando…":"Agregar ejercicio"}</Btn>
          <Btn onClick={()=>setAddModal(false)} outline full>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────
// COACH — EJERCICIOS
// ─────────────────────────────────────────
function CoachEjercicios({ user }) {
  const [ejercicios,setEjercicios]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [filtro,setFiltro]=useState("");
  const [form,setForm]=useState({nombre:"",grupo_muscular:"",patron_movimiento:"",nivel:"intermedio",tipo:"principal"});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{cargar();},[]);

  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const {data}=await sb.from("ejercicios").select("*").order("grupo_muscular,nombre");
    setEjercicios(data||[]);setLoading(false);
  };

  const eliminarEjercicio=async(id,nombre)=>{
    if (!confirm(`¿Eliminar "${nombre}"?`))return;
    const sb=await getSB();
    await sb.from("ejercicios").delete().eq("id",id);
    cargar();
  };

  const guardar=async()=>{
    if (!form.nombre)return;
    setSaving(true);
    const sb=await getSB();
    await sb.from("ejercicios").insert({...form,creado_por:user.id});
    await cargar();
    setForm({nombre:"",grupo_muscular:"",patron_movimiento:"",nivel:"intermedio",tipo:"principal"});
    setModal(false);setSaving(false);
  };

  const GRUPOS = ['Todos','Hombros','Espalda','Pecho','Pierna','Core','Biceps','Triceps','Olimpico','CrossFit'];
  const grupoColor = {'Hombros':C.blue,'Espalda':C.jade,'Pecho':C.red,'Pierna':C.amber,'Core':C.violet,'Bíceps':'#4ade80','Tríceps':'#f97316','Olímpico':'#06b6d4','CrossFit':'#ec4899'};
  const [grupoSel,setGrupoSel]=useState('Todos');
  const filtrados=ejercicios.filter(e=>{
    const matchQ=!filtro||e.nombre.toLowerCase().includes(filtro.toLowerCase());
    const matchG=grupoSel==='Todos'||(e.grupo_muscular||'')=== grupoSel;
    return matchQ&&matchG;
  });
  const nC={avanzado:C.red,intermedio:C.amber,basico:C.jade};
  const tC={principal:C.blue,accesorio:C.violet,cardio:C.amber,movilidad:C.jade};

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"16px",maxWidth:920 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <SectionHeader title="Ejercicios" sub={`${filtrados.length} de ${ejercicios.length} ejercicios`}/>
        <Btn onClick={()=>setModal(true)} sm>+ Nuevo</Btn>
      </div>
      {/* Filtro por grupo */}
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:12 }}>
        {GRUPOS.map(g=>(
          <button key={g} onClick={()=>setGrupoSel(g)} style={{ padding:"5px 12px",borderRadius:99,border:`1.5px solid ${grupoSel===g?(grupoColor[g]||C.jade):C.border}`,background:grupoSel===g?(grupoColor[g]||C.jade)+"22":"transparent",color:grupoSel===g?(grupoColor[g]||C.jade):C.textS,fontSize:11,fontWeight:grupoSel===g?700:400,cursor:"pointer",fontFamily:F.sans }}>
            {g}
          </button>
        ))}
      </div>
      <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar por nombre..." style={{ width:"100%",padding:"9px 13px",background:C.card,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,marginBottom:12,boxSizing:"border-box" }}/>
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"9px 18px",fontSize:10,fontWeight:700,color:C.textD,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontFamily:F.sans }}>
          {filtrados.length} ejercicio{filtrados.length!==1?"s":""}
        </div>
        {filtrados.map((e,i)=>(
          <div key={e.id} style={{ padding:"11px 18px",borderBottom:i<filtrados.length-1?`1px solid ${C.border}`:"none" }}
            onMouseEnter={ev=>ev.currentTarget.style.background=C.surface}
            onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans }}>{e.nombre}</div>
                <div style={{ display:"flex",gap:6,marginTop:2 }}>
                  <Tag color={grupoColor[e.grupo_muscular]||C.textS} sm>{e.grupo_muscular||"—"}</Tag>
                  <Tag color={nC[e.nivel]||C.jade} sm>{e.nivel||"—"}</Tag>
                  <Tag color={tC[e.tipo]||C.jade} sm>{e.tipo||"—"}</Tag>
                </div>
              </div>
              <button onClick={()=>eliminarEjercicio(e.id,e.nombre)} style={{ background:"none",border:"none",color:C.textD,cursor:"pointer",fontSize:16,padding:"4px 8px",flexShrink:0 }} title="Eliminar">✕</button>
            </div>
          </div>
        ))}
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo ejercicio">
        <FInput label="Nombre *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Zancada con mancuernas"/>
        <FSelect label="Grupo muscular" value={form.grupo_muscular} onChange={e=>setForm({...form,grupo_muscular:e.target.value})}
          options={[{value:"",label:"— Elegir grupo —"},{value:"Hombros",label:"Hombros"},{value:"Espalda",label:"Espalda"},{value:"Pecho",label:"Pecho"},{value:"Pierna",label:"Pierna"},{value:"Core",label:"Core / Abdomen"},{value:"Bíceps",label:"Bíceps"},{value:"Tríceps",label:"Tríceps"},{value:"Olímpico",label:"Levantamiento Olímpico"},{value:"CrossFit",label:"CrossFit"},{value:"Full body",label:"Full body"}]}/>
        <FSelect label="Patrón de movimiento" value={form.patron_movimiento} onChange={e=>setForm({...form,patron_movimiento:e.target.value})}
          options={[{value:"",label:"— Elegir —"},...PATRONES.map(p=>({value:p,label:p}))]}/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <FSelect label="Nivel" value={form.nivel} onChange={e=>setForm({...form,nivel:e.target.value})}
            options={[{value:"basico",label:"Básico"},{value:"intermedio",label:"Intermedio"},{value:"avanzado",label:"Avanzado"}]}/>
          <FSelect label="Tipo" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}
            options={[{value:"principal",label:"Principal"},{value:"accesorio",label:"Accesorio"},{value:"cardio",label:"Cardio"},{value:"movilidad",label:"Movilidad"}]}/>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:4 }}>
          <Btn onClick={guardar} disabled={saving||!form.nombre} full>{saving?"Guardando…":"Guardar ejercicio"}</Btn>
          <Btn onClick={()=>setModal(false)} outline full>Cancelar</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────
// BIOMARCADORES
// ─────────────────────────────────────────
function Biomarcadores({ user }) {
  const [form,setForm]=useState({peso_kg:"",hrv:"",fc_reposo:"",calidad_sueno:7,dolor_muscular:3,estres:3,motivacion:8});
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{cargar();},[]);
  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const today=new Date().toISOString().split("T")[0];
    const {data}=await sb.from("biomarcadores").select("*").eq("atleta_id",user.id).eq("fecha",today).single();
    if (data) setForm({peso_kg:data.peso_kg||"",hrv:data.hrv||"",fc_reposo:data.fc_reposo||"",calidad_sueno:data.calidad_sueno||7,dolor_muscular:data.dolor_muscular||3,estres:data.estres||3,motivacion:data.motivacion||8});
    setLoading(false);
  };

  const guardar=async()=>{
    const sb=await getSB();if(!sb){alert("Sin conexión a Supabase");return;}
    const today=new Date().toISOString().split("T")[0];
    const row={
      atleta_id:user.id,
      fecha:today,
      peso_kg:form.peso_kg?parseFloat(form.peso_kg):null,
      hrv:form.hrv?parseFloat(form.hrv):null,
      fc_reposo:form.fc_reposo?parseInt(form.fc_reposo):null,
      calidad_sueno:form.calidad_sueno,
      dolor_muscular:form.dolor_muscular,
      estres:form.estres,
      motivacion:form.motivacion,
    };
    // Buscar si ya existe registro de hoy
    const {data:existing}=await sb.from("biomarcadores").select("id").eq("atleta_id",user.id).eq("fecha",today).single().catch(()=>({data:null}));
    let err;
    if(existing?.id){
      const res=await sb.from("biomarcadores").update(row).eq("id",existing.id);
      err=res.error;
    } else {
      const res=await sb.from("biomarcadores").insert(row);
      err=res.error;
    }
    if(err){alert("Error al guardar: "+err.message);return;}
    setSaved(true);setTimeout(()=>setSaved(false),3000);
  };

  const readiness=Math.round((form.calidad_sueno/10*25)+(form.motivacion/10*25)+((10-form.estres)/10*25)+((10-form.dolor_muscular)/10*25));
  const rC=readiness>=75?C.jade:readiness>=50?C.amber:C.red;

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  const rangos=[
    {k:"calidad_sueno",l:"Calidad sueño",min:1,max:10,pos:true},
    {k:"dolor_muscular",l:"DOMS / Dolor muscular",min:0,max:10,pos:false},
    {k:"estres",l:"Nivel de estrés",min:0,max:10,pos:false},
    {k:"motivacion",l:"Motivación",min:1,max:10,pos:true},
  ];

  return (
    <div style={{ padding:"28px 32px",maxWidth:720 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
        <SectionHeader title="Biomarcadores" sub={new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}/>
        <div style={{ textAlign:"center",padding:"14px 22px",background:rC+"14",border:`1px solid ${rC}44`,borderRadius:14,boxShadow:readiness>=75?`0 0 20px ${C.jade}22`:"none" }}>
          <div style={{ fontSize:36,fontWeight:400,color:rC,fontFamily:F.serif,lineHeight:1 }}>{readiness}</div>
          <div style={{ fontSize:9,fontWeight:700,color:rC,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:F.sans }}>readiness</div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14 }}>
        <FInput label="Peso (kg)" value={form.peso_kg} onChange={e=>setForm({...form,peso_kg:e.target.value})} type="number" step="0.1" placeholder="82.4"/>
        <FInput label="HRV (ms)" value={form.hrv} onChange={e=>setForm({...form,hrv:e.target.value})} type="number" placeholder="68"/>
        <FInput label="FC reposo (bpm)" value={form.fc_reposo} onChange={e=>setForm({...form,fc_reposo:e.target.value})} type="number" placeholder="54"/>
      </div>
      {rangos.map(c=>{
        const v=form[c.k];
        const col=c.pos?(v>=7?C.jade:v>=5?C.amber:C.red):(v>=7?C.red:v>=4?C.amber:C.jade);
        return (
          <Card key={c.k} style={{ marginBottom:10 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans }}>{c.l}</div>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <span style={{ fontSize:26,fontWeight:400,color:col,fontFamily:F.serif,minWidth:28,textAlign:"right" }}>{v}</span>
                <input type="range" min={c.min} max={c.max} value={v} onChange={e=>setForm({...form,[c.k]:Number(e.target.value)})} style={{ width:140,accentColor:col }}/>
              </div>
            </div>
          </Card>
        );
      })}
      <Btn onClick={guardar} style={{marginTop:8}}>{saved?"✓ Registrado":"Guardar biomarcadores"}</Btn>
    </div>
  );
}

// ─────────────────────────────────────────
// MARCAS
// ─────────────────────────────────────────
function Marcas({ user }) {
  const [marcas,setMarcas]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{cargar();},[]);
  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const {data}=await sb.from("marcas").select("*,ejercicios(nombre)").eq("atleta_id",user.id).order("fecha",{ascending:false});
    setMarcas(data||[]);setLoading(false);
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"28px 32px",maxWidth:820 }}>
      <SectionHeader title="Mis marcas" sub="1RM real y estimado — Epley: kg × (1 + reps/30)"/>
      {marcas.length===0?<EmptyState title="Sin marcas todavía" sub="Tus marcas aparecerán acá a medida que entrenes"/>:(
        <Card style={{ padding:0,overflow:"hidden" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 130px 130px 110px",padding:"9px 18px",fontSize:10,fontWeight:700,color:C.textD,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontFamily:F.sans }}>
            <div>Ejercicio</div><div>1RM Real</div><div>Estimado</div><div>Fecha</div>
          </div>
          {marcas.map((m,i)=>(
            <div key={m.id} style={{ display:"grid",gridTemplateColumns:"1fr 130px 130px 110px",padding:"13px 18px",alignItems:"center",borderBottom:i<marcas.length-1?`1px solid ${C.border}`:"none" }}>
              <div style={{ fontFamily:F.sans,fontSize:13,fontWeight:600,color:C.text }}>{m.ejercicios?.nombre}</div>
              <div style={{ fontFamily:F.serif,fontSize:22,color:m.rm1_real?C.jade:C.textD }}>{m.rm1_real?`${m.rm1_real}kg`:"—"}</div>
              <div style={{ fontFamily:F.serif,fontSize:22,color:C.blue }}>~{m.rm1_estimado}kg</div>
              <div style={{ fontSize:11,color:C.textS,fontFamily:F.sans }}>{m.fecha}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// NOAH COACH IA
// ─────────────────────────────────────────
function NOACoach({ perfil, user }) {
  const [msgs,setMsgs]=useState([{rol:"noa",texto:"Hola! Soy NOAH Coach 💪\n\nEstoy cargando tu contexto de entrenamiento para darte respuestas personalizadas. ¿En qué puedo ayudarte?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [ctx,setCtx]=useState({perfil});
  const [groqActivo,setGroqActivo]=useState(false);
  const ref=useRef(null);

  // Cargar contexto real del atleta desde Supabase
  useEffect(()=>{
    const cargarCtx=async()=>{
      const key=process.env.NEXT_PUBLIC_GROQ_KEY;
      setGroqActivo(!!key&&key.startsWith("gsk_"));
      if (!user?.id) return;
      const sb=await getSB();if(!sb)return;
      // Ciclo activo
      const {data:ciclos}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).limit(1);
      const ciclo=ciclos?.[0];
      // Biomarcadores de hoy
      const today=new Date().toISOString().split("T")[0];
      const {data:bio}=await sb.from("biomarcadores").select("*").eq("atleta_id",user.id).eq("fecha",today).single().catch(()=>({data:null}));
      // Último tonelaje
      const {data:logs}=await sb.from("logs_entrenamiento").select("semana,tonelaje,rpe").eq("atleta_id",user.id).order("fecha",{ascending:false}).limit(20);
      const tonSem={};
      logs?.forEach(l=>{if(l.semana)tonSem[l.semana]=(tonSem[l.semana]||0)+(l.tonelaje||0);});
      setCtx({
        atleta:{nombre:perfil?.nombre,perfil:perfil?.perfil_deporte,peso:perfil?.peso_actual},
        ciclo:ciclo?{nombre:ciclo.nombre,tipo:ciclo.tipo,semanas:ciclo.semanas,sesiones:ciclo.sesiones_semana}:null,
        biomarcadores:bio?{hrv:bio.hrv,sueno:bio.calidad_sueno,doms:bio.dolor_muscular,estres:bio.estres,motivacion:bio.motivacion,readiness:bio.readiness_score}:null,
        tonelaje_por_semana:tonSem,
      });
    };
    cargarCtx();
  },[user]);

  const quick=[
    "¿Cómo se ejecuta la sentadilla trasera?",
    "¿Qué es el RIR y cómo lo uso?",
    "¿Por qué entreno con estas series y reps?",
    "¿Qué dice la ciencia sobre mi ciclo?",
    "¿Estoy recuperado para entrenar hoy?",
    "¿Quién es el Coach Rodri?",
  ];

  const send=async(txt=input)=>{
    if (!txt.trim()||loading)return;
    setMsgs(p=>[...p,{rol:"user",texto:txt}]);
    setInput("");setLoading(true);
    const r=await askNOA(txt,ctx);
    setMsgs(p=>[...p,{rol:"noa",texto:r}]);
    setLoading(false);
    setTimeout(()=>ref.current?.scrollIntoView({behavior:"smooth"}),80);
  };

  return (
    <div style={{ padding:"28px 32px",maxWidth:720,display:"flex",flexDirection:"column",height:"calc(100vh - 56px)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
        <SectionHeader title="NOAH Coach" sub={groqActivo?"Groq · LLaMA 3 70B · contexto real del atleta":"Modo demo · configurá NEXT_PUBLIC_GROQ_KEY en Vercel"}/>
        <div style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:99,background:groqActivo?C.jade+"18":C.amber+"18",border:`1px solid ${groqActivo?C.jade+"44":C.amber+"44"}` }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:groqActivo?C.jade:C.amber }}/>
          <span style={{ fontSize:10,fontWeight:700,color:groqActivo?C.jade:C.amber,fontFamily:F.sans,letterSpacing:"0.05em" }}>{groqActivo?"GROQ ACTIVO":"DEMO"}</span>
        </div>
      </div>
      {ctx.ciclo&&(
        <div style={{ display:"flex",gap:8,marginBottom:12,padding:"8px 12px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,flexWrap:"wrap" }}>
          <span style={{ fontSize:11,color:C.textS,fontFamily:F.sans }}>Contexto cargado:</span>
          <Tag color={C.jade} sm>{ctx.ciclo.tipo?.replace(/_/g," ")||"ciclo"}</Tag>
          <Tag color={C.blue} sm>{ctx.ciclo.semanas} sem</Tag>
          {ctx.biomarcadores?.hrv&&<Tag color={C.violet} sm>HRV {ctx.biomarcadores.hrv}ms</Tag>}
          {ctx.biomarcadores?.readiness&&<Tag color={ctx.biomarcadores.readiness>=75?C.jade:C.amber} sm>Readiness {ctx.biomarcadores.readiness}</Tag>}
        </div>
      )}
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
        {quick.map(q=><button key={q} onClick={()=>send(q)} style={{ padding:"5px 12px",borderRadius:99,border:`1px solid ${C.border}`,background:"transparent",color:C.textS,fontSize:11,cursor:"pointer",fontFamily:F.sans,transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.jade+"88";e.currentTarget.style.color=C.jade;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textS;}}>{q}</button>)}
      </div>
      <div style={{ flex:1,overflowY:"auto",background:C.deep,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:14,display:"flex",flexDirection:"column",gap:14 }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:m.rol==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-start" }}>
            {m.rol==="noa"&&<div style={{ width:30,height:30,borderRadius:8,flexShrink:0,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.deep,fontFamily:F.serif }}>N</div>}
            <div style={{ maxWidth:"78%",background:m.rol==="user"?C.jade+"18":C.card,border:`1px solid ${m.rol==="user"?C.jade+"44":C.border}`,borderRadius:m.rol==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:C.text,lineHeight:1.65,fontFamily:F.sans }}>
              {m.texto.split(/(https?:\/\/[^\s]+)/g).map((part,pi)=>
                part.match(/^https?:\/\//)
                  ? <a key={pi} href={part} target="_blank" rel="noopener noreferrer" style={{ color:C.jade,textDecoration:"underline",wordBreak:"break-all" }}>▶ Ver en YouTube</a>
                  : <span key={pi} style={{ whiteSpace:"pre-wrap" }}>{part}</span>
              )}
            </div>
          </div>
        ))}
        {loading&&<div style={{ display:"flex",gap:8,alignItems:"center" }}><div style={{ width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.deep,fontFamily:F.serif }}>N</div><div style={{ color:C.textS,fontSize:13,fontFamily:F.sans }}>NOAH está pensando…</div></div>}
        <div ref={ref}/>
      </div>
      <div style={{ display:"flex",gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Preguntale a NOAH Coach..." style={{ flex:1,padding:"12px 16px",background:C.card,border:`1px solid ${C.borderH}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans }}/>
        <button onClick={()=>send()} style={{ padding:"12px 18px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.jade3},${C.jade})`,color:C.deep,fontWeight:700,fontSize:15,cursor:"pointer" }}>↑</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────
// COACH — VER DASHBOARD DEL ATLETA
// El coach ve exactamente lo que ve el atleta
// ─────────────────────────────────────────
function CoachVistaAtleta({ atleta, onVolver }) {
  const [tab, setTab] = useState("calendario");
  const fakeUser = { id: atleta.id, email: "" };
  const tabs = [
    { id:"calendario",   label:"Calendario" },
    { id:"sesion",       label:"Sesión de hoy" },
    { id:"biomarcadores",label:"Biomarcadores" },
    { id:"marcas",       label:"Marcas" },
  ];
  // Usamos display:none en vez de && para no violar reglas de hooks
  return (
    <div style={{ maxWidth:1000 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"28px 32px 0" }}>
        <button onClick={onVolver} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, color:C.textS, padding:"6px 12px", cursor:"pointer", fontSize:12, fontFamily:F.sans }}>
          ← Volver
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:C.blue+"22", border:`1px solid ${C.blue}44`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F.serif, color:C.blue, fontSize:14 }}>
            {(atleta.nombre||atleta.atleta_codigo||"?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:F.serif, fontSize:18, color:C.white }}>{atleta.nombre||"Sin nombre"}</div>
            <div style={{ fontSize:10, color:C.textS, fontFamily:F.sans }}>{atleta.atleta_codigo} · vista coach</div>
          </div>
        </div>
        <Tag color={C.blue}>Modo vista coach</Tag>
      </div>
      {/* Tabs */}
      <div style={{ display:"flex", gap:6, margin:"16px 32px 0", borderBottom:`1px solid ${C.border}`, paddingBottom:12 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:tab===t.id?C.blue+"22":"transparent", color:tab===t.id?C.blue:C.textS, fontSize:12, fontWeight:tab===t.id?700:400, cursor:"pointer", fontFamily:F.sans }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Siempre montados, ocultados con display */}
      <div style={{ display: tab==="calendario" ? "block" : "none" }}><CalendarioAtleta user={fakeUser}/></div>
      <div style={{ display: tab==="sesion" ? "block" : "none" }}><SesionHoy user={fakeUser}/></div>
      <div style={{ display: tab==="biomarcadores" ? "block" : "none" }}><Biomarcadores user={fakeUser}/></div>
      <div style={{ display: tab==="marcas" ? "block" : "none" }}><Marcas user={fakeUser}/></div>
    </div>
  );
}

// ─────────────────────────────────────────
// APP RAÍZ
// ─────────────────────────────────────────
export default function NOAApp() {
  // TODOS los hooks al tope — nunca dentro de condicionales
  const [user,setUser]=useState(null);
  const [perfil,setPerfil]=useState(null);
  const [appLoading,setAppLoading]=useState(true);
  const [sec,setSec]=useState("hoy");
  const [atletaVista,setAtletaVista]=useState(null);
  const [sideOpen,setSideOpen]=useState(false);

  useEffect(()=>{
    getSB().then(()=>setAppLoading(false));
  },[]);

  const handleLogin=(u,p)=>{
    setUser(u);setPerfil(p);
    setSec(p?.rol==="coach"?"c_atletas":"hoy");
  };

  const logout=()=>{ setUser(null);setPerfil(null);setSec("hoy"); };
  const rol=perfil?.rol||"atleta";

  const GLOBAL_CSS=`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:${C.bg};color:${C.text};font-family:${F.sans};-webkit-tap-highlight-color:transparent;}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
    input[type=range]{height:4px;cursor:pointer;border-radius:2px}
    input::placeholder,textarea::placeholder{color:${C.textD}}
    select option{background:${C.card};color:${C.text}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(max-width:640px){
      h1{font-size:22px!important}
      .grid-4{grid-template-columns:1fr 1fr!important}
      .grid-2{grid-template-columns:1fr!important}
      .hide-mobile{display:none!important}
      input,select,textarea{font-size:16px!important}
    }
  `;

  // Render de contenido — función para evitar instanciar todo a la vez
  const renderContent = () => {
    if (!user) return null;
    switch(sec) {
      case "hoy":           return <SesionHoy user={user}/>;
      case "dashboard":     return <DashboardAtleta user={user} perfil={perfil}/>;
      case "calendario":    return <CalendarioAtleta user={user}/>;
      case "biomarcadores": return <Biomarcadores user={user}/>;
      case "marcas":        return <Marcas user={user}/>;
      case "noa_coach":     return <NOACoach perfil={perfil} user={user}/>;
      case "c_dashboard":   return <DashboardCoach user={user}/>;
      case "c_atletas":     return <CoachAtletas user={user} onVerAtleta={(a)=>{setAtletaVista(a);setSec("c_vista");}}/>;
      case "c_ciclos":      return <CoachCiclos user={user}/>;
      case "c_planificar":  return <CoachPlanificar user={user}/>;
      case "c_ejercicios":  return <CoachEjercicios user={user}/>;
      case "c_vista":       return atletaVista
        ? <CoachVistaAtleta atleta={atletaVista} onVolver={()=>setSec("c_atletas")}/>
        : <div style={{padding:"28px 32px"}}><SectionHeader title="Ver como atleta" sub="Elegí un atleta desde Mis atletas → botón Ver"/></div>;
      default: return null;
    }
  };

  if (appLoading) return (
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign:"center" }}>
        <div dangerouslySetInnerHTML={{__html: `<svg viewBox="0 0 36 36" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mnL" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00E5A0"/><stop offset="100%" stop-color="#00B8CC"/></linearGradient>
    <linearGradient id="mnD" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD600"/><stop offset="45%" stop-color="#FF5A1F"/><stop offset="100%" stop-color="#E8002A"/></linearGradient>
    <linearGradient id="mnLs" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#007A58"/><stop offset="100%" stop-color="#005F80"/></linearGradient>
  </defs>
  <rect width="36" height="36" rx="8" fill="#0B0F14"/>
  <path d="M 4 3 C 4 9 3 16 3 24 L 11 24 C 11 16 12 9 12 3 Z" fill="url(#mnL)"/>
  <path d="M 4 3 L 2 4 L 2 24 L 4 24 Z" fill="url(#mnLs)" opacity="0.55"/>
  <path d="M 4 3 L 12 3 L 11 1 L 3 1 Z" fill="#00C896" opacity="0.7"/>
  <path d="M 12 3 C 14 7 17 12 20 17 C 22 21 24 25 25 30 L 33 30 C 32 25 29 20 27 15 C 24 10 21 5 19 2 Z" fill="url(#mnD)"/>
  <path d="M 19 2 L 17 3 L 33 30 L 35 30 Z" fill="#8A0018" opacity="0.3"/>
  <path d="M 24 3 C 24 9 25 16 25 24 L 33 24 C 33 16 32 9 32 3 Z" fill="url(#mnL)"/>
  <path d="M 32 3 L 34 4 L 34 24 L 32 24 Z" fill="url(#mnLs)" opacity="0.55"/>
  <path d="M 24 3 L 32 3 L 33 1 L 23 1 Z" fill="#00C896" opacity="0.7"/>
</svg>`}} style={{marginBottom:14}}/>
        <div style={{ fontSize:13,color:C.textS,fontFamily:F.sans }}>Cargando NOAH…</div>
      </div>
    </div>
  );

  if (!user) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Login onLogin={handleLogin}/>
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:"100vh",background:C.bg }}>
        <Sidebar sec={sec} setSec={setSec} rol={rol} perfil={perfil} onLogout={logout} open={sideOpen} setOpen={setSideOpen}/>

        {/* TOPBAR fija */}
        <div style={{
          position:"fixed",top:0,left:0,right:0,
          height:52,
          background:C.deep,
          borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",
          padding:"0 16px",gap:12,
          zIndex:80,
        }}>
          {/* Hamburguesa */}
          <button onClick={()=>setSideOpen(o=>!o)} style={{
            background:"none",border:`1px solid ${C.border}`,
            borderRadius:8,color:C.text,
            width:36,height:36,cursor:"pointer",
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",gap:4,
            flexShrink:0,
          }}>
            <div style={{ width:16,height:1.5,background:C.text,borderRadius:99 }}/>
            <div style={{ width:16,height:1.5,background:C.text,borderRadius:99 }}/>
            <div style={{ width:16,height:1.5,background:C.text,borderRadius:99 }}/>
          </button>

          {/* Logo */}
          <div dangerouslySetInnerHTML={{__html: `<svg viewBox="0 0 36 36" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mnL" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#00E5A0"/><stop offset="100%" stop-color="#00B8CC"/></linearGradient>
    <linearGradient id="mnD" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFD600"/><stop offset="45%" stop-color="#FF5A1F"/><stop offset="100%" stop-color="#E8002A"/></linearGradient>
    <linearGradient id="mnLs" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#007A58"/><stop offset="100%" stop-color="#005F80"/></linearGradient>
  </defs>
  <rect width="36" height="36" rx="8" fill="#0B0F14"/>
  <path d="M 4 3 C 4 9 3 16 3 24 L 11 24 C 11 16 12 9 12 3 Z" fill="url(#mnL)"/>
  <path d="M 4 3 L 2 4 L 2 24 L 4 24 Z" fill="url(#mnLs)" opacity="0.55"/>
  <path d="M 4 3 L 12 3 L 11 1 L 3 1 Z" fill="#00C896" opacity="0.7"/>
  <path d="M 12 3 C 14 7 17 12 20 17 C 22 21 24 25 25 30 L 33 30 C 32 25 29 20 27 15 C 24 10 21 5 19 2 Z" fill="url(#mnD)"/>
  <path d="M 19 2 L 17 3 L 33 30 L 35 30 Z" fill="#8A0018" opacity="0.3"/>
  <path d="M 24 3 C 24 9 25 16 25 24 L 33 24 C 33 16 32 9 32 3 Z" fill="url(#mnL)"/>
  <path d="M 32 3 L 34 4 L 34 24 L 32 24 Z" fill="url(#mnLs)" opacity="0.55"/>
  <path d="M 24 3 L 32 3 L 33 1 L 23 1 Z" fill="#00C896" opacity="0.7"/>
</svg>`}}/>

          {/* Sección actual */}
          <div style={{ flex:1,fontSize:12,color:C.textS,fontFamily:F.sans,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
            {[...NAV_ATLETA,...NAV_COACH].find(n=>n.id===sec)?.label||""}
          </div>

          {/* Avatar */}
          <div style={{ width:30,height:30,borderRadius:7,background:C.jade+"22",border:`1px solid ${C.jade}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,color:C.jade,fontSize:12,flexShrink:0 }}>
            {(perfil?.nombre||perfil?.atleta_codigo||"?")[0].toUpperCase()}
          </div>
        </div>

        {/* Contenido con padding top para la topbar */}
        <main style={{ paddingTop:52,minHeight:"100vh",overflowY:"auto" }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}
