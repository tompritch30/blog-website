import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Planted() {
  return <p className={inter.className}>Body text</p>;
}
