import type { Plugin } from 'vite'
import { Generator } from './generator'
import type { Options } from './types'
import { toArray } from './utils'

export function vitePathAliases(options: Partial<Options> = {}): Plugin {
  let gen: Generator

  return {
    name: 'vite-path-aliases',
    enforce: 'pre',
    config: async (config, { command }) => {
      gen = new Generator(command, options)
      await gen.init()
      config.resolve = {
        alias: config.resolve?.alias
          ? [...toArray(config.resolve.alias as any), ...gen.aliases]
          : gen.aliases,
      }
    },
  }
}
