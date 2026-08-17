'use client';
import React from 'react';
import Link from 'next/link';
import { Map, Briefcase, Flag, LifeBuoy } from 'lucide-react';

const ACTIONS = [
  { label: 'Plan Journey',   icon: Map,      href: '/plan-route',  bg: 'var(--teal-600)',   color: '#fff',              hoverBg: 'var(--teal-700)' },
  { label: 'My Trips',       icon: Briefcase,href: '/itineraries', bg: 'var(--card-bg)',    color: 'var(--charcoal)',   hoverBg: 'var(--teal-50)',  border: '1px solid var(--border)' },
  { label: 'Report Barrier', icon: Flag,     href: '/reports',     bg: 'var(--amber-light)',color: '#92400e',           hoverBg: '#fde68a',         border: '1px solid #fcd34d' },
  { label: 'Get Assistance', icon: LifeBuoy, href: '/copilot',     bg: 'var(--card-bg)',    color: 'var(--charcoal)',   hoverBg: 'var(--teal-50)',  border: '1px solid var(--border)' },
];

export default function QuickActions() {
  return (
    <section aria-label="Quick actions" className="animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '10px' }}>
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 18px', borderRadius: '12px', background: a.bg, color: a.color, border: a.border || 'none', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'all 0.18s ease', minHeight: '56px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = a.hoverBg; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = a.bg; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} aria-hidden="true" />{a.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
