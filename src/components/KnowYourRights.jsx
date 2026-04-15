import { useState } from 'react'
import STATE_LICENSE_LINKS from '../utils/stateLicenseLinks'

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'Washington D.C.' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

// State-specific consumer protection and solar rights data.
// agUrl values are well-known official state government domains.
const STATE_DATA = {
  AL: {
    agName: 'Alabama Attorney General — Consumer Protection',
    agUrl: 'https://www.alabamaag.gov/consumer',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Alabama requires electrical contractors to be licensed by the Alabama Electrical Contractors Board. Solar installers should hold a licensed electrician on staff.',
    coolingOffNote: null,
    notableLaw: null,
  },
  AK: {
    agName: 'Alaska Department of Law — Consumer Protection',
    agUrl: 'https://www.law.alaska.gov/department/civil/consumer/cpindex.html',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Alaska requires electrical contractors to be licensed by the Division of Corporations, Business & Professional Licensing.',
    coolingOffNote: null,
    notableLaw: null,
  },
  AZ: {
    agName: 'Arizona Attorney General — Consumer Protection',
    agUrl: 'https://www.azag.gov/complaints/consumer',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Arizona requires solar installers to hold an ROC (Registrar of Contractors) license — typically a CR-11 (electrical) or KA contractor license. Ask for the ROC number.',
    coolingOffNote: null,
    notableLaw: 'Arizona\'s Consumer Fraud Act (A.R.S. § 44-1521) prohibits misleading solar sales representations, including false savings claims and misrepresented incentives.',
  },
  AR: {
    agName: 'Arkansas Attorney General — Consumer Protection',
    agUrl: 'https://www.arkansasag.gov/consumer-protection/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Arkansas requires solar installers to hold a Contractors Licensing Board license. Ask for the license number and verify at the Arkansas Contractors Licensing Board.',
    coolingOffNote: null,
    notableLaw: null,
  },
  CA: {
    agName: 'California Department of Justice — Consumer Protection',
    agUrl: 'https://oag.ca.gov/contact/consumer-complaint-against-business-or-individual',
    hasHICLaw: true,
    hicNote: 'California\'s Contractors State License Law is one of the strongest in the country. Solar installers must hold a C-10 (Electrical) or C-46 (Solar) license. Contracting without a CSLB license is a misdemeanor — and voids the contract.',
    licenseNote: 'California requires a CSLB C-10 (Electrical Contractor) or C-46 (Solar Contractor) license. Ask for the CSLB license number before signing anything.',
    coolingOffNote: 'California\'s Home Solicitation Sales Act gives you 3 business days to cancel. The notice must be provided in Spanish, Chinese, Tagalog, Vietnamese, or Korean if the contract was negotiated in that language. Failure to provide it extends your cancellation right indefinitely.',
    notableLaw: 'California\'s Unfair Competition Law (Business & Professions Code § 17200) provides broad remedies for deceptive solar sales. The CSLB actively investigates unlicensed contractors and fraudulent installers.',
  },
  CO: {
    agName: 'Colorado Attorney General — Consumer Protection',
    agUrl: 'https://coag.gov/resources/filing-consumer-complaints/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Colorado requires solar installers to hold a state electrical license issued by the Department of Regulatory Agencies (DORA).',
    coolingOffNote: null,
    notableLaw: 'Colorado\'s Consumer Protection Act (C.R.S. § 6-1-101) prohibits deceptive trade practices in solar sales. The AG has authority to pursue statutory penalties per violation.',
  },
  CT: {
    agName: 'Connecticut Attorney General — Consumer Protection',
    agUrl: 'https://portal.ct.gov/AG/Common-Elements/Contact-the-AG',
    hasHICLaw: true,
    hicNote: 'Connecticut\'s Home Improvement Act requires written contracts for home improvement work over $200, including a mandatory cancellation notice and specific disclosure requirements.',
    licenseNote: 'Connecticut requires solar installers to be licensed as Home Improvement Contractors by the Department of Consumer Protection.',
    coolingOffNote: 'Connecticut\'s Home Improvement Act requires a 3-business-day cancellation right and provides additional protections beyond federal law for home improvement contracts, including solar.',
    notableLaw: null,
  },
  DE: {
    agName: 'Delaware Department of Justice — Consumer Protection',
    agUrl: 'https://attorneygeneral.delaware.gov/fraud/',
    hasHICLaw: true,
    hicNote: 'Delaware requires home improvement contractors to be licensed. Solar installation qualifies as a home improvement under Delaware law.',
    licenseNote: 'Delaware requires solar installers to hold a Home Improvement Contractor license from the Division of Revenue.',
    coolingOffNote: null,
    notableLaw: null,
  },
  DC: {
    agName: 'DC Office of the Attorney General — Consumer Protection',
    agUrl: 'https://oag.dc.gov/consumer-protection',
    hasHICLaw: true,
    hicNote: 'DC requires solar contractors to be licensed as Home Improvement Contractors by the Department of Consumer and Regulatory Affairs (DCRA). Unlicensed solar work is illegal in DC.',
    licenseNote: 'DC requires a Home Improvement Contractor license from the DCRA before any solar installation work.',
    coolingOffNote: null,
    notableLaw: null,
  },
  FL: {
    agName: 'Florida Attorney General — Consumer Protection',
    agUrl: 'https://www.myfloridalegal.com/contact#complaints',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Florida requires solar installers to hold a state license from DBPR — either a Certified Electrical Contractor (EC) or Certified Roofing Contractor (CW), depending on scope of work.',
    coolingOffNote: null,
    notableLaw: 'Florida\'s Deceptive and Unfair Trade Practices Act (FDUTPA, § 501.201) provides strong remedies for deceptive solar sales. Florida also has specific disclosure requirements for solar energy system sales contracts under § 501.976.',
  },
  GA: {
    agName: 'Georgia Attorney General — Consumer Protection',
    agUrl: 'https://law.georgia.gov/consumer-protection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Georgia requires electrical work to be performed by a licensed electrical contractor. Verify with the Georgia Secretary of State\'s licensing database.',
    coolingOffNote: null,
    notableLaw: null,
  },
  HI: {
    agName: 'Hawaii Office of Consumer Protection',
    agUrl: 'https://cca.hawaii.gov/ocp/',
    hasHICLaw: true,
    hicNote: 'Hawaii is a leading solar state with strong contractor licensing requirements. Solar contractors must be licensed by the Hawaii Contractors License Board. Unlicensed work is a significant violation.',
    licenseNote: 'Hawaii requires a C-61 (Specialty Contractor — Solar) or C-13 (Electrical) license from the Contractors License Board.',
    coolingOffNote: null,
    notableLaw: 'File complaints with the Office of Consumer Protection — a separate agency from the AG — which specifically handles contractor fraud.',
  },
  ID: {
    agName: 'Idaho Attorney General — Consumer Protection',
    agUrl: 'https://www.ag.idaho.gov/consumer-protection/consumer-complaints/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Idaho does not have a statewide general contractor licensing requirement. Verify electrical permits and licensing with your county building department.',
    coolingOffNote: null,
    notableLaw: null,
  },
  IL: {
    agName: 'Illinois Attorney General — Consumer Fraud Bureau',
    agUrl: 'https://illinoisattorneygeneral.gov/consumers/filecomplaint.html',
    hasHICLaw: true,
    hicNote: 'Illinois\'s Home Repair and Remodeling Act (815 ILCS 513) requires written contracts for solar work and includes a 3-day right of rescission. This law applies specifically when the contract is solicited at the customer\'s home.',
    licenseNote: 'Illinois does not have a single statewide solar contractor license. Electrical work requires a licensed electrician. Many municipalities — including Chicago — have separate licensing requirements.',
    coolingOffNote: 'Illinois\'s Home Repair and Remodeling Act provides a 3-business-day cancellation right for home repair work solicited door-to-door, including solar installations.',
    notableLaw: null,
  },
  IN: {
    agName: 'Indiana Attorney General — Consumer Protection',
    agUrl: 'https://www.in.gov/attorneygeneral/consumer-protection-division/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Indiana does not require a statewide home improvement contractor license. Verify electrical permits and ask for proof of a licensed electrician on staff.',
    coolingOffNote: null,
    notableLaw: null,
  },
  IA: {
    agName: 'Iowa Attorney General — Consumer Protection',
    agUrl: 'https://www.iowaattorneygeneral.gov/for-consumers/file-a-consumer-complaint',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Iowa requires electrical contractors to be licensed by the Iowa Department of Public Health. Solar installers performing electrical work must hold an electrical contractor license.',
    coolingOffNote: null,
    notableLaw: null,
  },
  KS: {
    agName: 'Kansas Attorney General — Consumer Protection',
    agUrl: 'https://ag.ks.gov/about-the-office/bureaus-and-divisions/consumer-protection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Kansas electrical contractors must be licensed at the state level. Some counties and municipalities require separate contractor registration. Verify with your local building department.',
    coolingOffNote: null,
    notableLaw: null,
  },
  KY: {
    agName: 'Kentucky Attorney General — Consumer Protection',
    agUrl: 'https://ag.ky.gov/consumers/Pages/default.aspx',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Kentucky requires electrical contractors to be licensed by the Kentucky Board of Electrical Examiners.',
    coolingOffNote: null,
    notableLaw: null,
  },
  LA: {
    agName: 'Louisiana Attorney General — Consumer Protection',
    agUrl: 'https://ag.louisiana.gov/ConsumerProtection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Louisiana requires solar installers to hold a State Contractor License from the Louisiana State Licensing Board for Contractors (LSLBC).',
    coolingOffNote: null,
    notableLaw: null,
  },
  ME: {
    agName: 'Maine Attorney General — Consumer Protection',
    agUrl: 'https://www.maine.gov/ag/consumer/complaints/',
    hasHICLaw: true,
    hicNote: 'Maine\'s Home Construction Contracts Act requires written contracts for home improvement work over $3,000, including a right of cancellation.',
    licenseNote: 'Maine requires solar installers to hold an Electrical Contractor License or Home Construction Contractor license depending on the scope of work.',
    coolingOffNote: null,
    notableLaw: null,
  },
  MD: {
    agName: 'Maryland Home Improvement Commission (MHIC) — Complaints',
    agUrl: 'https://www.marylandattorneygeneral.gov/Pages/CPD/complaints.aspx',
    hasHICLaw: true,
    hicNote: 'Maryland\'s Home Improvement Law requires all home improvement contractors — including solar installers — to be licensed by the Maryland Home Improvement Commission (MHIC). This is a well-enforced requirement. An unlicensed solar contractor cannot enforce a contract in Maryland.',
    licenseNote: 'Maryland requires an MHIC license number on every home improvement contract. Ask for it specifically and verify it before signing.',
    coolingOffNote: 'Maryland\'s Home Improvement Law provides a 3-business-day cancellation right. The contractor must provide two copies of the cancellation notice at the time of signing.',
    notableLaw: 'The Maryland Home Improvement Commission actively investigates complaints and can revoke contractor licenses. This is one of the most effective state enforcement mechanisms for solar fraud.',
  },
  MA: {
    agName: 'Massachusetts Attorney General — Consumer Protection',
    agUrl: 'https://www.mass.gov/how-to/file-a-consumer-complaint',
    hasHICLaw: true,
    hicNote: 'Massachusetts has one of the strongest Home Improvement Contractor (HIC) laws in the country. All solar installers must be registered as Home Improvement Contractors with the Office of Consumer Affairs and Business Regulation.',
    licenseNote: 'Massachusetts requires a Home Improvement Contractor (HIC) registration AND an Electrical License from the Board of State Examiners of Electricians.',
    coolingOffNote: 'Massachusetts HIC law (M.G.L. c. 142A) requires a 3-business-day cancellation right. The contractor must provide a copy of the contract AND a separate Notice of Right to Cancel at signing.',
    notableLaw: 'Under M.G.L. c. 93A, deceptive solar sales practices entitle consumers to up to triple damages and attorney\'s fees. The MA AG has actively pursued solar fraud cases under this statute.',
  },
  MI: {
    agName: 'Michigan Attorney General — Consumer Protection',
    agUrl: 'https://www.michigan.gov/ag/consumer-protection/file-a-complaint',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Michigan requires electrical contractors to be licensed by the Department of Licensing and Regulatory Affairs (LARA). Solar installers must employ a licensed electrical contractor.',
    coolingOffNote: null,
    notableLaw: null,
  },
  MN: {
    agName: 'Minnesota Attorney General — Consumer Protection',
    agUrl: 'https://www.ag.state.mn.us/Office/Complaint.asp',
    hasHICLaw: true,
    hicNote: 'Minnesota\'s Residential Contractor and Remodeler Registration Act requires solar contractors to be registered with the Department of Labor and Industry.',
    licenseNote: 'Minnesota requires solar installers to be registered as Residential Contractors or Residential Remodelers with the Department of Labor and Industry.',
    coolingOffNote: null,
    notableLaw: null,
  },
  MS: {
    agName: 'Mississippi Attorney General — Consumer Protection',
    agUrl: 'https://www.ago.state.ms.us/divisions/consumer-protection/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Mississippi requires contractor licensing from the Mississippi State Board of Contractors. Ask for the license number.',
    coolingOffNote: null,
    notableLaw: null,
  },
  MO: {
    agName: 'Missouri Attorney General — Consumer Protection',
    agUrl: 'https://ago.mo.gov/consumer-protection/consumer-complaint',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Missouri does not have a statewide home improvement contractor license. Local licensing varies by city and county. Verify with your local building department.',
    coolingOffNote: null,
    notableLaw: null,
  },
  MT: {
    agName: 'Montana Department of Justice — Consumer Protection',
    agUrl: 'https://dojmt.gov/consumer/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Montana requires electrical contractors to be licensed by the Montana Department of Labor & Industry.',
    coolingOffNote: null,
    notableLaw: null,
  },
  NE: {
    agName: 'Nebraska Attorney General — Consumer Protection',
    agUrl: 'https://ago.nebraska.gov/consumer-protection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Nebraska requires electrical contractors to be licensed by the Nebraska State Electrical Division.',
    coolingOffNote: null,
    notableLaw: null,
  },
  NV: {
    agName: 'Nevada Attorney General — Consumer Protection',
    agUrl: 'https://ag.nv.gov/Complaints/File_Complaint/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Nevada requires solar installers to hold a C-2 (Electrical Contractor) or C-2R (Residential Electrical) license from the Nevada State Contractors Board.',
    coolingOffNote: null,
    notableLaw: 'Nevada has strong net metering laws and consumer protections for solar customers. The Nevada Contractors Board actively investigates unlicensed solar contractors.',
  },
  NH: {
    agName: 'New Hampshire Department of Justice — Consumer Protection',
    agUrl: 'https://www.doj.nh.gov/consumer/complaints.htm',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'New Hampshire requires electrical contractors to be licensed by the Bureau of Mechanical Safety, Electricians Licensing Board.',
    coolingOffNote: null,
    notableLaw: null,
  },
  NJ: {
    agName: 'New Jersey Division of Consumer Affairs — HIC',
    agUrl: 'https://www.njconsumeraffairs.gov/ocp/Pages/hic.aspx',
    hasHICLaw: true,
    hicNote: 'New Jersey\'s Home Improvement Contractor (HIC) law is one of the strongest in the country. All solar contractors must be registered. Violations can result in contract voidance and criminal penalties.',
    licenseNote: 'New Jersey requires solar installers to be registered as Home Improvement Contractors (HIC) with the Division of Consumer Affairs. The HIC registration number must appear on every contract. Without it, the contract may be void.',
    coolingOffNote: 'New Jersey\'s Consumer Fraud Act and HIC law provide a 3-business-day cancellation right and require all home improvement contracts to include specific disclosures and a cancellation notice in bold type.',
    notableLaw: 'New Jersey\'s Consumer Fraud Act (N.J.S.A. 56:8-1) provides for treble (triple) damages and mandatory attorney\'s fees for knowing violations. This is one of the strongest consumer protection statutes in the United States for solar fraud cases.',
  },
  NM: {
    agName: 'New Mexico Attorney General — Consumer Protection',
    agUrl: 'https://www.nmag.gov/consumer-protection.aspx',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'New Mexico requires contractor licensing from the Regulation and Licensing Department, Construction Industries Division.',
    coolingOffNote: null,
    notableLaw: null,
  },
  NY: {
    agName: 'New York Attorney General — Consumer Frauds Bureau',
    agUrl: 'https://ag.ny.gov/complaint',
    hasHICLaw: true,
    hicNote: 'New York\'s Home Improvement Business Law applies to solar installations. Contractor licensing requirements vary significantly by county — NYC, Nassau, Westchester, and Rockland all have their own requirements.',
    licenseNote: 'New York contractor licensing requirements vary by county. In NYC, a Home Improvement Contractor license from the NYC DCA is required. Verify local requirements — do not assume a state license is sufficient.',
    coolingOffNote: null,
    notableLaw: 'New York\'s General Business Law § 349 (deceptive acts) and Executive Law § 63(12) provide strong remedies. The NY AG has actively investigated and shut down predatory solar companies in the state.',
  },
  NC: {
    agName: 'North Carolina Attorney General — Consumer Protection',
    agUrl: 'https://ncdoj.gov/protecting-consumers/file-a-consumer-complaint/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'North Carolina requires electrical contractors to be licensed by the State Board of Examiners of Electrical Contractors. Solar installers must employ licensed electricians.',
    coolingOffNote: null,
    notableLaw: null,
  },
  ND: {
    agName: 'North Dakota Attorney General — Consumer Protection',
    agUrl: 'https://attorneygeneral.nd.gov/consumer-protection/file-complaint',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'North Dakota requires electrical contractors to be licensed by the State Electrical Board.',
    coolingOffNote: null,
    notableLaw: null,
  },
  OH: {
    agName: 'Ohio Attorney General — Consumer Protection',
    agUrl: 'https://www.ohioattorneygeneral.gov/consumers.aspx',
    hasHICLaw: true,
    hicNote: 'Ohio\'s Home Solicitation Sales Act (Ohio Rev. Code § 1345.21) is specifically designed for situations like solar door-to-door sales. The seller must provide two copies of a "Notice of Right to Cancel" at the time of sale.',
    licenseNote: 'Ohio requires solar installer licensing from the Ohio Construction Industry Licensing Board. Electrical work requires a licensed electrical contractor.',
    coolingOffNote: 'Ohio\'s Home Solicitation Sales Act provides a 3-business-day right to cancel. The seller must provide two signed copies of a Notice of Right to Cancel at the time of signing. If they failed to do this, your cancellation right may be extended.',
    notableLaw: 'The Ohio AG actively pursues solar fraud under the Consumer Sales Practices Act (Ohio Rev. Code § 1345.01) and is one of the most active state AGs on solar consumer protection enforcement.',
  },
  OK: {
    agName: 'Oklahoma Attorney General — Consumer Protection',
    agUrl: 'https://www.oag.ok.gov/consumer-protection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Oklahoma requires solar installers to hold an Oklahoma Construction Industries Board (OBC) license.',
    coolingOffNote: null,
    notableLaw: 'Oklahoma\'s Consumer Protection Act (15 O.S. § 751) prohibits deceptive trade practices including misleading solar savings claims and misrepresented government incentives.',
  },
  OR: {
    agName: 'Oregon Department of Justice — Consumer Protection',
    agUrl: 'https://www.doj.state.or.us/consumer-protection/file-a-complaint/',
    hasHICLaw: true,
    hicNote: 'Oregon\'s Construction Contractors Board (CCB) regulates all home improvement contractors including solar installers. CCB licensing is a firm requirement. Unlicensed solar work is illegal.',
    licenseNote: 'Oregon requires a Construction Contractors Board (CCB) license. Ask for the CCB number — Oregon homeowners can verify contractor licenses directly on the CCB website.',
    coolingOffNote: 'Oregon law provides a 3-business-day cancellation right for home improvement contracts solicited at the homeowner\'s residence.',
    notableLaw: 'Oregon\'s Unlawful Trade Practices Act (ORS 646.608) provides strong remedies including attorney\'s fees. The CCB actively investigates unlicensed solar contractors.',
  },
  PA: {
    agName: 'Pennsylvania Attorney General — Consumer Protection',
    agUrl: 'https://www.attorneygeneral.gov/submit-a-complaint/',
    hasHICLaw: true,
    hicNote: 'Pennsylvania\'s Home Improvement Consumer Protection Act (HICPA) specifically requires all home improvement contractors — including solar installers — to be registered with the Pennsylvania Attorney General\'s Office.',
    licenseNote: 'Pennsylvania requires solar installers to be registered under HICPA (73 P.S. § 517.1). The AG registration number must appear on all contracts. Ask for it.',
    coolingOffNote: 'Pennsylvania\'s HICPA requires a 3-business-day cancellation right in any door-to-door home improvement contract. The written notice must be provided at the time of signing, in plain language.',
    notableLaw: 'Pennsylvania\'s HICPA is specifically designed to protect consumers from predatory home improvement contractors. Violations — including unlicensed contracting and contract fraud — can be prosecuted by the AG.',
  },
  RI: {
    agName: 'Rhode Island Attorney General — Consumer Protection',
    agUrl: 'https://riag.ri.gov/about-our-office/divisions/civil/consumer-protection',
    hasHICLaw: true,
    hicNote: 'Rhode Island requires contractors to be registered with the Contractors\' Registration and Licensing Board (CRLB). Solar installation qualifies.',
    licenseNote: 'Rhode Island requires solar installers to hold a Contractors\' Registration and Licensing Board registration and an electrical contractor license.',
    coolingOffNote: null,
    notableLaw: null,
  },
  SC: {
    agName: 'South Carolina Attorney General — Consumer Protection',
    agUrl: 'https://www.scag.gov/for-citizens/consumer-protection/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'South Carolina requires contractor licensing from the Contractors\' Licensing Board. Solar electrical work requires a licensed electrician.',
    coolingOffNote: null,
    notableLaw: null,
  },
  SD: {
    agName: 'South Dakota Attorney General — Consumer Protection',
    agUrl: 'https://atg.sd.gov/OurOffice/Divisions/ConsumerProtection/default.aspx',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'South Dakota requires electrical contractors to be licensed by the South Dakota State Electrical Commission.',
    coolingOffNote: null,
    notableLaw: null,
  },
  TN: {
    agName: 'Tennessee Attorney General — Consumer Protection',
    agUrl: 'https://www.tn.gov/attorneygeneral/working-for-you/consumer-protection.html',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Tennessee requires contractor licensing from the Tennessee Board for Licensing Contractors. Solar electrical work requires a licensed electrician.',
    coolingOffNote: null,
    notableLaw: null,
  },
  TX: {
    agName: 'Texas Attorney General — Consumer Protection',
    agUrl: 'https://www.texasattorneygeneral.gov/consumer-protection',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Texas requires solar installers to hold a TDLR Electrical Contractor license for electrical work. Roofing-related work may require a separate contractor license.',
    coolingOffNote: null,
    notableLaw: 'Texas\'s Deceptive Trade Practices Act (DTPA, Tex. Bus. & Com. Code § 17.41) allows triple damages for knowing violations and requires no minimum damages showing — making it one of the strongest consumer protection tools in the country.',
  },
  UT: {
    agName: 'Utah Attorney General — Consumer Protection',
    agUrl: 'https://attorneygeneral.utah.gov/divisions/consumer-protection/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Utah requires contractor licensing from the Division of Occupational and Professional Licensing (DOPL).',
    coolingOffNote: null,
    notableLaw: null,
  },
  VT: {
    agName: 'Vermont Attorney General — Consumer Protection',
    agUrl: 'https://ago.vermont.gov/about/divisions/public-protection-division/consumer-protection/',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Vermont requires electrical contractors to be licensed by the Department of Public Safety.',
    coolingOffNote: null,
    notableLaw: null,
  },
  VA: {
    agName: 'Virginia Attorney General — Consumer Protection',
    agUrl: 'https://www.ag.virginia.gov',
    hasHICLaw: true,
    hicNote: 'Virginia\'s Contractor Transaction Recovery Act and Consumer Protection Act cover solar sales. All contractors must be licensed by DPOR.',
    licenseNote: 'Virginia requires a Class A, B, or C Contractor License from the Virginia Department of Professional and Occupational Regulation (DPOR), depending on project size.',
    coolingOffNote: null,
    notableLaw: null,
  },
  WA: {
    agName: 'Washington State Attorney General — Consumer Protection',
    agUrl: 'https://www.atg.wa.gov/file-complaint',
    hasHICLaw: true,
    hicNote: 'Washington\'s Contractor Registration Act requires all home improvement contractors — including solar installers — to be registered with the Department of Labor & Industries (L&I). Unregistered contractors cannot enforce contracts in Washington.',
    licenseNote: 'Washington requires a registered contractor license from the Department of Labor & Industries (L&I). Ask for the L&I registration number.',
    coolingOffNote: 'Washington\'s Home Solicitation Sales Act provides a 3-business-day cancellation right with specific requirements for the cancellation notice.',
    notableLaw: 'Washington\'s Consumer Protection Act (RCW 19.86) provides attorney\'s fees and up to $25,000 per violation for willful violations. The AG has actively pursued solar fraud cases.',
  },
  WV: {
    agName: 'West Virginia Attorney General — Consumer Protection',
    agUrl: 'https://ago.wv.gov/consumerprotection/Pages/Complaint-Form.aspx',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'West Virginia requires contractor licensing from the Division of Labor. Solar electrical work requires a licensed electrician.',
    coolingOffNote: null,
    notableLaw: null,
  },
  WI: {
    agName: 'Wisconsin Department of Justice — Consumer Protection',
    agUrl: 'https://www.doj.state.wi.us/consumer/filing-complaint',
    hasHICLaw: true,
    hicNote: 'Wisconsin\'s Home Improvement Practices Act (ATCP 110) requires written contracts for home improvement work over $500 including solar, with specific disclosure requirements.',
    licenseNote: 'Wisconsin requires electrical contractors to be licensed. Solar installations over $2,500 are subject to ATCP 110 requirements.',
    coolingOffNote: 'Wisconsin\'s ATCP 110 provides a 3-business-day cancellation right for home improvement contracts that arise from door-to-door solicitation.',
    notableLaw: null,
  },
  WY: {
    agName: 'Wyoming Attorney General — Consumer Protection',
    agUrl: 'https://ag.wyo.gov/consumer-protection-unit',
    hasHICLaw: false, hicNote: null,
    licenseNote: 'Wyoming has limited statewide contractor licensing requirements. Verify electrical permits and ask for proof of a licensed electrician.',
    coolingOffNote: null,
    notableLaw: null,
  },
}

