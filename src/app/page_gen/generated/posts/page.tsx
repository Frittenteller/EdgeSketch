'use server'

import createClient from "edgedb";

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold">{post.from_user.name}</h2>
            <p className="mt-2">{post.content}</p>
            <div className="mt-4">
              <h3 className="text-lg font-medium">Comments</h3>
              <ul className="list-disc list-inside">
                {post.comment.map((comment, idx) => (
                  <li key={idx} className="mt-1">
                    {comment.user.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <form className="mt-8 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add a Post</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">User Name</label>
          <input type="text" name="user_name" className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea name="content" className="w-full p-2 border rounded"></textarea>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
      </form>
    </div>
  );
}