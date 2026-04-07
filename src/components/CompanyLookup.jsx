import STATE_LICENSE_LINKS, { DSIRE_URL, DSIRE_LABEL } from '../utils/stateLicenseLinks'
import { COMPANY_RED_FLAGS } from '../analyze'

function ExternalLink({ href, children, icon }) {
  return (
    <a
      className="lookup-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="lookup-link-icon">{icon}</span>
      <span>{children}</span>
      <span className="lookup-link-arrow">↗</span>
    </a>
  )
}

export default function CompanyLookup({ companyName, state, redFlags, onToggleFlag }) {
  const encoded = encodeURIComponent(companyName)
  const stateLink = STATE_LICENSE_LINKS[state]

  // State-specific link if available, otherwise DSIRE national database
  const licenseUrl = stateLink?.url ?? DSIRE_URL
  const licenseLabel = stateLink?.label ?? DSIRE_LABEL

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' solar reviews complaints BBB')}`
  const bbbUrl = `https://www.bbb.org/search?find_text=${encoded}`

  return (
    <div className="company-lookup">
      <div className="lookup-header">
        <div className="lookup-title-row">
          <h3 className="lookup-title">Company Verification</h3>
          <span className="lookup-company">{companyName}</span>
        </div>
        <p className="lookup-subtitle">
          Research this company before signing anything. These links open in a new tab.
        </p>
      </div>

      {/* Quick research links */}
      <div className="lookup-links-section">
        <div className="lookup-section-label">Quick Research Links</div>
        <div className="lookup-links-grid">
          <ExternalLink href={googleUrl} icon="🔍">
            Google Search + Reviews
          </ExternalLink>
          <ExternalLink href={bbbUrl} icon="⭐">
            BBB Business Profile
          </ExternalLink>
          <ExternalLink href={licenseUrl} icon="🏛">
            {licenseLabel}
          </ExternalLink>
          <ExternalLink href="https://directories.nabcep.org/" icon="🏆">
            NABCEP Certified Professionals
          </ExternalLink>
        </div>
        <p className="lookup-link-note">
          Contractor licensing requirements vary by state and change frequently. Always verify directly with your state licensing board before signing a contract.
        </p>
      </div>

      {/* Red flags checklist */}
      <div className="lookup-flags-section">
        <div className="lookup-section-label">
          Company Red Flags
          <span className="lookup-flags-hint">self-reported — check any that apply to your experience</span>
        </div>

        <div className="lookup-flags-list">
          {COMPANY_RED_FLAGS.map(flag => {
            const checked = redFlags.includes(flag.id)
            return (
              <label
                key={flag.id}
                className={`flag-item ${checked ? 'flag-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleFlag(flag.id)}
                />
                <div className="flag-content">
                  <span className="flag-label">{flag.label}</span>
                  {checked && (
                    <span className="flag-detail">{flag.detail}</span>
                  )}
                </div>
              </label>
            )
          })}
        </div>

        {redFlags.length > 0 && (
          <div className={`flags-alert ${redFlags.length >= 3 ? 'flags-alert-red' : 'flags-alert-yellow'}`}>
            <span className="flags-alert-icon">{redFlags.length >= 3 ? '✕' : '⚠'}</span>
            <span>
              {redFlags.length >= 3
                ? `${redFlags.length} red flags reported — this combination is associated with predatory solar sales. Do not sign under pressure.`
                : `${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''} reported — verify independently before signing.`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
