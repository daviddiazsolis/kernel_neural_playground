// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { activationPoints } from '../utils/mlUtils'

const tooltipStyle = { contentStyle: { background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 } }

// OR gate dataset
const OR_DATA = [
  { x1: 0, x2: 0, y: 0 },
  { x1: 0, x2: 1, y: 1 },
  { x1: 1, x2: 0, y: 1 },
  { x1: 1, x2: 1, y: 1 },
]

function stepFn(x: number): number {
  return x >= 0 ? 1 : 0
}

interface TrainingRow {
  epoch: number
  x1: number
  x2: number
  yTrue: number
  yHat: number
  w1Update: string
  w2Update: string
  w1: number
  w2: number
  bias: number
}

function trainPerceptron(lr: number, maxEpochs: number): TrainingRow[] {
  let w1 = 0.1, w2 = 0.1, bias = 0.0
  const rows: TrainingRow[] = []
  let converged = false
  for (let epoch = 1; epoch <= maxEpochs && !converged; epoch++) {
    let errors = 0
    for (const pt of OR_DATA) {
      const net = w1 * pt.x1 + w2 * pt.x2 + bias
      const yHat = stepFn(net)
      const error = pt.y - yHat
      if (error !== 0) errors++
      const dw1 = lr * error * pt.x1
      const dw2 = lr * error * pt.x2
      const db = lr * error
      rows.push({
        epoch,
        x1: pt.x1, x2: pt.x2,
        yTrue: pt.y, yHat,
        w1Update: dw1 !== 0 ? `${dw1 > 0 ? '+' : ''}${dw1.toFixed(2)}` : '0',
        w2Update: dw2 !== 0 ? `${dw2 > 0 ? '+' : ''}${dw2.toFixed(2)}` : '0',
        w1: Math.round((w1 + dw1) * 100) / 100,
        w2: Math.round((w2 + dw2) * 100) / 100,
        bias: Math.round((bias + db) * 100) / 100,
      })
      w1 += dw1; w2 += dw2; bias += db
    }
    if (errors === 0) converged = true
  }
  return rows
}

