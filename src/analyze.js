import { analyzeNetMetering, NM_WEAK, NM_NONE } from './utils/netMetering'
export { analyzeNetMetering } from './utils/netMetering'

// Score tiers
export const GREEN = 'green'
export const YELLOW = 'yellow'
export const RED = 'red'

// ─── Price Fairness ───────────────────────────────────────────────────────────
export function analyzePriceFairness(totalPrice, systemSizeKw) {
  const price       = parseFloat(totalPrice)
  const kw          = parseFloat(systemSizeKw)
  const costPerWatt = price / (kw * 1000)

  let rating, summary, detail

  // Absolute-dollar flags take priority — large totals need justification
  // regardless of per-watt math (could be a legitimately large system).
  if (price > 75000) {
    rating  = RED
    summary = 'Extremely high total — demand a full itemized breakdown'
    detail  = `At $${price.toLocaleString()} total ($${costPerWatt.toFixed(2)}/W), this quote is in extremely high territory. While a large system (15–25 kW) can legitimately reach this price, you should receive a fully itemized breakdown showing panel count, inverter model, labor, permits, and overhead before signing anything. Get at least three competing quotes.`
  } else if (price > 60000) {
    rating  = YELLOW
    summary = 'Large system price — verify system size justifies this price'
    detail  = `At $${price.toLocaleString()} total ($${costPerWatt.toFixed(2)}/W), this is a significant investment. This price range is reasonable for large systems (typically 15+ kW), but confirm the system is actually sized for your consumption. Ask for a full production estimate in kWh and verify panel count matches the quoted kW capacity.`
  } else if (costPerWatt < 2.00) {
    rating  = RED
    summary = 'Suspiciously low — verify for hidden fees'
    detail  = `At $${costPerWatt.toFixed(2)}/watt, this quote is below the floor of legitimate pricing. Quotes this low often hide mandatory add-ons, exclude essential components, or may indicate a misrepresented system size. Request a fully itemized breakdown before proceeding.`
  } else if (costPerWatt <= 3.50) {
    rating  = GREEN
    summary = 'Within the fair market range'
    detail  = `At $${costPerWatt.toFixed(2)}/watt, this quote falls within the national benchmark of $2.50–$3.50/watt for residential solar. This is a reasonable price point, though pricing still varies by region, equipment tier, and install complexity.`
  } else if (costPerWatt <= 4.50) {
    rating  = YELLOW
    summary = 'Somewhat above average — get competing bids'
    detail  = `At $${costPerWatt.toFixed(2)}/watt, this quote is above the $2.50–$3.50/watt benchmark. It may be justifiable for premium equipment, complex installs, or high-cost-of-living areas — but you should get at least 2–3 competing quotes before committing.`
  } else {
    rating  = RED
    summary = 'Likely overpriced — seek multiple quotes immediately'
    detail  = `At $${costPerWatt.toFixed(2)}/watt, this quote is significantly above the national average. Most quality residential installs fall between $2.50–$3.50/watt. This price level warrants serious scrutiny and multiple competing quotes.`
  }

  return {
    name: 'Price Fairness',
    rating,
    summary,
    detail,
    metric: `Total: $${price.toLocaleString()}  |  Cost per watt: $${costPerWatt.toFixed(2)}/W  |  Benchmark: $2.50–$3.50/W`,
  }
}

