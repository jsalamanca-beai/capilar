import type { Metadata, Viewport } from "next";
import ThemeProvider from "@/lib/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capilex Madrid - Tu Trasplante Capilar",
  description:
    "Aplicacion de acompanamiento al paciente de trasplante capilar - Clinica Capilex Madrid",
  icons: {
    icon: "/logo-capilex.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
