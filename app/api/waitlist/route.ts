import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string) {
  return str.trim().slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName  = sanitize(body.firstName  || "");
    const lastName   = sanitize(body.lastName   || "");
    const email      = sanitize(body.email      || "").toLowerCase();
    const company    = sanitize(body.company    || "");
    const role       = sanitize(body.role       || "");
    const volume     = sanitize(body.volume     || "");
    const markets    = sanitize(body.markets    || "");
    const referredBy = sanitize(body.ref        || "");

    if (!firstName) return NextResponse.json({ error: "First name is required" }, { status: 400 });
    if (!lastName)  return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    if (!company)   return NextResponse.json({ error: "Company name is required" }, { status: 400 });

    const { data: existing } = await supabase
      .from("waitlist")
      .select("id, position, referral_code")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        position: existing.position,
        referralCode: existing.referral_code,
      });
    }

    let validRef: string | null = null;
    if (referredBy) {
      const { data: referrer } = await supabase
        .from("waitlist")
        .select("id")
        .eq("referral_code", referredBy)
        .single();
      if (referrer) validRef = referredBy;
    }

    const { data: record, error: insertError } = await supabase
      .from("waitlist")
      .insert({
        first_name:      firstName,
        last_name:       lastName,
        email,
        company,
        role,
        permit_volume:   volume,
        primary_markets: markets,
        referred_by:     validRef,
      })
      .select("position, referral_code")
      .single();

    if (insertError || !record) {
      console.error("[waitlist] insert error:", insertError);
      return NextResponse.json({ error: "Failed to save signup" }, { status: 500 });
    }

    try {
      await resend.emails.send({
        from:    "SignPermit Pro <onboarding@resend.dev>",
        to:      email,
        subject: `You're #${record.position} on the SignPermit Pro waitlist`,
        html: `<h2>You're in, ${firstName}!</h2>
               <p>You're position <strong>#${record.position}</strong> on the SignPermit Pro waitlist.</p>
               <p>We're opening access to Florida sign companies first. We'll email you when your spot opens.</p>
               <p>— The SignPermit Pro team</p>`,
      });
    } catch (emailErr) {
      console.error("[waitlist] email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      position: record.position,
      referralCode: record.referral_code,
    });

  } catch (err: any) {
    console.error("[waitlist] error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const { data } = await supabase
    .from("waitlist")
    .select("position, referral_count, referral_code, status")
    .eq("email", email.toLowerCase())
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}