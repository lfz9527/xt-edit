import { normalizePath } from 'vite'
import { isPackageExists } from 'local-pkg'
import chokidar from 'chokidar'

import type { Options, strAll, Alias, Path } from './types'
import { config } from './constants'
import { logger, toArray, split, toCamelCase, toRelative } from './utils'
import { resolve } from 'path'
import { getDirectories, writeLog, writeConfig } from './fs'

export class Generator {
  // 配置项
  readonly options: Options
  // 完整路径
  readonly fullPath: string

  public aliases: Alias[] = []
  public directories = new Set<string>()
  public paths: Path = {}

  constructor(
    public readonly serverMode: string,
    options?: Partial<Options>
  ) {
    // 合并配置
    this.options = Object.assign({}, config, options)
    // 设置日志
    logger.level = this.options.silent ? -999 : 3
    // 设置完整路径
    this.fullPath = normalizePath(resolve(this.options.root, this.options.dir))
    this.detectTypescript()

    // 只在开发模式下监听文件变化
    if (serverMode === 'serve') {
      this.observe()
    }
  }
  /**
   * 检查是否安装了ts
   */
  detectTypescript() {
    this.options.dts =
      this.options.dts ||
      isPackageExists(`${this.options.root}/node_modules/typescript`) ||
      isPackageExists('typescript')
    logger.info(
      this.options.dts ? 'TypeScript 已安装' : 'TypeScript 未安装只能使用js'
    )
  }
  // 监听文件变化
  observe() {
    const watcher = chokidar.watch(this.fullPath, {
      // 忽略初次扫描已有文件的事件，只监听新增/修改/删除
      ignoreInitial: true,
      // 设置递归深度
      depth: this.options.depth,
    })
    watcher
      .on('addDir', (path) => {
        this.addAlias(path)
        writeLog(this, 'add')
        writeConfig(this, 'add')
        logger.info(`生成新路径: ${path}`)
      })
      .on('unlinkDir', (path) => {
        this.removeAlias(path)
        writeLog(this, 'remove')
        writeConfig(this, 'remove')
        logger.info(`移除路径: ${path}`)
      })
  }
  // 检查重复路径
  checkForDuplicates(
    initialPath: string,
    folders: string[],
    uniqueFolders: string[]
  ) {
    if (folders.length !== uniqueFolders.length) {
      const duplicateFolders = [...folders].sort().filter((f, i, self) => {
        if (self[i + 1] === self[i]) {
          return f
        }
      })

      logger.warn(
        `Path: '${initialPath}' 包含多个同名文件夹: ${duplicateFolders.toString()}.`
      )
    }
  }
  // 添加别名
  addAlias(path: strAll) {
    const paths = toArray<string>(path)
    paths.forEach((p) => {
      const correctedPath = normalizePath(p)
      const folders = split(
        correctedPath.replace(this.fullPath, this.options.dir),
        '/'
      ).filter(Boolean)
      const lastDir = folders.slice(-1)[0]
      let key = `${this.options.prefix}${lastDir}`

      // 路径去重
      const uniqueFolders = [...new Set(folders)] as string[]
      this.checkForDuplicates(correctedPath, folders, uniqueFolders)

      if (this.aliases.some((a) => a.find === key)) {
        logger.warn(
          '生成了重复的别名，请修复文件夹结构，或启用 adjustDuplicates。'
        )

        if (this.options.adjustDuplicates && this.options.depth > 1) {
          const name = folders
            .filter(
              (f) => !split(normalizePath(this.options.dir), '/').includes(f)
            )
            .join('-')
          key = `${this.options.prefix}${toCamelCase(name)}`
        }
      }

      // 创建全局别名
      if (lastDir === this.options.dir && this.options.createGlobalAlias) {
        key = `${this.options.prefix}`
      }
      this.directories.add(p)
      this.aliases.push({
        find: `${key}`,
        replacement: `${p}`,
      })

      const configPath = this.options.useAbsolute
        ? correctedPath
        : toRelative(correctedPath, this.options.dir)

      if (this.options.useIndexes) {
        this.paths[key] = [configPath]
      } else {
        this.paths[`${key}/*`] = [`${configPath}/*`]
      }
    })
  }
  // 移除别名
  removeAlias(path: strAll) {
    toArray(path).forEach((p) => {
      const correctedPath = normalizePath(p)

      if (this.directories.has(correctedPath)) {
        this.directories.delete(correctedPath)
        this.aliases = this.aliases.filter(
          (a) => a.replacement != correctedPath
        )
        this.paths = Object.fromEntries(
          Object.entries(this.paths).filter((configPath: any) => {
            return (
              configPath[1][0].slice(0, -2) !=
              (this.options.useIndexes ? correctedPath : `${correctedPath}/*`)
            )
          })
        )
      }
    })
  }
  /**
   * Glob 模式匹配目录和文件
   */
  private searched: boolean = false
  async init() {
    if (this.searched) {
      return
    }
    await getDirectories(this)

    // 如果配置允许，就给整个项目添加一个全局别名
    if (this.options.createGlobalAlias) {
      this.addAlias(this.fullPath)
    }

    // 开始写入日志
    writeLog(this)

    // 写入配置
    writeConfig(this)

    this.searched = true
  }
}
