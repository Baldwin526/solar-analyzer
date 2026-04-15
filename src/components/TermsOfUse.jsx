export default function TermsOfUse({ onBack }) {
  return (
    <div className="legal-page">
      <button className="legal-back-btn" onClick={onBack}>← Back</button>

      <div className="legal-header">
        <h1 className="legal-title">Terms of Use</h1>
        <p className="legal-updated">Last updated: April 15, 2026</p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing SolarShield at solarshield.vercel.app you agree to these Terms of Use.
            If you do not agree, do not use the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>1. Informational Purpose Only</h2>
          <p>
            SolarShield is a free consumer information tool. All analysis, scores, ratings, and information
            provided are for informational purposes only and do not constitute legal, financial, or
            professional advice. You should always consult a licensed attorney or financial advisor before
            signing any solar contract.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. No Guarantee of Accuracy</h2>
          <p>
            We make reasonable efforts to ensure information is accurate and current. However, we make no
            warranties or guarantees regarding the accuracy, completeness, or timeliness of any analysis or
            data provided. Solar market conditions, utility rates, net metering policies, and incentive
            programs change frequently.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Limitation of Liability</h2>
          <p>
            SolarShield and its owner shall not be liable for any damages, losses, or claims arising from
            your use of or reliance on this tool. Your use of SolarShield is entirely at your own risk. In
            no event shall our total liability exceed the amount you paid to use this service, which is zero.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. No Professional Relationship</h2>
          <p>
            Use of SolarShield does not create an attorney-client, financial advisor, or any other
            professional relationship between you and SolarShield or its owner.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Third Party Data</h2>
          <p>
            SolarShield uses data from third party sources including the U.S. Energy Information
            Administration and NC Clean Energy Technology Center. We are not responsible for the accuracy
            of third party data.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Intellectual Property</h2>
          <p>
            The SolarShield name, logo, and site content are the property of SolarShield. You may not
            reproduce or distribute any content without permission.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Dispute Resolution</h2>
          <p>
            Any disputes arising from your use of SolarShield shall be resolved through litigation in the
            courts of the State of Oklahoma. You have one year from the date of any incident to bring a
            claim.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Continued use of the site after
            changes constitutes acceptance.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a href="mailto:solarshieldapp@gmail.com" className="legal-link">solarshieldapp@gmail.com</a>
          </p>
        </section>
      </div>

      <button className="legal-back-btn legal-back-bottom" onClick={onBack}>← Back</button>
    </div>
  )
}
