'use server'

import createClient from "edgedb";
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { FormEvent } from 'react';

const headersList = headers();
const domain = headersList.get('host') || "";
const fullUrl = headersList.get('referer') || "";
const [, pathname] = fullUrl.match(new RegExp(`https?://${domain}(.*)`)) || [];

const client = createClient();

export default async function Page() {
  const filter = 'all'; // Default filter, you can change this based on your requirements
  const todos = await client.query(`
    select Todo {
      name, id
    } filter 
      <str>$filter = 'all' OR 
      (<str>$filter = 'completed' AND .completed) OR 
      (<str>$filter = 'not_completed' AND NOT .completed)
  `, { filter });

  async function addTodo(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;

    await client.query(`
      insert Todo {
        name := <str>$name,
        completed := false
      }
    `, { name });
    revalidatePath(pathname);
  }

  async function handleFilterChange(formData: FormData) {
    'use server'
    const filter = formData.get('filter') as string;
    revalidatePath(`${pathname}?filter=${filter}`);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <form action={addTodo} className="mb-4">
        <input
          type="text"
          name="name"
          placeholder="Enter todo name"
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2">Add Todo</button>
      </form>
      <form action={handleFilterChange} className="mb-4">
        <label className="mr-2">Filter:</label>
        <select name="filter" className="border p-2">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="not_completed">Not Completed</option>
        </select>
        <button type="submit" className="hidden">Apply Filter</button>
      </form>
      <ul>
        {todos.map((todo: { id: string, name: string }) => (
          <li key={todo.id} className="mb-2">
            {todo.name}
          </li>
        ))}
      </ul>
    </div>
  );
}