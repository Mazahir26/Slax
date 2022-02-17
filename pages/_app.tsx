import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/layout/navbar";
import { extendTheme } from "@chakra-ui/react";
import Head from "next/head";
const theme = extendTheme({
  colors: {
    brand: {
      50: "#",
      100: "#9fccfa",
      200: "#8ec2f9",
      300: "#7eb8f8",
      400: "#6daff7",
      500: "#4c9bf5",
      600: "#3b91f4",
      700: "#2a88f3",
      800: "#1a7ef2",
      900: "#0974f1",
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>Home | Slax </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ChakraProvider theme={theme}>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default MyApp;
