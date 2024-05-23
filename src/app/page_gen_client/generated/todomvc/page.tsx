'use client'

import { api } from "~/trpc/react";

export default function Page() {
  const todosData = api.post.getData.useQuery({query: 'SELECT Todo { id, title, completed }'}, {onError: err => {
    console.log('error in trpc', window)
    window.err_feedback = err
  }})

  const updateTodoMutation = api.post.writeData.useMutation()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <ul>
        {todosData?.data?.map(todo => (
          <li key={todo.id} className="flex items-center justify-between mb-2">
            <span className={todo.completed ? "line-through" : ""}>{todo.title}</span>
            <button
              className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                updateTodoMutation.mutate(
                  {query: 'UPDATE Todo SET {completed := true} FILTER .id = <uuid>$todo_id', variables: {todo_id: todo.id}},
                  {onError: err => {
                    console.log('error in trpc', window)
                    window.err_feedback = err
                  }}
                )
              }}
            >
              Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}