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
        from:    "SignCode Pro <onboarding@resend.dev>",
        to:      email,
        subject: `You're #${record.position} on the SignCode Pro waitlist`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;">

        <tr><td style="padding:28px 40px 20px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;">
                <div style="width:32px;height:32px;background:#185FA5;border-radius:8px;display:inline-block;text-align:center;line-height:32px;">
                  <span style="color:#fff;font-weight:700;font-size:14px;">SC</span>
                </div>
              </td>
              <td>
                <span style="font-size:16px;font-weight:700;color:#0D1B2A;">Sign</span><span style="font-size:16px;font-weight:700;color:#185FA5;">Code</span><span style="font-size:12px;color:#9BA8B4;margin-left:2px;">Pro</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 24px;">
          <div style="background:#0D1B2A;border-radius:12px;padding:28px 24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#fff;">You're in, ${firstName}.</p>
            <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);">Your waitlist position</p>
            <p style="margin:0;font-size:48px;font-weight:700;color:#85B7EB;line-height:1;">#${record.position}</p>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">out of 100 Florida beta spots</p>
          </div>
        </td></tr>

        <tr><td style="padding:0 40px 20px;">
          <p style="font-size:14px;color:#5A6B7A;line-height:1.7;margin:0 0 16px;">
            Hey ${firstName} — thanks for joining the SignCode Pro waitlist. We're building the sign code and permit management platform the sign industry has needed for a long time, and we're starting with Florida.
          </p>
          <p style="font-size:14px;color:#5A6B7A;line-height:1.7;margin:0 0 24px;">
            You're position <strong style="color:#0D1B2A;">#${record.position}</strong> on the list. We're opening access in batches starting from the top.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding-bottom:24px;">
              <a href="https://signcodepro.com?ref=${record.referral_code}" style="display:inline-block;padding:13px 32px;background:#185FA5;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Move up — share your link
              </a>
            </td></tr>
          </table>

          <p style="font-size:12px;color:#9BA8B4;text-align:center;margin:0 0 24px;">
            Your referral link: <span style="color:#185FA5;">signcodepro.com?ref=${record.referral_code}</span><br>
            Each sign company you refer moves you up 5 spots.
          </p>

          <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">

          <p style="font-size:13px;font-weight:700;color:#0D1B2A;margin:0 0 12px;">What happens next</p>
          <p style="font-size:13px;color:#5A6B7A;margin:0 0 8px;">1. Share your referral link to move up faster</p>
          <p style="font-size:13px;color:#5A6B7A;margin:0 0 8px;">2. Watch your inbox — you'll get a direct invite when your spot opens</p>
          <p style="font-size:13px;color:#5A6B7A;margin:0 0 24px;">3. Founding members lock in 30% off Professional, forever</p>

          <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">

          <p style="font-size:13px;color:#5A6B7A;margin:0 0 8px;">Questions? Just reply to this email — it goes straight to us.</p>
          <p style="font-size:13px;color:#9BA8B4;margin:0;">— The SignCode Pro team</p>
        </td></tr>

        <tr><td style="background:#F4F7FA;padding:18px 40px;border-top:1px solid #E2E8F0;">
          <p style="font-size:11px;color:#9BA8B4;text-align:center;margin:0;line-height:1.6;">
            SignCode Pro · signcodepro.com<br>
            You're receiving this because you joined our waitlist.<br>
            <a href="#" style="color:#185FA5;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
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