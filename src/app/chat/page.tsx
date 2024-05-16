"use client";

import { type Message, useChat } from "ai/react";
import { api } from "~/trpc/react";

import { html } from "htm/react";

export default function Chat() {
  const initMessage: Message = {
    id: "init",
    content: `You are an expert UI coder. I will give you an edgeDB schema, a query and the data that is returned.
You will return markup in the format of htm
(https://github.com/developit/htm).
This markup must be able to render the content of the data.


Return ONLY the markup and NOTHING else. Check this out:


const App = () => html\`[THIS IS WHAT YOU RETURN]
\`;

The variable is just called 'data'
Omit 
"""
const App = () => html\`\`
"""
from your response
Only give me what is inside of \`\`
Also exclude the backticks



`,
    role: "user",
  };
  const initialMessages: Message[] = [
    initMessage,
    { content: "Ok, got it!", role: "assistant", id: "confirm" },
  ];
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages,
  });

  const query = `\
select Post {
    id,
    title,
    content
};`;

  // EDGEDB PROMPT BUILDING
  const hello = api.post.getEdge.useQuery({ edgeQuery: query });

  const prompt = `

    This is the schema
    ${hello.data?.schema as unknown as string}

    This is the query
    ${query}

    This is the data
    ${JSON.stringify(hello.data?.res, null, 2)}
`;
  const data = hello.data?.res ?? [];
  window.html = html;
  window.data = data;

  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      {/* <div>PROMPT</div> */}
      <div className="my-4 whitespace-pre bg-gray-200 font-mono">{prompt}</div>
      {/* <div className="whitespace-pre-wrap font-mono">
        <div className="my-4">
          <div className="font-bold">schema</div>
          <div>{hello.data?.schema as unknown as string}</div>
        </div>
        <div className="my-4">
          <div className="font-bold">query</div>
          <div>{query}</div>
        </div>
        <div className="my-4">
          <div className="font-bold">response</div>
          <div>{JSON.stringify(hello.data?.res, null, 2)}</div>
        </div>
      </div> */}
      {messages.map((m, idx) => {
        console.log(m.content);
        let rendered = "";
        try {
          rendered =
            m.role === "user" ? m.content : eval(`html\`${m.content}\``);
        } catch (e) {
          const rendered = e.message;
        }
        return (
          <div key={m.id} className="whitespace-pre-wrap">
            {idx}
            {m.role === "user" ? "User: " : "AI: "}
            {idx > 1 ? (
              <>
                RAW: {m.content}
                <div className="border p-4">{rendered}</div>
              </>
            ) : (
              <>{m.content}</>
            )}
          </div>
        );
      })}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-gray-300 p-2 shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
