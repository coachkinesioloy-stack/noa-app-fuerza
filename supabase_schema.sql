-- ═══════════════════════════════════════════════════
-- NOA — Never Over, Always
-- Schema completo de Supabase
-- Copiar y pegar en: Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. EXTENSIONES
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- 2. PERFILES (atleta / coach)
-- ─────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key references auth.users on delete cascade,
  nombre          text not null,
  rol             text not null check (rol in ('atleta','coach')) default 'atleta',
  perfil_deporte  text check (perfil_deporte in ('fitness','hibrido','cross','conjunto','individual','resistencia','musculacion')),
  fecha_nac       date,
  peso_actual     numeric(5,2),
  talla           numeric(5,1),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
create policy "Perfil propio" on profiles
  for all using (auth.uid() = id);

-- ─────────────────────────────────────────
-- 3. EJERCICIOS (catálogo maestro)
-- ─────────────────────────────────────────
create table if not exists ejercicios (
  id              serial primary key,
  nombre          text not null,
  grupo_muscular  text,
  patron_movimiento text check (patron_movimiento in ('Sentadilla','Bisagra','Empuje','Jale','Cargada','Core','Accesorio','Full body')),
  perfil          text[],      -- array: ['fitness','hibrido','musculacion',...]
  nivel           text check (nivel in ('basico','intermedio','avanzado')),
  tipo            text check (tipo in ('principal','accesorio','cardio','movilidad')),
  descripcion     text,
  video_url       text,
  created_at      timestamptz default now()
);

alter table ejercicios enable row level security;
create policy "Ejercicios públicos" on ejercicios
  for select using (true);
create policy "Solo coach puede editar" on ejercicios
  for all using (
    exists (select 1 from profiles where id = auth.uid() and rol = 'coach')
  );

-- ─────────────────────────────────────────
-- 4. CICLOS DE ENTRENAMIENTO
-- ─────────────────────────────────────────
create table if not exists ciclos (
  id              serial primary key,
  atleta_id       uuid not null references profiles(id) on delete cascade,
  coach_id        uuid references profiles(id),
  nombre          text,
  tipo            text check (tipo in ('adaptacion','hipertrofia','fza_resistencia','fza_potencia','submax','neural')),
  fecha_inicio    date,
  fecha_fin       date,
  semanas         int check (semanas between 1 and 16),
  sesiones_semana int check (sesiones_semana between 1 and 7),
  activo          boolean default true,
  notas           text,
  created_at      timestamptz default now()
);

alter table ciclos enable row level security;
create policy "Ciclos del atleta" on ciclos
  for all using (
    atleta_id = auth.uid() or coach_id = auth.uid()
  );

-- ─────────────────────────────────────────
-- 5. PLAN DE SESIONES (plantilla del coach)
-- ─────────────────────────────────────────
create table if not exists sesiones_plan (
  id              serial primary key,
  ciclo_id        int not null references ciclos(id) on delete cascade,
  semana          int not null,
  sesion          int not null,
  orden           int not null default 1,
  ejercicio_id    int not null references ejercicios(id),
  series          int,
  reps            text,         -- "5" | "8-10" | "AMRAP"
  intensidad_pct  numeric(5,2), -- % del 1RM
  rir             int,          -- repeticiones en reserva objetivo
  descanso_seg    int,
  notas_coach     text
);

