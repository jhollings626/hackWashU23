import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";
import { api } from "~/trpc/server";
import Image from "next/image";

export default async function FinancialAdvice() {
  const financialAdvice: string[] = await api.post.getFinancialAdvice.query();
  console.log({ financialAdvice });

  return (<>
    <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
     <div className="z-10 mt-8 w-full p-6">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white">
                Financial Advice
              </h1>
       <p className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white leading-tight">
          After analyzing your spending and saving transactions, Brock has come up with some advice to improve your financial health.
        </p>
        <Image
          src="/brock.png"
          alt="Financial Advice"
          className="mx-auto"
          width={500}
          height={500}
        />
     </div>
    </section>
      {financialAdvice.map((advice, i) => (
      <section key={i} className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
         <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
           <div className="z-10 my-auto pb-10">
              <div className="text-lg mt-2 font-bold sm:text-[3rem] text-white">
                  <p className="mb-8 leading-tight">
                    <span className="text-4xl font-bold text-white/80 mr-2">#{i + 1}.</span>
                    {advice}
                  </p>
              </div>
           </div>
         </div>
      </section>
      ))}
  </>);
}
