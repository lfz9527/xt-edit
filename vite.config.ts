import createVitePlugin from './vite/plugin'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode, command }) => {
  // .env 文件配置
  const envConf = loadEnv(mode, process.cwd())
  // 是否为构建
  const isBuild = command === 'build'

  return {
    server: {
      open: true,
      host: true,
      port: 9529,
      proxy: {
        '/api': {
          target: 'http://192.168.31.163:8003',
          changeOrigin: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "@/styles/_variables.less";`,
        },
      },
    },

    plugins: createVitePlugin(mode, isBuild),
    build: {
      outDir: `output/build-${mode}`,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // 自定义资源的输出目录
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (info: Record<string, any>) => {
            const infoType = info.name ? info.name.split('.').pop() : ''
            if (infoType && /^(gif|jpe?g|png|svg)$/.test(infoType)) {
              return 'assets/[name]-[hash][extname]'
            }
            if (infoType === 'css') {
              return 'css/[name]-[hash][extname]'
            }
            if (infoType === 'ttf') {
              return 'font/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
      sourcemap: envConf.VITE_BUILD_SOURCEMAP === 'true',
    },
  }
})
