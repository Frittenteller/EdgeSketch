'use server'

import createClient from "edgedb";
import { useForm } from 'react-hook-form';

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
    const userName = formData.get('user_name') as string;

    await client.query(`
      insert Post {
        content := <str>$content,
        from_user := (insert User { name := <str>$userName })
      }
    `, { content, userName });
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.id} className="mb-2">
            <h2 className="text-xl font-semibold">{post.from_user.name}</h2>
            <p>{post.content}</p>
            <ul className="ml-4">
              {post.comment.map((comment: any) => (
                <li key={comment.id} className="text-sm">
                  {comment.user.name}: {comment.content}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <form action={createPost} method="post" className="mt-4">
        <div className="mb-2">
          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">User Name</label>
          <input type="text" name="user_name" id="user_name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
        </div>
        <div className="mb-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea name="content" id="content" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Create Post</button>
      </form>
    </div>
  );
}