// ─── Savings Claim Accuracy ───────────────────────────────────────────────────
// ratePerKwh: real local rate from EIA (or national fallback ~$0.13)
// netMeteringPolicy: NM_STRONG | NM_MODERATE | NM_WEAK | NM_NONE from netMetering.js
export function analyzeSavingsClaims(monthlySavings, monthlyBill, systemSizeKw, ratePerKwh = 0.13, netMeteringPolicy = null) {
  const savings = parseFloat(monthlySavings)
  const bill = parseFloat(monthlyBill)
  const ratio = savings / bill
  const pct = Math.round(ratio * 100)

  // Each kW of capacity produces ~120 kWh/month on average across the US.
  // Multiply by the real local rate to get a realistic savings estimate.
  const estimatedMaxSavings = parseFloat(systemSizeKw) * 120 * ratePerKwh
  const claimVsEstimate = savings / estimatedMaxSavings

  let rating, summary, detail

  if (ratio > 1.0) {
    rating = RED
    summary = 'Impossible — savings exceed your entire electric bill'
    detail = `The salesperson is claiming $${savings}/month in savings against your $${bill}/month bill — that's ${pct}% of your bill, which is mathematically impossible. Utility companies charge unavoidable fixed grid connection fees. This is a major red flag and likely a deceptive sales tactic.`
  } else if (ratio > 0.90) {
    rating = YELLOW
    summary = 'Aggressive claim — nearly eliminating your entire bill'
    detail = `Claiming ${pct}% bill offset is possible under ideal conditions (south-facing roof, high-sun state, large system, strong net metering) but is frequently overstated. Most homeowners realistically see 70–90% offset. Ask for the production estimate in kWh and verify the sun-hour and rate assumptions.`
  } else if (ratio <= 0.90 && claimVsEstimate > 1.4) {
    rating = YELLOW
    summary = 'Savings may be inflated relative to system size'
    detail = `The promised savings of $${savings}/month seems high for a ${systemSizeKw}kW system. At the local rate of ${(ratePerKwh * 100).toFixed(1)}¢/kWh, a system this size might realistically save ~$${Math.round(estimatedMaxSavings)}/month under average conditions. Ask for the kWh production estimate and verify the utility rate assumptions used in the quote.`
  } else if (ratio >= 0.50 && claimVsEstimate <= 1.4) {
    rating = GREEN
    summary = 'Savings claim appears reasonable'
    detail = `A ${pct}% bill offset ($${savings}/month) is within a plausible range for this system size at the local rate of ${(ratePerKwh * 100).toFixed(1)}¢/kWh. Still verify the assumptions: peak sun hours for your location, panel degradation rate, and whether net metering is available from your specific utility.`
  } else {
    rating = YELLOW
    summary = 'Low offset — verify system is sized for your needs'
    detail = `At ${pct}% bill offset, the system may be undersized for your consumption, or the projection may be conservative. Ask whether the system was sized to cover your full annual kWh usage and what annual production is guaranteed.`
  }

  // Downgrade rating and append warning for weak/no net metering states
  if (netMeteringPolicy === NM_WEAK || netMeteringPolicy === NM_NONE) {
    if (rating === GREEN) rating = YELLOW
    const nmWarning = netMeteringPolicy === NM_NONE
      ? ' Additionally, your state has no net metering — savings depend entirely on electricity self-consumed during daylight hours, not grid exports. Any projection assuming retail-rate bill credits for exported power is likely significantly overstated.'
      : ' Additionally, your state has moved to below-retail net billing. The installer\'s savings figure may assume old retail-rate export credits that no longer apply. Verify the exact export rate used in their production model.'
    detail += nmWarning
    if (summary.startsWith('Savings claim appears reasonable')) {
      summary = 'Savings claim needs net metering verification'
    }
  }

  return {
    name: 'Savings Claim Accuracy',
    rating,
    summary,
    detail,
    metric: `Promised savings: $${savings}/mo  |  Your bill: $${bill}/mo  |  Offset: ${pct}%  |  Est. max at local rate: $${Math.round(estimatedMaxSavings)}/mo`,
    ratePerKwh,
  }
}

