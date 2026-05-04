'use client'
// ============================================================
// NOA — Never Over, Always
// Plataforma de entrenamiento de fuerza inteligente
// Stack: React (Next.js) + Supabase + Groq AI
// Diseño: Medianoche profunda · Jade luminoso · DM Serif + DM Sans
// ============================================================

import { useState, useEffect, useRef } from "react";
import { consultarNOACoach } from '../lib/groq';
import { supabase, saveBiomarcadores, logSesion, calcularReadiness } from '../lib/supabase';

// ─────────────────────────────────────────
// SUPABASE SCHEMA — copiar en SQL Editor de Supabase
// ─────────────────────────────────────────
/*
-- PERFILES DE USUARIO
create table profiles (
  id uuid primary key references auth.users,
  nombre text not null,
  rol text check (rol in ('atleta','coach')) default 'atleta',
  perfil_deporte text,
  fecha_nac date,
  peso_actual numeric,
  talla numeric,
  created_at timestamptz default now()
);

-- EJERCICIOS (catálogo maestro expandible)
create table ejercicios (
  id serial primary key,
  nombre text not null,
  grupo_muscular text,
  patron_movimiento text,
  perfil text[],
  nivel text check (nivel in ('basico','intermedio','avanzado')),
  tipo text check (tipo in ('principal','accesorio','cardio','movilidad'))
);

-- CICLOS
create table ciclos (
  id serial primary key,
  atleta_id uuid references profiles(id),
  coach_id uuid references profiles(id),
  nombre text,
  tipo text,
  fecha_inicio date,
  fecha_fin date,
  semanas int,
  sesiones_semana int,
  notas text
);

-- PLAN DE SESIONES
create table sesiones_plan (
  id serial primary key,
  ciclo_id int references ciclos(id),
  semana int,
  sesion int,
  orden int,
  ejercicio_id int references ejercicios(id),
  series int,
  reps text,
  intensidad_pct numeric,
  rir int,
  descanso_seg int,
  notas_coach text
);

-- LOG REAL
create table logs_entrenamiento (
  id serial primary key,
  atleta_id uuid references profiles(id),
  ciclo_id int references ciclos(id),
  sesion_plan_id int references sesiones_plan(id),
  fecha timestamptz default now(),
  semana int,
  sesion int,
  ejercicio_id int references ejercicios(id),
  series_realizadas int,
  reps_realizadas int,
  carga_kg numeric,
  rpe numeric,
  rir_real int,
  completado boolean default true,
  notas text,
  tonelaje numeric generated always as (series_realizadas * reps_realizadas * carga_kg) stored,
  e1rm numeric
);

-- BIOMARCADORES
create table biomarcadores (
  id serial primary key,
  atleta_id uuid references profiles(id),
  fecha date default current_date,
  peso_kg numeric,
  hrv numeric,
  fc_reposo int,
  calidad_sueno int,
  dolor_muscular int,
  estres int,
  motivacion int,
  notas text
);

-- MARCAS PERSONALES
create table marcas (
  id serial primary key,
  atleta_id uuid references profiles(id),
  ejercicio_id int references ejercicios(id),
  fecha date,
  rm1_real numeric,
  rm1_estimado numeric,
  notas text
);
*/

// consultarNOACoach importado desde lib/groq.js

// ─────────────────────────────────────────
// PALETA NOA — Medianoche + Jade
// ─────────────────────────────────────────
const C = {
  bg:       "#070C18",
  deep:     "#050913",
  surface:  "#0D1425",
  card:     "#101828",
  cardHov:  "#141f30",
  border:   "#1E2D45",
  borderHi: "#2A3F5F",
  jade:     "#00E5A0",
  jade2:    "#00BF86",
  jade3:    "#007A56",
  jadeGlow: "#00E5A022",
  blue:     "#4D9FFF",
  amber:    "#FFB84D",
  red:      "#FF5C5C",
  violet:   "#A78BFA",
  text:     "#E8F0FE",
  textSub:  "#8899BB",
  textDim:  "#3A4F6A",
  white:    "#F0F6FF",
};

