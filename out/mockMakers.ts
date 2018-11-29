export const makeHogeMock = (
    payload: { [key in keyof Hoge]?: Hoge[key] } = {}
  ): Hoge => {
  return Object.assign({}, {
      hoge: 'this is mock string',
      flg: (Math.random() < 0.5),
      num: 45
    }, payload)
}

export const makeUserMock = (
    payload: { [key in keyof User]?: User[key] } = {}
  ): User => {
  return Object.assign({}, {
      name: '山田 太郎',
      isAuthenticated: (Math.random() < 0.5),
      age: 45,
      tags: new Array(3).toString().split(',').map(() => 'this is mock string'),
      childs: new Array(3).toString().split(',').map(() => Object.assign({}, makeChildMock()))
    }, payload)
}

export const makeChildMock = (
    payload: { [key in keyof Child]?: Child[key] } = {}
  ): Child => {
  return Object.assign({}, {
      name: 'this is mock string',
      age: 1
    }, payload)
}