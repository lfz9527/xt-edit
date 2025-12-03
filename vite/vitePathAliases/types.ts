/**
 * 库配置选项
 */
export interface Options {
  /**
   * 项目目录的相对路径
   * @default 'src'
   */
  dir: string

  /**
   * 别名前缀符号
   * @default '~'
   */
  prefix: string

  /**
   * 是否允许搜索子目录
   * @default true
   */
  deep: boolean

  /**
   * 子目录搜索深度
   * @default 1
   */
  depth: number

  /**
   * 是否生成日志文件
   * 使用 `logPath` 可修改日志文件路径
   * @default false
   */
  createLog: boolean

  /**
   * 日志文件路径
   * @default 'src/logs'
   */
  logPath: string

  /**
   * 是否创建全局项目目录别名
   * @default true
   */
  createGlobalAlias: boolean

  /**
   * 是否将重复路径转换为驼峰命名的别名
   * @default false
   */
  adjustDuplicates: boolean

  /**
   * JS/TS 配置中使用的路径是否相对 baseUrl
   * @default false
   */
  useAbsolute: boolean

  /**
   * 是否添加独立的 index 路径
   * @default false
   */
  useIndexes: boolean

  /**
   * 是否在 IDE 配置文件中生成路径
   * 支持 JS 和 TS
   * @default true
   */
  useConfig: boolean

  /**
   * 是否覆盖配置文件中的路径
   * @default false
   */
  ovrConfig: boolean

  /**
   * 是否在 tsconfig 中生成路径
   * 与 `useConfig` 结合使用
   * Typescript 会自动检测
   * @default false
   */
  dts: boolean

  /**
   * 是否禁用终端输出
   * @default true
   */
  silent: boolean

  /**
   * Vite 项目的根路径
   * @default 'process.cwd()'
   */
  root: string
}

export interface Alias {
  find: string
  replacement: string
}

export interface Path {
  [key: string]: string[]
}

export type Process = 'add' | 'remove' | 'default' | 'normal'

export type strAll = string | string[]
