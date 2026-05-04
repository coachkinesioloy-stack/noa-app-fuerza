// lib/groq.js
// NOA Coach — integración con Groq (LLaMA 3 70B)

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama3-70b-8192'

// Prompt de sistema de NOA Coach
function buildSystemPrompt(contexto) {
  return `Sos NOA Coach, el asistente de entrenamiento de fuerza de la plataforma NOA (Never Over, Always).
Sos experto en periodización, biomecánica, fisiología del ejercicio y planificación del rendimiento deportivo.

CONTEXTO DEL ATLETA:
${JSON.stringify(contexto, null, 2)}

INSTRUCCIONES:
- Respondé siempre en español rioplatense (Argentina)
- Sé conciso y técnico — máximo 3 párrafos
- Usá datos concretos del contexto cuando respondas (ciclo actual, semana, RPE, tonelaje, HRV)
- Si te preguntan sobre carga, calculá en base al 1RM del atleta
- Si te preguntan sobre recuperación, considerá los biomarcadores actuales
- No inventes datos que no estén en el contexto
- Sos directo, motivador pero honesto

ÁREAS DE EXPERTISE:
- Ciclos: adaptación, hipertrofia, fza resistencia, fza potencia, submáxima, neural
- Tonelaje semanal y progresión de carga
- RPE, RIR, % del 1RM
- Biomarcadores: HRV, sueño, DOMS, readiness
- Periodización lineal, ondulada, en bloque
- Fórmulas: 1RM Epley (kg × (1 + reps/30))
`
}

export async function consultarNOACoach(pregunta, contexto = {}) {
  const key = process.env.NEXT_PUBLIC_GROQ_KEY

  // Modo demo si no hay API key
  if (!key || key === 'gsk_...') {
    return getDemoResponse(pregunta, contexto)
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(contexto) },
          { role: 'user',   content: pregunta }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      })
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Groq error:', err)
      return `Error al conectar con NOA Coach (${res.status}). Verificá tu API key de Groq.`
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || 'Sin respuesta del servidor.'

  } catch (err) {
    console.error('NOA Coach fetch error:', err)
    return 'Error de conexión con NOA Coach. Revisá tu conexión a internet.'
  }
}

// Respuestas demo cuando no hay API key configurada
function getDemoResponse(pregunta, ctx) {
  const p = pregunta.toLowerCase()
  const atleta = ctx.atleta || {}
  const bio = ctx.bio || {}

  if (p.includes('tonelaje')) {
    return `**Tonelaje esta semana:**\n\nCon un bloque de ${atleta.ciclo || 'Fuerza Potencia'} en semana ${atleta.semana || 3}, el tonelaje objetivo está en el rango de 9.000–10.500 kg para tu volumen actual.\n\nTu progresión viene subiendo ~17% desde la semana 1, lo cual es adecuado. No superes el +10% semanal para evitar overreaching.\n\n💡 *Conectá tu API key de Groq para respuestas personalizadas en tiempo real.*`
  }
  if (p.includes('carga') || p.includes('aumentar')) {
    return `**¿Aumentar la carga?**\n\nCon RPE promedio de 7.9 y adherencia del ${atleta.adherencia || 87}%, estás respondiendo bien al estímulo. El HRV de ${bio.hrv || 68}ms es buen indicador de recuperación.\n\nPodés aumentar 2.5kg en los ejercicios principales si en las últimas 2 sesiones el RPE fue ≤ 8 con las reps planificadas completas.\n\n💡 *Conectá tu API key de Groq para análisis personalizado.*`
  }
  if (p.includes('rir')) {
    return `**RIR (Repeticiones en Reserva):**\n\nEl RIR es la cantidad de reps que te quedan antes del fallo. RIR 3 = podías hacer 3 más. Es más preciso que el RPE para periodizar porque da info sobre el margen real de esfuerzo.\n\nEn tu bloque actual de Fuerza Potencia el objetivo es RIR 2–3 (RPE 7–8). Si llegás al RIR 0–1 sistemáticamente, la carga está muy alta para este bloque.`
  }
  if (p.includes('neural')) {
    return `**Ciclo Neural / Pico:**\n\nEs el bloque de mayor intensidad (90–100% del 1RM) y menor volumen (1–3 reps). Su objetivo es la activación neural máxima — no hay hipertrofia, la adaptación es puramente neuromuscular.\n\nDura 1–2 semanas y siempre va precedido de un bloque Submáxima. Acá es donde vas a testear o intentar tu nuevo 1RM. La clave es el descanso completo entre series (4–6 min) y ejecutar cada rep con la máxima intención de velocidad.`
  }
  if (p.includes('hrv') || p.includes('recuper')) {
    return `**HRV y recuperación:**\n\nTu HRV de ${bio.hrv || 68}ms con FC reposo de ${bio.fc || 54}bpm son valores sólidos. Calidad de sueño ${bio.sueno || 7}/10 — aceptable pero mejorable.\n\nRegla práctica: si el HRV cae más del 15% respecto a tu baseline o baja de 55ms, reducí la carga un 10–15% o hacé sesión de recuperación activa (30 min baja intensidad). No cancelés el entrenamiento, adaptalo.`
  }

  return `**NOA Coach (modo demo):**\n\nEstás en semana ${atleta.semana || 3} de tu bloque de ${atleta.ciclo || 'Fuerza Potencia'}. Con adherencia del ${atleta.adherencia || 87}% y RPE promedio de 7.9, el estímulo está bien calibrado.\n\nPara hoy al 85%: activá con series al 50% y 70% antes del trabajo principal. Respetá los descansos completos en los ejercicios principales (3–4 min).\n\n💡 *Para respuestas en tiempo real, configurá tu API key de Groq en .env.local*`
}
