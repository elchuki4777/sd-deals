import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SD Deals | Great Products. Better Deals. | San Diego',
  description: 'Shop verified phones, gaming PCs, computer hardware, electronics and custom PC building & repair services in San Diego.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-US"><body>{children}</body></html>;
}
