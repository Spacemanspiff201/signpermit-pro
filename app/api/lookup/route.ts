import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const JURISDICTIONS: Record<string, {
  name: string;
  sources: { url: string; type: 'pdf' | 'html'; description: string }[];
}> = {
  "orlando": {
    name: "City of Orlando, FL",
    sources: [
      { url: "https://www.orlando.gov/files/sharedassets/public/v/1/departments/sustainability/ordinances/sign-ordinance.pdf", type: "pdf", description: "Orlando Sign Ordinance" },
      { url: "https://www.orlando.gov/Building-Development/Permits/Sign-Permits", type: "html", description: "Orlando Sign Permits page" },
    ],
  },
  "tampa": {
    name: "City of Tampa, FL",
    sources: [
      { url: "https://www.tampagov.net/sites/default/files/development-growth-management/files/sign_code_chapter_20.5.pdf", type: "pdf", description: "Tampa Sign Code Ch 20.5" },
      { url: "https://www.tampagov.net/development-and-growth-management/permits/sign-permits", type: "html", description: "Tampa Sign Permits page" },
    ],
  },
  "hillsborough": {
    name: "Hillsborough County, FL",
    sources: [
      { url: "https://www.hillsboroughcounty.org/en/residents/property-owners-and-renters/building-and-development/permits/sign-permits", type: "html", description: "Hillsborough Sign Permits" },
    ],
  },
  "pompano-beach": {
    name: "City of Pompano Beach, FL",
    sources: [
      { url: "https://www.pompanobeachfl.gov/government/departments/development-services/building/permits/sign-permits", type: "html", description: "Pompano Beach Sign Permits" },
    ],
  },
  "fort-lauderdale": {
    name: "City of Fort Lauderdale, FL",
    sources: [
      { url: "https://www.fortlauderdale.gov/home/showpublisheddocument/56789", type: "pdf", description: "Fort Lauderdale Sign Code" },
      { url: "https://www.fortlauderdale.gov/departments/sustainable-development/building-services/permits/sign-permits", type: "html", description: "Fort Lauderdale Sign Permits" },
    ],
  },
  "miami-dade": {
    name: "Miami-Dade County, FL",
    sources: [
      { url: "https://www.miamidade.gov/permits/library/signs-handout.pdf", type: "pdf", description: "Miami-Dade Signs Handout" },
      { url: "https://www.miamidade.gov/permits/signs.asp", type: "html", description: "Miami-Dade Sign Permits page" },
    ],
  },
  "broward": {
    name: "Broward County, FL",
    sources: [
      { url: "https://www.broward.org/PlanningAndDevelopmentManagement/Pages/SignPermits.aspx", type: "html", description: "Broward Sign Permits" },
    ],
  },
  "palm-beach": {
    name: "Palm Beach County, FL",
    sources: [
      { url: "https://discover.pbcgov.org/pzb/zoning/Pages/Signs.aspx", type: "html", description: "Palm Beach Signs page" },
    ],
  },
  "boca-raton": {
    name: "City of Boca Raton, FL",
    sources: [
      { url: "https://www.myboca.us/DocumentCenter/View/11881/Sign-Code", type: "pdf", description: "Boca Raton Sign Code PDF" },
      { url: "https://www.myboca.us/756/Sign-Permits", type: "html", description: "Boca Raton Sign Permits" },
    ],
  },
  "miami-beach": {
    name: "City of Miami Beach, FL",
    sources: [
      { url: "https://www.miamibeachfl.gov/city-hall/building/permits/sign-permits/", type: "html", description: "Miami Beach Sign Permits" },
    ],
  },
};

async function fetchPDF(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SignCodePro/1.0)" },
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return "";
    const buffer = await res.arrayBuffer();
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(Buffer.from(buffer));
    return data.text.slice(0, 15000);
  } catch (e) {
    console.error("PDF fetch error:", e);
    return "";
  }
}

async function fetchHTML(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
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
      .slice(0, 12000);
  } catch (e) {
    console.error("HTML fetch error:", e);
    return "";
  }
}

async function fetchSource(source: { url: string; type: 'pdf' | 'html'; description: string }): Promise<string> {
  if (source.type === 'pdf') return fetchPDF(source.url);
  return fetchHTML(source.url);
}

export async function GET(req: NextRequest) {
  const jurisdiction = req.nextUrl.searchParams.get("jurisdiction");

  if (!jurisdiction) {
    return NextResponse.json({ error: "Jurisdiction required" }, { status: 400 });
  }

  const jData = JURISDICTIONS[jurisdiction];
  if (!jData) {
    return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 });
  }

  // Fetch all sources in parallel
  const texts = await Promise.all(jData.sources.map(fetchSource));
  const combinedText = texts.filter(t => t.length > 100).join("\n\n---\n\n");
  const hasRealData = combinedText.length > 300;

  const prompt = hasRealData
    ? `You are a sign permit expert. Extract sign code requirements from this official source text for ${jData.name}.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "name": "${jData.name}",
  "maxPylonHeight": <number in feet or null>,
  "maxMonumentHeight": <number in feet or null>,
  "maxSignArea": <number in sq ft for B-2 commercial or null>,
  "minSetback": <number in feet from ROW or null>,
  "emcAllowed": <true, false, or null>,
  "emcNotes": <string describing EMC requirements or null>,
  "permitFee": <string describing fee or null>,
  "turnaround": <string like "4-6 weeks" or null>,
  "requiredDocs": <array of required document strings or []>,
  "keyRestrictions": <2-3 sentence plain English summary of key restrictions>,
  "confidence": <"high" if 5+ fields found, "medium" if 3-4, "low" if fewer>,
  "source": "official-source"
}

Official source text:
${combinedText}`
    : `You are a sign permit expert with deep knowledge of Florida municipal sign codes.

Provide accurate sign code requirements for ${jData.name} based on the officially published code.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "name": "${jData.name}",
  "maxPylonHeight": <number in feet>,
  "maxMonumentHeight": <number in feet>,
  "maxSignArea": <number in sq ft for B-2 commercial>,
  "minSetback": <number in feet from ROW>,
  "emcAllowed": <true or false>,
  "emcNotes": <string or null>,
  "permitFee": <string>,
  "turnaround": <string>,
  "requiredDocs": <array of strings>,
  "keyRestrictions": <2-3 sentence summary>,
  "confidence": "medium",
  "source": "ai-knowledge"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json({
      success: true,
      data,
      scrapedAt: new Date().toISOString(),
      sourcesAttempted: jData.sources.length,
      sourcesSucceeded: texts.filter(t => t.length > 100).length,
    });

  } catch (err) {
    console.error("[lookup] error:", err);
    return NextResponse.json({ error: "Failed to parse data" }, { status: 500 });
  }
}