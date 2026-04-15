import { useState } from 'react'

const SITE_URL = 'https://solarshield.io'

const TWEET_TEXT = encodeURIComponent(
  `I just analyzed a solar quote with SolarShield — a free tool that checks for scams, predatory contracts, and expired tax credit claims. Check yours free at ${SITE_URL} #solar #consumerprotection`
)

export default function ShareButtons() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(SITE_URL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${TWEET_TEXT}`, '_blank', 'noopener,noreferrer')
  }

  function handleLinkedIn() {
    const url = encodeURIComponent(SITE_URL)
    const summary = encodeURIComponent('A free tool that analyzes solar quotes for scams, predatory contracts, and misleading savings claims.')
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${summary}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="share-block">
      <div className="share-heading">Know someone who got a solar pitch? Share this tool.</div>
      <div className="share-buttons">
        <button className="share-btn share-btn-copy" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="1" width="7.5" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><path d="M1 4.5h.5A1.5 1.5 0 013 6v5a1.5 1.5 0 001.5 1.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Copy Link
            </>
          )}
        </button>

        <button className="share-btn share-btn-x" onClick={handleTwitter}>
          <svg width="13" height="13" viewBox="0 0 300 300" fill="currentColor"><path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300h26.46l102.4-116.59L196.66 300H286L178.57 127.15zm-36.18 41.19-11.87-16.63L36.1 19.39h40.67l76.18 106.72 11.87 16.63 99.05 138.62h-40.67l-80.81-113.08z"/></svg>
          Share on X
        </button>

        <button className="share-btn share-btn-linkedin" onClick={handleLinkedIn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Share on LinkedIn
        </button>
      </div>
    </div>
  )
}
