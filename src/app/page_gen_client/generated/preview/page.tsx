'use client'

import { api } from "~/trpc/react";
import { useState } from "react";

export default function Page() {
  const [filter, setFilter] = useState<string>("all");
  const utils = api.useUtils();

  const todoData = api.post.getData.useQuery(
    {
      query: `select Todo {
        name, id, completed
      } filter true if <str>$filter = "all" else .completed if <str>$filter = "completed" else not .completed`,
      variables: { filter }
    },
    { throwOnError: true }
  );

  const createTodo = api.post.writeData.useMutation();
  const updateTodo = api.post.writeData.useMutation();
  const deleteTodo = api.post.writeData.useMutation();

  const handleCreate = (name: string) => {
    createTodo.mutate(
      {
        query: `insert Todo { name := <str>$name, completed := false }`,
        variables: { name }
      },
      {
        onSuccess: () => void utils.invalidate(),
        onError: err => {
          console.log("error in trpc", window, err, 'throwing');
          window.err_feedback = err;
          throw err;
        }
      }
    );
  };

  const handleUpdate = (id: string, completed: boolean) => {
    updateTodo.mutate(
      {
        query: `update Todo filter .id = <uuid>$id set { completed := <bool>$completed }`,
        variables: { id, completed }
      },
      {
        onSuccess: () => void utils.invalidate(),
        onError: err => {
          console.log("error in trpc", window, err, 'throwing');
          window.err_feedback = err;
          throw err;
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteTodo.mutate(
      {
        query: `delete Todo filter .id = <uuid>$id`,
        variables: { id }
      },
      {
        onSuccess: () => void utils.invalidate(),
        onError: err => {
          console.log("error in trpc", window, err, 'throwing');
          window.err_feedback = err;
          throw err;
        }
      }
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="open">Open</option>
        </select>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="New Todo"
          className="border p-2 rounded mr-2"
          id="newTodoInput"
        />
        <button
          onClick={() => {
            const input = document.getElementById("newTodoInput") as HTMLInputElement;
            if (input.value.trim()) {
              handleCreate(input.value.trim());
              input.value = "";
            }
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Todo
        </button>
      </div>
      <ul>
        {todoData.data?.map((todo: { id: string; name: string; completed: boolean }) => (
          <li key={todo.id} className="mb-2 flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleUpdate(todo.id, !todo.completed)}
              className="mr-2"
            />
            <span className={todo.completed ? "line-through" : ""}>{todo.name}</span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="bg-red-500 text-white p-1 rounded ml-2"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}