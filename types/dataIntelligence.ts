// Types for the AutoSocio Data Intelligence layer

export interface DiagnosticSessionInsert {
  session_token: string;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_engine: string | null;
  vehicle_transmission: string | null;
  raw_query: string;
  intent_scenario: string;
  complexity_level: number;
  country_code: string;
  language: string;
  symptoms_detected: string[];
  diagnostic_title: string | null;
  diagnostic_summary: string | null;
  tools_required: string[];
  used_voice: boolean;
  used_image: boolean;
  resolution_type: string | null;
}

export interface DiagnosticSession extends DiagnosticSessionInsert {
  id: string;
  created_at: string;
  resolved_at: string | null;
}

export interface PartSearchInsert {
  session_id: string;
  part_name: string;
  part_normalized: string;
  part_keywords: string[];
  platforms_returned: string[];
  avg_viability_score: number | null;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  top_recommended_platform: string | null;
  image_analyzed: boolean;
}

export interface PartSearch extends PartSearchInsert {
  id: string;
  created_at: string;
}

export interface TriageEscalationInsert {
  session_id: string;
  escalation_trigger: 'AUTO_COMPLEXITY' | 'USER_REQUEST' | 'AI_RECOMMENDATION';
  complexity_score: number;
  agent_specialty: string | null;
  wait_seconds: number | null;
  session_duration_seconds: number | null;
  resolution_rating: number | null;
  was_resolved: boolean | null;
}

export interface TriageEscalation extends TriageEscalationInsert {
  id: string;
  created_at: string;
}

export interface FailurePattern {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  country_code: string;
  failure_category: string;
  failure_subcategory: string | null;
  occurrence_count: number;
  avg_complexity: number;
  most_searched_part: string | null;
  avg_repair_cost_local: number | null;
  expert_escalation_rate: number;
  self_resolution_rate: number;
  last_updated: string;
}

export interface GeoIntelligence {
  id: string;
  country_code: string;
  state_region: string | null;
  period_month: string;
  total_diagnostics: number;
  unique_vehicles: number;
  top_failure_category: string | null;
  top_vehicle_make: string | null;
  avg_vehicle_year: number | null;
  expert_demand_index: number;
  created_at: string;
}

// B2B analytics views (read-only)
export interface TopFailuresByRegion {
  country_code: string;
  failure_category: string;
  total_occurrences: number;
  avg_complexity: number;
  avg_escalation_rate: number;
}

export interface VehicleDemandIntelligence {
  vehicle_make: string;
  vehicle_model: string;
  total_searches: number;
  avg_complexity: number;
  expert_escalations: number;
  parts_purchased: number;
  countries_active: string[];
}
