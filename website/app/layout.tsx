/* App Router shared layout: this font stylesheet is global to every route. */
/* eslint-disable next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';
import { PortfolioShell } from '@/components/portfolio-shell';
export const metadata: Metadata = {
 title: 'Jacquelyn Chen — Product Designer in Paris',
 description: 'Turning complexity into clarity. Explore Jacquelyn Chen’s work in product design, visual design, and thoughtful user experiences.',
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="en"><head><link rel="icon" type="image/svg+xml" href="/favicon-jc.svg" /></head><body><PortfolioShell>{children}</PortfolioShell></body></html>;
}
