import "./styles/globals.css";
import { Urbanist } from "next/font/google";
import ThemeColorMeta from "@/components/ThemeColorMeta/ThemeColorMeta";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={urbanist.className}>
      <head>
        <meta name="theme-color" content="#000"/>
        <title>
          TradeBox 
        </title>
       </head>
      <body>
        <ThemeColorMeta />
        {children}
      </body>
    </html>
  );
}
