import { type Editor } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'
import { Redo2, Undo2 } from 'lucide-react'

import { useEditor } from '@/hooks'

import { isNodeTypeSelected } from '@/utils'

export type UndoRedoAction = 'undo' | 'redo'

/**
 * 历史功能的配置
 */
export interface UseUndoRedoConfig {
  /**
   * 编辑器实例
   */
  editor?: Editor | null
  /**
   * 要执行的历史操作（撤销或重做）
   */
  action: UndoRedoAction
  /**
   * 当操作不可用时，按钮是否应隐藏。
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * 操作成功执行后调用的回调函数。
   */
  onExecuted?: () => void
}

export const UNDO_REDO_SHORTCUT_KEYS: Record<UndoRedoAction, string> = {
  undo: 'mod+z',
  redo: 'mod+shift+z',
}

export const historyActionLabels: Record<UndoRedoAction, string> = {
  undo: 'Undo',
  redo: 'Redo',
}

export const historyIcons = {
  undo: Undo2,
  redo: Redo2,
}

/**
 * 检查是否可以执行历史操作（例如撤销或重做）。
 * @param editor 编辑器实例
 * @param action 撤销或重做
 * @returns
 */
export function canExecuteUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false
  if (isNodeTypeSelected(editor, ['image'])) return false

  return action === 'undo' ? editor.can().undo() : editor.can().redo()
}

/**
 * 在编辑器上执行历史操作（如撤销或重做）。
 * @param editor 编辑器实例
 * @param action 撤销或重做
 * @returns
 */
export function executeUndoRedoAction(
  editor: Editor | null,
  action: UndoRedoAction
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canExecuteUndoRedoAction(editor, action)) return false
  const chain = editor.chain().focus()
  return action === 'undo' ? chain.undo().run() : chain.redo().run()
}

/**
 * 判断是否应显示历史操作按钮
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  action: UndoRedoAction
}): boolean {
  const { editor, hideWhenUnavailable, action } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canExecuteUndoRedoAction(editor, action)
  }

  return true
}

export const useUndoRedo = (config: UseUndoRedoConfig) => {
  const {
    editor: providedEditor,
    action,
    hideWhenUnavailable = false,
    onExecuted,
  } = config

  const { editor } = useEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canExecute = canExecuteUndoRedoAction(editor, action)

  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable, action }))
    }
    handleUpdate()
    editor.on('transaction', handleUpdate)
    return () => {
      editor.off('transaction', handleUpdate)
    }
  }, [editor, hideWhenUnavailable, action])

  const handleAction = useCallback(() => {
    if (!editor) return false
    const success = executeUndoRedoAction(editor, action)
    if (success) {
      onExecuted?.()
    }
    return success
  }, [editor, action, onExecuted])

  return {
    isVisible,
    handleAction,
    canExecute,
    label: historyActionLabels[action],
    shortcutKeys: UNDO_REDO_SHORTCUT_KEYS[action],
    Icon: historyIcons[action],
  }
}
