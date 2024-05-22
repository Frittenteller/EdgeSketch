'use client'

import { api } from "~/trpc/react";
import { useState } from 'react';

export default async function Page() {
  const [filter, setFilter] = useState<'all' | 'done' | 'undone'>('all');
  const [newTaskName, setNewTaskName] = useState('');

  const { data: todos, refetch } = api.post.getData.useQuery({
    query: `
      SELECT Todo {
        id,
        name,
        completed
      } FILTER .completed = <bool>$filter
    `,
    variables: {
      filter: filter === 'all' ? undefined : filter === 'done'
    }
  });

  const createTodo = api.post.writeData.useMutation({
    query: `
      INSERT Todo {
        name := <str>$name,
        completed := false
      }
    `
  });

  const updateTodo = api.post.writeData.useMutation({
    query: `
      UPDATE Todo
      FILTER .id = <uuid>$id
      SET {
        completed := <bool>$completed
      }
    `
  });

  const deleteTodo = api.post.writeData.useMutation({
    query: `
      DELETE Todo
      FILTER .id = <uuid>$id
    `
  });

  const handleCreateTodo = async () => {
    await createTodo.mutate({
      variables: {
        name: newTaskName
      }
    });
    setNewTaskName('');
    refetch();
  };

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    await updateTodo.mutate({
      variables: {
        id,
        completed
      }
    });
    refetch();
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo.mutate({
      variables: {
        id
      }
    });
    refetch();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className="border p-2 mr-2"
          placeholder="New task name"
        />
        <button
          onClick={handleCreateTodo}
          className="bg-blue-500 text-white p-2"
        >
          Add Task
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-2 mr-2 ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('undone')}
          className={`p-2 mr-2 ${filter === 'undone' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Undone
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`p-2 ${filter === 'done' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Done
        </button>
      </div>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id} className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleUpdateTodo(todo.id, !todo.completed)}
              className="mr-2"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>{todo.name}</span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="bg-red-500 text-white p-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}