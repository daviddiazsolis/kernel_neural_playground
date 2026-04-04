// SPDX-License-Identifier: Apache-2.0
import { useEffect, useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import TranslationWidget from './components/TranslationWidget'
import Hero from './components/Hero'
import KNN from './components/KNN'
import SVM from './components/SVM'
import Perceptron from './components/Perceptron'
import MLP from './components/MLP'
import References from './components/References'
import NotebooksSection from './components/NotebooksSection'
import Footer from './components/Footer'

const SECTIONS = [
  { id: 'knn', navKey: 'navKNN' },
  { id: 'svm', navKey: 'navSVM' },
  { id: 'perceptron', navKey: 'navPerceptron' },
  { id: 'mlp', navKey: 'navMLP' },
] as const

function SectionNav() {
  const { t } = useLanguage()
  const [active, setActive] = useState('knn')
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(id) }, { rootMargin: '-30% 0px -60% 0px' })
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])
  return (
    <nav className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto py-2 pl-28">
        {SECTIONS.map(({ id, navKey }) => (
          <a key={id} href={`#${id}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${active === id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 hover:text-zinc-200'}`}>
            {t(navKey)}
          </a>
        ))}
      </div>
    </nav>
  )
}

function AppInner() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <TranslationWidget />
      <Hero />
      <SectionNav />
      <main>
        <KNN />
        <SVM />
        <Perceptron />
        <MLP />
        <NotebooksSection />
        <References />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  )
}
