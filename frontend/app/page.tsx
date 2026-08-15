'use client';

import { useEffect, useState } from 'react';

type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export default function Home() {
  const [backend, setBackend] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Backend request failed');
        }

        return response.json();
      })
      .then((data: HealthResponse) => {
        setBackend(data);
      })
      .catch(() => {
        setError('Unable to connect to YatraSaathi backend.');
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            YATRASAATHI
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Accessible Journey Planner
          </h1>

          <p className="mt-3 text-slate-400">
            AI-powered accessible travel with real-time barrier intelligence.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              Backend status
            </span>

            <span
              className={
                backend
                  ? 'rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400'
                  : 'rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-400'
              }
            >
              {backend ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {backend && (
            <div className="mt-5 space-y-2 text-sm">
              <p>
                Service:{' '}
                <span className="text-slate-300">
                  {backend.service}
                </span>
              </p>

              <p>
                API version:{' '}
                <span className="text-slate-300">
                  {backend.version}
                </span>
              </p>

              <p>
                Status:{' '}
                <span className="text-green-400">
                  {backend.status}
                </span>
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}