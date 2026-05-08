import { Bot, FileText, Upload } from 'lucide-react'

const items = [
  {
    index: 1,
    icon: <Upload size={24} />,
    title: 'Evidence Submission',
    description: 'Securely upload high-resolution imagery of the vehicle damage through our portal.',
  },
  {
    index: 2,
    icon: <Bot size={24} />,
    title: 'Neural Processing',
    description: 'Our computer vision models identify anomalies, classify parts, and assess severity.',
  },
  {
    index: 3,
    icon: <FileText size={24} />,
    title: 'Instant Estimation',
    description: 'Receive a comprehensive repair cost report and visual audit trail within seconds.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-center text-4xl font-black text-slate-900">
          Streamlined Workflow
        </h2>
        <div className="grid gap-12 md:grid-cols-3 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />
          
          {items.map((item) => (
            <div
              key={item.index}
              className="glass-card p-10 text-center relative z-10 hover:border-[#984216]/30"
            >
              <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#984216] text-xl font-black text-white shadow-xl shadow-brand-200">
                {item.index}
              </div>
              <div className="mx-auto mb-6 w-12 h-12 flex items-center justify-center text-[#984216]">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