alter table sesiones_plan enable row level security;
create policy "Plan del ciclo del atleta" on sesiones_plan
  for all using (
    exists (
      select 1 from ciclos c
      where c.id = ciclo_id
      and (c.atleta_id = auth.uid() or c.coach_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────
-- 6. LOGS REALES DE ENTRENAMIENTO
-- ─────────────────────────────────────────
create table if not exists logs_entrenamiento (
  id               serial primary key,
  atleta_id        uuid not null references profiles(id) on delete cascade,
  ciclo_id         int references ciclos(id),
  sesion_plan_id   int references sesiones_plan(id),
  fecha            timestamptz default now(),
  semana           int,
  sesion           int,
  ejercicio_id     int not null references ejercicios(id),
  series_realizadas int,
  reps_realizadas  int,
  carga_kg         numeric(6,2),
  rpe              numeric(3,1) check (rpe between 1 and 10),
  rir_real         int,
  completado       boolean default true,
  notas            text,
  -- Calculados automáticamente
  tonelaje         numeric generated always as
                   (series_realizadas * reps_realizadas * carga_kg) stored,
  e1rm             numeric generated always as
                   (carga_kg * (1 + reps_realizadas::numeric / 30)) stored
);

alter table logs_entrenamiento enable row level security;
create policy "Logs propios del atleta" on logs_entrenamiento
  for all using (atleta_id = auth.uid());
create policy "Coach ve logs de sus atletas" on logs_entrenamiento
  for select using (
    exists (
      select 1 from ciclos c
      where c.id = ciclo_id and c.coach_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 7. BIOMARCADORES
-- ─────────────────────────────────────────
create table if not exists biomarcadores (
  id              serial primary key,
  atleta_id       uuid not null references profiles(id) on delete cascade,
  fecha           date not null default current_date,
  peso_kg         numeric(5,2),
  hrv             numeric(6,2),   -- ms
  fc_reposo       int,            -- bpm
  calidad_sueno   int check (calidad_sueno between 1 and 10),
  dolor_muscular  int check (dolor_muscular between 0 and 10),
  estres          int check (estres between 0 and 10),
  motivacion      int check (motivacion between 1 and 10),
  notas           text,
  -- Readiness calculado
  readiness_score int generated always as (
    round(
      (coalesce(calidad_sueno,5)::numeric / 10 * 25) +
      (coalesce(motivacion,5)::numeric / 10 * 25) +
      ((10 - coalesce(estres,5))::numeric / 10 * 25) +
      ((10 - coalesce(dolor_muscular,5))::numeric / 10 * 25)
    )
  ) stored,
  unique (atleta_id, fecha)
);

alter table biomarcadores enable row level security;
create policy "Biomarcadores propios" on biomarcadores
  for all using (atleta_id = auth.uid());
create policy "Coach ve biomarcadores" on biomarcadores
  for select using (
    exists (
      select 1 from ciclos c
      where c.atleta_id = atleta_id and c.coach_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 8. MARCAS PERSONALES
-- ─────────────────────────────────────────
create table if not exists marcas (
  id              serial primary key,
  atleta_id       uuid not null references profiles(id) on delete cascade,
  ejercicio_id    int not null references ejercicios(id),
  fecha           date not null default current_date,
  rm1_real        numeric(6,2),      -- 1RM probado real
  rm1_estimado    numeric(6,2),      -- 1RM calculado por Epley
  notas           text
);

alter table marcas enable row level security;
create policy "Marcas propias" on marcas
  for all using (atleta_id = auth.uid());

-- ─────────────────────────────────────────
-- 9. DATOS INICIALES — EJERCICIOS
-- ─────────────────────────────────────────
insert into ejercicios (nombre, grupo_muscular, patron_movimiento, perfil, nivel, tipo) values
  ('Sentadilla trasera',         'Pierna',      'Sentadilla', '{fitness,hibrido,musculacion,cross}',         'avanzado',   'principal'),
  ('Sentadilla frontal',         'Pierna',      'Sentadilla', '{hibrido,cross,individual}',                  'avanzado',   'principal'),
  ('Sentadilla goblet',          'Pierna',      'Sentadilla', '{fitness,hibrido,resistencia}',               'basico',     'accesorio'),
  ('Zancadas búlgaras',          'Pierna',      'Sentadilla', '{fitness,hibrido,conjunto,individual}',       'intermedio', 'accesorio'),
  ('Peso muerto convencional',   'Cadena post.','Bisagra',    '{fitness,hibrido,musculacion,cross}',         'avanzado',   'principal'),
  ('Peso muerto rumano',         'Cadena post.','Bisagra',    '{fitness,hibrido,musculacion,resistencia}',   'intermedio', 'accesorio'),
  ('Hip thrust',                 'Glúteos',     'Bisagra',    '{fitness,hibrido,resistencia,musculacion}',   'basico',     'principal'),
  ('Buenos días',                'Cadena post.','Bisagra',    '{fitness,hibrido,musculacion}',               'intermedio', 'accesorio'),
  ('Press banca plano',          'Pecho',       'Empuje',     '{fitness,hibrido,musculacion}',               'intermedio', 'principal'),
  ('Press banca inclinado',      'Pecho',       'Empuje',     '{fitness,hibrido,musculacion}',               'intermedio', 'accesorio'),
  ('Press militar',              'Hombros',     'Empuje',     '{fitness,hibrido,musculacion}',               'intermedio', 'principal'),
  ('Push press',                 'Hombros',     'Empuje',     '{cross,individual,hibrido}',                  'intermedio', 'principal'),
  ('Remo con barra',             'Espalda',     'Jale',       '{fitness,hibrido,musculacion}',               'intermedio', 'principal'),
  ('Remo en T',                  'Espalda',     'Jale',       '{fitness,hibrido,musculacion}',               'intermedio', 'accesorio'),
  ('Dominadas',                  'Espalda',     'Jale',       '{fitness,hibrido,cross,individual}',          'intermedio', 'accesorio'),
  ('Pull down',                  'Espalda',     'Jale',       '{fitness,hibrido,musculacion}',               'basico',     'accesorio'),
  ('Clean & Jerk',               'Full body',   'Cargada',    '{cross,individual}',                          'avanzado',   'principal'),
  ('Snatch',                     'Full body',   'Cargada',    '{cross,individual}',                          'avanzado',   'principal'),
  ('Power clean',                'Full body',   'Cargada',    '{cross,conjunto,individual}',                 'avanzado',   'principal'),
  ('Burpee',                     'Cardio',      'Full body',  '{cross,conjunto,fitness}',                    'basico',     'cardio'),
  ('Burpee box jump',            'Cardio',      'Full body',  '{cross,conjunto}',                            'intermedio', 'cardio'),
  ('Thruster',                   'Full body',   'Full body',  '{cross,individual}',                          'intermedio', 'principal'),
  ('Plancha',                    'Core',        'Core',       '{fitness,hibrido,resistencia,cross}',         'basico',     'accesorio'),
  ('Ab wheel',                   'Core',        'Core',       '{fitness,hibrido,musculacion}',               'intermedio', 'accesorio'),
  ('Cargadas Pallof',            'Core',        'Core',       '{fitness,hibrido,conjunto,individual}',       'intermedio', 'accesorio')
on conflict do nothing;

-- ─────────────────────────────────────────
-- 10. FUNCIÓN: trigger updated_at en profiles
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- 11. VISTA: resumen por atleta (para coach)
-- ─────────────────────────────────────────
create or replace view vista_resumen_atletas as
select
  p.id,
  p.nombre,
  p.perfil_deporte,
  c.tipo as ciclo_actual,
  c.semanas,
  (
    select count(*) from logs_entrenamiento l
    where l.atleta_id = p.id
    and l.fecha >= now() - interval '30 days'
  ) as sesiones_ultimo_mes,
  (
    select readiness_score from biomarcadores b
    where b.atleta_id = p.id
    order by fecha desc limit 1
  ) as readiness_hoy,
  (
    select sum(tonelaje) from logs_entrenamiento l
    where l.atleta_id = p.id
    and l.semana = (select max(semana) from logs_entrenamiento where atleta_id = p.id)
  ) as tonelaje_semana_actual
from profiles p
left join ciclos c on c.atleta_id = p.id and c.activo = true
where p.rol = 'atleta';

-- ═══════════════════════════════════════════════════
-- FIN DEL SCHEMA NOA v1.0
-- ═══════════════════════════════════════════════════
