'use client'

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Overview() {
    const [slug, setSlug] = useState('');

    const pages = api.post.getData.useQuery({
        query: `
    select Generator::Page {
        id,
        slug
      }
    `});

    return (
        <div className="m-5">
            <h1 className="text-center font-bold text-lg">Generated Pages</h1>
            <div className="grid grid-cols-4 gap-5">
                {pages.data?.map((page: any) => (
                    <div key={page.id} className="border rounded my-2 py-2">
                        <h1 className="font-bold text-center">{page.slug}</h1>
                        <div className="flex justify-around">
                            <a href={`/page_gen_client/${page.slug}`}>
                                <button className="p-2 bg-slate-800 text-white rounded-md">Editor</button>
                            </a>
                            <a href={`/page_gen_client/generated/${page.slug}`}>
                                <button className="p-2 bg-slate-800 text-white rounded-md">Page</button>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}