import { type Editor, useCurrentEditor, useEditorState } from '@tiptap/react'
import { useMemo } from 'react'

/**
 * 一个用于获取 Tiptap 编辑器实例的 Hook。
 *
 * 接收一个可选的编辑器实例作为参数；如果未提供，则回退到从 Tiptap 上下文中获取编辑器（如果可用）。
 * 这使得组件既可以在直接传入编辑器实例时正常工作，也可以在 Tiptap 编辑器上下文内使用。
 *
 * @param providedEditor - 可选的编辑器实例，用于替代上下文中的编辑器
 * @returns 优先返回传入的编辑器实例，若未提供则返回上下文中的编辑器（以可用者为准）
 */
export default function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor['state']
  canCommand?: Editor['can']
} {
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = useMemo(
    () => providedEditor || coreEditor,
    [providedEditor, coreEditor]
  )

  const editorState = useEditorState({
    editor: mainEditor,
    selector(context) {
      if (!context.editor) {
        return {
          editor: null,
          editorState: undefined,
          canCommand: undefined,
        }
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      }
    },
  })

  return editorState || { editor: null }
}
