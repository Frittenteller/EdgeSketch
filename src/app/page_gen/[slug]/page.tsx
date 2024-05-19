"use client";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function Page_Gen({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const [query, setQuery] = useState("");
  // load page from trpc query and create if it doesnt exist
  // allow adding queires to the page defined
  // give all of this information as a prompt to the generator (as before)
  // write the finished file at slug path (wait for the usechat to finish)
  //ts query builder

  const content = `'use server'
    export default async function () {
        // 
        return <div>
            slug: ${slug}
        </div>
    }
    `;

  const res = api.post.createPage.useQuery({ slug });
  console.log(res.data);
  const page = api.post.getOrCreatePage.useQuery({ slug });
  const utils = api.useUtils();
  const updatePage = api.post.updatePage.useMutation();
  const createFile = api.post.createFile.useMutation();
  if (page.isError) {
    return <div>ERROR {page.error.message}</div>;
  }
  if (page.isSuccess) {
    const queryEditor = (
      <div>
        <div>queries</div>
        {page.data.queries.length
          ? page.data.queries.map((q, idx) => (
              <div key={idx} className="border p-4">
                QUERY #{idx}
                <textarea
                  value={q}
                  className="h-96 w-full bg-gray-50"
                  onChange={(event) =>
                    updatePage.mutate(
                      {
                        slug,
                        queries:
                          // update query based on index
                          page.data.queries.map((q, i) =>
                            i === idx ? event.target.value : q,
                          ),
                      },
                      { onSuccess: () => void page.refetch() },
                    )
                  }
                ></textarea>
              </div>
            ))
          : "no queries"}
        <button
          className="block rounded-md bg-gray-50 p-3"
          onClick={() =>
            updatePage.mutate(
              {
                slug,
                queries: [...page.data.queries, "select Object"],
              },
              { onSuccess: () => void page.refetch() },
            )
          }
        >
          Add query
        </button>
      </div>
    );
    return (
      <div>
        {queryEditor}
        {page.data.queries.length == 0 ? (
          <></>
        ) : (
          <Chat
            queries={page.data.queries}
            onFinish={(message) =>
              createFile.mutate({ slug, content: message.content })
            }
          ></Chat>
        )}

        <div>Finished page</div>
        <iframe
          className="h-[100vh] w-full"
          src={`/page_gen/generated/${slug}`}
        ></iframe>
      </div>
    );
  }
  return <div>loading</div>;
}

import { type Message, useChat } from "ai/react";

const Chat = ({
  queries,
  onFinish,
}: {
  queries: string[];
  onFinish: (message: Message) => void;
}) => {
  const initMessage: Message = {
    id: "init",
    content: `You are an expert UI coder. I will give you an edgeDB schema and some queries.
You will generate a react server component.
You will use TailwindCSS classes for styling.
You will fix syntax errors in edgeDB queries.

You will return only the following with the [PLACEHOLDERS] filled out.

Do not write anything else like 'sure thing, I'll do ...' or add backticks.
Do not include the backticks.
Do not use any hooks like useState as they do not work with server functions.

\`
'use server'

import createClient from "edgedb";

[IMPORTS YOU WILL NEED]

const client = createClient();

export default async function Page() {
  [STATE MANAGEMENT]
  [edgedb execution in the style of 'const [nameOfQueryData] = client.query([query that I gave you])']
  
  return [MARKUP that renders nameOfQueryData and UI elements for managing inputs]

}



\`

do not make IDs visible to the end user unless mentioned explicitly

`,
    role: "user",
  };

  const schema = api.post.getSchema.useQuery();

  const initialMessages: Message[] = [
    initMessage,
    { content: "Ok, got it!", role: "assistant", id: "confirm" },
  ];

  const prompt = `This is the schema
${schema.data?.schema as unknown as string}

These are the queries
${queries.join("\n\n\n")}

`;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    append,
    isLoading,
  } = useChat({
    initialMessages,
    onFinish,
    initialInput: prompt,
  });

  const chatField = (
    <form onSubmit={handleSubmit}>
      <textarea
        className="h-56 w-full rounded border border-gray-300 p-2 shadow-xl"
        value={input}
        placeholder="Say something..."
        onChange={handleInputChange}
      />
      <button className="rounded border shadow-md" type="submit">
        Submit
      </button>
    </form>
  );
  return (
    <div>
      {messages.map((message, idx) => {
        const m = message;
        return (
          <div key={message.id} className="bg-blue-100">
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === "user" ? "User: " : "AI: "}
              {idx >= messages.length - 1 ? m.content : m.content.length}
            </div>
          </div>
        );
      })}
      {/* {chatField} */}
      {!isLoading && (
        <>
          <div className="whitespace-pre-wrap">{prompt}</div>
          <button
            onClick={() => append({ content: prompt, role: "user" })}
            className="block rounded-md bg-gray-50 p-3"
          >
            RUN
          </button>
        </>
      )}
    </div>
  );
};
