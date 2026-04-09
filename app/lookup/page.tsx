'use client';
import { useState } from 'react';

const CITY_MAP: Record<string, string> = {
  'miami': 'miami-dade',
  'miami-dade': 'miami-dade',
  'hialeah': 'miami-dade',
  'coral gables': 'miami-dade',
  'doral': 'miami-dade',
  'homestead': 'miami-dade',
  'kendall': 'miami-dade',
  'miami gardens': 'miami-dade',
  'broward': 'broward',
  'hollywood': 'broward',
  'pembroke pines': 'broward',
  'miramar': 'broward',
  'sunrise': 'broward',
  'plantation': 'broward',
  'davie': 'broward',
  'weston': 'broward',
  'deerfield beach': 'broward',
  'margate': 'broward',
  'coral springs': 'broward',
  'pompano beach': 'pompano-beach',
  'pompano': 'pompano-beach',
  'fort lauderdale': 'fort-lauderdale',
  'ft lauderdale': 'fort-lauderdale',
  'ft. lauderdale': 'fort-lauderdale',
  'boca raton': 'boca-raton',
  'boca': 'boca-raton',
  'delray beach': 'palm-beach',
  'west palm beach': 'palm-beach',
  'palm beach': 'palm-beach',
  'boynton beach': 'palm-beach',
  'lake worth': 'palm-beach',
  'wellington': 'palm-beach',
  'jupiter': 'palm-beach',
  'miami beach': 'miami-beach',
  'south beach': 'miami-beach',
  'orlando': 'orlando',
  'tampa': 'tampa',
  'hillsborough': 'hillsborough',
  'brandon': 'hillsborough',
  'riverview': 'hillsborough',
};

function findJurisdiction(query: string): string | null {
  const q = query.toLowerCase().trim();
  for (const [key, val] of Object.entries(CITY_MAP)) {
    if (q.includes(key)) return val;
  }
  return null;
}

