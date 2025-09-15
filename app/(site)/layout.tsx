import type { Metadata } from "next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <header>
      header
    </header>

    <main>
      {children}
    </main>

    <footer>
      footer
    </footer>
    </>
  );
}
