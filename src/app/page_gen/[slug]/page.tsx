'use client'
import { useState } from "react"
import { api } from "~/trpc/react"

export default function Page_Gen({ params }) {
    const [content, setContent] = useState('');
    const mutation = api.post.createFile.useMutation()
    // load page from trpc query and create if it doesnt exist
    // allow adding queires to the page defined
    // give all of this information as a prompt to the generator (as before)
    // write the finished file at slug path (wait for the usechat to finish)

    const createFile = () => {
        mutation.mutate({ content })
    }


    return (
        <div>
            {JSON.stringify(params)}
            <button onClick={createFile}>
                Create file
            </button>
            <iframe src="/page_gen/out" frameBorder="1" className="border"></iframe>
        </div>
    )
}