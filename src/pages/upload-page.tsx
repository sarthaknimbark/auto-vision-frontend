import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { estimateCost, fullScan, getVehicleCatalog, predictDamage, predictSeverity, uploadFile } from '../api/detection'
import { useDetectionStore } from '../store/detection-store'
import { fileToCompressedJpegDataUrl } from '../utils/history-image'
import { Upload, Car, Calendar, Loader2, AlertCircle } from 'lucide-react'

export function UploadPage() {
  const angles = ['Front', 'Rear', 'Left', 'Right'] as const
  const [mode, setMode] = useState<'single' | 'multi'>('single')
  const [make, setMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [year, setYear] = useState<number | undefined>(undefined)
  const [requestError, setRequestError] = useState<string | null>(null)
  
  // Multi-scan state
  const [multiFiles, setMultiFiles] = useState<Record<string, File | null>>({
    Front: null, Rear: null, Left: null, Right: null
  })
  const [multiPreviews, setMultiPreviews] = useState<Record<string, string | null>>({
    Front: null, Rear: null, Left: null, Right: null
  })

  const navigate = useNavigate()
  const setFile = useDetectionStore((state) => state.setFile)
  const setMultiScans = useDetectionStore((state) => state.setMultiScans)
  const setResults = useDetectionStore((state) => state.setResults)
  const file = useDetectionStore((state) => state.file)
  const previewUrl = useDetectionStore((state) => state.previewUrl)

  const uploadMutation = useMutation({ mutationFn: uploadFile })
  const predictMutation = useMutation({ mutationFn: predictDamage })
  const severityMutation = useMutation({ mutationFn: predictSeverity })
  const costMutation = useMutation({
    mutationFn: (payload: { file: File; vehicle?: { make?: string; model?: string; year?: number } }) =>
      estimateCost(payload.file, payload.vehicle),
  })
  
  const vehicleCatalogQuery = useQuery({
    queryKey: ['vehicle-catalog'],
    queryFn: getVehicleCatalog,
  })

  const loading =
    uploadMutation.isPending ||
    predictMutation.isPending ||
    severityMutation.isPending ||
    costMutation.isPending

  const onSelectSingleFile = (selected?: File) => {
    if (!selected) return
    setFile(selected, URL.createObjectURL(selected))
  }

  const onSelectMultiFile = (label: string, selected?: File) => {
    if (!selected) return
    const url = URL.createObjectURL(selected)
    setMultiFiles(prev => ({ ...prev, [label]: selected }))
    setMultiPreviews(prev => ({ ...prev, [label]: url }))
  }

  const allMultiAnglesSelected = angles.every((angle) => Boolean(multiFiles[angle]))

  const runDetection = async () => {
    const filesToProcess: { file: File; label: string }[] = []
    
    if (mode === 'single') {
      if (!file) return
      filesToProcess.push({ file, label: 'Single' })
    } else {
      Object.entries(multiFiles).forEach(([label, f]) => {
        if (f) filesToProcess.push({ file: f, label })
      })
      if (!allMultiAnglesSelected) {
        setRequestError('Please upload all 4 angles (Front, Rear, Left, Right) for Full Scan.')
        return
      }
    }

    setRequestError(null)
    try {
      if (mode === 'single') {
        const u = await uploadMutation.mutateAsync(file!)
        const p = await predictMutation.mutateAsync(file!)
        const s = await severityMutation.mutateAsync(file!)
        const c = await costMutation.mutateAsync({
          file: file!,
          vehicle: { make, model: vehicleModel, year },
        })

        setResults({ 
          upload: u, 
          predict: p, 
          severity: s, 
          cost: c 
        })
      } else {
        // Multi-angle scan
        const files = filesToProcess.map(f => f.file)
        const fullResults = await fullScan(files, { make, model: vehicleModel, year })
        
        // Mocking upload result for the first image just to satisfy the store/UI
        const u = await uploadMutation.mutateAsync(files[0])

        setResults({
          upload: u,
          predict: { predictions: fullResults.severity_report.detection_boxes ?? [], count: fullResults.count },
          severity: fullResults,
          cost: fullResults
        })

        setMultiScans(filesToProcess.map(f => ({
          file: f.file,
          label: f.label,
          previewUrl: multiPreviews[f.label] || ''
        })))
      }

      // Save to History logic
      const token = localStorage.getItem('token')
      if (token) {
        const results = useDetectionStore.getState()
        
        let historyMultiScans: { label: string; imageUrl: string }[] = []
        if (mode === 'multi') {
          historyMultiScans = await Promise.all(
            filesToProcess.map(async (f) => ({
              label: f.label,
              imageUrl: await fileToCompressedJpegDataUrl(f.file)
            }))
          )
        }

        const mainImageUrl = mode === 'single' 
          ? await fileToCompressedJpegDataUrl(file!) 
          : historyMultiScans[0]?.imageUrl || ''
        
        const payload = {
          vehicleInfo: { make, model: vehicleModel, year },
          results: { 
            predict: results.predict, 
            severity: results.severity, 
            cost: results.cost,
            isMultiScan: mode === 'multi',
            multiScans: historyMultiScans,
          },
          imageUrl: mainImageUrl,
        }
        console.log('Saving to History:', payload)
        
        await fetch('http://localhost:5000/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(payload),
        })
      }

      navigate('/result')
    } catch (error) {
      console.error('Detection Error:', error)
      setRequestError('Analysis failed. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Vehicle Analysis</h1>
          <p className="text-slate-500 text-lg font-medium">
            AI-powered damage detection and repair estimation
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setMode('single')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                mode === 'single' ? 'bg-white text-[#984216] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quick Scan
            </button>
            <button
              onClick={() => setMode('multi')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                mode === 'multi' ? 'bg-white text-[#984216] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Full Scan (4-Point)
            </button>
          </div>
        </div>
        
        {mode === 'single' ? (
          <div className="glass-card p-10 mb-8 border-dashed border-2 border-[#984216]/20 hover:border-[#984216]/40 transition-colors">
            <label className="flex flex-col items-center justify-center cursor-pointer min-h-[300px]">
              <input
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => onSelectSingleFile(event.target.files?.[0])}
              />
              {!previewUrl ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[#984216]/5 rounded-3xl flex items-center justify-center text-[#984216] mb-6 shadow-sm">
                    <Upload size={32} />
                  </div>
                  <p className="text-xl font-bold text-slate-900 mb-2">Drop your image here</p>
                  <p className="text-slate-500 font-medium">Standard single-point analysis</p>
                </div>
              ) : (
                <div className="w-full relative group">
                  <img src={previewUrl} alt="preview" className="w-full h-[400px] object-cover rounded-2xl shadow-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <div className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-xl">Change Image</div>
                  </div>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {angles.map(angle => (
              <div key={angle} className="relative group">
                <label className={`flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  multiPreviews[angle] ? 'border-[#984216] bg-slate-50' : 'border-slate-200 hover:border-[#984216]/40'
                }`}>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onSelectMultiFile(angle, e.target.files?.[0])}
                  />
                  {multiPreviews[angle] ? (
                    <img src={multiPreviews[angle]!} className="w-full h-full object-cover rounded-[14px]" alt={angle} />
                  ) : (
                    <div className="text-center p-4">
                      <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{angle}</span>
                    </div>
                  )}
                  {multiPreviews[angle] && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-[8px] font-black rounded-md uppercase">
                      {angle}
                    </div>
                  )}
                </label>
              </div>
            ))}
            </div>
            <p className="text-xs font-semibold text-slate-500 text-center">
              Full Scan requires all 4 images: Front, Rear, Left, and Right.
            </p>
          </div>
        )}

        {requestError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{requestError}</span>
          </div>
        )}

        {/* Vehicle Details & Run Button (Same as before but refined) */}
        <div className="glass-card p-8 mb-8">
          <div className="grid gap-6 md:grid-cols-3">
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Car size={14} /> Manufacturer
                </label>
                <select
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value)
                    setVehicleModel('')
                    setYear(undefined)
                  }}
                  className="input-glass w-full h-12 font-bold text-slate-900"
                >
                  <option value="">Select Make</option>
                  {vehicleCatalogQuery.data?.catalog.map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
             </div>
             {/* ... (rest of vehicle fields kept same but with font-bold) */}
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Car size={14} /> Model
                </label>
                <select
                  value={vehicleModel}
                  onChange={(e) => {
                    setVehicleModel(e.target.value)
                    setYear(undefined)
                  }}
                  className="input-glass w-full h-12 font-bold text-slate-900"
                  disabled={!make}
                >
                  <option value="">Select Model</option>
                  {vehicleCatalogQuery.data?.catalog.find(m => m.name === make)?.models.map(mod => (
                    <option key={mod.name} value={mod.name}>{mod.name}</option>
                  ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Year
                </label>
                <select
                  value={year ?? ''}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="input-glass w-full h-12 font-bold text-slate-900"
                  disabled={!vehicleModel}
                >
                  <option value="">Select Year</option>
                  {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
             </div>
          </div>
        </div>

        <button
          className={`button-primary w-full h-16 text-lg font-black flex items-center justify-center gap-3 ${
            (loading || (mode === 'single' ? !file : !allMultiAnglesSelected)) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={runDetection}
          disabled={loading || (mode === 'single' ? !file : !allMultiAnglesSelected)}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={24} /> Analyzing Multi-Point Data...</>
          ) : (
            `Analyze ${mode === 'single' ? 'Vehicle' : 'Full Vehicle (4 Points)'}`
          )}
        </button>
      </div>
    </div>
  )
}

