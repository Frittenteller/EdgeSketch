'use server'

import createClient from "edgedb";
import { use } from "react";

const client = createClient();

export default async function Page() {
  const posts = await client.query(`
    select Post {
      comment: {
        user: { name }
      },
      content,
      from_user: { name }
    }
  `);

  async function createPost(formData: FormData) {
    'use server'
    const content = formData.get('content') as string;
    const user_name = formData.get('user_name') as string;

    await client.query(`
      insert Post {
        content := <str>$content,
        from_user := (insert User { name := <str>$user_name })
      }
    `, { content, user_name });
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <ul>
        {posts.map((post, index) => (
          <li key={index} className="mb-2 p-2 border rounded">
            <p className="font-semibold">{post.from_user.name}</p>
            <p>{post.content}</p>
            <ul className="ml-4 mt-2">
              {post.comment.map((comment, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-semibold">{comment.user.name}:</span> {comment.content}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <form action={createPost} method="post" className="mt-4">
        <div className="mb-2">
          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">User Name</label>
          <input type="text" name="user_name" id="user_name" className="mt-1 block w-full p-2 border rounded" required />
        </div>
        <div className="mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea name="content" id="content" className="mt-1 block w-full p-2 border rounded" required></textarea>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Create Post</button>
      </form>
    </div>
  );
}