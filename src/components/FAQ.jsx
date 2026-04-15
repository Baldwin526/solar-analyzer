import { useState } from 'react'

const FAQ_CATEGORIES = [
  {
    id: 'tax_credit',
    title: 'The 2026 Tax Credit Reality',
    icon: '💡',
    questions: [
      {
        q: 'Is there still a 30% federal solar tax credit in 2026?',
        a: 'No. The federal residential solar tax credit (Section 25D) expired December 31, 2025 under legislation signed July 4, 2025. There is no federal tax credit for homeowner cash purchases in 2026. Any salesperson claiming otherwise is either uninformed or deliberately misleading you. The only remaining federal credit (Section 48E) applies to leases and PPAs — and it goes to the company, not you.',
      },
      {
        q: 'A salesperson told me I can still get the 30% tax credit. Is that true?',
        a: 'Only if you are signing a lease or PPA — and in that case the company gets the credit, not you. They may pass some of those savings through as lower rates, but claiming you personally receive a 30% federal tax credit on a cash purchase in 2026 is false. This is one of the most common misleading claims in solar sales right now. Ask the salesperson to show you the specific IRS code section that applies to your situation.',
      },
      {
        q: 'Are there any incentives left for solar in 2026?',
        a: 'Yes — state and utility incentives remain and are often significant. Many states offer cash rebates, property tax exemptions on added home value, and net metering bill credits. The value varies widely by state and utility. Check dsire.org for a comprehensive, updated list of what applies in your area. State incentives can sometimes offset the loss of the federal credit substantially.',
      },
    ],
  },
  {
    id: 'understanding_quote',
    title: 'Understanding Your Quote',
    icon: '📊',
    questions: [
      {
        q: 'What is a fair price for solar in 2026?',
        a: 'The national average for residential solar is approximately $2.50 to $3.50 per watt before any incentives for a cash purchase. A 10 kW system should cost roughly $25,000 to $35,000 at that range. Prices below $2.00 per watt are suspiciously cheap and may indicate hidden fees, dealer markups buried in a loan, or low-quality equipment. Prices above $4.50 per watt warrant serious scrutiny — get at least two competing quotes.',
      },
      {
        q: 'What is cost per watt and why does it matter?',
        a: 'Cost per watt is the total system price divided by the system size in kilowatts, then divided by 1,000. It is the standard way to compare solar quotes apples to apples regardless of system size. To calculate it: divide your total quote price by the system size in kW, then multiply by 1,000 to get cost per watt. Example: $28,000 ÷ 8 kW × (1 kW / 1,000 W) = $3.50 per watt. Use this number to compare all quotes you receive.',
      },
      {
        q: 'The salesperson said I would save $200 a month but my bill is only $150. Is that possible?',
        a: 'No. Solar cannot save you more than your total electric bill. Utility companies charge unavoidable fixed connection fees regardless of how much solar your system produces, so real-world savings are always less than your full bill. If a salesperson is projecting savings that exceed your current monthly bill, that is a significant red flag — it is almost certainly a deliberately inflated projection designed to make the financial picture look better than it is.',
      },
      {
        q: 'What solar panels should I look for?',
        a: 'Tier 1 manufacturers with strong track records include REC, Panasonic, SunPower, Silfab, Qcells, and Canadian Solar. These brands have demonstrated long-term reliability and honor their 25-year production warranties. Generic or unbranded panels often have weaker warranty backing and shorter effective lifespans. Always ask for the exact make, model, and wattage of every panel in the quote — and look up the manufacturer independently before signing.',
      },
      {
        q: 'What is a dealer fee and why does it appear in solar loans?',
        a: 'A dealer fee is a hidden markup that solar financing companies pay installers — and then add to your loan principal. It is typically $5,000 to $15,000 on top of the actual system cost, and you pay interest on it for the full loan term. The fee is not disclosed as a line item in most solar contracts. You can detect it by comparing your loan amount to your system price — if the loan is significantly larger, the difference is a dealer fee. Always ask: "What is the total loan principal, and what is the gross system cost? Are those the same number?"',
      },
    ],
  },
  {
    id: 'lease_loan_cash',
    title: 'Lease vs. Loan vs. Cash',
    icon: '💰',
    questions: [
      {
        q: 'Should I lease or buy my solar system?',
        a: 'Most financial analysts recommend ownership — through cash or a loan — over leasing for homeowners who plan to stay in their home. When you own the system, you capture all the savings, your home value increases, and there is no 20-25 year obligation attached to your property. Leases benefit the company significantly: they capture the federal tax credit, the SREC income, and tie your home to the contract. Leases can make sense for homeowners who cannot qualify for financing or who want zero upfront responsibility for maintenance, but read the terms carefully before signing.',
      },
      {
        q: 'What is a PPA?',
        a: 'A Power Purchase Agreement is similar to a lease. Instead of paying a fixed monthly fee for use of the system, you pay per kilowatt-hour of electricity the panels produce at a contracted rate — usually lower than your current utility rate at signing. The company owns the system. PPAs frequently include annual escalator clauses that increase your per-kWh rate each year, which can erode the savings advantage over time. In all cases, the company — not you — captures the federal tax credit and any SREC credits generated.',
      },
      {
        q: 'What is an escalator clause and why does it matter?',
        a: 'An escalator clause increases your monthly payment or per-kWh rate by a fixed percentage each year — typically 2% to 4%. A 3.9% annual escalator means your payment in year 25 is more than double your starting payment. Many homeowners do not realize how much this compounds. If your starting payment is $150 per month with a 3.9% escalator, you will be paying approximately $370 per month in year 25. The industry norm is 0% to 2.9%. Anything above 3% warrants direct negotiation to reduce or eliminate.',
      },
      {
        q: 'Is a 25-year solar loan a good idea?',
        a: 'It depends heavily on the interest rate and whether there is a dealer fee embedded. A low-interest solar loan — 5% to 7% APR with no hidden dealer fee — can make ownership accessible without the downsides of leasing. But many solar loans carry APRs of 10% to 15% after the dealer fee is factored in, which dramatically reduces lifetime savings and may make the investment negative. Always compare the loan\'s Annual Percentage Rate (APR) — not just the stated interest rate — before agreeing to financing.',
      },
    ],
  },
  {
    id: 'net_metering',
    title: 'Net Metering',
    icon: '⚡',
    questions: [
      {
        q: 'What is net metering?',
        a: 'Net metering is a billing arrangement where excess electricity your solar system produces is sent to the grid and credited to your account — typically at or near the retail electricity rate. At night or on cloudy days you draw from those credits instead of paying for grid power. The value of net metering varies significantly by state and utility and has been changing rapidly. It is one of the most important factors in determining actual solar savings.',
      },
      {
        q: 'How do I find out what net metering policy applies to me specifically?',
        a: 'Your utility\'s net metering rate may differ from your state\'s general policy — especially for rural electric cooperatives and municipal utilities, which often set their own rules. Check dsire.org for your state\'s baseline policy, then call your utility directly and ask: "What is your current net metering policy, and what rate do you credit for exported solar energy?" Get the answer in writing. Do not rely on what a solar salesperson tells you about your utility\'s policy.',
      },
    ],
  },
  {
    id: 'contracts_rights',
    title: 'Contracts and Your Rights',
    icon: '📋',
    questions: [
      {
        q: 'What is a UCC lien and should I be worried about it?',
        a: 'A UCC-1 fixture filing is a legal instrument the solar financing company records against your home to document their security interest in the installed equipment. It shows up in title searches and can complicate refinancing, slow a home sale, or require the buyer to assume the solar contract or pay it off at closing. Mortgage lenders are increasingly flagging solar UCC liens. Before signing, ask the company directly: "Will you file a UCC-1 or any fixture filing against my property?" If yes, ask for the exact release process and timeline in writing.',
      },
      {
        q: 'What is the 3-day right of rescission?',
        a: 'Federal law (the FTC Cooling-Off Rule) gives you 3 business days to cancel any contract signed at your home for goods or services over $25, with no penalty and no reason required. If a solar salesperson came to your door and you signed a contract, you can cancel within 3 business days by sending a signed written cancellation notice via certified mail. The company is legally required to give you two copies of this notice at the time of signing. If they did not provide it, your right to cancel may extend significantly beyond 3 days.',
      },
      {
        q: 'What happens to my solar system if I sell my home?',
        a: 'If you own the system outright through cash or a paid-off loan, it transfers with the home as a fixture and typically adds value for buyers. If you have an active loan, the buyer must either assume it or you must pay it off at closing. If you have a lease or PPA, the situation is more complex — the buyer must qualify to assume the contract under the company\'s terms, and if they cannot or will not, you may face early termination fees that can exceed $20,000. This is one of the most common and serious financial complications in solar home sales. Understand your contract\'s transfer terms before signing.',
      },
      {
        q: 'The salesperson said the utility company sent them. Is that true?',
        a: 'No. Solar companies have no affiliation with your local utility company. This is a common door-to-door sales tactic used to create false authority and lower your guard. Utility companies do not send private solar sales representatives to your door — ever. If a salesperson makes this claim, that is a deliberate misrepresentation and a significant red flag about the company\'s sales practices overall.',
      },
      {
        q: 'Can I negotiate a solar contract?',
        a: 'Yes — and you should. Solar companies expect negotiation. The most common items homeowners successfully negotiate are: total system price (often 5-15% reduction), escalator clause removal or reduction, elimination of dealer fees, longer warranty terms, and more favorable transfer language for home sales. Never sign on the day you receive a pitch. Get at least two competing quotes in writing and use them as leverage. The "today only" pricing claim is almost always false.',
      },
    ],
  },
  {
    id: 'red_flags',
    title: 'Red Flags and Scams',
    icon: '⚠',
    questions: [
      {
        q: 'What are the biggest red flags in a solar sales pitch?',
        a: 'The top red flags are: (1) claiming a 30% federal tax credit exists for cash purchases in 2026, (2) pressure to sign the same day or "today only" pricing, (3) claiming the utility company sent them or is involved in the program, (4) promising savings that exceed your current monthly bill, (5) refusing to leave a written itemized quote, (6) asking you to sign before your spouse or partner can review, (7) vague or unspecified system size and equipment, and (8) projecting payback periods under 5 years for a cash purchase. Any single one of these should cause you to pause and get independent verification.',
      },
      {
        q: 'How do I verify a solar company is legitimate?',
        a: 'Take these specific steps: (1) ask for the company\'s state contractor license number and verify it yourself on your state licensing board\'s website, (2) search the company name on the Better Business Bureau at bbb.org and look at the complaints section, not just the rating, (3) search the company name plus "lawsuit," "complaints," and "scam" to find public records, (4) verify they have a physical business address and have been operating for at least 3-5 years, (5) ask for references from customers in your area who are at least 2 years post-installation, and (6) confirm the financing company is also a known entity — predatory installers sometimes use obscure lenders.',
      },
      {
        q: 'A company said I was "pre-qualified" or "pre-selected" for a solar program. What does that mean?',
        a: 'It almost certainly means nothing. "Pre-qualified" and "pre-selected" are marketing language used to create a sense of exclusivity and make you feel you have something to lose by not acting. There is no government program that pre-selects homes for solar subsidies. If anything, this language signals a high-pressure sales operation — legitimate solar companies sell on the merits of the economics, not manufactured urgency.',
      },
      {
        q: 'I signed a solar contract under pressure and now I regret it. What can I do?',
        a: 'First, check your signing date. If you are within 3 business days and the contract was signed at your home, send a written cancellation via certified mail immediately. If you are outside that window, contact your state Attorney General\'s consumer protection office — especially if the salesperson made misrepresentations about the tax credit, savings, or the utility company\'s involvement. File a complaint with the FTC at reportfraud.ftc.gov and the CFPB at consumerfinance.gov/complaint if financing was involved. Many consumer protection attorneys take solar fraud cases on contingency, meaning you pay nothing unless you win.',
      },
      {
        q: 'What does "no money out of pocket" actually mean in a solar pitch?',
        a: '"No money out of pocket" typically means the monthly loan or lease payment is designed to be roughly equal to your current electric bill — so on paper, you are replacing one payment with another. What it does not tell you is that you now have a 20-25 year financial obligation tied to your home, a loan principal that may be inflated by a dealer fee, and payments that may escalate each year while your old electric bill would not have. The phrase is not inherently dishonest, but it obscures significant differences between what you\'re agreeing to and simply keeping your utility account.',
      },
    ],
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={onToggle}>
        <span className="faq-q-text">{item.q}</span>
        <span className="faq-chevron">{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ({ onNavigate }) {
  // Track open state as { categoryId_questionIndex: bool }
  const [openItems, setOpenItems] = useState({})

  function toggle(catId, idx) {
    const key = `${catId}_${idx}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function isOpen(catId, idx) {
    return !!openItems[`${catId}_${idx}`]
  }

  return (
    <div className="faq-page">

      {/* ── Hero ── */}
      <section className="faq-hero">
        <div className="faq-hero-eyebrow">Frequently Asked Questions</div>
        <h1 className="faq-hero-headline">Solar Questions, Answered Honestly</h1>
        <p className="faq-hero-sub">No sales pitch. No referral links. Just straight answers.</p>
      </section>

      {/* ── Category nav pills ── */}
      <div className="faq-nav">
        {FAQ_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className="faq-nav-pill"
            onClick={() => {
              const el = document.getElementById(`faq-cat-${cat.id}`)
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* ── Categories ── */}
      <div className="faq-categories">
        {FAQ_CATEGORIES.map(cat => (
          <section key={cat.id} id={`faq-cat-${cat.id}`} className="faq-category">
            <div className="faq-cat-header">
              <span className="faq-cat-icon">{cat.icon}</span>
              <h2 className="faq-cat-title">{cat.title}</h2>
              <span className="faq-cat-count">{cat.questions.length} questions</span>
            </div>
            <div className="faq-list">
              {cat.questions.map((item, idx) => (
                <FAQItem
                  key={idx}
                  item={item}
                  isOpen={isOpen(cat.id, idx)}
                  onToggle={() => toggle(cat.id, idx)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── Disclaimer ── */}
      <div className="faq-disclaimer">
        <span className="faq-disclaimer-icon">⚖</span>
        <p>
          Answers reflect the state of federal law, market conditions, and utility policies as of April 2026.
          Tax law and net metering policies change — verify current incentives at{' '}
          <a href="https://www.dsireusa.org" target="_blank" rel="noopener noreferrer" className="faq-link">
            dsire.org
          </a>{' '}
          and consult a tax professional before making financial decisions based on any projected incentive.
        </p>
      </div>

      {/* ── CTA ── */}
      {onNavigate && (
        <section className="faq-cta">
          <div className="faq-cta-text">Ready to analyze your specific quote?</div>
          <div className="faq-cta-buttons">
            <button className="btn btn-primary" onClick={() => onNavigate('analyzer')}>
              Quote Analyzer →
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('contract')}>
              Contract Analyzer →
            </button>
          </div>
        </section>
      )}

    </div>
  )
}
