'use client';
import React, { useEffect, useState } from 'react';

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function WelcomeSection() {
  const [greeting, setGreeting] = useState('');
  const [time, setTime] = useState('');
  useEffect(() => {
    setGreeting(getGreeting());
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="animate-fade-up" aria-label="Welcome" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--charcoal)', margin: 0, lineHeight: 1.25 }}>
        {greeting}, Sudipto <span role="img" aria-label="waving hand">👋</span>
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--slate-500)', margin: 0 }}>Where would you like to go today?</p>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '4px', fontSize: '12px', color: 'var(--teal-700)', fontWeight: 500 }}>
        <span aria-hidden="true" className="animate-pulse-soft" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--green-accent)', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
        Live journey intelligence active
        {time && <span style={{ color: 'var(--slate-400)', marginLeft: '4px' }}>· {time}</span>}
      </div>
    </section>
  );
}
