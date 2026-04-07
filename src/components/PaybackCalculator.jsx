import { useState } from 'react'

const ORIENTATION_FACTOR = {
  south: 1.00, southeast: 0.93, southwest: 0.93,
  east:  0.85, west: 0.85, north: 0.75, unknown: 0.90,
}
const SHADING_FACTOR = {
  none: 1.00, minimal: 0.97, moderate: 0.85, heavy: 0.70,
}

const BASE_HOURS   = 1_400
const TIMELINE_MAX = 25

function dollars(n) {
  return `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
function pct(n, d = 1) { return `${n.toFixed(d)}%` }

// ─── Break-even with compounding rate escalation ──────────────────────────────
function calcBreakEven(price, annualKwh, ratePerKwh, annualRateIncreasePct) {
  if (annualKwh <= 0 || ratePerKwh <= 0) return Infinity
  const ri = annualRateIncreasePct / 100
  let cum = 0
  for (let yr = 1; yr <= 50; yr++) {
    const savings = annualKwh * ratePerKwh * Math.pow(1 + ri, yr - 1)
    const prev = cum
    cum += savings
    if (cum >= price) return yr - 1 + (price - prev) / savings
  }
  return Infinity
}

function calc25YrNet(price, annualKwh, ratePerKwh, annualRateIncreasePct) {
  const ri = annualRateIncreasePct / 100
  let total = 0
  for (let yr = 1; yr <= 25; yr++) {
    total += annualKwh * ratePerKwh * Math.pow(1 + ri, yr - 1)
  }
  return total - price
}

// ─── Timeline bar ─────────────────────────────────────────────────────────────
function TimelineBar({ breakEvenYears, rating }) {
  const finite  = isFinite(breakEvenYears)
  const capped  = Math.min(finite ? breakEvenYears : TIMELINE_MAX, TIMELINE_MAX)
  const fillPct = (capped / TIMELINE_MAX) * 100
  const ticks   = [0, 5, 10, 15, 20, 25]

  const markerColor =
    rating === 'red'    ? 'var(--red)'    :
    rating === 'yellow' ? 'var(--yellow)' : 'var(--green)'

  return (
    <div className="pb-timeline">
      <div className="pb-timeline-header">
        <span className="pb-timeline-title">Break-Even Timeline (years)</span>
        <span className="pb-timeline-note">25-year panel warranty period</span>
      </div>
      <div className="pb-track-wrap">
        <div className="pb-track-fill" style={{ width: `${fillPct}%`, background: markerColor, opacity: 0.18 }} />
        <div className="pb-marker" style={{ left: `${fillPct}%` }}>
          <div className="pb-marker-flag" style={{ background: markerColor }}>
            {!finite ? `${TIMELINE_MAX}+ yr` : breakEvenYears > TIMELINE_MAX ? `${TIMELINE_MAX}+ yr` : `Yr ${breakEvenYears.toFixed(1)}`}
          </div>
          <div className="pb-marker-line" style={{ background: markerColor }} />
        </div>
        <div className="pb-zone-line pb-zone-15" />
        <div className="pb-zone-line pb-zone-20" />
      </div>
      <div className="pb-tick-row">
        {ticks.map(yr => (
          <div
            key={yr}
            className={`pb-tick ${yr === 15 ? 'pb-tick-warn' : ''} ${yr === 20 ? 'pb-tick-danger' : ''}`}
            style={{ left: `${(yr / TIMELINE_MAX) * 100}%` }}
          >
            {yr}
          </div>
        ))}
      </div>
      <div className="pb-legend">
        <span className="pb-legend-item pb-legend-warn">▏15 yr caution</span>
        <span className="pb-legend-item pb-legend-danger">▏20 yr red flag</span>
      </div>
    </div>
  )
}

// ─── Slider field ─────────────────────────────────────────────────────────────
function SliderField({ label, value, min, max, step, onChange, format }) {
  const fillPct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider-field">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">{format(value)}</span>
      </div>
      <input
        type="range"
        className="slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--accent) ${fillPct}%, var(--border) ${fillPct}%)`,
        }}
      />
      <div className="slider-bounds">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

