import { promises as fs } from 'fs';
import { api } from '~/trpc/server';

export default async function Data(){
    const file = await fs.readFile(process.cwd() + '/src/app/data/MOCK_DATA.json', 'utf8');
    const data = JSON.parse(file);

    data.map(async (d: any) => {
        //const res = await api.post.deletePost({name: d.title})
        console.log(d.title)
    })
}