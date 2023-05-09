import Background from "./background";
import Footer from "./footer";
import Header from "./header";
import * as Sentry from "@sentry/nextjs";
import va from "@vercel/analytics";
import { Inter } from "next/font/google";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAccount } from "wagmi";

const inter = Inter({
  subsets: ["greek"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      Sentry.setUser({ id: address });
      va.track(address as string);
    } else {
      Sentry.setUser(null);
    }
  }, [address]);

  return (
    <>
      <Background />
      <Header />
      <main
        className={`${inter.className} flex min-h-screen flex-col items-center px-4 pt-10 sm:px-10`}
      >
        {children}
      </main>
      <Toaster
        toastOptions={{
          style: {
            width: "310px",
          },
        }}
      />
      <Footer />
    </>
  );
}
