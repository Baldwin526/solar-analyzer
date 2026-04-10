import { useState, useRef, useCallback } from 'react'
import { analyzeContract } from '../utils/contractAnalysis'
import { fetchStateElectricityRate } from '../utils/eiaApi'

// ─── PDF.js loader ──────────────────────────────────────────────────────────────
async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('Failed to load PDF.js'))
    document.head.appendChild(script)
  })
}

async function extractTextFromPdf(file) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map(item => item.str).join(' ') + '\n'
  }
  return fullText
}

// ─── State list ─────────────────────────────────────────────────────────────────
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],
  ['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],
  ['DC','Washington D.C.'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],
  ['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
  ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],
  ['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],
  ['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],
  ['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],
  ['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
]

const FINANCIAL_STRUCTURES = ['Cash', 'Loan', 'Lease', 'PPA']

const WHAT_TO_DO_NEXT = [
  { num: '01', text: 'Read the full contract yourself — not just the summary page. Every clause in a 20–25 year agreement matters.' },
  { num: '02', text: 'Request a year-by-year payment schedule for the full contract term, including any escalator projections.' },
  { num: '03', text: 'Get at least 2–3 competing quotes from other installers before committing to any contract.' },
  { num: '04', text: 'Have a licensed attorney review the contract before signing — particularly for leases, PPAs, or any contract with a UCC filing.' },
  { num: '05', text: 'Verify the installer\'s contractor license with your state licensing board and check their BBB and Google Reviews for complaint patterns.' },
  { num: '06', text: 'Confirm your specific utility\'s current net metering policy at dsire.org — installer projections may use outdated rate assumptions.' },
  { num: '07', text: 'Never sign the same day as the pitch — take at least 48–72 hours to review and research before committing.' },
]

// ─── Sub-components ─────────────────────────────────────────────────────────────
function ClauseItem({ item, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? item.rating === 'red')
  const badgeLabel = item.rating === 'red' ? '✕ High-Risk'
    : item.rating === 'yellow' ? '⚠ Review Carefully'
    : '✓ Positive'

  return (
    <div className="ca-clause-item">
      <div className="ca-clause-header" onClick={() => setOpen(o => !o)}>
        <div className="score-left">
          <div className={`score-dot ${item.rating}`} />
          <span className="score-name">{item.label}</span>
        </div>
        <div className="score-right">
          <span className={`score-badge ${item.rating}`}>{badgeLabel}</span>
          <span className={`score-chevron ${open ? 'open' : ''}`}>▾</span>
        </div>
      </div>
      {open && (
        <div className="score-detail">
          {item.summary && <p className="ca-clause-summary">{item.summary}</p>}
          <p>{item.detail}</p>
          {item.negotiate && (
            <p className="ca-negotiate-hint">
              <span className="ca-negotiate-label">What to negotiate: </span>
              {item.negotiate}
            </p>
          )}
          {item.table && <EscalatorTable tableData={item.table} />}
        </div>
      )}
    </div>
  )
}

function MissingItem({ item }) {
  return (
    <div className={`ca-missing-item ${!item.found ? (item.severity === 'red' ? 'missing-red' : 'missing-yellow') : 'found'}`}>
      <div className="ca-missing-indicator">
        {item.found
          ? <span className="ca-missing-check green">✓</span>
          : item.severity === 'red'
            ? <span className="ca-missing-check red">✕</span>
            : <span className="ca-missing-check yellow">⚠</span>
        }
      </div>
      <div className="ca-missing-body">
        <div className="ca-missing-label">{item.label}</div>
        <div className="ca-missing-detail">{item.found ? 'Found in contract.' : item.detail}</div>
        {!item.found && item.ask && (
          <div className="ca-missing-ask">
            <span className="ca-negotiate-label">Ask for: </span>
            {item.ask}
          </div>
        )}
      </div>
    </div>
  )
}

function EscalatorTable({ tableData }) {
  if (!tableData || !tableData.base) return null
  const { pct, base, rows } = tableData
  return (
    <div className="ca-escalator-table-wrap">
      <div className="ca-escalator-table-label">
        {pct}% Annual Escalator — Payment Growth Over Contract Life
      </div>
      <table className="ca-escalator-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Monthly Payment</th>
            <th>Annual Total</th>
            <th>Increase vs Year 1</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.year} className={row.year === 1 ? 'ca-table-row-base' : ''}>
              <td>{row.year}</td>
              <td>${row.monthly.toFixed(2)}</td>
              <td>${row.annual.toFixed(0)}</td>
              <td className={row.year > 1 ? 'ca-table-delta' : 'ca-table-base-label'}>
                {row.year === 1
                  ? 'Baseline'
                  : `+$${(row.monthly - base).toFixed(2)}/mo (+${Math.round((row.monthly / base - 1) * 100)}%)`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CollapsibleSection({ title, count, countColor, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="ca-section">
      <div className="ca-section-header" onClick={() => setOpen(o => !o)}>
        <div className="ca-section-title-row">
          <span className="ca-section-title">{title}</span>
          {count !== undefined && (
            <span className={`ca-section-count ${countColor || 'neutral'}`}>{count}</span>
          )}
        </div>
        <span className={`score-chevron ${open ? 'open' : ''}`}>▾</span>
      </div>
      {open && <div className="ca-section-body">{children}</div>}
    </div>
  )
}

function SectionSubheader({ label, color }) {
  return (
    <div className={`ca-subheader ${color}`}>
      <span className={`score-dot ${color}`} style={{ width: 7, height: 7 }} />
      <span>{label}</span>
    </div>
  )
}

function CostPerWattBadge({ cpw }) {
  if (!cpw) return null
  return (
    <div className={`ca-stat-badge ${cpw.rating}`}>
      <div className="ca-stat-badge-label">Cost per Watt</div>
      <div className="ca-stat-badge-value">{cpw.formatted}</div>
      <div className="ca-stat-badge-desc">{cpw.label}</div>
    </div>
  )
}

function NetMeteringBadge({ nm }) {
  if (!nm) return null
  return (
    <div className={`ca-stat-badge ${nm.rating}`}>
      <div className="ca-stat-badge-label">Net Metering — {nm.metric?.split('|')[0]?.trim()}</div>
      <div className="ca-stat-badge-value">{nm.summary}</div>
      <div className="ca-stat-badge-desc" style={{ marginTop: 6 }}>{nm.detail}</div>
    </div>
  )
}

function SavingsComparisonBadge({ sc, state, utilityRate }) {
  if (!sc || !utilityRate) return null
  return (
    <div className={`ca-stat-badge ${sc.overstated ? 'red' : 'green'}`}>
      <div className="ca-stat-badge-label">Savings Claim vs Realistic Estimate ({state})</div>
      <div className="ca-stat-badge-value">
        Claimed: ${sc.claimed}/mo · Estimated realistic: ${sc.realistic}/mo
        {sc.overstated && ` · ${sc.pctOver}% higher than estimate`}
      </div>
      <div className="ca-stat-badge-desc">
        {sc.overstated
          ? `The claimed monthly savings of $${sc.claimed} is ${sc.pctOver}% above what a ${state} EIA residential rate of ${(utilityRate.ratePerKwh * 100).toFixed(1)}¢/kWh would suggest for this system size. Verify the installer's assumptions about production, net metering rates, and your actual usage profile.`
          : `The claimed monthly savings of $${sc.claimed} is consistent with what a ${state} EIA residential rate of ${(utilityRate.ratePerKwh * 100).toFixed(1)}¢/kWh would suggest for this system size.`
        }
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function ContractAnalyzer() {
  const [inputMode, setInputMode]     = useState('pdf')
  const [pdfFile, setPdfFile]         = useState(null)
  const [pdfText, setPdfText]         = useState('')
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [pdfError, setPdfError]       = useState(null)
  const [pasteText, setPasteText]     = useState('')
  const [isDragOver, setIsDragOver]   = useState(false)
  const [context, setContext]         = useState({
    state: '', monthlyBill: '', systemSize: '', totalPrice: '', financialStructure: '',
  })
  const [results, setResults]         = useState(null)
  const [analyzing, setAnalyzing]     = useState(false)
  const fileInputRef                  = useRef()

  const contractText = inputMode === 'pdf' ? pdfText : pasteText
  const canAnalyze = contractText.trim().length > 100

  // ── PDF handling ─────────────────────────────────────────────────────────────
  async function processPdfFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file.')
      return
    }
    setPdfFile(file)
    setPdfError(null)
    setPdfLoading(true)
    setPdfText('')
    try {
      const text = await extractTextFromPdf(file)
      if (text.trim().length < 50) {
        setPdfError('Could not extract readable text from this PDF. It may be scanned or image-based. Please paste the contract text below instead.')
        setPdfText('')
      } else {
        setPdfText(text)
      }
    } catch (err) {
      console.error('[ContractAnalyzer] PDF extraction failed:', err)
      setPdfError('PDF text extraction failed. This can happen with scanned documents or secured PDFs. Please paste the contract text below instead.')
      setPdfText('')
    } finally {
      setPdfLoading(false)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processPdfFile(file)
  }, [])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragOver(false), [])

  function onFileInputChange(e) {
    const file = e.target.files[0]
    if (file) processPdfFile(file)
    e.target.value = ''
  }

  // ── Analysis ─────────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!canAnalyze) return
    setAnalyzing(true)

    let utilityRate = null
    if (context.state) {
      try { utilityRate = await fetchStateElectricityRate(context.state) }
      catch { /* fallback handled inside fetchStateElectricityRate */ }
    }

    const result = analyzeContract(contractText, { ...context, utilityRate })
    setResults({ ...result, utilityRate })
    setAnalyzing(false)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('ca-results-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function handleReset() {
    setPdfFile(null)
    setPdfText('')
    setPdfError(null)
    setPasteText('')
    setResults(null)
    setAnalyzing(false)
    setContext({ state: '', monthlyBill: '', systemSize: '', totalPrice: '', financialStructure: '' })
    setInputMode('pdf')
  }

  function updateContext(field, val) {
    setContext(prev => ({ ...prev, [field]: val }))
  }

  // ── Render: input ─────────────────────────────────────────────────────────────
  if (!results) {
    return (
      <div>
        <div className="form-header">
          <h2>Contract Analyzer</h2>
          <p>Upload or paste your solar contract to scan it for predatory clauses, hidden fees, and missing consumer protections.</p>
        </div>

        {/* Input mode toggle */}
        <div className="ca-input-tabs">
          <button
            className={`ca-input-tab ${inputMode === 'pdf' ? 'active' : ''}`}
            onClick={() => setInputMode('pdf')}
          >
            <span className="ca-input-tab-icon">⬆</span>
            PDF Upload
          </button>
          <button
            className={`ca-input-tab ${inputMode === 'paste' ? 'active' : ''}`}
            onClick={() => setInputMode('paste')}
          >
            <span className="ca-input-tab-icon">✏</span>
            Paste Text
          </button>
        </div>

        {/* PDF upload zone */}
        {inputMode === 'pdf' && (
          <div className="ca-pdf-section">
            <div
              className={`ca-drop-zone ${isDragOver ? 'drag-over' : ''} ${pdfFile && pdfText ? 'has-file' : ''} ${pdfError ? 'has-error' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={onFileInputChange}
              />
              {pdfLoading ? (
                <div className="ca-drop-loading">
                  <div className="ca-pdf-spinner" />
                  <span className="ca-drop-loading-text">Extracting text from PDF…</span>
                </div>
              ) : pdfFile && pdfText ? (
                <div className="ca-file-info">
                  <div className="ca-file-icon">✓</div>
                  <div className="ca-file-details">
                    <div className="ca-file-name">{pdfFile.name}</div>
                    <div className="ca-file-meta">{pdfText.length.toLocaleString()} characters extracted · Click to upload a different file</div>
                  </div>
                </div>
              ) : (
                <div className="ca-drop-idle">
                  <div className="ca-drop-icon">⬆</div>
                  <div className="ca-drop-primary">Drop your solar contract PDF here</div>
                  <div className="ca-drop-secondary">or click to browse · PDF files only</div>
                </div>
              )}
            </div>
            {pdfError && (
              <div className="ca-pdf-error">
                <span className="ca-pdf-error-icon">⚠</span>
                <div>
                  <div className="ca-pdf-error-msg">{pdfError}</div>
                  <button className="ca-pdf-error-switch" onClick={() => setInputMode('paste')}>
                    Switch to paste text instead →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Paste textarea */}
        {inputMode === 'paste' && (
          <div className="ca-paste-section">
            <div className="ca-paste-header">
              <label className="pitch-textarea-label">Paste contract text</label>
              {pasteText && (
                <button className="ca-clear-btn" onClick={() => setPasteText('')}>
                  Clear ✕
                </button>
              )}
            </div>
            <textarea
              className="pitch-textarea ca-paste-textarea"
              placeholder="Paste the full text of your solar contract here. The more of the contract you include, the more accurate the analysis will be. You can copy-paste directly from a digital PDF."
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={10}
            />
            <div className="ca-char-counter">
              <span className={pasteText.length < 100 ? 'ca-char-low' : 'ca-char-ok'}>
                {pasteText.length.toLocaleString()} characters
              </span>
              {pasteText.length < 100 && pasteText.length > 0 && (
                <span className="ca-char-hint"> — paste more text for a complete analysis</span>
              )}
            </div>
          </div>
        )}

        {/* Optional context fields */}
        <div className="ca-context-section">
          <div className="ca-context-header">
            <span className="form-section-label">Optional Context</span>
            <div className="form-section-line" />
            <span className="ca-context-note">Improves analysis accuracy</span>
          </div>
          <div className="form-grid">
            <div className="field">
              <label>State</label>
              <select
                value={context.state}
                onChange={e => updateContext('state', e.target.value)}
              >
                <option value="">Select state</option>
                {US_STATES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Financial Structure</label>
              <select
                value={context.financialStructure}
                onChange={e => updateContext('financialStructure', e.target.value)}
              >
                <option value="">Select type</option>
                {FINANCIAL_STRUCTURES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Monthly Electric Bill ($)</label>
              <input
                type="number"
                placeholder="e.g. 185"
                value={context.monthlyBill}
                onChange={e => updateContext('monthlyBill', e.target.value)}
              />
            </div>
            <div className="field">
              <label>System Size (kW)</label>
              <input
                type="number"
                placeholder="e.g. 8.5"
                step="0.1"
                value={context.systemSize}
                onChange={e => updateContext('systemSize', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Total Price Quoted ($)</label>
              <input
                type="number"
                placeholder="e.g. 28000"
                value={context.totalPrice}
                onChange={e => updateContext('totalPrice', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <div className="pitch-analyze-action">
          <button
            className="btn btn-primary btn-next"
            disabled={!canAnalyze || analyzing}
            onClick={handleAnalyze}
          >
            {analyzing ? (
              <>
                <span>Analyzing contract…</span>
                <div className="ca-btn-spinner" />
              </>
            ) : (
              <>
                <span>Analyze Contract</span>
                <span className="btn-next-arrow">→</span>
              </>
            )}
          </button>
          {!canAnalyze && contractText.length === 0 && (
            <p className="pitch-action-hint">Upload a PDF or paste contract text above to continue</p>
          )}
          {!canAnalyze && contractText.length > 0 && contractText.length <= 100 && (
            <p className="pitch-action-hint">More text is needed for a meaningful analysis — paste the full contract</p>
          )}
        </div>
      </div>
    )
  }

  // ── Render: results ───────────────────────────────────────────────────────────
  const { riskRating, highRisk, reviewCarefully, homeownerFriendly,
    financialFlags, missingProtections, costPerWatt, savingsComparison,
    netMeteringResult, redCount, yellowCount, greenCount, utilityRate } = results

  // Find escalator table data (from highRisk clause)
  const escalatorClause = highRisk.find(c => c.id === 'escalator' && c.table)

  const missingRed = missingProtections.filter(m => !m.found && m.severity === 'red')
  const missingYellow = missingProtections.filter(m => !m.found && m.severity === 'yellow')
  const missingFound = missingProtections.filter(m => m.found)
  const totalMissingCount = missingRed.length + missingYellow.length

  return (
    <div>
      <div id="ca-results-top" />

      {/* Overall risk banner */}
      <div className={`score-overall ${riskRating.color}`}>
        <div className="overall-icon" style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>
          {riskRating.icon}
        </div>
        <div>
          <div className="overall-label">Contract Risk Rating</div>
          <div className="overall-title">{riskRating.level} — {riskRating.headline}</div>
          <div className="overall-desc">{riskRating.description}</div>
          <div className="ca-risk-chips">
            {redCount > 0 && (
              <span className="ca-risk-chip red">{redCount} high-risk item{redCount !== 1 ? 's' : ''}</span>
            )}
            {yellowCount > 0 && (
              <span className="ca-risk-chip yellow">{yellowCount} item{yellowCount !== 1 ? 's' : ''} to review</span>
            )}
            {greenCount > 0 && (
              <span className="ca-risk-chip green">{greenCount} positive term{greenCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Section 1 — Contract Clause Analysis */}
      <CollapsibleSection
        title="Contract Clause Analysis"
        count={`${highRisk.length + reviewCarefully.length + homeownerFriendly.length} clauses reviewed`}
        countColor="neutral"
      >
        {highRisk.length > 0 && (
          <>
            <SectionSubheader label="High-Risk Clauses" color="red" />
            <div className="ca-clause-list">
              {highRisk.map(item => <ClauseItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {reviewCarefully.length > 0 && (
          <>
            <SectionSubheader label="Review Carefully" color="yellow" />
            <div className="ca-clause-list">
              {reviewCarefully.map(item => <ClauseItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {homeownerFriendly.length > 0 && (
          <>
            <SectionSubheader label="Homeowner-Friendly Terms" color="green" />
            <div className="ca-clause-list">
              {homeownerFriendly.map(item => <ClauseItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {highRisk.length === 0 && reviewCarefully.length === 0 && homeownerFriendly.length === 0 && (
          <p className="ca-empty-section">No specific clause patterns were detected in the provided text. This may mean the contract uses non-standard language, or the text extraction was incomplete. Review the full contract manually using the checklist in the Missing Protections section below.</p>
        )}
      </CollapsibleSection>

      {/* Section 2 — Hidden Fees & Financial Analysis */}
      <CollapsibleSection
        title="Hidden Fees & Financial Analysis"
        count={`${financialFlags.length} item${financialFlags.length !== 1 ? 's' : ''}`}
        countColor={financialFlags.some(f => f.rating === 'red') ? 'red' : 'neutral'}
      >
        {financialFlags.length > 0 && (
          <div className="ca-clause-list">
            {financialFlags.map(item => <ClauseItem key={item.id} item={item} />)}
          </div>
        )}

        {escalatorClause?.table && (
          <div className="ca-escalator-standalone">
            <EscalatorTable tableData={escalatorClause.table} />
          </div>
        )}

        {costPerWatt && <CostPerWattBadge cpw={costPerWatt} />}

        {savingsComparison && (
          <SavingsComparisonBadge
            sc={savingsComparison}
            state={context.state}
            utilityRate={utilityRate}
          />
        )}

        {netMeteringResult && <NetMeteringBadge nm={netMeteringResult} />}

        {financialFlags.length === 0 && !costPerWatt && !netMeteringResult && (
          <p className="ca-empty-section">No specific financial patterns were detected in the provided text. Enter optional context fields (state, system size, price) above for a more detailed financial analysis.</p>
        )}
      </CollapsibleSection>

      {/* Section 3 — Missing Protections */}
      <CollapsibleSection
        title="Missing Protections Checklist"
        count={totalMissingCount > 0 ? `${totalMissingCount} not found` : 'All present'}
        countColor={missingRed.length > 0 ? 'red' : totalMissingCount > 0 ? 'yellow' : 'green'}
      >
        <p className="ca-missing-intro">
          These protections should be explicitly stated in any solar contract. Items marked ✕ were not found in the provided text — they may exist in documents you haven't uploaded, or may be absent entirely.
        </p>

        {missingRed.length > 0 && (
          <>
            <SectionSubheader label="Not Found — High Priority" color="red" />
            <div className="ca-missing-list">
              {missingRed.map(item => <MissingItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {missingYellow.length > 0 && (
          <>
            <SectionSubheader label="Not Found — Worth Requesting" color="yellow" />
            <div className="ca-missing-list">
              {missingYellow.map(item => <MissingItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {missingFound.length > 0 && (
          <>
            <SectionSubheader label="Found in Contract" color="green" />
            <div className="ca-missing-list">
              {missingFound.map(item => <MissingItem key={item.id} item={item} />)}
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* What To Do Next */}
      <div className="pitch-next-steps">
        <div className="pitch-section-title">What To Do Next</div>
        <div className="pitch-steps-list">
          {WHAT_TO_DO_NEXT.map(step => (
            <div key={step.num} className="pitch-step-item">
              <span className="pitch-step-num">{step.num}</span>
              <span className="pitch-step-text">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal disclaimer + Pro teaser */}
      <div className="ca-legal-disclaimer">
        <span className="ca-disclaimer-icon">⚖</span>
        <p>
          <strong>For informational purposes only.</strong> This analysis identifies common patterns in solar contract language using automated text matching — it is not a substitute for legal advice. Clause detection depends on text quality and may miss terms in scanned documents or non-standard language. Always have a licensed attorney review any contract before signing.
        </p>
        <p className="ca-pro-teaser">
          <span className="ca-pro-badge">Pro</span>
          AI-powered clause interpretation coming soon — catches creative legal language that keyword matching misses.
        </p>
      </div>

      {/* Actions */}
      <div className="pitch-result-actions" style={{ marginTop: 24 }}>
        <button className="btn btn-outline" onClick={handleReset}>
          ← Analyze Another Contract
        </button>
      </div>
    </div>
  )
}
