/**
 * State-specific contractor license verification links.
 * Only includes states where we have a verified, reliable official URL.
 * All other states fall back to the DSIRE national database.
 */
const STATE_LICENSE_LINKS = {
  AZ: {
    label: 'Arizona Registrar of Contractors',
    url: 'https://roc.az.gov/',
  },
  CA: {
    label: 'California CSLB License Check',
    url: 'https://www.cslb.ca.gov/onlineservices/checklicenseII/checklicense.aspx',
  },
  CO: {
    label: 'Colorado DORA License Lookup',
    url: 'https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx',
  },
  FL: {
    label: 'Florida DBPR License Verification',
    url: 'https://www.myfloridalicense.com/wl11.asp',
  },
  NV: {
    label: 'Nevada State Contractors Board Verification',
    url: 'https://app.nvcontractorsboard.com/Clients/NVSCB/Public/Verification.aspx',
  },
  NY: {
    label: 'New York DOS License Search',
    url: 'https://www.dos.ny.gov/licensing/',
  },
  OK: {
    label: 'Oklahoma Construction Industries Board',
    url: 'https://www.ok.gov/obc/',
  },
  TX: {
    label: 'Texas TDLR License Search',
    url: 'https://www.tdlr.texas.gov/LicenseSearch/',
  },
}

export const DSIRE_URL = 'https://www.dsireusa.org/'
export const DSIRE_LABEL = 'DSIRE — State Solar Requirements (NC Clean Energy Technology Center, updated continuously)'

export default STATE_LICENSE_LINKS
