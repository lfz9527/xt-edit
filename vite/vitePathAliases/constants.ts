import type { Options } from './types'

// 模块名称
export const MODULE_NAME = 'vite-path-aliases'

export const config: Required<Options> = {
  dir: 'src',

  prefix: '@',
  deep: true,
  depth: 1,

  createGlobalAlias: true,
  createLog: false,
  logPath: 'src/logs',
  adjustDuplicates: false,

  useAbsolute: false,
  useConfig: true,
  ovrConfig: false,
  useIndexes: false,

  dts: false,
  silent: true,
  root: process.cwd(),
}

export const IDEConfig = {
  compilerOptions: {
    baseUrl: '.',
    paths: {},
  },
}