// ─── Contract Risk ────────────────────────────────────────────────────────────
export function analyzeContractRisk(financialStructure, contractLength) {
  let rating, summary, detail
  const years = parseInt(contractLength) || 0

  if (financialStructure === 'cash') {
    rating = GREEN
    summary = 'No ongoing contract obligations'
    detail = `Cash purchases carry the lowest long-term risk. You own the system outright, can transfer ownership with the home, and have no monthly obligations. Ensure all warranty terms are documented in writing before signing.`
  } else if (financialStructure === 'loan') {
    if (years <= 12) {
      rating = GREEN
      summary = 'Standard loan term — reasonable risk'
      detail = `A ${years}-year solar loan is within the normal range. You own the system at completion. Verify there's no prepayment penalty and that this is not a PACE loan (which creates a property tax lien that can complicate home sales).`
    } else if (years <= 20) {
      rating = YELLOW
      summary = 'Longer loan term — calculate total interest cost'
      detail = `A ${years}-year loan will accrue significant interest over time. Request an amortization schedule showing total cost. You still own the system at completion, but verify there's no prepayment penalty if you sell your home early.`
    } else {
      rating = YELLOW
      summary = 'Long-term loan — review total cost carefully'
      detail = `A ${years}-year loan is on the longer end for solar financing. Request the full amortization schedule to understand total interest paid and ensure monthly payments remain manageable over the life of the loan.`
    }
  } else if (financialStructure === 'lease') {
    if (years <= 15) {
      rating = YELLOW
      summary = 'Lease has moderate risk — review transfer terms'
      detail = `Solar leases mean you don't own the system and may complicate home sales. A ${years}-year lease is relatively short. Key questions: Is there a purchase option at end of term? Who handles repairs and underperformance? What are the annual escalator terms?`
    } else if (years <= 20) {
      rating = YELLOW
      summary = 'Long lease — scrutinize all terms carefully'
      detail = `A ${years}-year lease is a significant commitment. Many homebuyers are reluctant to assume a leased-solar property (they must qualify and take over the lease, or you must buy it out). Verify annual escalator %, buyout amounts at each year, and underperformance remedies.`
    } else {
      rating = RED
      summary = 'Very long lease — high risk, difficult exit'
      detail = `A ${years}-year solar lease carries substantial risk. It can significantly delay or kill a home sale. Some homeowners have paid tens of thousands to buy out or remove leased systems. Strongly negotiate a shorter term or consider a loan or cash purchase instead.`
    }
  } else if (financialStructure === 'ppa') {
    if (years <= 15) {
      rating = YELLOW
      summary = 'PPA — you pay for power, not the system'
      detail = `A Power Purchase Agreement means you buy electricity from the panels at a contracted rate for ${years} years without owning the system. Key risks: annual rate escalators (often 2–3%/yr), complications when selling your home, and exposure if grid electricity rates fall. Verify the PPA rate is meaningfully below your current utility rate.`
    } else if (years <= 20) {
      rating = YELLOW
      summary = 'Long PPA — scrutinize the escalator clause'
      detail = `A ${years}-year PPA is a long commitment to a rate structure you can't easily exit. The annual escalator is critical — even 2%/yr compounds significantly over 20 years. Calculate the per-kWh rate you'd pay in year 20 and compare to realistic utility rate projections.`
    } else {
      rating = RED
      summary = 'Very long PPA — highest contract risk'
      detail = `A ${years}-year PPA is the highest-risk solar financing structure. You're locked into a third-party energy agreement for nearly three decades with no ownership benefit at the end. This makes selling your home very difficult. Strongly consider ownership-based alternatives.`
    }
  }

  return {
    name: 'Contract Risk',
    rating,
    summary,
    detail,
    metric: financialStructure === 'cash'
      ? 'Structure: Cash purchase'
      : `Structure: ${financialStructure.toUpperCase()}  |  Term: ${years} years`,
  }
}

// ─── Incentive Accuracy ───────────────────────────────────────────────────────
export function analyzeIncentiveAccuracy(incentives, state) {
  const claimsFederalITC = incentives.includes('federal_itc')
  const claimsNetMetering = incentives.includes('net_metering')

  let rating, summary, detail

  if (claimsFederalITC) {
    rating = RED
    summary = 'False claim: Section 25D federal tax credit expired December 31, 2025'
    detail = `The salesperson mentioned the federal residential solar tax credit (Section 25D, marketed as the "30% ITC" or "Residential Clean Energy Credit"), but this credit expired for homeowner cash purchases on December 31, 2025. There is no federal tax credit available for residential solar in 2026. Any quote that factors this credit into your net cost or payback period is using a non-existent incentive to make the deal look better than it is. This is a serious red flag — demand a fully revised quote with the federal credit removed before making any decision.`
  } else if (incentives.length === 0) {
    rating = YELLOW
    summary = 'No incentives mentioned — you may be leaving money on the table'
    detail = `The salesperson didn't mention any incentives. While the federal Section 25D residential tax credit expired December 31, 2025 (no federal credit for homeowner solar in 2026), many states and utilities still offer rebates, net metering, SRECs, property tax exemptions, or sales tax exemptions. Ask specifically what programs are available in ${state || 'your state'}.`
  } else {
    rating = GREEN
    summary = 'No invalid incentive claims detected'
    detail = `The incentives mentioned appear to be plausible offerings. Verify each one directly with your utility company or state energy office before factoring them into your financial decision. ${claimsNetMetering ? 'Note: net metering policies vary widely by utility — confirm the exact rate structure and buyback policy with your specific utility.' : ''}`
  }

  return {
    name: 'Incentive Accuracy',
    rating,
    summary,
    detail,
    metric: claimsFederalITC
      ? 'ALERT: Federal Section 25D credit claimed — expired Dec 31, 2025 (no credit in 2026)'
      : `Incentives claimed: ${incentives.length === 0 ? 'None' : incentives.length}`,
  }
}

