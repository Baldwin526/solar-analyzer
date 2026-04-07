import { useState } from 'react'
import { analyzePitch, RED } from '../utils/pitchAnalysis'

const CHECKLIST_ITEMS = [
  { id: 'decide_today',       label: 'They said I had to decide today' },
  { id: 'tax_credit',         label: 'They mentioned a tax credit or government program' },
  { id: 'utility_sent',       label: 'They said the utility company sent them or is involved' },
  { id: 'sign_before_spouse', label: 'They asked me to sign before my spouse could review it' },
  { id: 'roof_perfect',       label: 'They said my roof was perfect / I was pre-qualified' },
  { id: 'neighbors',          label: 'They referenced my neighbors already signing up' },
  { id: 'thirty_pct',         label: 'They mentioned a 30% tax credit' },
  { id: 'no_money_out',       label: "They said there's no money out of pocket" },
  { id: 'bill_swap',          label: 'They used "bill swap" or "own your power vs rent your power"' },
  { id: 'power_bill',         label: 'They asked for my power bill during the visit' },
  { id: 'government_backed',  label: 'They said the program is government-backed' },
  { id: 'qualify',            label: 'They said I have to qualify (used scarcity / exclusivity)' },
]

const NEXT_STEPS = [
  { icon: '📋', text: 'Get at least 3 competing quotes from different installers before making any decision.' },
  { icon: '🚫', text: 'Never sign a solar contract the same day you received the pitch — regardless of any deadline pressure.' },
  { icon: '⚖️', text: 'Have a lawyer or trusted financial advisor review any contract before signing, especially for leases or PPAs.' },
  { icon: '🏛', text: "Verify the company's contractor license with your state licensing board — ask for the license number directly." },
  { icon: '⭐', text: 'Check the company on BBB.org and Google Reviews. Look for complaint patterns, not just the overall rating.' },
  { icon: '🔍', text: 'Verify any tax credit or incentive claims independently at IRS.gov or with a tax professional — never rely on a salesperson.' },
]

const RISK_ICON = { red: '🔴', yellow: '🟡', green: '🟢' }

function TacticItem({ tactic }) {
  const [open, setOpen] = useState(tactic.severity === RED)

  return (
    <div className="pitch-tactic-item">
      <div className="pitch-tactic-header" onClick={() => setOpen(o => !o)}>
        <div className="pitch-tactic-left">
          <div className={`score-dot ${tactic.severity === RED ? 'red' : 'yellow'}`} />
          <span className="pitch-tactic-name">{tactic.name}</span>
        </div>
        <div className="pitch-tactic-right">
          <span className={`score-badge ${tactic.severity === RED ? 'red' : 'yellow'}`}>
            {tactic.severity === RED ? '✕ Red Flag' : '⚠ Caution'}
          </span>
          <span className={`score-chevron ${open ? 'open' : ''}`}>▾</span>
        </div>
      </div>
      {open && (
        <div className="score-detail">
          <p className="pitch-tactic-summary">{tactic.summary}</p>
          <p>{tactic.detail}</p>
        </div>
      )}
    </div>
  )
}

export default function PitchAnalyzer() {
  const [text, setText]               = useState('')
  const [checkedItems, setCheckedItems] = useState([])
  const [results, setResults]         = useState(null)

  function toggleItem(id) {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function handleAnalyze() {
    setResults(analyzePitch(text, checkedItems))
  }

  function handleReset() {
    setText('')
    setCheckedItems([])
    setResults(null)
  }

  const canAnalyze = checkedItems.length > 0 || text.trim().length > 20

  return (
    <div>
      <div className="form-header">
        <h2>Sales Pitch Analyzer</h2>
        <p>Describe what the solar salesperson said and check off any tactics they used. We'll identify common manipulation techniques so you can make a fully informed decision.</p>
      </div>

      {/* ── Input section ─────────────────────────────────────────── */}
      {!results && (
        <>
          <div className="pitch-input-section">
            <label className="pitch-textarea-label">
              Describe the pitch in your own words
              <span className="pitch-label-optional">optional</span>
            </label>
            <textarea
              className="pitch-textarea"
              placeholder="Describe what the salesperson said — their opening, what they promised, how the conversation felt, any pressure they used. The more detail, the better our analysis."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
            />
            <span className="field-hint">The checklist below is enough — free text improves accuracy</span>
          </div>

          <div className="pitch-checklist-section">
            <div className="pitch-checklist-label">Check everything that applies to your experience</div>
            <div className="checkbox-group">
              {CHECKLIST_ITEMS.map(item => (
                <label
                  key={item.id}
                  className={`checkbox-item ${checkedItems.includes(item.id) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pitch-analyze-action">
            <button
              className="btn btn-primary btn-next"
              disabled={!canAnalyze}
              onClick={handleAnalyze}
            >
              <span>Analyze This Pitch</span>
              <span className="btn-next-arrow">→</span>
            </button>
            {!canAnalyze && (
              <p className="pitch-action-hint">Check at least one box above, or describe the pitch in the text area</p>
            )}
          </div>
        </>
      )}

      {/* ── Results ───────────────────────────────────────────────── */}
      {results && (
        <div>
          {/* Risk banner */}
          {results.risk && (
            <div className={`score-overall ${results.risk.color}`}>
              <div className="overall-icon">{RISK_ICON[results.risk.color]}</div>
              <div>
                <div className="overall-label">Pitch Risk Level — {results.risk.level}</div>
                <div className="overall-title">{results.risk.headline}</div>
                <div className="overall-desc">{results.risk.description}</div>
              </div>
            </div>
          )}

          {/* Detected tactics */}
          {results.detected.length > 0 ? (
            <div className="pitch-tactics-section">
              <div className="pitch-section-header">
                <span className="pitch-section-title">Tactics Detected</span>
                <span className="pitch-tactic-counts">
                  {results.redCount > 0 && (
                    <span className="pitch-count-chip red">
                      {results.redCount} red flag{results.redCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {results.yellowCount > 0 && (
                    <span className="pitch-count-chip yellow">
                      {results.yellowCount} caution{results.yellowCount > 1 ? 's' : ''}
                    </span>
                  )}
                </span>
              </div>
              <div className="pitch-tactics-list">
                {results.detected.map(t => <TacticItem key={t.id} tactic={t} />)}
              </div>
            </div>
          ) : (
            <div className="pitch-no-tactics">
              No specific manipulation tactics were detected based on what you described. Still review the next steps below.
            </div>
          )}

          {/* What to do next */}
          <div className="pitch-next-steps">
            <div className="pitch-section-title">What To Do Next</div>
            <div className="pitch-steps-list">
              {NEXT_STEPS.map((step, i) => (
                <div key={i} className="pitch-step-item">
                  <span className="pitch-step-icon">{step.icon}</span>
                  <span className="pitch-step-text">{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="pitch-disclaimer">
            This tool identifies common sales tactics. Not all tactics indicate a scam — some are standard techniques used across many industries. Use this as a starting point for your own research, not as a definitive verdict.
          </p>

          {/* Actions */}
          <div className="pitch-result-actions">
            <button className="btn btn-outline" onClick={handleReset}>
              ← Analyze Another Pitch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
