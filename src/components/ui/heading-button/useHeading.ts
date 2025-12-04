import { type Editor } from '@tiptap/react'
import { useState, useEffect, useCallback } from 'react'

import { NodeSelection, TextSelection } from '@tiptap/pm/state'

import {
  isNodeInSchema,
  isNodeTypeSelected,
  selectionWithinConvertibleTypes,
  findNodePosition,
  isValidPosition,
} from '@/utils'

import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from 'lucide-react'
import { useEditor } from '@/hooks'

export type Level = 1 | 2 | 3 | 4 | 5 | 6

/**
 * 标题功能的配置
 */
export interface UseHeadingConfig {
  /**
   * 实例
   */
  editor?: Editor | null
  /**
   * 标题等级
   */
  level: Level
  /**
   * 标题不可用时是否应隐藏按钮。
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * 成功切换标题后调用回调函数
   */
  onToggled?: () => void
}

export const headingIcons = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
  4: Heading4,
  5: Heading5,
  6: Heading6,
}

export const HEADING_SHORTCUT_KEYS: Record<Level, string> = {
  1: 'ctrl+alt+1',
  2: 'ctrl+alt+2',
  3: 'ctrl+alt+3',
  4: 'ctrl+alt+4',
  5: 'ctrl+alt+5',
  6: 'ctrl+alt+6',
}

// 检查当前标题是否处于激活状态
export function isHeadingActive(
  editor: Editor | null,
  level?: Level | Level[]
): boolean {
  if (!editor || !editor.isEditable) return false

  if (Array.isArray(level)) {
    return level.some((l) => editor.isActive('heading', { level: l }))
  }

  return level
    ? editor.isActive('heading', { level })
    : editor.isActive('heading')
}
/**
 * 检查当前编辑器状态下是否可以切换标题
 */
export function canToggle(
  editor: Editor | null,
  level?: Level,
  turnInto: boolean = true
): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isNodeInSchema('heading', editor) ||
    isNodeTypeSelected(editor, ['image'])
  )
    return false

  if (!turnInto) {
    return level
      ? editor.can().setNode('heading', { level })
      : editor.can().setNode('heading')
  }

  // 确保选区位于允许转换的节点内
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

  // 要么我们可以直接在当前选区设置标题，
  // 要么通过清除格式或节点来得到可设置为标题的状态。

  return level
    ? editor.can().setNode('heading', { level }) || editor.can().clearNodes()
    : editor.can().setNode('heading') || editor.can().clearNodes()
}

/**
 *  确定是否应该显示标题按钮
 */
export function shouldShowButton(props: {
  editor: Editor | null
  level?: Level | Level[]
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, level, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema('heading', editor)) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    if (Array.isArray(level)) {
      return level.some((l) => canToggle(editor, l))
    }
    return canToggle(editor, level)
  }

  return true
}

/**
 * 切换标题在编辑器
 */
export function toggleHeading(
  editor: Editor | null,
  level: Level | Level[]
): boolean {
  if (!editor || !editor.isEditable) return false

  const levels = Array.isArray(level) ? level : [level]
  const toggleLevel = levels.find((l) => canToggle(editor, l))

  if (!toggleLevel) return false

  try {
    const view = editor.view
    let state = view.state
    let tr = state.tr

    // No selection, find the cursor position
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

    // Handle NodeSelection
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

    const isActive = levels.some((l) =>
      editor.isActive('heading', { level: l })
    )

    const toggle = isActive
      ? chain.setNode('paragraph')
      : chain.setNode('heading', { level: toggleLevel })

    toggle.run()

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

export function useHeading(config: UseHeadingConfig) {
  const {
    editor: providedEditor,
    level,
    hideWhenUnavailable = false,
    onToggled,
  } = config

  const { editor } = useEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canToggleState = canToggle(editor, level)
  const isActive = isHeadingActive(editor, level)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, level, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, level, hideWhenUnavailable])

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleHeading(editor, level)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, level, onToggled])

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle: canToggleState,
    label: `标题 ${level}`,
    shortcutKeys: HEADING_SHORTCUT_KEYS[level],
    Icon: headingIcons[level],
    editor,
  }
}