// ─── Panel & Inverter Quality ─────────────────────────────────────────────────
const TIER1_BRANDS = [
  'lg', 'rec', 'panasonic', 'sunpower', 'silfab', 'qcells', 'q cells',
  'q.cells', 'jinko', 'longi', 'canadian solar',
]

export function analyzePanelQuality(panelBrand, inverterType) {
  const brandRaw = (panelBrand || '').trim()
  const brandLower = brandRaw.toLowerCase()

  const isBlank = !brandRaw
  const isGeneric = ['generic', 'unknown', 'generic/unknown', 'n/a', 'na', 'not specified'].includes(brandLower)
  const isTier1 = TIER1_BRANDS.some(b => brandLower.includes(b))

  let rating, summary, detail

  if (isBlank || isGeneric) {
    rating = YELLOW
    summary = 'Unknown or generic panel brand'
    detail = `The quote doesn't specify a recognized panel manufacturer. Generic or unbranded panels often have shorter effective lifespans, lower efficiency, and weaker warranty support. Tier 1 manufacturers (LG, REC, Panasonic, SunPower, Silfab, Qcells) have proven track records and strong warranty backing. Insist on knowing the exact make and model number.`
  } else if (isTier1) {
    rating = GREEN
    summary = `${brandRaw} is a Tier 1 manufacturer`
    detail = `${brandRaw} is recognized as a Tier 1 solar panel manufacturer, indicating strong financial stability, proven manufacturing quality, and reliable warranty support. This is a positive indicator for the long-term performance of your system.`
  } else {
    rating = YELLOW
    summary = `${brandRaw} — verify manufacturer reputation`
    detail = `${brandRaw} is not on the common Tier 1 list (LG, REC, Panasonic, SunPower, Silfab, Qcells). This doesn't mean the panels are poor quality, but you should independently verify the manufacturer's financial stability, panel efficiency ratings, and warranty terms before signing. Look up the model number and check independent reviews.`
  }

  // Add inverter note to detail
  const inverterNotes = {
    string: 'String inverters are cost-effective and proven, but a single failure affects the whole system and they perform poorly with partial shading.',
    microinverters: 'Microinverters optimize each panel independently, improving performance in shaded conditions and offering per-panel monitoring. Typically the most reliable long-term.',
    optimizers: 'Power optimizers combine panel-level optimization with a central inverter. Good shading tolerance with strong monitoring capability.',
    unknown: 'The inverter type was not specified. Request the exact make and model — inverter choice significantly affects performance, monitoring, and long-term reliability.',
  }
  if (inverterType && inverterNotes[inverterType]) {
    detail += ` Inverter note: ${inverterNotes[inverterType]}`
  }

  const inverterLabel = {
    string: 'String Inverter',
    microinverters: 'Microinverters',
    optimizers: 'Power Optimizers',
    unknown: 'Unknown',
  }

  return {
    name: 'Panel & Inverter Quality',
    rating,
    summary,
    detail,
    metric: `Panel brand: ${brandRaw || 'Not specified'}  |  Inverter: ${inverterLabel[inverterType] || 'Not specified'}`,
  }
}

