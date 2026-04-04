import "./globals.css";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";

import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Mosam.ai - AI-Powered Weather Intelligence",
  description: "Next-level weather predictions using advanced machine learning for Pakistani cities.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${plusJakartaSans.variable} font-body bg-background text-foreground antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
