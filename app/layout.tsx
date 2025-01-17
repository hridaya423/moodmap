import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mood Map",
  description: "Visualize global emotions and trends with dynamic, sentiment heatmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">  
      <body>
        {children}
      </body>
    </html>
  );
}
