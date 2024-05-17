"use client";

import { type Message, useChat } from "ai/react";
import { api } from "~/trpc/react";

import { html } from "htm/react";
import { isValidElement, useEffect, useState } from "react";
import { isValid } from "zod";
import { ErrorBoundary, ErrorComponent } from "next/dist/client/components/error-boundary";

export default function Chat() {
    const initMessage: Message = {
        id: "init",
        content: `You are an expert UI coder. I will give you an edgeDB schema, a query and the data that is returned.
You will return markup in the format of htm
(https://github.com/developit/htm).
You will use TailwindCSS classes for styling.
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
use react style property names like strokeWidth or className.
do not make IDs visible to the end user



`,
        role: "user",
    };
    const initialMessages: Message[] = [
        initMessage,
        { content: "Ok, got it!", role: "assistant", id: "confirm" },
    ];

    const initialQuery = `\
select Post {
    id,
    title,
    content
};`;
    const [query, setQuery] = useState(initialQuery);

    // EDGEDB PROMPT BUILDING
    const hello = api.post.getEdge.useQuery({ edgeQuery: query });

    const prompt = `This is the schema
${hello.data?.schema as unknown as string}

This is the query
${query}

This is the data
${JSON.stringify(hello.data?.res, null, 2)}
`;
    const { messages, input, handleInputChange, handleSubmit, setInput } =
        useChat({
            initialMessages,
            initialInput: prompt,
        });
    useEffect(() => {
        setInput(prompt);
    }, [prompt]);
    const data = hello.data?.res ?? [];
    window.html = html;
    window.data = data;

    return (
        <div className="stretch flex w-full flex-col py-12 px-10">
            {/* <div>PROMPT</div> */}
            <div className="flex gap-1 bg-slate-50" style={{ 'height': '80vh' }}>
                <textarea
                    value={query}
                    className="flex-1"
                    onInput={(e) => setQuery(e.target.value)}
                    style={{ border: '1px solid black' }}
                ></textarea>
                <div className="overflow-auto my-4 whitespace-pre bg-gray-200 font-mono flex-1">{prompt}</div>

            </div>
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
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full rounded border border-gray-300 p-2 shadow-xl h-56"
                    value={input}
                    placeholder="Say something..."
                    onChange={handleInputChange}
                />
                <button className="border rounded shadow-md" type="submit">Submit</button>
            </form>
            {messages.map((m, idx) => {
                if (idx < 3) {
                    return <div>prepr msg: {idx}</div>
                }
                // console.log(m.content);
                let rendered: any = '';
                try {
                    rendered =
                        m.role === "user" ? m.content : eval(`html\`${m.content}\``);
                    if (idx > 2) console.log(rendered)
                    if (Array.isArray(rendered)) {
                    }
                } catch (e: any) {
                    const rendered = e.message;
                }

                return (
                    <div key={m.id} className="whitespace-pre-wrap">
                        {m.role === "user" ? "User: " : "AI: "}
                        {idx > 1 ? (
                            <>
                                RAW: {m.content}
                                <div className="border p-4">
                                    <ErrorBoundary errorComponent={ErrorComponent}>

                                        {(Array.isArray(rendered) ? rendered[0] : rendered)}
                                    </ErrorBoundary>
                                </div>
                            </>
                        ) : (
                            <>{m.content}</>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const ErrorComponent: ErrorComponent = ({ error, reset }) => {
    return <div>
        ERROR {error.toString()}
        <button onClick={reset}>retry</button>

    </div>
}