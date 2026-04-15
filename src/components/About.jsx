const FEATURES = [
  {
    icon: '📊',
    title: 'Quote Analyzer',
    desc: 'Stress-tests your quote numbers against real government utility data and 2026 market benchmarks to show whether your price, savings claims, and payback period are realistic.',
  },
  {
    icon: '🎯',
    title: 'Pitch Analyzer',
    desc: 'Identifies high-pressure door-to-door sales tactics used against you — urgency framing, false scarcity, government program misrepresentation, and more.',
  },
  {
    icon: '📋',
    title: 'Contract Analyzer',
    desc: 'Scans contract language for predatory clauses, hidden fees, binding arbitration waivers, escalator clauses, UCC liens, and missing consumer protections.',
  },
  {
    icon: '⚡',
    title: 'Net Metering + Payback',
    desc: 'Shows realistic payback periods and export credit values using your state\'s actual utility rates from the U.S. Energy Information Administration.',
  },
]

const SOURCES = [
  {
    name: 'U.S. Energy Information Administration (EIA)',
    detail: 'Live residential electricity rates by state, updated monthly.',
  },
  {
    name: 'NC Clean Energy Technology Center / DSIRE',
    detail: 'Net metering policies and solar incentives verified April 2026.',
  },
  {
    name: '2026 Residential Solar Market Benchmarks',
    detail: 'National installed cost average of $2.50–$3.50/W based on Lawrence Berkeley National Laboratory Tracking the Sun data.',
  },
]

export default function About({ onNavigate }) {
  return (
    <div className="about-page">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-eyebrow">About SolarShield</div>
        <h1 className="about-hero-headline">
          Built by someone who saw the problem firsthand
        </h1>
        <p className="about-hero-sub">
          SolarShield was created to give homeowners the same information advantage that solar companies have.
        </p>
      </section>

      {/* ── The Problem ─────────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-card about-problem">
          <div className="about-section-icon">⚠</div>
          <div>
            <h2 className="about-section-heading">The solar industry has a predatory sales problem</h2>
            <p>
              Residential solar scams are one of the fastest-growing consumer fraud categories in the United States.
              The FTC received over 7,000 solar fraud complaints in 2025 — a number that likely represents a fraction
              of actual incidents, since most homeowners don't realize they've been misled until years later.
            </p>
            <p>
              Door-to-door solar sales teams are trained to use high-pressure tactics: artificial urgency, misleading
              savings projections, expired or misrepresented tax credit promises, and contracts written by attorneys
              specifically to obscure the true 20–25 year cost. Escalator clauses inflate payments by hundreds of
              dollars annually. Dealer fees silently add $5,000–$15,000 to loan principals. Binding arbitration
              clauses strip homeowners of their legal rights before they've read past the first page.
            </p>
            <p>
              Most homeowners sit across the table from a trained sales professional with no independent tool
              to evaluate what they are being told. SolarShield exists to change that.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why This Exists ─────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-section-card about-why">
          <div className="about-section-icon">🛡</div>
          <div>
            <h2 className="about-section-heading">Why SolarShield exists</h2>
            <p>
              SolarShield was built by an energy management student at the University of Oklahoma with firsthand
              knowledge of how predatory solar sales operations work. After seeing the tactics used on homeowners
              up close, the goal was simple — build the tool that should already exist.
            </p>
            <p>
              A free, independent analyzer with no sales agenda and no referral fees. No affiliate links to
              installers. No lead generation. No upsell. Just the analysis a homeowner needs to walk into any
              solar conversation on equal footing — or to walk away from one.
            </p>
          </div>
        </div>
      </section>

      {/* ── What It Does ────────────────────────────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title-standalone">What SolarShield analyzes</h2>
        <div className="about-features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="about-feature-card">
              <div className="about-feature-icon">{f.icon}</div>
              <div className="about-feature-title">{f.title}</div>
              <div className="about-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Data Sources ────────────────────────────────────────────────────── */}
      <section className="about-section">
        <h2 className="about-section-title-standalone">Data sources</h2>
        <div className="about-sources">
          {SOURCES.map(s => (
            <div key={s.name} className="about-source-row">
              <div className="about-source-dot" />
              <div>
                <div className="about-source-name">{s.name}</div>
                <div className="about-source-detail">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
      <section className="about-section">
        <div className="about-disclaimer">
          <span className="about-disclaimer-icon">⚖</span>
          <p>
            SolarShield is an independent consumer information tool. It is not affiliated with any solar company,
            utility, or government agency. Results are for informational purposes only and do not constitute legal
            or financial advice. Always consult a licensed professional before signing any solar contract.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
      <section className="about-cta">
        <div className="about-cta-text">Ready to analyze your quote?</div>
        <button
          className="btn btn-primary about-cta-btn"
          onClick={() => onNavigate('analyzer')}
        >
          Open Quote Analyzer →
        </button>
      </section>

    </div>
  )
}
