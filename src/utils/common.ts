import { type Editor } from '@tiptap/react'
import { NodeSelection } from '@tiptap/pm/state'

import { isMac } from './is'

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
