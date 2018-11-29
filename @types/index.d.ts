interface Hoge {
  hoge: string
  /** default: random */
  flg: boolean
  /** default: 45 */
  num: number
}

interface User {
  /** default: 山田 太郎*/
  name: string
  /** default: random */
  isAuthenticated: boolean
  /** default: 45 */
  age: number
  tags: string[]
  childs: Child[]
}

interface Child {
  name: string
  age: number
}
