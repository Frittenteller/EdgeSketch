'use client'

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Page_Gen_Home() {
    const [slug, setSlug] = useState('');

    const pages = api.post.getData.useQuery({
        query: `
    select Generator::Page {
        id,
        slug
      }
    `});

    return (
        <div className="flex justify-center h-screen m-5">
            <div className="flex flex-col">
                <h1 className="font-bold">Enter page slug to be generated:</h1>
                <input className="border rounded my-3" type="text" name="" id="slug" onChange={(eve) => { setSlug(eve.target.value) }} />
                <a href={`/page_gen_client/${slug}`}>
                    <button className="p-2 bg-slate-800 text-white rounded-md">Create Page</button>
                </a>
                {pages.data == undefined ? <></> :
                    <div className="my-2">
                        <h1>Already generated pages:</h1>
                        {pages.data.map((page: any) => (
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
                }
            </div>
        </div>
    )
}