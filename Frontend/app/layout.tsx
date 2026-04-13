import type { Metadata } from 'next';
import '../styles/index.css';

export const metadata: Metadata = {
  title: 'NOVA Frontend',
  description: 'Projet migré vers Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
