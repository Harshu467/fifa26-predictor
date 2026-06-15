import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FIFA 2026 Predictor',
  description: 'Predict FIFA World Cup 2026 matches, view schedule, results, and bracket outcomes.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
