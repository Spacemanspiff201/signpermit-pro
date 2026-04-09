'use client';
import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{position: number, referralCode: string} | null>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    company: '', role: '', volume: '', markets: ''
  });

  const update = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  async function submit() {
    if (!form.firstName || !form.lastName || !form.email || !form.company || !form.role) {
      setError('Please fill in all required fields.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      setResult(data);
      setStep('confirm');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'confirm' && result) return (
    <main style={{minHeight:'100vh',background:'#F4F7FA',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #E2E8F0',padding:'48px 40px',maxWidth:'480px',width:'100%',textAlign:'center'}}>
        <div style={{width:'56px',height:'56px',borderRadius:'14px',background:'#EAF3DE',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#3B6D11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 14l6 6 12-12"/></svg>
        </div>
        <h2 style={{fontSize:'22px',fontWeight:'700',color:'#0D1B2A',marginBottom:'8px'}}>You're on the list, {form.firstName}!</h2>
        <p style={{fontSize:'14px',color:'#5A6B7A',lineHeight:'1.7',marginBottom:'20px'}}>Confirmation email sent to <strong>{form.email}</strong>. Check your inbox.</p>
        <div style={{background:'#0D1B2A',borderRadius:'12px',padding:'24px',marginBottom:'24px'}}>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',margin:'0 0 6px'}}>Your waitlist position</p>
          <p style={{fontSize:'48px',fontWeight:'700',color:'#85B7EB',margin:'0',lineHeight:'1'}}>#{result.position}</p>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.3)',margin:'6px 0 0'}}>out of 100 Florida beta spots</p>
        </div>
        <p style={{fontSize:'13px',color:'#5A6B7A',lineHeight:'1.6',marginBottom:'20px'}}>Share your referral link to move up — each sign company you refer moves you up 5 spots.</p>
        <div style={{background:'#F4F7FA',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'#185FA5',wordBreak:'break-all',marginBottom:'20px'}}>
          signpermit-pro.vercel.app?ref={result.referralCode}
        </div>
        <button onClick={() => {navigator.clipboard.writeText(`https://signpermit-pro.vercel.app?ref=${result.referralCode}`)}} style={{width:'100%',padding:'11px',background:'#185FA5',color:'#fff',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
          Copy referral link
        </button>
      </div>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',fontFamily:'Arial,sans-serif',display:'grid',gridTemplateColumns:'1fr 1fr'}}>
      <div style={{background:'#0D1B2A',padding:'56px 48px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'7px',padding:'5px 12px',borderRadius:'20px',background:'rgba(133,183,235,0.12)',color:'#85B7EB',fontSize:'12px',fontWeight:'500',marginBottom:'24px',border:'1px solid rgba(133,183,235,0.2)',width:'fit-content'}}>
          <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#85B7EB'}}></div>
          Early access — Florida launch
        </div>
        <h1 style={{fontSize:'32px',fontWeight:'700',color:'#fff',lineHeight:'1.2',marginBottom:'16px'}}>Be first in line<br/>when we <span style={{color:'#85B7EB'}}>launch</span></h1>
        <p style={{fontSize:'14px',color:'rgba(255,255,255,0.5)',lineHeight:'1.7',marginBottom:'36px',maxWidth:'380px'}}>SignPermit Pro is opening to a limited group of Florida sign companies first. Join the waitlist to get early access and founding member pricing.</p>
        {[
          {title:'Founding member pricing', desc:'Lock in 30% off Professional forever.'},
          {title:'Priority access', desc:'Skip the queue — get in before public launch.'},
          {title:'Shape the product', desc:'Weekly feedback sessions with the founders.'},
        ].map(b => (
          <div key={b.title} style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'rgba(24,95,165,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:'0'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#85B7EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 4 8-8"/></svg>
            </div>
            <div>
              <div style={{fontSize:'13px',fontWeight:'500',color:'#fff',marginBottom:'2px'}}>{b.title}</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{b.desc}</div>
            </div>
          </div>
        ))}
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
          <div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>Florida beta spots remaining</div>
            <div style={{height:'3px',background:'rgba(255,255,255,0.1)',borderRadius:'2px',marginTop:'8px',overflow:'hidden'}}>
              <div style={{width:'68%',height:'100%',background:'#85B7EB',borderRadius:'2px'}}></div>
            </div>
          </div>
          <div style={{fontSize:'13px',fontWeight:'500',color:'#85B7EB',marginLeft:'16px'}}>34 of 100</div>
        </div>
      </div>

      <div style={{background:'#F4F7FA',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px'}}>
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #E2E8F0',padding:'36px',width:'100%',maxWidth:'420px'}}>
          <h2 style={{fontSize:'20px',fontWeight:'700',color:'#0D1B2A',marginBottom:'6px'}}>Join the waitlist</h2>
          <p style={{fontSize:'13px',color:'#5A6B7A',marginBottom:'24px'}}>Takes 60 seconds. No credit card needed.</p>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
            {[['firstName','First name','Marcus'],['lastName','Last name','Davis']].map(([k,l,p]) => (
              <div key={k}>
                <label style={{fontSize:'12px',fontWeight:'500',color:'#5A6B7A',display:'block',marginBottom:'4px'}}>{l} *</label>
                <input value={form[k as keyof typeof form]} onChange={e => update(k, e.target.value)} placeholder={p} style={{width:'100%',padding:'9px 12px',border:'1px solid #E2E8F0',borderRadius:'7px',fontSize:'13px',color:'#0D1B2A',background:'#fff',boxSizing:'border-box'}}/>
              </div>
            ))}
          </div>

          {[
            ['email','Work email','marcus@southfloridasign.com','email'],
            ['company','Company name','South Florida Sign Co.','text'],
          ].map(([k,l,p,t]) => (
            <div key={k} style={{marginBottom:'12px'}}>
              <label style={{fontSize:'12px',fontWeight:'500',color:'#5A6B7A',display:'block',marginBottom:'4px'}}>{l} *</label>
              <input type={t} value={form[k as keyof typeof form]} onChange={e => update(k, e.target.value)} placeholder={p} style={{width:'100%',padding:'9px 12px',border:'1px solid #E2E8F0',borderRadius:'7px',fontSize:'13px',color:'#0D1B2A',background:'#fff',boxSizing:'border-box'}}/>
            </div>
          ))}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
            <div>
              <label style={{fontSize:'12px',fontWeight:'500',color:'#5A6B7A',display:'block',marginBottom:'4px'}}>Your role *</label>
              <select value={form.role} onChange={e => update('role', e.target.value)} style={{width:'100%',padding:'9px 12px',border:'1px solid #E2E8F0',borderRadius:'7px',fontSize:'13px',color:'#0D1B2A',background:'#fff',boxSizing:'border-box'}}>
                <option value="">Select...</option>
                <option>Owner / founder</option>
                <option>Operations manager</option>
                <option>Permit coordinator</option>
                <option>Project manager</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:'12px',fontWeight:'500',color:'#5A6B7A',display:'block',marginBottom:'4px'}}>Permits per month</label>
              <select value={form.volume} onChange={e => update('volume', e.target.value)} style={{width:'100%',padding:'9px 12px',border:'1px solid #E2E8F0',borderRadius:'7px',fontSize:'13px',color:'#0D1B2A',background:'#fff',boxSizing:'border-box'}}>
                <option value="">Select...</option>
                <option>1–5</option>
                <option>6–15</option>
                <option>16–40</option>
                <option>40+</option>
              </select>
            </div>
          </div>

          <div style={{marginBottom:'16px'}}>
            <label style={{fontSize:'12px',fontWeight:'500',color:'#5A6B7A',display:'block',marginBottom:'4px'}}>Primary markets</label>
            <input value={form.markets} onChange={e => update('markets', e.target.value)} placeholder="e.g. Miami-Dade, Broward, Palm Beach" style={{width:'100%',padding:'9px 12px',border:'1px solid #E2E8F0',borderRadius:'7px',fontSize:'13px',color:'#0D1B2A',background:'#fff',boxSizing:'border-box'}}/>
            <div style={{fontSize:'11px',color:'#9BA8B4',marginTop:'4px'}}>Helps us prioritize which jurisdictions to verify first</div>
          </div>

          {error && <div style={{background:'#FCEBEB',color:'#791F1F',padding:'10px 12px',borderRadius:'7px',fontSize:'12px',marginBottom:'12px'}}>{error}</div>}

          <button onClick={submit} disabled={loading} style={{width:'100%',padding:'12px',background: loading ? '#9BA8B4' : '#185FA5',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:'500',cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Saving your spot...' : 'Request early access'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'16px',paddingTop:'16px',borderTop:'1px solid #E2E8F0'}}>
            <div style={{display:'flex'}}>
              {['#185FA5','#3B6D11','#854F0B','#534AB7'].map((c,i) => (
                <div key={i} style={{width:'26px',height:'26px',borderRadius:'50%',background:c,border:'2px solid #fff',marginLeft: i===0?'0':'-8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',color:'#fff'}}>
                  {['MR','SD','JT','LP'][i]}
                </div>
              ))}
            </div>
            <div style={{fontSize:'12px',color:'#5A6B7A'}}><strong style={{color:'#0D1B2A'}}>66 sign companies</strong> already on the waitlist</div>
          </div>
          <div style={{fontSize:'11px',color:'#9BA8B4',textAlign:'center',marginTop:'12px'}}>We'll never share your info.</div>
        </div>
      </div>
    </main>
  );
}