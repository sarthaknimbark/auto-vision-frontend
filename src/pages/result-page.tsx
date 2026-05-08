import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { generateReport } from '../api/detection'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useDetectionStore } from '../store/detection-store'
import type { PredictionItem } from '../types/api'

export function ResultPage() {
  const file = useDetectionStore((state) => state.file)
  const predict = useDetectionStore((state) => state.predict)
  const severity = useDetectionStore((state) => state.severity)
  const cost = useDetectionStore((state) => state.cost)
  const previewUrl = useDetectionStore((state) => state.previewUrl)
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 })
  const [isGenerating, setIsGenerating] = useState(false)

  if (!predict || !severity || !cost) {
    return <Navigate to="/upload" replace />
  }

  const topDetections = [...predict.predictions]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  const handleDownloadReport = async () => {
    if (!file) return
    setIsGenerating(true)
    try {
      const vInfo = cost.cost_estimation.vehicle_info as { make?: string; model?: string; year?: number }
      const blob = await generateReport(file, {
        make: vInfo.make,
        model: vInfo.model,
        year: vInfo.year,
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `AutoVision_Report_${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Report download failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="flex flex-wrap items-center justify-between gap-6" spacing="roomy">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">Assessment Intelligence</h1>
          <p className="text-base text-[#4B4B4B] sm:text-lg">Comprehensive damage analysis and cost projection</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownloadReport} size="lg" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Download PDF Report'}
          </Button>
        </div>
      </Card>

      {previewUrl ? (
        <Card className="overflow-hidden" spacing="default">
          <DamageImageOverlay
            previewUrl={previewUrl}
            predictions={predict.predictions}
            imageSize={imageSize}
            onImageLoad={setImageSize}
          />
        </Card>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card spacing="roomy">
          <h2 className="mb-7 text-2xl font-semibold tracking-tight text-[#111111]">Detection Analytics</h2>
          <div className="space-y-4">
            {topDetections.length > 0 ? (
              topDetections.map((item) => (
                <DetectionItem key={`${item.class}-${item.bbox.join('-')}`} item={item} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[#111111]/10 p-10 text-center">
                <p className="text-base font-medium text-[#4B4B4B]">No damage detected in this assessment.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col" spacing="roomy">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[#111111]">Financial Summary</h2>

          <div className="relative overflow-hidden rounded-3xl bg-[#60176F] p-8 text-white shadow-[0_18px_36px_rgba(96,23,111,0.35)]">
            <div className="relative z-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] opacity-80">Grand Total Estimate</p>
              <p className="text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="text-2xl font-medium opacity-60 mr-2">{cost.cost_estimation.currency}</span>
                {cost.cost_estimation.grand_total}
              </p>
              <p className="mt-5 text-sm opacity-80">Inclusive of all detected parts and labor fees</p>
            </div>
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <Metric title="Detection Confidence" value={`${Math.round((topDetections[0]?.confidence ?? 0) * 100)}%`} />
            <Metric title="Aggregated Severity" value={`${severity.severity_report.severity_score}%`} />
            <Metric title="Parts Inventory Total" value={`${cost.cost_estimation.currency} ${cost.cost_estimation.parts_total}`} />
            <Metric title="Labor & Services" value={`${cost.cost_estimation.currency} ${cost.cost_estimation.labor_total}`} />
          </div>

          <div className="mt-10 flex-1 border-t border-[#60176F]/10 pt-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#111111]">Inventory Breakdown</p>
              <span className="rounded-full bg-[#60176F]/8 px-3 py-1 text-xs font-semibold text-[#60176F]">{cost.cost_estimation.line_items.length} Items</span>
            </div>
            <div className="space-y-3">
              {cost.cost_estimation.line_items.length > 0 ? (
                cost.cost_estimation.line_items.map((line) => (
                  <div key={`${line.part}-${line.damage_type}`} className="flex items-center justify-between rounded-2xl border border-[#111111]/8 bg-white/70 p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-[#111111]">{line.part}</p>
                      <p className="text-xs capitalize text-[#4B4B4B]">{line.damage_type.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-base font-semibold text-[#60176F]">
                      {cost.cost_estimation.currency} {line.estimated_cost}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#111111]/10 p-6 text-center">
                  <p className="text-sm font-medium text-[#4B4B4B]">No repairs identified.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button onClick={() => window.location.assign('/upload')} size="lg">
          Launch New Assessment
        </Button>
      </div>
    </div>
  )
}

function DamageImageOverlay({
  previewUrl,
  predictions,
  imageSize,
  onImageLoad,
}: {
  previewUrl: string
  predictions: PredictionItem[]
  imageSize: { width: number; height: number }
  onImageLoad: (size: { width: number; height: number }) => void
}) {
  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-3xl border border-white/85 bg-[#f8f9fa] shadow-inner">
      <img
        src={previewUrl}
        alt="detected result"
        className="h-auto w-full object-contain"
        onLoad={(event) =>
          onImageLoad({
            width: event.currentTarget.naturalWidth || 1,
            height: event.currentTarget.naturalHeight || 1,
          })
        }
      />
      <div className="pointer-events-none absolute inset-0">
        {predictions.map((prediction, index) => {
          const [x1, y1, x2, y2] = prediction.bbox
          const left = (x1 / imageSize.width) * 100
          const top = (y1 / imageSize.height) * 100
          const width = ((x2 - x1) / imageSize.width) * 100
          const height = ((y2 - y1) / imageSize.height) * 100
          return (
            <div
              key={`${prediction.class}-${index}`}
              className="absolute border-2 border-[#60176F] bg-[#60176F]/8 shadow-[0_0_18px_rgba(96,23,111,0.16)]"
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            >
              <div className="absolute -top-8 left-0 flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#60176F] px-3 py-1.5 shadow-lg">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {prediction.class.replace(/-/g, ' ')}
                </span>
                <span className="text-[10px] font-black text-white/70">
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DetectionItem({ item }: { item: PredictionItem }) {
  const confidence = Math.round(item.confidence * 100)
  const level = confidence >= 80 ? 'Optimal' : confidence >= 50 ? 'Stable' : 'Low'
  const accentColor =
    level === 'Optimal' ? '#60176F' : level === 'Stable' ? '#4b4b4b' : '#7b2c8a'

  return (
    <div className="rounded-3xl border border-[#60176F]/10 bg-white/75 p-6 transition-all hover:bg-white">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-semibold capitalize text-[#111111]">{item.class.replace(/-/g, ' ')}</p>
        <span className="rounded-full bg-[#60176F]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#60176F]">
          {level}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-[#4B4B4B]/70">
          <span>Confidence Score</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#60176F]/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#60176F]/10 bg-white/75 p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4B4B4B]/70">{title}</p>
      <p className="text-xl font-semibold text-[#111111]">{value}</p>
    </div>
  )
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1)}.`
}
