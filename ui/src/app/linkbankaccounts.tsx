"use client";
import { twMerge } from "tailwind-merge";
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from "./page.module.css";
import Link from "next/link";
import { useEffect } from "react";
import { api } from "~/trpc/server";
import { ConnectComponent } from './finicityPopup';
// import { trpc } from "

export default function LinkBankAccounts() {
  // useEffect(() => {
  //   new ConnectComponent();
  // }, []);
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // console.log({ hello });
  // const test = await api.post.getToken.
  // console.log(test)

  function openPopup() {
    new ConnectComponent();
  }

  return (
    <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
      <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
        <div className="z-10 my-auto pb-10">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white">
            Link your bank accounts
          </h1>
          <p className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white">
            We&rsquo;ll help you track your spending and savings.
          </p>
        </div>
        <div className="z-10 text-center mt-auto pb-20">
          <button onClick={openPopup}>
            <span className="rounded-full bg-white text-secondary hover:bg-secondary hover:text-white transition-all duration-200 px-8 py-3">
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Link Your Accounts
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
