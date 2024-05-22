'use client'

import { api } from "~/trpc/react";
import { useState } from 'react';

export default function Page() {
  const [filter, setFilter] = useState<'all' | 'done' | 'undone'>('all');
  const [newTaskName, setNewTaskName] = useState('');

  const { data: todos, refetch } = api.post.getData.useQuery({
    query: `
      SELECT Todo {
        id,
        name,
        completed
      } FILTER 
        ${filter === 'done' ? 'completed = true' : filter === 'undone' ? 'completed = false' : 'true'}
    `
  });

  const addTask = api.post.writeData.useMutation({
    query: `
      INSERT Todo {
        name := <str>$name,
        completed := false
      }
    `
  });

  const toggleTaskCompletion = api.post.writeData.useMutation({
    query: `
      UPDATE Todo
      FILTER .id = <uuid>$id
      SET {
        completed := NOT .completed
      }
    `
  });

  const deleteTask = api.post.writeData.useMutation({
    query: `
      DELETE Todo
      FILTER .id = <uuid>$id
    `
  });

  const handleAddTask = async () => {
    await addTask.mutate({ query: `INSERT Todo { name := '${newTaskName}', completed := false }` });
    setNewTaskName('');
    refetch();
  };

  const handleToggleCompletion = async (id: string) => {
    await toggleTaskCompletion.mutate({ query: `UPDATE Todo FILTER .id = <uuid>'${id}' SET { completed := NOT .completed }` });
    refetch();
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask.mutate({ query: `DELETE Todo FILTER .id = <uuid>'${id}'` });
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
        <button onClick={handleAddTask} className="bg-blue-500 text-white p-2">Add Task</button>
      </div>
      <div className="mb-4">
        <button onClick={() => setFilter('all')} className={`p-2 ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('undone')} className={`p-2 ${filter === 'undone' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Undone</button>
        <button onClick={() => setFilter('done')} className={`p-2 ${filter === 'done' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Done</button>
      </div>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleCompletion(todo.id)}
              className="mr-2"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>{todo.name}</span>
            <button onClick={() => handleDeleteTask(todo.id)} className="bg-red-500 text-white p-2">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}