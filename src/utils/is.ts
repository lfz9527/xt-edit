/**
 * 判断是否为 Mac 电脑
 * @returns
 */
export function isMac(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac')
  )
}

/**
 * 检查值是否是有效数字（不是空、未定义或NaN）
 * @param值-要检查的值
 * @返回布尔值，指示该值是否是有效数字
 */
export function isValidPosition(pos: number | null | undefined): pos is number {
  return typeof pos === 'number' && pos >= 0
}
