import { supabase } from './supabaseClient';
import type { Language, AuditScenario, DiagnosticGuide, EnrichedPartRecommendation } from '../types';
import type {
  DiagnosticSessionInsert,
  PartSearchInsert,
  TriageEscalationInsert,
  FailurePattern,
  GeoIntelligence,
} from '../types/dataIntelligence';

// ── Capture ──────────────────────────────────────────────────────────────────

export async function captureSession(session: DiagnosticSessionInsert): Promise<string | null> {
  const { data, error } = await supabase
    .from('diagnostic_sessions')
    .insert(session)
    .select('id')
    .single();

  if (error) {
    console.error('[DataIntel] captureSession:', error.message);
    return null;
  }
  return data.id;
}

export async function capturePartSearch(search: PartSearchInsert): Promise<void> {
  const { error } = await supabase.from('part_searches').insert(search);
  if (error) console.error('[DataIntel] capturePartSearch:', error.message);
}

export async function captureTriageEscalation(escalation: TriageEscalationInsert): Promise<void> {
  const { error } = await supabase.from('triage_escalations').insert(escalation);
  if (error) console.error('[DataIntel] captureTriageEscalation:', error.message);
}

export async function updateSessionResolution(
  sessionId: string,
  resolutionType: 'SELF_RESOLVED' | 'EXPERT_ESCALATED' | 'PART_PURCHASED' | 'ABANDONED'
): Promise<void> {
  const { error } = await supabase
    .from('diagnostic_sessions')
    .update({ resolution_type: resolutionType, resolved_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (error) console.error('[DataIntel] updateSessionResolution:', error.message);
}

// ── Analytics B2B ────────────────────────────────────────────────────────────

export async function getTopFailuresByCountry(countryCode: string, limit = 10): Promise<FailurePattern[]> {
  const { data, error } = await supabase
    .from('failure_patterns')
    .select('*')
    .eq('country_code', countryCode)
    .order('occurrence_count', { ascending: false })
    .limit(limit);

  if (error) { console.error('[DataIntel] getTopFailures:', error.message); return []; }
  return data ?? [];
}

export async function getGeoIntelligence(countryCode: string, months = 3): Promise<GeoIntelligence[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data, error } = await supabase
    .from('geo_intelligence')
    .select('*')
    .eq('country_code', countryCode)
    .gte('period_month', since.toISOString().split('T')[0])
    .order('period_month', { ascending: false });

  if (error) { console.error('[DataIntel] getGeoIntelligence:', error.message); return []; }
  return data ?? [];
}

export async function getPartDemandTrend(
  partName: string,
  countryCode?: string
): Promise<{ date: string; count: number }[]> {
  let query = supabase
    .from('part_searches')
    .select('created_at')
    .ilike('part_normalized', `%${partName}%`);

  if (countryCode) {
    query = query.eq('diagnostic_sessions.country_code', countryCode);
  }

  const { data, error } = await query;
  if (error) { console.error('[DataIntel] getPartDemand:', error.message); return []; }

  // Aggregate by day
  const counts: Record<string, number> = {};
  (data ?? []).forEach(row => {
    const day = row.created_at.split('T')[0];
    counts[day] = (counts[day] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function buildSessionFromDiagnostic(params: {
  vehicleData: { make: string; model: string; year: string; engine: string; transmission: string };
  rawQuery: string;
  intentScenario: AuditScenario;
  guide: DiagnosticGuide;
  language: Language;
  countryCode?: string;
  usedVoice?: boolean;
  usedImage?: boolean;
}): DiagnosticSessionInsert {
  return {
    session_token: crypto.randomUUID(),
    vehicle_make: params.vehicleData.make || null,
    vehicle_model: params.vehicleData.model || null,
    vehicle_year: params.vehicleData.year ? parseInt(params.vehicleData.year) : null,
    vehicle_engine: params.vehicleData.engine || null,
    vehicle_transmission: params.vehicleData.transmission || null,
    raw_query: params.rawQuery,
    intent_scenario: params.intentScenario,
    complexity_level: estimateComplexity(params.guide),
    country_code: params.countryCode ?? detectCountryFromLanguage(params.language),
    language: params.language,
    symptoms_detected: params.guide.symptoms ?? [],
    diagnostic_title: params.guide.title ?? null,
    diagnostic_summary: params.guide.failureAnalysis ?? null,
    tools_required: params.guide.toolsRequired ?? [],
    used_voice: params.usedVoice ?? false,
    used_image: params.usedImage ?? false,
    resolution_type: null,
  };
}

export function buildPartSearchFromResults(
  sessionId: string,
  partName: string,
  results: EnrichedPartRecommendation[]
): PartSearchInsert {
  const prices = results.map(r => r.part.price).filter(Boolean);
  const platforms = [...new Set(results.map(r => r.part.platform).filter(Boolean))] as string[];
  const topResult = results.find(r => r.isMostRecommended) ?? results[0];

  return {
    session_id: sessionId,
    part_name: partName,
    part_normalized: normalizePartName(partName),
    part_keywords: topResult?.part.keywords ?? [],
    platforms_returned: platforms,
    avg_viability_score: results.length
      ? results.reduce((sum, r) => sum + (r.viabilityScore ?? 0), 0) / results.length
      : null,
    price_min: prices.length ? Math.min(...prices) : null,
    price_max: prices.length ? Math.max(...prices) : null,
    price_currency: 'MXN',
    top_recommended_platform: topResult?.part.platform ?? null,
    image_analyzed: false,
  };
}

// ── Private utils ─────────────────────────────────────────────────────────────

function estimateComplexity(guide: DiagnosticGuide): number {
  let score = 1;
  if (guide.toolsRequired && guide.toolsRequired.length > 3) score++;
  if (guide.diagnosticSteps && guide.diagnosticSteps.length > 5) score++;
  if (guide.symptoms && guide.symptoms.length > 3) score++;
  if (guide.failureAnalysis && guide.failureAnalysis.length > 200) score++;
  return Math.min(score, 5);
}

function detectCountryFromLanguage(lang: Language): string {
  const map: Record<Language, string> = {
    es: 'MX', en: 'US', pt: 'BR', fr: 'FR', de: 'DE', zh: 'CN', ja: 'JP',
  };
  return map[lang] ?? 'MX';
}

function normalizePartName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}
