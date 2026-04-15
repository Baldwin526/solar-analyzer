export default function CookiePolicy({ onBack }) {
  return (
    <div className="legal-page">
      <button className="legal-back-btn" onClick={onBack}>← Back</button>

      <div className="legal-header">
        <h1 className="legal-title">Cookie Policy</h1>
        <p className="legal-updated">Last updated: April 15, 2026</p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <p>
            SolarShield uses cookies solely through Google Analytics to understand how visitors use the
            site. This page explains what cookies we use and how to opt out.
          </p>
        </section>

        <section className="legal-section">
          <h2>What Cookies We Use</h2>
          <p>
            We use Google Analytics cookies (<code className="legal-code">_ga</code>,{' '}
            <code className="legal-code">_ga_*</code>). These cookies collect anonymized data about your
            visit — including pages viewed, time on site, browser type, and approximate location based on
            IP address. They do not identify you personally.
          </p>
          <p>
            We do not use advertising cookies, tracking pixels, or any third-party marketing cookies.
            SolarShield has no affiliate relationships and does not monetize user data.
          </p>
        </section>

        <section className="legal-section">
          <h2>Why We Use Analytics</h2>
          <p>
            Analytics data helps us understand which parts of SolarShield are most useful, where users
            encounter friction, and how to improve the tool over time. We use it solely to improve the
            service — not to target advertising or sell data.
          </p>
        </section>

        <section className="legal-section">
          <h2>How to Opt Out</h2>
          <p>You have several options to opt out of Google Analytics tracking:</p>
          <ul className="legal-list">
            <li>
              Install the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                Google Analytics Opt-out Browser Add-on
              </a>{' '}
              — this prevents Google Analytics from collecting data across all sites you visit.
            </li>
            <li>
              Disable cookies entirely in your browser settings. Note that disabling cookies may affect
              functionality on other websites.
            </li>
            <li>
              Use a privacy-focused browser or extension such as uBlock Origin or Privacy Badger that
              blocks analytics trackers by default.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Cookie Retention</h2>
          <p>
            Google Analytics cookies expire after 2 years by default. You can delete existing cookies at
            any time through your browser's privacy or history settings.
          </p>
        </section>

        <section className="legal-section">
          <h2>More Information</h2>
          <p>
            For more details on how Google Analytics handles your data, see Google's privacy policy at{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              policies.google.com/privacy
            </a>
            .
          </p>
          <p>
            Questions about our cookie use:{' '}
            <a href="mailto:solarshieldapp@gmail.com" className="legal-link">solarshieldapp@gmail.com</a>
          </p>
        </section>
      </div>

      <button className="legal-back-btn legal-back-bottom" onClick={onBack}>← Back</button>
    </div>
  )
}
