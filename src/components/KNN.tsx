// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import {
  generateTwoBlobs, generateXORData, knnPredict, knnAccuracyCurve, euclidean,
} from '../utils/mlUtils'

const QUERY = { x: 0, y: 0 }
const BLOBS = generateTwoBlobs(60, 7)
const XOR_DATA = generateXORData(60, 13)

const tooltipStyle = { contentStyle: { background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 } }

export default function KNN() {
  const { t } = useLanguage()
  const [k, setK] = useState(5)
  const [dataset, setDataset] = useState<'blobs' | 'xor'>('blobs')

  const data = dataset === 'blobs' ? BLOBS : XOR_DATA
  const maxK = Math.min(20, data.length - 1)

  const predicted = useMemo(() => knnPredict(data, QUERY, k), [data, k])
  const accuracyCurve = useMemo(() => knnAccuracyCurve(data, maxK), [data, maxK])
  const currentAcc = accuracyCurve.find(d => d.k === k)?.accuracy ?? 0

  // Find k nearest neighbors to query
  const kNeighborIndices = useMemo(() => {
    const dists = data.map((pt, idx) => ({ idx, dist: euclidean([pt.x, pt.y], [QUERY.x, QUERY.y]) }))
    dists.sort((a, b) => a.dist - b.dist)
    return new Set(dists.slice(0, k).map(d => d.idx))
  }, [data, k])

  const class0 = data.filter((_, i) => data[i].label === 0 && !kNeighborIndices.has(i))
  const class1 = data.filter((_, i) => data[i].label === 1 && !kNeighborIndices.has(i))
  const kn0 = data.filter((_, i) => data[i].label === 0 && kNeighborIndices.has(i))
  const kn1 = data.filter((_, i) => data[i].label === 1 && kNeighborIndices.has(i))
  const queryPoint = [QUERY]

  return (
    <section id="knn" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('knnTitle')}</h2>
          <p className="text-zinc-400 text-sm">{t('knnSubtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-6 mb-8 items-end">
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-xs font-medium text-zinc-400">{t('knnK')}: <span className="text-violet-400 font-bold">{k}</span></label>
            <input
              type="range" min={1} max={maxK} value={k}
              onChange={e => setK(Number(e.target.value))}
              className="accent-violet-500 w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">{t('knnDataset')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDataset('blobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dataset === 'blobs' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
              >{t('knnBlobs')}</button>
              <button
                onClick={() => setDataset('xor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${dataset === 'xor' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
              >{t('knnXOR')}</button>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {t('knnAccuracy')}: <span className="text-violet-400 font-bold">{(currentAcc * 100).toFixed(1)}%</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              Predicted: <span className={predicted === 0 ? 'text-sky-400 font-bold' : 'text-rose-400 font-bold'}>Class {predicted}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter chart */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs text-zinc-500 mb-3">{k} {t('knnNeighbors')}</p>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#27272a" />
                <XAxis type="number" dataKey="x" domain={[-5, 5]} tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" domain={[-5, 5]} tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Scatter name="Class 0" data={class0} fill="#38bdf8" opacity={0.7} />
                <Scatter name="Class 1" data={class1} fill="#fb7185" opacity={0.7} />
                <Scatter name="KN Class 0" data={kn0} fill="#38bdf8" opacity={1} shape="diamond" />
                <Scatter name="KN Class 1" data={kn1} fill="#fb7185" opacity={1} shape="diamond" />
                <Scatter name="Query" data={queryPoint} fill="#a78bfa" shape="star" />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 mr-1" />Class 0</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 mr-1" />Class 1</span>
              <span><span className="inline-block w-2.5 h-2.5 bg-violet-400 mr-1 rotate-45" />Neighbor</span>
              <span><span className="inline-block w-2.5 h-2.5 bg-violet-300 mr-1" />Query (0,0)</span>
            </div>
          </div>

          {/* Accuracy curve */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs text-zinc-500 mb-3">{t('knnAccuracy')} vs k (leave-one-out)</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={accuracyCurve} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="k" tick={{ fill: '#71717a', fontSize: 10 }} label={{ value: 'k', position: 'insideRight', fill: '#71717a', fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <ReferenceLine x={k} stroke="#8b5cf6" strokeDasharray="4 2" label={{ value: `k=${k}`, fill: '#a78bfa', fontSize: 10 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400 leading-relaxed">
          <span className="text-violet-400 font-medium">How it works:</span> KNN classifies a query point by majority vote among its k nearest training points.
          When <strong className="text-zinc-300">k=1</strong> the model memorizes training data (overfits, low bias but high variance).
          As k increases the decision boundary smooths out — but too-large k causes underfitting (high bias).
          The accuracy curve shows this U-shaped tradeoff: there is an optimal k in the middle.
        </div>
      </motion.div>
    </section>
  )
}
