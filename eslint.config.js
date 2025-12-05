import js from '@eslint/js'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const files = ['**/*.{js,mjs,cjs,ts,jsx,tsx}']

export default defineConfig([
  {
    ignores: ['node_modules', 'dist', 'public', 'output'],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.recommended],
    rules: {
      // 关闭对 TypeScript 注释的限制，允许使用 '// @ts-ignore' 等注释
      '@typescript-eslint/ban-ts-comment': 'off',
      // 关闭对 any 类型的限制，但在开发中尽量避免使用
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许自定义命名空间
      '@typescript-eslint/no-namespace': 'off',
      // 强制对 TypeScript 类型使用仅类型导入（type-only imports）
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'no-unused-vars': 'off',
      // 处理未使用的变量/参数
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all', // 检查所有函数参数是否被使用
          argsIgnorePattern: '^_', // 函数参数如果以下划线 _ 开头，不检查（允许未使用）
          caughtErrors: 'all', // 检查所有 catch 的错误参数
          caughtErrorsIgnorePattern: '^_', // catch 的错误参数以下划线 _ 开头时忽略
          destructuredArrayIgnorePattern: '^_', // 数组解构的元素以下划线 _ 开头时忽略
          varsIgnorePattern: '^_', // 变量以下划线 _ 开头时忽略
          ignoreRestSiblings: true, // 忽略对象解构中剩余参数未使用的情况
        },
      ],
    },
  },

  pluginReact.configs.flat.recommended,
  reactRefresh.configs.recommended,
  reactHooks.configs['recommended-latest'],
  // react 的配置
  {
    files: ['**/*.{jsx,tsx,ts}'],
    rules: {
      // 关闭prop-types
      'react/prop-types': 'off',
      // 开启React 作用域
      'react/react-in-jsx-scope': 'off',
      // 禁止在同一个文件中重复导入相同的模块。
      'no-duplicate-imports': 'error',
      // 允许不只导出组件
      'react-refresh/only-export-components': 'off',
    },
  },
  // Prettier 支持
  pluginPrettierRecommended,
])
