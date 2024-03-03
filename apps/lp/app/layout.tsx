import './css/style.css';

import { Metadata } from 'next';
import {
  Bricolage_Grotesque,
  Caveat,
  Inter,
  Inter_Tight,
} from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  display: 'swap',
});

const inter_tight = Inter_Tight({
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_PAGE_URL!),
  title: 'Chaindesk - ChatGPT AI Chat Bot for your business',
  description:
    'Chaindesk brings a no-code platform to create custom AI chatbots trained on your data. Our solution makes customer support easy and simplifies team workflows.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    images: ['/api/og'],
  },
  icons: {
    icon: '/images/logo.png',
  },
  keywords: [
    'AI Agent',
    'AI Chatbot',
    'Custom ChatGPT',
    'AI Customer Support Chatbot',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        id="chaindesk-agent"
        type="module"
        dangerouslySetInnerHTML={{
          __html: `import Chatbox from 'https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest/dist/chatbox/index.js';
          
          Chatbox.initBubble({
            agentId: 'clq6g5cuv000wpv8iddswwvnd',
          });`,
        }}
      />
      <body
        className={`${inter.variable} ${inter_tight.variable} ${bricolage.variable} ${caveat.variable} font-inter antialiased bg-white text-zinc-900 tracking-tight relative`}
      >
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
