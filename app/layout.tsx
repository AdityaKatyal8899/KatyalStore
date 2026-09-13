import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'KatyalStore - App Store',
  description: 'Discover amazing apps and experiences on KatyalStore',
  generator: 'v0.app',
  icons: {
    icon: '/appicon.png',
    apple: '/appicon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0F141E' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var val = localStorage.getItem('katyalstore_luminance');
                  if (val !== null) {
                    var p = Math.max(0, Math.min(100, parseInt(val, 10)));
                    var tiers = [
                      { p: 0, bg: [6,8,12], surface: [16,20,28], surfaceElevated: [24,30,42], textPrimary: [248,250,252], textSecondary: [148,163,184], border: [60,70,88], shadow: 'rgba(0,0,0,0.8)', gridAlpha: 0.05 },
                      { p: 25, bg: [15,20,30], surface: [26,34,48], surfaceElevated: [38,48,68], textPrimary: [241,245,249], textSecondary: [148,163,184], border: [75,88,112], shadow: 'rgba(0,0,0,0.8)', gridAlpha: 0.06 },
                      { p: 50, bg: [36,42,54], surface: [48,56,72], surfaceElevated: [64,74,95], textPrimary: [255,255,255], textSecondary: [203,213,225], border: [100,116,139], shadow: 'rgba(0,0,0,0.7)', gridAlpha: 0.08 },
                      { p: 75, bg: [233,226,213], surface: [246,241,230], surfaceElevated: [253,250,244], textPrimary: [20,20,20], textSecondary: [75,85,99], border: [30,30,30], shadow: '#1e1e1e', gridAlpha: 0.05 },
                      { p: 100, bg: [253,251,247], surface: [255,255,255], surfaceElevated: [255,255,255], textPrimary: [0,0,0], textSecondary: [55,65,81], border: [0,0,0], shadow: '#000000', gridAlpha: 0.05 }
                    ];
                    var l = tiers[0], u = tiers[4];
                    for (var i = 0; i < tiers.length - 1; i++) {
                      if (p >= tiers[i].p && p <= tiers[i+1].p) { l = tiers[i]; u = tiers[i+1]; break; }
                    }
                    var r = u.p - l.p;
                    var t = r === 0 ? 0 : (p - l.p) / r;
                    function lerp(a, b) { return Math.round(a + (b - a) * t); }
                    function rgb(c1, c2) { return 'rgb(' + lerp(c1[0], c2[0]) + ',' + lerp(c1[1], c2[1]) + ',' + lerp(c1[2], c2[2]) + ')'; }
                    var root = document.documentElement;
                    root.style.setProperty('--theme-bg', rgb(l.bg, u.bg));
                    root.style.setProperty('--theme-surface', rgb(l.surface, u.surface));
                    root.style.setProperty('--theme-surface-elevated', rgb(l.surfaceElevated, u.surfaceElevated));
                    root.style.setProperty('--theme-text-primary', rgb(l.textPrimary, u.textPrimary));
                    root.style.setProperty('--theme-text-secondary', rgb(l.textSecondary, u.textSecondary));
                    root.style.setProperty('--theme-border', rgb(l.border, u.border));
                    root.style.setProperty('--theme-shadow-color', p < 65 ? 'rgba(0,0,0,0.8)' : '#000000');
                    var gridAlpha = l.gridAlpha + (u.gridAlpha - l.gridAlpha) * t;
                    root.style.setProperty('--theme-grid-color', (p < 65 ? 'rgba(255,255,255,' : 'rgba(0,0,0,') + gridAlpha.toFixed(3) + ')');
                    if (p < 65) { root.classList.add('dark'); }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
