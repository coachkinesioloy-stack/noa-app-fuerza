'use client'
// ═══════════════════════════════════════════════════
// NOA v2.0 — Never Over, Always Higher
// Auth real · Panel Coach · Planificador · Calendario
// ═══════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from "react";

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
    const sistema = `Sos NOA Coach, el asistente de entrenamiento de la app NOAH (Never Over, Always Higher), creada por el Prof. Rodrigo Fernández.

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
  return "**NOA Coach (demo):** Configurá `NEXT_PUBLIC_GROQ_KEY` en Vercel con tu API key de Groq (gratis en console.groq.com) para respuestas en tiempo real.";
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
  bg:"#080808", deep:"#060606", surface:"#0F0F0F",
  card:"#141414", cardH:"#1C1C1C",
  border:"rgba(255,255,255,0.08)", borderH:"rgba(255,255,255,0.14)",
  jade:"#00E5A0", jade2:"#00BF86", jade3:"#007A56",
  blue:"#00D4FF", amber:"#FFB84D", red:"#FF4444", violet:"#A78BFA",
  text:"#F0F0F0", textS:"#888888", textD:"#444444", white:"#FFFFFF",
};
const F = { serif:"'DM Serif Display',serif", sans:"'Inter',sans-serif" };

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
// ── NOA Logo Component ────────────────────────────────────────
function NOALogo({ size=28 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{width:size,height:size,borderRadius:size*0.22,flexShrink:0}}>
      <defs>
        <linearGradient id="noa-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#070C18"}}/>
          <stop offset="100%" style={{stopColor:"#0D1E35"}}/>
        </linearGradient>
        <linearGradient id="noa-jade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#007A56"}}/>
          <stop offset="100%" style={{stopColor:"#00E5A0"}}/>
        </linearGradient>
        <filter id="noa-glow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#noa-bg)"/>
      <circle cx="256" cy="256" r="220" fill="none" stroke="#00E5A0" strokeWidth="1.5" opacity="0.15"/>
      <text x="256" y="310" fontFamily="Georgia, serif" fontSize="240" fontWeight="400" textAnchor="middle" fill="url(#noa-jade)" filter="url(#noa-glow)" letterSpacing="-8">N</text>
      <line x1="156" y1="360" x2="356" y2="360" stroke="url(#noa-jade)" strokeWidth="2" opacity="0.5"/>
      <text x="256" y="400" fontFamily="Georgia, serif" fontSize="28" textAnchor="middle" fill="#00E5A0" opacity="0.7" letterSpacing="6">NOA</text>
    </svg>
  );
}

function Tag({ color=C.jade, children, sm }) {
  return <span style={{ background:color+"18",color,border:`1px solid ${color}35`,borderRadius:6,padding:sm?"2px 7px":"3px 10px",fontSize:sm?10:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:F.sans }}>{children}</span>;
}

function Card({ children, style={}, onClick, glow }) {
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ background:h&&onClick?C.cardH:C.card,border:`1px solid ${h&&onClick?C.borderH:C.border}`,borderRadius:16,padding:"18px 20px",cursor:onClick?"pointer":"default",transition:"all 0.2s",boxShadow:glow?`0 0 30px ${C.jade}12,0 2px 20px rgba(0,0,0,0.4)`:"0 2px 16px rgba(0,0,0,0.3)",...style }}>{children}</div>;
}

function Stat({ label, value, unit, color=C.jade }) {
  return <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",textAlign:"center",position:"relative",overflow:"hidden" }}>
    <div style={{ position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right, ${color}15, transparent 70%)`,pointerEvents:"none" }}/>
    <div style={{ fontSize:10,color:C.textS,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontFamily:F.sans,fontWeight:600 }}>{label}</div>
    <div style={{ fontSize:26,fontWeight:900,color,lineHeight:1,fontFamily:F.sans,letterSpacing:"-0.02em" }}>{value}</div>
    {unit&&<div style={{ fontSize:10,color:C.textD,marginTop:4,fontFamily:F.sans }}>{unit}</div>}
  </div>;
}

