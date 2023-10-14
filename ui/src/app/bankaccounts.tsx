import { twMerge } from "tailwind-merge";
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


const accounts: Account[] = [
{
  "id": "6020488409",
    "number": "232323",
    "realAccountNumberLast4": "2323",
    "accountNumberDisplay": "2323",
    "name": "ROTH",
    "balance": 11001.0,
    "type": "roth",
    "aggregationStatusCode": 0,
    "status": "active",
    "customerId": "6012118342",
    "institutionId": "102105",
    "balanceDate": 1665157710,
    "aggregationSuccessDate": 1665157711,
    "aggregationAttemptDate": 1665157711,
    "createdDate": 1665157660,
    "lastUpdatedDate": 1665157664,
    "currency": "USD",
    "institutionLoginId": 6009863353,
    "detail": {},
    "displayPosition": 5,
    "accountNickname": "ROTH",
    "marketSegment": "personal"
},
{
  "id": "6020488411",
  "number": "121212",
  "realAccountNumberLast4": "1212",
  "accountNumberDisplay": "1212",
  "name": "My 401k",
  "balance": 265000.0,
  "type": "investmentTaxDeferred",
  "aggregationStatusCode": 0,
  "status": "active",
  "customerId": "6012118342",
  "institutionId": "102105",
  "balanceDate": 1665157710,
  "aggregationSuccessDate": 1665157711,
  "aggregationAttemptDate": 1665157711,
  "createdDate": 1665157660,
  "lastUpdatedDate": 1665157664,
  "currency": "USD",
  "institutionLoginId": 6009863353,
  "detail": {
    "marginBalance": 0.0,
    "availableCashBalance": 2000.0,
    "currentBalance": 265000.0,
    "vestedBalance": 225000.0,
    "currentLoanBalance": 25000.0
  },
  "displayPosition": 4,
  "accountNickname": "My 401k",
  "marketSegment": "personal"
},
{
  "id": "6020488412",
  "number": "101010",
  "realAccountNumberLast4": "1010",
  "accountNumberDisplay": "1010",
  "name": "Personal Investments",
  "balance": 100000.0,
  "type": "investment",
  "aggregationStatusCode": 0,
  "status": "active",
  "customerId": "6012118342",
  "institutionId": "102105",
  "balanceDate": 1665157710,
  "aggregationSuccessDate": 1665157711,
  "aggregationAttemptDate": 1665157711,
  "createdDate": 1665157660,
  "lastUpdatedDate": 1665157664,
  "currency": "USD",
  "institutionLoginId": 6009863353,
  "detail": {
    "marginBalance": 0.0,
    "availableCashBalance": 1000.0,
    "currentBalance": 100000.0,
    "vestedBalance": 100000.0,
    "currentLoanBalance": 0.0
  },
  "displayPosition": 3,
  "accountNickname": "Personal Investments",
  "marketSegment": "personal"
},
{
  "id": "6020488414",
  "number": "22222203",
  "realAccountNumberLast4": "2203",
  "accountNumberDisplay": "2203",
  "name": "Savings",
  "balance": 22327.3,
  "type": "savings",
  "aggregationStatusCode": 0,
  "status": "active",
  "customerId": "6012118342",
  "institutionId": "102105",
  "balanceDate": 1665157710,
  "aggregationSuccessDate": 1665157711,
  "aggregationAttemptDate": 1665157711,
  "createdDate": 1665157661,
  "lastUpdatedDate": 1665157664,
  "currency": "USD",
  "lastTransactionDate": 1665157710,
  "institutionLoginId": 6009863353,
  "detail": {
    "availableBalanceAmount": 0.0
  },
  "displayPosition": 2,
  "accountNickname": "Savings",
  "oldestTransactionDate": 1649851200,
  "marketSegment": "personal"
},
{
  "id": "6020488416",
  "number": "111111",
  "realAccountNumberLast4": "1111",
  "accountNumberDisplay": "1111",
  "name": "Checking",
  "balance": 9357.24,
  "type": "checking",
  "aggregationStatusCode": 0,
  "status": "active",
  "customerId": "6012118342",
  "institutionId": "102105",
  "balanceDate": 1665157710,
  "aggregationSuccessDate": 1665157711,
  "aggregationAttemptDate": 1665157711,
  "createdDate": 1665157661,
  "lastUpdatedDate": 1665157664,
  "currency": "USD",
  "lastTransactionDate": 1665157710,
  "institutionLoginId": 6009863353,
  "detail": {
    "availableBalanceAmount": 0.0
  },
  "displayPosition": 1,
  "accountNickname": "Checking",
  "oldestTransactionDate": 1646136000,
  "marketSegment": "personal"
}
]

export default function BankAccountsOverview() {
  return (
    <section className={twMerge("snap-start flex w-screen h-screen", styles.background)}>
     <div className="z-10 mt-8 w-full">
       <h2 className="text-3xl mt-2 font-extrabold tracking-tight sm:text-[3rem] text-white text-center mb-2">
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

