'use server'

import createClient from "edgedb";
import { use } from "react";
import { useForm } from "react-hook-form";

const client = createClient();

export default async function Page() {
  const posts = await client.query(`
    select default::Post {
      id,
      content,
      title,
      from_user: {
        name
      }
    };
  `);

  async function addPost(formData) {
    'use server'
    const title = formData.get('title');
    const content = formData.get('content');
    const userName = formData.get('userName');

    const user = await client.query(`
      select default::User {
        id
      } filter .name = <str>$userName
    `, { userName });

    await client.query(`
      insert Post {
        title := <str>$title,
        content := <str>$content,
        from_user := (select default::User filter .id = <uuid>$userId)
      }
    `, { title, content, userId: user[0].id });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id} className="mb-2 p-2 border rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p>{post.content}</p>
            <p className="text-sm text-gray-500">By {post.from_user.name}</p>
          </li>
        ))}
      </ul>
      <form action={addPost} method="post" className="mt-4">
        <div className="mb-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" id="title" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div className="mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea name="content" id="content" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm" required></textarea>
        </div>
        <div className="mb-2">
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User Name</label>
          <input type="text" name="userName" id="userName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Add Post</button>
      </form>
    </div>
  );
}