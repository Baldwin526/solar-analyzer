const INCENTIVE_OPTIONS = [
  { id: 'federal_itc', label: 'Federal Investment Tax Credit (ITC) / Residential Clean Energy Credit' },
  { id: 'state_rebate', label: 'State or local rebate / incentive program' },
  { id: 'srec', label: 'Solar Renewable Energy Credits (SRECs)' },
  { id: 'net_metering', label: 'Net metering / utility bill credits' },
  { id: 'utility_rebate', label: 'Utility rebate program' },
  { id: 'property_tax', label: 'Property tax exemption for solar' },
  { id: 'sales_tax', label: 'Sales tax exemption on solar equipment' },
]

const FINANCIAL_OPTIONS = [
  { value: 'cash', label: 'Cash purchase' },
  { value: 'loan', label: 'Solar loan' },
  { value: 'lease', label: 'Solar lease' },
  { value: 'ppa', label: 'Power Purchase Agreement (PPA)' },
]

const INVERTER_OPTIONS = [
  { value: 'string', label: 'String Inverter' },
  { value: 'microinverters', label: 'Microinverters (e.g. Enphase)' },
  { value: 'optimizers', label: 'Power Optimizers (e.g. SolarEdge)' },
  { value: 'unknown', label: 'Unknown / Not specified' },
]

function SectionDivider({ label }) {
  return (
    <div className="form-section">
      <span className="form-section-label">{label}</span>
      <div className="form-section-line" />
    </div>
  )
}

function YesNoToggle({ value, onChange }) {
  return (
    <div className="toggle-group">
      <button
        type="button"
        className={`toggle-btn ${value === 'yes' ? 'active-yes' : ''}`}
        onClick={() => onChange('yes')}
      >
        Yes
      </button>
      <button
        type="button"
        className={`toggle-btn ${value === 'no' ? 'active-no' : ''}`}
        onClick={() => onChange('no')}
      >
        No
      </button>
    </div>
  )
}

