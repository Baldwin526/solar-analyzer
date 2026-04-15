import { useState } from 'react'
import StepOne from './components/StepOne'
import StepTwo from './components/StepTwo'
import Results from './components/Results'
import PitchAnalyzer from './components/PitchAnalyzer'
import ContractAnalyzer from './components/ContractAnalyzer'
import About from './components/About'
import KnowYourRights from './components/KnowYourRights'
import FAQ from './components/FAQ'
import { fetchStateElectricityRate } from './utils/eiaApi'
import './App.css'

const STORAGE_KEY = 'sqa_session'

const INITIAL_DATA = {
  // Step 1 — Pricing
  companyName: '',
  systemSize: '',
  totalPrice: '',
  financialStructure: '',
  monthlySavings: '',
  contractLength: '',
  // Step 1 — Equipment
  panelBrand: '',
  inverterType: '',
  panelWarranty: '',
  inverterWarranty: '',
  workmanshipWarranty: '',
  // Step 1 — Contract Terms
  hasEscalator: '',
  escalatorPct: '',
  hasBattery: '',
  // Step 1 — Incentives
  incentives: [],
  // Step 2
  state: '',
  zipCode: '',
  monthlyBill: '',
  roofOrientation: '',
  shadingLevel: '',
  roofAge: '',
  roofType: '',
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession(data, utilityRate) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, utilityRate }))
  } catch {
    // Storage quota exceeded or private-browsing restriction — fail silently
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function initState() {
  const saved = loadSession()
  if (saved?.data && saved?.utilityRate) {
    return {
      step: 3,
      data: { ...INITIAL_DATA, ...saved.data },
      utilityRate: saved.utilityRate,
      isRestored: true,
    }
  }
  return { step: 1, data: INITIAL_DATA, utilityRate: null, isRestored: false }
}

export default function App() {
  const initial = initState()
  const [tab, setTab]   = useState('analyzer')
  const [step, setStep] = useState(initial.step)
  const [data, setData] = useState(initial.data)
  const [utilityRate, setUtilityRate] = useState(initial.utilityRate)
  const [isRestored, setIsRestored] = useState(initial.isRestored)

  function updateData(fields) {
    setData(prev => ({ ...prev, ...fields }))
  }

  async function handleAnalyze() {
    setStep(3)
    setIsRestored(false)
    setUtilityRate({ loading: true })

    const rate = await fetchStateElectricityRate(data.state)
    const resolvedRate = { ...rate, loading: false }
    setUtilityRate(resolvedRate)

    // Persist both form data and resolved rate so a refresh restores the full results
    saveSession(data, resolvedRate)
  }

  function reset() {
    clearSession()
    setData(INITIAL_DATA)
    setUtilityRate(null)
    setIsRestored(false)
    setStep(1)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <svg className="logo-mark" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L3 8.5v12c0 9.5 6.5 17.5 15 19.5 8.5-2 15-10 15-19.5v-12L18 2z" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="18" cy="19" r="5" fill="#f59e0b"/>
              <line x1="18" y1="10" x2="18" y2="8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="18" y1="30" x2="18" y2="28" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="19" x2="7" y2="19" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="29" y1="19" x2="27" y2="19" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="11.9" y1="12" x2="10.5" y2="10.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="25.5" y1="27.5" x2="24.1" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="24.1" y1="12" x2="25.5" y2="10.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10.5" y1="27.5" x2="11.9" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="logo-text-group">
              <span className="logo-text">SolarShield<sup className="logo-tm">™</sup></span>
            </div>
          </div>
          <nav className="header-nav">
            <button
              className={`header-nav-tab ${tab === 'analyzer' ? 'active' : ''}`}
              onClick={() => setTab('analyzer')}
            >
              Quote Analyzer
            </button>
            <button
              className={`header-nav-tab ${tab === 'pitch' ? 'active' : ''}`}
              onClick={() => setTab('pitch')}
            >
              Pitch Analyzer
            </button>
            <button
              className={`header-nav-tab ${tab === 'contract' ? 'active' : ''}`}
              onClick={() => setTab('contract')}
            >
              Contract Analyzer
            </button>
            <button
              className={`header-nav-tab ${tab === 'rights' ? 'active' : ''}`}
              onClick={() => setTab('rights')}
            >
              Know Your Rights
            </button>
            <button
              className={`header-nav-tab ${tab === 'faq' ? 'active' : ''}`}
              onClick={() => setTab('faq')}
            >
              FAQ
            </button>
            <button
              className={`header-nav-tab ${tab === 'about' ? 'active' : ''}`}
              onClick={() => setTab('about')}
            >
              About
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'analyzer' && (
          <>
            {step < 3 && (
              <div className="stepper">
                <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                  <label>Quote Details</label>
                </div>
                <div className={`step-line ${step >= 2 ? 'filled' : ''}`} />
                <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                  <label>Home Info</label>
                </div>
                <div className={`step-line ${step >= 3 ? 'filled' : ''}`} />
                <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
                  <span>✓</span>
                  <label>Results</label>
                </div>
              </div>
            )}
            <div className="card">
              {step === 1 && (
                <StepOne data={data} onChange={updateData} onNext={() => setStep(2)} />
              )}
              {step === 2 && (
                <StepTwo data={data} onChange={updateData} onNext={handleAnalyze} onBack={() => setStep(1)} />
              )}
              {step === 3 && (
                <Results
                  data={data}
                  utilityRate={utilityRate}
                  isRestored={isRestored}
                  onReset={reset}
                />
              )}
            </div>
          </>
        )}

        {tab === 'pitch' && (
          <div className="card">
            <PitchAnalyzer />
          </div>
        )}

        {tab === 'contract' && (
          <div className="card">
            <ContractAnalyzer />
          </div>
        )}

        {tab === 'faq' && (
          <div className="card">
            <FAQ onNavigate={setTab} />
          </div>
        )}

        {tab === 'rights' && (
          <div className="card">
            <KnowYourRights onNavigate={setTab} />
          </div>
        )}

        {tab === 'about' && (
          <div className="card">
            <About onNavigate={setTab} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-brand">
          <span className="footer-brand-icon">☀</span>
          <span className="footer-brand-text">SolarShield</span>
        </div>
        <div className="footer-divider" />
        <div className="disclaimer">
          <p>
            This tool is for informational purposes only and does not constitute legal, financial, or professional advice.
            Results are based on national benchmarks and may not reflect local market conditions.
            Always consult a licensed professional before signing any solar contract.
          </p>
          <p>
            Net metering policies change frequently. Always verify your state's current policy at{' '}
            <a href="https://www.dsire.org" target="_blank" rel="noopener noreferrer">dsire.org</a>{' '}
            before signing any solar contract.
          </p>
          <p className="disclaimer-verified">Data last verified: April 2026</p>
        </div>
      </footer>
    </div>
  )
}
