import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { estimateCost, getVehicleCatalog, predictDamage, predictSeverity, uploadFile } from '../api/detection'
import { useDetectionStore } from '../store/detection-store'
import { Upload, Car, Calendar, Search, Loader2, AlertCircle } from 'lucide-react'

export function UploadPage() {
  const [make, setMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [year, setYear] = useState<number | undefined>(undefined)
  const [requestError, setRequestError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setFile = useDetectionStore((state) => state.setFile)
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

  const makeOptions = vehicleCatalogQuery.data?.catalog ?? []
  const selectedMake = makeOptions.find((option) => option.name === make)
  const modelOptions = selectedMake?.models ?? []
  const selectedModel = modelOptions.find((option) => option.name === vehicleModel)
  const yearOptions =
    selectedModel && selectedModel.year_start <= selectedModel.year_end
      ? Array.from(
          { length: selectedModel.year_end - selectedModel.year_start + 1 },
          (_, index) => selectedModel.year_start + index,
        ).reverse()
      : []

  const loading =
    uploadMutation.isPending ||
    predictMutation.isPending ||
    severityMutation.isPending ||
    costMutation.isPending

  const onSelectFile = (selected?: File) => {
    if (!selected) return
    setFile(selected, URL.createObjectURL(selected))
  }

  const onChangeMake = (value: string) => {
    setMake(value)
    setVehicleModel('')
    setYear(undefined)
  }

  const onChangeModel = (value: string) => {
    setVehicleModel(value)
    setYear(undefined)
  }

  const runDetection = async () => {
    if (!file) return
    setRequestError(null)
    try {
      const upload = await uploadMutation.mutateAsync(file)
      const predict = await predictMutation.mutateAsync(file)
      const severity = await severityMutation.mutateAsync(file)
      const cost = await costMutation.mutateAsync({
        file,
        vehicle: { make, model: vehicleModel, year },
      })

      setResults({ upload, predict, severity, cost })

      // Save to History API if logged in
      const token = localStorage.getItem('token')
      if (token) {
        try {
          await fetch('http://localhost:5000/api/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({
              vehicleInfo: { make, model: vehicleModel, year },
              results: { predict, severity, cost },
              imageUrl: previewUrl
            })
          })
        } catch (err) {
          console.error('Failed to save to history:', err)
        }
      }

      navigate('/result')
    } catch (error) {
      if (error instanceof AxiosError && !error.response) {
        setRequestError(
          'Unable to reach API. Ensure backend is running.',
        )
        return
      }
      setRequestError('Analysis failed. Please verify API availability and try again.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Vehicle Analysis</h1>
          <p className="text-slate-500 text-lg font-medium">
            Upload images for real-time damage detection and repair estimation
          </p>
        </div>
        
        {/* ... (existing content) ... */}
        
        <div className="glass-card p-10 mb-8 border-dashed border-2 border-[#984216]/20 hover:border-[#984216]/40 transition-colors">
          <label className="flex flex-col items-center justify-center cursor-pointer min-h-[300px]">
            <input
              className="hidden"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => onSelectFile(event.target.files?.[0])}
            />
            
            {!previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-[#984216]/5 rounded-3xl flex items-center justify-center text-[#984216] mb-6 shadow-sm">
                  <Upload size={32} />
                </div>
                <p className="text-xl font-bold text-slate-900 mb-2">Drop your image here</p>
                <p className="text-slate-500 font-medium">PNG, JPG or WEBP (Max 10MB)</p>
              </div>
            ) : (
              <div className="w-full relative group">
                <img 
                  src={previewUrl} 
                  alt="upload preview" 
                  className="w-full h-[400px] object-cover rounded-2xl shadow-lg" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <div className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-xl">
                    Change Image
                  </div>
                </div>
              </div>
            )}
          </label>
        </div>

        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#984216]/10 flex items-center justify-center text-[#984216]">
              <Search size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Vehicle Details</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Car size={14} /> Manufacturer
              </label>
              <select
                value={make}
                onChange={(e) => onChangeMake(e.target.value)}
                className="input-glass w-full h-12 font-medium"
                disabled={vehicleCatalogQuery.isLoading}
              >
                <option value="">
                  {vehicleCatalogQuery.isLoading ? 'Loading...' : 'Select Make'}
                </option>
                {makeOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Car size={14} /> Model
              </label>
              <select
                value={vehicleModel}
                onChange={(e) => onChangeModel(e.target.value)}
                className="input-glass w-full h-12 font-medium"
                disabled={!make || !modelOptions.length}
              >
                <option value="">Select Model</option>
                {modelOptions.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Calendar size={14} /> Year
              </label>
              <select
                value={year ?? ''}
                onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
                className="input-glass w-full h-12 font-medium"
                disabled={!vehicleModel || !yearOptions.length}
              >
                <option value="">Select Year</option>
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          className={`button-primary w-full h-16 text-lg font-black flex items-center justify-center gap-3 ${
            (!file || loading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={runDetection}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              Analyzing Damage...
            </>
          ) : (
            'Execute Damage Analysis'
          )}
        </button>

        {(uploadMutation.error || requestError) && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 font-bold">
            <AlertCircle size={20} />
            {requestError ?? 'Analysis failed. Please try again.'}
          </div>
        )}
      </div>
    </div>
  )
}