// ─── Warranty Coverage ────────────────────────────────────────────────────────
export function analyzeWarranties(panelWarranty, inverterWarranty, workmanshipWarranty) {
  const pw = parseInt(panelWarranty) || 0
  const iw = parseInt(inverterWarranty) || 0
  const ww = parseInt(workmanshipWarranty) || 0

  const issues = []
  let worstRating = GREEN

  const flag = (rating, msg) => {
    if (rating === RED) worstRating = RED
    else if (rating === YELLOW && worstRating !== RED) worstRating = YELLOW
    issues.push({ rating, msg })
  }

  // Panel warranty
  if (pw === 0) {
    flag(YELLOW, 'Panel warranty not provided — request this in writing.')
  } else if (pw < 10) {
    flag(RED, `Panel warranty of ${pw} years is critically short (industry standard: 25 years).`)
  } else if (pw < 25) {
    flag(YELLOW, `Panel warranty of ${pw} years is below the industry standard of 25 years.`)
  }

  // Inverter warranty
  if (iw === 0) {
    flag(YELLOW, 'Inverter warranty not provided — request this in writing.')
  } else if (iw < 5) {
    flag(RED, `Inverter warranty of ${iw} years is critically short (standard: 10–12 years minimum).`)
  } else if (iw < 10) {
    flag(YELLOW, `Inverter warranty of ${iw} years is below the 10-year standard. Many quality inverters offer 10–25 years.`)
  }

  // Workmanship warranty
  if (ww === 0) {
    flag(YELLOW, 'Workmanship warranty not provided — this covers installer errors and should be in writing.')
  } else if (ww < 5) {
    flag(RED, `Workmanship warranty of ${ww} years is below the recommended minimum of 5 years.`)
  }

  let summary, detail

  if (worstRating === GREEN) {
    summary = 'All warranties within acceptable ranges'
    detail = `Panel warranty: ${pw} years, Inverter warranty: ${iw} years, Workmanship: ${ww} years. All fall within or above industry standards. Ensure these are documented in the final contract, not just verbal commitments.`
  } else {
    const redIssues = issues.filter(i => i.rating === RED)
    const yellowIssues = issues.filter(i => i.rating === YELLOW)
    summary = redIssues.length > 0
      ? `${redIssues.length} critical warranty gap${redIssues.length > 1 ? 's' : ''} found`
      : `${yellowIssues.length} warranty concern${yellowIssues.length > 1 ? 's' : ''} to address`
    detail = issues.map(i => i.msg).join(' ') + ' Always get warranties in writing as part of the signed contract — verbal promises are unenforceable.'
  }

  const pwLabel = pw ? `${pw}yr panel` : 'panel N/A'
  const iwLabel = iw ? `${iw}yr inverter` : 'inverter N/A'
  const wwLabel = ww ? `${ww}yr workmanship` : 'workmanship N/A'

  return {
    name: 'Warranty Coverage',
    rating: worstRating,
    summary,
    detail,
    metric: `${pwLabel}  |  ${iwLabel}  |  ${wwLabel}`,
  }
}

