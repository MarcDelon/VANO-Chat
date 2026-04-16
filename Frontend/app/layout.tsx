import type { Metadata } from 'next';
import '../styles/index.css';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: 'VANO-CHAT',
  description: 'Écosystème Social Modulaire',
  icons: {
    icon: '/NOVA.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
