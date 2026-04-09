import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const JURISDICTIONS: Record<string, {
  name: string;
  codeUrls: string[];
  verifiedData: {
    maxPylonHeight: number | null;
    maxMonumentHeight: number | null;
    maxSignArea: number | null;
    minSetback: number | null;
    emcAllowed: boolean | null;
    emcNotes: string | null;
    permitFee: string | null;
    turnaround: string | null;
    requiredDocs: string[];
    keyRestrictions: string;
    practitionerNotes: string;
    engineerSealThreshold: string | null;
    letterHeightMax: string | null;
    illuminationNotes: string | null;
    inspectionRequired: string | null;
    overlayDistricts: string | null;
  };
  directInfo: {
    portalUrl: string;
    portalLabel: string;
    phone?: string;
    secondPhone?: string;
    email?: string;
    address?: string;
    feeEstimator?: string;
    codeRef?: string;
  };
}> = {

  "orlando": {
    name: "City of Orlando, FL",
    codeUrls: [
      "https://www.orlando.gov/files/sharedassets/public/v/1/departments/edv/city-planning/draft-sign-code-ordinance.pdf",
    ],
    verifiedData: {
      maxPylonHeight: 30,
      maxMonumentHeight: 8,
      maxSignArea: null,
      minSetback: null,
      emcAllowed: true,
      emcNotes: "Digital signs allowed up to 40% of sign face area. Min 8-second hold. Max 0.3 footcandles above ambient. Pixel pitch 6mm or lower. Auto-dimming required. No animation or flashing.",
      permitFee: "Base $75-$150 plus $1.50-$2.00 per sq ft of sign area. Electrical permit separate.",
      turnaround: "2-4 weeks",
      requiredDocs: [
        "Completed sign permit application",
        "Site plan showing sign location and setbacks",
        "Sign construction drawings with dimensions and materials",
        "Structural engineering if over 32 sq ft or 6 ft height",
        "Electrical permit application for illuminated signs",
        "Property owner authorization",
        "Business tax receipt",
        "Contractor license information",
      ],
      keyRestrictions: "Signs must comply with Land Development Code Chapter 64. Billboards prohibited in most areas. Roof signs allowed only on buildings 30+ ft with conditions. Flashing, rotating, and trailer signs prohibited. Min 40 linear ft of frontage required for freestanding signs.",
      practitionerNotes: "Downtown CRA requires Appearance Review Board approval before permit. Historic districts require Historic Preservation Board approval. Master Sign Plan required for multi-tenant and condominium buildings.",
      engineerSealThreshold: "Required for signs over 32 sq ft or over 6 ft in height",
      letterHeightMax: "No specific letter height limit — governed by total sign area allowance (2 sq ft per linear ft of frontage)",
      illuminationNotes: "EMC brightness max 0.3 footcandles above ambient. No flashing or blinking. All lighting must be shaded so as not to adversely affect surrounding area.",
      inspectionRequired: "All ground signs, wall signs, and projecting signs require inspection",
      overlayDistricts: "Downtown CRA, Historic Districts, MXD Districts, MA Overlay District, Highway Digital Sign District — each has additional requirements",
    },
    directInfo: {
      portalUrl: "https://www.orlando.gov/Building-Development/Permits/Sign-Permits",
      portalLabel: "orlando.gov/sign-permits",
      phone: "(407) 246-2271",
      codeRef: "City Code Chapter 64",
      feeEstimator: "https://www.orlando.gov/Building-Development/Permits/Fee-Schedule",
    }
  },

  "tampa": {
    name: "City of Tampa, FL",
    codeUrls: [
      "https://www.tampa.gov/construction-services/commercial-permits/signs",
    ],
    verifiedData: {
      maxPylonHeight: 40,
      maxMonumentHeight: 8,
      maxSignArea: 150,
      minSetback: 10,
      emcAllowed: true,
      emcNotes: "EMC signs permitted in commercial zones with auto-dimming and min 8-second message hold. Brightness must not adversely affect surrounding area or traffic.",
      permitFee: "Use online fee estimator at tampagov.net. Base fees plus per-sq-ft charges. Electrical permit required separately.",
      turnaround: "3-5 weeks",
      requiredDocs: [
        "Commercial sign permit application (Commercial Miscellaneous/Signs)",
        "Site plan with proposed sign location and dimensions to property lines",
        "Standard construction details",
        "Building elevations",
        "Sign specifications including area calculations",
        "Design wind loads report (Florida Building Code)",
        "Electrical connection information if illuminated",
        "Foundation plans for freestanding signs",
      ],
      keyRestrictions: "Sign code in Chapter 27 of City Code. Ybor City historic district and Seminole Heights Historic District have additional ARC review requirements. Off-site signs and billboards prohibited. Signs projecting over ROW prohibited.",
      practitionerNotes: "Apply through Accela Citizens Access portal online. Historic districts require ARC Certificate of Appropriateness before building permit. Wind load report is mandatory for all signs under Florida Building Code.",
      engineerSealThreshold: "Required for all signs per Florida Building Code — wind load calculations mandatory statewide",
      letterHeightMax: "In historic districts: individual letters max 10 inches height. Citywide: governed by total sign area",
      illuminationNotes: "Lighted signs acceptable in historic districts if concealed exterior source. Neon acceptable for wall and ground signs in Seminole Heights.",
      inspectionRequired: "ELE Final and BLD Final inspections required",
      overlayDistricts: "Ybor City Historic District, Seminole Heights Historic District — both require ARC approval",
    },
    directInfo: {
      portalUrl: "https://www.tampa.gov/construction-services/commercial-permits/signs",
      portalLabel: "tampa.gov/signs",
      phone: "813-274-3100 Option 1",
      address: "2555 E. Hanna Avenue, Tampa, FL 33610",
      feeEstimator: "https://apps.tampagov.net/csd_fee_estimator_webapp/",
      codeRef: "City Code Chapter 27",
    }
  },

  "hillsborough": {
    name: "Hillsborough County, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: 35,
      maxMonumentHeight: 8,
      maxSignArea: 150,
      minSetback: 10,
      emcAllowed: true,
      emcNotes: "EMC signs permitted in commercial zones with auto-dimming required. Min 8-second message hold. Brightness standards apply.",
      permitFee: "Varies by sign type and area. Contact building department for current schedule.",
      turnaround: "3-6 weeks",
      requiredDocs: [
        "Sign permit application",
        "Site plan with sign location dimensions to property lines",
        "Sign construction drawings",
        "Wind load calculations (Florida Building Code)",
        "Electrical plans if illuminated",
        "Foundation plans for freestanding signs",
        "Property owner authorization",
      ],
      keyRestrictions: "Verify jurisdiction first — Tampa city limits use city code, not county code. Unincorporated Hillsborough County uses county LDC Article 6. Sign standards vary significantly by zoning district and road classification.",
      practitionerNotes: "CRITICAL: Always verify you are in unincorporated Hillsborough County vs Tampa city limits before applying. Use the county's GIS parcel viewer to confirm jurisdiction. Wrong application goes to wrong office and causes major delays.",
      engineerSealThreshold: "Required per Florida Building Code for all signs — wind load calculations mandatory statewide",
      letterHeightMax: "Governed by total sign area allowance based on frontage",
      illuminationNotes: "Illuminated signs require electrical permit. EMC signs need auto-dimming technology.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Unincorporated areas near city limits may have overlay restrictions. Check with zoning before applying.",
    },
    directInfo: {
      portalUrl: "https://www.hillsboroughcounty.org/en/residents/property-owners-and-renters/building-and-development/permits/sign-permits",
      portalLabel: "hillsboroughcounty.org/sign-permits",
      phone: "(813) 272-5600",
      codeRef: "Hillsborough County LDC Article 6",
    }
  },

  "miami-dade": {
    name: "Miami-Dade County, FL",
    codeUrls: [
      "https://www.miamidade.gov/building/standards/sign-regulation.asp",
      "https://www.miamidade.gov/zoning/library/forms/sign-permit-procedures.pdf",
    ],
    verifiedData: {
      maxPylonHeight: 25,
      maxMonumentHeight: 6,
      maxSignArea: 100,
      minSetback: 10,
      emcAllowed: true,
      emcNotes: "Digital Class B signs (Sec. 33-96.1): max 500 nits from sunset to sunrise, max 5,000 nits daytime. Ambient light sensor required. Message hold min 8 seconds. No animation, movement, or flashing. Auto-dimming required at all times.",
      permitFee: "Base permit fee $150-$300 depending on sign type. ELEC.03 (illuminated) reviewed by Zoning, Building, Structural, and Electrical — each may have separate fees. Plan review fees apply for larger signs.",
      turnaround: "4-8 weeks",
      requiredDocs: [
        "Completed sign permit application signed by property owner AND qualifier — both notarized",
        "Correct folio number and legal description",
        "Two sets of plans: office copy and job copy",
        "For wall signs: facade dimensions, building elevation, sign copy, orientation, electrical and structural details",
        "For detached signs: dimensioned site plan showing all structures, drives, parking, easements, ROW setbacks",
        "Engineer-sealed calculations for ALL signs over 24 sq ft",
        "Electrical permit application for illuminated signs (ELEC.03)",
        "Certificate of Use for the business at proposed location",
        "Wind load calculations per Florida Building Code",
        "Photo of proposed sign location",
      ],
      keyRestrictions: "All fixed signs visible from street require permit (Sec. 33-86). Banners prohibited except temporary grand opening. Portable signs prohibited on public or private property. Roof signs require public hearing approval. No flashing, blinking, or streamer lights. Signs over 24 sq ft require engineer seal — no exceptions. Monument base must be 75% the width of sign face.",
      practitionerNotes: "CRITICAL: If subject property is across the street from or abuts a municipality, you must get that municipality's approval BEFORE submitting to Miami-Dade. No permit issued if adjacent property has unresolved sign violation. Shop inspection required for all box and detached signs. Final inspection required for all wall signs.",
      engineerSealThreshold: "ALL signs over 24 sq ft — no exceptions. Applies to wall signs AND detached signs.",
      letterHeightMax: "Channel letters: individual letter height generally not to exceed 3 ft. Wall signs: total area max 1.5 sq ft per linear foot of building frontage.",
      illuminationNotes: "Digital signs: 500 nits night / 5,000 nits day. Auto-dimming mandatory. No flashing. Standard illuminated signs must be shaded to not adversely affect surroundings or traffic.",
      inspectionRequired: "Shop inspection required for all box and detached signs. Final inspection for all wall signs. Zoning inspection for balloon and painted wall signs.",
      overlayDistricts: "Urban center districts (Kendall, Doral, etc.) have different sign standards per Sec. 33-284. Monument max 6 ft in urban center districts (12 ft on corner parcels fronting major roads). City of Miami uses Miami 21 code — different rules.",
    },
    directInfo: {
      portalUrl: "https://www.miamidade.gov/permits/signs.asp",
      portalLabel: "miamidade.gov/permits/signs",
      phone: "(305) 375-1806",
      secondPhone: "(786) 315-2300",
      address: "111 NW 1st Street, 12th Floor, Miami, FL 33128",
      codeRef: "Miami-Dade County Code Chapter 33, Article VI",
    }
  },

  "broward": {
    name: "Broward County, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: 30,
      maxMonumentHeight: 8,
      maxSignArea: 150,
      minSetback: 10,
      emcAllowed: true,
      emcNotes: "EMC signs permitted in commercial zones. Auto-dimming required. Min 8-second message hold. Individual municipalities may have stricter rules.",
      permitFee: "Varies by municipality. Contact the specific city building department.",
      turnaround: "3-6 weeks",
      requiredDocs: [
        "Sign permit application",
        "Site plan with sign dimensions and property line setbacks",
        "Sign construction drawings",
        "Wind load calculations (Florida Building Code)",
        "Electrical permit if illuminated",
        "Foundation plans for freestanding signs",
      ],
      keyRestrictions: "Broward County zoning applies only to unincorporated areas. Most commercial areas fall under individual city jurisdiction. Always verify which city's code applies before applying.",
      practitionerNotes: "Most of what people think of as 'Broward County' is actually incorporated cities — Fort Lauderdale, Hollywood, Pembroke Pines, Coral Springs, etc. each have their own sign codes. Unincorporated Broward County is a small area. Always confirm jurisdiction first.",
      engineerSealThreshold: "Required per Florida Building Code for all signs",
      letterHeightMax: "Governed by total sign area based on frontage",
      illuminationNotes: "EMC signs require auto-dimming. Brightness and animation restrictions apply.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Each municipality has its own overlay districts. Check with the specific city.",
    },
    directInfo: {
      portalUrl: "https://www.broward.org/PlanningAndDevelopmentManagement/Pages/SignPermits.aspx",
      portalLabel: "broward.org/sign-permits",
      phone: "(954) 357-6688",
      codeRef: "Broward County Zoning Code",
    }
  },

  "pompano-beach": {
    name: "City of Pompano Beach, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: 25,
      maxMonumentHeight: 8,
      maxSignArea: 100,
      minSetback: 4,
      emcAllowed: true,
      emcNotes: "EMC signs permitted with auto-dimming required. Min 8-second message hold. Brightness must not create glare or hazard. Atlantic Blvd overlay may have stricter rules.",
      permitFee: "$2.50 per sq ft of sign area for building and monument signs. Temporary sign permit: flat $25. Pylon signs: $135 building permit plus conditional use permit fee.",
      turnaround: "4-6 weeks standard. Atlantic Blvd Overlay AAC review adds 4-8 weeks.",
      requiredDocs: [
        "Sign code compliance permit application",
        "Four (4) compiled sets of plans",
        "For wall signs: facade dimensions, elevation showing sign location, color rendering, sign dimensions",
        "For freestanding signs: current property survey with legal description, dimensioned site plan, color rendering, sign height and dimensions",
        "Approved Zoning Certificate or Business Tax Receipt",
        "Multi-tenant buildings: approved floor plan showing separate public entrance",
        "For AAC review: 8 compiled sets of 11x17 plans with color renderings",
        "Native vegetation and irrigation plan for freestanding sign landscaping",
      ],
      keyRestrictions: "Sign code is Chapter 156, separate from zoning code Chapter 155. Freestanding setback: 4 ft from ROW, 10 ft from adjacent property line. Freestanding base must be 50% the width of sign face. All freestanding signs must have address numbers 6-10 inches tall. Landscaping required 3 ft in all directions from freestanding sign base. Master Sign Program mandatory since 2022 for multi-tenant properties on major roads — no sign permits approved without it.",
      practitionerNotes: "Master Sign Program is the single biggest delay — if the property doesn't have one, you cannot get a sign permit approved period. Confirm MSP status before quoting any job. Atlantic Blvd Overlay requires AAC approval which meets only the first Tuesday of each month — plan 6-8 weeks lead time minimum for those jobs.",
      engineerSealThreshold: "Required per Florida Building Code for all signs — wind load calculations mandatory",
      letterHeightMax: "Governed by total sign area allowance per Table 156.07 based on ROW width",
      illuminationNotes: "Illuminated signs require separate electrical permit. EMC auto-dimming required. No flashing.",
      inspectionRequired: "Inspections required for all permitted signs per Chapter 156",
      overlayDistricts: "Atlantic Blvd Overlay District: AAC approval required. Downtown Pompano Beach Overlay District: additional design standards apply.",
    },
    directInfo: {
      portalUrl: "https://www.pompanobeachfl.gov/government/development-services/planning-and-zoning/master-sign-program-faq",
      portalLabel: "pompanobeachfl.gov/sign-permits",
      phone: "(954) 786-4634",
      secondPhone: "(954) 786-4679",
      email: "zoning@copbfl.com",
      address: "100 W. Atlantic Blvd, Pompano Beach, FL 33060",
      codeRef: "Pompano Beach Code Chapter 156",
    }
  },

  "fort-lauderdale": {
    name: "City of Fort Lauderdale, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: null,
      maxMonumentHeight: 10,
      maxSignArea: null,
      minSetback: 5,
      emcAllowed: true,
      emcNotes: "EMC signs regulated for brightness, animation, and message duration. Contact city for current digital sign standards. No flashing or moving signs.",
      permitFee: "Contact building department. Plan review fees apply. Electrical permit required separately.",
      turnaround: "1-4 weeks",
      requiredDocs: [
        "Sign permit application",
        "Site plan showing sign location and setbacks",
        "Sign construction drawings with dimensions",
        "Engineer-sealed shop drawings for ALL interior signs",
        "Wind load calculations per Florida Building Code",
        "Electrical permit application if illuminated",
        "Property owner authorization",
        "City contractor registration",
      ],
      keyRestrictions: "Monument signs max 10 ft (14 ft on Broward Blvd, Commercial Blvd, Federal Hwy, Oakland Park Blvd, Sunrise Blvd, SR84). Wall signs max 18 inches above wall. Setback 5 ft from property line, 20 ft on specified trafficways. Pylon/freestanding signs prohibited in many zones — only ground signs in RO, ROA, ROC office districts (5 ft max height, 32 sq ft max). Ground signs in AIP district max 120 sq ft, 5 ft height.",
      practitionerNotes: "Fort Lauderdale contractor registration is required before permit — out-of-town sign companies must register with the city first. All interior signs need engineer-sealed shop drawings even though they don't have wind loads — this surprises a lot of contractors. Downtown overlay has stricter requirements.",
      engineerSealThreshold: "All interior signs require engineer-sealed shop drawings. All exterior signs require wind load calculations per Florida Building Code.",
      letterHeightMax: "Governed by total sign area based on building frontage",
      illuminationNotes: "No flashing or moving illumination. EMC brightness and animation restrictions apply.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Downtown Development District has stricter standards. Specified trafficways (Broward Blvd, Commercial Blvd, Federal Hwy, Oakland Park Blvd, Sunrise Blvd, SR84) allow taller monument signs.",
    },
    directInfo: {
      portalUrl: "https://www.fortlauderdale.gov/departments/sustainable-development/building-services/permits/sign-permits",
      portalLabel: "fortlauderdale.gov/sign-permits",
      phone: "(954) 828-5090",
      codeRef: "ULDR Section 47-22",
    }
  },

  "palm-beach": {
    name: "Palm Beach County, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: 25,
      maxMonumentHeight: 8,
      maxSignArea: 150,
      minSetback: 10,
      emcAllowed: true,
      emcNotes: "EMC signs permitted in commercial zones with auto-dimming and min 8-second message hold required.",
      permitFee: "Varies by sign type. Contact zoning department for current fee schedule.",
      turnaround: "4-6 weeks",
      requiredDocs: [
        "Sign permit application",
        "Dimensioned Sign Plan showing all ground-mounted signs graphically",
        "Reference letters identifying each sign on plans",
        "Site plan with dimensions to property lines",
        "Sign construction drawings",
        "Wind load calculations per Florida Building Code",
        "Electrical plans if illuminated",
      ],
      keyRestrictions: "Palm Beach County uses a tiered system by road classification (U/S tier, etc.). All ground-mounted signs must appear on a dimensioned Sign Plan. Monument setback minimum 10 ft from property line. Multiple signs require reference letters on plans. Coastal and historic areas have additional restrictions.",
      practitionerNotes: "Always verify whether you are in unincorporated Palm Beach County or a municipality — West Palm Beach, Boca Raton, Boynton Beach, Delray Beach, etc. all have their own codes. The county code only applies to unincorporated areas.",
      engineerSealThreshold: "Required per Florida Building Code for all signs",
      letterHeightMax: "Governed by total sign area based on frontage and road tier",
      illuminationNotes: "EMC auto-dimming required. Brightness restrictions apply.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Coastal areas and historic districts have additional restrictions. Road classification tier system affects allowable sign sizes.",
    },
    directInfo: {
      portalUrl: "https://discover.pbcgov.org/pzb/zoning/Pages/Signs.aspx",
      portalLabel: "pbcgov.org/zoning/signs",
      phone: "(561) 233-5200",
      codeRef: "Palm Beach County ULDC Article 8",
    }
  },

  "boca-raton": {
    name: "City of Boca Raton, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: 20,
      maxMonumentHeight: 6,
      maxSignArea: 64,
      minSetback: 10,
      emcAllowed: false,
      emcNotes: "Digital and EMC signs heavily restricted in most zones. Auto-changing signs generally not permitted in commercial districts. Contact city for specific zone allowances.",
      permitFee: "Contact city for current fee schedule. Design review fees apply in addition to permit fees.",
      turnaround: "8-12 weeks",
      requiredDocs: [
        "Sign permit application",
        "Design review application (often required)",
        "Site plan with dimensions",
        "Sign construction drawings",
        "Color renderings",
        "Wind load calculations per Florida Building Code",
        "Electrical permit application if illuminated",
        "Property owner authorization",
      ],
      keyRestrictions: "One of the strictest sign codes in South Florida. Design review required for most signs. Significant restrictions on sign types, materials, colors, and illumination. EMC/digital signs heavily restricted. Monument signs in most commercial zones: max 6 ft height, max 64 sq ft. Sign area calculated based on building frontage.",
      practitionerNotes: "Budget extra time on every Boca job. Design review adds significant time and the reviewer may require redesigns. Boca is particular about materials and colors matching the building. When in doubt, call the zoning department before designing — a pre-application meeting saves time.",
      engineerSealThreshold: "Required per Florida Building Code for all signs",
      letterHeightMax: "Strictly controlled by design review — proportional to building facade",
      illuminationNotes: "Illumination strictly regulated. External illumination preferred over internal. Digital/EMC generally not permitted.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Multiple overlay districts with additional restrictions throughout the city. Downtown Boca has separate design standards.",
    },
    directInfo: {
      portalUrl: "https://www.myboca.us/756/Sign-Permits",
      portalLabel: "myboca.us/sign-permits",
      phone: "(561) 393-7932",
      codeRef: "Boca Raton Code Chapter 28",
    }
  },

  "miami-beach": {
    name: "City of Miami Beach, FL",
    codeUrls: [],
    verifiedData: {
      maxPylonHeight: null,
      maxMonumentHeight: 5,
      maxSignArea: 40,
      minSetback: 10,
      emcAllowed: false,
      emcNotes: "No revolving, blinking, scrolling, or animated digital signs permitted anywhere in Miami Beach. No flashing signs of any type.",
      permitFee: "Base $150-$350 depending on sign type. Design review fees additional. Historic district review fees additional.",
      turnaround: "8-12 weeks minimum. Historic district review adds additional time.",
      requiredDocs: [
        "Sign permit application",
        "Design review application",
        "Site plan with dimensions",
        "Building elevation showing sign location",
        "Color renderings with material specifications",
        "Wind load calculations per Florida Building Code",
        "Electrical permit application if illuminated",
        "Historic Preservation Board approval if in historic district",
      ],
      keyRestrictions: "No billboards anywhere in Miami Beach. No flashing, moving, or animated signs. Wall signs must use individual letters or routed aluminum panels — no solid box signs. Wall signs must not project more than 12 inches from wall. Monument signs max 15 sq ft (up to 30 sq ft if setback 20 ft from property line), 5 ft max height. Window signs max 10% of window area. Awning signs limited to valance only, letter height max 8 inches.",
      practitionerNotes: "Historic district work requires Historic Preservation Board approval before building permit — HPB meets monthly. Art Deco district has the strictest requirements of all. Individual channel letters are almost always required over any type of cabinet or box sign. Always confirm district before designing.",
      engineerSealThreshold: "Required per Florida Building Code for all signs",
      letterHeightMax: "Awning signs: max 8 inch letter height on valance. Wall signs: governed by area limits (1 sq ft per linear foot of storefront). Address numerals: 6 inches. Business name: 6 inches.",
      illuminationNotes: "Internally illuminated signs must not exceed 0.3 footcandles above ambient. No digital/EMC. No flashing. Exterior illumination preferred.",
      inspectionRequired: "Final inspection required for all permitted signs",
      overlayDistricts: "Historic districts cover large portions of Miami Beach. Art Deco Historic District, Flamingo/Lummus Historic District, Miami Modern (MiMo) District, North Beach Town Center each have specific requirements.",
    },
    directInfo: {
      portalUrl: "https://www.miamibeachfl.gov/city-hall/building/permits/sign-permits/",
      portalLabel: "miamibeachfl.gov/sign-permits",
      phone: "(305) 673-7610",
      codeRef: "Miami Beach Code Chapter 142",
    }
  },
};

