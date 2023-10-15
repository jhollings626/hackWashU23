import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

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
  .query(async ({ input }) => {
    const { username } = input;

    console.log("GETTING TOKEN")
    const token = await getToken();
    console.log({ token });
    console.log("GETTING CUSTOMER ID")
    const customerId = await createCustomerId(token, username);
    console.log({ customerId });
    console.log("GETTING CONNECT URL")
    const connectUrl = await getConnectUrl(token, customerId);
    console.log({ connectUrl });

    return {
      username,
      customerId,
      connectUrl,
    };
  }),

  create: createPost,

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

