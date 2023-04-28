import Head from "next/head";
import Link from "next/link";

import Button from "@/components/core/button";

export default function Earn() {
  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card">
        <h1>Earn on your assets</h1>
        <div
          className="grid gap-2
        "
        >
          <p className="p3">
            Numoen has created several strategies using our underlying PMMP. All
            strategies maintain maximum trustlessness and decentralization.
          </p>
          <Link href={"/create"}>
            <Button variant="primary" className="rounded-none">
              Create new market
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