// ─── Stat row (claimed vs realistic) ─────────────────────────────────────────
function StatRow({ label, claimed, realistic, flagged }) {
  return (
    <div className="pb-stat-row">
      <span className="pb-stat-label">{label}</span>
      <div className="pb-stat-values">
        <span className="pb-stat-chip pb-chip-claimed">{claimed}</span>
        <span className="pb-stat-sep">vs</span>
        <span className={`pb-stat-chip ${flagged ? 'pb-chip-flagged' : 'pb-chip-realistic'}`}>{realistic}</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PaybackCalculator({ data, utilityRate }) {
  const {
    systemSize, totalPrice, financialStructure, monthlySavings,
    monthlyBill, contractLength, hasEscalator, escalatorPct,
    roofOrientation, shadingLevel, state,
  } = data

  const ratePerKwh = utilityRate?.ratePerKwh ?? 0.13
  const rateCents  = utilityRate?.rateCents  ?? 13.0

  const kw           = parseFloat(systemSize)    || 0
  const price        = parseFloat(totalPrice)    || 0
  const claimedMo    = parseFloat(monthlySavings) || 0
  const bill         = parseFloat(monthlyBill)   || 1

  const orientFactor  = ORIENTATION_FACTOR[roofOrientation] ?? 0.90
  const shadingFactor = SHADING_FACTOR[shadingLevel]         ?? 1.00
  const annualKwh     = kw * BASE_HOURS * orientFactor * shadingFactor
  const monthlyKwh    = annualKwh / 12

  const realisticMo  = monthlyKwh * ratePerKwh
  const realisticAnn = annualKwh  * ratePerKwh

  const claimedOffsetPct   = (claimedMo / bill)   * 100
  const realisticOffsetPct = (realisticMo / bill)  * 100
  const offsetDelta        = claimedOffsetPct - realisticOffsetPct
  const offsetFlagged      = offsetDelta > 20

  // Cash / loan payback (simple, no rate escalation for the static section)
  let paybackYears = null, paybackRating = 'green'
  let loanBreakEven = null, loanRating = 'green'

  if (financialStructure === 'cash' && realisticAnn > 0) {
    paybackYears = price / realisticAnn
    if (paybackYears > 20) paybackRating = 'red'
    else if (paybackYears > 15) paybackRating = 'yellow'
  }
  if (financialStructure === 'loan' && realisticAnn > 0) {
    loanBreakEven = price / realisticAnn
    if (loanBreakEven > 20) loanRating = 'red'
    else if (loanBreakEven > 15) loanRating = 'yellow'
  }

  const loanTerm     = parseInt(contractLength) || null
  const isThirdParty = financialStructure === 'lease' || financialStructure === 'ppa'

  let sectionRating = 'green'
  if (paybackRating === 'red'    || loanRating === 'red'    || offsetFlagged) sectionRating = 'red'
  else if (paybackRating === 'yellow' || loanRating === 'yellow' || offsetFlagged) sectionRating = 'yellow'

  // ── Scenario slider state (initialised from real data on mount) ────────────
  const [sPrice,      setSPrice]      = useState(Math.round(price / 500) * 500 || 25000)
  const [sRateCents,  setSRateCents]  = useState(Math.round(rateCents * 2) / 2 || 13.0)
  const [sRateRise,   setSRateRise]   = useState(3.0)
  const [sProdHours,  setSProdHours]  = useState(BASE_HOURS)

  const sAnnualKwh   = kw * sProdHours * orientFactor * shadingFactor
  const sRatePerKwh  = sRateCents / 100
  const sAnnualSav1  = sAnnualKwh * sRatePerKwh          // year-1 savings
  const sBreakEven   = calcBreakEven(sPrice, sAnnualKwh, sRatePerKwh, sRateRise)
  const s25YrNet     = calc25YrNet(sPrice, sAnnualKwh, sRatePerKwh, sRateRise)

  const sBreakEvenRating =
    !isFinite(sBreakEven) || sBreakEven > 20 ? 'red' :
    sBreakEven > 15                           ? 'yellow' : 'green'

  const netClass =
    s25YrNet > 0    ? 'positive' :
    s25YrNet > -5000 ? 'warn'   : 'negative'

  return (
    <div className="payback-section">
      {/* Header */}
      <div className="payback-header">
        <div className="payback-title-row">
          <div className={`score-dot ${sectionRating}`} style={{ flexShrink: 0 }} />
          <h3 className="payback-title">Payback Analysis</h3>
        </div>
        <p className="payback-subtitle">
          Based on {kw} kW × {BASE_HOURS.toLocaleString()} hrs/yr (conservative) ·{' '}
          {roofOrientation || 'unknown'} orientation · {shadingLevel || 'unknown'} shading
        </p>
      </div>

      {/* Static production & savings grid */}
      <div className="payback-stats-grid">
        <div className="payback-stat">
          <span className="payback-stat-label">Est. Annual Production</span>
          <span className="payback-stat-value">{Math.round(annualKwh).toLocaleString()} kWh/yr</span>
        </div>
        <div className="payback-stat">
          <span className="payback-stat-label">Est. Monthly Production</span>
          <span className="payback-stat-value">{Math.round(monthlyKwh).toLocaleString()} kWh/mo</span>
        </div>
        <div className="payback-stat">
          <span className="payback-stat-label">Local Utility Rate</span>
          <span className="payback-stat-value">{rateCents.toFixed(1)}¢/kWh</span>
        </div>
        <div className="payback-stat">
          <span className="payback-stat-label">Realistic Monthly Savings</span>
          <span className="payback-stat-value">{dollars(realisticMo)}/mo</span>
        </div>
        <div className="payback-stat">
          <span className="payback-stat-label">Realistic Annual Savings</span>
          <span className="payback-stat-value">{dollars(realisticAnn)}/yr</span>
        </div>
        {(financialStructure === 'cash' || financialStructure === 'loan') && (
          <div className="payback-stat">
            <span className="payback-stat-label">System Cost</span>
            <span className="payback-stat-value">{dollars(price)}</span>
          </div>
        )}
      </div>

      {/* Claimed vs realistic */}
      <div className="payback-comparison">
        <div className="payback-comparison-label">
          Claimed vs. Realistic Savings
          {offsetFlagged && (
            <span className="pb-flag-badge">⚠ Claimed offset {offsetDelta.toFixed(0)}% higher than realistic</span>
          )}
        </div>
        <StatRow
          label="Monthly bill offset"
          claimed={`${pct(claimedOffsetPct)} (${dollars(claimedMo)}/mo claimed)`}
          realistic={`${pct(realisticOffsetPct)} (${dollars(realisticMo)}/mo realistic)`}
          flagged={offsetFlagged}
        />
        {offsetFlagged && (
          <p className="payback-flag-detail">
            The salesperson implied a {pct(claimedOffsetPct)} bill offset, but at the {state} utility
            rate of {rateCents.toFixed(1)}¢/kWh, a {kw}kW system realistically offsets ~{pct(realisticOffsetPct)} of
            your bill. A gap over 20 points suggests inflated assumptions — verify the production estimate
            and rate escalation figures used in the quote.
          </p>
        )}
      </div>

      {/* Cash payback */}
      {financialStructure === 'cash' && paybackYears !== null && (
        <div className="payback-result">
          <div className="payback-result-row">
            <span className="payback-result-label">Simple Payback Period</span>
            <span className={`payback-result-value pb-value-${paybackRating}`}>
              {paybackYears.toFixed(1)} years
            </span>
          </div>
          {paybackRating === 'red' && (
            <p className="payback-flag-detail">
              A {paybackYears.toFixed(1)}-year payback exceeds most panel warranties. At {state}'s rate of {rateCents.toFixed(1)}¢/kWh,
              the economics are challenging without significant rate increases.
            </p>
          )}
          {paybackRating === 'yellow' && (
            <p className="payback-flag-detail">
              A {paybackYears.toFixed(1)}-year payback is on the longer side. Most homeowners target 8–12 years.
              Use the scenario tool below to see how rising utility rates affect the outlook.
            </p>
          )}
          <TimelineBar breakEvenYears={paybackYears} rating={paybackRating} />
        </div>
      )}

      {/* Loan break-even */}
      {financialStructure === 'loan' && loanBreakEven !== null && (
        <div className="payback-result">
          <div className="payback-result-row">
            <span className="payback-result-label">Savings Cover System Cost In</span>
            <span className={`payback-result-value pb-value-${loanRating}`}>
              {loanBreakEven.toFixed(1)} years
            </span>
          </div>
          <p className="payback-flag-detail">
            Simplified estimate — excludes loan interest, which extends the true break-even.
            {loanTerm ? ` Loan term: ${loanTerm} years.` : ''}
            {loanTerm && loanBreakEven > loanTerm
              ? ' Realistic savings won\'t cover the system cost within the loan term.'
              : loanTerm ? ' Realistic savings would cover the system cost within the loan term.' : ''}
          </p>
          <TimelineBar breakEvenYears={loanBreakEven} rating={loanRating} />
        </div>
      )}

      {/* Lease / PPA */}
      {isThirdParty && (
        <div className="payback-result">
          <div className="payback-result-row">
            <span className="payback-result-label">Payback Period</span>
            <span className="payback-result-value pb-value-yellow">
              N/A — {financialStructure.toUpperCase()}
            </span>
          </div>
          <p className="payback-flag-detail">
            {financialStructure === 'lease'
              ? `With a lease you never own the system and pay a monthly fee${contractLength ? ` for ${contractLength} years` : ''}`
              : `With a PPA you pay for electricity produced${contractLength ? ` for ${contractLength} years` : ''} with no ownership`}
            {hasEscalator === 'yes' && escalatorPct ? ` at a rate increasing ${escalatorPct}% annually.` : '.'}
            {' '}The relevant question is whether your payment stays below what you'd pay the utility.
          </p>
        </div>
      )}

      {/* ── What-If Scenario Sliders ─────────────────────────────────────────── */}
      <div className="scenario-section">
        <div className="scenario-header">
          <p className="scenario-title">Adjust Assumptions</p>
          <p className="scenario-subtitle">
            Slide to see how different scenarios affect your payback period.
          </p>
        </div>

        <div className="sliders-grid">
          <SliderField
            label="System Price"
            value={sPrice}
            min={5000}
            max={90000}
            step={500}
            onChange={setSPrice}
            format={v => `$${(v / 1000).toFixed(1)}k`}
          />
          <SliderField
            label="Utility Rate (¢/kWh)"
            value={sRateCents}
            min={5}
            max={45}
            step={0.5}
            onChange={setSRateCents}
            format={v => `${v.toFixed(1)}¢`}
          />
          <SliderField
            label="Annual Utility Rate Increase"
            value={sRateRise}
            min={0}
            max={10}
            step={0.5}
            onChange={setSRateRise}
            format={v => `${v.toFixed(1)}%`}
          />
          <SliderField
            label="System Production (kWh/kW/yr)"
            value={sProdHours}
            min={800}
            max={2200}
            step={50}
            onChange={setSProdHours}
            format={v => `${v.toLocaleString()}`}
          />
        </div>

        <div className="scenario-outputs">
          <div className="scenario-stat">
            <span className="scenario-stat-label">Annual Savings (Year 1)</span>
            <span className="scenario-stat-value">{dollars(sAnnualSav1)}/yr</span>
          </div>
          <div className="scenario-stat">
            <span className="scenario-stat-label">Break-Even Period</span>
            <span className={`scenario-stat-value ${sBreakEvenRating === 'red' ? 'negative' : sBreakEvenRating === 'yellow' ? 'warn' : 'positive'}`}>
              {isFinite(sBreakEven) ? `${sBreakEven.toFixed(1)} yrs` : '25+ yrs'}
            </span>
          </div>
          <div className="scenario-stat">
            <span className="scenario-stat-label">25-Year Net Savings</span>
            <span className={`scenario-stat-value ${netClass}`}>
              {s25YrNet >= 0 ? '+' : ''}{dollars(s25YrNet)}
            </span>
          </div>
        </div>

        <TimelineBar
          breakEvenYears={isFinite(sBreakEven) ? sBreakEven : TIMELINE_MAX + 1}
          rating={sBreakEvenRating}
        />
      </div>

      {/* Disclaimer */}
      <p className="payback-disclaimer">
        Production estimates vary by roof orientation, shading, and local weather. Conservative base
        of {BASE_HOURS.toLocaleString()} hrs/kW/yr adjusted for {roofOrientation || 'unknown'} orientation
        and {shadingLevel || 'unknown'} shading. Scenario tool assumes flat annual rate escalation.
        This is not a financial projection.
      </p>
    </div>
  )
}
