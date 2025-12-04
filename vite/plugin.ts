import { loadEnv,type  PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { envParse, parseLoadedEnv } from 'vite-plugin-env-parse'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'
import type { ImportMetaEnv } from '../src/types/env'
import { vitePathAliases } from './vitePathAliases'

const createVitePlugin = (mode: string, isBuild = false) => {
  const viteEnv = parseLoadedEnv(loadEnv(mode, process.cwd())) as ImportMetaEnv

  const vitePlugins: PluginOption | PluginOption[] = [
    react(),
        // 自动生成 别名
    vitePathAliases({
      createGlobalAlias: true,
    }),


    // 环境变量
    envParse({
      dtsPath: 'src/types/env.d.ts',
    }),


    // 压缩gzip格式
    isBuild &&
      viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('gzip') &&
      compression(),

    // 压缩brotli格式
    isBuild &&
      viteEnv.VITE_BUILD_COMPRESS?.split(',').includes('brotli') &&
      compression({
        exclude: [/\.(br)$/, /\.(gz)$/],
        algorithm: 'brotliCompress',
      }),
    // 代码压缩
    viteEnv.VITE_BUILD_ANALYZE &&
      visualizer({
        open: true, // 打包后自动打开浏览器
        gzipSize: true, // 显示 gzip 后体积
        brotliSize: true, // 显示 brotli 后体积
        filename: 'analyze.html', // 生成的报告文件名
      }),
  ]

  return vitePlugins
}

export default createVitePlugin
