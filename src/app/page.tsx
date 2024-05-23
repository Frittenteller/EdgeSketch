import Link from "next/link";

import { CreatePost } from "~/app/_components/create-post";
import { api } from "~/trpc/server";
import { createClient } from "edgedb";
// import { runGemini } from "./_components/gemini";

export default async function Home() {

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="flex">
        <a href="/page_gen_client/">
          <div className="border rounded-sm p-2">
            <h1 className="font-bold">Page Generator</h1>
            Go to the page Generator
          </div>
        </a>
      </div>
    </main>
  );
}
