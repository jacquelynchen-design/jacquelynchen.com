import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Dr Presence | Case study | Jacquelyn Chen',
 description: 'Designing a doctor-facing app for reviewing home measurements and supporting chronic-condition follow-ups in Singapore.',
};

export default function DrPresenceLayout({ children }: { children: React.ReactNode }) {
 return <><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600&display=swap" />{children}</>;
}
