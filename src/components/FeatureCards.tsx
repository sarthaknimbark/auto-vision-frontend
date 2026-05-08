import { FileText, Gauge, IndianRupee, Scan, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: <Shield size={24} />,
    title: 'Advanced Detection',
    description:
      'High-precision identification of bumper, headlight, door, hood, and fender anomalies using neural networks.',
  },
  {
    icon: <IndianRupee size={24} />,
    title: 'Financial Intelligence',
    description:
      'Dynamic repair cost estimation calibrated against real-world market labor rates and part indices.',
  },
  {
    icon: <Scan size={24} />,
    title: 'Visual Verification',
    description: 'Instant visualization of detected defects with high-fidelity bounding boxes and metadata overlays.',
  },
  {
    icon: <Gauge size={24} />,
    title: 'Severity Quantification',
    description: 'Scientific scoring of damage magnitude to prioritize claims and automate approval workflows.',
  },
  {
    icon: <FileText size={24} />,
    title: 'Automated Reports',
    description: 'Generate comprehensive, audit-ready PDF documentation for seamless integration with insurance systems.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Enterprise Velocity',
    description: 'Industrial-grade inference pipeline delivering complex multi-stage analysis in milliseconds.',
  },
]

export function FeatureCards() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Industrial Grade Capabilities</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Our visual intelligence engine provides end-to-end automation for automotive claim lifecycles.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={idx} className="glass-card p-8 group">
              <div className="w-14 h-14 rounded-2xl bg-[#984216]/5 flex items-center justify-center text-[#984216] mb-6 group-hover:bg-[#984216] group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

