// SPDX-License-Identifier: Apache-2.0
import { motion } from 'motion/react'
import { Network, Cpu, Zap, Brain } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const tags = [
  { key: 'heroTag1', icon: Network, color: 'text-violet-400' },
  { key: 'heroTag2', icon: Cpu, color: 'text-violet-400' },
  { key: 'heroTag3', icon: Zap, color: 'text-violet-400' },
  { key: 'heroTag4', icon: Brain, color: 'text-violet-400' },
] as const

export default function Hero() {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden py-24 px-6 bg-zinc-950">
      {/* background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium"
        >
          <Brain className="w-3.5 h-3.5" />
          {t('heroSubtitle')}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-zinc-100 leading-tight"
        >
          {t('heroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-lg max-w-2xl leading-relaxed"
        >
          {t('heroDesc')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {tags.map(({ key, icon: Icon, color }) => (
            <span
              key={key}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              {t(key)}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