export default function Perceptron() {
  const { t } = useLanguage()
  const [activation, setActivation] = useState<'sigmoid' | 'relu' | 'tanh'>('sigmoid')
  const [epochIdx, setEpochIdx] = useState(0)
  const [lr] = useState(0.3)
  const [maxEpochs] = useState(15)

  const actPoints = useMemo(() => activationPoints(activation), [activation])
  const training = useMemo(() => trainPerceptron(lr, maxEpochs), [lr, maxEpochs])

  // Group by epoch for display
  const epochs = useMemo(() => {
    const grouped: TrainingRow[][] = []
    let current: TrainingRow[] = []
    let lastEpoch = 0
    for (const row of training) {
      if (row.epoch !== lastEpoch) {
        if (current.length > 0) grouped.push(current)
        current = [row]
        lastEpoch = row.epoch
      } else {
        current.push(row)
      }
    }
    if (current.length > 0) grouped.push(current)
    return grouped
  }, [training])

  const currentEpochRows = epochs[Math.min(epochIdx, epochs.length - 1)] ?? []
  const converged = epochs.length <= maxEpochs
  const lastRow = training[training.length - 1]

  // For SVG weight diagram
  const w1Display = lastRow ? lastRow.w1.toFixed(2) : '0.10'
  const w2Display = lastRow ? lastRow.w2.toFixed(2) : '0.10'
  const biasDisplay = lastRow ? lastRow.bias.toFixed(2) : '0.00'

  return (
    <section id="perceptron" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('percTitle')}</h2>
          <p className="text-zinc-400 text-sm">{t('percSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activation function plot */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-400">{t('percActivation')}</p>
              <div className="flex gap-2">
                {(['sigmoid', 'relu', 'tanh'] as const).map(fn => (
                  <button
                    key={fn}
                    onClick={() => setActivation(fn)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${activation === fn ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-200'}`}
                  >{fn}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={actPoints} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="x" type="number" domain={[-5, 5]} tick={{ fill: '#71717a', fontSize: 10 }} tickCount={6} />
                <YAxis domain={activation === 'relu' ? [0, 5] : [-1.2, 1.2]} tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <ReferenceLine y={0} stroke="#3f3f46" />
                <ReferenceLine x={0} stroke="#3f3f46" />
                <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weight diagram SVG */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-400 mb-3">{t('percWeights')} (after training)</p>
            <svg viewBox="0 0 320 200" className="w-full h-[220px]">
              {/* Input nodes */}
              <circle cx="60" cy="60" r="22" fill="#27272a" stroke="#3f3f46" strokeWidth="1.5" />
              <text x="60" y="64" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">x₁</text>

              <circle cx="60" cy="130" r="22" fill="#27272a" stroke="#3f3f46" strokeWidth="1.5" />
              <text x="60" y="134" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">x₂</text>

              <circle cx="60" cy="180" r="18" fill="#1c1c20" stroke="#3f3f46" strokeWidth="1" />
              <text x="60" y="184" textAnchor="middle" fill="#52525b" fontSize="11" fontFamily="monospace">b</text>

              {/* Output node */}
              <circle cx="260" cy="100" r="28" fill="#1e1b2e" stroke="#8b5cf6" strokeWidth="2" />
              <text x="260" y="96" textAnchor="middle" fill="#a78bfa" fontSize="12" fontFamily="monospace">Σ</text>
              <text x="260" y="112" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">→ ŷ</text>

              {/* Connections */}
              <line x1="82" y1="60" x2="232" y2="95" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
              <line x1="82" y1="130" x2="232" y2="105" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
              <line x1="78" y1="178" x2="232" y2="108" stroke="#52525b" strokeWidth="1" opacity="0.5" strokeDasharray="3 2" />

              {/* Weight labels */}
              <rect x="120" y="48" width="54" height="16" rx="3" fill="#18181b" />
              <text x="147" y="60" textAnchor="middle" fill="#a78bfa" fontSize="11" fontFamily="monospace">w₁={w1Display}</text>

              <rect x="120" y="105" width="54" height="16" rx="3" fill="#18181b" />
              <text x="147" y="117" textAnchor="middle" fill="#a78bfa" fontSize="11" fontFamily="monospace">w₂={w2Display}</text>

              <rect x="120" y="148" width="48" height="16" rx="3" fill="#18181b" />
              <text x="144" y="160" textAnchor="middle" fill="#52525b" fontSize="11" fontFamily="monospace">b={biasDisplay}</text>
            </svg>
          </div>
        </div>

        {/* Epoch-by-epoch training table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium text-zinc-400">{t('percEpochs')}: <span className="text-violet-400 font-bold">{epochIdx + 1}</span> / {epochs.length}</p>
              <input
                type="range" min={0} max={Math.max(0, epochs.length - 1)} value={epochIdx}
                onChange={e => setEpochIdx(Number(e.target.value))}
                className="accent-violet-500 w-36"
              />
            </div>
            {converged && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {t('percConvergence')} in {epochs.length} epochs
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-2 pr-4">x₁</th>
                  <th className="text-left py-2 pr-4">x₂</th>
                  <th className="text-left py-2 pr-4">y_true</th>
                  <th className="text-left py-2 pr-4">ŷ</th>
                  <th className="text-left py-2 pr-4">Δw₁</th>
                  <th className="text-left py-2 pr-4">Δw₂</th>
                  <th className="text-left py-2 pr-4">w₁</th>
                  <th className="text-left py-2 pr-4">w₂</th>
                  <th className="text-left py-2">bias</th>
                </tr>
              </thead>
              <tbody>
                {currentEpochRows.map((row, i) => (
                  <tr key={i} className={`border-b border-zinc-800/50 ${row.yTrue !== row.yHat ? 'text-rose-400' : 'text-zinc-400'}`}>
                    <td className="py-1.5 pr-4">{row.x1}</td>
                    <td className="py-1.5 pr-4">{row.x2}</td>
                    <td className="py-1.5 pr-4">{row.yTrue}</td>
                    <td className="py-1.5 pr-4">{row.yHat}</td>
                    <td className={`py-1.5 pr-4 ${row.w1Update !== '0' ? 'text-violet-400' : ''}`}>{row.w1Update}</td>
                    <td className={`py-1.5 pr-4 ${row.w2Update !== '0' ? 'text-violet-400' : ''}`}>{row.w2Update}</td>
                    <td className="py-1.5 pr-4 text-zinc-300">{row.w1}</td>
                    <td className="py-1.5 pr-4 text-zinc-300">{row.w2}</td>
                    <td className="py-1.5 text-zinc-300">{row.bias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-zinc-600 text-xs mt-2 italic">Red rows = misclassified (weight update applied). Violet = non-zero weight delta.</p>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400 leading-relaxed">
          <span className="text-violet-400 font-medium">How it works:</span> The perceptron update rule: <code className="text-violet-300 text-xs bg-zinc-800 px-1.5 py-0.5 rounded">Δwᵢ = η × (y − ŷ) × xᵢ</code>.
          Weights only change when the prediction is wrong. For linearly separable data (like OR gate) it is <strong className="text-zinc-300">guaranteed to converge</strong>.
          For non-linearly separable data (like XOR) it will never converge — that is exactly why we need hidden layers (MLP).
        </div>
      </motion.div>
    </section>
  )
}
