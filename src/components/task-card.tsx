import { Trash2Icon } from "lucide-react"
import { Id, Task } from "../types"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  task: Task
  handleDeleteTask: (taskId: Id) => void
  handleUpdateTask: (taskId: Id, content: string) => void
}

export function TaskCard({ task, handleDeleteTask, handleUpdateTask }: TaskCardProps) {
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const { 
      setNodeRef, 
      attributes, 
      listeners, 
      transform, 
      transition, 
      isDragging 
    } = useSortable({
      id: task.id,
      data: {
        type: "Task",
        task
      },
      disabled: editMode
    })
  
    const style = {
      transition,
      transform: CSS.Transform.toString(transform)
    }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
    setMouseIsOver(false)
  }

  if(isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-primary h-[100px] min-h-[100px] rounded-xl border border-rose-500"
      />
    )
  }

  if(editMode) {
    return (
      <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-primary p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
    >
      <textarea
        value={task.content}
        autoFocus
        placeholder="Task content here"
        onBlur={toggleEditMode}
        onKeyDown={e => {
          if(e.key === 'Enter' && e.shiftKey) toggleEditMode()
        }}
        onChange={e => handleUpdateTask(task.id, e.target.value)}
        className="h-[90px] w-full resize-none border-none bg-transparent text-white focus:outline-none"
      >
      </textarea>
    </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className="bg-primary p-2.5 h-[100px] min-h-[100px] flex items-center text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      {mouseIsOver && (
        <button 
          onClick={() => handleDeleteTask(task.id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-secondary p-2 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        >
          <Trash2Icon className="size-5 stroke-white" />
        </button>
      )}
    </div>
  )
}
