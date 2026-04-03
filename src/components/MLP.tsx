// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { simulateMLPTraining, activationPoints } from '../utils/mlUtils'

const tooltipStyle = { contentStyle: { background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11 } }

const HIDDEN_UNIT_OPTIONS = [8, 16, 32, 64]

interface ArchDiagramProps {
  hiddenUnits: number
  activation: string
}

function ArchDiagram({ hiddenUnits, activation }: ArchDiagramProps) {
  const maxVisible = 8
  const display = Math.min(hiddenUnits, maxVisible)
  const extra = hiddenUnits > maxVisible ? hiddenUnits - maxVisible : 0
  const inputNodes = [0, 1]

  const inputY = (i: number) => 30 + i * 60
  const hiddenY = (i: number) => 10 + i * (180 / Math.max(display - 1, 1))
  const outputY = () => 100

  return (
    <svg viewBox="0 0 320 200" className="w-full h-[200px]">
      {/* Input layer */}
      {inputNodes.map(i => (
        <g key={`in-${i}`}>
          <circle cx="40" cy={inputY(i)} r="14" fill="#27272a" stroke="#3f3f46" strokeWidth="1.5" />
          <text x="40" y={inputY(i) + 4} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">x{i + 1}</text>
        </g>
      ))}
      <text x="40" y="185" textAnchor="middle" fill="#52525b" fontSize="9">Input</text>
      <text x="40" y="195" textAnchor="middle" fill="#52525b" fontSize="9">(2)</text>

      {/* Hidden layer connections */}
      {inputNodes.map(i =>
        Array.from({ length: display }).map((_, j) => (
          <line
            key={`conn-${i}-${j}`}
            x1="54" y1={inputY(i)}
            x2="166" y2={hiddenY(j)}
            stroke="#8b5cf6" strokeWidth="0.6" opacity="0.25"
          />
        ))
      )}

      {/* Hidden nodes */}
      {Array.from({ length: display }).map((_, j) => (
        <g key={`h-${j}`}>
          <circle cx="180" cy={hiddenY(j)} r="12" fill="#1e1b2e" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="180" y={hiddenY(j) + 4} textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace">h</text>
        </g>
      ))}
      {extra > 0 && (
        <text x="180" y="192" textAnchor="middle" fill="#6d28d9" fontSize="9">+{extra}</text>
      )}
      <text x="180" y={extra > 0 ? '202' : '192'} textAnchor="middle" fill="#52525b" fontSize="9">
        {activation}
      </text>

      {/* Output connections */}
      {Array.from({ length: display }).map((_, j) => (
        <line
          key={`out-conn-${j}`}
          x1="192" y1={hiddenY(j)}
          x2="266" y2={outputY()}
          stroke="#8b5cf6" strokeWidth="0.6" opacity="0.25"
        />
      ))}

      {/* Output node */}
      <circle cx="280" cy={outputY()} r="16" fill="#1e1b2e" stroke="#8b5cf6" strokeWidth="2" />
      <text x="280" y={outputY() + 4} textAnchor="middle" fill="#a78bfa" fontSize="10" fontFamily="monospace">ŷ</text>
      <text x="280" y="185" textAnchor="middle" fill="#52525b" fontSize="9">Output</text>
      <text x="280" y="195" textAnchor="middle" fill="#52525b" fontSize="9">(1)</text>

      {/* Layer labels */}
      <text x="180" y="10" textAnchor="middle" fill="#52525b" fontSize="9">Hidden ({hiddenUnits})</text>
    </svg>
  )
}

export default function MLP() {
  const { t } = useLanguage()
  const [hiddenUnits, setHiddenUnits] = useState(32)
  const [epochs, setEpochs] = useState(100)
  const [activation, setActivation] = useState<'sigmoid' | 'relu' | 'tanh'>('relu')

  const trainingCurve = useMemo(() => simulateMLPTraining(hiddenUnits, epochs, 42), [hiddenUnits, epochs])
  const actPoints = useMemo(() => activationPoints(activation), [activation])

  const finalRow = trainingCurve[trainingCurve.length - 1]

  return (
    <section id="mlp" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{t('mlpTitle')}</h2>
          <p className="text-zinc-400 text-sm">{t('mlpSubtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-6 mb-8 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">{t('mlpHiddenUnits')}</label>
            <div className="flex gap-2">
              {HIDDEN_UNIT_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setHiddenUnits(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${hiddenUnits === n ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-xs font-medium text-zinc-400">{t('mlpEpochs')}: <span className="text-violet-400 font-bold">{epochs}</span></label>
            <input
              type="range" min={10} max={200} step={5} value={epochs}
              onChange={e => setEpochs(Number(e.target.value))}
              className="accent-violet-500 w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-400">{t('mlpActivation')}</label>
            <div className="flex gap-2">
              {(['sigmoid', 'relu', 'tanh'] as const).map(fn => (
                <button
                  key={fn}
                  onClick={() => setActivation(fn)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${activation === fn ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'}`}
                >{fn}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {t('mlpTrainLoss')}: <span className="text-violet-400 font-bold">{finalRow?.trainLoss.toFixed(4)}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              {t('mlpValLoss')}: <span className="text-rose-400 font-bold">{finalRow?.valLoss.toFixed(4)}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Architecture diagram */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-400 mb-3">{t('mlpArchitecture')}</p>
            <ArchDiagram hiddenUnits={hiddenUnits} activation={activation} />
            <p className="text-xs text-zinc-600 mt-2 text-center">
              2 → {hiddenUnits} → 1 | {activation}
            </p>
          </div>

          {/* Training loss chart */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-400 mb-3">Training & Validation Loss</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trainingCurve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="#27272a" />
                <XAxis dataKey="epoch" tick={{ fill: '#71717a', fontSize: 10 }} label={{ value: 'Epoch', position: 'insideRight', fill: '#71717a', fontSize: 10 }} />
                <YAxis domain={[0, 0.8]} tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#71717a' }} />
                <Line type="monotone" dataKey="trainLoss" name={t('mlpTrainLoss')} stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="valLoss" name={t('mlpValLoss')} stroke="#fb7185" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activation function mini-chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <p className="text-xs font-medium text-zinc-400 mb-3">{t('mlpActivation')}: <span className="text-violet-400">{activation}</span></p>
          <ResponsiveContainer width="100%" height={120}>
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

        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400 leading-relaxed">
          <span className="text-violet-400 font-medium">How it works:</span> An MLP stacks multiple layers of perceptrons with non-linear activations.
          More hidden units can learn more complex boundaries, but risk <strong className="text-zinc-300">overfitting</strong> — notice how validation loss plateaus or rises while training loss keeps falling.
          <strong className="text-zinc-300"> ReLU</strong> is preferred in practice (no vanishing gradient), while <strong className="text-zinc-300">sigmoid/tanh</strong> saturate for large inputs.
          The universal approximation theorem guarantees an MLP with enough neurons can approximate any continuous function.
        </div>
      </motion.div>
    </section>
  )
}
