import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";
import LotteryEntrance from "../components/LotteryEntrance";
import ManualHeader from "../components/ManualHeader";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className="w-full h-[100vh] flex flex-col items-center justify-start ">
      <Head>
        <title>Raffle</title>
        <meta name="description" content="Lottery " />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <ManualHeader /> */}
      <Header />
      <LotteryEntrance />
    </div>
  );
}
