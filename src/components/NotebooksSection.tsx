// SPDX-License-Identifier: Apache-2.0
import { motion } from 'motion/react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const NOTEBOOKS = [
  {
    titleKey: 'nbKernelTitle',
    descKey: 'nbKernelDesc',
    colab: 'https://colab.research.google.com/github/daviddiazsolis/kernel_neural_playground/blob/main/notebooks/kernel_neural.ipynb',
    github: 'https://github.com/daviddiazsolis/kernel_neural_playground',
    accent: '#8b5cf6',
  },
]

export default function NotebooksSection() {
  const { t } = useLanguage()
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-400" />
          {t('nbTitle')}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">{t('nbSubtitle')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NOTEBOOKS.map(nb => (
            <div key={nb.titleKey} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="font-semibold text-zinc-200 mb-2">{t(nb.titleKey)}</h3>
              <p className="text-sm text-zinc-500 mb-4 leading-relaxed">{t(nb.descKey)}</p>
              <div className="flex gap-2">
                <a href={nb.colab} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-100 transition-opacity hover:opacity-80"
                  style={{ background: nb.accent }}>
                  <ExternalLink className="w-3 h-3" /> Open in Colab
                </a>
                <a href={nb.github} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
