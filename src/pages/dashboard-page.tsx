import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Play } from 'lucide-react'
import { HowItWorks } from '../components/HowItWorks'
import { FeatureCards } from '../components/FeatureCards'

export function DashboardPage() {
  return (
    <div className="flex flex-col">
      {/* Section 1: Hero */}
      <section className="relative pt-16 pb-24 bg-brand-50/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-start text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#984216]/10 bg-[#984216]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#984216]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#984216] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#984216]"></span>
                </span>
                AI Powered Assessment
              </motion.div>

              <motion.h1
                className="mb-8 text-6xl font-black tracking-tight text-slate-900 sm:text-7xl leading-[1.05]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Detect <span className="heading-gradient">Damage</span> <br />
                With AI Precision
              </motion.h1>

              <motion.p
                className="mb-10 max-w-lg text-lg leading-relaxed text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Transform your vehicle inspection workflow. Our state-of-the-art computer vision models detect and analyze car damage instantly.
              </motion.p>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link to="/upload">
                  <button className="button-primary flex items-center gap-2 group">
                    Start Analysis
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="flex items-center gap-2 font-semibold text-slate-900 hover:text-[#984216] transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white border border-brand-100 flex items-center justify-center text-brand-700 group-hover:border-[#984216]/30 transition-colors shadow-sm">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                  Watch Demo
                </button>
              </motion.div>

              <motion.div 
                className="mt-12 flex items-center gap-8 pt-8 border-t border-[#984216]/10 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div>
                  <div className="text-2xl font-bold text-slate-900">99.2%</div>
                  <div className="text-sm text-slate-500 font-medium">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">2.5s</div>
                  <div className="text-sm text-slate-500 font-medium">Processing Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50k+</div>
                  <div className="text-sm text-slate-500 font-medium">Cars Analyzed</div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="relative lg:ml-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative z-10 glass-card p-4 animate-float">
                <img 
                  src="/hero-car.png" 
                  alt="AutoVision Hero" 
                  className="rounded-2xl w-full h-auto object-cover shadow-2xl"
                />
                
                {/* Floating Stats UI */}
                <div className="absolute -left-12 top-1/4 glass-card p-4 shadow-2xl hidden xl:block">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700">
                      <ChevronRight size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Status</div>
                      <div className="text-sm font-bold text-slate-900">Scan Complete</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 glass-card p-4 shadow-2xl hidden xl:block">
                  <div className="text-xs font-bold text-[#984216] uppercase mb-1">Damage Score</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#984216]" />
                    </div>
                    <span className="text-sm font-black text-[#984216]">75%</span>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#984216]/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="py-24 bg-white">
        <FeatureCards />
      </section>

      {/* Section 3: How It Works */}
      <section className="py-24 bg-brand-50/50">
        <HowItWorks />
      </section>

      {/* Section 4: CTA */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-card-colored p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold text-white tracking-tight">
                Ready to Automate Your Inspection?
              </h2>
              <p className="mb-10 text-brand-100 text-lg max-w-2xl mx-auto font-medium">
                Join hundreds of enterprise partners who trust AutoVision for their claims processing and vehicle assessments.
              </p>
              <Link to="/signup">
                <button className="bg-white text-[#984216] hover:bg-brand-50 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-all">
                  Get Started for Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