// ─── Escalator Clause ─────────────────────────────────────────────────────────
export function analyzeEscalatorClause(hasEscalator, escalatorPct, financialStructure) {
  if (hasEscalator !== 'yes') {
    // For lease/PPA with no escalator, that's actually great
    const isThirdParty = financialStructure === 'lease' || financialStructure === 'ppa'
    return {
      name: 'Escalator Clause',
      rating: GREEN,
      summary: 'No annual escalator — fixed payments',
      detail: isThirdParty
        ? `No annual escalator clause was included in this ${financialStructure.toUpperCase()}. Fixed payments are favorable — it means your cost doesn't increase over time, giving you more predictable savings if utility rates rise.`
        : `No escalator clause was reported for this financing structure, which is expected for cash purchases and most loans.`,
      metric: 'Annual escalator: None (fixed)',
    }
  }

  const pct = parseFloat(escalatorPct) || 0

  if (pct > 2.9) {
    return {
      name: 'Escalator Clause',
      rating: RED,
      summary: `${pct}% annual escalator — above industry standard`,
      detail: `An escalator clause of ${pct}% per year is above the industry norm of 0–2.9%. Over a 20-year contract, this compounds significantly: your payment in year 20 would be ~${Math.round(Math.pow(1 + pct / 100, 20) * 100 - 100)}% higher than your starting payment. This substantially erodes your savings, especially if utility rates don't increase at the same pace. Negotiate to lower or eliminate the escalator before signing.`,
      metric: `Annual escalator: ${pct}%  |  Industry norm: 0–2.9%  |  Year-20 increase: ~${Math.round(Math.pow(1 + pct / 100, 20) * 100 - 100)}%`,
    }
  } else if (pct === 0) {
    return {
      name: 'Escalator Clause',
      rating: GREEN,
      summary: 'Escalator clause present but at 0% (fixed)',
      detail: `The contract includes an escalator clause but sets it at 0%, effectively making it a fixed payment. This is a favorable term.`,
      metric: 'Annual escalator: 0% (fixed despite clause)',
    }
  } else {
    return {
      name: 'Escalator Clause',
      rating: YELLOW,
      summary: `${pct}% annual escalator — within norms, but verify`,
      detail: `A ${pct}% annual escalator is within the industry norm of 0–2.9%, but it still compounds over time. Over a 20-year contract your payment would be ~${Math.round(Math.pow(1 + pct / 100, 20) * 100 - 100)}% higher than your starting payment. This is only beneficial if utility rates rise faster than ${pct}%/year. Ask the installer to provide a comparison showing projected solar payments vs. projected utility rates over the full contract term.`,
      metric: `Annual escalator: ${pct}%  |  Industry norm: 0–2.9%  |  Year-20 increase: ~${Math.round(Math.pow(1 + pct / 100, 20) * 100 - 100)}%`,
    }
  }
}

// ─── Site Conditions ──────────────────────────────────────────────────────────
export function analyzeSiteConditions(shadingLevel, roofAge, roofType, financialStructure, hasBattery) {
  const issues = []
  let worstRating = GREEN

  const flag = (rating, msg) => {
    if (rating === RED) worstRating = RED
    else if (rating === YELLOW && worstRating !== RED) worstRating = YELLOW
    issues.push({ rating, msg })
  }

  // Shading
  if (shadingLevel === 'heavy') {
    flag(YELLOW, `Heavy shading can reduce solar production by 30–50% or more, depending on the hours affected. If the installer didn't explicitly account for your shading in the production estimate, the promised savings are likely overstated. Microinverters or power optimizers can partially mitigate shading losses — ask if they are included.`)
  } else if (shadingLevel === 'moderate') {
    flag(YELLOW, `Moderate shading will reduce system output compared to an unshaded site. Verify the installer modeled your specific shading in their production estimate (tools like PVWatts or Aurora should be used). Panel-level optimization (microinverters or power optimizers) is highly recommended for partially shaded roofs.`)
  }

  // Roof age
  const age = parseInt(roofAge) || 0
  if (age > 0 && age > 15) {
    flag(YELLOW, `A roof that is ${age} years old may need replacement within your solar contract period. The average asphalt shingle roof lasts 20–30 years. If your roof fails and needs replacement after panels are installed, you'll pay for panel removal and reinstallation (typically $1,500–$4,000). Ask whether the installer offers roof replacement or coordination services.`)
  }

  // Roof type note
  if (roofType === 'flat') {
    flag(YELLOW, `Flat roofs require special racking systems and drainage considerations. Ensure the quote includes appropriate mounting hardware and that the installer has experience with flat roof installations. Ponding water around panel bases is a common issue on flat roofs.`)
  }

  // Battery with lease/PPA
  const isThirdParty = financialStructure === 'lease' || financialStructure === 'ppa'
  if (isThirdParty && hasBattery === 'no') {
    flag(YELLOW, `With a ${financialStructure.toUpperCase()}, you don't own the solar system. Without battery storage, you also won't have power during outages — the system will shut down for safety when the grid goes down. Many homeowners are surprised by this. If backup power is important to you, a loan or cash purchase with battery storage may be worth considering.`)
  }

  let summary, detail, rating = worstRating

  if (issues.length === 0) {
    summary = 'No significant site concerns'
    detail = `Site conditions look favorable: ${shadingLevel === 'none' ? 'no shading' : 'minimal shading'}, ${age > 0 ? `roof is ${age} years old (within normal range)` : 'roof age not provided'}, and no other notable concerns. Standard due diligence applies.`
  } else {
    const count = issues.length
    summary = `${count} site condition${count > 1 ? 's' : ''} to factor in`
    detail = issues.map(i => i.msg).join(' ')
  }

  const shadingLabel = { none: 'None', minimal: 'Minimal', moderate: 'Moderate', heavy: 'Heavy' }
  const roofTypeLabel = { asphalt: 'Asphalt', metal: 'Metal', tile: 'Tile', flat: 'Flat/TPO', other: 'Other' }

  return {
    name: 'Site Conditions',
    rating,
    summary,
    detail,
    metric: [
      `Shading: ${shadingLabel[shadingLevel] || 'N/A'}`,
      age > 0 ? `Roof age: ${age} years` : 'Roof age: N/A',
      `Roof type: ${roofTypeLabel[roofType] || 'N/A'}`,
      `Battery: ${hasBattery === 'yes' ? 'Included' : hasBattery === 'no' ? 'Not included' : 'N/A'}`,
    ].join('  |  '),
  }
}

