"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

/*
select Todo {
  name,id, completed
} filter true if <str>$filter = 'all' else .completed if <str>$filter = 'completed' else not .completed
# controls should come from here, make sure the useState is referring to these possible values. Another possible value is 'open'
*/

const RenderQuery = ({
  slug,
  q,
  idx,
}: {
  slug: string;
  q: string;
  idx: number;
}) => {
  const page = api.post.getOrCreatePage.useQuery({ slug });

  const updatePage = api.post.updatePage.useMutation();
  const removeQuery = api.post.removeQuery.useMutation();
  const [input, setInput] = useState(q);
  if (!page.data) {
    return <></>;
  }

  return (
    <div key={idx} className="border p-4">
      <h2 className="font-bold">QUERY #{idx}</h2>
      <textarea
        value={input}
        className="h-96 w-full bg-gray-50"
        onChange={(event) => {
          setInput(event.target.value);

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
          );
        }}
      ></textarea>
      <div className="flex justify-end">
        <button className="p-2 bg-slate-800 text-white rounded-md justify-end"
          onClick={() =>
            updatePage.mutate(
              {
                slug,
                queries: page.data.queries.filter((q, i) => i !== idx),
              },

              { onSuccess: () => void page.refetch() },
            )
          }
        >
          Remove query
        </button>
      </div>
    </div>
  );
};


