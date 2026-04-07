const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

const ORIENTATION_OPTIONS = [
  { value: 'south', label: 'South (ideal)' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north', label: 'North (least ideal)' },
  { value: 'unknown', label: "I don't know" },
]

const SHADING_OPTIONS = [
  { value: 'none', label: 'None — full sun all day' },
  { value: 'minimal', label: 'Minimal — brief shading only' },
  { value: 'moderate', label: 'Moderate — partial shading for some hours' },
  { value: 'heavy', label: 'Heavy — shaded for significant parts of the day' },
]

const ROOF_TYPE_OPTIONS = [
  { value: 'asphalt', label: 'Asphalt shingle' },
  { value: 'metal', label: 'Metal' },
  { value: 'tile', label: 'Tile (clay or concrete)' },
  { value: 'flat', label: 'Flat / TPO / membrane' },
  { value: 'other', label: 'Other' },
]

function SectionDivider({ label }) {
  return (
    <div className="form-section">
      <span className="form-section-label">{label}</span>
      <div className="form-section-line" />
    </div>
  )
}

export default function StepTwo({ data, onChange, onNext, onBack }) {
  function handleSubmit(e) {
    e.preventDefault()
    onNext()
  }

  const isValid =
    data.state &&
    data.zipCode.match(/^\d{5}$/) &&
    data.monthlyBill &&
    data.roofOrientation &&
    data.shadingLevel &&
    data.roofType

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Home Information</h2>
        <p>Help us contextualize the quote against your specific situation.</p>
      </div>

      <div className="form-grid">

        {/* ── Location ─────────────────────────────────────────────── */}
        <SectionDivider label="Location & Usage" />

        <div className="field">
          <label htmlFor="state">State</label>
          <select
            id="state"
            value={data.state}
            onChange={e => onChange({ state: e.target.value })}
            required
          >
            <option value="">Select state...</option>
            {US_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="zipCode">ZIP Code</label>
          <input
            id="zipCode"
            type="text"
            placeholder="e.g. 90210"
            maxLength={5}
            pattern="\d{5}"
            value={data.zipCode}
            onChange={e => onChange({ zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="monthlyBill">Average Monthly Electric Bill ($)</label>
          <input
            id="monthlyBill"
            type="number"
            placeholder="e.g. 200"
            min="0"
            step="1"
            value={data.monthlyBill}
            onChange={e => onChange({ monthlyBill: e.target.value })}
            required
          />
          <span className="field-hint">Average over the past 12 months</span>
        </div>

        <div className="field">
          <label htmlFor="roofOrientation">Primary Roof Orientation</label>
          <select
            id="roofOrientation"
            value={data.roofOrientation}
            onChange={e => onChange({ roofOrientation: e.target.value })}
            required
          >
            <option value="">Select orientation...</option>
            {ORIENTATION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="field-hint">Direction the panels would face</span>
        </div>

        {/* ── Roof & Site ───────────────────────────────────────────── */}
        <SectionDivider label="Roof & Site Conditions" />

        <div className="field">
          <label htmlFor="shadingLevel">Shading Level</label>
          <select
            id="shadingLevel"
            value={data.shadingLevel}
            onChange={e => onChange({ shadingLevel: e.target.value })}
            required
          >
            <option value="">Select shading...</option>
            {SHADING_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="field-hint">From trees, buildings, chimneys, etc.</span>
        </div>

        <div className="field">
          <label htmlFor="roofAge">Roof Age (years)</label>
          <input
            id="roofAge"
            type="number"
            placeholder="e.g. 8"
            min="0"
            max="60"
            step="1"
            value={data.roofAge}
            onChange={e => onChange({ roofAge: e.target.value })}
          />
          <span className="field-hint">Roofs over 15 years old may need replacement during your solar contract</span>
        </div>

        <div className="field">
          <label htmlFor="roofType">Roof Type</label>
          <select
            id="roofType"
            value={data.roofType}
            onChange={e => onChange({ roofType: e.target.value })}
            required
          >
            <option value="">Select roof type...</option>
            {ROOF_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="submit" className="btn btn-primary btn-next" disabled={!isValid}>
          <span>Analyze My Quote</span>
          <span className="btn-next-arrow">→</span>
        </button>
      </div>
    </form>
  )
}
