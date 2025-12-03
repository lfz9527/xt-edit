import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { normalizePath } from 'vite'

import { MODULE_NAME } from '../constants'
import type { Generator } from '../generator'
import type { Process } from '../types'
import { abort, writeJSON, logger } from '../utils'

/**
 * 创建日志文件或文件夹
 */

export async function writeLog(gen: Generator, process: Process = 'normal') {
  const { createLog, logPath } = gen.options

  if (!createLog) {
    return
  }

  const folder = normalizePath(logPath)
  const file = normalizePath(`${folder}/${MODULE_NAME}.json`)
  const data = gen.aliases

  try {
    if (!existsSync(folder)) {
      await mkdir(folder, { recursive: true })
    }
    await writeJSON(file, data, process)
  } catch (error: any) {
    logger.error(error)
    abort(`不能创建日志文件：${folder}.`)
  }
}
