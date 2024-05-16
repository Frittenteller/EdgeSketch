import createClient from "edgedb";
import { input } from "edgedb/dist/adapter.node";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

let post = {
  id: 1,
  name: "Hello World",
};

const client = createClient();

const posts = await client.query<any>(`\
 select Post {
   id,
   title,
   content
};`)

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      post = { id: post.id + 1, name: input.name };
      return post;
    }),

  getEdge: publicProcedure.input(z.object({edgeQuery: z.string()})).query(async (args) => {
    const res = await client.query(args.input.edgeQuery);
    const schema = await client.query('DESCRIBE SCHEMA AS SDL;');
    return {res, schema};
  }),
});
