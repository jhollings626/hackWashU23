import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";
import { api } from "~/trpc/server";

export default async function FinancialAdvice() {
  const financialAdvice: string[] = await api.post.getFinancialAdvice.query();
  console.log({ financialAdvice });

  return (<>
      {financialAdvice.map((advice, i) => (
      <section key={i} className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
         <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
           <div className="z-10 my-auto pb-10">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white">
                Financial Advice
              </h1>
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
