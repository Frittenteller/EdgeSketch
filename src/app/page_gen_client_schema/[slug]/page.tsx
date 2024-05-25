"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

/*
-Todo App
-Possibility to set task as done or undone and to change it
-Possibility to add new tasks
-Possibility to delete tasks
-Filter to only show undone tasks
-Filter to show all tasks
-Filter to show done tasks
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
  const [input, setInput] = useState(q);
  if (!page.data) {
    return <></>;
  }

  return (
    <div key={idx} className="border p-4">
      QUERY #{idx}
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
  const utils = api.useUtils();
  const updatePage = api.post.updatePage.useMutation();
  const createFile = api.post.createFileClientSchema.useMutation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [features, setFeatures] = useState('NO FEATURES GIVEN')
  // INSTRUCTIONS FOR TOM
  // when using the form on the page, I get a missing 'title' property error.
  // I already wrote error detection below
  // use the error that was detected and feed it back to the AI so that it makes adjustments
  // ideally we factor out individual render components and merge the chat component logic into the Page_Gen component in order to prevent parent-child communication hassle
  const errorMessageInit: Message = {
    id: "error",
    content: "",
    role: "user",
  };
  useEffect(() => {
    const intervalID = setInterval(() => {
      console.log('interval')

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

    return () => { clearInterval(intervalID) }
  }, []);

  if (page.isError) {
    return <div>ERROR {page.error.message}</div>;
  }
  if (page.isSuccess) {
    const queryEditor = (
      <div>
        <div>queries</div>
        {page.data.queries.length
          ? page.data.queries.map((q, idx) => (
            <RenderQuery idx={idx} key={idx} q={q} slug={slug} />
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
        <textarea onChange={(eve) => { setFeatures(eve.target.value); console.log(eve.target.value); }}></textarea>
      </div>
    );
    return (
      <div>
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

        <div>Finished page</div>

        <iframe
          ref={iframeRef}
          className="h-[100vh] w-full"
          src={`/page_gen_client_schema/generated/${slug}`}
        ></iframe>
      </div>
    );
  }
  return <div>loading</div>;
}

import { type Message, useChat } from "ai/react";
import { ChatRequestOptions, CreateMessage } from "ai";
import { wrap } from "module";

const Chat = ({
  features,
  queries,
  onFinish,
  errorMessage,
}: {
  features: string,
  queries: string[];
  onFinish: (message: Message) => void;
  errorMessage: string;
}) => {
  const initMessage: Message = {
    id: "init",
    content: `You are an expert UI coder. I will give you an edgeDB schema and maybe features.
If there are no features given, interpret the features from the given schema.
You will generate a react client component.
You will use TailwindCSS classes for styling.
You will fix syntax errors in edgeDB queries.
You will also make sure that insert statements in edgedb queries satisfy all constraints like 'required'.
Make sure that the code is complete and there are NO placeholders.
Never expect the user to enter code manually.
There is NO variabels parameter in 'mutation'.

You will return only the following with the [PLACEHOLDERS] filled out.

IMPORTANT: Do not write anything else like 'sure thing, I'll do ...'. You give ONLY file contents back.
Do not use any hooks like useState as they do not work with server functions.
IMPORTANT: ONLY return valid typescript, no markdown!


Ensure that there are controls for all parameter variants.

[[[
'use client'

import { api } from "~/trpc/react";

[IMPORTS YOU WILL NEED]



export default async function Page() {
  [STATE MANAGEMENT]

  const [nameOfFirstQueryData] = api.post.getData.useQuery({query: '[first given query]'}) 
  const [nameOfSecondQueryData] = api.post.writeData.useMutation({query: '[second given query]'}) //use if you need to create, update or delete data. [nameOfSecondaryQuery].mutate({query: [FULL QUERY]}) to mutate

  return [MARKUP that renders nameOfQueryData and UI elements for managing inputs
    Also markup for any filters that can be passed to queries.

  ]

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

This are the features:
${features}
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
