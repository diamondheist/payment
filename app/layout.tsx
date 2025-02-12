'use client';
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./globals.css";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body
      >
        <TonConnectUIProvider manifestUrl="https://moccasin-implicit-eel-888.mypinata.cloud/ipfs/bafkreifr7ahkcwgzxsylaa6ol5sdrcfei36zquqg4zkpzhfaj6ktnaadky">
        {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
