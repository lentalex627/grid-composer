import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { MarketplaceProvider } from "@/components/providers/marketplace";

export const metadata: Metadata = {
  title: "Grid Composer - Sitecore Table Builder",
  description: "Interactive table builder custom field integration for SitecoreAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <MarketplaceProvider>{children}</MarketplaceProvider>
      </body>
    </html>
  );
}
