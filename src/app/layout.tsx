import type { Metadata } from 'next';
import './globals.scss';
// PrimeReact, Bootstrap & Toast CSS — loaded globally
import 'primereact/resources/themes/lara-light-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '@/lib/providers';
import AppShell from '@/components/app-shell/AppShell';

// Root layout — equivalent to Angular AppModule + AppComponent
export const metadata: Metadata = {
  title: 'Open Demat Account - Free Demat & Trading Account Opening Online | SBI Securities',
  description:
    'Open Demat Account - Zero Cost Demat & Trading Account opening online at SBI Securities; ₹0* Brokerage till ₹75 lakh Trades, Flat Brokerage ₹20/order* and Zero AMC for 1st Year & more',
  keywords: 'demat account, trading account, SBI Securities, open demat account online',
  robots: 'index, follow',
  openGraph: {
    title: 'Open Demat Account | SBI Securities',
    description: 'Open a free Demat & Trading Account in minutes with SBI Securities.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
