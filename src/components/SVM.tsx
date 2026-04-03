// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { svmMarginData } from '../utils/mlUtils'

const tooltipStyle = { contentStyle: { background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 } }

export default function SVM() {
  const { t } = useLanguage()
  const [C, setC] = useState(1)
  const [kernel, setKernel] = useState<'linear' | 'rbf'>('linear')

  const { support, margin, class0, class1 } = useMemo(() => svmMarginData(C), [C])

  const cDisplay = C < 1 ? C.toFixed(2) : C.toFixed(1)

  return (
    <section id="svm" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('svmTitle')}</h2>
          <p className="text-zinc-400 text-sm">{t('svmSubtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-6 mb-8 items-end">
          <div className="flex flex-col gap-2 min-w-[220px]">
            <label className="text-xs font-medium text-zinc-400">
              {t('svmC')}: <span className="text-violet-400 font-bold">C = {cDisplay}</span>
            </label>
            <input
              type="range" min={0.1} max={15} step={0.1} value={C}
              onChange={e => setC(Number(e.target.value))}
              className="accent-violet-500 w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">{t('svmKernel')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setKernel('linear')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${kernel === 'linear' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
              >{t('svmLinear')}</button>
              <button
                onClick={() => setKernel('rbf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${kernel === 'rbf' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
              >{t('svmRBF')} <span className="text-zinc-600">(informational)</span></button>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {t('svmMargin')}: <span className="text-violet-400 font-bold">{margin}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {t('svmSupportVectors')}: <span className="text-violet-400 font-bold">{support.length}</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs text-zinc-500 mb-3">Decision boundary at y=0, margin band shaded in violet</p>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#27272a" />
              <XAxis type="number" dataKey="x" domain={[-4, 4]} tick={{ fill: '#71717a', fontSize: 10 }} />
              <YAxis type="number" dataKey="y" domain={[-4, 4]} tick={{ fill: '#71717a', fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              {/* Margin band */}
              <ReferenceArea y1={-margin / 2} y2={margin / 2} fill="#8b5cf6" fillOpacity={0.08} />
              {/* Decision boundary */}
              <ReferenceLine y={0} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="0" label={{ value: 'Decision Boundary', fill: '#a78bfa', fontSize: 10, position: 'right' }} />
              {/* Margin lines */}
              <ReferenceLine y={margin / 2} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 3" />
              <ReferenceLine y={-margin / 2} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 3" />
              {/* Classes */}
              <Scatter name="Class 0" data={class0} fill="#38bdf8" opacity={0.75} />
              <Scatter name="Class 1" data={class1} fill="#fb7185" opacity={0.75} />
              {/* Support vectors — rendered larger with stroke */}
              <Scatter name="Support Vectors" data={support} fill="transparent" stroke="#a78bfa" strokeWidth={2} opacity={1} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 mr-1" />Class 0</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 mr-1" />Class 1</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-violet-400 mr-1" />Support Vectors</span>
            <span><span className="inline-block w-6 h-0.5 bg-violet-500 mr-1 mb-0.5" />Boundary</span>
            <span><span className="inline-block w-6 h-2 bg-violet-500/10 border border-violet-500/30 mr-1" />Margin</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400 leading-relaxed">
          <span className="text-violet-400 font-medium">How it works:</span> SVMs find the hyperplane that <strong className="text-zinc-300">maximizes the margin</strong> between classes.
          The <strong className="text-zinc-300">support vectors</strong> are the training points closest to the boundary — they define it.
          The parameter <strong className="text-zinc-300">C</strong> controls the trade-off: <em>low C</em> allows misclassifications (soft margin, wider street) while
          <em> high C</em> forces hard separation (narrow margin, more sensitive to outliers).
          {kernel === 'rbf' && <span> The <strong className="text-zinc-300">RBF kernel</strong> implicitly maps data to a higher-dimensional space where non-linearly separable data becomes separable.</span>}
        </div>
      </motion.div>
    </section>
  )
}
