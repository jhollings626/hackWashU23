import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import clientPromise from "~/server/mongodb";

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

