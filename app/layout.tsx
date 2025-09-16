import "./styles/globals.css";
import { Urbanist } from "next/font/google";

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
        <title>
          TradeBox 
        </title>
       </head>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
