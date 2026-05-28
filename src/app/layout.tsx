import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CrewRoute OS",
  description: "AI-native field tool for CJS Landscape Solutions",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CrewRoute OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0C14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0A0C14" }}>
        {children}
      </body>
    </html>
  );
}
