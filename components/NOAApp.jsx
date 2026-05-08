'use client'
// ═══════════════════════════════════════════════════
// NOA v2.0 — Never Over, Always
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
    const sistema = `Sos NOA Coach, asistente experto en entrenamiento de fuerza de la app NOA (Never Over, Always).
Respondé en español rioplatense. Máximo 3 párrafos. Sé conciso y técnico.
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
  // Nuevos atletas se agregan acá automáticamente o manualmente
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
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ width:68,height:68,borderRadius:18,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:30,color:C.deep,fontFamily:F.serif,boxShadow:`0 0 40px ${C.jade}55`,marginBottom:16 }}>N</div>
          <div style={{ fontFamily:F.serif,fontSize:34,color:C.white,marginBottom:4 }}>NOA</div>
          <div style={{ fontSize:11,color:C.jade,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:F.sans }}>never over, always</div>
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
  {id:"calendario",  icon:"◈", label:"Mi calendario"},
  {id:"biomarcadores",icon:"◆",label:"Biomarcadores"},
  {id:"marcas",      icon:"◎", label:"Mis marcas"},
  {id:"noa_coach",   icon:"✦", label:"NOA Coach IA"},
];
const NAV_COACH = [
  {id:"c_atletas",   icon:"◈", label:"Mis atletas"},
  {id:"c_ciclos",    icon:"◉", label:"Ciclos"},
  {id:"c_planificar",icon:"◆", label:"Planificar"},
  {id:"c_ejercicios",icon:"◇", label:"Ejercicios"},
  {id:"c_vista",     icon:"◎", label:"Ver como atleta"},
];

function Sidebar({ sec, setSec, rol, perfil, onLogout }) {
  const nav = rol==="coach"?NAV_COACH:NAV_ATLETA;
  return (
    <aside style={{ width:224,minWidth:224,background:C.deep,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0 }}>
      <div style={{ padding:"22px 20px 16px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:C.deep,fontFamily:F.serif,boxShadow:`0 0 14px ${C.jade}44` }}>N</div>
          <div>
            <div style={{ fontFamily:F.serif,fontSize:18,color:C.white,lineHeight:1 }}>NOA</div>
            <div style={{ fontSize:9,color:C.jade,letterSpacing:"0.14em",marginTop:2,fontFamily:F.sans,textTransform:"uppercase" }}>never over, always</div>
          </div>
        </div>
      </div>

      <div style={{ padding:"10px 16px",borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:30,height:30,borderRadius:7,background:C.jade+"22",border:`1px solid ${C.jade}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,color:C.jade,fontSize:13 }}>
            {(perfil?.nombre||perfil?.atleta_codigo||"?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:12,fontWeight:600,color:C.text,fontFamily:F.sans }}>{perfil?.nombre||perfil?.atleta_codigo||"Usuario"}</div>
            <div style={{ fontSize:10,color:C.jade,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:F.sans }}>{rol}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex:1,padding:"10px 10px",overflowY:"auto" }}>
        {nav.map(item=>{
          const active=sec===item.id;
          return <button key={item.id} onClick={()=>setSec(item.id)} style={{ display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",background:active?C.jade+"14":"transparent",border:"none",borderLeft:`2px solid ${active?C.jade:"transparent"}`,borderRadius:"0 8px 8px 0",color:active?C.jade:C.textS,fontSize:12,fontWeight:active?600:400,cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontFamily:F.sans,marginBottom:1 }}>
            <span style={{ fontSize:13,opacity:active?1:0.5 }}>{item.icon}</span>{item.label}
          </button>;
        })}
      </nav>

      <div style={{ padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:9,color:C.textD,fontFamily:F.sans }}>NOA v2.0</div>
        <button onClick={onLogout} style={{ fontSize:10,color:C.textD,background:"none",border:"none",cursor:"pointer",fontFamily:F.sans }}>Salir →</button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────
// SESIÓN DE HOY (atleta)
// ─────────────────────────────────────────
function SesionHoy({ user }) {
  const [sesion,setSesion]=useState([]);
  const [logs,setLogs]=useState({});
  const [nota,setNota]=useState("");
  const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);
  const [cicloInfo,setCicloInfo]=useState(null);
  const [semActual,setSemActual]=useState(1);
  const [diaActual,setDiaActual]=useState(1);

  useEffect(()=>{cargar();},[]);

  const cargar = async () => {
    setLoading(true);
    const sb=await getSB();
    if (!sb||!user){setLoading(false);return;}
    const {data:ciclos}=await sb.from("ciclos").select("*").eq("atleta_id",user.id).eq("activo",true).order("created_at",{ascending:false}).limit(1);
    if (!ciclos?.length){setLoading(false);return;}
    const c=ciclos[0];setCicloInfo(c);
    const inicio=new Date(c.fecha_inicio);
    const hoy=new Date();
    const diffDias=Math.max(0,Math.floor((hoy-inicio)/(1000*60*60*24)));
    const sem=Math.min(c.semanas,Math.floor(diffDias/7)+1);
    const dia=(diffDias%7)+1;
    setSemActual(sem);setDiaActual(dia);
    const {data:ejs}=await sb.from("sesiones_plan").select("*,ejercicios(nombre,grupo_muscular,patron_movimiento)").eq("ciclo_id",c.id).eq("semana",sem).eq("dia",dia).order("orden");
    setSesion(ejs||[]);
    setLogs((ejs||[]).reduce((a,e)=>({...a,[e.id]:{kg:"",rpe:"",done:false}}),{}));
    setLoading(false);
  };

  const upd=(id,f,v)=>setLogs(p=>({...p,[id]:{...p[id],[f]:v}}));
  const tonelaje=sesion.reduce((acc,e)=>acc+(e.series*(parseInt(e.reps)||0)*(parseFloat(logs[e.id]?.kg)||0)),0);
  const done=Object.values(logs).filter(l=>l.done).length;

  const guardar=async()=>{
    const sb=await getSB();
    if (!sb||!cicloInfo)return;
    const rows=sesion.filter(e=>logs[e.id]?.kg).map(e=>({
      atleta_id:user.id,ciclo_id:cicloInfo.id,sesion_plan_id:e.id,
      ejercicio_id:e.ejercicio_id,semana:semActual,dia:diaActual,
      carga_kg:parseFloat(logs[e.id].kg)||null,rpe:parseFloat(logs[e.id].rpe)||null,
      series_realizadas:e.series,reps_realizadas:parseInt(e.reps)||null,
      completado:logs[e.id].done,notas:nota||null,
    }));
    if (rows.length) await sb.from("logs_entrenamiento").insert(rows);
    setSaved(true);setTimeout(()=>setSaved(false),3000);
  };

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"28px 32px",maxWidth:960 }}>
      <SectionHeader title="Sesión de hoy" sub={new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}
        tags={cicloInfo?[{label:cicloInfo.nombre,color:C.jade},{label:`Sem ${semActual} · ${DIAS[diaActual]}`,color:C.blue}]:[]}/>

      {sesion.length===0?(
        <EmptyState title="Sin sesión asignada hoy" sub="Tu coach no planificó entrenamiento para hoy. ¡Día de recuperación! 🌿"/>
      ):(
        <>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24 }}>
            <Stat label="Tonelaje" value={tonelaje>0?Math.round(tonelaje).toLocaleString("es"):"—"} unit="kg · en vivo" color={C.jade}/>
            <Stat label="Ejercicios" value={sesion.length} unit="en sesión" color={C.blue}/>
            <Stat label="Completados" value={`${done}/${sesion.length}`} color={done===sesion.length?C.jade:C.amber}/>
            <Stat label="Ciclo" value={CICLOS_TIPOS.find(t=>t.key===cicloInfo?.tipo)?.label||"—"} unit={`${CICLOS_TIPOS.find(t=>t.key===cicloInfo?.tipo)?.pct||""}%`} color={C.violet}/>
          </div>

          <Card style={{ padding:0,overflow:"hidden",marginBottom:18 }}>
            <div style={{ display:"grid",gridTemplateColumns:"24px 1fr 52px 56px 68px 68px 88px 58px",padding:"9px 18px",gap:8,fontSize:10,fontWeight:700,color:C.textD,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontFamily:F.sans }}>
              <div/><div>Ejercicio</div><div>Ser.</div><div>Reps</div><div>%RM</div><div>Plan kg</div><div style={{color:C.jade}}>Real kg</div><div>RPE</div>
            </div>
            {sesion.map((ej,i)=>{
              const log=logs[ej.id]||{};
              const kgN=parseFloat(log.kg);
              const diff=kgN&&ej.carga_kg?((kgN-ej.carga_kg)/ej.carga_kg*100):null;
              return (
                <div key={ej.id} style={{ display:"grid",gridTemplateColumns:"24px 1fr 52px 56px 68px 68px 88px 58px",padding:"11px 18px",gap:8,borderBottom:i<sesion.length-1?`1px solid ${C.border}`:"none",background:log.done?C.jade+"08":"transparent",alignItems:"center" }}>
                  <div onClick={()=>upd(ej.id,"done",!log.done)} style={{ width:18,height:18,borderRadius:5,cursor:"pointer",border:`1.5px solid ${log.done?C.jade:C.borderH}`,background:log.done?C.jade:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.deep,fontWeight:900 }}>{log.done?"✓":""}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans }}>{ej.ejercicios?.nombre}</div>
                    <div style={{ fontSize:10,color:C.textD }}>{ej.ejercicios?.patron_movimiento} · {ej.ejercicios?.grupo_muscular}</div>
                    {ej.notas_coach&&<div style={{ fontSize:10,color:C.amber,marginTop:1 }}>📌 {ej.notas_coach}</div>}
                  </div>
                  <div style={{ fontSize:13,color:C.text }}>{ej.series}</div>
                  <div style={{ fontSize:13,color:C.textS }}>{ej.reps}</div>
                  <div style={{ fontSize:12,color:C.textS }}>{ej.intensidad_pct?`${ej.intensidad_pct}%`:"—"}</div>
                  <div style={{ fontSize:13,color:C.textD }}>{ej.carga_kg||"—"}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <input value={log.kg||""} onChange={e=>upd(ej.id,"kg",e.target.value)} placeholder={ej.carga_kg||"kg"} style={{ width:52,padding:"5px 7px",background:C.surface,border:`1px solid ${kgN?C.jade+"AA":C.border}`,borderRadius:7,color:C.white,fontSize:13,fontWeight:700,outline:"none",fontFamily:F.serif }}/>
                    {diff!==null&&<span style={{ fontSize:9,color:diff>=0?C.jade:C.red }}>{diff>=0?"+":""}{diff.toFixed(0)}%</span>}
                  </div>
                  <select value={log.rpe||""} onChange={e=>upd(ej.id,"rpe",e.target.value)} style={{ width:50,padding:"5px 3px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,color:C.textS,fontSize:12,outline:"none" }}>
                    <option value="">—</option>
                    {[6,6.5,7,7.5,8,8.5,9,9.5,10].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              );
            })}
          </Card>

          <Card style={{ marginBottom:18 }}>
            <div style={{ fontSize:11,fontWeight:700,color:C.textS,marginBottom:8,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:F.sans }}>Nota de sesión</div>
            <textarea value={nota} onChange={e=>setNota(e.target.value)} placeholder="¿Cómo te sentiste? ¿Algo a ajustar?" rows={2} style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,padding:"10px 13px",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:F.sans }}/>
          </Card>

          <div style={{ display:"flex",gap:12,alignItems:"center" }}>
            <Btn onClick={guardar}>{saved?"✓ Guardado":"Guardar sesión"}</Btn>
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>{done}/{sesion.length} completados</div>
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
    <div style={{ padding:"28px 32px",maxWidth:900 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
        <SectionHeader title="Mis atletas" sub={`${atletas.length} atletas registrados`}/>
        <Btn onClick={()=>{setNuevoModal(true);setMsg({tipo:"",texto:""});}}>+ Nuevo atleta</Btn>
      </div>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 70px 120px",padding:"9px 18px",fontSize:10,fontWeight:700,color:C.textD,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontFamily:F.sans }}>
          <div>ID</div><div>Nombre</div><div>Perfil</div><div>Peso</div><div>Estado</div><div/>
        </div>
        {atletas.length===0?(
          <div style={{ padding:"32px 18px",textAlign:"center",color:C.textD,fontFamily:F.sans,fontSize:13 }}>
            No hay atletas todavía · creá el primero con el botón de arriba
          </div>
        ):atletas.map((a,i)=>(
          <div key={a.id} style={{ display:"grid",gridTemplateColumns:"80px 1fr 140px 100px 70px 120px",padding:"11px 18px",alignItems:"center",borderBottom:i<atletas.length-1?`1px solid ${C.border}`:"none" }}>
            <Tag color={C.jade} sm>{a.atleta_codigo||"—"}</Tag>
            <div style={{ fontSize:13,fontWeight:600,color:a.nombre?C.text:C.textD,fontFamily:F.sans }}>{a.nombre||"Sin nombre"}</div>
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>{a.perfil_deporte||"—"}</div>
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>{a.peso_actual?`${a.peso_actual}kg`:"—"}</div>
            <Tag color={a.activo!==false?C.jade:C.textD} sm>{a.activo!==false?"Activo":"Inactivo"}</Tag>
            <div style={{display:"flex",gap:6}}>
              <Btn sm onClick={()=>onVerAtleta&&onVerAtleta(a)} color={C.blue}>Ver</Btn>
              <Btn sm outline onClick={()=>{setEditando(a);setFormEdit({nombre:a.nombre||"",perfil_deporte:a.perfil_deporte||"",peso_actual:a.peso_actual||"",talla:a.talla||"",activo:a.activo!==false});}}>Editar</Btn>
            </div>
          </div>
        ))}
      </Card>

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
    const {data}=await sb.from("ejercicios").select("*").order("nombre");
    setEjercicios(data||[]);setLoading(false);
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

  const filtrados=ejercicios.filter(e=>!filtro||e.nombre.toLowerCase().includes(filtro.toLowerCase())||(e.grupo_muscular||"").toLowerCase().includes(filtro.toLowerCase()));
  const nC={avanzado:C.red,intermedio:C.amber,basico:C.jade};
  const tC={principal:C.blue,accesorio:C.violet,cardio:C.amber,movilidad:C.jade};

  if (loading) return <div style={{padding:32}}><Spinner/></div>;

  return (
    <div style={{ padding:"28px 32px",maxWidth:920 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
        <SectionHeader title="Ejercicios" sub={`${ejercicios.length} ejercicios en el banco`}/>
        <Btn onClick={()=>setModal(true)}>+ Nuevo ejercicio</Btn>
      </div>
      <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Buscar por nombre o grupo muscular..." style={{ width:"100%",padding:"9px 13px",background:C.card,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,fontSize:13,outline:"none",fontFamily:F.sans,marginBottom:16,boxSizing:"border-box" }}/>
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 120px 130px 90px 90px",padding:"9px 18px",fontSize:10,fontWeight:700,color:C.textD,letterSpacing:"0.08em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`,fontFamily:F.sans }}>
          <div>Ejercicio</div><div>Patrón</div><div>Grupo</div><div>Nivel</div><div>Tipo</div>
        </div>
        {filtrados.map((e,i)=>(
          <div key={e.id} style={{ display:"grid",gridTemplateColumns:"1fr 120px 130px 90px 90px",padding:"11px 18px",alignItems:"center",borderBottom:i<filtrados.length-1?`1px solid ${C.border}`:"none" }}
            onMouseEnter={ev=>ev.currentTarget.style.background=C.surface}
            onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:C.text,fontFamily:F.sans }}>{e.nombre}</div>
              {e.creado_por&&<span style={{ fontSize:9,color:C.jade,fontFamily:F.sans }}>personalizado</span>}
            </div>
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>{e.patron_movimiento||"—"}</div>
            <div style={{ fontSize:12,color:C.textS,fontFamily:F.sans }}>{e.grupo_muscular||"—"}</div>
            <Tag color={nC[e.nivel]||C.jade} sm>{e.nivel||"—"}</Tag>
            <Tag color={tC[e.tipo]||C.jade} sm>{e.tipo||"—"}</Tag>
          </div>
        ))}
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="Nuevo ejercicio">
        <FInput label="Nombre *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Zancada con mancuernas"/>
        <FInput label="Grupo muscular" value={form.grupo_muscular} onChange={e=>setForm({...form,grupo_muscular:e.target.value})} placeholder="Pierna, Pecho, Espalda..."/>
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
    const sb=await getSB();if(!sb)return;
    await sb.from("biomarcadores").upsert({atleta_id:user.id,fecha:new Date().toISOString().split("T")[0],...form,peso_kg:form.peso_kg?parseFloat(form.peso_kg):null,hrv:form.hrv?parseFloat(form.hrv):null,fc_reposo:form.fc_reposo?parseInt(form.fc_reposo):null},{onConflict:"atleta_id,fecha"});
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
// NOA COACH IA
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
    "¿Cuánto tonelaje debería hacer esta semana?",
    "¿Puedo aumentar la carga hoy?",
    "¿Qué es el RIR y cómo lo uso?",
    "Explicame mi ciclo actual",
    "¿Mi HRV indica que estoy recuperado?",
    "¿Cómo progreso de hipertrofia a fuerza?",
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
            <div style={{ maxWidth:"78%",background:m.rol==="user"?C.jade+"18":C.card,border:`1px solid ${m.rol==="user"?C.jade+"44":C.border}`,borderRadius:m.rol==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",fontSize:13,color:C.text,lineHeight:1.65,whiteSpace:"pre-wrap",fontFamily:F.sans }}>{m.texto}</div>
          </div>
        ))}
        {loading&&<div style={{ display:"flex",gap:8,alignItems:"center" }}><div style={{ width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.deep,fontFamily:F.serif }}>N</div><div style={{ color:C.textS,fontSize:13,fontFamily:F.sans }}>NOA está pensando…</div></div>}
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
    html,body{background:${C.bg};color:${C.text};font-family:${F.sans}}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
    input[type=range]{height:4px;cursor:pointer;border-radius:2px}
    input::placeholder,textarea::placeholder{color:${C.textD}}
    select option{background:${C.card};color:${C.text}}
    @keyframes spin{to{transform:rotate(360deg)}}
  `;

  // Render de contenido — función para evitar instanciar todo a la vez
  const renderContent = () => {
    if (!user) return null;
    switch(sec) {
      case "hoy":           return <SesionHoy user={user}/>;
      case "calendario":    return <CalendarioAtleta user={user}/>;
      case "biomarcadores": return <Biomarcadores user={user}/>;
      case "marcas":        return <Marcas user={user}/>;
      case "noa_coach":     return <NOACoach perfil={perfil} user={user}/>;
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
        <div style={{ width:52,height:52,borderRadius:13,background:`linear-gradient(135deg,${C.jade3},${C.jade})`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:24,color:C.deep,fontFamily:F.serif,marginBottom:14,boxShadow:`0 0 30px ${C.jade}55` }}>N</div>
        <div style={{ fontSize:13,color:C.textS,fontFamily:F.sans }}>Cargando NOA…</div>
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
      <div style={{ display:"flex",minHeight:"100vh",background:C.bg }}>
        <Sidebar sec={sec} setSec={setSec} rol={rol} perfil={perfil} onLogout={logout}/>
        <main style={{ flex:1,overflowY:"auto",minHeight:"100vh" }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}
