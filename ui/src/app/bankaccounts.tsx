import { twMerge } from "tailwind-merge";
import { api } from "~/trpc/server";
import styles from "./page.module.css";

interface AccountDetail {
  marginBalance: number;
  availableCashBalance: number;
  currentBalance: number;
  vestedBalance: number;
  currentLoanBalance: number;
  availableBalanceAmount: number;
}

interface Account {
  id: string;
  number: string;
  realAccountNumberLast4: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  aggregationStatusCode: number;
  status: string;
  customerId: string;
  institutionId: string;
  balanceDate: number;
  aggregationSuccessDate: number;
  aggregationAttemptDate: number;
  createdDate: number;
  lastUpdatedDate: number;
  currency: string;
  institutionLoginId: number;
  detail: Partial<AccountDetail>;
  displayPosition: number;
  accountNickname: string;
  marketSegment: string;
  lastTransactionDate?: number;
  oldestTransactionDate?: number;
}

export default async function BankAccountsOverview() {
  const { accounts } = await api.post.getAccounts.query() as { accounts: Account[] };
  console.log(accounts);

  return (
    <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
     <div className="z-10 mt-8 w-full">
       <h2 className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white text-center mb-2" id="top-accounts">
         Your Top Accounts
       </h2>
       <div className="text-center w-full px-4">
         {accounts.sort((a, b) => b.balance - a.balance).slice(0, 5).map((account, i) => (
           <BankAccount num={i + 1} account={account} key={account.id} />
         ))}
       </div>
     </div>
    </section>
  );
}

function BankAccount({ num, account }: { num: number, account: Account }) {
  return (
    <div className="flex w-full items-center mb-5 mx-auto text-white rounded-2xl px-4 py-2">
      <h3 className="text-5xl font-bold w-1/5">#{num}</h3>
      <div className="mx-2" style={{height: "125px", width: "125px", backgroundColor: "white"}}></div>
      <div className="text-left ml-auto w-1/2">
        <h3 className="font-bold">{account.name} ({account.accountNumberDisplay})</h3>
        <h3>Balance: ${new Intl.NumberFormat("en-US").format(account.balance)}</h3>
      </div>
    </div>
  );
}

