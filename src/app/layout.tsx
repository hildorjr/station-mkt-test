import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/providers/supabase-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Station MKT - AI Marketing Concept Generator',
    template: '%s | Station MKT'
  },
  description: 'Generate AI-powered marketing concepts based on detailed audience demographics. Create targeted campaigns with OpenAI, manage audiences, and remix concepts for maximum impact.',
  keywords: [
    'marketing',
    'AI marketing',
    'marketing concepts',
    'audience targeting',
    'campaign generation',
    'OpenAI',
    'marketing automation',
    'demographic targeting',
    'marketing strategy',
    'concept generation'
  ],
  authors: [{ name: 'Station MKT' }],
  creator: 'Station MKT',
  publisher: 'Station MKT',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://station.hildor.dev',
    siteName: 'Station MKT',
    title: 'Station MKT - AI Marketing Concept Generator',
    description: 'Generate AI-powered marketing concepts based on detailed audience demographics. Create targeted campaigns with OpenAI, manage audiences, and remix concepts for maximum impact.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Station MKT - AI Marketing Concept Generator',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stationmkt',
    creator: '@stationmkt',
    title: 'Station MKT - AI Marketing Concept Generator',
    description: 'Generate AI-powered marketing concepts based on detailed audience demographics. Create targeted campaigns with OpenAI.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://station.hildor.dev',
  },
  category: 'technology',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://station.hildor.dev'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
