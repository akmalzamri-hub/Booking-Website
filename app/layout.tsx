import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Resource Booking System — Sistem Tempahan Ruang & Peralatan",
  description:
    "Sistem Tempahan Ruang & Peralatan Kampus untuk mengurus tempahan bilik perbincangan, makmal komputer, serta peralatan studio dan sukan.",
  openGraph: {
    title: "Resource Booking System — Sistem Tempahan Ruang & Peralatan",
    description:
      "Sistem Tempahan Ruang & Peralatan Kampus untuk mengurus tempahan bilik perbincangan, makmal komputer, serta peralatan studio dan sukan.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resource Booking System — Sistem Tempahan Ruang & Peralatan",
    description:
      "Sistem Tempahan Ruang & Peralatan Kampus untuk mengurus tempahan bilik perbincangan, makmal komputer, serta peralatan studio dan sukan.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${outfit.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900"
      >
        {children}
      </body>
    </html>
  );
}
