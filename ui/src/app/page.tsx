import { createPost } from "~/app/actions";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { Button } from "~/ui/button";
import { twMerge } from "tailwind-merge";
import styles from "./page.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'
import BankAccountsOverview from "~/app/bankaccounts";
import ExpenseGraph from "~/app/expensegraph";

export default function Home() {
  return (
    <div className="snap-y snap-mandatory h-screen w-screen overflow-scroll">
      <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
         <div className="w-11/12 h-full mx-auto flex flex-col items-center justify-center">
           <div className="z-10 mt-auto">
             <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-white">
               Hack WashU 23
             </h1>
             <h2 className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white">
               Your finance made as easy as your TK
             </h2>
           </div>
           <div className="text-center mt-auto pb-10">
             <FontAwesomeIcon icon={faArrowDown} size="4x" bounce className="text-white" />
           </div>
         </div>
      </section>
      <BankAccountsOverview />
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
      <ExpenseGraph />
    </div>
  );

  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  // return (
  //   <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
  //     <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
  //       <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
  //         Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
  //       </h1>
  //       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
  //         <Link
  //           className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
  //           href="https://create.t3.gg/en/usage/first-steps"
  //           target="_blank"
  //         >
  //           <h3 className="text-2xl font-bold">First Steps →</h3>
  //           <div className="text-lg">
  //             Just the basics - Everything you need to know to set up your
  //             database and authentication.
  //           </div>
  //         </Link>
  //         <Link
  //           className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
  //           href="https://create.t3.gg/en/introduction"
  //           target="_blank"
  //         >
  //           <h3 className="text-2xl font-bold">Documentation →</h3>
  //           <div className="text-lg">
  //             Learn more about Create T3 App, the libraries it uses, and how to
  //             deploy it.
  //           </div>
  //         </Link>
  //       </div>
  //       <div className="flex flex-col items-center gap-2">
  //         <p className="text-2xl text-white">
  //           {hello ? hello.greeting : "Loading tRPC query..."}
  //         </p>
  //
  //         <div className="flex flex-col items-center justify-center gap-4">
  //           <p className="text-center text-2xl text-white">
  //             {session && <span>Logged in as {session.user?.name}</span>}
  //           </p>
  //           <Link
  //             href={session ? "/api/auth/signout" : "/api/auth/signin"}
  //             className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
  //           >
  //             {session ? "Sign out" : "Sign in"}
  //           </Link>
  //         </div>
  //
  //         {/* @ts-expect-error - Async Server Component */}
  //         <CrudShowcase />
  //       </div>
  //     </div>
  //   </main>
  // );
}

async function CrudShowcase() {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const latestPost = await api.post.getLatest.query();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.text}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <form action={createPost} className="flex flex-col gap-2">
        <input
          type="text"
          name="text"
          placeholder="Title"
          className="w-full rounded bg-primary p-2 text-background"
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
