'use client'

import { api } from "~/trpc/react";
import { useState } from 'react';

export default function Page() {
  const [filter, setFilter] = useState<string>('all');
  const [newTodoName, setNewTodoName] = useState<string>('');
  const utils = api.useUtils();

  const todosData = api.post.getData.useQuery({
    query: `select Todo { name, id, completed } filter true if <str>$filter = 'all' else .completed if <str>$filter = 'completed' else not .completed`,
    variables: { filter }
  }, { throwOnError: true });

  const createTodoMutation = api.post.writeData.useMutation();
  const updateTodoMutation = api.post.writeData.useMutation();

  const handleCreateTodo = () => {
    createTodoMutation.mutate({
      query: `insert Todo {name:= <str>$name}`,
      variables: { name: newTodoName }
    }, {
      onSuccess: () => {
        utils.invalidate();
        setNewTodoName('');
      },
      onError: err => {
        console.log("error in trpc", window, err, 'throwing');
        window.err_feedback = err;
        throw err;
      }
    });
  };

  const handleUpdateTodo = (todoId: string) => {
    updateTodoMutation.mutate({
      query: `update Todo filter .id = <uuid>$todo_id set {completed:= true}`,
      variables: { todo_id: todoId }
    }, {
      onSuccess: () => {
        utils.invalidate();
      },
      onError: err => {
        console.log("error in trpc", window, err, 'throwing');
        window.err_feedback = err;
        throw err;
      }
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          className="border p-2 mr-2"
          placeholder="New Todo"
        />
        <button
          onClick={handleCreateTodo}
          className="bg-blue-500 text-white p-2"
        >
          Add Todo
        </button>
      </div>

      <div className="mb-4">
        <label className="mr-2">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="open">Open</option>
        </select>
      </div>

      <div>
        {todosData.data?.map((todo: { id: string, name: string, completed: boolean }) => (
          <div key={todo.id} className="flex items-center mb-2">
            <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>{todo.name}</span>
            {!todo.completed && (
              <button
                onClick={() => handleUpdateTodo(todo.id)}
                className="bg-green-500 text-white p-2"
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}