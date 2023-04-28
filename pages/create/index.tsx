import Head from "next/head";
import Link from "next/link";

export default function Positions() {
  return (
    <>
      <Head>
        <title>Numoen</title>
      </Head>
      <div className="top-card">
        <h1>Create new market</h1>
        <p className="p3">
          Numoen allows for the permissionless creation of markets. Read{" "}
          <span>
            <Link href="https://docs.numoen.com" className="underline">
              here
            </Link>
          </span>{" "}
          to learn more about the structure of a Numoen market.
        </p>
      </div>
    </>
  );
}
