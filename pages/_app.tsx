import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Caveat, Quicksand } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
          className={`${quicksand.variable} ${caveat.variable} min-h-dvh font-sans`}
        >
          <Component {...pageProps} />
        </div>
        <Toaster richColors position="bottom-left" />
      </ThemeProvider>
    </SessionProvider>
  );
}