function Bar({ value, max=100, color=C.jade, h=4 }) {
  return <div style={{ background:"rgba(255,255,255,0.06)",borderRadius:99,height:h,overflow:"hidden" }}><div style={{ width:`${Math.min(100,(value/max)*100)}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.8s cubic-bezier(0.16,1,0.3,1)",boxShadow:`0 0 8px ${color}60` }}/></div>;
}

function Btn({ children, onClick, color=C.jade, outline, sm, full, disabled, style={} }) {
  const [h,setH]=useState(false);
  const isMain = !outline;
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{ width:full?"100%":"auto",padding:sm?"6px 14px":"10px 22px",borderRadius:10,border:outline?`1.5px solid ${color}40`:"none",background:outline?"transparent":isMain?`linear-gradient(135deg,${color}CC,${color})`:`transparent`,color:outline?color:"#080808",fontWeight:700,fontSize:sm?11:13,cursor:disabled?"not-allowed":"pointer",fontFamily:F.sans,opacity:disabled?0.4:1,transition:"all 0.18s",boxShadow:(!outline&&!disabled&&isMain)?`0 4px 16px ${color}40`:"none",transform:h&&!disabled?"translateY(-1px)":"translateY(0)",...style }}>{children}</button>;
}

function FInput({ label, value, onChange, type="text", placeholder, min, max, step }) {
  const [focus, setFocus] = useState(false);
  return <div style={{ marginBottom:12 }}>
    {label&&<div style={{ fontSize:10,fontWeight:700,color:C.textS,marginBottom:6,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:F.sans }}>{label}</div>}
    <input type={type} value={value} onChange={onChange} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} placeholder={placeholder} min={min} max={max} step={step} style={{ width:"100%",padding:"10px 13px",background:C.surface,border:`1px solid ${focus?C.jade+"60":C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box",transition:"border-color 0.15s" }}/>
  </div>;
}

function FSelect({ label, value, onChange, options }) {
  return <div style={{ marginBottom:12 }}>
    {label&&<div style={{ fontSize:10,fontWeight:700,color:C.textS,marginBottom:6,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:F.sans }}>{label}</div>}
    <select value={value} onChange={onChange} style={{ width:"100%",padding:"10px 13px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,boxSizing:"border-box" }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>;
}

function SectionHeader({ title, sub, tags=[] }) {
  return <div style={{ marginBottom:24 }}>
    {tags.length>0&&<div style={{ display:"flex",gap:6,marginBottom:10,flexWrap:"wrap" }}>{tags.map((t,i)=><Tag key={i} color={t.color||C.jade}>{t.label}</Tag>)}</div>}
    <h1 style={{ fontFamily:F.sans,fontSize:26,fontWeight:900,color:C.white,margin:0,lineHeight:1.15,letterSpacing:"-0.03em" }}>{title}<span style={{color:C.jade}}>.</span></h1>
    {sub&&<div style={{ fontSize:13,color:C.textS,marginTop:5,fontFamily:F.sans }}>{sub}</div>}
  </div>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{ background:"#141414",border:`1px solid rgba(255,255,255,0.12)`,borderRadius:20,padding:"24px 28px",maxWidth:520,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.7)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div style={{ fontFamily:F.sans,fontSize:18,fontWeight:800,color:C.white,letterSpacing:"-0.02em" }}>{title}</div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,color:C.textS,fontSize:18,cursor:"pointer",width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

function Spinner() {
  return <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:48,gap:16 }}>
    <div style={{ width:36,height:36,border:`2px solid rgba(255,255,255,0.06)`,borderTopColor:C.jade,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ fontSize:12,color:C.textD,fontFamily:F.sans,letterSpacing:"0.1em" }}>CARGANDO</div>
  </div>;
}

function EmptyState({ title, sub }) {
  return <Card style={{ textAlign:"center",padding:"52px 24px" }}>
    <div style={{ width:48,height:48,borderRadius:14,background:`${C.jade}15`,border:`1px solid ${C.jade}25`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20 }}>◎</div>
    <div style={{ fontFamily:F.sans,fontSize:16,fontWeight:700,color:C.textS,marginBottom:6 }}>{title}</div>
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
      {[0,0.25,0.5,0.75,1].map((t,i)=>{const y=pt+t*(H-pt-pb);const val=maxV-t*range;return(<g key={i}><line x1={pl} y1={y} x2={W-pr} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/><text x={pl-4} y={y+4} textAnchor="end" fontSize="9" fill="#3A4F6A" fontFamily="DM Sans">{Math.round(val).toLocaleString("es")}</text></g>);})}
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
// DASHBOARD ATLETA — v3 con gráficas ricas
// ─────────────────────────────────────────

// ── SVG Charts avanzados ──────────────────

function MultiLineChart({ series, height=180, yLabel="" }) {
  // series = [{label, color, data:[{x,y}]}]
  if (!series?.length) return null;
  const W=500, H=height, pl=52, pr=16, pt=16, pb=32;
  const allY = series.flatMap(s=>s.data.map(d=>d.y));
  const allX = [...new Set(series.flatMap(s=>s.data.map(d=>d.x)))].sort();
  if (!allX.length || !allY.length) return null;
  const minV=Math.min(...allY), maxV=Math.max(...allY), range=maxV-minV||1;
  const toX=i=>pl+(i/(allX.length-1||1))*(W-pl-pr);
  const toY=v=>pt+(1-(v-minV)/range)*(H-pt-pb);
  const ticks=[0,0.25,0.5,0.75,1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height}} preserveAspectRatio="none">
      <defs>
        {series.map((s,i)=>(
          <linearGradient key={i} id={`mlg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={s.color} stopOpacity="0.01"/>
          </linearGradient>
        ))}
      </defs>
      {ticks.map((t,i)=>{
        const y=pt+t*(H-pt-pb);
        const val=Math.round(maxV-t*range);
        return <g key={i}>
          <line x1={pl} y1={y} x2={W-pr} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <text x={pl-4} y={y+4} textAnchor="end" fontSize="8" fill="#3A4F6A" fontFamily="DM Sans">{val>=1000?(val/1000).toFixed(1)+"t":val}</text>
        </g>;
      })}
      {series.map((s,i)=>{
        const pts=s.data.map(d=>{const xi=allX.indexOf(d.x);return `${toX(xi)},${toY(d.y)}`;}).join(" ");
        const fill=s.data.map((d,j)=>{const xi=allX.indexOf(d.x);return `${toX(xi)},${toY(d.y)}`;}).join(" ")
          +` ${toX(allX.indexOf(s.data[s.data.length-1]?.x))},${H-pb} ${toX(allX.indexOf(s.data[0]?.x))},${H-pb}`;
        return <g key={i}>
          <polygon points={fill} fill={`url(#mlg${i})`}/>
          <polyline points={pts} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {s.data.map((d,j)=>{
            const xi=allX.indexOf(d.x);
            return <circle key={j} cx={toX(xi)} cy={toY(d.y)} r="3" fill={s.color} stroke="#101828" strokeWidth="1.5"/>;
          })}
        </g>;
      })}
      {allX.map((x,i)=>(
        <text key={i} x={toX(i)} y={H-pb+12} textAnchor="middle" fontSize="8" fill="#3A4F6A" fontFamily="DM Sans">{x}</text>
      ))}
      {yLabel&&<text x={10} y={pt} fontSize="8" fill="#3A4F6A" fontFamily="DM Sans" transform={`rotate(-90,10,${H/2})`}>{yLabel}</text>}
    </svg>
  );
}

function RadarChart({ data, color, size=180 }) {
  // data = [{label, value (0-100)}]
  if (!data?.length) return null;
  const cx=size/2, cy=size/2, r=size*0.36;
  const n=data.length;
  const angle=(i)=>(Math.PI*2*i/n)-Math.PI/2;
  const pt=(i,v)=>({
    x: cx+r*(v/100)*Math.cos(angle(i)),
    y: cy+r*(v/100)*Math.sin(angle(i)),
  });
  const outer=(i)=>({x:cx+r*Math.cos(angle(i)), y:cy+r*Math.sin(angle(i))});
  const rings=[0.25,0.5,0.75,1];
  const polyPts=data.map((d,i)=>pt(i,d.value));
  const polyStr=polyPts.map(p=>`${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{width:size,height:size}}>
      {rings.map((ring,ri)=>{
        const rpts=Array.from({length:n},(_,i)=>({x:cx+r*ring*Math.cos(angle(i)),y:cy+r*ring*Math.sin(angle(i))}));
        return <polygon key={ri} points={rpts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
      })}
      {Array.from({length:n},(_,i)=>(
        <line key={i} x1={cx} y1={cy} x2={outer(i).x} y2={outer(i).y} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      ))}
      <polygon points={polyStr} fill={color+"30"} stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      {data.map((d,i)=>{
        const o=outer(i);
        const lx=cx+(r*1.22)*Math.cos(angle(i));
        const ly=cy+(r*1.22)*Math.sin(angle(i));
        return <g key={i}>
          <circle cx={pt(i,d.value).x} cy={pt(i,d.value).y} r="3" fill={color} stroke="#101828" strokeWidth="1.5"/>
          <text x={lx} y={ly+3} textAnchor="middle" fontSize="7.5" fill="#8899BB" fontFamily="DM Sans">{d.label}</text>
          <text x={lx} y={ly+13} textAnchor="middle" fontSize="8" fill={color} fontFamily="DM Sans" fontWeight="700">{d.value}</text>
        </g>;
      })}
    </svg>
  );
}

function StackedBarChart({ data, keys, colors, height=120 }) {
  // data = [{x, [key]:value}], keys=[], colors=[]
  if (!data?.length) return null;
  const W=500, H=height, pl=40, pr=10, pt=10, pb=24;
  const maxV=Math.max(...data.map(d=>keys.reduce((a,k)=>a+(d[k]||0),0)),1);
  const gap=(W-pl-pr)/data.length;
  const barW=gap*0.65;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height}} preserveAspectRatio="none">
      {data.map((d,i)=>{
        const x=pl+i*gap+gap*0.175;
        let yOff=H-pb;
        return <g key={i}>
          {keys.map((k,ki)=>{
            const val=d[k]||0;
            const bh=(val/maxV)*(H-pt-pb);
            yOff-=bh;
            return <rect key={ki} x={x} y={yOff} width={barW} height={bh} rx="2" fill={colors[ki]} opacity="0.85"/>;
          })}
          <text x={x+barW/2} y={H-pb+12} textAnchor="middle" fontSize="8" fill="#3A4F6A" fontFamily="DM Sans">{d.x}</text>
        </g>;
      })}
      {[0,0.5,1].map((t,i)=>{
        const y=pt+t*(H-pt-pb);
        const val=Math.round(maxV*(1-t));
        return <g key={i}>
          <line x1={pl} y1={y} x2={W-pr} y2={y} stroke="#1E2D45" strokeWidth="1" strokeDasharray="3,3"/>
          <text x={pl-4} y={y+4} textAnchor="end" fontSize="8" fill="#3A4F6A" fontFamily="DM Sans">{val}</text>
        </g>;
      })}
    </svg>
  );
}

function HeatmapGrid({ rows, cols, getValue, getColor, getLabel, cellSize=38 }) {
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:`auto repeat(${cols.length},${cellSize}px)`,gap:3,minWidth:"fit-content"}}>
        <div/>
        {cols.map((c,i)=><div key={i} style={{fontSize:9,color:C.textD,textAlign:"center",fontFamily:F.sans,paddingBottom:3}}>{c}</div>)}
        {rows.map((row,ri)=>(
          <React.Fragment key={ri}>
            <div style={{fontSize:10,color:C.textS,fontFamily:F.sans,paddingRight:8,display:"flex",alignItems:"center",whiteSpace:"nowrap"}}>{row}</div>
            {cols.map((col,ci)=>{
              const v=getValue(ri,ci);
              const col2=getColor(v);
              return (
                <div key={ci} title={getLabel?getLabel(ri,ci,v):""} style={{width:cellSize,height:cellSize,borderRadius:6,background:col2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700,fontFamily:F.sans,cursor:"default",transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.15)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  {v!=null&&v!==0?v:""}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:8}}>
      {items.map((it,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:10,height:10,borderRadius:2,background:it.color}}/>
          <span style={{fontSize:10,color:C.textS,fontFamily:F.sans}}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, sub, children, style={} }) {
  return (
    <Card style={{marginBottom:14,...style}}>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textS,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:F.sans}}>{title}</div>
        {sub&&<div style={{fontSize:10,color:C.textD,fontFamily:F.sans,marginTop:3}}>{sub}</div>}
      </div>
      {children}
    </Card>
  );
}

// ── DASHBOARD ATLETA ─────────────────────────────
function DashboardAtleta({ user, perfil }) {
  const [loading,setLoading]=useState(true);
  const [ciclo,setCiclo]=useState(null);
  const [logs,setLogs]=useState([]);
  const [bioHist,setBioHist]=useState([]);
  const [marcas,setMarcas]=useState([]);
  const [tab,setTab]=useState("performance");

  useEffect(()=>{ cargarDash(); },[]);

  const cargarDash=async()=>{
    const sb=await getSB(); if(!sb){setLoading(false);return;}
    const {data:ciclos}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).limit(1);
    setCiclo(ciclos?.[0]||null);
    const {data:logsData}=await sb.from("logs_entrenamiento")
      .select("semana,dia,carga_kg,reps_realizadas,series_realizadas,completado,rpe,fecha")
      .eq("atleta_id",user.id).order("semana").order("dia");
    setLogs(logsData||[]);
    const {data:bioData}=await sb.from("biomarcadores")
      .select("fecha,hrv,readiness_score,calidad_sueno,dolor_muscular,estres,motivacion,peso_kg,calorias,horas_sueno")
      .eq("atleta_id",user.id).order("fecha",{ascending:true}).limit(30);
    setBioHist(bioData||[]);
    const {data:mData}=await sb.from("marcas").select("*,ejercicios(nombre)").eq("atleta_id",user.id).order("fecha",{ascending:false}).limit(10);
    setMarcas(mData||[]);
    setLoading(false);
  };

  if(loading) return <div style={{padding:32}}><Spinner/></div>;

  // ── Calcular métricas ──
  const tonMap={};
  let comp=0, tot=0;
  const rpeMap={};
  logs.forEach(l=>{
    const s=l.semana;
    if(s){
      const ton=(parseFloat(l.carga_kg)||0)*(parseInt(l.reps_realizadas)||0)*(parseInt(l.series_realizadas)||0);
      tonMap[s]=(tonMap[s]||0)+ton;
      if(l.rpe){ rpeMap[s]=rpeMap[s]||[]; rpeMap[s].push(parseFloat(l.rpe)); }
    }
    if(l.completado===true)comp++;
    tot++;
  });
  const semanas=Object.keys(tonMap).map(Number).sort((a,b)=>a-b);
  const tonData=semanas.map(s=>({x:"S"+s,y:Math.round(tonMap[s])}));
  const rpeData=semanas.map(s=>({x:"S"+s,y:rpeMap[s]?Math.round(rpeMap[s].reduce((a,b)=>a+b,0)/rpeMap[s].length*10)/10:null})).filter(d=>d.y!==null);
  const adherencia=tot>0?Math.round(comp/tot*100):0;

  const bioLabels=bioHist.map(b=>(b.fecha||"").slice(5));
  const hrvData=bioHist.map((b,i)=>({x:bioLabels[i],y:b.hrv||0})).filter(d=>d.y>0);
  const readData=bioHist.map((b,i)=>({x:bioLabels[i],y:b.readiness_score||0})).filter(d=>d.y>0);
  const suenData=bioHist.map((b,i)=>({x:bioLabels[i],y:(b.calidad_sueno||0)*10})).filter(d=>d.y>0);
  const domsData=bioHist.map((b,i)=>({x:bioLabels[i],y:(b.dolor_muscular||0)*10})).filter(d=>d.y>0);
  const pesoData=bioHist.map((b,i)=>({x:bioLabels[i],y:b.peso_kg||0})).filter(d=>d.y>0);
  const calData=bioHist.map((b,i)=>({x:bioLabels[i],y:b.calorias||0})).filter(d=>d.y>0);
  const horasSuenData=bioHist.map((b,i)=>({x:bioLabels[i],y:b.horas_sueno||0})).filter(d=>d.y>0);

  const lastBio=bioHist[bioHist.length-1]||{};
  const readinessHoy=lastBio.readiness_score||0;
  const rC=readinessHoy>=75?C.jade:readinessHoy>=50?C.amber:readinessHoy?C.red:C.textD;
  const tipoColor=CICLOS_TIPOS.find(t=>t.key===ciclo?.tipo)?.color||C.jade;

  // Radar de performance
  const radarData=[
    {label:"Adherencia", value:adherencia},
    {label:"Readiness", value:readinessHoy},
    {label:"Motivación", value:(lastBio.motivacion||0)*10},
    {label:"Sueño", value:(lastBio.calidad_sueno||0)*10},
    {label:"Rec. Física", value:Math.max(0,100-(lastBio.dolor_muscular||0)*10)},
    {label:"Anti-Estrés", value:Math.max(0,100-(lastBio.estres||0)*10)},
  ];

  // Tonelaje vs RPE (fatiga)
  const tonVsRpe=semanas.map(s=>({
    x:"S"+s,
    tonelaje:Math.round((tonMap[s]||0)/100), // escalado para comparar
    fatiga:rpeMap[s]?Math.round(rpeMap[s].reduce((a,b)=>a+b,0)/rpeMap[s].length*10):0,
  }));

  const tabs=[
    {id:"performance",label:"⚡ Performance"},
    {id:"fatiga",label:"🔥 Fatiga & Recovery"},
    {id:"biometria",label:"💪 Biometría"},
    {id:"marcas",label:"🏆 Marcas & 1RM"},
  ];

  return (
    <div style={{padding:"16px",maxWidth:980}}>
      <SectionHeader
        title="Mi dashboard"
        sub={ciclo?`${ciclo.nombre} · ${ciclo.semanas} semanas`:"Sin ciclo activo"}
        tags={ciclo?[{label:(ciclo.tipo||"ciclo").replace(/_/g," "),color:tipoColor}]:[]}
      />

      {/* KPIs top */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
        <Stat label="Readiness" value={readinessHoy||"—"} color={rC} unit="hoy"/>
        <Stat label="Adherencia" value={adherencia+"%"} color={adherencia>=80?C.jade:C.amber} unit="completado"/>
        <Stat label="Tonelaje total" value={tonData.reduce((a,t)=>a+t.y,0)>0?(tonData.reduce((a,t)=>a+t.y,0)/1000).toFixed(1)+"t":"—"} color={C.blue} unit="acumulado"/>
        <Stat label="RPE promedio" value={rpeData.length?(rpeData.reduce((a,d)=>a+d.y,0)/rpeData.length).toFixed(1):"—"} color={C.violet} unit="sobre 10"/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,borderBottom:`1px solid ${C.border}`,paddingBottom:10,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",borderRadius:10,border:"none",background:tab===t.id?"rgba(0,229,160,0.1)":"transparent",color:tab===t.id?C.jade:C.textS,fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",fontFamily:F.sans,transition:"all 0.15s",letterSpacing:tab===t.id?"-0.01em":"0"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="performance"&&(
        <div>
          {/* Radar + Tonelaje side by side */}
          <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:14,marginBottom:14,alignItems:"start"}}>
            <ChartCard title="Perfil de rendimiento" sub="últimos datos registrados">
              <div style={{display:"flex",justifyContent:"center",paddingTop:4}}>
                <RadarChart data={radarData} color={tipoColor} size={180}/>
              </div>
            </ChartCard>
            <ChartCard title="Tonelaje semanal" sub="kg totales por semana (series × reps × kg)">
              {tonData.length>=2
                ? <><Legend items={[{color:tipoColor,label:"Tonelaje (kg)"}]}/><MultiLineChart series={[{label:"Tonelaje",color:tipoColor,data:tonData}]} height={170}/></>
                : <EmptyState title="Sin datos" sub="Completá sesiones para ver la curva"/>}
            </ChartCard>
          </div>

          {/* RPE + Adherencia */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <ChartCard title="Carga interna · RPE promedio" sub="esfuerzo percibido por semana">
              {rpeData.length>=2
                ? <MultiLineChart series={[{label:"RPE",color:C.amber,data:rpeData}]} height={130}/>
                : <EmptyState title="Sin RPE registrado" sub="Completá el RPE en tus sesiones"/>}
            </ChartCard>
            <ChartCard title="Adherencia semanal" sub="sesiones completadas vs planificadas">
              <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingTop:8}}>
                {Array.from({length:ciclo?.semanas||semanas.length||4},(_,i)=>{
                  const s=i+1;
                  const hay=tonMap[s]>0;
                  const col=hay?tipoColor:C.border;
                  return (
                    <div key={s} style={{textAlign:"center"}}>
                      <div style={{width:42,height:42,borderRadius:8,background:hay?col+"22":C.surface,border:`2px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                        <span style={{fontSize:13,fontWeight:700,color:hay?col:C.textD,fontFamily:F.serif}}>{s}</span>
                        {hay&&<span style={{fontSize:7,color:col}}>{(tonMap[s]/1000).toFixed(1)}t</span>}
                      </div>
                      <div style={{fontSize:8,color:C.textD,marginTop:3,fontFamily:F.sans}}>S{s}</div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {tab==="fatiga"&&(
        <div>
          <ChartCard title="Readiness & HRV — evolución" sub="indicadores de recuperación en el tiempo">
            {readData.length>=2||hrvData.length>=2
              ? <><Legend items={[{color:C.jade,label:"Readiness (0-100)"},{color:C.blue,label:"HRV (ms)"}]}/>
                  <MultiLineChart series={[
                    ...(readData.length>=2?[{label:"Readiness",color:C.jade,data:readData}]:[]),
                    ...(hrvData.length>=2?[{label:"HRV",color:C.blue,data:hrvData}]:[]),
                  ]} height={180}/></>
              : <EmptyState title="Sin datos de biomarcadores" sub="Registrá HRV y Readiness diariamente"/>}
          </ChartCard>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <ChartCard title="DOMS · Dolor muscular" sub="fatiga periférica — escala 0-10 × 10">
              {domsData.length>=2
                ? <><Legend items={[{color:C.red,label:"DOMS × 10"}]}/><MultiLineChart series={[{label:"DOMS",color:C.red,data:domsData}]} height={130}/></>
                : <EmptyState title="Sin datos" sub="Registrá biomarcadores"/>}
            </ChartCard>
            <ChartCard title="Estrés & Motivación" sub="indicadores psicológicos">
              {suenData.length>=2
                ? <><Legend items={[{color:C.violet,label:"Motivación × 10"},{color:C.amber,label:"Anti-Estrés × 10"}]}/>
                    <MultiLineChart series={[
                      {label:"Motivación",color:C.violet,data:bioHist.map((b,i)=>({x:bioLabels[i],y:(b.motivacion||0)*10})).filter(d=>d.y>0)},
                      {label:"Anti-Estrés",color:C.amber,data:bioHist.map((b,i)=>({x:bioLabels[i],y:Math.max(0,100-(b.estres||0)*10)})).filter(d=>d.y>0)},
                    ]} height={130}/></>
                : <EmptyState title="Sin datos" sub="Registrá biomarcadores"/>}
            </ChartCard>
          </div>
          <ChartCard title="Calidad & horas de sueño" sub="descanso = recuperación = rendimiento">
            {suenData.length>=2
              ? <><Legend items={[{color:C.jade,label:"Calidad sueño × 10"},{color:C.blue,label:"Horas de sueño"}]}/>
                  <MultiLineChart series={[
                    {label:"Calidad",color:C.jade,data:suenData},
                    ...(horasSuenData.length>=2?[{label:"Horas",color:C.blue,data:horasSuenData.map(d=>({...d,y:d.y*10}))}]:[]),
                  ]} height={150}/></>
              : <EmptyState title="Sin datos de sueño" sub="Registrá calidad de sueño en Biomarcadores"/>}
          </ChartCard>
        </div>
      )}

      {tab==="biometria"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <ChartCard title="Evolución de peso corporal" sub="kg a lo largo del tiempo">
              {pesoData.length>=2
                ? <MultiLineChart series={[{label:"Peso",color:C.blue,data:pesoData}]} height={150}/>
                : <EmptyState title="Sin datos de peso" sub="Registrá tu peso en Biomarcadores"/>}
            </ChartCard>
            <ChartCard title="Calorías diarias" sub="ingesta nutricional (kcal)">
              {calData.length>=2
                ? <><Legend items={[{color:C.amber,label:"kcal/día"}]}/><MultiLineChart series={[{label:"Calorías",color:C.amber,data:calData}]} height={150}/></>
                : <EmptyState title="Sin datos de nutrición" sub="Registrá tus calorías en Biomarcadores"/>}
            </ChartCard>
          </div>
          <ChartCard title="Perfil biométrico hoy" sub="snapshot del día">
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {label:"Peso",value:lastBio.peso_kg?lastBio.peso_kg+"kg":"—",color:C.blue},
                {label:"HRV",value:lastBio.hrv?lastBio.hrv+"ms":"—",color:C.jade},
                {label:"FC reposo",value:lastBio.fc_reposo?lastBio.fc_reposo+"bpm":"—",color:C.violet},
                {label:"Calorías",value:lastBio.calorias?lastBio.calorias+"kcal":"—",color:C.amber},
                {label:"Horas sueño",value:lastBio.horas_sueno?lastBio.horas_sueno+"h":"—",color:C.blue},
                {label:"Proteínas",value:lastBio.proteinas?lastBio.proteinas+"g":"—",color:C.red},
              ].map((it,i)=>(
                <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.textD,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F.sans,marginBottom:5}}>{it.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:it.color,fontFamily:F.serif}}>{it.value}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {tab==="marcas"&&(
        <div>
          {marcas.length===0
            ? <EmptyState title="Sin marcas todavía" sub="Tus 1RM aparecerán acá a medida que entrenes"/>
            : <>
                <ChartCard title="Evolución de 1RM estimado" sub="fórmula Epley: kg × (1 + reps/30)">
                  {marcas.length>=2
                    ? <MultiLineChart
                        series={marcas.slice(0,5).map((m,i)=>({
                          label:m.ejercicios?.nombre||"ejercicio",
                          color:[C.jade,C.blue,C.amber,C.violet,C.red][i%5],
                          data:[{x:(m.fecha||"").slice(5),y:m.rm1_estimado||0}],
                        }))}
                        height={160}/>
                    : null}
                  <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
                    {marcas.map((m,i)=>(
                      <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:C.surface,borderRadius:9,border:`1px solid ${C.border}`}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans}}>{m.ejercicios?.nombre}</div>
                          <div style={{fontSize:10,color:C.textD,fontFamily:F.sans}}>{m.fecha}</div>
                        </div>
                        <div style={{display:"flex",gap:14,alignItems:"center"}}>
                          {m.rm1_real&&<div style={{textAlign:"center"}}><div style={{fontFamily:F.serif,fontSize:22,color:C.jade}}>{m.rm1_real}kg</div><div style={{fontSize:8,color:C.jade,fontFamily:F.sans}}>REAL</div></div>}
                          {m.rm1_estimado&&<div style={{textAlign:"center"}}><div style={{fontFamily:F.serif,fontSize:20,color:C.blue}}>~{m.rm1_estimado}kg</div><div style={{fontSize:8,color:C.blue,fontFamily:F.sans}}>ESTIMADO</div></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </>}
        </div>
      )}

      {!logs.length&&!bioHist.length&&!marcas.length&&(
        <EmptyState title="Sin datos todavía" sub="Completá sesiones y registrá biomarcadores para ver tus gráficas"/>
      )}
    </div>
  );
}

// ── DASHBOARD COACH — v3 ─────────────────────────────
function DashboardCoach({ user }) {
  const [loading,setLoading]=useState(true);
  const [atletas,setAtletas]=useState([]);
  const [atletaSel,setAtletaSel]=useState(null);
  const [tab,setTab]=useState("grupal");

  useEffect(()=>{ cargarCoach(); },[]);

  const cargarCoach=async()=>{
    const sb=await getSB(); if(!sb){setLoading(false);return;}
    const {data:profs}=await sb.from("profiles").select("*").eq("rol","atleta").eq("activo",true).order("atleta_codigo");
    const today=new Date().toISOString().split("T")[0];
    const resumen=await Promise.all((profs||[]).map(async(p)=>{
      const {data:logsRaw}=await sb.from("logs_entrenamiento")
        .select("semana,carga_kg,reps_realizadas,series_realizadas,completado,rpe")
        .eq("atleta_id",p.id).order("semana").limit(100);
      const tonMap={}; const rpeMap={}; let comp=0,tot=0;
      logsRaw?.forEach(l=>{
        const s=l.semana;
        if(s){
          const ton=(parseFloat(l.carga_kg)||0)*(parseInt(l.reps_realizadas)||0)*(parseInt(l.series_realizadas)||0);
          tonMap[s]=(tonMap[s]||0)+ton;
          if(l.rpe){ rpeMap[s]=rpeMap[s]||[]; rpeMap[s].push(parseFloat(l.rpe)); }
        }
        if(l.completado===true)comp++; tot++;
      });
      const {data:bioRow}=await sb.from("biomarcadores").select("readiness_score,hrv,calidad_sueno,dolor_muscular,estres,motivacion").eq("atleta_id",p.id).eq("fecha",today).maybeSingle();
      const {data:bioHist}=await sb.from("biomarcadores").select("fecha,hrv,readiness_score").eq("atleta_id",p.id).order("fecha",{ascending:true}).limit(12);
      const {data:cicloArr}=await sb.from("ciclos").select("nombre,tipo,semanas").eq("atleta_id",p.id).eq("activo",true).limit(1);
      const ciclo=cicloArr?.[0]||null;
      const semanas=Object.keys(tonMap).map(Number).sort((a,b)=>a-b);
      const tonHistorial=semanas.map(s=>({x:"S"+s,y:Math.round(tonMap[s])}));
      const rpeHistorial=semanas.map(s=>rpeMap[s]?Math.round(rpeMap[s].reduce((a,b)=>a+b,0)/rpeMap[s].length*10)/10:null).filter(Boolean);
      const adherencia=tot>0?Math.round(comp/tot*100):0;
      return {
        ...p, ciclo, adherencia,
        readiness:bioRow?.readiness_score||null,
        hrv:bioRow?.hrv||null,
        tonSemActual:semanas.length?Math.round(tonMap[semanas[semanas.length-1]]):0,
        tonTotal:Object.values(tonMap).reduce((a,b)=>a+b,0),
        tonHistorial,
        rpeHistorial,
        bioHist:(bioHist||[]),
        rpePromedio:rpeHistorial.length?Math.round(rpeHistorial.reduce((a,b)=>a+b,0)/rpeHistorial.length*10)/10:null,
        radarData:[
          {label:"Adherencia",value:adherencia},
          {label:"Readiness",value:bioRow?.readiness_score||0},
          {label:"Motivación",value:(bioRow?.motivacion||0)*10},
          {label:"Sueño",value:(bioRow?.calidad_sueno||0)*10},
          {label:"Rec.Física",value:Math.max(0,100-(bioRow?.dolor_muscular||0)*10)},
          {label:"Anti-Estrés",value:Math.max(0,100-(bioRow?.estres||0)*10)},
        ],
      };
    }));
    setAtletas(resumen);
    if(resumen.length) setAtletaSel(resumen[0]);
    setLoading(false);
  };

  if(loading) return <div style={{padding:32}}><Spinner/></div>;
  if(!atletas.length) return <div style={{padding:"28px 32px"}}><EmptyState title="Sin atletas activos" sub="Creá atletas desde Mis atletas"/></div>;

  const ATLETA_COLORS=[C.jade,C.blue,C.amber,C.violet,C.red,"#4ade80","#06b6d4"];

  // ── Vista grupal ──
  const semsAll=[...new Set(atletas.flatMap(a=>a.tonHistorial.map(t=>t.x)))].sort();
  const multiTon=atletas.map((a,i)=>({
    label:a.nombre||a.atleta_codigo,
    color:ATLETA_COLORS[i%ATLETA_COLORS.length],
    data:a.tonHistorial,
  }));
  const multiHRV=atletas.filter(a=>a.bioHist?.length>=2).map((a,i)=>({
    label:a.nombre||a.atleta_codigo,
    color:ATLETA_COLORS[i%ATLETA_COLORS.length],
    data:a.bioHist.map(b=>({x:(b.fecha||"").slice(5),y:b.hrv||0})).filter(d=>d.y>0),
  }));

  // Heatmap: atletas × semanas de adherencia
  const heatAtletas=atletas.map(a=>a.nombre||a.atleta_codigo);
  const heatSems=semsAll.slice(-8); // últimas 8 semanas
  const heatVal=(ri,ci)=>{
    const a=atletas[ri];
    const sem=heatSems[ci];
    const t=a.tonHistorial.find(t=>t.x===sem);
    return t?Math.min(100,Math.round(t.y/100)):0;
  };
  const heatColor=(v)=>{
    if(!v) return C.surface;
    if(v>=70) return C.jade+"AA";
    if(v>=40) return C.amber+"99";
    return C.red+"88";
  };

  // Ranking adherencia
  const ranking=[...atletas].sort((a,b)=>b.adherencia-a.adherencia);

  const mainTabs=[
    {id:"grupal",label:"👥 Vista grupal"},
    {id:"individual",label:"👤 Individual"},
    {id:"ranking",label:"🏆 Rankings"},
  ];

  return (
    <div style={{padding:"16px",maxWidth:1020}}>
      <SectionHeader title="Dashboard Coach" sub={`${atletas.length} atletas activos · actualizado hoy`}/>

      {/* Tabs principales */}
      <div style={{display:"flex",gap:6,marginBottom:18,borderBottom:`1px solid ${C.border}`,paddingBottom:10}}>
        {mainTabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 18px",borderRadius:10,border:"none",background:tab===t.id?"rgba(0,229,160,0.1)":"transparent",color:tab===t.id?C.jade:C.textS,fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",fontFamily:F.sans,transition:"all 0.15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="grupal"&&(
        <div>
          {/* KPIs grupales */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
            <Stat label="Adherencia prom." value={Math.round(atletas.reduce((a,b)=>a+b.adherencia,0)/atletas.length)+"%"} color={C.jade} unit="grupal"/>
            <Stat label="Readiness prom." value={atletas.filter(a=>a.readiness).length?Math.round(atletas.filter(a=>a.readiness).reduce((a,b)=>a+(b.readiness||0),0)/atletas.filter(a=>a.readiness).length):"—"} color={C.blue} unit="sobre 100"/>
            <Stat label="HRV prom." value={atletas.filter(a=>a.hrv).length?Math.round(atletas.filter(a=>a.hrv).reduce((a,b)=>a+(b.hrv||0),0)/atletas.filter(a=>a.hrv).length)+"ms":"—"} color={C.violet} unit="hoy"/>
            <Stat label="Tonelaje grupal" value={atletas.reduce((a,b)=>a+b.tonTotal,0)>0?((atletas.reduce((a,b)=>a+b.tonTotal,0))/1000).toFixed(0)+"t":"—"} color={C.amber} unit="acumulado"/>
          </div>

          {/* Curvas tonelaje superpuestas */}
          <ChartCard title="Tonelaje semanal — todos los atletas" sub="kg totales por semana, superpuestos">
            {multiTon.some(s=>s.data.length>=2)
              ? <><Legend items={multiTon.map((s,i)=>({color:s.color,label:s.label}))}/><MultiLineChart series={multiTon.filter(s=>s.data.length>=2)} height={200}/></>
              : <EmptyState title="Sin datos de tonelaje" sub="Los atletas deben completar sesiones"/>}
          </ChartCard>

          {/* Heatmap de carga */}
          <ChartCard title="Mapa de carga semanal" sub="intensidad de trabajo por atleta y semana (escala de color)">
            {semsAll.length
              ? <HeatmapGrid
                  rows={heatAtletas}
                  cols={heatSems}
                  getValue={heatVal}
                  getColor={heatColor}
                  getLabel={(ri,ci,v)=>`${heatAtletas[ri]} · ${heatSems[ci]}: ${v}`}
                  cellSize={40}
                />
              : <EmptyState title="Sin datos" sub="Sin semanas registradas aún"/>}
          </ChartCard>

          {/* HRV grupal */}
          {multiHRV.some(s=>s.data.length>=2)&&(
            <ChartCard title="HRV grupal — evolución" sub="variabilidad cardíaca por atleta">
              <Legend items={multiHRV.map(s=>({color:s.color,label:s.label}))}/>
              <MultiLineChart series={multiHRV} height={170}/>
            </ChartCard>
          )}

          {/* Radares individuales en grid */}
          <ChartCard title="Perfil de rendimiento — todos" sub="snapshot de hoy">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
              {atletas.map((a,i)=>{
                const tipo=CICLOS_TIPOS.find(t=>t.key===a.ciclo?.tipo);
                const col=ATLETA_COLORS[i%ATLETA_COLORS.length];
                const rC2=a.readiness>=75?C.jade:a.readiness>=50?C.amber:a.readiness?C.red:C.textD;
                return (
                  <div key={a.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px",textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:F.sans,marginBottom:4}}>{a.nombre||a.atleta_codigo}</div>
                    {a.ciclo&&<Tag color={tipo?.color||col} sm>{(a.ciclo.tipo||"").replace(/_/g," ")}</Tag>}
                    <div style={{display:"flex",justifyContent:"center",margin:"10px 0"}}>
                      <RadarChart data={a.radarData} color={col} size={150}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      <div style={{background:C.card,borderRadius:7,padding:"5px"}}><div style={{fontSize:14,color:rC2,fontFamily:F.serif}}>{a.readiness||"—"}</div><div style={{fontSize:8,color:C.textD,fontFamily:F.sans}}>Readiness</div></div>
                      <div style={{background:C.card,borderRadius:7,padding:"5px"}}><div style={{fontSize:14,color:C.blue,fontFamily:F.serif}}>{a.adherencia}%</div><div style={{fontSize:8,color:C.textD,fontFamily:F.sans}}>Adher.</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      )}

      {tab==="individual"&&(
        <div>
          {/* Selector atleta */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            {atletas.map((a,i)=>{
              const sel=atletaSel?.id===a.id;
              const col=ATLETA_COLORS[i%ATLETA_COLORS.length];
              return (
                <button key={a.id} onClick={()=>setAtletaSel(a)} style={{padding:"8px 16px",borderRadius:9,border:`2px solid ${sel?col:C.border}`,background:sel?col+"22":"transparent",color:sel?col:C.textS,fontSize:12,fontWeight:sel?700:400,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:col,display:"inline-block"}}/>
                  {a.nombre||a.atleta_codigo}
                </button>
              );
            })}
          </div>

          {atletaSel&&(()=>{
            const a=atletaSel;
            const i=atletas.findIndex(x=>x.id===a.id);
            const col=ATLETA_COLORS[i%ATLETA_COLORS.length];
            const tipo=CICLOS_TIPOS.find(t=>t.key===a.ciclo?.tipo);
            const rC2=a.readiness>=75?C.jade:a.readiness>=50?C.amber:a.readiness?C.red:C.textD;
            return (
              <div>
                {/* KPIs del atleta */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  <Stat label="Readiness" value={a.readiness||"—"} color={rC2} unit="hoy"/>
                  <Stat label="HRV" value={a.hrv?a.hrv+"ms":"—"} color={C.blue} unit="hoy"/>
                  <Stat label="Adherencia" value={a.adherencia+"%"} color={a.adherencia>=80?C.jade:C.amber} unit="total"/>
                  <Stat label="RPE prom." value={a.rpePromedio||"—"} color={C.violet} unit="sobre 10"/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:14,marginBottom:14}}>
                  <ChartCard title="Radar" sub="perfil hoy">
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <RadarChart data={a.radarData} color={col} size={175}/>
                    </div>
                  </ChartCard>
                  <ChartCard title={`Tonelaje semanal · ${a.nombre||a.atleta_codigo}`} sub={a.ciclo?.nombre||"sin ciclo activo"}>
                    {a.tonHistorial.length>=2
                      ? <><Legend items={[{color:col,label:"Tonelaje (kg)"},{color:tipo?.color||C.amber,label:"Ciclo: "+(a.ciclo?.tipo||"?").replace(/_/g," ")}]}/><MultiLineChart series={[{label:"Tonelaje",color:col,data:a.tonHistorial}]} height={170}/></>
                      : <EmptyState title="Sin datos" sub="El atleta debe completar sesiones"/>}
                  </ChartCard>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <ChartCard title="HRV — evolución" sub="últimas semanas">
                    {a.bioHist?.filter(b=>b.hrv>0).length>=2
                      ? <MultiLineChart series={[{label:"HRV",color:C.blue,data:a.bioHist.map(b=>({x:(b.fecha||"").slice(5),y:b.hrv||0})).filter(d=>d.y>0)}]} height={130}/>
                      : <EmptyState title="Sin HRV" sub="Registrá biomarcadores"/>}
                  </ChartCard>
                  <ChartCard title="Readiness — evolución" sub="últimas semanas">
                    {a.bioHist?.filter(b=>b.readiness_score>0).length>=2
                      ? <MultiLineChart series={[{label:"Readiness",color:C.jade,data:a.bioHist.map(b=>({x:(b.fecha||"").slice(5),y:b.readiness_score||0})).filter(d=>d.y>0)}]} height={130}/>
                      : <EmptyState title="Sin Readiness" sub="Registrá biomarcadores"/>}
                  </ChartCard>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab==="ranking"&&(
        <div>
          <ChartCard title="Ranking de adherencia" sub="atletas ordenados por % de sesiones completadas">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ranking.map((a,i)=>{
                const col=ATLETA_COLORS[atletas.findIndex(x=>x.id===a.id)%ATLETA_COLORS.length];
                const tipo=CICLOS_TIPOS.find(t=>t.key===a.ciclo?.tipo);
                return (
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:i===0?"rgba(0,229,160,0.04)":C.surface,borderRadius:12,border:`1px solid ${i===0?col+"50":C.border}`,boxShadow:i===0?`0 0 20px ${col}10`:"none"}}>
                    <div style={{fontFamily:F.serif,fontSize:20,color:i===0?col:C.textD,minWidth:28,textAlign:"center"}}>{i+1}</div>
                    <div style={{width:30,height:30,borderRadius:7,background:col+"22",border:`1px solid ${col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,color:col,fontSize:13,flexShrink:0}}>
                      {(a.nombre||a.atleta_codigo||"?")[0].toUpperCase()}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans}}>{a.nombre||a.atleta_codigo}</div>
                      {a.ciclo&&<Tag color={tipo?.color||col} sm>{(a.ciclo.tipo||"").replace(/_/g," ")}</Tag>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:F.serif,fontSize:22,color:a.adherencia>=80?C.jade:a.adherencia>=50?C.amber:C.red}}>{a.adherencia}%</div>
                      <div style={{fontSize:9,color:C.textD,fontFamily:F.sans}}>adherencia</div>
                    </div>
                    <div style={{width:100}}>
                      <Bar value={a.adherencia} max={100} color={a.adherencia>=80?C.jade:a.adherencia>=50?C.amber:C.red} h={6}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <ChartCard title="Ranking HRV" sub="mayor HRV = mejor recuperación hoy">
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[...atletas].filter(a=>a.hrv).sort((a,b)=>b.hrv-a.hrv).map((a,i)=>{
                  const col=ATLETA_COLORS[atletas.findIndex(x=>x.id===a.id)%ATLETA_COLORS.length];
                  return (
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.surface,borderRadius:8}}>
                      <span style={{fontSize:11,color:C.textD,fontFamily:F.sans,minWidth:16}}>{i+1}</span>
                      <span style={{flex:1,fontSize:12,color:C.text,fontFamily:F.sans}}>{a.nombre||a.atleta_codigo}</span>
                      <span style={{fontFamily:F.serif,fontSize:18,color:col}}>{a.hrv}ms</span>
                    </div>
                  );
                })}
                {!atletas.some(a=>a.hrv)&&<EmptyState title="Sin HRV registrado hoy" sub="Los atletas deben registrar biomarcadores"/>}
              </div>
            </ChartCard>
            <ChartCard title="Ranking Readiness" sub="quién está más recuperado hoy">
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[...atletas].filter(a=>a.readiness).sort((a,b)=>b.readiness-a.readiness).map((a,i)=>{
                  const rC2=a.readiness>=75?C.jade:a.readiness>=50?C.amber:C.red;
                  return (
                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.surface,borderRadius:8}}>
                      <span style={{fontSize:11,color:C.textD,fontFamily:F.sans,minWidth:16}}>{i+1}</span>
                      <span style={{flex:1,fontSize:12,color:C.text,fontFamily:F.sans}}>{a.nombre||a.atleta_codigo}</span>
                      <span style={{fontFamily:F.serif,fontSize:18,color:rC2}}>{a.readiness}</span>
                    </div>
                  );
                })}
                {!atletas.some(a=>a.readiness)&&<EmptyState title="Sin Readiness registrado hoy" sub="Los atletas deben registrar biomarcadores"/>}
              </div>
            </ChartCard>
          </div>
        </div>
      )}
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
    <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-60%)",width:600,height:600,background:`radial-gradient(circle, ${C.jade}08 0%, transparent 65%)`,pointerEvents:"none" }}/>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.text};font-family:${F.sans}}input::placeholder{color:${C.textD}}select option{background:${C.card};color:${C.text}}`}</style>
      <div style={{ width:"100%",maxWidth:360,position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:44 }}>
          <div style={{ display:"inline-flex",marginBottom:20,filter:`drop-shadow(0 0 20px ${C.jade}50)` }}><NOALogo size={72}/></div>
          <div style={{ fontFamily:F.sans,fontSize:30,fontWeight:900,color:C.white,marginBottom:6,letterSpacing:"-0.04em" }}>NOA</div>
          <div style={{ fontSize:11,color:C.jade,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:F.sans,fontWeight:600 }}>never over, always</div>
        </div>
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
        <div style={{ textAlign:"center",marginTop:20,fontSize:11,color:C.textD,fontFamily:F.sans }}>Las cuentas las crea tu coach · NOA v2.0</div>
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
  {id:"noa_coach",   icon:"✦", label:"NOA Coach IA"},
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
        background:"#0A0A0A",
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
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <NOALogo size={34}/>
            <div>
              <div style={{ fontFamily:F.sans,fontSize:15,fontWeight:900,color:C.white,lineHeight:1,letterSpacing:"-0.03em" }}>NOA</div>
              <div style={{ fontSize:9,color:C.jade,letterSpacing:"0.14em",marginTop:2,fontFamily:F.sans,textTransform:"uppercase",fontWeight:600 }}>never over, always</div>
            </div>
          </div>
          <button onClick={()=>setOpen(false)} style={{ background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:8,color:C.textS,width:28,height:28,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
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
                background:active?"rgba(0,229,160,0.08)":"transparent",
                border:"none",
                borderLeft:`2px solid ${active?C.jade:"transparent"}`,
                borderRadius:"0 10px 10px 0",
                color:active?C.jade:C.textS,
                fontSize:13,fontWeight:active?700:400,
                cursor:"pointer",textAlign:"left",
                transition:"all 0.15s",fontFamily:F.sans,marginBottom:3,
                letterSpacing:active?"-0.01em":"0",
              }}>
                <span style={{ fontSize:14,opacity:active?1:0.4 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontSize:9,color:C.textD,fontFamily:F.sans }}>NOA v2.0</div>
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
        // e1rm: columna generada por Supabase — no insertar manualmente
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
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:12 }}>
        {semsArr.map(s=>(
          <button key={s} onClick={()=>{setSemSel(s);const dias=Object.keys(plan[s]||{}).map(Number).sort((a,b)=>a-b);if(dias.length)seleccionarDia(s,dias[0]);}} style={{ padding:"6px 14px",borderRadius:10,border:`1.5px solid ${semSel===s?tipoColor:"rgba(255,255,255,0.1)"}`,background:semSel===s?tipoColor+"18":"rgba(255,255,255,0.03)",color:semSel===s?tipoColor:C.textS,fontSize:12,fontWeight:semSel===s?700:400,cursor:"pointer",fontFamily:F.sans,transition:"all 0.15s",letterSpacing:"-0.01em" }}>
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
              <button key={d} onClick={()=>seleccionarDia(semSel,d)} style={{ padding:"9px 18px",borderRadius:11,border:`1.5px solid ${activo?colores.border:colores.border+"55"}`,background:activo?colores.bg:"rgba(255,255,255,0.02)",color:colores.color,fontSize:12,fontWeight:activo?700:500,cursor:"pointer",fontFamily:F.sans,display:"flex",alignItems:"center",gap:6,transition:"all 0.15s",boxShadow:activo?`0 0 16px ${colores.border}30`:"none" }}>
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
            <div style={{ padding:"14px 18px",background:"rgba(0,229,160,0.07)",border:`1px solid rgba(0,229,160,0.25)`,borderRadius:14,marginBottom:16,display:"flex",alignItems:"center",gap:12,backdropFilter:"blur(4px)" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(0,229,160,0.12)",border:"1px solid rgba(0,229,160,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>✓</div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.jade,fontFamily:F.sans,letterSpacing:"-0.01em"}}>Sesión cumplida</div>
                <div style={{fontSize:11,color:C.textS,fontFamily:F.sans,marginTop:2}}>Podés seguir viendo tus registros o editarlos</div>
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
                <Card key={ej.id} style={{ padding:"14px 16px",background:bgColor,borderColor,borderRadius:16,boxShadow:log.done?`0 0 16px ${C.jade}10`:"none" }}>
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
  const [form,setForm]=useState({peso_kg:"",hrv:"",fc_reposo:"",calidad_sueno:7,dolor_muscular:3,estres:3,motivacion:8,calorias:"",proteinas:"",horas_sueno:""});
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{cargar();},[]);
  const cargar=async()=>{
    const sb=await getSB();if(!sb){setLoading(false);return;}
    const today=new Date().toISOString().split("T")[0];
    const {data}=await sb.from("biomarcadores").select("*").eq("atleta_id",user.id).eq("fecha",today).single();
    if (data) setForm({peso_kg:data.peso_kg||"",hrv:data.hrv||"",fc_reposo:data.fc_reposo||"",calidad_sueno:data.calidad_sueno||7,dolor_muscular:data.dolor_muscular||3,estres:data.estres||3,motivacion:data.motivacion||8,calorias:data.calorias||"",proteinas:data.proteinas||"",horas_sueno:data.horas_sueno||""});
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
      calorias:form.calorias?parseFloat(form.calorias):null,
      proteinas:form.proteinas?parseFloat(form.proteinas):null,
      horas_sueno:form.horas_sueno?parseFloat(form.horas_sueno):null,
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
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:10 }}>
        <FInput label="Peso (kg)" value={form.peso_kg} onChange={e=>setForm({...form,peso_kg:e.target.value})} type="number" step="0.1" placeholder="82.4"/>
        <FInput label="HRV (ms)" value={form.hrv} onChange={e=>setForm({...form,hrv:e.target.value})} type="number" placeholder="68"/>
        <FInput label="FC reposo (bpm)" value={form.fc_reposo} onChange={e=>setForm({...form,fc_reposo:e.target.value})} type="number" placeholder="54"/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14 }}>
        <FInput label="Calorías (kcal)" value={form.calorias} onChange={e=>setForm({...form,calorias:e.target.value})} type="number" placeholder="2200"/>
        <FInput label="Proteínas (g)" value={form.proteinas} onChange={e=>setForm({...form,proteinas:e.target.value})} type="number" placeholder="160"/>
        <FInput label="Horas de sueño" value={form.horas_sueno} onChange={e=>setForm({...form,horas_sueno:e.target.value})} type="number" step="0.5" placeholder="8"/>
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
  const [msgs,setMsgs]=useState([{rol:"noa",texto:"Hola! Soy NOA Coach 💪\n\nEstoy cargando tu contexto de entrenamiento para darte respuestas personalizadas. ¿En qué puedo ayudarte?"}]);
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
        <SectionHeader title="NOA Coach" sub={groqActivo?"Groq · LLaMA 3 70B · contexto real del atleta":"Modo demo · configurá NEXT_PUBLIC_GROQ_KEY en Vercel"}/>
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
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Preguntale a NOA Coach..." style={{ flex:1,padding:"12px 16px",background:C.card,border:`1px solid ${C.borderH}`,borderRadius:10,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans }}/>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:${C.bg};color:${C.text};font-family:${F.sans};-webkit-tap-highlight-color:transparent;}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.18)}
    input[type=range]{height:3px;cursor:pointer;border-radius:2px;accent-color:${C.jade}}
    *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
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
        <div style={{ display:"inline-flex",marginBottom:16,filter:`drop-shadow(0 0 24px ${C.jade}60)` }}><NOALogo size={56}/></div>
        <div style={{ fontSize:11,color:C.textD,fontFamily:F.sans,letterSpacing:"0.15em",textTransform:"uppercase" }}>Cargando NOA…</div>
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
          height:54,
          background:"rgba(6,6,6,0.92)",backdropFilter:"blur(20px)",
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
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <NOALogo size={26}/>
            <span style={{ fontFamily:F.sans,fontSize:14,fontWeight:900,color:C.white,letterSpacing:"-0.03em" }}>NOA</span>
          </div>

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
        <main style={{ paddingTop:54,minHeight:"100vh",overflowY:"auto" }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}
