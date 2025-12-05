import {
  TaskItem as TiptapTaskItem,
  TaskList as TiptapTaskList,
} from '@tiptap/extension-list'

export const TaskList = TiptapTaskList

export const TaskItem = TiptapTaskItem.configure({ nested: true })
