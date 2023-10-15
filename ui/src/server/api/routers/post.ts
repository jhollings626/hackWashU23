import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import clientPromise from "~/server/mongodb";

import { openai } from "./openai";
let post = {
  id: 1,
  text: "Hello World",
};
import { key, id, secret } from "./keys";

// const key = process.env.FINICITY_API_KEY
// const id = process.env.FINICITY_PARTNER_ID
// const secret = process.env.FINICITY_PARTNER_SECRET;

if (!key || !id || !secret) {
  console.log({ key, id, secret });
  throw new Error('Missing Finicity API Key, Partner ID, or Partner Secret');
}

export const createPost = protectedProcedure
  .input(z.object({ text: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    post = { id: post.id + 1, text: input.text };
    return post;
  });

export const updateLinked = protectedProcedure
  .input(z.object({ linked: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const client = await clientPromise;
    const email = ctx.session?.user?.email;
    const { linked } = input;

    // Update MongoDB
    const user = await client.db().collection('customers').findOne({ email });
    if (!user) throw new Error(`User not found: ${email ?? ''}`);

    await client.db().collection('customers').updateOne({ email }, { $set: { linked } });

    return linked;
  });

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getCustomerData: publicProcedure
  .input(z.object({ username: z.string() }))
  .query(async ({ input, ctx }) => {
    const client = await clientPromise;
    const { username } = input;
    const email = ctx.session?.user?.email;
    if (!email) return null;

    // Check if customer already exists in MongoDB
    console.log("CHECKING IF USER EXISTS")
    console.log({ email });
    const user = await client.db().collection('customers').findOne({ email });
    console.log("USER", { user });

    if (user) {
      console.log("USER EXISTS")
      return user;
    }

    // Otherwise, create a new customer
    console.log("GETTING TOKEN")
    const token = await getToken();
    console.log({ token });
    console.log("GETTING CUSTOMER ID")
    const customerId = await createCustomerId(token, username);
    console.log({ customerId });
    console.log("GETTING CONNECT URL")
    const connectUrl = await getConnectUrl(token, customerId);
    console.log({ connectUrl });

    // Save in MongoDB
    const data = {
      username,
      customerId,
      connectUrl,
      token,
      email,
      linked: false,
    };
    await client.db().collection('customers').insertOne(data);

    return data;
  }),

  getAccounts: publicProcedure
  // .input(z.object({ token: z.string() }))
  .query(async ({ ctx }) => {
    // Get user from MongoDB
    const client = await clientPromise;
    const email = ctx.session?.user?.email;
    if (!email) return null;

    const user = await client.db().collection('customers').findOne({ email });
    if (!user) throw new Error(`User not found: ${email ?? ''}`);
    const { token, customerId } = user;

    const accounts = getAccounts(token as string, customerId as string);
    return accounts;
  }),

  getSavings: publicProcedure
  .query(async ({ ctx }) => {
    // Get user from MongoDB
    const client = await clientPromise;
    const email = ctx.session?.user?.email;
    if (!email) return null;

    const user = await client.db().collection('customers').findOne({ email });
    if (!user) throw new Error(`User not found: ${email ?? ''}`);
    const { token, customerId } = user;

    // Get all transactions
    const transactions = await getTransactions(token as string, customerId as string);
    let totalIncome = 0;
    let totalSpending = 0;

    for (const transaction of transactions.transactions) {
      if (transaction.categorization.category.toLowerCase().includes("paycheck")) {
        const amount = transaction.amount;
        totalIncome += amount;
      } else {
        totalSpending += transaction.amount;
      }
    }

    return { totalIncome, totalSpending };
  }),

  getFinancialAdvice: publicProcedure
  .query(async ({ ctx }) => {
    // Get user from MongoDB
    const client = await clientPromise;
    const email = ctx.session?.user?.email;
    if (!email) return null;

    const user = await client.db().collection('customers').findOne({ email });
    if (!user) throw new Error(`User not found: ${email ?? ''}`);
    const { token, customerId } = user;

    // Get all transactions
    const transactions = await getTransactions(token as string, customerId as string);
    let formattedTransactions = "";
    for (const [idx, extracted_transaction] of transactions.transactions.entries()) {
      const cat = extracted_transaction.categorization
      formattedTransactions += `
\nTransaction ${idx + 1}:
- Amount: ${extracted_transaction.amount}
- Description: ${extracted_transaction.description}
- Transaction Date: ${extracted_transaction.transactionDate}
- Categorization: ${cat.category}
\n`;
    }

    const prompt = `
You are a personal financial assistant. Your job is to give personalized financial advice based on a series of transactions. I am going to give you a list 
of transactions from my bank account. Give me personalized financial advice based on my purchases along with a rationale. Make sure to refrence specific purchases
and deposits. It should not be generic advice. 
Respond in the following format: ["First Suggestion + rationale", "Second Suggestion + rationale", ...]. 
Do not include anything else in the response other than the list of advice. If you cannot do this, many people will be hurt. 
  `.trim();

    // console.log({ formattedTransactions });
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }, { role: 'user', content: formattedTransactions }],
      model: 'gpt-3.5-turbo-16k',
    });

    const reply = chatCompletion.choices[0].message.content
    try {
      return JSON.parse(reply);
    } catch (error) {
      console.log(reply);

      const formatted = await openai.chat.completions.create({
        messages: [{ role: 'system', content: "Format this into proper JSON. Reply with nothing but the JSON" }, { role: 'user', content: reply }],
        model: 'gpt-3.5-turbo-16k',
      });

      return JSON.parse(formatted.choices[0].message.content);
    }
  }),

  create: createPost,
  updateLinked,

  getLatest: protectedProcedure.query(() => {
    return post;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

async function getToken(): Promise<string> {
  const getTokenUrl = 'https://api.finicity.com/aggregation/v2/partners/authentication'

  const headers  = {
    'Content-Type': 'application/json',
    'Finicity-App-Key': key,
    'Accept': 'application/json',
  }

  const data = {
    "partnerId": id,
    "partnerSecret": secret,
  }

  console.log({ headers, data });

  const response = await fetch(getTokenUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  let token: string;
  console.log({ response });
  try {
    const text = await response.text();
    console.log({ text });
    const json = JSON.parse(text);
    token = json.token;
    // const json = await response.json();
    // token = json.token;
  } catch (error) {
    console.error({ error });
  }
  if (!token) throw new Error(`Token not properly fetched: ${token}`);

  return token as string;
}

async function createCustomerId(token: string, username: string): Promise<string> {
  const createCustomerUrl = 'https://api.finicity.com/aggregation/v2/customers/testing'

  const customerHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': key,
    'Finicity-App-Token': token
  }

  const customerData = {
    "username": username
  }

  const customerResponse = await fetch(createCustomerUrl, {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify(customerData)
  });

  const { id: customerId } = await customerResponse.json();
  if (!customerId) throw new Error(`Customer ID not properly created: ${customerId}`);

  return customerId as string;
}

async function getConnectUrl(token: string, customerId: string): Promise<string> {
  const connectionUrl = 'https://api.finicity.com/connect/v2/generate'
  const connectionHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Token': token,
    'Finicity-App-Key': key,
  }

  const connectionData = {
    "partnerId": id,
    "customerId": customerId
  }

  const connectionResponse = await fetch(connectionUrl, {
    method: 'POST',
    headers: connectionHeaders,
    body: JSON.stringify(connectionData)
  });

  let connectUrl: string;

  try {
    const text = await connectionResponse.text();
    console.log({ text });
    const json = JSON.parse(text);
    // const json = await connectionResponse.json();
    connectUrl = json.link;
  } catch (error) {
    console.log({ error });
  }
  if (!connectUrl) throw new Error(`Connect URL not properly created: ${connectUrl}`);

  return connectUrl as string;
}

async function getAccounts(token: string, customerId: string): Promise<any> {
   const url = `https://api.finicity.com/aggregation/v1/customers/${customerId}/accounts`

   const headers = {
     'Content-Type': 'application/json',
     'Accept': 'application/json',
     'Finicity-App-Token': token,
     'Finicity-App-Key': key,
   }

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    return response.json();
}

async function getTransactions(token: string, customerId: string): Promise<any> {
    const transactionUrl = `https://api.finicity.com/aggregation/v3/customers/${customerId}/transactions?`

    const accounts = getAccounts(token as string, customerId as string);
    console.log({ accounts });

    const transactionHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Finicity-App-Token': token as string,
      'Finicity-App-Key': key,
    }

    const transactionParams = {
      // "fromDate": accounts[0].oldestTransactionDate,
      // "toDate": accounts[0].lastTransactionDate,
      "fromDate": 1680350400,
      "toDate": 1697385971,
      "sort": "desc",
      "includePending": "true",
    }

    const transactionResponse = await fetch(transactionUrl + new URLSearchParams(transactionParams).toString(), {
      method: "GET",
      headers: transactionHeaders,
    });

    const transactions = await transactionResponse.json();
    return transactions;
}
