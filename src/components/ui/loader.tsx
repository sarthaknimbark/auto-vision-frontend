import { Car } from 'lucide-react'

interface LoaderProps {
  message?: string
  description?: string
  isOverlay?: boolean
}

export function CarLoader({
  message = 'Analyzing Vehicle',
  description = 'Scanning image for damages, identifying affected parts, and sourcing repair costs...',
  isOverlay = true,
}: LoaderProps) {
  const content = (
    <div className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center ${isOverlay ? 'shadow-2xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-300' : 'flex flex-col items-center'}`}>
      {/* Animated Driving Car */}
      <div className="relative mb-5 flex flex-col items-center justify-end h-16 w-48 overflow-hidden">
        {/* Car Icon */}
        <div className="text-[#984216] animate-car-engine mb-1">
          <Car size={36} />
        </div>
        {/* Moving Road */}
        <div className="w-full h-[2px] bg-slate-200 overflow-hidden relative">
          <div className="absolute inset-0 animate-road-pass"></div>
        </div>
      </div>
      
      <h3 className="text-xl font-black text-slate-900 mb-2">{message}</h3>
      {description && (
        <p className="text-slate-500 text-sm font-semibold mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Simple Pulsing Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-[#984216] rounded-full animate-pulse" style={{ width: '70%' }}></div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-[#984216]/70">Processing Pipeline</span>
    </div>
  )

  if (isOverlay) {
    return (
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
        {content}
      </div>
    )
  }

  return content
}
