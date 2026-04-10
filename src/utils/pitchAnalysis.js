export const RED    = 'red'
export const YELLOW = 'yellow'

// ─── Tactic definitions ────────────────────────────────────────────────────────
export const TACTICS = {
  false_authority: {
    name: 'False Authority Claim',
    severity: RED,
    summary: 'Implies utility or government affiliation that does not exist',
    detail: 'Solar companies have no affiliation with your utility company, local government, or federal agencies. Phrases like "the utility company sent me," "following up on the net metering program," or "government-backed program" can lend unearned legitimacy to a sales visit by referencing institutions you already have a relationship with. This is a common door-to-door solar technique that some state attorneys general have addressed in formal consumer advisories.',
  },
  expired_itc: {
    name: 'Expired Tax Credit Reference (Section 25D)',
    severity: RED,
    summary: 'The 30% federal residential solar tax credit expired December 31, 2025',
    detail: 'The federal residential solar Investment Tax Credit (Section 25D) expired for homeowners on December 31, 2025. A salesperson referencing a "30% federal tax credit" or "government solar program" in 2026 may be working from outdated information or unaware of current law. If this credit was used to calculate a lower net cost or faster payback period, those figures should be revisited — request a revised quote that does not include this credit.',
  },
  artificial_urgency: {
    name: 'Urgency / Same-Day Deadline Pressure',
    severity: RED,
    summary: 'Time-limited offer framing used to encourage a decision before you can compare quotes',
    detail: 'Legitimate solar companies do not typically have offers that expire at the end of a single appointment. Solar equipment pricing is relatively stable — comparable pricing is generally available regardless of when you decide. Time-limited framing is commonly used in sales contexts to encourage a decision before a homeowner has had a chance to obtain competing quotes, which is the standard recommendation before committing to any solar installation.',
  },
  social_proof_manipulation: {
    name: 'Neighbor / Social Proof References',
    severity: RED,
    summary: 'References to neighbors used to encourage a quick decision',
    detail: '"Your neighbor just signed up" and "half the street is already doing it" are used to create a sense of urgency around a financial decision. These claims are often difficult to verify. Even when true, a neighbor\'s financial situation, roof conditions, utility rate, and contract terms may be substantially different from yours. A neighboring household\'s decision is not a reliable basis for your own.',
  },
  isolation_tactic: {
    name: 'Same-Day Signing Pressure',
    severity: RED,
    summary: 'Pressure to commit before family members or advisors can review the contract',
    detail: 'A 20-25 year financial contract warrants careful review by all relevant parties — including a spouse, financial advisor, or attorney. Companies that prefer a same-day decision before others can weigh in make it more difficult for homeowners to conduct independent due diligence. Standard consumer protection guidance recommends taking time to review any long-term contract before signing.',
  },
  emotional_reframe: {
    name: '"Own vs Rent" Framing',
    severity: YELLOW,
    summary: 'Compelling framing that may not apply accurately to the product being offered',
    detail: '"Own your power, stop renting from the utility" is a compelling frame — but it may be incomplete if the product being offered is a lease or PPA. In those structures, the homeowner does not own the solar system. The own vs. rent language is most accurate when applied to cash purchases or loans that end in outright ownership. It is worth asking directly: "Am I purchasing this system, or entering a long-term lease agreement?"',
  },
  artificial_scarcity: {
    name: 'Qualification / Scarcity Framing',
    severity: YELLOW,
    summary: '"Only select homes qualify" used to create a sense of exclusivity',
    detail: 'Phrases like "only 30% of homes qualify" or "you\'re one of the lucky ones" are used to create a sense of exclusivity early in a sales conversation. Most homes with adequate roof space and sun exposure meet basic solar installation criteria. The "qualification" language is primarily a sales framing technique rather than a reflection of a detailed engineering assessment of your specific property.',
  },
  misleading_free: {
    name: '"No Cost" / "No Money Out of Pocket" Framing',
    severity: YELLOW,
    summary: 'Accurate for day one, but may understate a long-term financial obligation',
    detail: 'Solar leases and PPAs typically require no upfront payment, so "no money out of pocket today" is accurate in a narrow sense. However, these agreements involve a multi-decade financial commitment that can appear as an encumbrance on your property title, affect a future home sale, and obligate you to payments or rate structures for 20-25 years. It is worth understanding the full financial picture before treating any solar arrangement as a no-cost proposition.',
  },
  oversimplification: {
    name: '"Bill Swap" / Bill Elimination Framing',
    severity: YELLOW,
    summary: 'A simplified framing that may not capture the full financial picture',
    detail: 'The "bill swap" framing — replacing your utility bill with a solar payment — is straightforward in concept but may not reflect the full picture. Many contracts include 1-3% annual escalator clauses that increase your payment each year. Lease obligations may not transfer straightforwardly when selling your home. Solar production also varies by season, weather, and system degradation over time. Requesting a full 25-year cost analysis, including escalator terms and transfer provisions, gives a more complete view.',
  },
  false_familiarity: {
    name: 'Utility Familiarity Claim',
    severity: YELLOW,
    summary: 'Implies an existing relationship with your utility that does not exist',
    detail: '"We\'re following up because your utility replaced your meter" or "we\'re working with your utility company on this program" suggest an affiliation that private solar companies do not have. Solar companies do not have access to individual utility accounts and are not dispatched by utility providers. This approach may borrow familiarity from an institution you already have a relationship with to establish early rapport.',
  },
}