const WHAT_TO_DO_STEPS = [
  {
    num: '01',
    title: 'Check your cancellation window',
    text: 'Count 3 business days from when you signed. Weekends and federal holidays do not count. If you\'re within the window, you have a legal right to cancel with no penalty.',
  },
  {
    num: '02',
    title: 'If within window — cancel in writing, today',
    text: 'Write a signed cancellation letter and send it via USPS Certified Mail with Return Receipt Requested. Keep the receipt. Federal law requires only that you send the notice — you don\'t need the company to confirm receipt within the window.',
  },
  {
    num: '03',
    title: 'If outside window — contact your state AG',
    text: 'File a complaint with your state Attorney General\'s consumer protection office. Even if the cancellation window has passed, the AG can investigate deceptive sales practices, misrepresented incentives, and unlicensed contracting.',
  },
  {
    num: '04',
    title: 'File an FTC complaint',
    text: 'Report the company at reportfraud.ftc.gov. FTC complaints feed into a national database used to identify patterns of fraud across companies and states. Even if the FTC doesn\'t contact you directly, your complaint matters.',
  },
  {
    num: '05',
    title: 'File a CFPB complaint if financing was involved',
    text: 'If you took out a solar loan, file a complaint with the Consumer Financial Protection Bureau at consumerfinance.gov/complaint. CFPB oversees solar lenders and investigates predatory lending practices.',
  },
  {
    num: '06',
    title: 'File a BBB complaint',
    text: 'File at bbb.org. While the BBB has no enforcement authority, a formal complaint creates a public record and may prompt the company to resolve the issue — especially if they have an existing BBB relationship.',
  },
  {
    num: '07',
    title: 'Consult a consumer protection attorney',
    text: 'Many attorneys take solar fraud cases on contingency — meaning you pay nothing unless you win. If your state has triple damages provisions (NJ, TX, MA, WA, OH), a case may be economically viable even at relatively small amounts.',
  },
]

