import { CirclePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import { ColumnContainer } from "./column-container";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskCard } from "./task-card";

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns])
  
  const [tasks, setTasks] = useState<Task[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

  return (
    <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] relative">
      
      <div className="flex flex-col gap-2 items-center absolute translate-x-1/2 top-8 right-1/2">
        <img src="/logo.svg" alt="Logo" className="w-20 select-none pointer-events-none" />
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  handleDeleteColumn={deleteColumn}
                  handleUpdateColumn={updateColumn}
                  
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  handleCreateTask={createTask}
                  handleDeleteTask={deleteTask}
                  handleUpdateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>

          <button
            onClick={() => createNewColumn()}
            className="h-[60px] w-[350px] min-w-[350px] flex gap-2 items-center rounded-lg cursor-pointer bg-primary border border-secondary p-4 ring-rose-500 hover:ring-2"
          >
            <CirclePlus className="size-5" />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer 
                column={activeColumn}
                handleDeleteColumn={deleteColumn}
                handleUpdateColumn={updateColumn}
                
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                handleCreateTask={createTask}
                handleDeleteTask={deleteTask}
                handleUpdateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard 
              handleUpdateTask={updateTask} 
              handleDeleteTask={deleteTask} 
              task={activeTask} 
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )

  function generateId() {
    return Math.floor(Math.random() * 10000)
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    }

    setColumns([...columns, columnToAdd])
  }

  function deleteColumn(id: Id) {
    const filteredColumn = columns.filter((col) => col.id !== id)
    setColumns(filteredColumn)

    const newTasks = tasks.filter(t => t.columnId !== id)
    setTasks(newTasks)
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
      return
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event

    if(!over) return
    const activeColumnId = active.id
    const overColumnId = over.id

    if(activeColumnId === overColumnId) return

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeColumnId)
      const overColumnIndex = columns.findIndex(col => col.id === overColumnId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event

    if(!over) return
    const activeId = active.id
    const overId = over.id

    if(activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    if(!isActiveTask) return

    if(isActiveTask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)
        const overIndex = tasks.findIndex(t => t.id === overId)

        if(tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverAColumn = over.data.current?.type === 'Column'

    if(isActiveTask && isOverAColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)

        tasks[activeIndex].columnId = overId

        return arrayMove(tasks, activeIndex, activeIndex) 
      })
    }
  }

  function updateColumn(id: Id, title: string) {
    const newColumn = columns.map((col) => {
      if (col.id !== id) return col
      return {
        ...col,
        title,
      }
    })

    setColumns(newColumn)
  }

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      content: `Task ${tasks.length + 1}`,
      columnId,
    }

    setTasks([...tasks, newTask])
  }

  function deleteTask(taskId: Id) {
    const filteredTasks = tasks.filter(task => task.id !== taskId)
    setTasks(filteredTasks)
  }

  function updateTask(id: Id, content: string) {
    const newTasks = tasks.map((task) => {
      if(task.id !== id) return task
      return { ...task, content }
    })

    setTasks(newTasks)
  }
}