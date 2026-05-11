import { create } from 'zustand'
import type { CostEstimationResponse, PredictResponse, SeverityResponse, UploadResponse } from '../types/api'

interface ScanItem {
  file: File
  previewUrl: string
  label: string // Front, Rear, Left, Right, Roof
}

interface DetectionState {
  // Mode
  isMultiScan: boolean
  
  // Single Scan Data
  file: File | null
  previewUrl: string | null
  
  // Multi Scan Data
  scans: ScanItem[]
  
  // Results (Aggregated)
  upload: UploadResponse | null
  predict: PredictResponse | null
  severity: SeverityResponse | null
  cost: CostEstimationResponse | null
  
  setFile: (file: File, previewUrl: string) => void
  setMultiScans: (scans: ScanItem[]) => void
  setResults: (payload: {
    upload: UploadResponse
    predict: PredictResponse
    severity: SeverityResponse
    cost: CostEstimationResponse
  }) => void
  clear: () => void
}

export const useDetectionStore = create<DetectionState>((set) => ({
  isMultiScan: false,
  file: null,
  previewUrl: null,
  scans: [],
  upload: null,
  predict: null,
  severity: null,
  cost: null,
  setFile: (file, previewUrl) => set({ file, previewUrl, isMultiScan: false }),
  setMultiScans: (scans) => set({ scans, isMultiScan: true }),
  setResults: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),
  clear: () =>
    set({
      isMultiScan: false,
      file: null,
      previewUrl: null,
      scans: [],
      upload: null,
      predict: null,
      severity: null,
      cost: null,
    }),
}))
