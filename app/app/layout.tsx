import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import AppLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "2GO DATA - Buy Data, Airtime & Pay Bills",
  description:
    "Fast, reliable data, airtime, cable TV, and electricity payments. Best prices on MTN, Glo, Airtel, and 9Mobile.",
  themeColor: "#f5f5f7",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512x512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "2GO DATA",
    description: "Your one-stop platform for mobile recharges and utility bills",
    images: ["/og-image.png"],
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppLayoutClient>{children}</AppLayoutClient>
    </Providers>
  );
}
