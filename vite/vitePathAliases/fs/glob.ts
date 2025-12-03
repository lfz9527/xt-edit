import fg from 'fast-glob'
import type { Generator } from '../generator'
import { logger } from '../utils'

/**
 * 返回全部文件路径
 * @param options
 */

export async function getDirectories(gen: Generator) {
  const { dir, root, deep, depth } = gen.options

  // 同步获取目录列表
  const directories = await fg.sync(deep ? `${dir}/**/*` : `${dir}/*`, {
    ignore: ['node_modules'],
    onlyDirectories: true,
    cwd: root,
    deep: depth,
    absolute: true,
  })

  if (!directories.length) {
    logger.error(new Error('未找到任何目录!'))
  }

  gen.addAlias(directories)
}
