import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeMeet AI",
  description: "Real-time technical interview platform with live code sync, video, and AI feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col font-sans">{children}</body>
    </html>
  );
}