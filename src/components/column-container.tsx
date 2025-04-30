import { CirclePlusIcon, Trash2 } from "lucide-react"
import { Column, Id, Task } from "../types"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMemo, useState } from "react"
import { TaskCard } from "./task-card"

interface ColumnContainerProps {
  column: Column
  tasks: Task[]
  handleDeleteColumn: (id: Id) => void
  handleUpdateColumn: (id: Id, title: string) => void

  handleCreateTask: (columnId: Id) => void
  handleDeleteTask: (taskId: Id) => void
  handleUpdateTask: (taskId: Id, content: string) => void
}

export function ColumnContainer({
  column,
  tasks,
  handleDeleteColumn,
  handleUpdateColumn,

  handleCreateTask,
  handleDeleteTask,
  handleUpdateTask,
}: ColumnContainerProps) {
  const [editMode, setEditMode] = useState(false)

  const tasksIds = useMemo(() => {
    return tasks.map(task => task.id)
  }, [tasks])

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-secondary w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col opacity-40 border border-emerald-500"
      ></div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-secondary w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
    >
      <div
        onClick={() => setEditMode(true)}
        {...attributes}
        {...listeners}
        className="bg-primary h-[60px] flex items-center justify-between cursor-grab rounded-md rounded-b-none p-3 font-bold border-secondary border-4"
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-secondary px-2 py-1 text-sm rounded-full">
            0
          </div>
          {!editMode && column.title}
          {editMode && (
            <input
              value={column.title}
              onChange={e => handleUpdateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false)
                }
              }}
              className="bg-black focus:border-emerald-500 focus:border rounded-md outline-none px-2"
            />
          )}
        </div>
        <button
          onClick={() => {
            handleDeleteColumn(column.id)
          }}
          className="bg-secondary px-1 py-2 rounded group cursor-pointer"
        >
          <Trash2 className="size-5 stroke-gray-500 group-hover:stroke-rose-500" />
        </button>
      </div>
      {/* Column task container */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              handleDeleteTask={handleDeleteTask}
              handleUpdateTask={handleUpdateTask}
            />
          ))}
        </SortableContext>
      </div>
      {/* Column Footer */}
      <div>
        <button
          onClick={() => handleCreateTask(column.id)}
          className="w-full flex gap-2 items-center border-secondary border-2 rounded-md p-4 border-x-secondary hover:text-emerald-500 hover:bg-primary active:bg-black"
        >
          <CirclePlusIcon />
          Add task
        </button>
      </div>
    </div>
  )
}