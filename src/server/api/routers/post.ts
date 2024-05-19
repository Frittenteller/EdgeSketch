import createClient from "edgedb";
import { input } from "edgedb/dist/adapter.node";
import { z } from "zod";
import { promises as fs} from 'fs'
import e from 'edgedb';

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

  newPost: publicProcedure.input(z.object({title: z.string(), content: z.string()})).query(async (args) =>{
    const users = await client.query(`SELECT User { id };`);

    // Select a random user
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await client.execute(`
      INSERT Post{
        title := '${args.input.title}',
        content := '${args.input.content}',
        from_user := (
          select User
          filter .id = <uuid>'${randomUser.id}'
          limit 1
        )
      };
    `);
  }),

  newUser: publicProcedure.input(z.object({name: z.string()})).query(async (args) =>{
    await client.execute(`
    INSERT User{
      name := '${args.input.name}'
    };
    `)
  }),

  deleteUser: publicProcedure.input(z.object({name: z.string()})).query(async (args) =>{
    await client.query(`
    DELETE User
    FILTER .name = '${args.input.name}';
  `)
  }),

  deletePost: publicProcedure.input(z.object({name: z.string()})).query(async (args) =>{
    await client.query(`
    DELETE Post
    FILTER .title = '${args.input.name}';
  `);
  }),

  createFile: publicProcedure.input(z.object({slug: z.string(), content: z.string()})).mutation(async (args) =>{
    await fs.mkdir(`src/app/page_gen/${args.input.slug}`, { recursive: true }).then(async () => {
      await fs.writeFile(`src/app/page_gen/${args.input.slug}/page.tsx`, args.input.content)
    }
    )
  }),

  searchPage: publicProcedure.input(z.object({slug: z.string()})).query(async (args) =>{
    const res =await client.query(`
    with module Generator
    select exists (select Page filter .slug = '${args.input.slug}'
    );
    `)
    return res;
  }),

  createPage: publicProcedure.input(z.object({slug: z.string()})).query(async (args) =>{
    const res = await client.query(`
    WITH MODULE Generator
    INSERT Page{
      slug := '${args.input.slug}'
    } unless conflict on .slug else (
      select Page{
        id,
        slug,
        queries: {}
    } filter .slug = '${args.input.slug}'
    )
    `)

    return res;
  }),

  getPage: publicProcedure.input(z.object({id: z.string()})).query(async (args) =>{
    const res = await client.query(`
    WITH MODULE Generator
    select Page{
      id,
      slug,
      queries: {}
    } filter .id = <uuid>${args.input.id}
    `)
  }),

  addQuery: publicProcedure.input(z.object({slug: z.string(), query: z.string()})).mutation(async (args) =>{
    console.log(args.input.query)
    await client.query(`
      WITH MODULE Generator
      INSERT Query{
        body := '${args.input.query}'
      }
    `).then(async (q) =>{
      console.log(q)
      await client.query(`
      WITH MODULE Generator
      Update Page SET{
        queries += ${q}
      } filter .slug = 'test';
      `)
    })
      
    })

});
