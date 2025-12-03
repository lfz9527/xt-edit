import {rimraf} from 'rimraf';

const paths = ['node_modules', 'pnpm-lock.yaml',];

paths.forEach(async (path) => {
  try {
     await rimraf(path);
     console.log(`已删除 ${path}`);
  } catch (error) {
    console.warn(`删除 ${path} 出现问题，但已忽略：`, error.message);
  }
});
