// SPDX-License-Identifier: Apache-2.0
// Pure TypeScript ML utilities — no React, no external libs

function lcg(seed: number) {
  let s = seed
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff }
}

export function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, ai, i) => sum + (ai - b[i]) ** 2, 0))
}

export function generateTwoBlobs(n: number, seed: number): { x: number; y: number; label: number }[] {
  const rand = lcg(seed)
  const points: { x: number; y: number; label: number }[] = []
  for (let i = 0; i < n; i++) {
    const label = i < n / 2 ? 0 : 1
    const cx = label === 0 ? -2 : 2
    const cy = label === 0 ? -1 : 1
    // Box-Muller for normal distribution
    const u1 = Math.max(rand(), 1e-10)
    const u2 = rand()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const z2 = Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-10))) * Math.cos(2 * Math.PI * rand())
    points.push({ x: cx + z * 1.2, y: cy + z2 * 1.2, label })
  }
  return points
}

export function generateXORData(n: number, seed: number): { x: number; y: number; label: number }[] {
  const rand = lcg(seed)
  const points: { x: number; y: number; label: number }[] = []
  for (let i = 0; i < n; i++) {
    const quadrant = i % 4
    // Q1: (+,+) label=0, Q2: (-,+) label=1, Q3: (-,-) label=0, Q4: (+,-) label=1
    const sx = quadrant === 0 || quadrant === 3 ? 1 : -1
    const sy = quadrant === 0 || quadrant === 1 ? 1 : -1
    const label = quadrant === 0 || quadrant === 2 ? 0 : 1
    const x = sx * (1.0 + rand() * 1.5)
    const y = sy * (1.0 + rand() * 1.5)
    points.push({ x, y, label })
  }
  return points
}

export function knnPredict(
  train: { x: number; y: number; label: number }[],
  query: { x: number; y: number },
  k: number
): number {
  const distances = train.map((pt, idx) => ({
    idx,
    dist: euclidean([pt.x, pt.y], [query.x, query.y]),
  }))
  distances.sort((a, b) => a.dist - b.dist)
  const neighbors = distances.slice(0, k)
  const votes = neighbors.reduce((acc, { idx }) => {
    acc[train[idx].label] = (acc[train[idx].label] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  return Number(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0])
}

export function knnAccuracy(data: { x: number; y: number; label: number }[], k: number): number {
  let correct = 0
  for (let i = 0; i < data.length; i++) {
    const train = data.filter((_, idx) => idx !== i)
    const pred = knnPredict(train, data[i], k)
    if (pred === data[i].label) correct++
  }
  return correct / data.length
}

export function knnAccuracyCurve(
  data: { x: number; y: number; label: number }[],
  maxK: number
): { k: number; accuracy: number }[] {
  const results: { k: number; accuracy: number }[] = []
  for (let k = 1; k <= maxK; k++) {
    results.push({ k, accuracy: Math.round(knnAccuracy(data, k) * 1000) / 1000 })
  }
  return results
}

export function sigmoidActivation(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

export function reluActivation(x: number): number {
  return Math.max(0, x)
}

export function tanhActivation(x: number): number {
  return Math.tanh(x)
}

export function activationPoints(fn: 'sigmoid' | 'relu' | 'tanh'): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < 100; i++) {
    const x = -5 + (i / 99) * 10
    let y: number
    if (fn === 'sigmoid') y = sigmoidActivation(x)
    else if (fn === 'relu') y = reluActivation(x)
    else y = tanhActivation(x)
    points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 1000) / 1000 })
  }
  return points
}

export function simulateMLPTraining(
  hiddenUnits: number,
  epochs: number,
  seed: number
): { epoch: number; trainLoss: number; valLoss: number }[] {
  const rand = lcg(seed)
  const results: { epoch: number; trainLoss: number; valLoss: number }[] = []
  const speedFactor = hiddenUnits / 32
  for (let ep = 1; ep <= epochs; ep++) {
    const effectiveEp = ep * speedFactor
    const noise1 = (rand() - 0.5) * 0.02
    const noise2 = (rand() - 0.5) * 0.025
    const trainLoss = 0.7 * Math.exp(-effectiveEp / 40) + 0.05 + noise1
    const valLoss = 0.7 * Math.exp(-effectiveEp / 50) + 0.08 + noise2
    results.push({
      epoch: ep,
      trainLoss: Math.max(0.03, Math.round(trainLoss * 10000) / 10000),
      valLoss: Math.max(0.05, Math.round(valLoss * 10000) / 10000),
    })
  }
  return results
}

export function svmMarginData(C: number): {
  support: { x: number; y: number }[]
  margin: number
  class0: { x: number; y: number }[]
  class1: { x: number; y: number }[]
} {
  const rand = lcg(42)
  const class0: { x: number; y: number }[] = []
  const class1: { x: number; y: number }[] = []

  // Margin width inversely proportional to C (soft vs hard margin)
  // At C=0.1: wide margin ~2.5, At C=10: narrow margin ~0.4
  const margin = Math.max(0.3, 2.5 / (1 + C * 0.8))

  // Generate class 0 below y = -margin/2, class 1 above y = margin/2
  for (let i = 0; i < 20; i++) {
    const x = (rand() - 0.5) * 6
    const y = -(margin / 2) - rand() * 2.5
    class0.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
  }
  for (let i = 0; i < 20; i++) {
    const x = (rand() - 0.5) * 6
    const y = (margin / 2) + rand() * 2.5
    class1.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
  }

  // Support vectors: points closest to decision boundary
  // Number inversely proportional to C: low C = many SVs, high C = few SVs
  const svCount = Math.max(2, Math.round(8 / (1 + C * 0.5)))
  const support: { x: number; y: number }[] = []
  for (let i = 0; i < svCount; i++) {
    const x = (rand() - 0.5) * 5
    const side = i % 2 === 0 ? 1 : -1
    const y = side * (margin / 2 + 0.05 + rand() * 0.15)
    support.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
  }

  return { support, margin: Math.round(margin * 100) / 100, class0, class1 }
}
