# NOA — Never Over, Always ✦
### Plataforma de entrenamiento de fuerza inteligente

---

## Stack
- **Next.js 14** (React) — frontend + API
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **Groq** — IA con LLaMA 3 70B (gratis)
- **Vercel** — deploy, no se cae nunca

---

## Deploy paso a paso

### 1. Supabase (base de datos)

1. Ir a [supabase.com](https://supabase.com) → **New project**
2. Elegí un nombre (ej: `noa-training`) y una contraseña fuerte
3. Región: **South America (São Paulo)** para menor latencia desde Argentina
4. Una vez creado: ir a **SQL Editor** → pegar todo el contenido de `supabase_schema.sql` → **Run**
5. Ir a **Settings → API** y copiar:
   - `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Groq (Coach IA — gratis)

1. Ir a [console.groq.com](https://console.groq.com)
2. Sign up (gratis, sin tarjeta)
3. **API Keys → Create API key** → copiar la key
4. Va en `NEXT_PUBLIC_GROQ_KEY`

### 3. GitHub

```bash
git init
git add .
git commit -m "NOA v1.0 — Never Over, Always"
git remote add origin https://github.com/TU_USUARIO/noa-training.git
git push -u origin main
```

### 4. Vercel (deploy)

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar el repo de GitHub
3. En **Environment Variables** agregar las 3 variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
   NEXT_PUBLIC_GROQ_KEY          = gsk_...
   ```
4. **Deploy** → en ~1 minuto tenés la URL de producción

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear el archivo de variables de entorno
cp .env.local.example .env.local
# → Editar .env.local con tus keys reales

# Correr en modo desarrollo
npm run dev
# → Abrir http://localhost:3000
```

---

## Estructura del proyecto

```
noa-app/
├── app/
│   ├── layout.jsx          # Layout raíz + fonts
│   └── page.jsx            # Entry point
├── components/
│   └── NOAApp.jsx          # App completa (UI)
├── lib/
│   ├── supabase.js         # Cliente + helpers de BD
│   └── groq.js             # NOA Coach IA
├── public/
│   └── manifest.json       # PWA
├── supabase_schema.sql     # Schema completo
├── .env.local.example      # Template de variables
└── README.md
```

---

## Base de datos (tablas)

| Tabla | Descripción |
|---|---|
| `profiles` | Usuarios (atleta/coach) |
| `ejercicios` | Catálogo maestro de ejercicios |
| `ciclos` | Bloques de periodización |
| `sesiones_plan` | Plantilla del coach por semana |
| `logs_entrenamiento` | Registro real de cada serie |
| `biomarcadores` | HRV, sueño, peso, DOMS, estrés |
| `marcas` | 1RM real y estimado por ejercicio |

---

## Roadmap ML (próximas versiones)

- [ ] **v1.1** — Auth real con Supabase (login/signup)
- [ ] **v1.2** — Carga dinámica desde Supabase (reemplaza datos demo)
- [ ] **v1.3** — Gráficos de progresión (HRV, tonelaje, 1RM)
- [ ] **v2.0** — Modelo de recomendación de carga (regresión sobre logs)
- [ ] **v2.1** — Detección de fatiga acumulada (HRV + DOMS + RPE)
- [ ] **v2.2** — Sugerencia automática de siguiente ciclo
- [ ] **v3.0** — NOA Coach fine-tuned con historial del atleta

---

*Never Over, Always* ✦