export default function Page_Gen({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const res = api.post.createPage.useQuery({ slug });
  console.log(res.data);
  const page = api.post.getOrCreatePage.useQuery({ slug });
  const updatePage = api.post.updatePage.useMutation();
  const createFile = api.post.createFileClient.useMutation();
  const addQuery = api.post.addQuery.useMutation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [newQueryIsOpen, setNewQueryIsOpen] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  // INSTRUCTIONS FOR TOM
  // when using the form on the page, I get a missing 'title' property error.
  // I already wrote error detection below
  // use the error that was detected and feed it back to the AI so that it makes adjustments
  // ideally we factor out individual render components and merge the chat component logic into the Page_Gen component in order to prevent parent-child communication hassle
  useEffect(() => {
    setInterval(() => {
      console.log("checking error");
      const err_from_trpc = iframeRef.current?.contentWindow.err_feedback;
      console.log(err_from_trpc, iframeRef.current?.contentWindow);
      if (err_from_trpc) {
        return setErrorMessage(err_from_trpc.toString());
      }
      const x = iframeRef.current?.contentDocument
        ?.getElementsByTagName("nextjs-portal")?.[0]
        ?.shadowRoot?.getRootNode();
      if (!x) {
        return;
      }
      const nodes = Array.from((x as HTMLElement).children) as HTMLElement[];
      const contentNode = nodes.find(
        (child: HTMLElement) => child.tagName == "DIV",
      );
      if (contentNode) {
        const text = contentNode.innerText;
        if (
          text?.toLowerCase().includes("unhandled runtime error") ||
          text?.toLowerCase().includes("edgeqlsyntaxerror")
        ) {
          console.log("ERROR:" + text);
          setErrorMessage(`
                    ${text}

                    `);
        }
      }
    }, 1000);
  }, []);

  if (page.isError) {
    return <div>ERROR {page.error.message}</div>;
  }
  if (page.isSuccess) {
    const queryEditor = (
      <div className="m-4">
        <div>queries</div>
        {page.data.queries.length
          ? page.data.queries.map((q, idx) => (
            <RenderQuery idx={idx} key={idx} q={q} slug={slug} />
          ))
          : "no queries"}
        <button
          className="block p-2 mt-2 w-full bg-slate-800 text-white rounded-md"
          onClick={() => setNewQueryIsOpen(!newQueryIsOpen)}
        >
          Add query
        </button>
        {newQueryIsOpen && (
          <div className="flex flex-col">
            <textarea className="border rounded h-96 bg-gray-50 my-2" name="newQuery" onChange={(eve) => { setNewQuery(eve.target.value) }}></textarea>
            <button className="bg-slate-800 text-white rounded-md p-2 self-start" onClick={() => {
              console.log("Queries: " + [...page.data.queries, newQuery]);
              addQuery.mutate(
                {
                  slug,
                  query: newQuery, //1680 1050
                },
                { onSuccess: () => void page.refetch() },

              )
            }
            }>Submit</button>
          </div>
        )}
      </div>
    );
    const features = "";
    return (
      <div className="m-4">
        {queryEditor}
        {page.data.queries.length == 0 ? (
          <></>
        ) : (
          <Chat
            features={features}
            queries={page.data.queries}
            onFinish={(message) => {
              let content = message.content;
              // sometimes gpt includes delimiters
              if (content.startsWith("```")) {
                // trim first and last lines of code block from content by splitting into lines and taking away first and last
                content = content.split("\n").slice(1, -1).join("\n");
              }
              if (content.startsWith("`")) {
                // remove first and last chars
                content = content.slice(1, -1);
              }

              createFile.mutate(
                { slug, content },
                {
                  onSuccess: () => {
                    setTimeout(
                      () => iframeRef.current?.contentWindow?.location.reload(),
                      200,
                    );
                  },
                },
              );
            }}
            errorMessage={errorMessage}
          ></Chat>
        )}

        <div className="my-2 font-bold">Finished page</div>
        <div className="flex justify-around my-2">
          <button className="p-2 bg-slate-800 text-white rounded-md" onClick={() => iframeRef.current?.contentWindow?.location.reload()}>Reload iframe</button>

          <a target="_blank" href={`/page_gen_client/generated/${slug}`}>
            <button className="p-2 bg-slate-800 text-white rounded-md">Open page in new tab</button>
          </a>
        </div>

        <iframe
          ref={iframeRef}
          className="h-[100vh] w-full border"
          src={`/page_gen_client/generated/${slug}`}
        ></iframe>
      </div>
    );
  }
  return <div>loading</div>;
}

import { type Message, useChat } from "ai/react";
import { ChatRequestOptions, CreateMessage } from "ai";
import { wrap } from "module";
import { redirect } from "next/navigation";

const Chat = ({
  queries,
  onFinish,
  errorMessage,
}: {
  features: string;
  queries: string[];
  onFinish: (message: Message) => void;
  errorMessage: string;
}) => {
  const initMessage: Message = {
    id: "init",
    content: `You are an expert UI coder. I will give you an edgeDB schema and and some queries.
You will generate a react client component.
You will use TailwindCSS classes for styling.
You will fix syntax errors in edgeDB queries.
You will also make sure that insert statements in edgedb queries satisfy all constraints like 'required'.
Make sure that the code is complete and there are NO placeholders.
Never expect the user to enter code manually.
NEVER use async functions.
Style the components nicely but in a basic way. The default HTML styles are not applied, so buttons might be invisible without styling.
Do NOT hallucinate properties that are not in the schema!

Do NOT show IDs or expect users to insert them anywhere. Attach features with elements that require an ID to the component that holds the data.

You will return only the following with the [PLACEHOLDERS] filled out.

IMPORTANT: Do not write anything else like 'sure thing, I'll do ...'. You give ONLY file contents back.
Do not use any hooks like useState as they do not work with server functions.
IMPORTANT: ONLY return valid typescript, no markdown!


Ensure that there are controls for all parameter variants.


[[[
'use client'

import { api } from "~/trpc/react";

[IMPORTS YOU WILL NEED]


export default function Page() {
  [STATE MANAGEMENT]
  const utils = api.useUtils()

  [repeat the below as many times as needed for queries]
  [make sure that throwOnError is true - this is ONLY supported by queries, onError is not supported]
  const nameOfQueryData = api.post.getData.useQuery({query: '[read query]', variables: [query variables from state management]}, {throwOnError: true})


  [repeat the below as many times as needed for mutations]
  //use if you need to create, update or delete data. [nameOfSecondaryQuery].mutate({query: [FULL QUERY]}) to mutate
  const nameOfMutationData = api.post.writeData.useMutation()

  





  return [MARKUP that renders nameOfQueryData and UI elements for managing inputs
    Also markup for any filters that can be passed to queries.

    A mutation call looks like this:
mutation.mutate({query: [write query here], variables: [query variables  from  state management]}
  // make sure taht queries are refetched after each mutation
    , {onSuccess: () => void utils.invalidate()
    // make sure to call useMutation here and add an onError handler as the second argumen like so
    // it is ESSENTIAL that the error is fed to window.err_feedback.
    , onError: err => {
          console.log("error in trpc", window, err, 'throwing');
          window.err_feedback = err
          throw err


  }})
    

}
]]]



do not make IDs visible to the end user unless mentioned explicitly
`,
    role: "user",
  };

  const schema = api.post.getSchema.useQuery();
  const schemaString_ = (schema.data?.schema[0] as string | undefined) ?? "";
  console.log(schemaString_);
  const schemaString__ = schemaString_?.split("module default")[1] ?? "";

  const initialMessages: Message[] = [
    initMessage,
    { content: "Ok, got it!", role: "assistant", id: "confirm" },
  ];

  const prompt = `This is the schema
module default ${schemaString__}

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

  useEffect(() => {
    if (errorMessage != "") {
      console.log(errorMessage);
      const initErrorMessage: Message = {
        id: "error",
        content: `
                Fix this error without changing the functionality and content of the page:
                ${errorMessage}`,
        role: "user",
      };
      append(initErrorMessage);
      console.log(initErrorMessage);
    }
  }, [errorMessage]);

  const chatField = (
    <form onSubmit={handleSubmit}>
      <textarea
        className="h-56 w-full rounded border border-gray-300 p-2 shadow-xl"
        value={input}
        placeholder="Say something..."
        onChange={handleInputChange}
      />
      <button className="p-2 bg-slate-800 text-white rounded-md" type="submit">
        Submit
      </button>
    </form>
  );
  return (
    <div>
      {messages.map((message, idx) => {
        const m = message;
        return (
          <div key={message.id} className="bg-blue-100 overflow-scroll h-1/4 max-h-96 border border-black my-0.5">
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
          <div className="whitespace-pre-wrap border border-black my-2 ">{prompt}</div>
          <button
            onClick={() => append({ content: prompt, role: "user" })}
            className="p-2 bg-slate-800 text-white rounded-md"
          >
            RUN
          </button>
        </>
      )}
    </div>
  );
};
