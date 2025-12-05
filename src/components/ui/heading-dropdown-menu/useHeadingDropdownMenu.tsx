import { useTiptapEditor } from '@/hooks'
import type { Editor } from '@tiptap/react'
import { useState, useEffect } from 'react'

import {
  isHeadingActive,
  canToggle,
  shouldShowButton,
  headingIcons,
  type Level,
} from '@/components/ui/heading-button'

import { Heading } from 'lucide-react'

export interface UseHeadingDropdownMenuConfig {
  /**
   * 编辑器实例
   */
  editor?: Editor | null
  /**
   * Available heading levels to show in the dropdown
   * @default [1, 2, 3, 4, 5, 6]
   */
  levels?: Level[]
  /**
   * 当没有可用的标题时，是否应隐藏下拉菜单。
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export function getActiveHeadingLevel(
  editor: Editor | null,
  levels: Level[] = [1, 2, 3, 4, 5, 6]
): Level | undefined {
  if (!editor || !editor.isEditable) return undefined
  return levels.find((level) => isHeadingActive(editor, level))
}

export const useHeadingDropdownMenu = (
  config?: UseHeadingDropdownMenuConfig
) => {
  const {
    editor: providedEditor,
    levels = [1, 2, 3, 4, 5, 6],
    hideWhenUnavailable = false,
  } = config || {}
  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState(true)
  const activeLevel = getActiveHeadingLevel(editor, levels)
  const isActive = isHeadingActive(editor)
  const canToggleState = canToggle(editor)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({ editor, hideWhenUnavailable, level: levels })
      )
    }
    handleSelectionUpdate()
    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable, levels])

  return {
    isVisible,
    activeLevel,
    isActive,
    canToggle: canToggleState,
    levels,
    label: !activeLevel ? '正文' : `标题${activeLevel}`,
    Icon: activeLevel ? headingIcons[activeLevel] : Heading,
  }
}
