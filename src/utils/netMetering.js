export const NM_STRONG   = 'strong'
export const NM_MODERATE = 'moderate'
export const NM_WEAK     = 'weak'
export const NM_NONE     = 'none'

// Net metering policy by state — verified April 2026
// Sources: DSIRE / NC Clean Energy Technology Center, EIA, utility filings
const NET_METERING_POLICIES = {
  // Strong — full 1:1 retail-rate net metering
  NJ: NM_STRONG, MA: NM_STRONG, NY: NM_STRONG, MD: NM_STRONG,
  CT: NM_STRONG, VT: NM_STRONG, ME: NM_STRONG, RI: NM_STRONG,
  NH: NM_STRONG, PA: NM_STRONG, MN: NM_STRONG, WI: NM_STRONG,
  OR: NM_STRONG, WA: NM_STRONG, MT: NM_STRONG, NE: NM_STRONG,
  KS: NM_STRONG, IA: NM_STRONG, MI: NM_STRONG, OH: NM_STRONG,
  VA: NM_STRONG, NC: NM_STRONG, DE: NM_STRONG, DC: NM_STRONG,

  // Moderate — below retail, utility-specific, or limited programs
  FL: NM_MODERATE, AZ: NM_MODERATE, OK: NM_MODERATE, CO: NM_MODERATE,
  ID: NM_MODERATE, TX: NM_MODERATE, NV: NM_MODERATE, MO: NM_MODERATE,
  IN: NM_MODERATE, KY: NM_MODERATE, SC: NM_MODERATE, GA: NM_MODERATE,
  WY: NM_MODERATE, UT: NM_MODERATE, NM: NM_MODERATE, AR: NM_MODERATE,
  MS: NM_MODERATE, LA: NM_MODERATE, ND: NM_MODERATE, WV: NM_MODERATE,

  // Weak — net billing or minimal export credit (well below retail)
  CA: NM_WEAK,   // NEM 3.0 (Apr 2023): export credit dropped to 5–8¢/kWh from ~30¢
  HI: NM_WEAK,   // Smart Export program: self-consumption focus, low grid export value
  IL: NM_WEAK,   // CEJA (Jan 2025): moved to supply-only net metering, below retail

  // No statewide policy — export credit absent or negligible
  AL: NM_NONE,
  TN: NM_NONE,
  SD: NM_NONE,
  AK: NM_NONE,
}

const POLICY_LABEL = {
  [NM_STRONG]:   'Full Retail Net Metering',
  [NM_MODERATE]: 'Partial / Utility-Specific Net Metering',
  [NM_WEAK]:     'Net Billing (Below Retail)',
  [NM_NONE]:     'No Statewide Net Metering Policy',
}

const POLICY_DETAIL = {
  [NM_STRONG]:
    'Your state has full 1:1 retail-rate net metering. Excess solar energy exported to the grid earns credits at the same rate you pay for electricity, maximizing savings potential. The installer\'s savings projections should hold up — but confirm your specific utility participates, since some rural electric co-ops and municipal utilities are exempt from state mandates.',
  [NM_MODERATE]:
    'Your state\'s net metering policy is utility-specific or pays below the full retail rate for exported solar energy. Installer savings projections sometimes assume full retail-rate credits — ask exactly what export rate your utility pays and whether enrollment is capped. Actual savings could run 10–30% lower than projected depending on your usage profile and how much excess power you export.',
  [NM_WEAK]:
    'Your state has moved to a net billing or self-consumption model with significantly reduced export credit rates. Excess energy exported to the grid earns well below the retail rate. Systems are most valuable when solar production is consumed on-site rather than exported. If the installer\'s savings projections assume old net-metering-style rates, they may be substantially overstated. Adding battery storage can help maximize self-consumption.',
  [NM_NONE]:
    'Your state has no statewide net metering mandate. Without net metering, excess solar power exported to the grid earns little or nothing. Savings depend almost entirely on electricity consumed during daylight hours. Any installer savings projection that assumes retail-rate export credits is likely significantly inflated for your state.',
}

export const NM_SOURCE_NOTE = 'Policy data: DSIRE / NC Clean Energy Technology Center, verified April 2026. Policies change frequently — verify current policy at dsire.org before signing any solar contract.'

export function getNetMeteringPolicy(state) {
  return NET_METERING_POLICIES[state] ?? NM_MODERATE
}

export function analyzeNetMetering(state) {
  const policy = getNetMeteringPolicy(state)
  const label  = POLICY_LABEL[policy]
  const detail = POLICY_DETAIL[policy]

  let rating, summary

  if (policy === NM_STRONG) {
    rating  = 'green'
    summary = `${state}: ${label}`
  } else if (policy === NM_MODERATE) {
    rating  = 'yellow'
    summary = `${state}: ${label} — verify your utility's export rate`
  } else if (policy === NM_WEAK) {
    rating  = 'red'
    summary = `${state}: ${label} — savings projections may be overstated`
  } else {
    rating  = 'red'
    summary = `${state}: ${label} — savings limited to daytime self-consumption`
  }

  return {
    name: 'Net Metering Policy',
    rating,
    summary,
    detail: `${detail} ${NM_SOURCE_NOTE}`,
    metric: `State: ${state}  |  Policy: ${label}`,
    policy,
  }
}
