'use client'
import { useState } from "react"
import { api } from "~/trpc/react"

export default function Page_Gen({ params }) {
    const [query, setQuery] = useState('');
    const mutation = api.post.createFile.useMutation()
    const addQuery = api.post.addQuery.useMutation()
    // load page from trpc query and create if it doesnt exist
    // allow adding queires to the page defined
    // give all of this information as a prompt to the generator (as before)
    // write the finished file at slug path (wait for the usechat to finish)
    //ts query builder

    const content = `'use server'
    export default async function () {
        // 
        return <div>
            ${params.slug}
        </div>
    }
    `

    const createFile = () => {
        ///mutation.mutate({ slug: params.slug, content })
        addQuery.mutate({ slug: 'test', query })
    }

    const res = api.post.createPage.useQuery({ slug: params.slug })
    console.log(res.data)

    return (
        <div>
            {JSON.stringify(params)}
            <textarea type="text" name="query" id="" onInput={(eve) => setQuery(eve.target.value)} />
            <button onClick={createFile}>
                Create file
            </button>
            <iframe src="/page_gen/out" frameBorder="1" className="border"></iframe>
        </div>
    )
}