// ─────────────────────────────────────────
// DATOS DEMO
// ─────────────────────────────────────────
const ATLETA = {
  nombre: "Leo Baena", perfil: "Híbrido",
  ciclo: "Fuerza Potencia", semana: 3, semanas_total: 6, sesion: 2,
  adherencia: 87, rm_squat: 140, rm_press: 90, rm_deadlift: 180,
};
const SESION_HOY = [
  { id:1, orden:1, nombre:"Sentadilla trasera", series:5, reps:"3", pct:85, kg_plan:119, patron:"Sentadilla", grupo:"Pierna" },
  { id:2, orden:2, nombre:"Peso muerto",        series:4, reps:"4", pct:80, kg_plan:144, patron:"Bisagra",    grupo:"Cadena post." },
  { id:3, orden:3, nombre:"Press banca",        series:4, reps:"5", pct:75, kg_plan:67,  patron:"Empuje",     grupo:"Pecho" },
  { id:4, orden:4, nombre:"Remo con barra",     series:3, reps:"6", pct:70, kg_plan:73,  patron:"Jale",       grupo:"Espalda" },
  { id:5, orden:5, nombre:"Hip thrust",         series:3, reps:"8", pct:65, kg_plan:120, patron:"Bisagra",    grupo:"Glúteos" },
];
const HISTORICO = [
  { semana:1, tonelaje:8420, rpe:7.2, sesiones:3 },
  { semana:2, tonelaje:9100, rpe:7.6, sesiones:3 },
  { semana:3, tonelaje:9870, rpe:7.9, sesiones:2 },
];
const BIO = { peso:82.4, hrv:68, fc:54, sueno:7, doms:4, estres:3, motivacion:8 };
const CICLOS = [
  { key:"adaptacion",  label:"Adaptación",     color:"#4ade80", pct:"50–65", reps:"12–15", sem:"3–4", desc:"Base aeróbica y técnica. Adaptación muscular y tendinosa al nuevo estímulo." },
  { key:"hipertrofia", label:"Hipertrofia",     color:"#4D9FFF", pct:"65–75", reps:"8–12",  sem:"4–6", desc:"Volumen moderado-alto. Máximo estrés metabólico y tensión mecánica sostenida." },
  { key:"fza_res",     label:"Fza Resistencia", color:"#FFB84D", pct:"70–80", reps:"6–10",  sem:"3–4", desc:"Fuerza sostenida en el tiempo. Alta densidad de entrenamiento." },
  { key:"fza_pot",     label:"Fza Potencia",    color:"#FF5C5C", pct:"75–85", reps:"3–6",   sem:"3–4", desc:"Velocidad de ejecución máxima. RIR objetivo 2–3." },
  { key:"submax",      label:"Submáxima",       color:"#A78BFA", pct:"85–92", reps:"1–4",   sem:"2–3", desc:"Preparación para máximos. Alta intensidad, bajo volumen." },
  { key:"neural",      label:"Neural / Pico",   color:"#00E5A0", pct:"90–100",reps:"1–3",   sem:"1–2", desc:"Activación neural máxima. Semana de peak o test de RM." },
];
const PERFILES = ["Fitness","Híbrido","CrossFit","Conj. deportivo","Individual","Resistencia","Musculación"];
const EJERCICIOS_DB = [
  { id:1, nombre:"Sentadilla trasera",     grupo:"Pierna",      patron:"Sentadilla", nivel:"avanzado",   tipo:"principal", perfil:["fitness","hibrido","musculacion"] },
  { id:2, nombre:"Peso muerto conv.",      grupo:"Cadena post.",patron:"Bisagra",    nivel:"avanzado",   tipo:"principal", perfil:["fitness","hibrido","musculacion"] },
  { id:3, nombre:"Press banca plano",      grupo:"Pecho",       patron:"Empuje",     nivel:"intermedio", tipo:"principal", perfil:["fitness","hibrido","musculacion"] },
  { id:4, nombre:"Remo con barra",         grupo:"Espalda",     patron:"Jale",       nivel:"intermedio", tipo:"principal", perfil:["fitness","hibrido","musculacion"] },
  { id:5, nombre:"Hip thrust",             grupo:"Glúteos",     patron:"Bisagra",    nivel:"basico",     tipo:"principal", perfil:["fitness","hibrido","resistencia"] },
  { id:6, nombre:"Clean & Jerk",           grupo:"Full body",   patron:"Cargada",    nivel:"avanzado",   tipo:"principal", perfil:["cross","individual"] },
  { id:7, nombre:"Burpee box jump",        grupo:"Cardio",      patron:"Full body",  nivel:"intermedio", tipo:"cardio",    perfil:["cross","conj"] },
  { id:8, nombre:"Zancadas búlgaras",      grupo:"Pierna",      patron:"Sentadilla", nivel:"intermedio", tipo:"accesorio", perfil:["fitness","hibrido","conj","individual"] },
  { id:9, nombre:"Dominadas",              grupo:"Espalda",     patron:"Jale",       nivel:"intermedio", tipo:"accesorio", perfil:["fitness","hibrido","cross"] },
  { id:10, nombre:"Press militar",         grupo:"Hombros",     patron:"Empuje",     nivel:"intermedio", tipo:"principal", perfil:["fitness","hibrido","musculacion"] },
];

// ─────────────────────────────────────────
// COMPONENTES BASE
// ─────────────────────────────────────────
function Tag({ color = C.jade, children, small }) {
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}40`,
      borderRadius: 5, padding: small ? "1px 6px" : "3px 9px",
      fontSize: small ? 10 : 11, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase",
      fontFamily: "'DM Sans', sans-serif",
    }}>{children}</span>
  );
}

function Card({ children, style = {}, onClick, glow }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov && onClick ? C.cardHov : C.card,
        border: `1px solid ${hov && onClick ? C.borderHi : C.border}`,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        boxShadow: glow ? `0 0 24px ${C.jade}18` : "none",
        ...style,
      }}
    >{children}</div>
  );
}

function Stat({ label, value, unit, color = C.jade, accent }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 16px", textAlign: "center",
    }}>
      <div style={{ fontSize: 10, color: C.textSub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>{value}</div>
      {unit && <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>{unit}</div>}
    </div>
  );
}

function Bar({ value, max = 100, color = C.jade, h = 5 }) {
  return (
    <div style={{ background: C.border, borderRadius: 99, height: h, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(100, (value / max) * 100)}%`, height: "100%",
        background: color, borderRadius: 99, transition: "width 0.7s ease",
      }} />
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "4px 0" }} />;
}

// ─────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────
const NAV_ATLETA = [
  { id:"hoy",          icon:"◈", label:"Sesión de hoy" },
  { id:"dashboard",    icon:"◉", label:"Dashboard" },
  { id:"historial",    icon:"▣", label:"Historial" },
  { id:"biomarcadores",icon:"◆", label:"Biomarcadores" },
  { id:"ciclos",       icon:"◇", label:"Ciclos" },
  { id:"marcas",       icon:"◎", label:"Marcas personales" },
  { id:"noa_coach",    icon:"✦", label:"NOA Coach IA" },
];
const NAV_COACH = [
  { id:"c_atletas",    icon:"◈", label:"Mis atletas" },
  { id:"c_planificar", icon:"◉", label:"Planificar ciclo" },
  { id:"c_ejercicios", icon:"◆", label:"Ejercicios" },
  { id:"c_reportes",   icon:"◇", label:"Reportes" },
];

