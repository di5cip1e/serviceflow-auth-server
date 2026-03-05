import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Station Command',
  description: 'Space station exploration and command simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
