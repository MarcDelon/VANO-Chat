import type { Metadata } from 'next';
import '../styles/index.css';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: 'NOVA Social - Le Réseau Social Moderne',
  description: 'Écosystème Social Modulaire & Interactif',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2' },
      { url: '/NOVA.png?v=2', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/NOVA.png?v=2',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" href="/NOVA.png?v=2" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/NOVA.png?v=2" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
