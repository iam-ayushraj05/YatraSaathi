'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TrainsSection from '@/components/dashboard/TrainsSection';

export default function TrainsPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <TrainsSection />
      </main>

      <Footer />
    </div>
  );
}
