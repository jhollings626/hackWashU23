import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";
import { api } from "~/trpc/server";

export default async function Savings() {
  const savingsData = await api.post.getSavings.query()
  console.log({ savingsData })

  return (
      <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
         <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
           <div className="z-10 my-auto pb-10">
             <p className="text-4xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white">
               Since opening your account, you've earned <span className="text-primary">${new Intl.NumberFormat("en-US").format(savingsData.totalIncome)}</span> and spent <span className="text-primary">
               ${new Intl.NumberFormat("en-US").format(savingsData.totalSpending)}
                 </span>.
             </p>
             <p className="text-4xl mt-8 font-extrabold tracking-tight sm:text-[3rem] text-white">
               That&rsquo;s a <span className="text-primary">{Math.floor((savingsData.totalIncome - savingsData.totalSpending)/savingsData.totalIncome*100)}%</span> savings rate!
             </p>
           </div>
         </div>
      </section>
  );
}
