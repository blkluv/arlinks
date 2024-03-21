import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {Abril_Fatface, Inter, Overpass} from "next/font/google";
import Head from "next/head";

const overpass = Overpass({ subsets: ["latin"], variable: '--font-overpass'  });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter'  });
const cursive = Abril_Fatface({ subsets: ["latin"], weight: "400", variable: '--font-cursive'  })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/*<title>ArLinks</title>*/}
        {/*<meta*/}
        {/*  name="description"*/}
        {/*  content="ArLinks provides a new Web3-friendly Link-in-Bio solution that is decentralized, permanent, and stored on-chain."*/}
        {/*/>*/}
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
      </Head>
      <div
        className={`w-full h-full ${inter.variable} ${overpass.variable} ${cursive.variable}`}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
}
