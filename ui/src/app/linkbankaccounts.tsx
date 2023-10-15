"use client";
import { twMerge } from "tailwind-merge";
import { faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from "./page.module.css";
import { ConnectComponent } from './finicityPopup';
import { api } from "~/trpc/client";

export interface CustomerData {
  username: string;
  customerId: string;
  connectUrl: string;
  token: string;
  email: string;
  linked: boolean;
}

export default function LinkBankAccounts({ customerData }: { customerData: CustomerData, updateLinkedCallback: () => Promise<void> }) {
  const updateLinkedCallback = async () => api.post.updateLinked.mutate({ linked: true });

  function openPopup() {
    new ConnectComponent(
      customerData.connectUrl,
      () => {
        updateLinkedCallback().then(() => {
          const el = document.getElementById("top-accounts");
          if (!el) return;
          el.scrollIntoView({ behavior: "smooth" });
        }).catch((e) => {
          console.error(e);
        }
        );
      }
    );
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
          {!customerData.linked ? (
            <button onClick={openPopup}>
              <span className="rounded-full bg-white text-secondary hover:bg-secondary hover:text-white transition-all duration-200 px-8 py-3">
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Link Your Accounts
              </span>
            </button>
          ) : (
            <p className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white">
              Your data is already linked!
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
