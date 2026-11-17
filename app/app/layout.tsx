import type { Metadata, Viewport } from "next";
import AppShell from "./_components/AppShell";

export const metadata: Metadata = {
  title: "App Kanot",
  description: "Horarios, formaciones, Kodigo Klub, Kanot Kamp, competición y podcast de Kanot.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kanot",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/app-icons/apple-touch-icon.png",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b2b6b",
  viewportFit: "cover",
};

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <AppShell>{children}</AppShell>;
}
