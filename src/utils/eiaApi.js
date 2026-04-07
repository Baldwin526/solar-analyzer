const NATIONAL_AVERAGE_CENTS = 13.0

/**
 * Fetches the most recent annual average residential electricity rate for a US state
 * from the EIA v2 API (retail-sales endpoint).
 *
 * Correct facet names (confirmed against EIA v2 metadata):
 *   facets[sectorid][]=RES          — residential sector
 *   facets[stateid][]=<STATE_ABBR>  — two-letter state code, e.g. "OK"
 *
 * Returns: { rateCents, ratePerKwh, period, fallback }
 */
export async function fetchStateElectricityRate(stateAbbrev) {
  const apiKey = import.meta.env.VITE_EIA_API_KEY

  if (!apiKey) {
    console.warn('[EIA] VITE_EIA_API_KEY is not set — using national average fallback.')
    return makeFallback()
  }

  // Build URL with correct v2 facet names
  const url =
    `https://api.eia.gov/v2/electricity/retail-sales/data/` +
    `?api_key=${apiKey}` +
    `&frequency=annual` +
    `&data[0]=price` +
    `&facets[sectorid][]=RES` +
    `&facets[stateid][]=${stateAbbrev}` +
    `&sort[0][column]=period` +
    `&sort[0][direction]=desc` +
    `&length=1`

  console.log(`[EIA] Fetching rate for ${stateAbbrev}…`)

  try {
    const res = await fetch(url)

    if (!res.ok) {
      const body = await res.text()
      console.error(`[EIA] HTTP ${res.status}:`, body)
      throw new Error(`HTTP ${res.status}`)
    }

    const json = await res.json()
    console.log('[EIA] Raw response:', json)

    const rows = json?.response?.data
    if (!Array.isArray(rows) || rows.length === 0) {
      console.error('[EIA] No data rows in response:', json)
      throw new Error('No data rows returned')
    }

    const row = rows[0]
    const priceCents = parseFloat(row.price)
    if (isNaN(priceCents) || priceCents <= 0) {
      console.error('[EIA] Invalid price value in row:', row)
      throw new Error(`Invalid price value: ${row.price}`)
    }

    console.log(`[EIA] ${stateAbbrev} residential rate: ${priceCents}¢/kWh (${row.period})`)

    return {
      rateCents: priceCents,
      ratePerKwh: priceCents / 100,
      period: row.period ?? null,
      fallback: false,
    }
  } catch (err) {
    console.warn(`[EIA] Fetch failed for ${stateAbbrev}: ${err.message} — using national average fallback.`)
    return makeFallback()
  }
}

function makeFallback() {
  return {
    rateCents: NATIONAL_AVERAGE_CENTS,
    ratePerKwh: NATIONAL_AVERAGE_CENTS / 100,
    period: null,
    fallback: true,
  }
}
