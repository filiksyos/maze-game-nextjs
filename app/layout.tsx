import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/components/SocketProvider";

export const metadata: Metadata = {
  title: "Usogui Maze Game",
  description: "Multiplayer maze game inspired by Usogui manga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}