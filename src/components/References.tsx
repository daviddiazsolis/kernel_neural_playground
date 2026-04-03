// SPDX-License-Identifier: Apache-2.0
import { motion } from 'motion/react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function References() {
  const { t } = useLanguage()
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-violet-400" />
          <h2 className="text-2xl font-bold text-zinc-100">{t('refTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-violet-400 mb-3 uppercase tracking-wider">Books</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                <span className="text-zinc-400 text-sm">{t('refBook1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                <span className="text-zinc-400 text-sm">{t('refBook2')}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-violet-400 mb-3 uppercase tracking-wider">Links</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <a
                  href="https://scikit-learn.org/stable/modules/classes.html"
                  target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
                >{t('refLink1')}</a>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <a
                  href="http://neuralnetworksanddeeplearning.com"
                  target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
                >{t('refLink2')}</a>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
