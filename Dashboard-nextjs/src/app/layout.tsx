import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppKitProvider from "@/contexts/AppKitProvider";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peridot - DeFi Vault Dashboard. Get your Paypal USD (Peridot) Tokens",
  icons: {
    icon: [
      { url: '/peridot.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/peridot.ico',
  },
};

// Theme initialization script - safer than dangerouslySetInnerHTML
const themeScript = `
(function() {
  try {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || 'dark';
    
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  } catch (e) {
    // Fallback to dark mode if localStorage is not available
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" className="dark" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <Script
          id="theme-script"
          strategy="beforeInteractive"
        >
          {themeScript}
        </Script>
        <AppKitProvider cookies={cookies}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AppKitProvider>
        <StagewiseToolbar
          config={{
            plugins: [ReactPlugin],
          }}
        />
      </body>
    </html>
  );
}
