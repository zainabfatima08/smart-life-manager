import './globals.css';
export const metadata = { title: 'Life OS', description: 'Mission control for your life.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark"><body>{children}</body></html>; }