// ─── Checklist item → tactic mapping ──────────────────────────────────────────
const CHECKLIST_TACTIC_MAP = {
  decide_today:       ['artificial_urgency'],
  tax_credit:         ['expired_itc', 'false_authority'],
  utility_sent:       ['false_authority'],
  sign_before_spouse: ['isolation_tactic'],
  roof_perfect:       ['artificial_scarcity'],
  neighbors:          ['social_proof_manipulation'],
  thirty_pct:         ['expired_itc'],
  no_money_out:       ['misleading_free'],
  bill_swap:          ['emotional_reframe', 'oversimplification'],
  power_bill:         [], // informational, no specific tactic flagged
  government_backed:  ['false_authority'],
  qualify:            ['artificial_scarcity'],
}

// ─── Free-text keyword patterns ────────────────────────────────────────────────
const KEYWORD_PATTERNS = [
  {
    pattern: /government.{0,10}backed|utility.{0,5}sent|net metering program|following up.{0,20}program|working with.{0,10}utility|utility.{0,5}program|sent by.{0,15}utility|on behalf of.{0,15}utility/i,
    tactic: 'false_authority',
  },
  {
    pattern: /30\s*%|thirty.?percent|federal (tax )?credit|itc\b|investment tax credit|section 25d|clean energy credit|solar (tax )?credit|residential credit/i,
    tactic: 'expired_itc',
  },
  {
    pattern: /today only|only today|expires? (today|tonight|at midnight|this week|end of month)|this offer|limited time|my manager (approved|authorized)|special (deal|price|discount|offer)|won'?t (last|be available)|now or never|price goes up|one.?time (offer|deal)/i,
    tactic: 'artificial_urgency',
  },
  {
    pattern: /neighbor|neighborhood|next door|down the street|already signed|people on your street|your street|your block|house(s)? around here/i,
    tactic: 'social_proof_manipulation',
  },
  {
    pattern: /sign (today|now|tonight|right now)|before.{0,20}spouse|without.{0,15}(wife|husband)|don'?t (need|have) to (ask|tell|wait|involve)|your (wife|husband|spouse) (doesn'?t|don'?t|won'?t|can'?t)/i,
    tactic: 'isolation_tactic',
  },
  {
    pattern: /own your (power|energy|electricity)|stop renting|renting.{0,20}utility|own vs.{0,10}rent|rent vs.{0,10}own/i,
    tactic: 'emotional_reframe',
  },
  {
    pattern: /bill swap|swap.{0,10}bill|eliminate.{0,10}bill|no more.{0,10}bill|replace.{0,10}bill|get rid of.{0,10}bill/i,
    tactic: 'oversimplification',
  },
  {
    pattern: /\bqualif(y|ied|ication)\b|not everyone|only \d{1,2}\s*%\s*of homes?|select (homes?|neighborhood|area)|chosen|pre.?approved|you'?re one of|lucky (ones?|few)/i,
    tactic: 'artificial_scarcity',
  },
  {
    pattern: /no money (down|out of pocket)|nothing out of pocket|zero (down|cost|money|out of pocket)|no (upfront |out.of.pocket )?(cost|charge|payment)|completely free|free (solar|energy|electricity|panels?)/i,
    tactic: 'misleading_free',
  },
  {
    pattern: /meter.{0,20}(replaced?|upgraded?|changed?|installed?)|in your area for|checking.{0,20}account|utility.{0,10}(sent|assigned|dispatched)|on behalf of.{0,10}(your utility|the utility|pg.?e|con ed|edison)/i,
    tactic: 'false_familiarity',
  },
]

