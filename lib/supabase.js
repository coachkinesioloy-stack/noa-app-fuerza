// lib/supabase.js
// Cliente de Supabase — usado en toda la app

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('NOA: Supabase no configurado. Usando modo demo.')
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// ─────────────────────────────────────────
// HELPERS DE BASE DE DATOS
// ─────────────────────────────────────────

// PERFIL
export async function getProfile(userId) {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function upsertProfile(profile) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
  return { data, error }
}

// CICLOS
export async function getCiclosAtleta(atletaId) {
  if (!supabase) return []
  const { data } = await supabase
    .from('ciclos')
    .select('*')
    .eq('atleta_id', atletaId)
    .order('fecha_inicio', { ascending: false })
  return data || []
}

export async function createCiclo(ciclo) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('ciclos')
    .insert(ciclo)
    .select()
    .single()
  return { data, error }
}

// SESIONES PLAN
export async function getSesionesPlan(cicloId, semana) {
  if (!supabase) return []
  let query = supabase
    .from('sesiones_plan')
    .select('*, ejercicios(*)')
    .eq('ciclo_id', cicloId)
    .order('orden')
  if (semana) query = query.eq('semana', semana)
  const { data } = await query
  return data || []
}

// LOG DE ENTRENAMIENTO
export async function logSesion(logs) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('logs_entrenamiento')
    .insert(logs)
  return { data, error }
}

export async function getLogsAtleta(atletaId, limit = 50) {
  if (!supabase) return []
  const { data } = await supabase
    .from('logs_entrenamiento')
    .select('*, ejercicios(nombre)')
    .eq('atleta_id', atletaId)
    .order('fecha', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getTonelajeSemanal(atletaId) {
  if (!supabase) return []
  const { data } = await supabase
    .from('logs_entrenamiento')
    .select('semana, tonelaje, rpe')
    .eq('atleta_id', atletaId)
    .order('semana')
  // Agrupar por semana
  const grouped = {}
  data?.forEach(r => {
    if (!grouped[r.semana]) grouped[r.semana] = { semana: r.semana, tonelaje: 0, rpes: [], sesiones: 0 }
    grouped[r.semana].tonelaje += r.tonelaje || 0
    grouped[r.semana].rpes.push(r.rpe || 0)
    grouped[r.semana].sesiones++
  })
  return Object.values(grouped).map(g => ({
    ...g,
    rpe_prom: g.rpes.length ? (g.rpes.reduce((a, b) => a + b, 0) / g.rpes.length).toFixed(1) : 0
  }))
}

// BIOMARCADORES
export async function saveBiomarcadores(bio) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('biomarcadores')
    .upsert(bio, { onConflict: 'atleta_id,fecha' })
  return { data, error }
}

export async function getBiomarcadoresHoy(atletaId) {
  if (!supabase) return null
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('biomarcadores')
    .select('*')
    .eq('atleta_id', atletaId)
    .eq('fecha', today)
    .single()
  return data
}

export async function getHistorialBiomarcadores(atletaId, dias = 30) {
  if (!supabase) return []
  const desde = new Date()
  desde.setDate(desde.getDate() - dias)
  const { data } = await supabase
    .from('biomarcadores')
    .select('*')
    .eq('atleta_id', atletaId)
    .gte('fecha', desde.toISOString().split('T')[0])
    .order('fecha')
  return data || []
}

// MARCAS
export async function getMarcas(atletaId) {
  if (!supabase) return []
  const { data } = await supabase
    .from('marcas')
    .select('*, ejercicios(nombre)')
    .eq('atleta_id', atletaId)
    .order('fecha', { ascending: false })
  return data || []
}

export async function saveMarca(marca) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('marcas')
    .upsert(marca)
  return { data, error }
}

// EJERCICIOS
export async function getEjercicios(filtros = {}) {
  if (!supabase) return []
  let query = supabase.from('ejercicios').select('*')
  if (filtros.perfil) query = query.contains('perfil', [filtros.perfil])
  if (filtros.tipo)   query = query.eq('tipo', filtros.tipo)
  if (filtros.nivel)  query = query.eq('nivel', filtros.nivel)
  const { data } = await query.order('nombre')
  return data || []
}

// ATLETAS DEL COACH
export async function getMisAtletas(coachId) {
  if (!supabase) return []
  const { data } = await supabase
    .from('ciclos')
    .select('atleta_id, profiles!ciclos_atleta_id_fkey(id, nombre, perfil_deporte, peso_actual)')
    .eq('coach_id', coachId)
  const unicos = {}
  data?.forEach(r => { if (r.profiles) unicos[r.atleta_id] = r.profiles })
  return Object.values(unicos)
}

// UTILIDAD: estimar 1RM (Epley)
export function calcular1RM(kg, reps) {
  if (reps === 1) return kg
  return Math.round(kg * (1 + reps / 30))
}

// UTILIDAD: calcular carga para % del 1RM
export function calcularCarga(rm1, pct) {
  return Math.round(rm1 * pct / 100 / 2.5) * 2.5 // redondear a 2.5kg
}

// UTILIDAD: readiness score desde biomarcadores
export function calcularReadiness(bio) {
  if (!bio) return 50
  return Math.round(
    (bio.calidad_sueno / 10 * 25) +
    (bio.motivacion / 10 * 25) +
    ((10 - bio.estres) / 10 * 25) +
    ((10 - bio.dolor_muscular) / 10 * 25)
  )
}
