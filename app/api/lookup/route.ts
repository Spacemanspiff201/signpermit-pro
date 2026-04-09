import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const JURISDICTION_URLS: Record<string, { name: string; urls: string[] }> = {
  "miami-dade": {
    name: "Miami-Dade County, FL",
    urls: [
      "https://www.miamidade.gov/permits/signs.asp",
      "https://library.municode.com/fl/miami_-_dade_county/codes/code_of_ordinances?nodeId=PTIIICOOR_CH33ZO_ARTIVSIAG",
    ],
  },
  "broward": {
    name: "Broward County, FL",
    urls: [
      "https://www.broward.org/PlanningAndDevelopmentManagement/Pages/SignPermits.aspx",
      "https://library.municode.com/fl/broward_county/codes/code_of_ordinances?nodeId=PTIICOOR_CH4BURE",
    ],
  },
  "fort-lauderdale": {
    name: "City of Fort Lauderdale, FL",
    urls: [
      "https://www.fortlauderdale.gov/departments/sustainable-development/building-services/permits/sign-permits",
      "https://library.municode.com/fl/fort_lauderdale/codes/unified_land_development_regulations?nodeId=SPBECO_CH47SI",
    ],
  },
  "pompano-beach": {
    name: "City of Pompano Beach, FL",
    urls: [
      "https://www.pompanobeachfl.gov/government/departments/development-services/building/permits/sign-permits",
    ],
  },
  "boca-raton": {
    name: "City of Boca Raton, FL",
    urls: [
      "https://www.myboca.us/756/Sign-Permits",
      "https://library.municode.com/fl/boca_raton/codes/code_of_ordinances?nodeId=PTIICOOR_CH28SI",
    ],
  },
  "palm-beach": {
    name: "Palm Beach County, FL",
    urls: [
      "https://discover.pbcgov.org/pzb/zoning/Pages/Signs.aspx",
    ],
  },
  "orlando": {
    name: "City of Orlando, FL",
    urls: [
      "https://www.orlando.gov/Building-Development/Permits/Sign-Permits",
      "https://library.municode.com/fl/orlando/codes/code_of_ordinances?nodeId=COOR_CH64LAUSDERE_ARTIVISICO_S64.608SIOB",
    ],
  },
  "tampa": {
    name: "City of Tampa, FL",
    urls: [
      "https://www.tampagov.net/development-and-growth-management/permits/sign-permits",
    ],
  },
  "hillsborough": {
    name: "Hillsborough County, FL",
    urls: [
      "https://www.hillsboroughcounty.org/en/residents/property-owners-and-renters/building-and-development/permits/sign-permits",
    ],
  },
  "miami-beach": {
    name: "City of Miami Beach, FL",
    urls: [
      "https://www.miamibeachfl.gov/city-hall/building/permits/sign-permits/",
    ],
  },
};

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SignCodePro/1.0; +https://signcodepro.com)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip HTML tags to get plain text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    return text;
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const jurisdiction = req.nextUrl.searchParams.get("jurisdiction");

  if (!jurisdiction) {
    return NextResponse.json({ error: "Jurisdiction required" }, { status: 400 });
  }

  const jData = JURISDICTION_URLS[jurisdiction];
  if (!jData) {
    return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 });
  }

  // Fetch content from all URLs for this jurisdiction
  const pageTexts = await Promise.all(jData.urls.map(fetchPageText));
  const combinedText = pageTexts.filter(Boolean).join("\n\n---\n\n");

  if (!combinedText || combinedText.length < 100) {
    return NextResponse.json({
      error: "Could not fetch jurisdiction data",
      fallback: true,
    }, { status: 422 });
  }

  // Use Claude to extract structured sign code data
  const prompt = `You are a sign permit expert. Extract sign code requirements from the following official municipal code text for ${jData.name}.

Return ONLY a valid JSON object with exactly these fields (use null if not found):
{
  "name": "${jData.name}",
  "maxPylonHeight": <number in feet or null>,
  "maxMonumentHeight": <number in feet or null>,
  "maxSignArea": <number in sq ft or null>,
  "minSetback": <number in feet or null>,
  "emcAllowed": <true/false or null>,
  "emcNotes": <string or null>,
  "permitFee": <string describing fee structure or null>,
  "turnaround": <string describing typical turnaround or null>,
  "requiredDocs": <array of strings or null>,
  "keyRestrictions": <string summarizing main restrictions in plain English, max 2 sentences>,
  "confidence": <"high"/"medium"/"low" based on how complete the data is>
}

Do not include any text outside the JSON object.

Municipal code text:
${combinedText}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    
    // Parse the JSON response
    const clean = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      data,
      scrapedAt: new Date().toISOString(),
      urls: jData.urls,
    });

  } catch (err) {
    console.error("[lookup] Claude error:", err);
    return NextResponse.json({ error: "Failed to parse jurisdiction data" }, { status: 500 });
  }
}