export default function StepOne({ data, onChange, onNext }) {
  function toggleIncentive(id) {
    const updated = data.incentives.includes(id)
      ? data.incentives.filter(i => i !== id)
      : [...data.incentives, id]
    onChange({ incentives: updated })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onNext()
  }

  const showContract = data.financialStructure && data.financialStructure !== 'cash'

  const isValid =
    data.companyName.trim() &&
    data.systemSize &&
    data.totalPrice &&
    data.financialStructure &&
    data.monthlySavings &&
    (data.financialStructure === 'cash' || data.contractLength) &&
    data.inverterType &&
    data.hasEscalator &&
    (data.hasEscalator === 'no' || data.escalatorPct) &&
    data.hasBattery

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Quote Details</h2>
        <p>Enter the information from your solar quote as accurately as possible.</p>
      </div>

      <div className="form-grid">

        {/* ── Pricing ─────────────────────────────────────────────── */}
        <SectionDivider label="Pricing" />

        <div className="field span-2">
          <label htmlFor="companyName">Solar Company Name</label>
          <input
            id="companyName"
            type="text"
            placeholder="e.g. SunPower, Tesla Energy, local installer..."
            value={data.companyName}
            onChange={e => onChange({ companyName: e.target.value })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="systemSize">System Size (kW)</label>
          <input
            id="systemSize"
            type="number"
            placeholder="e.g. 8.5"
            min="0.5"
            max="25"
            step="0.1"
            value={data.systemSize}
            onChange={e => onChange({ systemSize: e.target.value })}
            required
          />
          <span className="field-hint">Kilowatts (kW) of DC capacity</span>
        </div>

        <div className="field">
          <label htmlFor="totalPrice">Total Price Quoted ($)</label>
          <input
            id="totalPrice"
            type="number"
            placeholder="e.g. 28000"
            min="1000"
            step="100"
            value={data.totalPrice}
            onChange={e => onChange({ totalPrice: e.target.value })}
            required
          />
          <span className="field-hint">Before any incentives or tax credits</span>
        </div>

        <div className="field">
          <label htmlFor="financialStructure">Financial Structure</label>
          <select
            id="financialStructure"
            value={data.financialStructure}
            onChange={e => onChange({ financialStructure: e.target.value, contractLength: '', hasEscalator: '', escalatorPct: '' })}
            required
          >
            <option value="">Select an option...</option>
            {FINANCIAL_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="monthlySavings">Monthly Savings Promised ($)</label>
          <input
            id="monthlySavings"
            type="number"
            placeholder="e.g. 150"
            min="0"
            step="1"
            value={data.monthlySavings}
            onChange={e => onChange({ monthlySavings: e.target.value })}
            required
          />
          <span className="field-hint">As promised by the salesperson</span>
        </div>

        {showContract && (
          <div className="field">
            <label htmlFor="contractLength">Contract Length (years)</label>
            <input
              id="contractLength"
              type="number"
              placeholder="e.g. 20"
              min="1"
              max="30"
              step="1"
              value={data.contractLength}
              onChange={e => onChange({ contractLength: e.target.value })}
              required={showContract}
            />
          </div>
        )}

        {/* ── Equipment ───────────────────────────────────────────── */}
        <SectionDivider label="Equipment" />

        <div className="field span-2">
          <label htmlFor="panelBrand">Panel Brand</label>
          <input
            id="panelBrand"
            type="text"
            placeholder="e.g. LG, REC, Silfab, Qcells, generic/unknown..."
            value={data.panelBrand}
            onChange={e => onChange({ panelBrand: e.target.value })}
          />
          <span className="field-hint">Tier 1 brands include LG, REC, Panasonic, SunPower, Silfab, Qcells</span>
        </div>

        <div className="field">
          <label htmlFor="inverterType">Inverter Type</label>
          <select
            id="inverterType"
            value={data.inverterType}
            onChange={e => onChange({ inverterType: e.target.value })}
            required
          >
            <option value="">Select type...</option>
            {INVERTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="panelWarranty">Panel Warranty (years)</label>
          <input
            id="panelWarranty"
            type="number"
            placeholder="e.g. 25"
            min="0"
            max="40"
            step="1"
            value={data.panelWarranty}
            onChange={e => onChange({ panelWarranty: e.target.value })}
          />
          <span className="field-hint">Industry standard is 25 years</span>
        </div>

        <div className="field">
          <label htmlFor="inverterWarranty">Inverter Warranty (years)</label>
          <input
            id="inverterWarranty"
            type="number"
            placeholder="e.g. 10"
            min="0"
            max="30"
            step="1"
            value={data.inverterWarranty}
            onChange={e => onChange({ inverterWarranty: e.target.value })}
          />
          <span className="field-hint">Standard: 10–12 years; microinverters up to 25</span>
        </div>

        <div className="field">
          <label htmlFor="workmanshipWarranty">Workmanship Warranty (years)</label>
          <input
            id="workmanshipWarranty"
            type="number"
            placeholder="e.g. 10"
            min="0"
            max="25"
            step="1"
            value={data.workmanshipWarranty}
            onChange={e => onChange({ workmanshipWarranty: e.target.value })}
          />
          <span className="field-hint">Covers installer labor; min. 5 years recommended</span>
        </div>

        {/* ── Contract Terms ───────────────────────────────────────── */}
        <SectionDivider label="Contract Terms" />

        <div className="field">
          <label>Escalator Clause Included?</label>
          <YesNoToggle
            value={data.hasEscalator}
            onChange={val => onChange({ hasEscalator: val, escalatorPct: val === 'no' ? '' : data.escalatorPct })}
          />
          <span className="field-hint">Annual price increase built into contract</span>
        </div>

        {data.hasEscalator === 'yes' && (
          <div className="field">
            <label htmlFor="escalatorPct">Annual Escalator Rate (%)</label>
            <input
              id="escalatorPct"
              type="number"
              placeholder="e.g. 2.9"
              min="0"
              max="20"
              step="0.1"
              value={data.escalatorPct}
              onChange={e => onChange({ escalatorPct: e.target.value })}
              required
            />
            <span className="field-hint">Industry norm is 0–2.9%; above is a red flag</span>
          </div>
        )}

        {data.hasEscalator !== 'yes' && <div />}

        <div className="field">
          <label>Battery Storage Included?</label>
          <YesNoToggle
            value={data.hasBattery}
            onChange={val => onChange({ hasBattery: val })}
          />
          <span className="field-hint">e.g. Tesla Powerwall, Enphase IQ Battery</span>
        </div>

        {/* ── Incentives ───────────────────────────────────────────── */}
        <SectionDivider label="Incentives" />

        <div className="field span-2">
          <label>Incentives You Were Told About</label>
          <div className="checkbox-group">
            {INCENTIVE_OPTIONS.map(opt => (
              <label
                key={opt.id}
                className={`checkbox-item ${data.incentives.includes(opt.id) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={data.incentives.includes(opt.id)}
                  onChange={() => toggleIncentive(opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-next" disabled={!isValid}>
          <span>Next: Home Info</span>
          <span className="btn-next-arrow">→</span>
        </button>
      </div>
    </form>
  )
}
