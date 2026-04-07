import { useState } from 'react'
import { analyzeQuote, analyzeCompanyRedFlags, computeOverall, GREEN, YELLOW, RED } from '../analyze'
import CompanyLookup from './CompanyLookup'
import PaybackCalculator from './PaybackCalculator'

const RATING_ICON  = { [GREEN]: '✓', [YELLOW]: '⚠', [RED]: '✕' }
const OVERALL_ICON = { [GREEN]: '🟢', [YELLOW]: '🟡', [RED]: '🔴' }

const STRUCTURE_LABELS = {
  cash: 'Cash Purchase', loan: 'Solar Loan', lease: 'Solar Lease', ppa: 'PPA',
}
const INVERTER_LABELS = {
  string: 'String Inverter', microinverters: 'Microinverters',
  optimizers: 'Power Optimizers', unknown: 'Unknown',
}

function fmt(val) {
  if (!val) return '—'
  return `$${Number(val).toLocaleString()}`
}

// ─── Score item ───────────────────────────────────────────────────────────────
function ScoreItem({ score }) {
  const [open, setOpen] = useState(score.rating !== 'green')
  return (
    <div className="score-item">
      <div className="score-item-header" onClick={() => setOpen(o => !o)}>
        <div className="score-left">
          <div className={`score-dot ${score.rating}`} />
          <span className="score-name">{score.name}</span>
        </div>
        <div className="score-right">
          <span className={`score-badge ${score.rating}`}>
            {RATING_ICON[score.rating]}&nbsp;{score.summary.split('—')[0].trim()}
          </span>
          <span className={`score-chevron ${open ? 'open' : ''}`}>▾</span>
        </div>
      </div>
      {open && (
        <div className="score-detail">
          <p>{score.detail}</p>
          <code className="metric">{score.metric}</code>
        </div>
      )}
    </div>
  )
}

