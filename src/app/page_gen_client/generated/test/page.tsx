'use client'

import { api } from "~/trpc/react";
import { useState } from 'react';

export default function Page() {
  const todosData = api.post.getData.useQuery({ query: 'select default::Todo { completed, name, id }' });
  const createTodo = api.post.writeData.useMutation();

  const [name, setName] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleCreateTodo = async () => {
    await createTodo.mutate({
      query: `insert default::Todo {
        name := <str>$name,
        completed := <bool>$completed
      }`,
      variables: { name, completed }
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="mb-4">
        <input
          type="text"
          className="border p-2 mr-2"
          placeholder="Todo name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="mr-2">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          Completed
        </label>
        <button
          className="bg-blue-500 text-white p-2"
          onClick={handleCreateTodo}
        >
          Add Todo
        </button>
      </div>
      <ul>
        {todosData.data?.map((todo) => (
          <li key={todo.id} className="mb-2">
            <span className={`mr-2 ${todo.completed ? 'line-through' : ''}`}>{todo.name}</span>
            <span>{todo.completed ? '✅' : '❌'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}