'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Clock, ArrowDown, ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NEEDS = [
  { id: 'step-free', label: '♿ Step-free' },
  { id: 'elevator',  label: '🛗 Elevator'  },
  { id: 'audio',     label: '🔊 Audio'     },
  { id: 'contrast',  label: '👁 High contrast' },
  { id: 'simple',    label: '🧠 Simple'    },
];
const SUGGESTIONS = {
  recent:     ['Puri Beach', 'Bhubaneswar Airport'],
  popular:    ['Bhubaneswar Railway Station', 'Lingaraj Temple'],
  accessible: ['Barabati Stadium', 'Utkal University'],
};

export default function JourneyPlanner() {
  const router = useRouter();
  const [from, setFrom] = useState('Current location');
  const [to, setTo] = useState('');
  const [needs, setNeeds] = useState(['step-free']);
  const [toFocused, setToFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const when = new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setToFocused(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const toggleNeed = (id: string) => setNeeds(p => p.includes(id) ? p.filter(n => n !== id) : [...p, id]);
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border)' };
  const dotStyle = (primary: boolean): React.CSSProperties => ({ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: primary ? 'var(--teal-50)' : 'var(--sand-50)', border: `2px solid ${primary ? 'var(--teal-400)' : 'var(--sand-300)'}` });
  const labelStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' };
  const inputStyle: React.CSSProperties = { width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: 'var(--charcoal)' };

  return (
    <section className="animate-fade-up" aria-label="Journey planner" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--teal-600)', marginBottom: '20px' }}>Plan your journey</div>

      {/* FROM */}
      <div style={rowStyle}>
        <div style={dotStyle(true)}><MapPin style={{ width: 16, height: 16, color: 'var(--teal-600)' }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={labelStyle}>From</div>
          <input type="text" value={from} onChange={e => setFrom(e.target.value)} aria-label="From" style={inputStyle} />
        </div>
      </div>

      {/* Connector */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0 6px 9px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
          <ArrowDown style={{ width: 14, height: 14, color: 'var(--slate-400)' }} />
        </div>
      </div>

      {/* TO */}
      <div style={{ ...rowStyle, position: 'relative' }} ref={dropdownRef}>
        <div style={dotStyle(false)}><Search style={{ width: 16, height: 16, color: 'var(--slate-500)' }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={labelStyle}>To</div>
          <input type="text" value={to} onChange={e => setTo(e.target.value)} onFocus={() => setToFocused(true)}
            placeholder="Where would you like to go?" aria-label="Destination" aria-expanded={toFocused}
            style={{ ...inputStyle, color: to ? 'var(--charcoal)' : undefined }} />
        </div>
        {toFocused && (
          <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden' }}>
            {([['recent', 'Recent'], ['popular', 'Popular'], ['accessible', 'Accessible places']] as const).map(([key, label]) => (
              <div key={key}>
                <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                {SUGGESTIONS[key].map(place => (
                  <button key={place} role="option" onClick={() => { setTo(place); setToFocused(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--charcoal)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-50)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}>
                    <MapPin style={{ width: 14, height: 14, color: 'var(--teal-500)', flexShrink: 0 }} />{place}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHEN */}
      <div style={rowStyle}>
        <div style={dotStyle(false)}><Clock style={{ width: 16, height: 16, color: 'var(--slate-500)' }} /></div>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>When</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--charcoal)' }}>{when}</div>
        </div>
        <ChevronDown style={{ width: 16, height: 16, color: 'var(--slate-400)' }} />
      </div>

      {/* YOUR NEEDS */}
      <div style={{ padding: '16px 0 4px' }}>
        <div style={labelStyle}>Your needs</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {NEEDS.map(opt => {
            const sel = needs.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggleNeed(opt.id)} aria-pressed={sel}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: sel ? 600 : 400, minHeight: '44px', border: `1px solid ${sel ? 'var(--teal-400)' : 'var(--border)'}`, background: sel ? 'var(--teal-50)' : 'var(--card-bg)', color: sel ? 'var(--teal-700)' : 'var(--slate-500)', transition: 'all 0.15s' }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => router.push('/plan-route')} aria-label="Plan my journey"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '20px', height: '50px', borderRadius: '12px', background: 'var(--teal-600)', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(13,148,136,0.35)', transition: 'all 0.2s ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-700)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--teal-600)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
        Plan my journey <ArrowRight style={{ width: 18, height: 18 }} />
      </button>
    </section>
  );
}
