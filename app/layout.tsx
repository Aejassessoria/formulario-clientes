import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AJ Assessoria Contábil",
  description: "Formulário de abertura de empresa",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    title: "AJ Assessoria Contábil",
    description: "Formulário de abertura de empresa",
    url: "https://formulario-clientes-jet.vercel.app",
    siteName: "AJ Assessoria Contábil",
    images: [
      {
        url: "https://formulario-clientes-jet.vercel.app/logo-aj-transparente.png",
        width: 1200,
        height: 630,
        alt: "AJ Assessoria Contábil",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
