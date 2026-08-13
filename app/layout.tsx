import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://frameingoa.com"),
  title: "FrameInGoa — HH Goa 2026 Digital Identity Platform",
  description: "Turn any photo into your HH Goa 2026 builder identity. Premium, high-res frame generator inspired by Goan festival culture and hacker community spirit.",
  keywords: ["HH Goa 2026", "FrameInGoa", "Hacker House Goa", "Builder Identity", "Goa Hackathon", "Photo Frame Generator"],
  openGraph: {
    title: "FrameInGoa — HH Goa 2026 Builder Frame Generator",
    description: "Generate your official HH Goa 2026 builder identity frame & team crew frame in seconds.",
    url: "https://frameingoa.com",
    siteName: "FrameInGoa",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FrameInGoa HH Goa 2026",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-goa-pattern min-h-screen text-cream antialiased selection:bg-gold selection:text-goa-darkest">
        {children}
      </body>
    </html>
  );
}