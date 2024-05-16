'use client';

import { Message, useChat } from 'ai/react';
import { api } from '~/trpc/react';

export default function Chat() {
    const initMessage: Message = {
        id: "init",
        content: 'Based on the following message, return only the return function of a NextJS app.',
        role: 'user'
    }
    const initialMessages: Message[] = [initMessage]
    const { messages, input, handleInputChange, handleSubmit } = useChat({initialMessages});

    const query = `\
    select Post {
        id,
        title,
        content
    };`
    
    const hello = api.post.getEdge.useQuery({ edgeQuery: query});

    
    return (
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {JSON.stringify(hello.data, null, 2)}
        {messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
            </div>
        ))}

        <form onSubmit={handleSubmit}>
            <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
            />
        </form>
        </div>
    );
}