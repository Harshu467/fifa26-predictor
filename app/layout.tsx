import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Predictor',
  description:
    'Predict every FIFA World Cup 2026 match and watch standings and brackets update live.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