// ─── Main analysis function ────────────────────────────────────────────────────
export function analyzePitch(text, checkedItems) {
  const detectedSet = new Set()

  // From checklist selections
  for (const itemId of checkedItems) {
    const tactics = CHECKLIST_TACTIC_MAP[itemId] ?? []
    tactics.forEach(t => detectedSet.add(t))
  }

  // From free-text keyword matching
  if (text.trim().length > 0) {
    for (const { pattern, tactic } of KEYWORD_PATTERNS) {
      if (pattern.test(text)) detectedSet.add(tactic)
    }
  }

  // Sort: reds first, then yellows
  const detected = [...detectedSet]
    .map(id => ({ id, ...TACTICS[id] }))
    .sort((a, b) => {
      if (a.severity === RED && b.severity !== RED) return -1
      if (a.severity !== RED && b.severity === RED) return 1
      return 0
    })

  const redCount    = detected.filter(t => t.severity === RED).length
  const yellowCount = detected.filter(t => t.severity === YELLOW).length

  let risk = null
  const nothingEntered = checkedItems.length === 0 && text.trim().length < 20

  if (!nothingEntered) {
    if (redCount >= 3) {
      risk = {
        level: 'Significant Concerns Identified',
        color: 'red',
        headline: 'Multiple High-Risk Sales Tactics Identified',
        description: `${redCount} high-risk sales techniques were identified in this pitch. This combination warrants careful consideration before proceeding. We recommend taking additional time before signing anything, obtaining at least three independent quotes, and verifying the company's credentials through your state licensing board and consumer protection resources.`,
      }
    } else if (redCount === 2) {
      risk = {
        level: 'Notable Concerns Found',
        color: 'red',
        headline: 'High-Risk Sales Techniques Identified',
        description: `${redCount} high-risk sales techniques were identified. These approaches are not consistent with standard industry practice among established solar installers. Take time to independently research the company and obtain at least three competing quotes before making any decision.`,
      }
    } else if (redCount === 1) {
      risk = {
        level: 'Notable Concerns Found',
        color: 'red',
        headline: 'A High-Risk Sales Technique Was Identified',
        description: 'One high-risk sales technique was identified in this pitch. We recommend reviewing the details below, verifying all claims independently, and obtaining competing quotes before signing any contract.',
      }
    } else if (yellowCount >= 3) {
      risk = {
        level: 'Some Tactics Identified',
        color: 'yellow',
        headline: 'Several Sales Techniques to Be Aware Of',
        description: `${yellowCount} common sales techniques were identified. These are frequently used in the solar industry and are not necessarily indicators of a problematic company, but understanding what each one involves will help you ask better questions and evaluate any contract more clearly.`,
      }
    } else if (yellowCount >= 1) {
      risk = {
        level: 'Some Tactics Identified',
        color: 'yellow',
        headline: 'Some Common Sales Techniques Identified',
        description: 'A few common solar sales techniques were identified. These are worth understanding before you review any contract. Take time to compare quotes and verify all claims independently.',
      }
    } else {
      risk = {
        level: 'Standard Sales Approach',
        color: 'green',
        headline: 'No High-Risk Techniques Identified',
        description: 'Based on what you described, no high-risk sales techniques were identified. As a general practice, obtaining at least three competing quotes and taking time to review any contract before signing remains the recommended approach for any solar installation.',
      }
    }
  }

  return { detected, redCount, yellowCount, risk }
}
