import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import ScrollToTop from '../components/ScrollToTop';
import AuthModal from '../components/auth/AuthModal';
import LogoutModal from '../components/auth/LogoutModal';
import SessionExpiredModal from '../components/auth/SessionExpiredModal';
import VoiceUsageToast from '../components/auth/VoiceUsageToast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'yatrasaathi — Your Personal Accessibility Companion',
  description: 'Plan accessible journeys with confidence. Real-time barrier intelligence, step-free routes, and live assistance mapping.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased font-['Plus_Jakarta_Sans',sans-serif]">
        <AppProvider>
          <AuthProvider>
            <ScrollToTop />
            {children}
            <AuthModal />
            <LogoutModal />
            <SessionExpiredModal />
            <VoiceUsageToast />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
