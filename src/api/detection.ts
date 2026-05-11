import { apiClient } from './client'
import type {
  CostEstimationResponse,
  HealthResponse,
  PredictResponse,
  SeverityResponse,
  UploadResponse,
  VehicleCatalogResponse,
} from '../types/api'

export async function getHealth() {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}

export async function getVehicleCatalog() {
  const { data } = await apiClient.get<VehicleCatalogResponse>('/vehicle-catalog')
  return data
}

export async function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<UploadResponse>('/upload', form)
  return data
}

export async function predictDamage(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<PredictResponse>('/upload/predict', form)
  return data
}

export async function predictSeverity(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<SeverityResponse>('/upload/severity', form)
  return data
}

export async function estimateCost(
  file: File,
  vehicle?: { make?: string; model?: string; year?: number },
) {
  const form = new FormData()
  form.append('file', file)
  if (vehicle?.make) {
    form.append('make', vehicle.make)
  }
  if (vehicle?.model) {
    form.append('model', vehicle.model)
  }
  if (vehicle?.year) {
    form.append('year', String(vehicle.year))
  }
  const { data } = await apiClient.post<CostEstimationResponse>(
    '/upload/cost-estimation',
    form,
  )
  return data
}

export async function generateReport(
  file: File,
  vehicle?: { make?: string; model?: string; year?: number },
) {
  const form = new FormData()
  form.append('file', file)
  if (vehicle?.make) {
    form.append('make', vehicle.make)
  }
  if (vehicle?.model) {
    form.append('model', vehicle.model)
  }
  if (vehicle?.year) {
    form.append('year', String(vehicle.year))
  }
  const { data } = await apiClient.post('/upload/report', form, {
    responseType: 'blob',
  })
  return data
}

export async function fullScan(
  files: File[],
  vehicle?: { make?: string; model?: string; year?: number },
) {
  const form = new FormData()
  files.forEach((file) => {
    form.append('files', file)
  })
  if (vehicle?.make) {
    form.append('make', vehicle.make)
  }
  if (vehicle?.model) {
    form.append('model', vehicle.model)
  }
  if (vehicle?.year) {
    form.append('year', String(vehicle.year))
  }
  const { data } = await apiClient.post<any>('/upload/full-scan', form)
  return data
}