// ─── Company Red Flags ────────────────────────────────────────────────────────
// redFlagIds: array of self-reported flag IDs from the CompanyLookup checklist
export const COMPANY_RED_FLAGS = [
  {
    id: 'no_address',
    label: 'No physical business address provided',
    detail: 'Legitimate solar companies have a verifiable office address. A company that only gives a PO box or refuses to provide an address may not be established locally — making it difficult to pursue warranty claims or complaints.',
  },
  {
    id: 'no_license',
    label: "Salesperson couldn't provide a contractor license number",
    detail: 'Solar installers are required to be licensed in most states. Any legitimate company should be able to provide their license number immediately. Inability or refusal to do so is a serious red flag.',
  },
  {
    id: 'new_company',
    label: 'Company appears to have been created very recently',
    detail: "Newly formed solar companies carry higher risk — they may lack the operational history to honor 25-year panel warranties or 10-year workmanship guarantees. Search the company name + state on your Secretary of State's business registry to verify formation date.",
  },
  {
    id: 'pressure_tactics',
    label: 'High-pressure same-day signing pressure',
    detail: 'Legitimate solar companies don\'t require you to sign the same day. Phrases like "this price is only good today" or "we have limited slots this week" are classic high-pressure tactics. A trustworthy installer will give you time to review, compare quotes, and consult family.',
  },
  {
    id: 'vague_installer',
    label: 'Salesperson was vague about who actually installs the panels',
    detail: "Some solar companies are primarily sales organizations that subcontract all installation work. This isn't necessarily disqualifying, but you deserve to know who will be on your roof. Ask for the name of the installation crew or subcontractor and verify their license separately.",
  },
]

export function analyzeCompanyRedFlags(redFlagIds = []) {
  const count = redFlagIds.length

  if (count === 0) {
    return {
      name: 'Company Red Flags',
      rating: GREEN,
      summary: 'No red flags reported',
      detail: 'No salesperson red flags were reported. Continue verifying the company through BBB, your state licensing board, and online reviews before signing.',
      metric: 'Self-reported red flags: 0 of 5',
    }
  }

  const flaggedItems = COMPANY_RED_FLAGS.filter(f => redFlagIds.includes(f.id))
  const flagDetails = flaggedItems.map(f => `• ${f.label}: ${f.detail}`).join(' ')

  if (count >= 3) {
    return {
      name: 'Company Red Flags',
      rating: RED,
      summary: `${count} serious red flag${count > 1 ? 's' : ''} reported`,
      detail: `You reported ${count} red flags during the sales interaction. This combination is strongly associated with predatory solar sales practices. Do not sign anything under pressure. Walk away, verify the company's license independently, and get quotes from at least two other installers. ${flagDetails}`,
      metric: `Self-reported red flags: ${count} of 5`,
    }
  }

  if (count === 2) {
    return {
      name: 'Company Red Flags',
      rating: YELLOW,
      summary: '2 red flags reported — verify before signing',
      detail: `You reported 2 red flags during the sales interaction. While each individually might have an explanation, the combination warrants caution. Independently verify the company's license, look them up on BBB, and do not feel pressured to sign before you are ready. ${flagDetails}`,
      metric: `Self-reported red flags: 2 of 5`,
    }
  }

  // count === 1
  return {
    name: 'Company Red Flags',
    rating: YELLOW,
    summary: '1 red flag reported — ask for clarification',
    detail: `You reported 1 red flag during the sales interaction. Ask the company directly to address this concern before proceeding. ${flagDetails}`,
    metric: `Self-reported red flags: 1 of 5`,
  }
}

