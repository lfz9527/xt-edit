import BaseEnumCls from './base'

export class Gender extends BaseEnumCls<'M' | 'F'> {
  static readonly MALE = new Gender('M', '男')
  static readonly FEMALE = new Gender('F', '女')
}
