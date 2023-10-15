import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";

export default async function Savings() {
  return (
      <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
         <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
           <div className="z-10 my-auto pb-10">
             <p className="text-4xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white">
               In the last month, you earned <span className="text-primary">$1,000</span> and spent <span className="text-primary">$500</span>.
             </p>
             <p className="text-4xl mt-8 font-extrabold tracking-tight sm:text-[3rem] text-white">
               That&rsquo;s a <span className="text-primary">50%</span> savings rate!
             </p>
           </div>
         </div>
      </section>
  );
}
