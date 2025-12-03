declare module 'virtual:svg-icons-register' {
  const content: any
  export default content
}
declare module 'virtual:svg-icons-names' {
  const iconsNames: string[]
  export default iconsNames
}

declare namespace Global {
  // 每个类型里面的字段都变成非必填，但是可以排除某些字段
  type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

  type anyObj<V = any> = Record<string, V>
}
