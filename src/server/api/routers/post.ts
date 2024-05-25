import createClient from "edgedb";
import { input } from "edgedb/dist/adapter.node";
import { z } from "zod";
import { promises as fs } from "fs";
import e from "~/../dbschema/edgeql-js";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getQueryError } from "~/app/api/trpc/[trpc]/route";

let post = {
  id: 1,
  name: "Hello World",
};

const client = createClient();

// const posts = await client.query<any>(`\
//  select Post {
//    id,
//    title,
//    content
// };`);

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

  getEdge: publicProcedure
    .input(z.object({ edgeQuery: z.string() }))
    .query(async (args) => {
      const res = await client.query(args.input.edgeQuery);
      const schema = await client.query("DESCRIBE SCHEMA AS SDL;");
      return { res, schema };
    }),
  getSchema: publicProcedure.query(async () => {
    const schema = await client.query("DESCRIBE SCHEMA AS SDL;");
    return { schema };
  }),
  getOrCreatePage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async (args) => {
      return e
        .select(
          e
            .insert(e.Generator.Page, { slug: args.input.slug })
            .unlessConflict((page) => ({ on: page.slug, else: page })),
          (page) => ({ queries: true }),
        )
        .run(client);
    }),
  updatePage: publicProcedure
    .input(z.object({ slug: z.string(), queries: z.array(z.string()) }))
    .mutation(async (args) => {
      return e
        .update(e.Generator.Page, (page) => ({
          filter_single: { slug: args.input.slug },
          set: { queries: args.input.queries },
        }))
        .run(client);
    }),


  newPost: publicProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .query(async (args) => {
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

  newUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async (args) => {
      await client.execute(`
    INSERT User{
      name := '${args.input.name}'
    };
    `);
    }),

  deleteUser: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async (args) => {
      await client.query(`
    DELETE User
    FILTER .name = '${args.input.name}';
  `);
    }),

  deletePost: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async (args) => {
      await client.query(`
    DELETE Post
    FILTER .title = '${args.input.name}';
  `);
    }),

  createFile: publicProcedure
    .input(z.object({ slug: z.string(), content: z.string() }))
    .mutation(async (args) => {
      console.log("writing file", args);
      await fs.mkdir(`src/app/page_gen/generated/${args.input.slug}`, {
        recursive: true,
      });
      await fs.writeFile(
        `src/app/page_gen/generated/${args.input.slug}/page.tsx`,
        args.input.content,
      );
    }),

  createFileClient: publicProcedure
    .input(z.object({ slug: z.string(), content: z.string() }))
    .mutation(async (args) => {
      console.log("writing file", args);
      await fs.mkdir(`src/app/page_gen_client/generated/${args.input.slug}`, {
        recursive: true,
      });
      await fs.writeFile(
        `src/app/page_gen_client/generated/${args.input.slug}/page.tsx`,
        args.input.content,
      );
    }),

  createFileClientSchema: publicProcedure
    .input(z.object({ slug: z.string(), content: z.string() }))
    .mutation(async (args) => {
      console.log("writing file", args);
      await fs.mkdir(
        `src/app/page_gen_client_schema/generated/${args.input.slug}`,
        {
          recursive: true,
        },
      );
      await fs.writeFile(
        `src/app/page_gen_client_schema/generated/${args.input.slug}/page.tsx`,
        args.input.content,
      );
    }),

  searchPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async (args) => {
      const res = await client.query(`
    with module Generator
    select exists (select Page filter .slug = '${args.input.slug}'
    );
    `);
      return res;
    }),

  createPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async (args) => {
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
    `);

      return res;
    }),

  getPage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async (args) => {
      const res = await client.query(`
    WITH MODULE Generator
    select Page{
      id,
      slug,
      queries: {}
    } filter .id = <uuid>${args.input.id}
    `);
    }),

  addQuery: publicProcedure
    .input(z.object({ slug: z.string(), query: z.string() }))
    .mutation(async (args) => {
      const query = args.input.query.replaceAll("'", '"')
      await client.query(`
        UPDATE Generator::Page filter .slug = '${args.input.slug}' set {
          queries += '${query}'
        }
      `)
    }),

    removeQuery: publicProcedure
    .input(z.object({ slug: z.string(), query: z.string() }))
    .mutation(async (args) => {
      await client.query(`
        UPDATE Generator::Page filter .slug = '${args.input.slug}' set {
          queries -= '${args.input.query}'
        }
      `)
    }),

  getData: publicProcedure
    .input(
      z.object({
        query: z.string(),
        variables: z.object({}).passthrough().optional(),
      }),
    )
    .query(async (args) => {
      const res = await client.query(args.input.query, args.input.variables);
      return res;
    }),

  getQueryError: publicProcedure.query(() => {
    const qError = getQueryError();
    return qError;
  }),
  writeData: publicProcedure
    .input(
      z.object({
        query: z.string(),
        variables: z.object({}).passthrough().optional(),
      }),
    )
    .mutation(async (args) => {
      const res = await client.query(args.input.query, args.input.variables);
      return res;
    }),
});
