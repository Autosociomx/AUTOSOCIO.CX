-- AutoSocio Data Intelligence Platform
-- Migration 001: Core dataset schema

-- ── 1. Sesiones de diagnóstico (core del dataset) ────────────────────────────
CREATE TABLE IF NOT EXISTS diagnostic_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token        VARCHAR(64) UNIQUE NOT NULL,
  -- Datos del vehículo
  vehicle_make         VARCHAR(100),
  vehicle_model        VARCHAR(100),
  vehicle_year         SMALLINT,
  vehicle_engine       VARCHAR(100),
  vehicle_transmission VARCHAR(50),
  -- Consulta del usuario
  raw_query            TEXT,
  intent_scenario      VARCHAR(20),        -- EDUCATION | MONETIZATION | CREATOR_API
  complexity_level     SMALLINT,           -- 1-5
  -- Contexto geográfico (anonimizado, nunca PII)
  country_code         VARCHAR(2),
  region_state         VARCHAR(100),
  language             VARCHAR(5),
  -- Resultado del diagnóstico IA
  symptoms_detected    TEXT[],
  diagnostic_title     VARCHAR(255),
  diagnostic_summary   TEXT,
  tools_required       TEXT[],
  -- Interacción
  used_voice           BOOLEAN DEFAULT FALSE,
  used_image           BOOLEAN DEFAULT FALSE,
  -- Resolución
  resolution_type      VARCHAR(30),        -- SELF_RESOLVED | EXPERT_ESCALATED | PART_PURCHASED | ABANDONED
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  resolved_at          TIMESTAMPTZ
);

-- ── 2. Búsquedas de piezas ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS part_searches (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  part_name                 VARCHAR(255) NOT NULL,
  part_normalized           VARCHAR(255),
  part_keywords             TEXT[],
  platforms_returned        TEXT[],
  avg_viability_score       NUMERIC(4,2),
  price_min                 NUMERIC(10,2),
  price_max                 NUMERIC(10,2),
  price_currency            VARCHAR(3) DEFAULT 'MXN',
  top_recommended_platform  VARCHAR(100),
  image_analyzed            BOOLEAN DEFAULT FALSE,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Escalamientos a experto (triage) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS triage_escalations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                UUID REFERENCES diagnostic_sessions(id) ON DELETE CASCADE,
  escalation_trigger        VARCHAR(30),    -- AUTO_COMPLEXITY | USER_REQUEST | AI_RECOMMENDATION
  complexity_score          SMALLINT,
  agent_specialty           VARCHAR(100),
  wait_seconds              SMALLINT,
  session_duration_seconds  INTEGER,
  resolution_rating         SMALLINT,       -- 1-5
  was_resolved              BOOLEAN,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Patrones de falla agregados (producto B2B) ────────────────────────────
CREATE TABLE IF NOT EXISTS failure_patterns (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_make            VARCHAR(100),
  vehicle_model           VARCHAR(100),
  vehicle_year            SMALLINT,
  country_code            VARCHAR(2),
  failure_category        VARCHAR(100),
  failure_subcategory     VARCHAR(100),
  occurrence_count        INTEGER DEFAULT 0,
  avg_complexity          NUMERIC(3,2),
  most_searched_part      VARCHAR(255),
  avg_repair_cost_local   NUMERIC(10,2),
  expert_escalation_rate  NUMERIC(4,2),    -- porcentaje 0-100
  self_resolution_rate    NUMERIC(4,2),    -- porcentaje 0-100
  last_updated            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_make, vehicle_model, vehicle_year, country_code, failure_category)
);

-- ── 5. Inteligencia geográfica (por mes) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS geo_intelligence (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code          VARCHAR(2) NOT NULL,
  state_region          VARCHAR(100),
  period_month          DATE NOT NULL,      -- primer día del mes
  total_diagnostics     INTEGER DEFAULT 0,
  unique_vehicles       INTEGER DEFAULT 0,
  top_failure_category  VARCHAR(100),
  top_vehicle_make      VARCHAR(100),
  avg_vehicle_year      NUMERIC(5,1),
  expert_demand_index   NUMERIC(4,2),       -- 0-10
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, state_region, period_month)
);

-- ── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ds_vehicle
  ON diagnostic_sessions(vehicle_make, vehicle_model, vehicle_year);

CREATE INDEX IF NOT EXISTS idx_ds_country_date
  ON diagnostic_sessions(country_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ds_resolution
  ON diagnostic_sessions(resolution_type);

CREATE INDEX IF NOT EXISTS idx_ps_part_name
  ON part_searches(part_normalized, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fp_vehicle_country
  ON failure_patterns(vehicle_make, vehicle_model, country_code);

CREATE INDEX IF NOT EXISTS idx_geo_country_month
  ON geo_intelligence(country_code, period_month DESC);

-- ── Vistas B2B (lectura agregada, sin PII) ───────────────────────────────────

CREATE OR REPLACE VIEW v_top_failures_by_region AS
SELECT
  country_code,
  failure_category,
  SUM(occurrence_count)          AS total_occurrences,
  ROUND(AVG(avg_complexity), 2)  AS avg_complexity,
  ROUND(AVG(expert_escalation_rate), 2) AS avg_escalation_rate
FROM failure_patterns
GROUP BY country_code, failure_category
ORDER BY total_occurrences DESC;

CREATE OR REPLACE VIEW v_vehicle_demand_intelligence AS
SELECT
  vehicle_make,
  vehicle_model,
  COUNT(*)                                                              AS total_searches,
  ROUND(AVG(complexity_level), 2)                                       AS avg_complexity,
  COUNT(*) FILTER (WHERE resolution_type = 'EXPERT_ESCALATED')          AS expert_escalations,
  COUNT(*) FILTER (WHERE resolution_type = 'PART_PURCHASED')            AS parts_purchased,
  ROUND(
    COUNT(*) FILTER (WHERE resolution_type = 'PART_PURCHASED') * 100.0 / NULLIF(COUNT(*), 0),
    2
  )                                                                     AS purchase_conversion_pct,
  array_agg(DISTINCT country_code) FILTER (WHERE country_code IS NOT NULL) AS countries_active
FROM diagnostic_sessions
WHERE vehicle_make IS NOT NULL
GROUP BY vehicle_make, vehicle_model
ORDER BY total_searches DESC;

CREATE OR REPLACE VIEW v_part_demand_heatmap AS
SELECT
  ps.part_normalized,
  ds.country_code,
  DATE_TRUNC('week', ps.created_at) AS week,
  COUNT(*)                           AS search_count,
  ROUND(AVG(ps.price_min), 2)        AS avg_price_min,
  ROUND(AVG(ps.price_max), 2)        AS avg_price_max
FROM part_searches ps
JOIN diagnostic_sessions ds ON ds.id = ps.session_id
WHERE ps.part_normalized IS NOT NULL
GROUP BY ps.part_normalized, ds.country_code, week
ORDER BY search_count DESC;

-- ── Row Level Security (datos anónimos, sin restricción de lectura B2B) ──────
ALTER TABLE diagnostic_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_searches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_escalations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_patterns      ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_intelligence      ENABLE ROW LEVEL SECURITY;

-- Inserción pública (desde la app, sin auth)
CREATE POLICY "insert_anonymous" ON diagnostic_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "insert_anonymous" ON part_searches        FOR INSERT WITH CHECK (true);
CREATE POLICY "insert_anonymous" ON triage_escalations   FOR INSERT WITH CHECK (true);

-- Lectura solo para roles autenticados (B2B API)
CREATE POLICY "read_authenticated" ON failure_patterns  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "read_authenticated" ON geo_intelligence  FOR SELECT USING (auth.role() = 'authenticated');
