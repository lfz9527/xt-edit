import { type Editor } from '@tiptap/react'
import type { Node as TiptapNode } from '@tiptap/pm/model'
import {
  AllSelection,
  NodeSelection,
  Selection,
  TextSelection,
} from '@tiptap/pm/state'

import { isMac, isValidPosition } from './is'

// 合并正确的类名
export const cn = (
  ...classes: (string | boolean | undefined | null)[]
): string => classes.filter(Boolean).join(' ')

export const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  command: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  backspace: 'Del',
  delete: '⌦',
  enter: '⏎',
  escape: '⎋',
  capslock: '⇪',
} as const

/**
 * 根据平台（Mac 或非 Mac）格式化快捷键
 * @param key - 要格式化的按键（例如："ctrl"、"alt"、"shift"）
 * @param isMac - 布尔值，指示当前平台是否为 Mac
 * @param capitalize - 是否将按键名称首字母大写（默认值：true）
 * @returns 格式化后的快捷键符号
 */
export const formatShortcutKey = (
  key: string,
  isMac: boolean,
  capitalize: boolean = true
) => {
  if (isMac) {
    const lowerKey = key.toLowerCase()
    return MAC_SYMBOLS[lowerKey] || (capitalize ? key.toUpperCase() : key)
  }

  return capitalize ? key.charAt(0).toUpperCase() + key.slice(1) : key
}

/**
 * 将快捷键字符串解析为格式化后的按键符号数组
 * @param shortcutKeys - 快捷键字符串（例如："ctrl-alt-shift"）
 * @param delimiter - 用于分隔按键的分隔符（默认值："-"）
 * @param capitalize - 是否将按键名称首字母大写（默认值：true）
 * @returns 格式化后的快捷键符号数组
 */
export const parseShortcutKeys = (props: {
  shortcutKeys: string | undefined
  delimiter?: string
  capitalize?: boolean
}) => {
  const { shortcutKeys, delimiter = '+', capitalize = true } = props

  if (!shortcutKeys) return []

  return shortcutKeys
    .split(delimiter)
    .map((key) => key.trim())
    .map((key) => formatShortcutKey(key, isMac(), capitalize))
}

/**
 * 判断当前选区是否包含类型名称与所提供的任一节点类型名称匹配的节点。
 * @param editor Tiptap 编辑器实例
 * @param nodeTypeNames 要进行匹配的节点类型名称列表
 * @param checkAncestorNodes 是否沿 DOM 树向上检查祖先节点的类型
 */
export function isNodeTypeSelected(
  editor: Editor | null,
  nodeTypeNames: string[] = [],
  checkAncestorNodes: boolean = false
): boolean {
  if (!editor || !editor.state.selection) return false

  const { selection } = editor.state
  if (selection.empty) return false

  // Direct node selection check
  if (selection instanceof NodeSelection) {
    const selectedNode = selection.node
    return selectedNode ? nodeTypeNames.includes(selectedNode.type.name) : false
  }

  // Depth-based ancestor node check
  if (checkAncestorNodes) {
    const { $from } = selection
    for (let depth = $from.depth; depth > 0; depth--) {
      const ancestorNode = $from.node(depth)
      if (nodeTypeNames.includes(ancestorNode.type.name)) {
        return true
      }
    }
  }

  return false
}

/**
 * 检查某个节点是否存在于编辑器的 schema 中
 * @param nodeName - 要检查的节点名称
 * @param editor - 编辑器实例
 * @returns 表示该节点是否存在于 schema 中的布尔值
 */

export const isNodeInSchema = (
  nodeName: string,
  editor: Editor | null
): boolean => {
  if (!editor?.schema) return false
  return editor.schema.spec.nodes.get(nodeName) !== undefined
}

/**
 * 检查当前选区是否完全位于类型名称包含在 `types` 列表中的节点内。
 *
 * - NodeSelection → 检查被选中的节点。
 * - Text/AllSelection → 确保选区范围 [from, to) 内的所有文本块都属于允许的类型。
 */

