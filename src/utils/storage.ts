type StorageType = 'localStorage' | 'sessionStorage'

export interface StorageItem {
  // 数据
  data: any
  // 过期时间
  expire: number
  // 创建时间
  createTime: number
}

export interface IStorage {
  set(
    key: string,
    item: Global.PartialExcept<StorageItem, 'data'>
  ): Promise<void>
  get(key: string): Promise<Required<StorageItem> | null>
  remove(key: string): Promise<void>
}

/**
 * 本地存储工具类
 */
class Storage implements IStorage {
  private storage: globalThis.Storage

  constructor(type: StorageType) {
    this.storage = window[type]
  }

  /**
   * 设置本地存储
   * @param key 键
   * @param item 值
   */
  public async set(
    key: string,
    item: Global.PartialExcept<StorageItem, 'data'>
  ) {
    const data = {
      expire: 0,
      createTime: Date.now(),
      ...item,
    }
    this.storage.setItem(key, JSON.stringify(data))
  }

  /**
   * 获取本地存储
   * @param key 键
   * @returns 值
   */
  public async get(key: string) {
    const item = this.storage.getItem(key)
    if (!item) return null
    const { data, expire, createTime } = JSON.parse(item)
    // 过期时间小于当前时间，则删除
    if (expire > 0 && Date.now() - createTime > expire) {
      this.remove(key)
      return null
    }
    return { data, expire, createTime }
  }

  /**
   * 删除本地存储
   * @param key 键
   */
  public async remove(key: string) {
    this.storage.removeItem(key)
  }
}

export const localStore = new Storage('localStorage')
export const sessionStore = new Storage('sessionStorage')
