import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZEALTH - Doctor Guided Living',
  description: 'Understand Your Lifestyle. Build Better Habits. Take a free lifestyle assessment and get a personalized snapshot.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
