import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen w-full">
        {children}
      </body>
    </html>
  );
}