export function selectionWithinConvertibleTypes(
  editor: Editor,
  types: string[] = []
): boolean {
  if (!editor || types.length === 0) return false

  const { state } = editor
  const { selection } = state
  const allowed = new Set(types)

  if (selection instanceof NodeSelection) {
    const nodeType = selection.node?.type?.name
    return !!nodeType && allowed.has(nodeType)
  }

  if (selection instanceof TextSelection || selection instanceof AllSelection) {
    let valid = true
    state.doc.nodesBetween(selection.from, selection.to, (node) => {
      if (node.isTextblock && !allowed.has(node.type.name)) {
        valid = false
        return false // stop early
      }
      return valid
    })
    return valid
  }

  return false
}

/**
 * 将焦点移动到编辑器中的下一个节点
 * @param editor - 编辑器实例
 * @returns 表示焦点是否已成功移动的布尔值
 */

export function focusNextNode(editor: Editor) {
  const { state, view } = editor
  const { doc, selection } = state

  const nextSel = Selection.findFrom(selection.$to, 1, true)
  if (nextSel) {
    view.dispatch(state.tr.setSelection(nextSel).scrollIntoView())
    return true
  }

  const paragraphType = state.schema.nodes.paragraph
  if (!paragraphType) {
    console.warn('No paragraph node type found in schema.')
    return false
  }

  const end = doc.content.size
  const para = paragraphType.create()
  let tr = state.tr.insert(end, para)

  // Place the selection inside the new paragraph
  const $inside = tr.doc.resolve(end + 1)
  tr = tr.setSelection(TextSelection.near($inside)).scrollIntoView()
  view.dispatch(tr)
  return true
}

/**
 * 通过错误处理在指定位置查找节点
 * @param编辑器编辑器实例
 * @param位置文档中查找节点的位置
 * @ reports指定位置的节点，如果找不到则为空
 */
export function findNodeAtPosition(editor: Editor, position: number) {
  try {
    const node = editor.state.doc.nodeAt(position)
    if (!node) {
      console.warn(`No node found at position ${position}`)
      return null
    }
    return node
  } catch (error) {
    console.error(`Error getting node at position ${position}:`, error)
    return null
  }
}

/**
 * 查找文档中节点的位置和实例
 * @param props包含编辑器、节点（可选）和nodePos（可选）的对象
 * @param props.editor 编辑器实例
 * @param props. note要查找的节点（如果提供nodePos，则可选）
 * @param props.nodePos要查找的节点的位置（如果提供了节点，则可选）
 * @ reports一个具有位置和节点的对象，如果找不到，则为空
 */
export function findNodePosition(props: {
  editor: Editor | null
  node?: TiptapNode | null
  nodePos?: number | null
}): { pos: number; node: TiptapNode } | null {
  const { editor, node, nodePos } = props

  if (!editor || !editor.state?.doc) return null

  // 0 是有效的位置
  const hasValidNode = node !== undefined && node !== null
  const hasValidPos = isValidPosition(nodePos)

  if (!hasValidNode && !hasValidPos) {
    return null
  }

  // 如果我们有节点，首先在文档中搜索节点
  if (hasValidNode) {
    let foundPos = -1
    let foundNode: TiptapNode | null = null

    editor.state.doc.descendants((currentNode, pos) => {
      // TODO: Needed?
      // if (currentNode.type && currentNode.type.name === node!.type.name) {
      if (currentNode === node) {
        foundPos = pos
        foundNode = currentNode
        return false
      }
      return true
    })

    if (foundPos !== -1 && foundNode !== null) {
      return { pos: foundPos, node: foundNode }
    }
  }

  // 如果我们有有效位置，使用findNodeAtStatus
  if (hasValidPos) {
    const nodeAtPos = findNodeAtPosition(editor, nodePos!)
    if (nodeAtPos) {
      return { pos: nodePos!, node: nodeAtPos }
    }
  }

  return null
}
