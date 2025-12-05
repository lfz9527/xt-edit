import { type Editor } from '@tiptap/react'
import { ListTodo, ListOrdered, List } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { isNodeInSchema } from '@/utils'

import { useEditor } from '@/hooks'

import {
  type ListType,
  canToggleList,
  isListActive,
  listIcons,
} from '@/components/ui/list-button'

/**
 * 列表收件箱菜单功能的配置
 */
export interface UseListDropdownMenuConfig {
  /**
   * 编辑器实例
   */
  editor?: Editor | null
  /**
   * 列表类型
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[]
  /**
   * 不能使用时是否隐藏
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export interface ListOption {
  label: string
  type: ListType
  icon: React.ElementType
}

export const listOptions: ListOption[] = [
  {
    label: '无序列表',
    type: 'bulletList',
    icon: List,
  },
  {
    label: '有序列表',
    type: 'orderedList',
    icon: ListOrdered,
  },
  {
    label: '任务列表',
    type: 'taskList',
    icon: ListTodo,
  },
]

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some((type) => canToggleList(editor, type))
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some((type) => isListActive(editor, type))
}

export function getFilteredListOptions(
  availableTypes: ListType[]
): typeof listOptions {
  return listOptions.filter(
    (option) => !option.type || availableTypes.includes(option.type)
  )
}

export function shouldShowListDropdown(params: {
  editor: Editor | null
  listTypes: ListType[]
  hideWhenUnavailable: boolean
  listInSchema: boolean
  canToggleAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params

  if (!listInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleAny
  }

  return true
}

/**
 * 从可用类型中获取当前活动的列表类型
 */
export function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[]
): ListType | undefined {
  if (!editor || !editor.isEditable) return undefined
  return availableTypes.find((type) => isListActive(editor, type))
}

export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ['bulletList', 'orderedList', 'taskList'],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)

  const listInSchema = types.some((type: string) =>
    isNodeInSchema(type, editor)
  )

  const filteredLists = useMemo(() => getFilteredListOptions(types), [types])

  const canToggleAny = canToggleAnyList(editor, types)
  const isAnyActive = isAnyListActive(editor, types)
  const activeType = getActiveListType(editor, types)
  const activeList = filteredLists.find((option) => option.type === activeType)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowListDropdown({
          editor,
          listTypes: types,
          hideWhenUnavailable,
          listInSchema,
          canToggleAny,
        })
      )
    }

    handleSelectionUpdate()

    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [canToggleAny, editor, hideWhenUnavailable, listInSchema, types])

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: '列表',
    Icon: activeList ? listIcons[activeList.type] : List,
  }
}
