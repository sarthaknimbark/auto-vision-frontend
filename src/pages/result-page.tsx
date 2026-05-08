import jsPDF from 'jspdf'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useDetectionStore } from '../store/detection-store'
import type { PredictionItem } from '../types/api'
import { Download, FileText, ArrowLeft, ShieldCheck, DollarSign, Activity } from 'lucide-react'

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

  const downloadPdfReport = async () => {
    try {
      const doc = new jsPDF()
      const generatedAt = new Date().toLocaleString()
      const vi = (cost?.cost_estimation?.vehicle_info as any) || {}
      const brandColor = [152, 66, 22]
      const brandDark = [45, 26, 18]

      // Helper for headers
      const sectionHeader = (title: string, yPos: number) => {
        doc.setFillColor(152, 66, 22)
        doc.rect(14, yPos, 182, 8, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(`  ${title}`, 14, yPos + 5.5)
        return yPos + 12
      }

      // --- PAGE 1 HEADER ---
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2])
      doc.rect(0, 0, 210, 16, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('AutoClaim Vision  |  AI-Powered Damage Assessment Report', 105, 10, { align: 'center' })

      doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      doc.setFontSize(22)
      doc.text('Vehicle Damage Inspection Report', 14, 32)
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated: ${generatedAt}`, 14, 38)

      // Severity Badge
      doc.setFillColor(152, 66, 22)
      doc.rect(14, 45, 90, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(`  Overall Severity: ${severity.severity_report.severity_level} (${severity.severity_report.severity_score}/100)`, 14, 51.5)

      // --- 1. VEHICLE INFORMATION ---
      let y = sectionHeader('1. Vehicle Information', 65)
      doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      doc.setFontSize(9)
      const info = [
        ['Make', String(vi.make || 'Not specified')],
        ['Model', String(vi.model || 'Not specified')],
        ['Year', String(vi.year || 'N/A')],
        ['Segment', String(vi.segment || 'N/A')],
        ['Price Source', (cost?.cost_estimation?.line_items?.length || 0) > 0 ? (vi.make ? `OEM catalog (${vi.make} ${vi.model})` : 'Generic damage-type prices') : 'N/A'],
      ]
      info.forEach(([label, value], i) => {
        if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 7, 'F')
        doc.setFont('helvetica', 'bold')
        doc.text(`  ${label}`, 14, y + 5)
        doc.setFont('helvetica', 'normal')
        doc.text(String(value), 80, y + 5)
        y += 7
      })

      // --- 2. ANNOTATED DAMAGE IMAGE ---
      y = sectionHeader('2. Annotated Damage Image', y + 5)
      if (previewUrl) {
        const imgWidth = 165
        const actualWidth = imageSize.width > 1 ? imageSize.width : 1200
        const actualHeight = imageSize.height > 1 ? imageSize.height : 800
        const imgHeight = (actualHeight / actualWidth) * imgWidth
        
        if (y + imgHeight > 270) {
          doc.addPage()
          y = 20
        }
        
        try {
          // Add image to PDF
          doc.addImage(previewUrl, 'JPEG', 14, y, imgWidth, imgHeight)
          
          // Draw Bounding Boxes
          doc.setDrawColor(152, 66, 22)
          doc.setLineWidth(0.5)
          predict.predictions.forEach(p => {
            const [x1, y1, x2, y2] = p.bbox
            const bx = 14 + (x1 / actualWidth) * imgWidth
            const by = y + (y1 / actualHeight) * imgHeight
            const bw = ((x2 - x1) / actualWidth) * imgWidth
            const bh = ((y2 - y1) / actualHeight) * imgHeight
            doc.rect(bx, by, bw, bh, 'D')
            
            doc.setFillColor(152, 66, 22)
            const labelText = `${p.class.toUpperCase()} ${Math.round(p.confidence * 100)}%`
            const labelW = doc.getTextWidth(labelText) + 4
            doc.rect(bx, by - 5, labelW, 5, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(6)
            doc.text(labelText, bx + 2, by - 1.5)
          })
          y += imgHeight + 10
        } catch (imgError) {
          doc.setTextColor(255, 0, 0)
          doc.text('[Image could not be embedded in PDF]', 14, y + 5)
          y += 10
        }
      }

      // --- 3. DAMAGE DETECTIONS ---
      if (y > 240) { doc.addPage(); y = 20 }
      y = sectionHeader('3. Damage Detections', y)
      doc.setTextColor(255, 255, 255)
      doc.setFillColor(brandDark[0], brandDark[1], brandDark[2])
      doc.rect(14, y, 182, 6, 'F')
      doc.setFontSize(8)
      doc.text(' Part', 14, y + 4.5)
      doc.text(' Damage Type', 84, y + 4.5)
      doc.text(' Confidence', 124, y + 4.5)
      doc.text(' Area Ratio', 154, y + 4.5)
      doc.text(' Score', 180, y + 4.5)
      y += 6
      doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      const damageTable = severity.severity_report.damage_table || []
      damageTable.forEach((det, i) => {
        if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 6, 'F')
        doc.text(` ${det.part}`, 14, y + 4)
        doc.text(` ${det.damage_type}`, 84, y + 4)
        doc.text(` ${Math.round(det.confidence * 100)}%`, 124, y + 4)
        doc.text(` ${det.area.toFixed(3)}`, 154, y + 4)
        doc.text(` ${det.damage_score.toFixed(3)}`, 180, y + 4)
        y += 6
      })
      y += 5

      // --- 4. SEVERITY ANALYSIS ---
      if (y > 220) { doc.addPage(); y = 20 }
      y = sectionHeader('4. Severity Analysis', y)
      doc.setFontSize(9)
      doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]) // Fix: Set text color to dark
      const sevInfo = [
        ['Overall Level', severity.severity_report.severity_level],
        ['Overall Score', `${severity.severity_report.severity_score} / 100`],
        ['Parts Affected', severity.severity_report.detected_parts.join(', ') || 'None'],
      ]
      sevInfo.forEach(([label, value], i) => {
        if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 7, 'F')
        doc.setFont('helvetica', 'bold')
        doc.text(`  ${label}`, 14, y + 5)
        doc.setFont('helvetica', 'normal')
        doc.text(String(value), 80, y + 5)
        y += 7
      })
      y += 4
      doc.setFont('helvetica', 'bold'); doc.text('  Per-Part Breakdown:', 14, y); y += 5
      doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]); doc.rect(14, y, 182, 6, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(8)
      doc.text(' Part', 14, y + 4.5); doc.text(' Level', 64, y + 4.5); doc.text(' Score', 89, y + 4.5); doc.text(' Damage Types', 109, y + 4.5); doc.text(' Structural', 149, y + 4.5); doc.text(' Safety Critical', 170, y + 4.5)
      y += 6; doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      Object.entries(severity.severity_report.part_severity).forEach(([p, info], i) => {
        if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 6, 'F')
        doc.text(` ${p}`, 14, y + 4); doc.text(` ${info.severity_level}`, 64, y + 4); doc.text(` ${info.severity_score.toFixed(1)}`, 89, y + 4); doc.text(` ${info.damage_types.join(', ')}`, 109, y + 4); doc.text(` ${info.is_structural ? 'Yes' : 'No'}`, 149, y + 4); doc.text(` ${info.is_safety_critical ? 'Yes' : 'No'}`, 170, y + 4); y += 6
      })

      // --- 5. REPAIR COST ESTIMATE ---
      if (y > 220) { doc.addPage(); y = 20 }
      y = sectionHeader('5. Repair Cost Estimate', y + 5)
      doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]); doc.rect(14, y, 182, 6, 'F'); doc.setTextColor(255, 255, 255)
      doc.text(' Part', 14, y + 4.5); doc.text(' Repair Action', 84, y + 4.5); doc.text(' Severity', 144, y + 4.5); doc.text(' Est. Cost', 180, y + 4.5)
      y += 6; doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      cost.cost_estimation.line_items.forEach((item, i) => {
        if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 6, 'F')
        doc.text(` ${item.part}`, 14, y + 4); doc.text(` ${item.repair_action}`, 84, y + 4); doc.text(` ${item.severity_level}`, 144, y + 4); doc.text(` ${cost.cost_estimation.currency} ${item.estimated_cost}`, 180, y + 4); y += 6
      })
      // Totals
      const totals = [
        ['Parts Subtotal', `${cost.cost_estimation.currency} ${cost.cost_estimation.parts_total}`],
        ['Labour (20%)', `${cost.cost_estimation.currency} ${cost.cost_estimation.labor_total}`],
        ['GRAND TOTAL', `${cost.cost_estimation.currency} ${cost.cost_estimation.grand_total}`],
      ]
      totals.forEach(([label, val], i) => {
        if (label.includes('GRAND')) doc.setFillColor(235, 240, 248)
        else if (i % 2 === 0) doc.setFillColor(245, 245, 247)
        else doc.setFillColor(255, 255, 255)
        doc.rect(14, y, 182, 7, 'F'); doc.setFont('helvetica', 'bold'); doc.text(`  ${label}`, 14, y + 5); doc.text(val, 180, y + 5, { align: 'right' }); y += 7
      })

      // --- 6. DISCLAIMER ---
      if (y > 260) { doc.addPage(); y = 20 }
      y = sectionHeader('6. Disclaimer', y + 5)
      doc.setFontSize(8); doc.setFont('helvetica', 'italic'); doc.setTextColor(brandDark[0], brandDark[1], brandDark[2])
      doc.text('This report is generated by an AI system for informational purposes only. It does not constitute a professional insurance assessment or certified repair quote. Consult a certified mechanic or IRDAI-authorised insurance surveyor for official claims.', 14, y + 5, { maxWidth: 182 })

      doc.save(`AutoVision_Report_${Date.now()}.pdf`)
    } catch (error) {
      console.error('PDF Generation Error:', error)
      alert('Failed to generate PDF. Please check console for details.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-6xl animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Assessment Results</h1>
          <p className="text-slate-500 font-medium">Detailed breakdown of vehicle damage and repair costs</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/upload">
            <button className="button-secondary flex items-center gap-2">
              <ArrowLeft size={18} /> New Analysis
            </button>
          </Link>
          <button onClick={downloadPdfReport} className="button-primary flex items-center gap-2">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-2 space-y-8">
          {previewUrl && (
            <div className="glass-card p-4">
              <DamageImageOverlay
                previewUrl={previewUrl}
                predictions={predict.predictions}
                imageSize={imageSize}
                onImageLoad={setImageSize}
              />
            </div>
          )}

          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="text-[#984216]" size={20} /> Detection Analytics
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {topDetections.map((item, idx) => (
                <DetectionItem key={idx} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financials */}
        <div className="space-y-8">
          <div className="glass-card-colored p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-2">Grand Total Estimate</p>
              <div className="text-5xl font-black mb-6">
                <span className="text-2xl opacity-60 mr-1 font-medium">{cost.cost_estimation.currency}</span>
                {cost.cost_estimation.grand_total}
              </div>
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70 font-medium">Parts Total</span>
                  <span className="font-bold">{cost.cost_estimation.currency} {cost.cost_estimation.parts_total}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70 font-medium">Labor Total</span>
                  <span className="font-bold">{cost.cost_estimation.currency} {cost.cost_estimation.labor_total}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Damage Summary</h3>
              <div className="bg-[#984216]/5 text-[#984216] text-xs font-black px-3 py-1 rounded-full uppercase">
                {severity.severity_report.severity_level}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium text-sm">Severity Score</span>
                <span className="font-bold text-slate-900">{severity.severity_report.severity_score}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#984216]" 
                  style={{ width: `${severity.severity_report.severity_score}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium text-sm">Items Detected</span>
                <span className="font-bold text-slate-900">{predict.count}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="font-bold text-slate-900 mb-6">Repair Action Items</h3>
            <div className="space-y-4">
              {cost.cost_estimation.line_items.map((line, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">{line.part}</div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-tight">{line.repair_action}</div>
                  </div>
                  <div className="text-sm font-bold text-[#984216]">
                    {cost.cost_estimation.currency}{line.estimated_cost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
    <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-slate-50">
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
              className="absolute border-2 border-[#984216] bg-[#984216]/5 rounded-sm"
              style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
            >
              <div className="absolute -top-6 left-0 flex items-center gap-2 whitespace-nowrap rounded-t-md bg-[#984216] px-2 py-0.5 shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {prediction.class.replace(/-/g, ' ')}
                </span>
                <span className="text-[10px] font-black text-white/80 border-l border-white/20 pl-1.5">
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
  
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-slate-900 capitalize">{item.class.replace(/-/g, ' ')}</span>
        <span className="text-xs font-black text-[#984216]">{confidence}%</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#984216]" 
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  )
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value
  }
  return `${value.slice(0, max - 1)}.`
}

