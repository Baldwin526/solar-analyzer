import { analyzeNetMetering } from './netMetering'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function has(text, patterns) {
  const lower = text.toLowerCase()
  return patterns.some(p =>
    p instanceof RegExp ? p.test(text) : lower.includes(p.toLowerCase())
  )
}

function firstMatch(text, regexes) {
  for (const re of regexes) {
    const m = text.match(re)
    if (m) return m
  }
  return null
}

function toFloat(str) {
  if (!str) return null
  const val = parseFloat(str.replace(/,/g, ''))
  return isNaN(val) ? null : val
}

// ─── Escalator ─────────────────────────────────────────────────────────────────
function findEscalatorPct(text) {
  // Step 1 — Negation suppression.
  // If the contract explicitly states there is NO escalator, short-circuit immediately.
  // This prevents "No escalator clause" or "payment shall not increase" from being
  // picked up by the substring 'escalat' and triggering a false red flag.
  const hasExplicitNoEscalator = has(text, [
    'no escalator',
    'no annual escalat',
    'zero escalat',
    '0% escalat',
    'escalation: 0',
    'no annual increase',
    'no annual payment increase',
    'payment shall not increase',
    'payment will not increase',
    'rate shall not increase',
    'rate will not change',
    'payment will not change',
    'fixed monthly payment',
    'fixed payment for',
    'shall remain fixed',
    /payments?\s+(?:shall|will)\s+not\s+(?:increase|change|escalat)/i,
    /fixed\s+(?:rate|payment)\s+for\s+(?:the\s+)?(?:full|entire|duration|term)/i,
  ])
  if (hasExplicitNoEscalator) return null

  // Step 2 — Look for a specific percentage rate increase.
  // This is the most reliable signal of an actual escalator clause.
  const m = firstMatch(text, [
    /(\d+(?:\.\d+)?)\s*%\s*(?:per\s+(?:year|annum)|annual(?:ly)?|each\s+year)/i,
    /(?:escalat(?:or|ion|es|ed))\s*(?:of|:|is|=|at|by)\s*(\d+(?:\.\d+)?)\s*%/i,
    /annual\s+(?:increase|adjustment|rate|payment\s+increase)\s*(?:of|:|is|=|at|by)\s*(\d+(?:\.\d+)?)\s*%/i,
    /(?:increase[sd]?|adjust(?:ed|ment)?)\s+(?:by|of|at)\s+(\d+(?:\.\d+)?)\s*%\s*(?:per\s+(?:year|annum)|annual(?:ly)?)/i,
    /(\d+(?:\.\d+)?)\s*%\s+(?:annual|yearly)\s+(?:escalat|increase|adjust)/i,
  ])
  if (m) return parseFloat(m[1] ?? m[2] ?? m[3] ?? m[4])

  // Step 3 — Look for payment-increase context without an explicit percentage.
  // Only return 'found-no-pct' when the escalator is clearly affirmative — i.e.,
  // the PAYMENT is described as increasing, not merely the word "escalator" appearing.
  // This prevents "No escalator clause" alone from returning 'found-no-pct'.
  const hasPaymentIncreaseContext = has(text, [
    /(?:payment|rate|charge|cost)\s+shall\s+(?:increase|escalat|adjust)/i,
    /(?:payment|rate|charge)\s+will\s+(?:increase|escalat|adjust)/i,
    /(?:payment|rate)\s+(?:increase[sd]?|escalat(?:es?|ed|or))\s+(?:annually|each\s+year|per\s+year|per\s+annum)/i,
    /annual\s+(?:payment\s+)?(?:increase|escalation|adjustment)\s+(?:shall|will|applies?|is)/i,
    /subject\s+to\s+(?:an\s+)?annual\s+(?:increase|escalat|adjustment)/i,
    /increase[sd]?\s+(?:annually|each\s+year|per\s+year)\s+by/i,
    /escalat(?:or|ion)\s+rate\s+(?:of|is|shall|will|applies?)/i,
    /annual\s+rate\s+increase/i,
    /year-over-year\s+(?:increase|adjustment)/i,
  ])
  if (hasPaymentIncreaseContext) return 'found-no-pct'

  return null
}

function findMonthlyPayment(text) {
  const m = firstMatch(text, [
    /\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|\/\s*mo(?:nth)?|monthly\s+payment)/i,
    /monthly\s+(?:payment|rate|charge)\s+(?:of|is|:)\s*\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /payment\s+of\s+\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|\/\s*mo)/i,
  ])
  return m ? toFloat(m[1]) : null
}

export function buildEscalatorTable(basePmt, pct) {
  const r = pct / 100
  return [1, 5, 10, 15, 20, 25].map(yr => ({
    year: yr,
    monthly: +(basePmt * Math.pow(1 + r, yr - 1)).toFixed(2),
    annual: +(basePmt * 12 * Math.pow(1 + r, yr - 1)).toFixed(2),
  }))
}

// ─── APR / interest rate ────────────────────────────────────────────────────────
function findAPR(text) {
  const m = firstMatch(text, [
    /\bAPR\b[^%\d]{0,20}(\d+(?:\.\d+)?)\s*%/i,
    /annual\s+percentage\s+rate[^%\d]{0,20}(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*%\s+APR/i,
  ])
  return m ? parseFloat(m[1]) : null
}

function findInterestRate(text) {
  const m = firstMatch(text, [
    /interest\s+rate\s+of\s+(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*%\s+(?:fixed\s+)?interest\s+rate/i,
    /stated\s+rate[^%\d]{0,20}(\d+(?:\.\d+)?)\s*%/i,
  ])
  return m ? parseFloat(m[1]) : null
}

// ─── Savings claim extraction ───────────────────────────────────────────────────
function findClaimedSavings(text) {
  const m = firstMatch(text, [
    /savings?\s+of\s+\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|\/\s*mo)/i,
    /\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|monthly)\s+(?:savings?|reduction)/i,
    /reduce\s+(?:your\s+)?(?:bill|payment)\s+by\s+\$\s*(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+month|\/\s*mo)/i,
  ])
  return m ? toFloat(m[1]) : null
}