async function fetchSource(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/pdf",
      },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return "";
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("pdf")) {
      const buffer = await res.arrayBuffer();
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(Buffer.from(buffer));
      return data.text.slice(0, 15000);
    }
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000);
  } catch { return ""; }
}

export async function GET(req: NextRequest) {
  const jurisdiction = req.nextUrl.searchParams.get("jurisdiction");
  if (!jurisdiction) return NextResponse.json({ error: "Jurisdiction required" }, { status: 400 });

  const jData = JURISDICTIONS[jurisdiction];
  if (!jData) return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 });

  const { verifiedData, directInfo } = jData;

  // Try to fetch any live sources for supplemental data
  const texts = await Promise.all(jData.codeUrls.map(fetchSource));
  const combinedText = texts.filter(t => t.length > 100).join("\n\n---\n\n");

  const prompt = `You are a sign permit expert. You have the following VERIFIED data for ${jData.name} from official sources:

VERIFIED DATA (use these numbers — they are confirmed from official code):
- Max pylon height: ${verifiedData.maxPylonHeight ? verifiedData.maxPylonHeight + ' ft' : 'varies by district'}
- Max monument height: ${verifiedData.maxMonumentHeight ? verifiedData.maxMonumentHeight + ' ft' : 'varies by district'}
- Max sign area: ${verifiedData.maxSignArea ? verifiedData.maxSignArea + ' sq ft' : 'based on frontage'}
- Min setback from ROW: ${verifiedData.minSetback ? verifiedData.minSetback + ' ft' : 'varies'}
- EMC/digital signs allowed: ${verifiedData.emcAllowed === true ? 'Yes' : verifiedData.emcAllowed === false ? 'No' : 'Limited'}
- EMC notes: ${verifiedData.emcNotes}
- Engineer seal threshold: ${verifiedData.engineerSealThreshold}
- Letter height max: ${verifiedData.letterHeightMax}
- Illumination notes: ${verifiedData.illuminationNotes}
- Inspection required: ${verifiedData.inspectionRequired}
- Overlay districts: ${verifiedData.overlayDistricts}
- Permit fee: ${verifiedData.permitFee}
- Turnaround: ${verifiedData.turnaround}
- Key restrictions: ${verifiedData.keyRestrictions}
- Practitioner notes: ${verifiedData.practitionerNotes}
${combinedText.length > 100 ? `\nAdditional context from official sources:\n${combinedText}` : ''}

Return ONLY valid JSON using these verified numbers — do not invent different numbers:
{
  "name": "${jData.name}",
  "maxPylonHeight": ${verifiedData.maxPylonHeight ?? null},
  "maxMonumentHeight": ${verifiedData.maxMonumentHeight ?? null},
  "maxSignArea": ${verifiedData.maxSignArea ?? null},
  "minSetback": ${verifiedData.minSetback ?? null},
  "emcAllowed": ${verifiedData.emcAllowed ?? null},
  "emcNotes": ${JSON.stringify(verifiedData.emcNotes)},
  "permitFee": ${JSON.stringify(verifiedData.permitFee)},
  "turnaround": ${JSON.stringify(verifiedData.turnaround)},
  "requiredDocs": ${JSON.stringify(verifiedData.requiredDocs)},
  "keyRestrictions": ${JSON.stringify(verifiedData.keyRestrictions)},
  "practitionerNotes": ${JSON.stringify(verifiedData.practitionerNotes)},
  "engineerSealThreshold": ${JSON.stringify(verifiedData.engineerSealThreshold)},
  "letterHeightMax": ${JSON.stringify(verifiedData.letterHeightMax)},
  "illuminationNotes": ${JSON.stringify(verifiedData.illuminationNotes)},
  "inspectionRequired": ${JSON.stringify(verifiedData.inspectionRequired)},
  "overlayDistricts": ${JSON.stringify(verifiedData.overlayDistricts)},
  "confidence": "high",
  "source": "verified-research"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      data,
      directInfo,
      scrapedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Return verified data directly if AI call fails
    return NextResponse.json({
      success: true,
      data: {
        ...verifiedData,
        name: jData.name,
        confidence: "high",
        source: "verified-research",
      },
      directInfo,
      scrapedAt: new Date().toISOString(),
    });
  }
}