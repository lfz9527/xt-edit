import {
  abort,
  readJSON,
  interpretFileIndentation,
  writeJSON,
  logger,
  isEmpty,
  type Indentation
} from '../utils'
import { IDEConfig } from '../constants'
import type { Generator } from '../generator'
import type { Process } from '../types'
import { normalizePath } from 'vite'

/**
 * Creates a JS or TS Configfile
 */

export async function writeConfig(
  gen: Generator,
  process: Process = 'default'
) {
  const { root, dir, dts, useConfig, ovrConfig } = gen.options

  if (!useConfig) {
    return
  }

  const name = dts ? 'tsconfig.app' : 'tsconfig.app'
  const file = normalizePath(`${root}/${name}.json`)

  try {
    const all: [Indentation, any] = await Promise.all([
      interpretFileIndentation(file),
      readJSON(file),
    ])
    const indentation = all[0]
    let json = all[1]

    if (isEmpty(json) || isEmpty(json.compilerOptions)) {
      json = Object.assign({}, IDEConfig)
    }

    let paths = json.compilerOptions.paths || {}

    if (process === 'remove') {
      paths = Object.fromEntries(
        Object.entries(paths).filter((p: any) => {
          if (
            Object.values(gen.paths).flat().includes(p[1][0]) &&
            p[1][0].includes(dir)
          ) {
            return p
          } else if (!p[1][0].includes(dir)) {
            return p
          }
        })
      )
    }

    console.log('paths',gen.paths)

    json.compilerOptions.paths = ovrConfig
      ? gen.paths
      : { ...paths, ...gen.paths }
    await writeJSON(file, json, process, indentation)
  } catch (error) {
    logger.error(error)
    abort(`Cannot write Config: ${file}.`)
  }
}
