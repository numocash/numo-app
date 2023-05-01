import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["greek"],
});

export default function Footer() {
  return (
    <div className={`${inter.className} my-20 flex w-full justify-center`}>
      <p className="text-center p5">
        Copyright © {new Date().getFullYear()} Numoen. All rights reserved.
      </p>
    </div>
  );
}
