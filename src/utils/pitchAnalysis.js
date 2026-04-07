export const RED    = 'red'
export const YELLOW = 'yellow'

// ─── Tactic definitions ────────────────────────────────────────────────────────
export const TACTICS = {
  false_authority: {
    name: 'False Authority / Government Impersonation',
    severity: RED,
    summary: 'Implies utility or government affiliation that doesn\'t exist',
    detail: 'Solar companies have absolutely no affiliation with your utility company, local government, or federal agencies. Phrases like "the utility company sent me," "following up on the net metering program," or "government-backed program" are designed to borrow legitimacy from institutions you already trust. This is one of the most common door-to-door solar tactics — some state attorneys general have issued formal consumer warnings about it.',
  },
  expired_itc: {
    name: 'Expired Tax Credit Claim (Section 25D)',
    severity: RED,
    summary: 'The 30% federal residential solar tax credit expired December 31, 2025',
    detail: 'The federal residential solar Investment Tax Credit (Section 25D) expired for homeowners on December 31, 2025. Any salesperson claiming a "30% federal tax credit" or "government solar program" in 2026 is either deliberately misleading you or dangerously uninformed. If this credit was used to justify a lower net cost or faster payback period, the numbers in the quote are not accurate — demand a revised quote without this credit.',
  },
  artificial_urgency: {
    name: 'Artificial Urgency / High-Pressure Deadline',
    severity: RED,
    summary: 'Fabricated deadline designed to prevent you from getting competing quotes',
    detail: 'Legitimate solar companies do not have "today only" pricing or offers that expire at the end of an appointment. Solar equipment pricing is relatively stable — the same deal will be available next week. These manufactured deadlines exist for one reason: to prevent you from getting 2-3 competing quotes, which is exactly what you should do before signing anything. A company that won\'t honor the same price tomorrow is using a high-pressure sales tactic.',
  },
  social_proof_manipulation: {
    name: 'Social Proof Manipulation',
    severity: RED,
    summary: 'Using neighbors to create fear of missing out',
    detail: '"Your neighbor just signed up" and "half the street is already doing it" are designed to trigger FOMO and bypass your independent analysis. These claims are often unverifiable or exaggerated. Even if true, your neighbor\'s financial situation, roof conditions, utility rate, and contract terms may be completely different from yours. The fact that someone else signed up is not a reason for you to sign up.',
  },
  isolation_tactic: {
    name: 'Isolation / Pressure to Sign Without Advisors',
    severity: RED,
    summary: 'Pushing you to commit before family or advisors can review',
    detail: 'Any company that pushes you to sign a 20-25 year financial contract before your spouse, financial advisor, or attorney can review it is a major red flag. Legitimate solar companies will happily schedule a follow-up appointment. Pressure to sign on the spot — especially before your spouse can see it — is strongly associated with predatory sales practices and is a common complaint in state consumer protection filings.',
  },
  emotional_reframe: {
    name: '"Own vs Rent" Emotional Reframe',
    severity: YELLOW,
    summary: 'Psychologically compelling but oversimplifies a complex financial decision',
    detail: '"Own your power, stop renting from the utility" is rhetorically powerful — but misleading if you\'re being offered a lease or PPA. In those structures, you don\'t own the solar system either. You\'d be renting from a solar company instead of from your utility. The own vs. rent framing is most accurate only for cash purchases or loans that end in system ownership. Before the pitch lands, ask: "Am I actually buying this system, or signing a 20-year lease?"',
  },
  artificial_scarcity: {
    name: 'Artificial Scarcity / "You Qualify" Exclusivity',
    severity: YELLOW,
    summary: '"Only select homes qualify" creates desire through manufactured exclusivity',
    detail: 'Phrases like "only 30% of homes qualify" or "you\'re one of the lucky ones" are designed to make you feel selected and special before you\'ve agreed to anything. Most homes with adequate roof space and sun exposure do qualify for solar. The "qualification" language is primarily a psychological sales technique — not a genuine engineering assessment of your roof.',
  },
  misleading_free: {
    name: '"No Cost" / "No Money Out of Pocket" Framing',
    severity: YELLOW,
    summary: 'Technically true for day one, but conceals a 20-25 year financial obligation',
    detail: 'Solar leases and PPAs often require no upfront payment — so "no money out of pocket today" is technically accurate. But you\'re signing a multi-decade financial contract that can appear as a lien on your property title, complicate a home sale, and lock you into payments or rate structures for 20-25 years. Calling this "free" or "no cost" is deeply misleading about the total financial commitment involved.',
  },
  oversimplification: {
    name: '"Bill Swap" / "Bill Elimination" Oversimplification',
    severity: YELLOW,
    summary: 'Ignores escalator clauses, lease obligations, and home sale complications',
    detail: 'The "bill swap" framing ignores several key realities: many contracts include 1-3% annual escalator clauses that raise your payment over time; lease obligations may not transfer easily when you sell your home; solar production varies by season, weather, and panel degradation over 25 years. Ask for a full 25-year cost analysis — not just the monthly number — and specifically ask what happens to your obligation if you sell your home.',
  },
  false_familiarity: {
    name: 'False Familiarity / Utility Impersonation',
    severity: YELLOW,
    summary: 'Implies an existing relationship with your utility that doesn\'t exist',
    detail: '"We\'re following up because your utility replaced your meter" or "we\'re working with your utility company on this program" imply an affiliation that does not exist. Private solar companies have no access to your utility account, no relationship with your utility, and are not sent by anyone. This tactic is designed to lower your guard by borrowing trust from an institution you already have a real relationship with.',
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
        level: 'Very High',
        color: 'red',
        headline: 'Multiple Serious Manipulation Tactics Detected',
        description: `${redCount} serious red-flag tactics were detected in this pitch. This combination is strongly associated with predatory door-to-door solar sales. Do not sign anything. Get multiple competing quotes, and consider reporting this company to your state attorney general's consumer protection division.`,
      }
    } else if (redCount === 2) {
      risk = {
        level: 'High',
        color: 'red',
        headline: 'High-Pressure Tactics Detected',
        description: `${redCount} serious manipulation tactics were detected. Legitimate solar companies do not use these techniques. Walk away, take time to research the company independently, and get at least 3 competing quotes before making any decision.`,
      }
    } else if (redCount === 1) {
      risk = {
        level: 'High',
        color: 'red',
        headline: 'A Serious Manipulation Tactic Was Detected',
        description: 'One serious red-flag tactic was detected in this pitch. This warrants meaningful caution. Never sign a solar contract the same day you received the pitch — take time to verify all claims and get competing quotes.',
      }
    } else if (yellowCount >= 3) {
      risk = {
        level: 'Medium',
        color: 'yellow',
        headline: 'Several Concerning Tactics Detected',
        description: `${yellowCount} common sales tactics were detected. These aren't necessarily signs of fraud, but they're designed to influence your decision. Get competing quotes and ask pointed questions about what each tactic is obscuring in the financial details.`,
      }
    } else if (yellowCount >= 1) {
      risk = {
        level: 'Medium',
        color: 'yellow',
        headline: 'Some Common Sales Tactics Detected',
        description: 'A few standard solar sales tactics were detected. These are common in the industry but worth understanding before you sign anything. Take time to compare quotes and verify all claims independently.',
      }
    } else {
      risk = {
        level: 'Low',
        color: 'green',
        headline: 'No Major Red Flags Detected',
        description: 'Based on what you\'ve described, no serious manipulation tactics were detected. That said, always get at least 3 competing quotes and never sign the same day — even a clean pitch can come with a problematic contract.',
      }
    }
  }

  return { detected, redCount, yellowCount, risk }
}