// ─── Overall Score ─────────────────────────────────────────────────────────────
export function computeOverall(scores) {
  const redCount = scores.filter(s => s.rating === RED).length
  const yellowCount = scores.filter(s => s.rating === YELLOW).length

  if (redCount >= 3) {
    return {
      rating: RED,
      title: 'High Risk — Multiple Serious Issues Found',
      description: `This quote has ${redCount} serious red flags. We strongly recommend against signing until each is addressed. Get multiple competing quotes and consider consulting an independent solar advisor.`,
    }
  } else if (redCount >= 1) {
    return {
      rating: RED,
      title: redCount === 1 ? 'Caution — One Serious Issue Found' : `Caution — ${redCount} Serious Issues Found`,
      description: `This quote has ${redCount === 1 ? 'a serious issue' : `${redCount} serious issues`} that must be addressed before you proceed. Review the red-flagged item${redCount > 1 ? 's' : ''} below and demand clarification or a revised quote.`,
    }
  } else if (yellowCount >= 3) {
    return {
      rating: YELLOW,
      title: 'Multiple Cautions — Proceed Carefully',
      description: `Several aspects of this quote warrant further scrutiny. Get 2–3 competing quotes and ask pointed questions about each flagged item before signing anything.`,
    }
  } else if (yellowCount >= 1) {
    return {
      rating: YELLOW,
      title: yellowCount === 1 ? 'Mostly Good — One Area to Clarify' : 'Mixed Results — A Few Areas to Clarify',
      description: `This quote is mostly reasonable but has ${yellowCount === 1 ? 'one area' : `${yellowCount} areas`} that deserve further clarification. Review the flagged item${yellowCount > 1 ? 's' : ''} and ask for more detail before signing.`,
    }
  } else {
    return {
      rating: GREEN,
      title: 'Looks Legitimate — Standard Due Diligence Applies',
      description: "This quote passed all our checks and appears to be within reasonable ranges. Still get 2–3 competing quotes before committing — even a 'clean' quote can be beaten on price or terms.",
    }
  }
}

// ─── Run full analysis ────────────────────────────────────────────────────────
// utilityRate: { rateCents, ratePerKwh, period, fallback } from eiaApi.js
//              pass null/undefined to fall back to the national average default
export function analyzeQuote(data, utilityRate) {
  const ratePerKwh = utilityRate?.ratePerKwh ?? 0.13

  // Compute net metering first so its policy flag can inform savings analysis
  const nmScore = analyzeNetMetering(data.state)

  const scores = [
    analyzePriceFairness(data.totalPrice, data.systemSize),
    analyzeSavingsClaims(data.monthlySavings, data.monthlyBill, data.systemSize, ratePerKwh, nmScore.policy),
    nmScore,
    analyzeContractRisk(data.financialStructure, data.contractLength),
    analyzeIncentiveAccuracy(data.incentives, data.state),
    analyzePanelQuality(data.panelBrand, data.inverterType),
    analyzeWarranties(data.panelWarranty, data.inverterWarranty, data.workmanshipWarranty),
    analyzeEscalatorClause(data.hasEscalator, data.escalatorPct, data.financialStructure),
    analyzeSiteConditions(data.shadingLevel, data.roofAge, data.roofType, data.financialStructure, data.hasBattery),
  ]

  const overall = computeOverall(scores)
  return { scores, overall }
}