// ─── Main analysis ──────────────────────────────────────────────────────────────
export function analyzeContract(text, context = {}) {
  const { state, monthlyBill, systemSize, totalPrice, financialStructure, utilityRate } = context
  const isCash = financialStructure === 'Cash'
  const isLoan = financialStructure === 'Loan'
  const isLeasePPA = financialStructure === 'Lease' || financialStructure === 'PPA'

  // ── HIGH-RISK CLAUSES ──────────────────────────────────────────────────────
  const highRisk = []

  // 1. Escalator
  const escalatorPct = findEscalatorPct(text)
  if (escalatorPct !== null) {
    const base = findMonthlyPayment(text)
    const pctKnown = typeof escalatorPct === 'number'
    let detail, table

    if (pctKnown && base) {
      const yr10 = (base * Math.pow(1 + escalatorPct / 100, 9)).toFixed(2)
      const yr20 = (base * Math.pow(1 + escalatorPct / 100, 19)).toFixed(2)
      const yr25 = (base * Math.pow(1 + escalatorPct / 100, 24)).toFixed(2)
      detail = `Contract contains a ${escalatorPct}% annual escalator. Starting at $${base}/mo, payments grow to $${yr10}/mo by year 10, $${yr20}/mo by year 20, and $${yr25}/mo by year 25 — a ${Math.round((yr25 / base - 1) * 100)}% total increase over the contract term.`
      table = { pct: escalatorPct, base, rows: buildEscalatorTable(base, escalatorPct) }
    } else if (pctKnown) {
      detail = `Contract contains a ${escalatorPct}% annual escalator but the starting monthly payment could not be extracted from the text. Request a complete year-by-year payment schedule from the installer before signing.`
    } else {
      detail = `Escalator language was detected in the contract but the annual percentage could not be extracted from the text. This may be due to the PDF formatting. Ask the installer for the exact escalation rate and a payment schedule covering all 25 contract years.`
    }

    highRisk.push({
      id: 'escalator',
      label: 'Annual Payment Escalator',
      rating: 'red',
      summary: pctKnown
        ? `${escalatorPct}% annual increase — payments grow significantly over contract life`
        : 'Escalator language detected — exact percentage not extractable from text',
      detail,
      negotiate: 'Request a fixed payment for the full contract term. If the installer won\'t remove the escalator, negotiate a lower starting payment and get the complete year-by-year schedule in writing. Compare the total cost over 25 years — with escalator vs. without — before accepting any terms.',
      table: table ?? null,
    })
  }

  // 2. Early termination fee
  // Triggers require customer-initiated early exit language — NOT conditional cancellation
  // clauses tied to permit denial or force majeure. Specifically excluded: plain
  // 'cancellation fee' and 'termination fee' as substrings, which match permit-denial
  // text like "cancellation fees may apply if permits are denied."
  if (has(text, [
    'early termination fee',
    'early termination penalty',
    'termination penalty',
    'cancellation penalty',
    'liquidated damage',
    'termination charge',
    'early cancellation fee',
    'buyout amount',
    'present value of remaining payments',
    'cancel before end of term',
    /early\s+(?:termination|cancellation)\b/i,
    /cancel(?:lation)?\s+(?:fee|penalty|charge)\s+(?:for\s+)?(?:early|prior\s+to|before\s+(?:end|expir|complet))/i,
    /(?:fee|penalty|charge)\s+(?:if|when|should)\s+(?:you|customer|homeowner)\s+(?:cancel|terminate|exit)/i,
    /cancel\s+(?:before|prior\s+to)\s+(?:the\s+)?(?:end\s+of|expir|complet)/i,
    /terminate\s+(?:this\s+)?(?:agreement|contract|lease)\s+(?:early|before|prior)/i,
    /remaining\s+payments?\s+(?:shall|will|are)\s+(?:be\s+)?(?:due|owed|accelerated)/i,
  ])) {
    const m = firstMatch(text, [
      /(?:early\s+)?(?:termination|cancellation)\s+(?:fee|penalty|charge)\s+(?:of\s+)?\$?\s*([\d,]+)/i,
      /\$\s*([\d,]+)\s+(?:early\s+)?(?:termination|cancellation)/i,
      /(?:fee|penalty|charge)\s+(?:equal\s+to|of)\s+\$?\s*([\d,]+)/i,
      /buyout\s+(?:amount|fee)\s+(?:of\s+)?\$?\s*([\d,]+)/i,
    ])
    const amt = m ? m[1] : null
    highRisk.push({
      id: 'etf',
      label: 'Early Termination Fee',
      rating: 'red',
      summary: amt
        ? `Early termination fee of $${amt} identified`
        : 'Early termination fee language detected — amount unclear',
      detail: amt
        ? `The contract includes an early termination fee of approximately $${amt}. This amount may be due if you cancel the contract before the term ends for any reason — including if you need to sell the home and the buyer won\'t assume the agreement.`
        : 'The contract references an early termination fee. The exact amount or formula could not be extracted from the text. Request the specific dollar amount and any formula used to calculate it.',
      negotiate: 'Negotiate to reduce or eliminate this fee. At minimum, confirm it is waived automatically when a home buyer assumes the contract. Ask for a declining fee schedule rather than a flat amount for the full term.',
    })
  }

  // 3. System removal costs on homeowner
  if (has(text, ['removal cost', 'cost of removal', 'deinstall', 'uninstall', 'cost to remove'])
    && has(text, ['homeowner', 'customer shall', 'owner shall', 'you shall be responsible', 'responsible for removal'])) {
    highRisk.push({
      id: 'removal_cost',
      label: 'System Removal Costs Placed on Homeowner',
      rating: 'red',
      summary: 'Contract appears to make homeowner responsible for removal costs',
      detail: 'Language in the contract suggests the homeowner may bear system removal costs. Solar removal typically costs $3,000–$8,000 and often becomes relevant when selling, replacing a roof, or at the end of a lease term. Homeowner-borne removal costs can create major complications during a home sale.',
      negotiate: 'Negotiate to have the installer bear all removal and reinstallation costs throughout the term — including for roof repairs and at contract expiration. This should be explicit in writing.',
    })
  }

  // 4. Automatic renewal
  if (has(text, ['automatic renewal', 'auto-renew', 'automatically renew',
    'auto renewal', 'automatically extends', 'renew automatically', 'deemed renewed'])) {
    highRisk.push({
      id: 'auto_renewal',
      label: 'Automatic Renewal Clause',
      rating: 'red',
      summary: 'Contract may automatically renew without action on your part',
      detail: 'The contract contains automatic renewal language. If you don\'t actively opt out before a specified deadline — often 60–90 days before the term ends — the contract may renew for additional years under existing or updated terms. Homeowners frequently miss this window.',
      negotiate: 'Ask to remove automatic renewal entirely, or at minimum require the company to send written notice 120+ days before renewal and require your affirmative written consent to renew.',
    })
  }

  // 5. Binding arbitration / class action / jury waiver
  // Detect negation language first — if the contract explicitly denies these clauses,
  // the red flag is suppressed and a green flag is earned instead.
  const noArbRequired = has(text, [
    'no binding arbitration',
    'no mandatory arbitration',
    'no arbitration required',
    'not subject to arbitration',
    /no\s+(?:mandatory\s+|binding\s+|compulsory\s+)?arbitration/i,
    /disputes?\s+(?:shall|will|may)\s+be\s+(?:resolved|settled|heard)\s+in\s+(?:state|federal|a\s+court)/i,
    /(?:customer|homeowner|buyer|owner)\s+retains?\s+(?:all\s+)?(?:legal\s+)?rights?/i,
  ])
  const noCAWaiver = has(text, [
    'no class action waiver',
    /no\s+class\s+action\s+waiver/i,
    /class\s+action\s+(?:rights?\s+(?:are\s+)?retained|waiver\s+(?:is\s+)?not\s+(?:required|included|applicable))/i,
  ])
  const noJuryWaiver = has(text, [
    'right to jury trial',
    'jury trial rights',
    /retains?\s+.{0,25}(?:right\s+to\s+)?jury\s+trial/i,
    /(?:full\s+)?right\s+to\s+(?:a\s+)?jury\s+trial/i,
    /jury\s+trial\s+(?:right\s+is\s+)?(?:retained|preserved|not\s+waived)/i,
  ])

  // Each component only fires red if the negative suppressor is absent.
  const hasArb = !noArbRequired && has(text, [
    'binding arbitration',
    'mandatory arbitration',
    'compulsory arbitration',
    /disputes?\s+(?:shall|must|will)\s+be\s+(?:resolved|settled|determined)\s+(?:by|through|via|in)\s+arbitration/i,
    /(?:agree[sd]?|required|submit)\s+to\s+arbitrat/i,
    /all\s+(?:disputes?|claims?|controversies?)\s+.{0,40}arbitrat/i,
    /arbitration\s+(?:clause|provision|agreement)\s+(?:applies|shall\s+apply|governs)/i,
  ])
  // Note: class action waiver string patterns cannot use plain 'class action waiver' because
  // lower.includes() would match "no class action waiver". Gate on !noCAWaiver instead.
  const hasCA = !noCAWaiver && has(text, [
    /(?<!no\s{0,5})class\s+action\s+waiver/i,
    /waiv(?:e|er|ed|ing)\s+.{0,30}class\s+action/i,
    /(?:bring|file|participate\s+in|join)\s+(?:a\s+)?class\s+action.{0,30}waiv/i,
  ])
  const hasJury = !noJuryWaiver && has(text, [
    'jury trial waiver',
    'waiver of jury',
    /waiv(?:e|er|ed|ing)\s+.{0,30}jury\s+trial/i,
    /right\s+to\s+(?:a\s+)?jury\s+trial.{0,30}waiv/i,
  ])
  if (hasArb || hasCA || hasJury) {
    const items = [
      hasArb && 'binding arbitration',
      hasCA && 'class action waiver',
      hasJury && 'jury trial waiver',
    ].filter(Boolean)
    highRisk.push({
      id: 'arbitration',
      label: 'Binding Arbitration / Waiver of Legal Rights',
      rating: 'red',
      summary: `Detected: ${items.join(', ')}`,
      detail: 'Binding arbitration clauses require disputes to be resolved through a private arbitration process rather than the court system. Class action waivers prevent you from joining other homeowners in a lawsuit. Jury trial waivers eliminate your right to a jury. These provisions uniformly favor the company in disputes, as arbitrators who rely on repeat business from the industry are not always neutral.',
      negotiate: 'Ask to remove arbitration and class action waiver clauses entirely. If the company won\'t agree, confirm the arbitration venue is local, that you aren\'t required to pay the company\'s fees, and that you retain the right to file with your state AG\'s consumer protection office.',
    })
  }

  // 6. UCC lien / fixture filing
  if (has(text, ['ucc-1', 'ucc filing', 'fixture filing', 'financing statement',
    'security interest in the', 'uniform commercial code', 'lien on the property', 'lien on your home'])) {
    highRisk.push({
      id: 'ucc_lien',
      label: 'UCC Lien or Fixture Filing on Property',
      rating: 'red',
      summary: 'Contract references a security interest or lien filed against your home',
      detail: 'UCC-1 financing statements and fixture filings create a public record that the solar company holds a security interest in equipment affixed to your home. This can appear on title searches, complicate or delay a home sale, affect your ability to refinance, and require legal steps to clear. Buyers\' mortgage lenders increasingly flag solar liens.',
      negotiate: 'Ask the company to confirm in writing that no UCC filing will be recorded against your property. If required for financing, request a clear written process to release the filing upon payoff or lease end — with a specific timeline (e.g., within 30 days).',
    })
  }

  // 7. Burdensome assignment language
  // Compute clean-transfer detection here so it can gate the red flag below AND be
  // reused in the homeownerFriendly section. Patterns use both simple strings (for
  // exact substrings) and regexes (for flexible word order like "transfer...automatically").
  const hasCleanTransfer = has(text, [
    'freely transferable',
    'transfer to new owner',
    'no transfer fee',
    'assumption is free',
    'transfer at no cost',
    'transfer at no charge',
    'no approval required',
    'no company approval',
    'without company approval',
    'without approval',
    'buyer may assume without',
    'new homeowner may assume without',
    /automatically\s+(?:transfer|assign|convey|pass)/i,
    /(?:transfer|assign|assumption)\s+(?:is\s+)?automatic/i,
    /(?:transfer|assign).{0,30}(?:no\s+fee|no\s+cost|no\s+charge|free\s+of\s+charge)/i,
    /no\s+(?:company\s+|installer\s+)?approval\s+(?:is\s+)?(?:required|needed|necessary)/i,
    /(?:transfer|assign).{0,30}without\s+(?:company\s+|installer\s+)?approval/i,
    /(?:buyer|purchaser|new\s+owner)\s+may\s+assume\s+(?:this\s+agreement\s+)?(?:at\s+no|without|free)/i,
  ])

  // Only check for burdensome language when the contract does NOT already establish
  // a clean, fee-free, approval-free transfer. This prevents "No transfer fees" and
  // "No company approval required" from matching the inner patterns below.
  if (!hasCleanTransfer && has(text, ['assign', 'transfer', 'sale of the property', 'sale of your home', 'upon sale'])) {
    if (has(text, [
      'prior written consent',
      'may not assign',
      'transfer fee',
      'assumption fee',
      'consent of the company',
      /cannot\s+(?:be\s+)?assign(?:ed)?\s+without/i,
      /company\s+(?:approval|consent)\s+(?:is\s+)?required/i,
      /(?:transfer|assignment)\s+(?:is\s+)?subject\s+to\s+(?:company|installer|our)\s+approval/i,
      /must\s+obtain\s+(?:company|installer|our)\s+(?:written\s+)?(?:approval|consent)\s+(?:before|prior)/i,
    ])) {
      highRisk.push({
        id: 'assignment',
        label: 'Burdensome Assignment / Home Sale Language',
        rating: 'red',
        summary: 'Selling your home may require company approval or impose fees',
        detail: 'The contract appears to require company consent or impose conditions when you sell your home. Buyers may be required to assume the contract, and some contracts include "transfer fees" or allow the company to refuse transfer — requiring you to pay off the system or pay termination fees at closing. This can kill home sales or significantly reduce your net proceeds.',
        negotiate: 'Request language that makes the contract freely assumable by any qualified buyer, at no cost, without company approval, within 15 business days of request. Get the exact transfer process — and any fee — in writing before signing.',
      })
    }
  }

  // ── REVIEW CAREFULLY (YELLOW) ──────────────────────────────────────────────
  const reviewCarefully = []

  // 1. Net metering assumptions
  if (has(text, ['net metering', 'net energy metering', 'nem ', 'export credit',
    'utility credit', 'grid credit', 'buyback rate'])) {
    reviewCarefully.push({
      id: 'net_metering_assumption',
      label: 'Savings Projections Tied to Net Metering Assumptions',
      rating: 'yellow',
      summary: 'Contract references net metering — verify current policy applies to your utility',
      detail: 'Savings projections frequently assume favorable net metering rates. States including California (NEM 3.0, 2023), Illinois (2025), and Hawaii have reduced export credits substantially. If your state or utility has changed its policy, actual savings could be 20–50% lower than projected.',
      negotiate: 'Ask for savings projections under both current net metering rates and a reduced-export scenario. Confirm your specific utility\'s current net metering policy in writing — not all utilities in a state follow the same rules.',
    })
  }

  // 2. Performance guarantee exclusions
  if (has(text, ['performance guarantee', 'production guarantee', 'output guarantee', 'energy guarantee'])) {
    if (has(text, ['except', 'excluding', 'not include', 'shall not apply',
      'void if', 'does not cover', 'exclude', 'limitation', 'not responsible'])) {
      reviewCarefully.push({
        id: 'perf_exclusions',
        label: 'Performance Guarantee Contains Carve-Outs',
        rating: 'yellow',
        summary: 'Performance guarantee has exclusion language — understand what is carved out',
        detail: 'The contract includes a performance guarantee but also contains exclusion language. Common carve-outs include: shading from tree growth, equipment failures outside warranty coverage, grid outages, changes to net metering policy, and weather anomalies. Carve-outs can make a "guarantee" largely unenforceable.',
        negotiate: 'Ask for an exhaustive list of all exclusions in plain English. Push to limit exclusions to only events fully beyond the installer\'s control (e.g., named storms) — normal equipment degradation and shading should not void the guarantee.',
      })
    }
  }

  // 3. Warranty transfer process
  if (has(text, ['warranty transfer', 'transferable warranty', 'warranty.*transferable',
    'transfer.*warranty', 'assign.*warranty'])) {
    reviewCarefully.push({
      id: 'warranty_transfer',
      label: 'Warranty Transfer Terms Present',
      rating: 'yellow',
      summary: 'Review the warranty transfer process before a home sale',
      detail: 'The contract mentions warranty transferability. The transfer process may require specific notices, fees, or company approval. A warranty that doesn\'t cleanly transfer can reduce your home\'s marketability or create disputes after closing.',
      negotiate: 'Confirm all warranties transfer automatically to any future buyer at no cost, with no company approval required. Get the exact process in writing — how it\'s initiated, the timeline, and what documentation the buyer receives.',
    })
  }

  // 4. Homeowner insurance requirements
  if (has(text, ['homeowner.*insurance', 'maintain.*insurance', 'adequate insurance',
    'insurance.*coverage', 'insurance.*required', 'general liability.*insurance'])) {
    reviewCarefully.push({
      id: 'insurance',
      label: 'Insurance Requirements on Homeowner',
      rating: 'yellow',
      summary: 'Contract may require you to maintain specific insurance coverage',
      detail: 'Some solar contracts require homeowners to maintain minimum insurance coverage levels (e.g., $300,000+ liability) throughout the agreement. Failure to maintain required coverage may constitute a breach of contract, even if the system causes no incidents.',
      negotiate: 'Confirm your current homeowner\'s insurance policy already meets the stated requirements before signing. If it doesn\'t, get a cost estimate for the additional coverage and factor it into your total cost of ownership.',
    })
  }

  // 5. SREC ownership — three-way: customer owns (green), company owns or ambiguous (yellow),
  // not mentioned at all (yellow with different message).
  const hasSrecMention = has(text, [
    'srec',
    'solar renewable energy credit',
    'solar renewable energy credits',
    'solar renewable energy certificate',
    'solar renewable energy certificates',
    'solar rec',
    ' rec ',
    'rec ownership',
    'environmental attribute',
    /solar\s+renewable\s+energy\s+(?:credits?|certificates?)/i,
  ])

  if (hasSrecMention) {
    // Detect customer ownership — flexible enough to handle word-order variations like
    // "retained by and owned exclusively by the customer".
    const srecCustomerOwns = has(text, [
      /srec[s]?.{0,80}(?:retained|owned|assigned|belong(?:ing)?)\s+(?:by|to).{0,40}(?:customer|homeowner|buyer|owner)/i,
      /(?:customer|homeowner|buyer|owner).{0,60}(?:retain[s]?|own[s]?|keep[s]?).{0,20}(?:all\s+)?srec/i,
      /solar\s+renewable\s+energy.{0,100}(?:retained|owned)\s+(?:exclusively\s+)?(?:by|to).{0,40}(?:customer|homeowner|buyer|owner)/i,
      /(?:customer|homeowner|buyer|owner).{0,80}(?:retain[s]?|own[s]?)\s+(?:all\s+)?solar\s+renewable\s+energy/i,
      /srec[s]?\s+(?:are\s+)?(?:the\s+)?(?:customer|homeowner|owner)'?s?\s+(?:property|to\s+keep|to\s+retain)/i,
    ])

    if (srecCustomerOwns) {
      homeownerFriendly.push({
        id: 'srec_customer',
        label: 'Customer Retains SREC Ownership',
        rating: 'green',
        summary: 'Contract confirms you own all Solar Renewable Energy Credits generated',
        detail: 'SRECs have meaningful market value in states like NJ, MA, MD, PA, OH, and DC — often $50–$300+ per certificate per year. The contract explicitly assigns SREC ownership to you, preserving this potential income stream for the full system life.',
      })
    } else {
      // Mentioned but customer ownership is not explicitly confirmed — could be
      // assigned to the company or simply left ambiguous.
      reviewCarefully.push({
        id: 'srec',
        label: 'SREC Ownership — Confirm You Retain the Credits',
        rating: 'yellow',
        summary: 'Contract references SRECs but does not clearly assign them to you — verify before signing',
        detail: 'Solar Renewable Energy Certificates (SRECs) have meaningful market value in states like NJ, MA, MD, PA, OH, and DC — often $50–$300+ per certificate per year. If the contract assigns SRECs to the installer or financing company, you are forfeiting ongoing income. This is especially common in lease and PPA agreements.',
        negotiate: 'Add explicit language: "All SRECs generated by the system are owned by and assigned to the customer for the full system life." If the installer insists on taking SRECs, negotiate a lower system price or higher guaranteed savings to offset the value you\'re giving up.',
      })
    }
  } else {
    // Contract makes no mention of SRECs — ownership is unaddressed and therefore unclear.
    reviewCarefully.push({
      id: 'srec_unaddressed',
      label: 'SREC Ownership Not Addressed in Contract',
      rating: 'yellow',
      summary: 'Solar Renewable Energy Credits are not mentioned — confirm ownership in writing before signing',
      detail: 'SRECs have meaningful market value in certain states. Because the contract doesn\'t address SREC ownership, it is unclear whether you or the installer retains them. In many states this defaults to the system owner, but an explicit clause protects you if there is ever a dispute.',
      negotiate: 'Request a written clause confirming that all SRECs generated by the system belong to you — now and for the full system life. This is a standard, reasonable ask that should not require negotiation.',
    })
  }

  // 6. Energy production data
  if (has(text, ['monitoring data', 'production data', 'energy data',
    'system data', 'performance data', 'data ownership', 'data rights'])) {
    reviewCarefully.push({
      id: 'data_ownership',
      label: 'Energy Production Data Ownership',
      rating: 'yellow',
      summary: 'Review who owns and controls your system\'s performance data',
      detail: 'Some contracts give the installer or financing company exclusive rights to your system\'s production data. This can limit your ability to verify performance independently, use third-party monitoring platforms, or dispute production shortfalls with supporting evidence.',
      negotiate: 'Negotiate full, unrestricted access to all real-time and historical production data at no cost for the full contract term — including the right to use third-party monitoring tools.',
    })
  }

  // 7. Permit / HOA risk
  if (has(text, ['permit', 'permitting', 'hoa approval', 'municipal approval',
    'jurisdiction approval', 'building permit', 'electrical permit'])) {
    reviewCarefully.push({
      id: 'permit',
      label: 'Permit or HOA Approval Risk',
      rating: 'yellow',
      summary: 'Review contract terms if permits or HOA approval are denied',
      detail: 'If permits are denied or an HOA does not approve installation, the contract should give you a clear exit with a full refund of any deposit. Without this language, you may remain bound to the contract even if installation cannot proceed — or face a delay that leaves you in limbo for months.',
      negotiate: 'Add explicit language: if permits are denied or HOA approval is not obtained within 90 days, the contract is void and all deposits are refunded within 10 business days.',
    })
  }

  // 8. Permit-denial cancellation window
  // This is distinct from a general early termination fee — the cancellation right
  // only applies when permits are denied, which is a conditional exit, not a customer-
  // initiated early termination. Flag separately so it isn't confused with an ETF.
  if (has(text, [
    /(?:if|when|should)\s+permits?\s+(?:are\s+)?(?:denied|not\s+(?:obtained|approved|granted|issued))/i,
    /permit\s+(?:denial|rejection|refusal)/i,
    /permits?\s+(?:cannot|can't|are\s+unable\s+to\s+be)\s+(?:obtained|secured|issued)/i,
  ])) {
    if (has(text, ['cancel', 'cancellation', 'refund', 'void'])) {
      // Extract the cancellation window if stated (e.g. "14 days", "30 days")
      const windowMatch = text.match(/(?:cancel|refund|void).{0,60}?(\d+)\s*(?:business\s+)?days?/i)
                       ?? text.match(/(\d+)\s*(?:business\s+)?days?.{0,60}?(?:cancel|refund|void)/i)
      const days = windowMatch ? windowMatch[1] : null
      reviewCarefully.push({
        id: 'permit_cancellation',
        label: days
          ? `Cancellation Window After Permit Denial — ${days}-Day Limit`
          : 'Cancellation Window After Permit Denial',
        rating: 'yellow',
        summary: days
          ? `Customer may cancel within ${days} days if permits are denied — confirm whether this window is sufficient and what fees apply after it closes`
          : 'Contract includes a cancellation provision tied to permit denial — review the window and any fees',
        detail: `The contract allows cancellation if permits are denied, but this right${days ? ` expires after ${days} days` : ' may have a limited window'}. If permits are delayed (not denied outright), the clock may still run. Any fees that apply after the window closes effectively penalize you for a problem caused by the permitting process, not by your decision to exit. This is different from a general early termination clause — the risk here is whether the window is long enough to get a final permit decision.`,
        negotiate: `Ask for a longer cancellation window — 30–60 days is more appropriate since permitting timelines vary widely by jurisdiction. Confirm that (1) the window doesn't start until a formal permit denial is issued, (2) any post-window cancellation fees are waived if the denial is due to installer error, and (3) your deposit is refunded in full within 10 business days of cancellation.`,
      })
    }
  }

  // ── HOMEOWNER-FRIENDLY (GREEN) ─────────────────────────────────────────────
  const homeownerFriendly = []

  const hasFixedPayment = has(text, ['fixed monthly payment', 'fixed payment',
    'payment shall not increase', 'rate shall not increase', 'no annual increase',
    'payment will not change', 'fixed rate for the', 'shall remain fixed'])

  if (hasFixedPayment && escalatorPct === null) {
    homeownerFriendly.push({
      id: 'fixed_payment',
      label: 'Fixed Payment for Full Contract Term',
      rating: 'green',
      summary: 'Contract confirms a fixed monthly payment with no escalation',
      detail: 'The contract specifies a fixed monthly payment with no annual increase. This protects you from payment growth over the contract term, makes long-term budgeting predictable, and eliminates one of the most significant risk factors in solar agreements.',
    })
  }

  if (has(text, ['no escalator', 'no annual escalat', 'zero escalat', '0% escalat', 'escalation: 0'])) {
    homeownerFriendly.push({
      id: 'no_escalator',
      label: 'No Escalator Clause Explicitly Confirmed',
      rating: 'green',
      summary: 'Contract explicitly states zero annual payment escalation',
      detail: 'The contract explicitly confirms there is no annual payment escalator. Your monthly obligation is fixed for the full term — a significant protection for long-term financial planning.',
    })
  }

  const hasModuleWarranty = has(text, ['panel warranty', 'module warranty', 'product warranty',
    '25-year warranty', '25 year warranty', 'manufacturer warranty'])
  const hasInverterWarranty = has(text, ['inverter warranty', 'converter warranty',
    '10-year inverter', '12-year inverter', '25-year inverter'])
  const hasWorkmanshipWarranty = has(text, ['workmanship warranty', 'installation warranty',
    'labor warranty', 'craftsmanship warranty', 'roof penetration warranty'])

  if (hasModuleWarranty && hasInverterWarranty && hasWorkmanshipWarranty) {
    homeownerFriendly.push({
      id: 'warranties',
      label: 'Separate Panel, Inverter, and Workmanship Warranties',
      rating: 'green',
      summary: 'All three warranty types explicitly stated',
      detail: 'The contract clearly states separate warranties for panels/modules, the inverter, and workmanship/installation. This is a positive sign — each component has defined coverage, and the installation quality is backed independently from the equipment manufacturers.',
    })
  } else {
    const found = [
      hasModuleWarranty && 'panel/module',
      hasInverterWarranty && 'inverter',
      hasWorkmanshipWarranty && 'workmanship',
    ].filter(Boolean)
    const notFound = [
      !hasModuleWarranty && 'panel/module',
      !hasInverterWarranty && 'inverter',
      !hasWorkmanshipWarranty && 'workmanship',
    ].filter(Boolean)
    if (found.length > 0) {
      reviewCarefully.push({
        id: 'partial_warranties',
        label: 'Partial Warranty Coverage Identified',
        rating: 'yellow',
        summary: `Found: ${found.join(', ')} warranty. Not found: ${notFound.join(', ')} warranty`,
        detail: `All three warranties should be explicitly stated with separate terms and durations. Found in contract: ${found.join(', ')} warranty. Not clearly stated: ${notFound.join(', ')} warranty. Missing warranties may still exist but aren\'t written into this contract.`,
        negotiate: 'Request that all three warranty types be stated explicitly — with duration, scope of coverage, exclusions, and how to file a claim for each.',
      })
    }
  }

  // hasCleanTransfer is computed above (before block 7) — reuse it here.
  if (hasCleanTransfer) {
    // Use the stronger label when the contract explicitly calls out no fees / no approval.
    const hasExplicitNoFeeNoApproval = has(text, [
      'no transfer fee',
      'no approval required',
      'no company approval',
      'without company approval',
      'transfer at no cost',
      /no\s+(?:company\s+|installer\s+)?approval/i,
      /(?:transfer|assign).{0,30}(?:no\s+fee|no\s+cost|free)/i,
    ])
    homeownerFriendly.push({
      id: 'clean_transfer',
      label: hasExplicitNoFeeNoApproval
        ? 'Clean Transfer — No Approval or Fees Required'
        : 'Homeowner-Friendly Transfer Language',
      rating: 'green',
      summary: hasExplicitNoFeeNoApproval
        ? 'Contract explicitly states no transfer fees and no company approval required'
        : 'Contract supports clean transfer to a new homeowner when you sell',
      detail: 'The contract contains language that makes it straightforward for a home buyer to acquire the solar system. The transfer process is free and does not require company consent — protecting your home\'s marketability and reducing friction during any future sale.',
    })
  }

  // Add green flag when the contract explicitly confirms court rights / no arbitration.
  // noArbRequired, noCAWaiver, noJuryWaiver are computed above in block 5.
  if ((noArbRequired || noCAWaiver || noJuryWaiver) && !hasArb && !hasCA && !hasJury) {
    const items = [
      noArbRequired && 'no mandatory arbitration',
      noCAWaiver && 'no class action waiver',
      noJuryWaiver && 'jury trial right retained',
    ].filter(Boolean)
    homeownerFriendly.push({
      id: 'no_arbitration',
      label: 'No Arbitration Required — Customer Retains Court Rights',
      rating: 'green',
      summary: `Contract confirms: ${items.join('; ')}`,
      detail: 'The contract explicitly confirms that disputes are resolved in court, not mandatory arbitration. You retain the right to a jury trial and to pursue remedies in state or federal court. These are meaningful consumer protections that are absent from many solar contracts.',
    })
  }

  // ── FINANCIAL FLAGS ────────────────────────────────────────────────────────
  const financialFlags = []

  // 1. Dealer/broker fee detection
  // Expanded triggers include patterns for fees rolled into / incorporated into the loan.
  const hasDealerFeeText = has(text, [
    'dealer fee',
    'broker fee',
    'dealer markup',
    'dealer charge',
    'origination fee',
    'loan origination',
    'finance charge',
    'financed amount includes',
    'incorporated into the loan',
    'rolled into the loan',
    'added to the loan principal',
    'included in the loan principal',
    /fee\s+(?:paid\s+to|charged\s+by)\s+(?:the\s+)?(?:financing\s+)?broker/i,
    /(?:dealer|broker)\s+fee\s+(?:of|is|=)/i,
  ])

  // Attempt to extract a fee dollar amount directly from the contract text.
  // This fires the red flag even when context fields (system price, loan amount) are absent.
  const feeAmtMatch = firstMatch(text, [
    /(?:dealer|broker)\s+fee\s+of\s+\$\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:dealer|broker)\s+fee[^.]{0,60}\$\s*([\d,]+(?:\.\d{2})?)/i,
    /\$\s*([\d,]+(?:\.\d{2})?)[^.]{0,60}(?:dealer|broker)\s+fee/i,
    /fee[^.]{0,40}(?:incorporated|rolled|added|included)\s+into\s+the\s+loan[^.]{0,40}\$\s*([\d,]+(?:\.\d{2})?)/i,
    /\$\s*([\d,]+(?:\.\d{2})?)[^.]{0,60}(?:incorporated|rolled|added|included)\s+into\s+the\s+loan/i,
  ])
  const feeAmt = feeAmtMatch ? toFloat(feeAmtMatch[1]) : null

  const loanAmtMatch = firstMatch(text, [
    /(?:loan|financed)\s+(?:amount|principal)\s+(?:of\s+)?\$?\s*([\d,]+)/i,
    /principal\s+(?:amount|balance)\s+(?:of\s+)?\$?\s*([\d,]+)/i,
  ])
  const loanAmt = loanAmtMatch ? toFloat(loanAmtMatch[1]) : null
  const sysPrice = totalPrice ? toFloat(totalPrice) : null

  if (feeAmt) {
    // Dollar amount extracted directly from contract text — flag red with the exact figure.
    financialFlags.push({
      id: 'dealer_fee',
      label: `Dealer or Broker Fee — $${feeAmt.toLocaleString()} Added to Loan`,
      rating: 'red',
      summary: `$${feeAmt.toLocaleString()} dealer or broker fee incorporated into loan principal`,
      detail: `A dealer or broker fee of $${feeAmt.toLocaleString()} has been added to your loan principal. This means you are paying interest on this fee for the full loan term, significantly increasing its true cost. On a 20-year loan at 7%, a $${feeAmt.toLocaleString()} fee costs an additional $${Math.round(feeAmt * 0.94).toLocaleString()} in total interest — nearly doubling its out-of-pocket impact.`,
      negotiate: 'Request an itemized breakdown of all amounts in the loan principal. Dealer fees are negotiable — push to reduce or eliminate them before signing. Even a partial reduction saves significantly when compounded over a long loan term.',
    })
  } else if (hasDealerFeeText && loanAmt && sysPrice && loanAmt > sysPrice) {
    const diff = loanAmt - sysPrice
    financialFlags.push({
      id: 'dealer_fee',
      label: 'Dealer Fee — Loan Exceeds System Price',
      rating: 'red',
      summary: `Loan principal ($${loanAmt.toLocaleString()}) is $${diff.toLocaleString()} above system price`,
      detail: `The loan amount of $${loanAmt.toLocaleString()} exceeds your quoted system price of $${sysPrice.toLocaleString()} by $${diff.toLocaleString()} (${Math.round(diff / sysPrice * 100)}%). This difference is a dealer or broker fee added to the loan — you receive no additional goods or services for it, but you pay interest on the full inflated amount over the loan term.`,
      negotiate: 'Request an itemized breakdown of all amounts in the loan principal. Dealer fees are negotiable — push to reduce or eliminate them. Even cutting the fee by $2,000 saves significantly over a 20-year loan.',
    })
  } else if (hasDealerFeeText) {
    financialFlags.push({
      id: 'dealer_fee_language',
      label: 'Dealer or Broker Fee Language Detected',
      rating: 'yellow',
      summary: 'Contract references a dealer, broker, or origination fee — confirm the exact amount',
      detail: 'The contract mentions a dealer, broker, or origination fee. In solar loans, these fees are typically added to the loan principal — increasing your balance beyond the system cost and generating interest over the full loan term.',
      negotiate: 'Ask for the exact dollar amount of all fees added to the loan principal. Compare your final loan amount to the gross system price — the difference is the total fee you\'re financing.',
    })
  } else if (isLoan) {
    financialFlags.push({
      id: 'dealer_fee_check',
      label: 'Verify Loan Amount vs System Price',
      rating: 'yellow',
      summary: 'For solar loans, confirm the loan amount does not exceed the system cost',
      detail: 'Solar loans frequently include dealer fees that add 10–30% to the loan principal above the cost of the system. Ask your installer to explicitly confirm: (1) the gross system cost, (2) the total loan amount, and (3) any fees embedded in the loan.',
      negotiate: 'Request a Truth in Lending Act (TILA) disclosure showing the loan principal, any dealer fee, APR, and total repayment amount.',
    })
  }

  // 2. APR vs interest rate
  const apr = findAPR(text)
  const interestRate = findInterestRate(text)

  if (apr !== null) {
    if (apr > 8) {
      financialFlags.push({
        id: 'high_apr',
        label: `High APR — ${apr}% Exceeds 8% Benchmark`,
        rating: 'red',
        summary: `APR of ${apr}% is above typical solar loan range of 5–8%`,
        detail: `The contract states an APR of ${apr}%. Well-qualified borrowers in recent years have obtained solar loans in the 5–8% range. An APR above 8% may indicate a large embedded dealer fee, unfavorable terms, or a subprime rate. Note: a low stated interest rate paired with a high APR almost always signals a significant hidden dealer fee.`,
        negotiate: 'Obtain competing loan quotes from at least two other lenders and compare APRs — not just interest rates. A 2% APR difference on a $40,000 loan over 20 years can represent $15,000+ in additional interest.',
      })
    } else if (interestRate !== null && apr > interestRate + 0.75) {
      financialFlags.push({
        id: 'apr_gap',
        label: `APR (${apr}%) Significantly Higher Than Interest Rate (${interestRate}%)`,
        rating: 'yellow',
        summary: `${(apr - interestRate).toFixed(2)}% APR gap suggests embedded dealer or origination fees`,
        detail: `The gap between your stated interest rate (${interestRate}%) and APR (${apr}%) indicates significant fees are rolled into the loan. In solar financing, this gap is typically caused by a dealer or broker fee added to the principal. The wider the gap, the larger the embedded fee.`,
        negotiate: 'Ask for a full loan disclosure itemizing all fees. Calculate the implied fee amount by comparing your loan principal to the system price. This fee is negotiable — even eliminating half of it can save thousands in interest.',
      })
    } else {
      financialFlags.push({
        id: 'apr_ok',
        label: `APR of ${apr}% Disclosed`,
        rating: 'green',
        summary: `APR is stated and within a typical range for solar financing`,
        detail: `The contract discloses an APR of ${apr}%, which is within a reasonable range for solar loans. Confirm this matches the TILA disclosure you receive from the lender — APR must be disclosed before signing any loan agreement.`,
      })
    }
  } else if (isLoan) {
    financialFlags.push({
      id: 'no_apr',
      label: 'APR Not Clearly Stated in Contract Text',
      rating: 'red',
      summary: 'Federal law requires APR disclosure — not found in the provided text',
      detail: 'The Annual Percentage Rate (APR) was not identified in the contract text. The federal Truth in Lending Act (TILA) requires clear APR disclosure in any loan agreement. Without a disclosed APR, you cannot accurately compare this financing to alternatives. The APR — not just the interest rate — reflects the true cost of borrowing after all fees.',
      negotiate: 'Do not sign any loan agreement without a written TILA disclosure showing the APR, finance charge, total of payments, and payment schedule.',
    })
  }

  // 3. Prepayment penalty
  if (has(text, ['prepayment penalty', 'prepayment fee', 'early payoff fee',
    'early payoff penalty', 'penalty for early payment', 'prepayment premium'])) {
    financialFlags.push({
      id: 'prepayment',
      label: 'Prepayment Penalty',
      rating: 'red',
      summary: 'Contract includes a fee for paying off the loan early',
      detail: 'A prepayment penalty charges you a fee for paying off your loan ahead of schedule. This is particularly relevant if you plan to sell, refinance, or receive a windfall. Quality solar loans should carry no prepayment penalty — it is a significant restriction on your financial flexibility.',
      negotiate: 'Ask to have the prepayment penalty clause struck entirely. This is often a dealbreaker for homeowners who may want to refinance or sell within the loan term — and many lenders will agree to remove it.',
    })
  }

  // 4. Monitoring / maintenance / service fees
  if (has(text, ['monitoring fee', 'maintenance fee', 'service fee',
    'annual fee', 'subscription fee', 'annual maintenance', 'service contract fee'])) {
    const feeMatch = firstMatch(text, [
      /(?:monitoring|maintenance|service|annual)\s+fee\s+(?:of\s+)?\$?\s*([\d,]+(?:\.\d{2})?)/i,
      /\$\s*([\d,]+(?:\.\d{2})?)\s+(?:monitoring|maintenance|service|annual)\s+fee/i,
    ])
    const feeAmt = feeMatch ? feeMatch[1] : null
    financialFlags.push({
      id: 'service_fees',
      label: feeAmt ? `Service or Monitoring Fee: $${feeAmt}` : 'Service or Monitoring Fees',
      rating: 'yellow',
      summary: feeAmt
        ? `$${feeAmt} fee identified — confirm if included in quoted payment`
        : 'Service or monitoring fee language detected — verify amount and inclusion in quoted rate',
      detail: feeAmt
        ? `The contract includes a $${feeAmt} service or monitoring fee. Confirm whether this is included in your quoted monthly payment or charged separately. If separate, it meaningfully increases your true monthly cost.`
        : 'The contract references ongoing service, monitoring, or maintenance fees. Confirm the exact amounts, payment frequency, and whether they are embedded in your quoted payment or charged separately.',
      negotiate: 'Request that all fees be either eliminated or explicitly included in your fixed monthly payment. A separate annual fee is easy to overlook and adds to total cost.',
    })
  }

  // 5. Promotional period / deferred interest
  if (has(text, ['promotional period', 'introductory rate', 'deferred interest',
    'after the promotional', 'after.*18 month', 'after.*12 month', 'after.*24 month',
    'interest will accrue', 'retroactive interest'])) {
    financialFlags.push({
      id: 'promo_period',
      label: 'Promotional Period or Deferred Interest Detected',
      rating: 'red',
      summary: 'Rates or fees may change significantly after the promotional period ends',
      detail: 'Some solar financing includes a promotional period with lower rates or deferred interest. After it ends, the rate or payment may increase substantially. "Deferred interest" products can retroactively charge interest from the entire promotional period if any balance remains — this is not the same as 0% APR financing.',
      negotiate: 'Request the exact payment amount after the promotional period ends. Avoid deferred interest products entirely — they carry significant financial risk if the balance isn\'t paid off in full before the deadline. Simple interest loans are always preferable.',
    })
  }

  // 6. True-up / annual reconciliation
  if (has(text, ['true-up', 'true up', 'annual reconciliation', 'annual settlement',
    'annual true', 'annual billing period', 'net annual settlement'])) {
    financialFlags.push({
      id: 'true_up',
      label: 'Annual True-Up or Reconciliation Language',
      rating: 'yellow',
      summary: 'Contract references annual reconciliation — understand your potential exposure',
      detail: 'True-up or annual reconciliation refers to a year-end settlement of your solar credits against electricity consumed. If your system significantly underproduces during the year (due to shading, equipment issues, or weather), you may face a substantial year-end bill rather than monthly charges. Some homeowners are caught off guard by large true-up amounts.',
      negotiate: 'Ask the installer to model a true-up scenario where the system underproduces by 20%. Understand your maximum potential year-end exposure before signing.',
    })
  }

  // ── COST PER WATT ──────────────────────────────────────────────────────────
  let costPerWatt = null
  const parsedPrice = toFloat(totalPrice)
  const parsedKw = toFloat(systemSize)
  if (parsedPrice && parsedKw && parsedKw > 0) {
    const cpw = parsedPrice / (parsedKw * 1000)
    costPerWatt = {
      value: cpw,
      formatted: `$${cpw.toFixed(2)}/W`,
      rating: cpw < 2.5 ? 'yellow' : cpw <= 3.5 ? 'green' : cpw <= 4.5 ? 'yellow' : 'red',
      label: cpw < 2.5
        ? 'Below typical market range ($2.50–$3.50/W) — verify system quality and equipment'
        : cpw <= 3.5
          ? 'Within typical market range of $2.50–$3.50/W'
          : cpw <= 4.5
            ? 'Above typical market range — get at least 2 competing quotes'
            : 'Significantly above market — strong indicator to seek competing quotes before signing',
    }
  }

  // ── SAVINGS COMPARISON ─────────────────────────────────────────────────────
  let savingsComparison = null
  if (utilityRate && parsedKw && !utilityRate.loading) {
    const claimedSavings = findClaimedSavings(text)
    const realisticMonthly = parsedKw * 4 * 30 * utilityRate.ratePerKwh
    if (claimedSavings && realisticMonthly > 0) {
      const pctOver = ((claimedSavings - realisticMonthly) / realisticMonthly) * 100
      savingsComparison = {
        claimed: claimedSavings,
        realistic: +realisticMonthly.toFixed(2),
        pctOver: +pctOver.toFixed(1),
        overstated: pctOver > 20,
      }
    }
  }

  // ── NET METERING ───────────────────────────────────────────────────────────
  const netMeteringResult = state ? analyzeNetMetering(state) : null

  // ── MISSING PROTECTIONS ────────────────────────────────────────────────────
  const missingProtections = []

  const hasProdGuarantee = has(text, ['production guarantee', 'kwh guarantee',
    'energy production guarantee', 'guaranteed production', 'guaranteed output',
    'minimum production', 'guaranteed annual production'])
  const hasKwhCommitment = /\d{3,}\s*kwh/i.test(text)

  if (!hasProdGuarantee) {
    missingProtections.push({
      id: 'production_guarantee',
      label: 'Production Guarantee with Specific kWh Commitment',
      found: false,
      severity: 'red',
      detail: 'A production guarantee commits the installer to a minimum annual kWh output — for example, "the system will produce at least 9,500 kWh per year." Without a specific number, there is no enforceable recourse if the system underproduces.',
      ask: 'Request a written production guarantee stating a specific minimum annual kWh output. Ask what compensation or service you receive if production falls below that threshold in any 12-month period.',
    })
  } else if (!hasKwhCommitment) {
    missingProtections.push({
      id: 'production_guarantee_kwh',
      label: 'Production Guarantee Missing Specific kWh Target',
      found: false,
      severity: 'yellow',
      detail: 'A production guarantee was identified, but no specific kWh commitment was found in the text. A guarantee without a measurable target is difficult to enforce and may be interpreted narrowly by the company.',
      ask: 'Request that the contract state a specific annual kWh production target. "The system will meet your energy needs" is not an enforceable commitment — a number in kWh is.',
    })
  }

  if (!hasWorkmanshipWarranty) {
    missingProtections.push({
      id: 'workmanship_warranty',
      label: 'Workmanship / Installation Warranty',
      found: false,
      severity: 'red',
      detail: 'A workmanship warranty covers installation defects — roof leaks caused by panel mounting, wiring failures, and other errors made during installation. Panel and inverter manufacturer warranties won\'t cover these labor and installation issues.',
      ask: 'Request a separate workmanship warranty of at least 10 years, explicitly covering roof penetrations, wiring, mounting hardware, and all installation labor.',
    })
  }

  if (!has(text, [
    'warranty claim',
    'to file a claim',
    'submit a claim',
    'warranty service request',
    'how to request warranty',
    'warranty service procedure',
    'claim process',
    'to make a claim',
    'to request service',
    'service request',
    'warranty service',
    /claims?\s+under\s+(?:this|the)\s+warranty/i,
    /(?:contact|notify|call)\s+.{0,30}(?:warranty|service|claim)/i,
    /warranty\s+(?:repair|replacement|service)\s+(?:request|process|procedure)/i,
    /to\s+(?:obtain|request|initiate)\s+warranty/i,
  ])) {
    missingProtections.push({
      id: 'warranty_process',
      label: 'Warranty Claim Process',
      found: false,
      severity: 'yellow',
      detail: 'The contract should describe exactly how to submit a warranty claim: who to contact, what documentation is required, how long the company has to respond, and what escalation path exists if the claim is denied.',
      ask: 'Request a written warranty claim procedure covering: (1) contact information, (2) required documentation, (3) response time commitment, and (4) escalation if the claim is disputed.',
    })
  }

  // For cash purchases the homeowner owns the system outright — it conveys with the
  // property like any other fixture, so missing explicit "assumption" language is
  // less critical. Reduce severity to yellow and add more match patterns.
  const homeSaleFound = has(text, [
    'new homeowner',
    'home sale',
    'upon sale of',
    'upon the sale',
    'upon transfer of',
    'sale of the property',
    'sale of your home',
    'sale of the home',
    /sell(?:ing)?\s+(?:your\s+|the\s+)?(?:home|house|property)/i,
    /(?:new|future|subsequent)\s+(?:owner|buyer|purchaser)/i,
    /(?:buyer|purchaser)\s+(?:assumes?|accepts?|takes?\s+over)/i,
    /transfer\s+(?:of\s+)?(?:this\s+)?(?:agreement|contract)\s+to\s+(?:a\s+)?(?:new|future|subsequent)/i,
    /(?:property|home|house)\s+(?:is\s+)?(?:sold|transferred|conveyed)/i,
  ])
  if (!homeSaleFound) {
    missingProtections.push({
      id: 'home_sale',
      label: 'Home Sale Transfer Procedure',
      found: false,
      // Cash purchase: system is owned outright, conveys as property — lower severity
      severity: isCash ? 'yellow' : 'red',
      detail: isCash
        ? 'For owned systems, the solar equipment conveys with the home like any other fixture. Confirm the contract clarifies this and that all warranties transfer automatically to any buyer.'
        : 'The contract should explain exactly what happens when you sell your home — how the new buyer assumes the contract, the required timeline, what happens if the buyer refuses, and whether any fees apply.',
      ask: isCash
        ? 'Confirm the contract states that the system and all warranties transfer automatically to a future buyer with no fees or company approval required.'
        : 'Request a dedicated home sale transfer section covering: (1) exact assumption process, (2) maximum timeline for completion, (3) what happens if a buyer declines, and (4) whether any fees or company approval are required.',
    })
  }

  if (isLeasePPA || !has(text, ['end of term', 'contract expir', 'expiration of',
    'term ends', 'end of agreement', 'lease expir', 'at the end of the term', 'upon expiration'])) {
    if (isLeasePPA) {
      missingProtections.push({
        id: 'removal_terms',
        label: 'System Removal or Purchase Terms at Contract End',
        found: has(text, ['end of term', 'end of agreement', 'upon expiration', 'term ends']),
        severity: 'yellow',
        detail: 'For leases and PPAs, the contract should specify all options at the end of the term: purchase option price or formula, renewal terms, or system removal process — including who bears the removal cost.',
        ask: 'Request explicit language covering: (1) purchase option and price formula at contract end, (2) renewal terms if any, (3) removal process and who bears the cost, and (4) what happens to the roof if the system is removed.',
      })
    }
  }

  if (!has(text, [
    'right of rescission',
    'right to cancel',
    'rescission notice',
    'notice of cancellation',
    'notice of right to cancel',
    'cooling-off',
    'cooling off',
    /three\s*(?:\(3\))?\s*business\s+days?/i,
    /3\s*(?:\(3\))?\s*business\s+days?\s+(?:to\s+cancel|right|rescission)/i,
    /cancel\s+(?:this\s+)?(?:agreement|contract)\s+within\s+\d/i,
    /\d\s+(?:business\s+)?days?\s+(?:to\s+cancel|right\s+to\s+cancel)/i,
    /ftc\s+cooling.off/i,
  ])) {
    missingProtections.push({
      id: 'rescission',
      label: '3-Day Right of Rescission Notice',
      found: false,
      severity: 'red',
      detail: 'The FTC Cooling-Off Rule requires a written 3-day right of rescission for door-to-door sales over $25. The written notice must be provided at signing. Its absence doesn\'t eliminate the right — it actually extends it indefinitely — but signals possible compliance issues.',
      ask: 'Confirm you received a written Notice of Cancellation at the time of signing. If this was a door-to-door sale, federal law requires it. If not door-to-door, ask whether your state law provides a rescission right for solar contracts.',
    })
  }

  // ── OVERALL RISK RATING ────────────────────────────────────────────────────
  // Counts are computed from raw detections — no offsets — so the banner level
  // always matches the item counts shown in the UI chips and section headers.
  const redCount =
    highRisk.filter(c => c.rating === 'red').length +
    financialFlags.filter(f => f.rating === 'red').length +
    missingProtections.filter(m => m.severity === 'red' && !m.found).length

  const yellowCount =
    reviewCarefully.length +
    financialFlags.filter(f => f.rating === 'yellow').length +
    missingProtections.filter(m => m.severity === 'yellow' && !m.found).length

  const greenCount = homeownerFriendly.length + financialFlags.filter(f => f.rating === 'green').length

  // Thresholds map directly to displayed counts so the banner is always consistent:
  //   0 red                       → Low
  //   1 red  OR  3+ yellow        → Moderate
  //   2–3 red                     → Elevated
  //   4+ red                      → High
  let riskRating
  if (redCount >= 4) {
    riskRating = { level: 'High', color: 'red', icon: '✕', headline: 'Serious contract concerns — do not sign without legal review', description: `${redCount} high-risk clause${redCount !== 1 ? 's' : ''} and ${yellowCount} item${yellowCount !== 1 ? 's' : ''} to review were identified. This contract has multiple terms that significantly favor the installer over the homeowner. Attorney review is strongly recommended before signing.` }
  } else if (redCount >= 2) {
    riskRating = { level: 'Elevated', color: 'yellow', icon: '⚠', headline: `${redCount} high-risk clauses require attention`, description: `${redCount} high-risk clause${redCount !== 1 ? 's' : ''} and ${yellowCount} item${yellowCount !== 1 ? 's' : ''} to review were found. Address all flagged clauses through negotiation — and consider a licensed attorney — before signing.` }
  } else if (redCount >= 1 || yellowCount >= 3) {
    const headline = redCount >= 1
      ? `${redCount} high-risk clause requires attention`
      : 'Several items warrant careful review'
    const description = redCount >= 1
      ? `${redCount} high-risk item and ${yellowCount} item${yellowCount !== 1 ? 's' : ''} to review were found. Resolve the flagged clause before signing — and verify all review items are acceptable.`
      : `No high-risk clauses were detected, but ${yellowCount} items need clarification or negotiation before signing.`
    riskRating = { level: 'Moderate', color: 'yellow', icon: '⚠', headline, description }
  } else {
    riskRating = { level: 'Low', color: 'green', icon: '✓', headline: 'No major red flags detected in this analysis', description: `${yellowCount > 0 ? `${yellowCount} item${yellowCount !== 1 ? 's' : ''} worth reviewing were found, but no` : 'No'} high-risk clauses were identified. Standard due diligence — including multiple competing quotes and ideally a legal review — still applies before signing any solar contract.` }
  }

  return {
    riskRating,
    highRisk,
    reviewCarefully,
    homeownerFriendly,
    financialFlags,
    missingProtections,
    costPerWatt,
    savingsComparison,
    netMeteringResult,
    redCount,
    yellowCount,
    greenCount,
  }
}