const RED_FLAGS = [
  {
    flag: 'Salesperson misrepresented the federal tax credit',
    detail: 'If you were told you\'d receive a 30% federal tax credit as a cash rebate — rather than a reduction in taxes owed — this is a material misrepresentation. The 30% ITC is only available to households that owe federal income tax. It is not a government check.',
    severity: 'high',
  },
  {
    flag: 'The 3-day cancellation notice was not provided at signing',
    detail: 'Federal law (FTC Cooling-Off Rule, 16 CFR § 429) requires the seller to provide two copies of a Notice of Right to Cancel at the time of the sale for door-to-door transactions. If they didn\'t give it to you, your cancellation right may be extended indefinitely — not just 3 days.',
    severity: 'high',
  },
  {
    flag: 'Contractor was unlicensed in your state',
    detail: 'In many states — including CA, NJ, PA, MD, OR, and WA — an unlicensed home improvement contractor cannot enforce a contract. If the installer was not licensed at the time of signing, the contract may be voidable at your option. Verify the license status as of the contract date.',
    severity: 'high',
  },
  {
    flag: 'Savings projections were mathematically impossible',
    detail: 'If the projected savings significantly exceed your actual monthly utility bill, the contract may be based on fraudulent misrepresentation. Document your actual utility bills and compare them to the savings figures in the contract.',
    severity: 'medium',
  },
  {
    flag: 'Contract was signed under duress or high-pressure tactics',
    detail: '"You have to decide tonight" or "this price expires in 24 hours" are pressure tactics. While not automatically grounds for voidance, documented high-pressure sales combined with other misrepresentations can strengthen a consumer fraud claim.',
    severity: 'medium',
  },
  {
    flag: 'Material facts were misrepresented in writing',
    detail: 'If the written contract contains statements that were materially false when made — including roof condition claims, production guarantees, net metering policy representations, or savings projections — this may constitute fraud or deceptive trade practices under your state\'s consumer protection law.',
    severity: 'medium',
  },
]

