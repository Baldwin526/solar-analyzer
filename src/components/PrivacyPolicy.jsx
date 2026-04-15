export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="legal-page">
      <button className="legal-back-btn" onClick={onBack}>← Back</button>

      <div className="legal-header">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: April 15, 2026</p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <p>
            SolarShield ("we," "us," or "our") operates solarshield.vercel.app. This Privacy Policy
            explains how we collect, use, and protect your information.
          </p>
        </section>

        <section className="legal-section">
          <h2>Information We Collect</h2>
          <p>
            We do not collect personal information directly from users. We do not require account creation
            or registration. We automatically collect analytics data through Google Analytics including IP
            address, browser type, device information, and usage patterns. This data is collected to
            understand how users interact with our site and improve the service.
          </p>
        </section>

        <section className="legal-section">
          <h2>How We Use Your Information</h2>
          <p>
            We use analytics data solely to improve SolarShield. We do not sell your data to third
            parties. We do not use your data for advertising. We share data only with Google Analytics and
            Vercel (our hosting provider) as necessary to operate the service.
          </p>
        </section>

        <section className="legal-section">
          <h2>Cookies</h2>
          <p>
            We use cookies through Google Analytics to track usage. You can opt out of Google Analytics
            tracking at{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="legal-link"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            . You can also disable cookies in your browser settings.
          </p>
        </section>

        <section className="legal-section">
          <h2>Data Retention</h2>
          <p>
            Analytics data is retained according to Google Analytics default retention settings. We do not
            store any personally identifiable information on our own servers.
          </p>
        </section>

        <section className="legal-section">
          <h2>Your Rights</h2>
          <p>
            Depending on your location you may have rights to access, correct, or delete your personal
            data. To exercise these rights contact us at{' '}
            <a href="mailto:solarshieldapp@gmail.com" className="legal-link">solarshieldapp@gmail.com</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>Children</h2>
          <p>
            SolarShield is not directed at children under 18. We do not knowingly collect data from
            minors.
          </p>
        </section>

        <section className="legal-section">
          <h2>Changes</h2>
          <p>
            We may update this Privacy Policy at any time. Continued use of the site constitutes
            acceptance of changes.
          </p>
        </section>

        <section className="legal-section">
          <h2>Contact</h2>
          <p>
            Privacy questions:{' '}
            <a href="mailto:solarshieldapp@gmail.com" className="legal-link">solarshieldapp@gmail.com</a>
            <br />
            SolarShield<br />
            Norman, OK 73069<br />
            United States
          </p>
        </section>

        <section className="legal-section">
          <h2>Third Party Services</h2>
          <ul className="legal-list">
            <li>
              Google Analytics —{' '}
              <a
                href="https://analytics.google.com/policies/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                analytics.google.com/policies/privacy
              </a>
            </li>
            <li>
              Vercel —{' '}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                vercel.com/legal/privacy-policy
              </a>
            </li>
          </ul>
        </section>
      </div>

      <button className="legal-back-btn legal-back-bottom" onClick={onBack}>← Back</button>
    </div>
  )
}