// ─── EIA badge ────────────────────────────────────────────────────────────────
function RateSourceBadge({ utilityRate, state }) {
  if (!utilityRate || utilityRate.loading) return null
  const rateLine = utilityRate.fallback
    ? `National avg: ${utilityRate.rateCents.toFixed(1)}¢/kWh (fallback)`
    : `${state} avg: ${utilityRate.rateCents.toFixed(1)}¢/kWh${utilityRate.period ? ` (${utilityRate.period})` : ''}`
  return (
    <div className="eia-badge">
      <span className="eia-icon">⚡</span>
      <div className="eia-text">
        <span className="eia-rate">{rateLine}</span>
        <span className="eia-source">
          Utility rate data: U.S. Energy Information Administration
          {utilityRate.fallback && ' — live fetch failed, using national average'}
        </span>
      </div>
    </div>
  )
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
function QiCell({ label, value, editValue, isEditing, field, onEdit, type = 'number', suffix = '' }) {
  return (
    <div className="quote-info-item">
      <span className="qi-label">{label}</span>
      {isEditing ? (
        <input
          className="qi-input"
          type={type}
          value={editValue}
          onChange={e => onEdit(field, e.target.value)}
          min={0}
          step={type === 'number' ? 'any' : undefined}
        />
      ) : (
        <span className="qi-value">{value}{suffix}</span>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Results({ data, utilityRate, isRestored, onReset }) {
  const [redFlags, setRedFlags] = useState([])

  // localData is the confirmed source of truth for analysis (may differ from prop after edits)
  const [localData, setLocalData] = useState(data)
  const [editData,  setEditData]  = useState(data)
  const [isEditing, setIsEditing] = useState(false)
  // Bump this key to remount PaybackCalculator (resets sliders to new defaults)
  const [pbKey, setPbKey] = useState(0)

  const isLoading  = utilityRate?.loading === true
  // During editing, analysis uses the live editData so changes recalculate instantly
  const activeData = isEditing ? editData : localData

  function toggleFlag(id) {
    setRedFlags(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  function startEdit() {
    setEditData({ ...localData })
    setIsEditing(true)
  }

  function cancelEdit() {
    setEditData({ ...localData })
    setIsEditing(false)
  }

  function confirmEdit() {
    setLocalData({ ...editData })
    setPbKey(k => k + 1)   // reset PaybackCalculator sliders to new defaults
    setIsEditing(false)
  }

  function handleFieldEdit(field, value) {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const { scores: baseScores } = analyzeQuote(activeData, isLoading ? null : utilityRate)
  const redFlagScore = analyzeCompanyRedFlags(redFlags)
  const allScores    = [...baseScores, redFlagScore]
  const overall      = computeOverall(allScores)

  const costPerWatt = (
    parseFloat(activeData.totalPrice) / (parseFloat(activeData.systemSize) * 1000)
  ).toFixed(2)
  const showContract = activeData.financialStructure && activeData.financialStructure !== 'cash'

  return (
    <div>
      {isRestored && (
        <div className="restored-notice">
          <span className="restored-icon">⟳</span>
          <span>Showing your last saved quote</span>
          <button className="restored-dismiss btn btn-ghost" onClick={onReset}>
            Start New Quote
          </button>
        </div>
      )}

      {/* Results header + Edit button */}
      <div className="results-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>Analysis Results</h2>
          <p>
            Quote from <strong style={{ color: 'var(--text-heading)' }}>{activeData.companyName}</strong>
            {' '}· {activeData.systemSize} kW system
          </p>
        </div>
        {!isEditing && (
          <button className="btn btn-ghost" style={{ fontSize: '13px', marginTop: '4px' }} onClick={startEdit}>
            ✎ Edit Quote
          </button>
        )}
      </div>

      {/* Quote summary strip */}
      <div className="results-quote-info">
        <QiCell
          label="Total Price"
          value={fmt(localData.totalPrice)}
          editValue={editData.totalPrice}
          isEditing={isEditing}
          field="totalPrice"
          onEdit={handleFieldEdit}
        />
        <QiCell
          label="System Size (kW)"
          value={`${localData.systemSize} kW`}
          editValue={editData.systemSize}
          isEditing={isEditing}
          field="systemSize"
          onEdit={handleFieldEdit}
        />
        <div className="quote-info-item">
          <span className="qi-label">Cost/Watt</span>
          <span className="qi-value">${isNaN(costPerWatt) ? '—' : costPerWatt}/W</span>
        </div>
        <div className="quote-info-item">
          <span className="qi-label">Structure</span>
          <span className="qi-value">{STRUCTURE_LABELS[activeData.financialStructure]}</span>
        </div>
        {showContract && (
          <QiCell
            label="Term (years)"
            value={`${localData.contractLength} years`}
            editValue={editData.contractLength}
            isEditing={isEditing}
            field="contractLength"
            onEdit={handleFieldEdit}
          />
        )}
        <QiCell
          label="Monthly Savings"
          value={`${fmt(localData.monthlySavings)}/mo`}
          editValue={editData.monthlySavings}
          isEditing={isEditing}
          field="monthlySavings"
          onEdit={handleFieldEdit}
        />
        <div className="quote-info-item">
          <span className="qi-label">Your Bill</span>
          <span className="qi-value">{fmt(activeData.monthlyBill)}/mo</span>
        </div>
        <div className="quote-info-item">
          <span className="qi-label">State</span>
          <span className="qi-value">{activeData.state}</span>
        </div>
        {activeData.panelBrand && (
          <div className="quote-info-item">
            <span className="qi-label">Panels</span>
            <span className="qi-value">{activeData.panelBrand}</span>
          </div>
        )}
        {activeData.inverterType && (
          <div className="quote-info-item">
            <span className="qi-label">Inverter</span>
            <span className="qi-value">{INVERTER_LABELS[activeData.inverterType] || '—'}</span>
          </div>
        )}
        {activeData.hasBattery && (
          <div className="quote-info-item">
            <span className="qi-label">Battery</span>
            <span className="qi-value">{activeData.hasBattery === 'yes' ? 'Included' : 'Not included'}</span>
          </div>
        )}
        {activeData.hasEscalator === 'yes' && (
          <QiCell
            label="Escalator"
            value={`${localData.escalatorPct}%/yr`}
            editValue={editData.escalatorPct}
            isEditing={isEditing}
            field="escalatorPct"
            onEdit={handleFieldEdit}
            suffix="/yr"
          />
        )}
      </div>

      {/* Edit mode action row */}
      {isEditing && (
        <div className="edit-mode-actions">
          <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmEdit}>Recalculate ↻</button>
        </div>
      )}

      {/* EIA rate badge */}
      {isLoading ? (
        <div className="eia-badge eia-loading">
          <span className="eia-spinner" />
          <span className="eia-rate">Fetching {activeData.state} utility rate from EIA…</span>
        </div>
      ) : (
        <RateSourceBadge utilityRate={utilityRate} state={activeData.state} />
      )}

      {/* Company lookup */}
      <CompanyLookup
        companyName={activeData.companyName}
        state={activeData.state}
        redFlags={redFlags}
        onToggleFlag={toggleFlag}
      />

      {/* Overall verdict */}
      <div className={`score-overall ${overall.rating}`}>
        <div className="overall-icon">{OVERALL_ICON[overall.rating]}</div>
        <div>
          <div className="overall-label">Overall Assessment</div>
          <div className="overall-title">{overall.title}</div>
          <div className="overall-desc">{overall.description}</div>
        </div>
      </div>

      {/* Scorecard */}
      <div className="scorecard">
        {allScores.map(score => (
          <ScoreItem key={score.name} score={score} />
        ))}
      </div>

      {/* Payback analysis */}
      {!isLoading && (
        <PaybackCalculator key={pbKey} data={activeData} utilityRate={utilityRate} />
      )}

      <div className="results-actions">
        <button className="btn btn-outline" onClick={onReset}>
          ← Start New Quote
        </button>
      </div>
    </div>
  )
}
