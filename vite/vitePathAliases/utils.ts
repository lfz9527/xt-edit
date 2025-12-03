import fs from 'node:fs/promises'
import { createConsola } from 'consola'
import { parse, stringify } from 'comment-json'
import { normalizePath } from 'vite'

import { MODULE_NAME } from './constants'

import type { Process } from './types'

export type Indentation = number | '\t'

/**
 * 将一个值或数组转换为数组
 * @param value 单个值或者数组
 * @returns 数组
 */
export function toArray<T>(value: T | T[]): T[] {
  return ([] as T[]).concat(value)
}

// 打印日志
export const logger = createConsola({
  defaults: { message: `[${MODULE_NAME}] -` },
})
export function abort(message: any) {
  throw logger.error(new Error(message))
}

export const DEFAULT_INDENTATION: Indentation = 4
export async function writeJSON(
  path: string,
  data: any,
  process: Process,
  indentation: Indentation = DEFAULT_INDENTATION
) {
  const name = path.replace(/^.*[\\/]/, '')
  const state = process === 'add' || process === 'default' ? '创建' : '更新'

  try {
    await fs.writeFile(path, stringify(data, null, indentation))
    logger.success(`File: ${name} 成功 ${state}`)
  } catch (error) {
    logger.error(`File: ${name} 不能被 ${state}.`)
    abort(error)
  }
}
/**
 * 将字符串按指定分隔符拆分为数组
 * @param str - 要拆分的字符串
 * @param separator - 分隔符
 * @returns 拆分后的字符串数组
 */
export function split(str: string, separator: string): string[] {
  return str.split(separator)
}

/**
 * 将任意字符串转换为驼峰命名
 * @param string - 要转换的字符串
 * @returns 驼峰命名后的字符串
 */

export function toCamelCase(string: string): string {
  return string
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
}

/**
 * 将绝对路径转换为相对于指定目录的相对路径
 * @param path - 绝对路径字符串
 * @param dir - 相对的起始目录名称
 * @returns 相对于 dir 的路径
 */
export function toRelative(path: string, dir: string): string {
  // 先将路径标准化，并按 '/' 拆分成数组
  let folders = split(normalizePath(path), '/')

  // 找到起始目录的位置，并截取从该目录开始到末尾的部分
  folders = folders.slice(
    folders.findIndex((f) => f === dir),
    folders.length
  )

  // 重新拼接为标准化的相对路径
  return normalizePath(`./${folders.join('/')}`)
}

// 读取json
export async function readJSON(path: string) {
  try {
    const file = (await fs.readFile(path, 'utf-8')).toString()
    logger.success(`Config: ${path} 成功读取!`)
    return parse(file)
  } catch (error) {
    logger.error(`File: ${path} 没有找到!`, error)
  }
}

export async function interpretFileIndentation(
  path: string
): Promise<Indentation> {
  const name = path.replace(/^.*[\\/]/, '')

  try {
    const content = (await fs.readFile(path, 'utf-8')).toString()
    const lines = content.split('\n')
    const secondLine = lines[1]
    let indentation: Indentation

    if (secondLine.startsWith('\t')) {
      indentation = '\t'
    } else {
      const firstNonSpaceCharacter = split(secondLine, '').findIndex(
        (char) => char !== ' '
      )

      if (firstNonSpaceCharacter === -1) {
        logger.error('无法从文件中识别缩进（未找到缩进）')
      }

      indentation = firstNonSpaceCharacter
    }

    logger.info(
      `File: 的缩进已成功解析为 (${typeof indentation === 'number' ? `${indentation} 个空格` : '制表符(tab)'}) 来自 ${name}`
    )

    return indentation
  } catch (error) {
    logger.error(`File: ${name} 的缩进解析失败.`, error)
    return DEFAULT_INDENTATION
  }
}

// 校验是否为空
export function isEmpty(value: any) {
  if (
    value === null ||
    value === undefined ||
    value === '{}' ||
    value === '' ||
    JSON.stringify(value) === '{}'
  ) {
    return true
  }

  if (
    (Array.isArray(value) && Object.keys(value).length <= 0) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return true
  }

  return false
}
