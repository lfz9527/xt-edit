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
