export const makeHogeHogeMock = (payload: { [key in keyof HogeHoge]?: HogeHoge[key] } = {}): HogeHoge => {
  return Object.assign({}, {
      hoge: 'this is mock string'
    }, payload)
}

export const makeTestObjMock = (payload: { [key in keyof TestObj]?: TestObj[key] } = {}): TestObj => {
  return Object.assign({}, {
      randomBool: (Math.random() < 0.5),
      myString: 'this is mock string',
      name: '山田 太郎',
      price: 300.0,
      num: 1,
      strArr: new Array(3).toString().split(',').map(() => 'this is mock string'),
      numArr: new Array(3).toString().split(',').map(() => 1),
      child: Object.assign({}, makeTestChildMock()),
      childArr: new Array(3).toString().split(',').map(() => Object.assign({}, makeTestChildMock()))
    }, payload)
}

export const makeTestChildMock = (payload: { [key in keyof TestChild]?: TestChild[key] } = {}): TestChild => {
  return Object.assign({}, {
      TestChildNum: 1,
      nullableStr: 'this is mock string'
    }, payload)
}