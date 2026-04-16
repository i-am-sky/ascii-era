import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascii Era",
  description: "Live ASCII Art Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