function Sidebar({ sec, setSec, rol, setRol }) {
  const nav = rol === "coach" ? NAV_COACH : NAV_ATLETA;
  return (
    <aside style={{
      width: 228, minWidth: 228, background: C.deep,
      borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
    }}>

      {/* Logo NOA */}
      <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: C.deep,
            fontFamily: "'DM Serif Display', serif",
            boxShadow: `0 0 16px ${C.jade}44`,
            letterSpacing: "0.05em",
          }}>N</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.white, letterSpacing: "0.04em", lineHeight: 1 }}>NOA</div>
            <div style={{ fontSize: 9, color: C.jade, letterSpacing: "0.15em", marginTop: 2, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>never over, always</div>
          </div>
        </div>
      </div>

      {/* Toggle rol */}
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", background: C.surface, borderRadius: 8, padding: 2 }}>
          {["atleta","coach"].map(r => (
            <button key={r} onClick={() => setRol(r)} style={{
              flex: 1, padding: "5px 0", border: "none", borderRadius: 6,
              background: rol === r ? C.jade : "transparent",
              color: rol === r ? C.deep : C.textSub,
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.06em",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Atleta card */}
      {rol === "atleta" && (
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: C.jade + "22", border: `1px solid ${C.jade}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: C.jade, fontFamily: "'DM Serif Display', serif",
            }}>
              {ATLETA.nombre.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>{ATLETA.nombre}</div>
              <div style={{ fontSize: 10, color: C.textSub }}>{ATLETA.perfil}</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: C.textSub, marginBottom: 4 }}>
            {ATLETA.ciclo} · Sem {ATLETA.semana}/{ATLETA.semanas_total}
          </div>
          <Bar value={ATLETA.adherencia} color={C.jade} h={3} />
          <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>Adherencia {ATLETA.adherencia}%</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {nav.map(item => {
          const active = sec === item.id;
          return (
            <button key={item.id} onClick={() => setSec(item.id)} style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "8px 12px",
              background: active ? C.jade + "14" : "transparent",
              border: "none",
              borderLeft: `2px solid ${active ? C.jade : "transparent"}`,
              borderRadius: "0 8px 8px 0",
              color: active ? C.jade : C.textSub,
              fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: "pointer", textAlign: "left",
              transition: "all 0.15s",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 1,
            }}>
              <span style={{ fontSize: 13, opacity: active ? 1 : 0.5, letterSpacing: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>NOA v1.0 · Supabase + Groq</div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────
// HEADER DE SECCIÓN
// ─────────────────────────────────────────
function SectionHeader({ title, sub, tags = [] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {tags.map((t, i) => <Tag key={i} color={t.color || C.jade}>{t.label}</Tag>)}
        </div>
      )}
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 28, fontWeight: 400, color: C.white,
        margin: 0, letterSpacing: "0.01em", lineHeight: 1.1,
      }}>{title}</h1>
      {sub && <div style={{ fontSize: 13, color: C.textSub, marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: SESIÓN DE HOY
// ─────────────────────────────────────────
function SesionHoy() {
  const init = SESION_HOY.reduce((a, e) => ({ ...a, [e.id]: { kg:"", rpe:"", done:false } }), {});
  const [logs, setLogs] = useState(init);
  const [nota, setNota] = useState("");
  const [saved, setSaved] = useState(false);

  const upd = (id, f, v) => setLogs(p => ({ ...p, [id]: { ...p[id], [f]: v } }));

  const tonelaje = SESION_HOY.reduce((acc, e) => {
    const kg = parseFloat(logs[e.id].kg) || 0;
    return acc + (e.series * parseInt(e.reps) * kg);
  }, 0);

  const done = Object.values(logs).filter(l => l.done).length;

  const guardar = () => {
    // → supabase.from('logs_entrenamiento').insert(...)
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 960 }}>
      <SectionHeader
        title="Sesión de hoy"
        sub={new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" })}
        tags={[
          { label:`Semana ${ATLETA.semana}`, color: C.jade },
          { label:`Sesión ${ATLETA.sesion}`, color: C.blue },
          { label: ATLETA.ciclo, color: C.violet },
        ]}
      />

      {/* KPIs live */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        <Stat label="Tonelaje acum." value={tonelaje > 0 ? Math.round(tonelaje).toLocaleString("es") : "—"} unit="kg · en vivo" color={C.jade} />
        <Stat label="Ejercicios" value={SESION_HOY.length} unit="en sesión" color={C.blue} />
        <Stat label="Intensidad" value="85%" unit="del 1RM" color={C.violet} />
        <Stat label="Completados" value={`${done}/${SESION_HOY.length}`} unit={done === SESION_HOY.length ? "✓ sesión lista" : "ejercicios"} color={done === SESION_HOY.length ? C.jade : C.amber} />
      </div>

      {/* Tabla */}
      <Card style={{ padding: 0, overflow:"hidden", marginBottom:18 }}>
        {/* Header tabla */}
        <div style={{
          display:"grid", gridTemplateColumns:"24px 1fr 64px 56px 72px 72px 90px 64px",
          padding:"9px 18px", gap:8,
          fontSize:10, fontWeight:700, color:C.textDim,
          letterSpacing:"0.1em", textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`,
          fontFamily:"'DM Sans', sans-serif",
        }}>
          <div></div>
          <div>Ejercicio</div>
          <div>Ser.</div>
          <div>Reps</div>
          <div>% 1RM</div>
          <div>Plan kg</div>
          <div style={{ color:C.jade }}>Real kg</div>
          <div>RPE</div>
        </div>

        {SESION_HOY.map((ej, i) => {
          const log = logs[ej.id];
          const kgN = parseFloat(log.kg);
          const diff = kgN && ej.kg_plan ? ((kgN - ej.kg_plan) / ej.kg_plan * 100) : null;
          return (
            <div key={ej.id} style={{
              display:"grid", gridTemplateColumns:"24px 1fr 64px 56px 72px 72px 90px 64px",
              padding:"11px 18px", gap:8,
              borderBottom: i < SESION_HOY.length - 1 ? `1px solid ${C.border}` : "none",
              background: log.done ? C.jade + "08" : "transparent",
              alignItems:"center", transition:"background 0.2s",
            }}>
              <div
                onClick={() => upd(ej.id, "done", !log.done)}
                style={{
                  width:18, height:18, borderRadius:5, cursor:"pointer",
                  border:`1.5px solid ${log.done ? C.jade : C.borderHi}`,
                  background: log.done ? C.jade : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, color:C.deep, fontWeight:900,
                  transition:"all 0.2s",
                }}
              >{log.done ? "✓" : ""}</div>

              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:"'DM Sans', sans-serif" }}>{ej.nombre}</div>
                <div style={{ fontSize:10, color:C.textDim, marginTop:1 }}>{ej.patron} · {ej.grupo}</div>
              </div>

              <div style={{ fontSize:13, color:C.text, fontFamily:"'DM Sans', sans-serif" }}>{ej.series}</div>
              <div style={{ fontSize:13, color:C.textSub }}>{ej.reps}</div>
              <div style={{ fontSize:12, color:C.textSub }}>{ej.pct}%</div>
              <div style={{ fontSize:13, color:C.textDim }}>{ej.kg_plan}</div>

              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <input
                  value={log.kg}
                  onChange={e => upd(ej.id, "kg", e.target.value)}
                  placeholder={String(ej.kg_plan)}
                  style={{
                    width:54, padding:"5px 7px",
                    background:C.surface,
                    border:`1px solid ${kgN ? C.jade + "AA" : C.border}`,
                    borderRadius:7, color:C.white, fontSize:13, fontWeight:700,
                    outline:"none", fontFamily:"'DM Serif Display', serif",
                    transition:"border-color 0.2s",
                  }}
                />
                {diff !== null && (
                  <span style={{ fontSize:9, color:diff >= 0 ? C.jade : C.red, fontFamily:"'DM Sans', sans-serif" }}>
                    {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
                  </span>
                )}
              </div>

              <select
                value={log.rpe}
                onChange={e => upd(ej.id, "rpe", e.target.value)}
                style={{
                  width:52, padding:"5px 4px",
                  background:C.surface, border:`1px solid ${C.border}`,
                  borderRadius:7, color:C.textSub, fontSize:12, outline:"none",
                  fontFamily:"'DM Sans', sans-serif",
                }}
              >
                <option value="">—</option>
                {[6,6.5,7,7.5,8,8.5,9,9.5,10].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          );
        })}
      </Card>

      {/* Nota */}
      <Card style={{ marginBottom:18 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:8, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Nota de sesión</div>
        <textarea
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="¿Cómo te sentiste? ¿Algo a ajustar? ¿Dolor, fatiga, motivación..."
          rows={3}
          style={{
            width:"100%", background:C.surface,
            border:`1px solid ${C.border}`, borderRadius:9,
            color:C.text, fontSize:13, padding:"10px 13px",
            resize:"vertical", outline:"none", boxSizing:"border-box",
            fontFamily:"'DM Sans', sans-serif", lineHeight:1.6,
          }}
        />
      </Card>

      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <button onClick={guardar} style={{
          padding:"12px 30px", borderRadius:10, border:"none",
          background: saved ? C.jade : `linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
          color:C.deep, fontWeight:700, fontSize:14,
          cursor:"pointer", transition:"all 0.3s",
          fontFamily:"'DM Sans', sans-serif",
          boxShadow: saved ? "none" : `0 4px 20px ${C.jade}44`,
        }}>
          {saved ? "✓ Guardado" : "Guardar sesión"}
        </button>
        <div style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>
          {done}/{SESION_HOY.length} ejercicios completados
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: DASHBOARD
// ─────────────────────────────────────────
function Dashboard() {
  const maxTon = Math.max(...HISTORICO.map(s => s.tonelaje));
  return (
    <div style={{ padding:"28px 32px", maxWidth:980 }}>
      <SectionHeader title={`Dashboard — ${ATLETA.nombre}`} sub="Vista general de rendimiento y estado actual" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        <Stat label="1RM Sentadilla" value={ATLETA.rm_squat} unit="kg" color={C.jade} />
        <Stat label="1RM Press"      value={ATLETA.rm_press} unit="kg" color={C.blue} />
        <Stat label="1RM Peso muerto" value={ATLETA.rm_deadlift} unit="kg" color={C.violet} />
        <Stat label="Adherencia" value={`${ATLETA.adherencia}%`} color={ATLETA.adherencia >= 80 ? C.jade : C.amber} unit="últimas 4 sem." />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>

        {/* Tonelaje */}
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:16, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Tonelaje semanal</div>
          {HISTORICO.map((s, i) => (
            <div key={s.semana} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>Semana {s.semana}</span>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text, fontFamily:"'DM Serif Display', serif" }}>
                    {s.tonelaje.toLocaleString("es")} kg
                  </span>
                  <span style={{ fontSize:11, color: s.rpe >= 8 ? C.amber : C.jade, fontFamily:"'DM Sans', sans-serif" }}>RPE {s.rpe}</span>
                </div>
              </div>
              <Bar value={s.tonelaje} max={maxTon * 1.15} color={i === HISTORICO.length - 1 ? C.jade : C.blue + "AA"} h={6} />
            </div>
          ))}
          <div style={{ marginTop:14, padding:"9px 13px", background:C.jade + "0E", border:`1px solid ${C.jade}28`, borderRadius:9 }}>
            <span style={{ fontSize:11, color:C.jade, fontFamily:"'DM Sans', sans-serif" }}>
              ↑ +17.2% de tonelaje desde semana 1 — progresión adecuada para el bloque
            </span>
          </div>
        </Card>

        {/* Biomarcadores */}
        <Card>
          <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:14, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Biomarcadores · hoy</div>
          {[
            { l:"Peso",         v:`${BIO.peso} kg`,           c:C.text },
            { l:"HRV",          v:`${BIO.hrv} ms`,            c:C.jade },
            { l:"FC reposo",    v:`${BIO.fc} bpm`,            c:C.blue },
            { l:"Calidad sueño",v:`${BIO.sueno}/10`,          c:BIO.sueno >= 7 ? C.jade : C.amber },
            { l:"DOMS",         v:`${BIO.doms}/10`,           c:BIO.doms >= 6 ? C.red : BIO.doms >= 4 ? C.amber : C.jade },
            { l:"Estrés",       v:`${BIO.estres}/10`,         c:BIO.estres >= 7 ? C.red : C.jade },
            { l:"Motivación",   v:`${BIO.motivacion}/10`,     c:C.jade },
          ].map(b => (
            <div key={b.l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{b.l}</span>
              <span style={{ fontSize:13, fontWeight:700, color:b.c, fontFamily:"'DM Serif Display', serif" }}>{b.v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Progresión del ciclo */}
      <Card glow>
        <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:14, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>
          Ciclo actual — {ATLETA.ciclo}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {Array.from({ length: ATLETA.semanas_total }, (_, i) => {
            const s = i + 1;
            const past = s < ATLETA.semana;
            const curr = s === ATLETA.semana;
            return (
              <div key={s} style={{
                width:52, height:52, borderRadius:10,
                background: past ? C.jade + "1A" : curr ? C.jade + "28" : C.surface,
                border:`1.5px solid ${past ? C.jade + "60" : curr ? C.jade : C.border}`,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s",
              }}>
                <div style={{ fontSize:8, color:past ? C.jade : curr ? C.jade : C.textDim, textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Sem</div>
                <div style={{ fontSize:18, fontWeight:400, color:past ? C.jade : curr ? C.white : C.textDim, fontFamily:"'DM Serif Display', serif" }}>{s}</div>
                <div style={{ fontSize:9 }}>{past ? "✓" : curr ? "›" : ""}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:12, fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>
          Semana {ATLETA.semana} de {ATLETA.semanas_total} · 75–85% 1RM · RIR 2–3 · 3 sesiones/semana
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: BIOMARCADORES
// ─────────────────────────────────────────
function Biomarcadores() {
  const [form, setForm] = useState({ ...BIO });
  const [saved, setSaved] = useState(false);

  const readiness = Math.round(
    (form.sueno / 10 * 25) + (form.motivacion / 10 * 25) +
    ((10 - form.estres) / 10 * 25) + ((10 - form.doms) / 10 * 25)
  );
  const rColor = readiness >= 75 ? C.jade : readiness >= 50 ? C.amber : C.red;
  const rLabel = readiness >= 75 ? "Óptimo" : readiness >= 50 ? "Moderado" : "Precaución";

  const campos = [
    { k:"peso",  l:"Peso",         u:"kg",  type:"num", step:0.1, min:40, max:200 },
    { k:"hrv",   l:"HRV",          u:"ms",  type:"num", step:1,   min:0,  max:200 },
    { k:"fc",    l:"FC en reposo", u:"bpm", type:"num", step:1,   min:30, max:120 },
    { k:"sueno", l:"Calidad sueño",u:"/10", type:"rng", min:1,    max:10, pos:true },
    { k:"doms",  l:"DOMS",         u:"/10", type:"rng", min:0,    max:10, pos:false },
    { k:"estres",l:"Estrés",       u:"/10", type:"rng", min:0,    max:10, pos:false },
    { k:"motivacion",l:"Motivación",u:"/10",type:"rng", min:1,    max:10, pos:true },
  ];

  const getColor = (c, v) => {
    if (c.pos === true)  return v >= 7 ? C.jade : v >= 5 ? C.amber : C.red;
    if (c.pos === false) return v >= 7 ? C.red  : v >= 4 ? C.amber : C.jade;
    return C.text;
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:760 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <SectionHeader title="Biomarcadores" sub={new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" })} />
        <div style={{
          textAlign:"center", padding:"14px 22px",
          background: rColor + "14", border:`1px solid ${rColor}44`,
          borderRadius:14, marginLeft:16, flexShrink:0,
          boxShadow: readiness >= 75 ? `0 0 20px ${C.jade}22` : "none",
        }}>
          <div style={{ fontSize:38, fontWeight:400, color:rColor, fontFamily:"'DM Serif Display', serif", lineHeight:1 }}>{readiness}</div>
          <div style={{ fontSize:9, fontWeight:700, color:rColor, letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>readiness</div>
          <div style={{ fontSize:10, color:rColor, marginTop:2, fontFamily:"'DM Sans', sans-serif" }}>{rLabel}</div>
        </div>
      </div>

      <div style={{ display:"grid", gap:12 }}>
        {campos.map(c => (
          <Card key={c.k}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:"'DM Sans', sans-serif" }}>{c.l}</div>
                <div style={{ fontSize:11, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>{c.u}</div>
              </div>
              {c.type === "rng" ? (
                <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, maxWidth:380, justifyContent:"flex-end" }}>
                  <span style={{ fontSize:26, fontWeight:400, color:getColor(c, form[c.k]), fontFamily:"'DM Serif Display', serif", minWidth:28, textAlign:"right" }}>
                    {form[c.k]}
                  </span>
                  <input type="range" min={c.min} max={c.max} value={form[c.k]}
                    onChange={e => setForm({ ...form, [c.k]: Number(e.target.value) })}
                    style={{ width:160, accentColor: getColor(c, form[c.k]) }} />
                  <div style={{ width:80 }}>
                    <Bar value={form[c.k]} max={c.max} color={getColor(c, form[c.k])} h={4} />
                  </div>
                </div>
              ) : (
                <input type="number" step={c.step} min={c.min} max={c.max}
                  value={form[c.k]}
                  onChange={e => setForm({ ...form, [c.k]: Number(e.target.value) })}
                  style={{
                    width:96, padding:"8px 12px", background:C.surface,
                    border:`1px solid ${C.border}`, borderRadius:9,
                    color:C.white, fontSize:16, fontWeight:400, outline:"none",
                    textAlign:"center", fontFamily:"'DM Serif Display', serif",
                  }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} style={{
        marginTop:20, padding:"12px 28px", borderRadius:10, border:"none",
        background: saved ? C.jade : `linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
        color:C.deep, fontWeight:700, fontSize:14,
        cursor:"pointer", transition:"all 0.3s",
        fontFamily:"'DM Sans', sans-serif",
        boxShadow: saved ? "none" : `0 4px 20px ${C.jade}44`,
      }}>
        {saved ? "✓ Registrado" : "Guardar biomarcadores"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: CICLOS
// ─────────────────────────────────────────
function Ciclos() {
  const [sel, setSel] = useState("fza_pot");
  const c = CICLOS.find(x => x.key === sel);

  return (
    <div style={{ padding:"28px 32px", maxWidth:960 }}>
      <SectionHeader title="Ciclos de entrenamiento" sub="Periodización por bloques. Cada ciclo tiene objetivos fisiológicos distintos." />

      {/* Pills */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:24 }}>
        {CICLOS.map((ci, i) => (
          <button key={ci.key} onClick={() => setSel(ci.key)} style={{
            padding:"7px 16px", borderRadius:99,
            border:`1.5px solid ${sel === ci.key ? ci.color : ci.color + "44"}`,
            background: sel === ci.key ? ci.color + "1E" : "transparent",
            color: sel === ci.key ? ci.color : ci.color + "88",
            fontSize:11, fontWeight:700, cursor:"pointer",
            letterSpacing:"0.04em", textTransform:"uppercase",
            fontFamily:"'DM Sans', sans-serif",
            transition:"all 0.2s",
          }}>{ci.label}</button>
        ))}
      </div>

      {/* Detalle */}
      {c && (
        <Card style={{ marginBottom:24, borderColor: c.color + "44", boxShadow:`0 0 28px ${c.color}12` }}>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:220 }}>
              <Tag color={c.color}>{c.label}</Tag>
              <h2 style={{ fontFamily:"'DM Serif Display', serif", fontSize:24, fontWeight:400, color:C.white, margin:"12px 0 8px" }}>{c.label}</h2>
              <p style={{ fontSize:13, color:C.textSub, lineHeight:1.7, fontFamily:"'DM Sans', sans-serif" }}>{c.desc}</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              <Stat label="Duración" value={c.sem} unit="semanas" color={c.color} />
              <Stat label="Intensidad" value={c.pct} unit="% 1RM" color={c.color} />
              <Stat label="Reps" value={c.reps} unit="por serie" color={c.color} />
            </div>
          </div>
        </Card>
      )}

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {CICLOS.map((ci, i) => (
          <Card key={ci.key} onClick={() => setSel(ci.key)} style={{ borderColor: sel === ci.key ? ci.color + "66" : C.border }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:ci.color, marginTop:4 }} />
              {ci.key === "fza_pot" && <Tag color={C.jade} small>Actual</Tag>}
            </div>
            <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:17, color:C.white, marginBottom:6 }}>{ci.label}</div>
            <div style={{ fontSize:11, color:C.textSub, marginBottom:10, lineHeight:1.5, fontFamily:"'DM Sans', sans-serif" }}>{ci.desc.split(".")[0]}.</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:10, color:ci.color, fontFamily:"'DM Sans', sans-serif" }}>{ci.pct}%</span>
              <span style={{ fontSize:10, color:C.textDim }}>·</span>
              <span style={{ fontSize:10, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{ci.reps} reps</span>
              <span style={{ fontSize:10, color:C.textDim }}>·</span>
              <span style={{ fontSize:10, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{ci.sem} sem.</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: NOA COACH IA
// ─────────────────────────────────────────
function NOACoach() {
  const [msgs, setMsgs] = useState([
    { rol:"noa", texto:"Hola, soy NOA Coach. Estoy entrenado con el contexto de tu planificación, ciclos y biomarcadores. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const quick = [
    "¿Cuánto tonelaje esta semana?",
    "¿Puedo aumentar la carga?",
    "¿Qué es el RIR?",
    "Explicame el ciclo neural",
    "¿Mi HRV es bueno?",
  ];

  const send = async (txt = input) => {
    if (!txt.trim() || loading) return;
    setMsgs(p => [...p, { rol:"user", texto:txt }]);
    setInput("");
    setLoading(true);
    const r = await consultarNOACoach(txt, { atleta: ATLETA, bio: BIO });
    setMsgs(p => [...p, { rol:"noa", texto:r }]);
    setLoading(false);
    setTimeout(() => ref.current?.scrollIntoView({ behavior:"smooth" }), 80);
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:720, display:"flex", flexDirection:"column", height:"calc(100vh - 56px)" }}>
      <SectionHeader title="NOA Coach" sub="Powered by Groq · LLaMA 3 70B · contexto de tu entrenamiento inyectado" />

      {/* Quick */}
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
        {quick.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            padding:"5px 12px", borderRadius:99,
            border:`1px solid ${C.border}`,
            background:"transparent", color:C.textSub,
            fontSize:11, cursor:"pointer", fontFamily:"'DM Sans', sans-serif",
            transition:"all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.jade + "88"; e.currentTarget.style.color = C.jade; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; }}
          >{q}</button>
        ))}
      </div>

      {/* Chat */}
      <div style={{
        flex:1, overflowY:"auto", background:C.deep,
        border:`1px solid ${C.border}`, borderRadius:14,
        padding:16, marginBottom:14,
        display:"flex", flexDirection:"column", gap:14,
      }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.rol === "user" ? "flex-end" : "flex-start", gap:8, alignItems:"flex-start" }}>
            {m.rol === "noa" && (
              <div style={{
                width:30, height:30, borderRadius:8, flexShrink:0,
                background:`linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:C.deep,
                fontFamily:"'DM Serif Display', serif",
                boxShadow:`0 0 10px ${C.jade}44`,
              }}>N</div>
            )}
            <div style={{
              maxWidth:"78%",
              background: m.rol === "user" ? C.jade + "18" : C.card,
              border:`1px solid ${m.rol === "user" ? C.jade + "44" : C.border}`,
              borderRadius: m.rol === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              padding:"10px 14px",
              fontSize:13, color:C.text, lineHeight:1.65,
              whiteSpace:"pre-wrap", fontFamily:"'DM Sans', sans-serif",
            }}>{m.texto}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{
              width:30, height:30, borderRadius:8, background:`linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:C.deep, fontFamily:"'DM Serif Display', serif",
            }}>N</div>
            <div style={{ color:C.textSub, fontSize:13, fontFamily:"'DM Sans', sans-serif" }}>NOA está pensando…</div>
          </div>
        )}
        <div ref={ref} />
      </div>

      {/* Input */}
      <div style={{ display:"flex", gap:8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Preguntale a NOA Coach..."
          style={{
            flex:1, padding:"12px 16px", background:C.card,
            border:`1px solid ${C.borderHi}`, borderRadius:10,
            color:C.text, fontSize:13, outline:"none",
            fontFamily:"'DM Sans', sans-serif",
          }}
        />
        <button onClick={() => send()} style={{
          padding:"12px 18px", borderRadius:10, border:"none",
          background:`linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
          color:C.deep, fontWeight:700, fontSize:15,
          cursor:"pointer", boxShadow:`0 4px 16px ${C.jade}44`,
          transition:"all 0.2s",
        }}>↑</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: PLANIFICAR CICLO (coach)
// ─────────────────────────────────────────
function CoachPlanificar() {
  const [tipo, setTipo] = useState("fza_pot");
  const [semanas, setSemanas] = useState(6);
  const [sesiones, setSesiones] = useState(3);
  const [perfil, setPerfil] = useState("Híbrido");
  const c = CICLOS.find(x => x.key === tipo);

  return (
    <div style={{ padding:"28px 32px", maxWidth:920 }}>
      <SectionHeader title="Planificar ciclo" sub="Diseñá el bloque de entrenamiento para tu atleta." />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:12, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Tipo de ciclo</div>
            {CICLOS.map(ci => (
              <button key={ci.key} onClick={() => setTipo(ci.key)} style={{
                display:"flex", alignItems:"center", gap:10,
                width:"100%", padding:"8px 10px", marginBottom:4,
                background: tipo === ci.key ? ci.color + "14" : "transparent",
                border:`1px solid ${tipo === ci.key ? ci.color + "55" : "transparent"}`,
                borderRadius:8, cursor:"pointer",
                color: tipo === ci.key ? ci.color : C.textSub,
                fontSize:12, fontWeight: tipo === ci.key ? 700 : 400,
                textAlign:"left", fontFamily:"'DM Sans', sans-serif",
                transition:"all 0.15s",
              }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:ci.color, flexShrink:0 }} />
                {ci.label}
                <span style={{ marginLeft:"auto", fontSize:10, color:C.textDim }}>{ci.pct}%</span>
              </button>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:10, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Perfil del atleta</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {PERFILES.map(p => (
                <button key={p} onClick={() => setPerfil(p)} style={{
                  padding:"5px 12px", borderRadius:99,
                  border:`1px solid ${perfil === p ? C.jade + "88" : C.border}`,
                  background: perfil === p ? C.jade + "14" : "transparent",
                  color: perfil === p ? C.jade : C.textSub,
                  fontSize:11, cursor:"pointer", fontFamily:"'DM Sans', sans-serif",
                  fontWeight: perfil === p ? 700 : 400,
                  transition:"all 0.15s",
                }}>{p}</button>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:14, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>Configuración</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>
                  Semanas: <strong style={{ color:C.text, fontFamily:"'DM Serif Display', serif" }}>{semanas}</strong>
                </span>
                <input type="range" min={2} max={12} value={semanas} onChange={e => setSemanas(Number(e.target.value))} style={{ accentColor:c?.color || C.jade, width:120 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>
                  Sesiones/sem: <strong style={{ color:C.text, fontFamily:"'DM Serif Display', serif" }}>{sesiones}</strong>
                </span>
                <input type="range" min={2} max={5} value={sesiones} onChange={e => setSesiones(Number(e.target.value))} style={{ accentColor:c?.color || C.jade, width:120 }} />
              </div>
            </div>
            {c && (
              <div style={{ padding:"10px 13px", background: c.color + "0E", border:`1px solid ${c.color}30`, borderRadius:9 }}>
                <div style={{ fontSize:11, fontWeight:700, color:c.color, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>{c.label}</div>
                <div style={{ fontSize:11, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{c.desc}</div>
                <div style={{ marginTop:8, display:"flex", gap:10 }}>
                  <span style={{ fontSize:11, color:c.color }}>{c.pct}% 1RM</span>
                  <span style={{ fontSize:11, color:C.textSub }}>{c.reps} reps</span>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSub, marginBottom:12, letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans', sans-serif" }}>
              Progresión — {semanas} semanas
            </div>
            {Array.from({ length: semanas }, (_, i) => {
              const pct = Math.round(Math.min(100, 68 + (i / Math.max(semanas - 1, 1)) * 27));
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:7 }}>
                  <span style={{ fontSize:10, color:C.textSub, minWidth:50, fontFamily:"'DM Sans', sans-serif" }}>Sem {i + 1}</span>
                  <Bar value={pct} max={100} color={c?.color || C.jade} h={5} />
                  <span style={{ fontSize:10, color:C.textSub, minWidth:32, fontFamily:"'DM Sans', sans-serif" }}>{pct}%</span>
                  <span style={{ fontSize:10, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>{sesiones}s</span>
                </div>
              );
            })}
            <button style={{
              marginTop:14, width:"100%", padding:"11px",
              borderRadius:9, border:"none",
              background:`linear-gradient(135deg, ${C.jade3}, ${C.jade})`,
              color:C.deep, fontWeight:700, fontSize:12, cursor:"pointer",
              fontFamily:"'DM Sans', sans-serif", letterSpacing:"0.04em",
              boxShadow:`0 4px 16px ${C.jade}44`,
            }}>
              Crear ciclo en Supabase →
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: EJERCICIOS
// ─────────────────────────────────────────
function CoachEjercicios() {
  const [q, setQ] = useState("");
  const [perfil, setPerfil] = useState("todos");

  const items = EJERCICIOS_DB.filter(e =>
    (q === "" || e.nombre.toLowerCase().includes(q.toLowerCase()) || e.patron.toLowerCase().includes(q.toLowerCase())) &&
    (perfil === "todos" || e.perfil.includes(perfil))
  );

  const nivelColor = { avanzado: C.red, intermedio: C.amber, basico: C.jade };
  const tipoColor  = { principal: C.blue, accesorio: C.violet, cardio: C.amber, movilidad: C.jade };

  return (
    <div style={{ padding:"28px 32px", maxWidth:920 }}>
      <SectionHeader title="Banco de ejercicios" sub="Catálogo expandible en Supabase · clasificado por perfil y patrón de movimiento" />

      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar ejercicio o patrón..." style={{
          flex:1, minWidth:200, padding:"9px 13px", background:C.card,
          border:`1px solid ${C.border}`, borderRadius:9, color:C.text,
          fontSize:13, outline:"none", fontFamily:"'DM Sans', sans-serif",
        }} />
        <select value={perfil} onChange={e => setPerfil(e.target.value)} style={{
          padding:"9px 13px", background:C.card,
          border:`1px solid ${C.border}`, borderRadius:9,
          color:C.textSub, fontSize:12, outline:"none", fontFamily:"'DM Sans', sans-serif",
        }}>
          <option value="todos">Todos los perfiles</option>
          {["fitness","hibrido","cross","conj","individual","resistencia","musculacion"].map(p =>
            <option key={p} value={p}>{p}</option>
          )}
        </select>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 110px 120px 90px 90px",
          padding:"9px 18px", fontSize:10, fontWeight:700, color:C.textDim,
          letterSpacing:"0.08em", textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`, fontFamily:"'DM Sans', sans-serif",
        }}>
          <div>Ejercicio</div><div>Patrón</div><div>Grupo</div><div>Nivel</div><div>Tipo</div>
        </div>
        {items.map((e, i) => (
          <div key={e.id} style={{
            display:"grid", gridTemplateColumns:"1fr 110px 120px 90px 90px",
            padding:"11px 18px", alignItems:"center",
            borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none",
            transition:"background 0.15s",
          }}
          onMouseEnter={ev => ev.currentTarget.style.background = C.surface}
          onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}
          >
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, fontFamily:"'DM Sans', sans-serif" }}>{e.nombre}</div>
              <div style={{ fontSize:10, color:C.textDim, marginTop:1 }}>{e.perfil.join(", ")}</div>
            </div>
            <div style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{e.patron}</div>
            <div style={{ fontSize:12, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{e.grupo}</div>
            <Tag color={nivelColor[e.nivel] || C.jade} small>{e.nivel}</Tag>
            <Tag color={tipoColor[e.tipo] || C.jade} small>{e.tipo}</Tag>
          </div>
        ))}
      </Card>
      <div style={{ marginTop:12, fontSize:11, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>
        {items.length} ejercicios · más en Supabase
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: HISTORIAL
// ─────────────────────────────────────────
function Historial() {
  return (
    <div style={{ padding:"28px 32px", maxWidth:820 }}>
      <SectionHeader title="Historial" sub="Registro completo de sesiones · tonelaje y RPE por semana" />
      {HISTORICO.map(s => (
        <Card key={s.semana} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:17, color:C.white }}>Semana {s.semana}</div>
              <div style={{ fontSize:11, color:C.textSub, marginTop:2, fontFamily:"'DM Sans', sans-serif" }}>{s.sesiones} sesiones · {ATLETA.ciclo}</div>
            </div>
            <div style={{ display:"flex", gap:20, alignItems:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:22, color:C.jade }}>{s.tonelaje.toLocaleString("es")}</div>
                <div style={{ fontSize:10, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>kg tonelaje</div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:22, color: s.rpe >= 8 ? C.amber : C.jade }}>{s.rpe}</div>
                <div style={{ fontSize:10, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>RPE prom.</div>
              </div>
              <Tag color={s.sesiones >= 3 ? C.jade : C.amber}>{Math.round(s.sesiones / 3 * 100)}%</Tag>
            </div>
          </div>
        </Card>
      ))}
      <div style={{ padding:"16px 20px", background:C.surface, border:`1px dashed ${C.border}`, borderRadius:12, textAlign:"center" }}>
        <span style={{ fontSize:12, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>
          Historial completo disponible al conectar Supabase
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// VISTA: MARCAS
// ─────────────────────────────────────────
function Marcas() {
  const datos = [
    { ej:"Sentadilla trasera",  real:140, est:147, fecha:"2025-04-15" },
    { ej:"Peso muerto",         real:180, est:188, fecha:"2025-04-10" },
    { ej:"Press banca",         real:90,  est:96,  fecha:"2025-04-12" },
    { ej:"Press militar",       real:70,  est:74,  fecha:"2025-04-08" },
    { ej:"Remo con barra",      real:null,est:105, fecha:"2025-04-01" },
  ];
  return (
    <div style={{ padding:"28px 32px", maxWidth:820 }}>
      <SectionHeader title="Marcas personales" sub="1RM real y estimado — Epley: kg × (1 + reps / 30)" />
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 130px 130px 110px",
          padding:"9px 18px", fontSize:10, fontWeight:700, color:C.textDim,
          letterSpacing:"0.08em", textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`, fontFamily:"'DM Sans', sans-serif",
        }}>
          <div>Ejercicio</div><div>1RM Real</div><div>1RM Estimado</div><div>Fecha</div>
        </div>
        {datos.map((m, i) => (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"1fr 130px 130px 110px",
            padding:"13px 18px", alignItems:"center",
            borderBottom: i < datos.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, color:C.text }}>{m.ej}</div>
            <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:22, color: m.real ? C.jade : C.textDim }}>
              {m.real ? `${m.real} kg` : "—"}
            </div>
            <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:22, color:C.blue }}>~{m.est} kg</div>
            <div style={{ fontSize:11, color:C.textSub, fontFamily:"'DM Sans', sans-serif" }}>{m.fecha}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────
// APP RAÍZ
// ─────────────────────────────────────────
export default function NOAApp() {
  const [sec, setSec] = useState("hoy");
  const [rol, setRol] = useState("atleta");

  useEffect(() => {
    const atleta = ["hoy","dashboard","historial","biomarcadores","ciclos","marcas","noa_coach"];
    const coach  = ["c_atletas","c_planificar","c_ejercicios","c_reportes"];
    if (rol === "atleta" && !atleta.includes(sec)) setSec("hoy");
    if (rol === "coach"  && !coach.includes(sec))  setSec("c_planificar");
  }, [rol]);

  const content = {
    hoy:           <SesionHoy />,
    dashboard:     <Dashboard />,
    historial:     <Historial />,
    biomarcadores: <Biomarcadores />,
    ciclos:        <Ciclos />,
    marcas:        <Marcas />,
    noa_coach:     <NOACoach />,
    c_planificar:  <CoachPlanificar />,
    c_ejercicios:  <CoachEjercicios />,
    c_atletas: (
      <div style={{ padding:"28px 32px" }}>
        <SectionHeader title="Mis atletas" sub="Panel multi-atleta · conectá Supabase para la lista real" />
        {["Leo Baena","Nati P.","Rodrigo F."].map(n => (
          <Card key={n} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:C.jade+"22", border:`1px solid ${C.jade}44`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Serif Display', serif", color:C.jade, fontSize:14 }}>{n[0]}</div>
                <div>
                  <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, color:C.text }}>{n}</div>
                  <div style={{ fontSize:11, color:C.textSub }}>Híbrido · Fuerza Potencia</div>
                </div>
              </div>
              <Tag color={C.jade}>Activo</Tag>
            </div>
          </Card>
        ))}
      </div>
    ),
    c_reportes: (
      <div style={{ padding:"28px 32px" }}>
        <SectionHeader title="Reportes" sub="Análisis comparativo por atleta · próximamente con ML" />
        <Card style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontFamily:"'DM Serif Display', serif", fontSize:22, color:C.textSub, marginBottom:8 }}>Próximamente</div>
          <div style={{ fontSize:13, color:C.textDim, fontFamily:"'DM Sans', sans-serif" }}>
            Los reportes de ML estarán disponibles cuando haya suficiente historial en Supabase
          </div>
        </Card>
      </div>
    ),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderHi}; }
        input[type=range] { height: 4px; cursor: pointer; border-radius: 2px; }
        input::placeholder { color: ${C.textDim}; }
        textarea::placeholder { color: ${C.textDim}; }
        select option { background: ${C.card}; color: ${C.text}; }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", background:C.bg }}>
        <Sidebar sec={sec} setSec={setSec} rol={rol} setRol={setRol} />
        <main style={{ flex:1, overflowY:"auto", minHeight:"100vh" }}>
          {content[sec] ?? null}
        </main>
      </div>
    </>
  );
}
