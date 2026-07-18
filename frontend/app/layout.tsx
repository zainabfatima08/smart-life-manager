import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: 'Life OS - Mission Control for Your Life',
  description: 'Build a calmer, more intentional life with habit tracking, goal management, and personal analytics.',
  keywords: 'productivity, habits, goals, wellness, personal growth',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

