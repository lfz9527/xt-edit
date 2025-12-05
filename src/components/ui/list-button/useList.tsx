import { useEffect, useState, useCallback } from 'react'
import { type Editor } from '@tiptap/react'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'

import { useEditor } from '@/hooks/index'

import { ListTodo, ListOrdered, List } from 'lucide-react'

import {
  isNodeInSchema,
  isNodeTypeSelected,
  selectionWithinConvertibleTypes,
  findNodePosition,
  isValidPosition,
} from '@/utils'

export type ListType = 'bulletList' | 'orderedList' | 'taskList'

export const LIST_SHORTCUT_KEYS: Record<ListType, string> = {
  bulletList: 'shift+ctrl+8',
  orderedList: 'shift+ctrl+7',
  taskList: 'shift+ctrl+9',
}

/**
 * 列表功能的配置
 */
export interface UseListConfig {
  /**
   * 编辑器实例
   */
  editor?: Editor | null
  /**
   * 列表类型
   */
  type: ListType
  /**
   * 不可用时是否隐藏
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * 选择列表回调
   */
  onToggled?: () => void
}

export const listIcons = {
  bulletList: List,
  orderedList: ListOrdered,
  taskList: ListTodo,
}

export const listLabels: Record<ListType, string> = {
  bulletList: '无序列表',
  orderedList: '有序列表',
  taskList: '任务列表',
}

/**
 * 检查列表是否可以在当前编辑器状态下切换
 */
export const canToggleList = (
  editor: Editor | null,
  type: ListType,
  turnInto: boolean = true
) => {
  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema(type, editor) || isNodeTypeSelected(editor, ['image']))
    return false

  if (!turnInto) {
    switch (type) {
      case 'bulletList':
        return editor.can().toggleBulletList()
      case 'orderedList':
        return editor.can().toggleOrderedList()
      case 'taskList':
        return editor.can().toggleList('taskList', 'taskItem')
      default:
        return false
    }
  }

  // 确保选择位于我们允许转换的节点中
  if (
    !selectionWithinConvertibleTypes(editor, [
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'taskList',
      'blockquote',
      'codeBlock',
    ])
  )
    return false

  //我们可以直接在选择上设置列表，
  //或者我们可以清除格式化/节点以获得列表。
  switch (type) {
    case 'bulletList':
      return editor.can().toggleBulletList() || editor.can().clearNodes()
    case 'orderedList':
      return editor.can().toggleOrderedList() || editor.can().clearNodes()
    case 'taskList':
      return (
        editor.can().toggleList('taskList', 'taskItem') ||
        editor.can().clearNodes()
      )
    default:
      return false
  }
}

/**
 * 检查列表当前是否处于活动状态
 */
export function isListActive(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false

  switch (type) {
    case 'bulletList':
      return editor.isActive('bulletList')
    case 'orderedList':
      return editor.isActive('orderedList')
    case 'taskList':
      return editor.isActive('taskList')
    default:
      return false
  }
}

/**
 * 确定是否应显示列表按钮
 * @param props
 * @returns
 */
export function shouldShowButton(props: {
  editor: Editor | null
  type: ListType
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, type, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema(type, editor)) return false
  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canToggleList(editor, type)
  }

  return true
}

// 在编辑器中切换列表
export function toggleList(editor: Editor | null, type: ListType): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleList(editor, type)) return false

  try {
    const view = editor.view
    let state = view.state
    let tr = state.tr

    // 没有选择，找到鼠标位置
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false

      tr = tr.setSelection(NodeSelection.create(state.doc, pos))
      view.dispatch(tr)
      state = view.state
    }

    const selection = state.selection

    let chain = editor.chain().focus()

    // 处理节点选择
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild
      const lastChild = selection.node.lastChild?.lastChild

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1

      const resolvedFrom = state.doc.resolve(from)
      const resolvedTo = state.doc.resolve(to)

      chain = chain
        .setTextSelection(TextSelection.between(resolvedFrom, resolvedTo))
        .clearNodes()
    }

    if (editor.isActive(type)) {
      // 打开列表
      chain
        .liftListItem('listItem')
        .lift('bulletList')
        .lift('orderedList')
        .lift('taskList')
        .run()
    } else {
      //包含特定列表类型
      const toggleMap: Record<ListType, () => typeof chain> = {
        bulletList: () => chain.toggleBulletList(),
        orderedList: () => chain.toggleOrderedList(),
        taskList: () => chain.toggleList('taskList', 'taskItem'),
      }

      const toggle = toggleMap[type]
      if (!toggle) return false

      toggle().run()
    }

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

export const useList = (config: UseListConfig) => {
  const {
    editor: providedEditor,
    type,
    hideWhenUnavailable = false,
    onToggled,
  } = config
  const { editor } = useEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)
  const canToggle = canToggleList(editor, type)
  const isActive = isListActive(editor, type)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, type, hideWhenUnavailable }))
    }

    handleSelectionUpdate()
    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, type, hideWhenUnavailable])

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleList(editor, type)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, type, onToggled])

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: listLabels[type],
    shortcutKeys: LIST_SHORTCUT_KEYS[type],
    Icon: listIcons[type],
  }
}
