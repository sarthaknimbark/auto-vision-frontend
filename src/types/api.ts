export interface HealthResponse {
  status: string
  version: string
}

export interface UploadResponse {
  file_info: {
    filename: string
    content_type: string
    size: number
  }
}

export interface PredictionItem {
  class: string
  confidence: number
  bbox: [number, number, number, number]
  image_index?: number
}

export interface PredictResponse {
  predictions: PredictionItem[]
  count: number
}

export interface SeverityRow {
  part: string
  damage_type: string
  confidence: number
  area: number
  damage_score: number
}

export interface PartSeverity {
  part: string
  damage_type: string
  damage_types: string[]
  severity_score: number
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical'
  damage_count: number
  max_area_ratio: number
}

export interface SeverityReport {
  severity_score: number
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical'
  detected_parts: string[]
  damage_table: SeverityRow[]
  critical_flags: string[]
  part_severity: Record<string, PartSeverity>
}

export interface SeverityResponse {
  severity_report: SeverityReport
  count: number
}

export interface CostLineItem {
  part: string
  damage_type: string
  damage_types: string[]
  damage_count: number
  severity_score: number
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical'
  base_price: number
  price_source: string
  repair_multiplier: number
  estimated_cost: number
  part_cost: number
  repair_action: string
  max_area_ratio: number
}

export interface CostEstimation {
  line_items: CostLineItem[]
  parts_total: number
  labor_total: number
  grand_total: number
  currency: string
  vehicle_info: Record<string, unknown>
  skipped_parts: string[]
  note: string
}

export interface CostEstimationResponse {
  cost_estimation: CostEstimation
}

export interface VehicleCatalogModel {
  name: string
  year_start: number
  year_end: number
  segment: string
}

export interface VehicleCatalogMake {
  name: string
  models: VehicleCatalogModel[]
}

export interface VehicleCatalogResponse {
  catalog: VehicleCatalogMake[]
}

export interface ApiErrorResponse {
  detail?: string
}