function SectionCard({ icon, title, color, children }) {
  return (
    <div className={`kyr-section-card kyr-card-${color}`}>
      <div className="kyr-section-header">
        <span className="kyr-section-icon">{icon}</span>
        <h3 className="kyr-section-title">{title}</h3>
      </div>
      <div className="kyr-section-body">
        {children}
      </div>
    </div>
  )
}

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="kyr-link"
    >
      {children} ↗
    </a>
  )
}

export default function KnowYourRights({ onNavigate }) {
  const [state, setState] = useState('')

  const stateData = state ? STATE_DATA[state] : null
  const licenseLink = state ? STATE_LICENSE_LINKS[state] : null
  const stateName = state ? US_STATES.find(s => s.code === state)?.name : ''

  return (
    <div className="kyr-page">

      {/* ── Hero ── */}
      <section className="kyr-hero">
        <div className="kyr-hero-eyebrow">Consumer Protection Resource</div>
        <h1 className="kyr-hero-headline">Know Your Rights Before You Sign</h1>
        <p className="kyr-hero-sub">
          Solar contracts are legally binding for 20–25 years. These are the protections available to you right now.
        </p>
      </section>

      {/* ── Federal baseline ── */}
      <section className="kyr-federal-banner">
        <div className="kyr-federal-item">
          <div className="kyr-federal-label">Federal Law — All 50 States</div>
          <div className="kyr-federal-value">3 Business Days to Cancel</div>
          <div className="kyr-federal-note">FTC Cooling-Off Rule applies to any door-to-door sale over $25</div>
        </div>
        <div className="kyr-federal-item">
          <div className="kyr-federal-label">Federal Agency Complaints</div>
          <div className="kyr-federal-links">
            <ExternalLink href="https://reportfraud.ftc.gov">FTC ReportFraud</ExternalLink>
            <ExternalLink href="https://www.consumerfinance.gov/complaint/">CFPB (if financing)</ExternalLink>
          </div>
        </div>
        <div className="kyr-federal-item">
          <div className="kyr-federal-label">30% Federal Tax Credit</div>
          <div className="kyr-federal-value">ITC — Not a Cash Rebate</div>
          <div className="kyr-federal-note">Reduces taxes owed only — requires federal income tax liability</div>
        </div>
      </section>

      {/* ── State selector ── */}
      <section className="kyr-selector-section">
        <label className="kyr-selector-label" htmlFor="state-select">
          Select your state to see your specific legal protections
        </label>
        <div className="kyr-selector-row">
          <select
            id="state-select"
            className="kyr-state-select"
            value={state}
            onChange={e => setState(e.target.value)}
          >
            <option value="">— Select a state —</option>
            {US_STATES.map(s => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* ── No state selected ── */}
      {!state && (
        <div className="kyr-no-state">
          <div className="kyr-no-state-icon">🗺</div>
          <p>Select your state above to see state-specific protections, complaint links, and contractor license verification resources.</p>
        </div>
      )}

      {/* ── State content ── */}
      {stateData && (
        <div className="kyr-state-content">
          <div className="kyr-state-heading">
            <span className="kyr-state-flag">{state}</span>
            {stateName} — Your Legal Protections
          </div>

          {/* 1. Cooling-off period */}
          <SectionCard icon="⏱" title="Right of Cancellation" color="green">
            <div className="kyr-cooling-row">
              <div className="kyr-cooling-badge">3 Business Days</div>
              <div className="kyr-cooling-text">
                If a solar salesperson came to your door and you signed a contract, federal law gives you the right to cancel within 3 business days — with no penalty and no reason required.
              </div>
            </div>
            {stateData.coolingOffNote && (
              <div className="kyr-state-note">
                <span className="kyr-note-label">{stateName} Note</span>
                {stateData.coolingOffNote}
              </div>
            )}
            <div className="kyr-info-box">
              <strong>How to cancel:</strong> Send a signed cancellation letter via USPS Certified Mail with Return Receipt to the address on your contract. Keep the receipt. Federal law requires only that you <em>send</em> the notice within 3 business days — the company does not need to receive it within that window.
            </div>
          </SectionCard>

          {/* 2. Contractor licensing */}
          <SectionCard icon="🔎" title="Contractor Licensing — Verify Before Signing" color="amber">
            <p className="kyr-body-text">{stateData.licenseNote}</p>
            {stateData.hasHICLaw && stateData.hicNote && (
              <div className="kyr-state-note">
                <span className="kyr-note-label">Home Improvement Law</span>
                {stateData.hicNote}
              </div>
            )}
            {licenseLink ? (
              <div className="kyr-verify-link">
                <span className="kyr-verify-label">Verify License:</span>
                <ExternalLink href={licenseLink.url}>{licenseLink.label}</ExternalLink>
              </div>
            ) : (
              <div className="kyr-verify-link">
                <span className="kyr-verify-label">Find your state's contractor board:</span>
                <ExternalLink href="https://www.dsireusa.org">DSIRE — State Solar Requirements</ExternalLink>
              </div>
            )}
            <div className="kyr-info-box">
              <strong>Ask the installer directly:</strong> "What is your state contractor license number?" — then verify it yourself before signing. In states like CA, NJ, PA, MD, and OR, an unlicensed contractor may not be able to enforce the contract.
            </div>
          </SectionCard>

          {/* 3. Consumer protection */}
          <SectionCard icon="⚖" title="State Consumer Protection" color="amber">
            <div className="kyr-ag-row">
              <div className="kyr-ag-label">File a complaint with:</div>
              <ExternalLink href={stateData.agUrl}>{stateData.agName}</ExternalLink>
            </div>
            {stateData.hasHICLaw && !stateData.hicNote && (
              <div className="kyr-state-note">
                <span className="kyr-note-label">Home Improvement Law</span>
                {stateName} has a Home Improvement Contractor law that provides additional protections for solar customers beyond federal law.
              </div>
            )}
            {stateData.notableLaw && (
              <div className="kyr-state-note kyr-note-highlight">
                <span className="kyr-note-label">{stateName} Notable Protection</span>
                {stateData.notableLaw}
              </div>
            )}
            <div className="kyr-info-box">
              <strong>Also file with the FTC</strong> at{' '}
              <ExternalLink href="https://reportfraud.ftc.gov">reportfraud.ftc.gov</ExternalLink>
              {' '}— FTC complaints build the national database used to identify and prosecute repeat offenders.
            </div>
          </SectionCard>

          {/* 4. What to do if you signed */}
          <SectionCard icon="📋" title="What to Do If You Already Signed" color="neutral">
            <div className="kyr-steps-list">
              {WHAT_TO_DO_STEPS.map((step, i) => (
                <div key={i} className="kyr-step">
                  <div className="kyr-step-num">{step.num}</div>
                  <div className="kyr-step-content">
                    <div className="kyr-step-title">{step.title}</div>
                    <div className="kyr-step-text">{step.text}</div>
                  </div>
                </div>
              ))}
              <div className="kyr-step kyr-step-state">
                <div className="kyr-step-num">→</div>
                <div className="kyr-step-content">
                  <div className="kyr-step-title">{stateName} — File a State Complaint</div>
                  <div className="kyr-step-text">
                    <ExternalLink href={stateData.agUrl}>{stateData.agName}</ExternalLink>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 5. Red flags that may void contract */}
          <SectionCard icon="✕" title="Red Flags That May Void Your Contract" color="red">
            <p className="kyr-body-text" style={{ marginBottom: '16px' }}>
              The following are legally significant warning signs. If any apply to your situation, consult a consumer protection attorney — many take solar cases on contingency.
            </p>
            <div className="kyr-redflag-list">
              {RED_FLAGS.map((rf, i) => (
                <div key={i} className={`kyr-redflag-item ${rf.severity === 'high' ? 'high' : 'medium'}`}>
                  <div className="kyr-redflag-flag">
                    <span className={`kyr-redflag-dot ${rf.severity}`} />
                    {rf.flag}
                  </div>
                  <div className="kyr-redflag-detail">{rf.detail}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="kyr-disclaimer">
        <span className="kyr-disclaimer-icon">⚖</span>
        <p>
          This page is a consumer information resource, not legal advice. Laws change and state-specific details
          should be verified directly with your state AG or a licensed consumer protection attorney.
          SolarShield is not affiliated with any government agency or law firm.
        </p>
      </div>

      {/* ── CTA ── */}
      {onNavigate && (
        <section className="kyr-cta">
          <div className="kyr-cta-text">Ready to analyze your quote or contract?</div>
          <div className="kyr-cta-buttons">
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
