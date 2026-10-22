import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Caveat, Quicksand } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/navbar";
import "../styles/globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div
          className={`${quicksand.variable} ${caveat.variable} flex min-h-dvh flex-col font-sans`}
        >
          <Navbar />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
        </div>
        <Toaster richColors position="bottom-left" />
      </ThemeProvider>
    </SessionProvider>
  );
}
