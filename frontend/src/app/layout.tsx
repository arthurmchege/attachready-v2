import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Use Google Fonts to avoid local file dependency issues
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AttachReady AI",
  description: "Land your dream industrial attachment with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