function Row({ label, value, highlight }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #F4F7FA', gap: '16px' }}>
      <span style={{ fontSize: '12px', color: '#5A6B7A', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: '500', color: highlight ? '#185FA5' : '#0D1B2A', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#9BA8B4', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  );
}

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [directInfo, setDirectInfo] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'notfound' | 'error'>('idle');
  const [loadingMsg, setLoadingMsg] = useState('');

  async function lookup(q?: string) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    const key = findJurisdiction(searchQuery);
    if (!key) { setStatus('notfound'); return; }
    setStatus('loading');
    setResult(null);
    setDirectInfo(null);
    const messages = ['Identifying jurisdiction...', 'Fetching official code...', 'Extracting requirements...', 'Organizing data...'];
    let i = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => { i++; if (i < messages.length) setLoadingMsg(messages[i]); }, 2000);
    try {
      const res = await fetch(`/api/lookup?jurisdiction=${key}`);
      clearInterval(interval);
      if (!res.ok) { setStatus('error'); return; }
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setDirectInfo(json.directInfo);
        setStatus('found');
      } else { setStatus('notfound'); }
    } catch { clearInterval(interval); setStatus('error'); }
  }

  function quickLookup(city: string) { setQuery(city); lookup(city); }

  return (
    <main style={{ minHeight: '100vh', background: '#F4F7FA', fontFamily: 'Arial,Helvetica,sans-serif' }}>

      <nav style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#185FA5" /><rect x="10" y="10" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22" /><rect x="46" y="10" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22" /><rect x="10" y="46" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22" /><rect x="46" y="46" width="24" height="24" rx="5" fill="#fff" /><path d="M49.5 60l4 4 8-9" stroke="#185FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B2A' }}>Sign<span style={{ color: '#185FA5' }}>Code</span> <span style={{ fontSize: '10px', color: '#9BA8B4', fontWeight: '400' }}>Pro</span></span>
        </a>
        <a href="/waitlist" style={{ padding: '7px 16px', background: '#185FA5', color: '#fff', borderRadius: '7px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>Join waitlist</a>
      </nav>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: '#E6F1FB', color: '#185FA5', fontSize: '12px', fontWeight: '500', marginBottom: '16px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#185FA5' }}></div>
            Verified data · Florida jurisdictions
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1B2A', marginBottom: '10px' }}>Florida sign code lookup</h1>
          <p style={{ fontSize: '14px', color: '#5A6B7A', lineHeight: '1.6' }}>Enter any city or county to get sign code requirements, fees, documents, and direct contact info.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="Type a city or county — e.g. Miami, Pompano Beach, Orlando..."
              style={{ flex: 1, padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', color: '#0D1B2A', outline: 'none' }}
            />
            <button onClick={() => lookup()} disabled={status === 'loading'}
              style={{ padding: '11px 22px', background: status === 'loading' ? '#9BA8B4' : '#185FA5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: status === 'loading' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
              {status === 'loading' ? 'Loading...' : 'Look up'}
            </button>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9BA8B4' }}>Quick:</span>
            {['Miami', 'Fort Lauderdale', 'Pompano Beach', 'Boca Raton', 'Miami Beach', 'Orlando', 'Tampa'].map(c => (
              <button key={c} onClick={() => quickLookup(c)} style={{ padding: '3px 10px', border: '1px solid #E2E8F0', borderRadius: '20px', fontSize: '11px', color: '#5A6B7A', background: '#fff', cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
        </div>

        {status === 'loading' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid #E2E8F0', borderTopColor: '#185FA5', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }}></div>
            <div style={{ fontSize: '13px', color: '#5A6B7A' }}>{loadingMsg}</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {status === 'notfound' && (
          <div style={{ background: '#FAEEDA', border: '1px solid #F5C4B3', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#633806' }}>
            We don't have data for that jurisdiction yet. Try Miami, Fort Lauderdale, Pompano Beach, Boca Raton, Miami Beach, Orlando, or Tampa. More coming soon — <a href="/waitlist" style={{ color: '#185FA5' }}>join the waitlist</a>.
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#FCEBEB', border: '1px solid #F7C1C1', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#791F1F' }}>
            Something went wrong. Please try again.
          </div>
        )}

        {status === 'found' && result && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0D1B2A', marginBottom: '4px' }}>{result.name}</div>
                <div style={{ fontSize: '11px', color: '#9BA8B4' }}>Research verified · {result.codeRef || directInfo?.codeRef || 'Official code'}</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#EAF3DE', color: '#27500A' }}>
                ✓ Verified
              </span>
            </div>

            {/* Size limits */}
            <Section title="Size limits">
              <Row label="Max pylon / pole sign height" value={result.maxPylonHeight ? result.maxPylonHeight + ' ft' : 'Varies by district'} />
              <Row label="Max monument / ground sign height" value={result.maxMonumentHeight ? result.maxMonumentHeight + ' ft' : 'Varies by district'} />
              <Row label="Max sign area (typical commercial)" value={result.maxSignArea ? result.maxSignArea + ' sq ft' : 'Based on building frontage'} />
              <Row label="Min setback from ROW" value={result.minSetback ? result.minSetback + ' ft' : 'Varies'} />
              <Row label="Max letter height" value={result.letterHeightMax} />
            </Section>

            {/* EMC / Digital */}
            <Section title="EMC / Digital signs">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#5A6B7A' }}>EMC / digital signs allowed:</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: result.emcAllowed === true ? '#27500A' : result.emcAllowed === false ? '#791F1F' : '#633806' }}>
                  {result.emcAllowed === true ? '✓ Yes' : result.emcAllowed === false ? '✗ No / Heavily restricted' : 'Limited — verify with jurisdiction'}
                </span>
              </div>
              {result.emcNotes && <div style={{ fontSize: '12px', color: '#5A6B7A', lineHeight: '1.6', background: '#F4F7FA', padding: '10px', borderRadius: '7px' }}>{result.emcNotes}</div>}
            </Section>

            {/* Engineering & Inspections */}
            <Section title="Engineering & inspections">
              <Row label="Engineer seal required" value={result.engineerSealThreshold} />
              <Row label="Illumination standards" value={result.illuminationNotes} />
              <Row label="Inspections" value={result.inspectionRequired} />
            </Section>

            {/* Fees & Timeline */}
            <Section title="Fees & timeline">
              <Row label="Permit fee" value={result.permitFee} />
              <Row label="Typical turnaround" value={result.turnaround} />
            </Section>

            {/* Required docs */}
            {result.requiredDocs && result.requiredDocs.length > 0 && (
              <Section title="Required documents">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.requiredDocs.map((d: string, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#0D1B2A' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#185FA5', flexShrink: 0, marginTop: '5px' }}></div>
                      {d}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Key restrictions */}
            {result.keyRestrictions && (
              <Section title="Key restrictions">
                <div style={{ fontSize: '12px', color: '#5A6B7A', lineHeight: '1.7' }}>{result.keyRestrictions}</div>
              </Section>
            )}

            {/* Overlay districts */}
            {result.overlayDistricts && (
              <Section title="Overlay districts & special areas">
                <div style={{ fontSize: '12px', color: '#5A6B7A', lineHeight: '1.7', background: '#FFF8E6', padding: '10px', borderRadius: '7px', border: '1px solid #F5C4B3' }}>
                  ⚠ {result.overlayDistricts}
                </div>
              </Section>
            )}

            {/* Practitioner notes */}
            {result.practitionerNotes && (
              <Section title="Practitioner notes">
                <div style={{ fontSize: '12px', color: '#0C447C', lineHeight: '1.7', background: '#E6F1FB', padding: '10px', borderRadius: '7px' }}>
                  💡 {result.practitionerNotes}
                </div>
              </Section>
            )}

            {/* Direct contact */}
            {directInfo && (
              <Section title="Direct contact">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {directInfo.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#9BA8B4', width: '60px' }}>Phone</span>
                      <a href={`tel:${directInfo.phone}`} style={{ color: '#185FA5', fontWeight: '500' }}>{directInfo.phone}</a>
                      {directInfo.secondPhone && <><span style={{ color: '#9BA8B4' }}>·</span><a href={`tel:${directInfo.secondPhone}`} style={{ color: '#185FA5' }}>{directInfo.secondPhone}</a></>}
                    </div>
                  )}
                  {directInfo.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#9BA8B4', width: '60px' }}>Email</span>
                      <a href={`mailto:${directInfo.email}`} style={{ color: '#185FA5' }}>{directInfo.email}</a>
                    </div>
                  )}
                  {directInfo.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#9BA8B4', width: '60px', flexShrink: 0 }}>Address</span>
                      <span style={{ color: '#0D1B2A' }}>{directInfo.address}</span>
                    </div>
                  )}
                  {directInfo.portalUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#9BA8B4', width: '60px' }}>Portal</span>
                      <a href={directInfo.portalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#185FA5' }}>{directInfo.portalLabel}</a>
                    </div>
                  )}
                  {directInfo.feeEstimator && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#9BA8B4', width: '60px' }}>Fees</span>
                      <a href={directInfo.feeEstimator} target="_blank" rel="noopener noreferrer" style={{ color: '#185FA5' }}>Fee estimator →</a>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Footer */}
            <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F4F7FA' }}>
              <div style={{ fontSize: '11px', color: '#9BA8B4' }}>Always verify with the jurisdiction before submitting. Codes change.</div>
              <a href="/waitlist" style={{ padding: '7px 16px', background: '#185FA5', color: '#fff', borderRadius: '7px', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}>Get full access →</a>
            </div>

          </div>
        )}

        {status === 'idle' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#0D1B2A', marginBottom: '14px' }}>Currently covered — Florida</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {['Miami-Dade County', 'Broward County', 'Palm Beach County', 'City of Fort Lauderdale', 'City of Pompano Beach', 'City of Boca Raton', 'City of Miami Beach', 'City of Orlando', 'City of Tampa', 'Hillsborough County'].map(j => (
                <div key={j} style={{ padding: '8px 12px', background: '#F4F7FA', borderRadius: '7px', fontSize: '12px', color: '#5A6B7A' }}>{j}</div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#9BA8B4', marginTop: '14px' }}>More jurisdictions added weekly. <a href="/waitlist" style={{ color: '#185FA5' }}>Join the waitlist</a> to request yours.</div>
          </div>
        )}

      </div>
    </main>
  );
}