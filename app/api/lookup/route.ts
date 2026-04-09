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

const strictColor: Record<string, {bg:string,text:string}> = {
  high:   {bg:'#EAF3DE', text:'#27500A'},
  medium: {bg:'#FAEEDA', text:'#633806'},
  low:    {bg:'#FCEBEB', text:'#791F1F'},
};

export default function LookupPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<'idle'|'loading'|'found'|'notfound'|'error'>('idle');
  const [loadingMsg, setLoadingMsg] = useState('');

  async function lookup(q?: string) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    
    const key = findJurisdiction(searchQuery);
    if (!key) { setStatus('notfound'); return; }

    setStatus('loading');
    setResult(null);
    
    const messages = [
      'Identifying jurisdiction...',
      'Fetching official code...',
      'Reading sign code requirements...',
      'Organizing data...',
    ];
    let i = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < messages.length) setLoadingMsg(messages[i]);
    }, 2000);

    try {
      const res = await fetch(`/api/lookup?jurisdiction=${key}`);
      clearInterval(interval);
      
      if (!res.ok) { setStatus('error'); return; }
      
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setStatus('found');
      } else {
        setStatus('notfound');
      }
    } catch {
      clearInterval(interval);
      setStatus('error');
    }
  }

  function quickLookup(city: string) {
    setQuery(city);
    lookup(city);
  }

  return (
    <main style={{minHeight:'100vh',background:'#F4F7FA',fontFamily:'Arial,Helvetica,sans-serif'}}>

      <nav style={{background:'#fff',borderBottom:'1px solid #E2E8F0',padding:'0 40px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'56px'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none'}}>
          <svg width="26" height="26" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#185FA5"/><rect x="10" y="10" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22"/><rect x="46" y="10" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22"/><rect x="10" y="46" width="24" height="24" rx="5" fill="#fff" fillOpacity=".22"/><rect x="46" y="46" width="24" height="24" rx="5" fill="#fff"/><path d="M49.5 60l4 4 8-9" stroke="#185FA5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          <span style={{fontSize:'14px',fontWeight:'700',color:'#0D1B2A'}}>Sign<span style={{color:'#185FA5'}}>Code</span> <span style={{fontSize:'10px',color:'#9BA8B4',fontWeight:'400'}}>Pro</span></span>
        </a>
        <a href="/waitlist" style={{padding:'7px 16px',background:'#185FA5',color:'#fff',borderRadius:'7px',fontSize:'13px',fontWeight:'500',textDecoration:'none'}}>Join waitlist</a>
      </nav>

      <div style={{maxWidth:'780px',margin:'0 auto',padding:'48px 24px'}}>

        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',borderRadius:'20px',background:'#E6F1FB',color:'#185FA5',fontSize:'12px',fontWeight:'500',marginBottom:'16px'}}>
            <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#185FA5'}}></div>
            AI-powered · Live data
          </div>
          <h1 style={{fontSize:'28px',fontWeight:'700',color:'#0D1B2A',marginBottom:'10px'}}>Florida sign code lookup</h1>
          <p style={{fontSize:'14px',color:'#5A6B7A',lineHeight:'1.6'}}>Enter any city or county to get instant sign code requirements pulled from official sources.</p>
        </div>

        <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2E8F0',padding:'20px',marginBottom:'20px'}}>
          <div style={{display:'flex',gap:'10px'}}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="Type a city or county — e.g. Miami, Fort Lauderdale, Orlando..."
              style={{flex:1,padding:'11px 14px',border:'1px solid #E2E8F0',borderRadius:'8px',fontSize:'13px',color:'#0D1B2A',background:'#fff',outline:'none'}}
            />
            <button
              onClick={() => lookup()}
              disabled={status==='loading'}
              style={{padding:'11px 22px',background:status==='loading'?'#9BA8B4':'#185FA5',color:'#fff',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:status==='loading'?'not-allowed':'pointer',whiteSpace:'nowrap'}}
            >
              {status==='loading' ? 'Loading...' : 'Look up'}
            </button>
          </div>
          <div style={{marginTop:'12px',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:'11px',color:'#9BA8B4'}}>Quick:</span>
            {['Miami','Fort Lauderdale','Pompano Beach','Boca Raton','Orlando','Tampa'].map(c => (
              <button key={c} onClick={() => quickLookup(c)} style={{padding:'3px 10px',border:'1px solid #E2E8F0',borderRadius:'20px',fontSize:'11px',color:'#5A6B7A',background:'#fff',cursor:'pointer'}}>{c}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {status==='loading' && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2E8F0',padding:'32px',textAlign:'center'}}>
            <div style={{width:'20px',height:'20px',border:'2px solid #E2E8F0',borderTopColor:'#185FA5',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 14px'}}></div>
            <div style={{fontSize:'13px',color:'#5A6B7A'}}>{loadingMsg}</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Not found */}
        {status==='notfound' && (
          <div style={{background:'#FAEEDA',border:'1px solid #F5C4B3',borderRadius:'10px',padding:'16px 20px',fontSize:'13px',color:'#633806'}}>
            We don't have data for that jurisdiction yet. Try Miami, Fort Lauderdale, Pompano Beach, Boca Raton, Orlando, or Tampa. More coming soon — <a href="/waitlist" style={{color:'#185FA5'}}>join the waitlist</a>.
          </div>
        )}

        {/* Error */}
        {status==='error' && (
          <div style={{background:'#FCEBEB',border:'1px solid #F7C1C1',borderRadius:'10px',padding:'16px 20px',fontSize:'13px',color:'#791F1F'}}>
            Something went wrong. Please try again.
          </div>
        )}

        {/* Result */}
        {status==='found' && result && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2E8F0',overflow:'hidden'}}>

            <div style={{padding:'20px 24px',borderBottom:'1px solid #E2E8F0',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'18px',fontWeight:'700',color:'#0D1B2A',marginBottom:'3px'}}>{result.name}</div>
                <div style={{fontSize:'12px',color:'#9BA8B4'}}>
                  {result.source==='scraped' ? 'Scraped from official code' : 'Based on published sign code'} · Updated {new Date().toLocaleDateString()}
                </div>
              </div>
              <span style={{padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',background:strictColor[result.confidence]?.bg||'#FAEEDA',color:strictColor[result.confidence]?.text||'#633806'}}>
                {result.confidence==='high'?'Verified':'Medium confidence'}
              </span>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:'1px solid #E2E8F0'}}>
              <div style={{padding:'20px 24px',borderRight:'1px solid #E2E8F0'}}>
                <div style={{fontSize:'10px',fontWeight:'600',color:'#9BA8B4',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'14px'}}>Size limits</div>
                {[
                  ['Max pylon height', result.maxPylonHeight ? result.maxPylonHeight + ' ft' : 'Check with jurisdiction'],
                  ['Max monument height', result.maxMonumentHeight ? result.maxMonumentHeight + ' ft' : 'Check with jurisdiction'],
                  ['Max sign area', result.maxSignArea ? result.maxSignArea + ' sq ft' : 'Check with jurisdiction'],
                  ['Min setback from ROW', result.minSetback ? result.minSetback + ' ft' : 'Check with jurisdiction'],
                  ['EMC / digital signs', result.emcAllowed === true ? 'Allowed' : result.emcAllowed === false ? 'Not allowed' : 'Check with jurisdiction'],
                ].map(([l,v]) => (
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #F4F7FA',fontSize:'13px'}}>
                    <span style={{color:'#5A6B7A'}}>{l}</span>
                    <span style={{fontWeight:'500',color:l==='EMC / digital signs'?(result.emcAllowed===true?'#3B6D11':result.emcAllowed===false?'#791F1F':'#5A6B7A'):'#0D1B2A'}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{padding:'20px 24px'}}>
                <div style={{fontSize:'10px',fontWeight:'600',color:'#9BA8B4',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'14px'}}>Fees & timeline</div>
                {[
                  ['Permit fee', result.permitFee || 'Contact jurisdiction'],
                  ['Avg. turnaround', result.turnaround || 'Contact jurisdiction'],
                ].map(([l,v]) => (
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #F4F7FA',fontSize:'13px'}}>
                    <span style={{color:'#5A6B7A'}}>{l}</span>
                    <span style={{fontWeight:'500',color:'#0D1B2A',maxWidth:'180px',textAlign:'right'}}>{v}</span>
                  </div>
                ))}
                {result.emcNotes && (
                  <div style={{marginTop:'12px',padding:'10px',background:'#E6F1FB',borderRadius:'7px',fontSize:'12px',color:'#0C447C',lineHeight:'1.5'}}>
                    <strong>EMC requirements:</strong> {result.emcNotes}
                  </div>
                )}
              </div>
            </div>

            {result.requiredDocs && result.requiredDocs.length > 0 && (
              <div style={{padding:'20px 24px',borderBottom:'1px solid #E2E8F0'}}>
                <div style={{fontSize:'10px',fontWeight:'600',color:'#9BA8B4',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'14px'}}>Required documents</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                  {result.requiredDocs.map((d: string) => (
                    <div key={d} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'13px',color:'#0D1B2A'}}>
                      <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#185FA5',flexShrink:0,marginTop:'5px'}}></div>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.keyRestrictions && (
              <div style={{padding:'20px 24px',background:'#F4F7FA',borderBottom:'1px solid #E2E8F0'}}>
                <div style={{fontSize:'10px',fontWeight:'600',color:'#9BA8B4',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'8px'}}>Key restrictions</div>
                <div style={{fontSize:'13px',color:'#5A6B7A',lineHeight:'1.6'}}>{result.keyRestrictions}</div>
              </div>
            )}

            <div style={{padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:'11px',color:'#9BA8B4'}}>
                {result.confidence !== 'high' && '⚠ Always verify with the jurisdiction before submitting. '}
                Data powered by SignCode Pro AI.
              </div>
              <a href="/waitlist" style={{padding:'8px 18px',background:'#185FA5',color:'#fff',borderRadius:'7px',fontSize:'12px',fontWeight:'500',textDecoration:'none'}}>Get full access →</a>
            </div>
          </div>
        )}

        {status==='idle' && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2E8F0',padding:'20px 24px'}}>
            <div style={{fontSize:'12px',fontWeight:'600',color:'#0D1B2A',marginBottom:'14px'}}>Currently covered — Florida</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
              {['Miami-Dade County','Broward County','Palm Beach County','City of Fort Lauderdale','City of Pompano Beach','City of Boca Raton','City of Miami Beach','City of Orlando','City of Tampa','Hillsborough County'].map(j => (
                <div key={j} style={{padding:'8px 12px',background:'#F4F7FA',borderRadius:'7px',fontSize:'12px',color:'#5A6B7A'}}>{j}</div>
              ))}
            </div>
            <div style={{fontSize:'11px',color:'#9BA8B4',marginTop:'14px'}}>More jurisdictions added weekly. <a href="/waitlist" style={{color:'#185FA5'}}>Join the waitlist</a> to request yours.</div>
          </div>
        )}

      </div>
    </main>
  );
}