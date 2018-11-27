export const makeTestObjMock = (payload):TestObj => {
  return Object.assign({}, {
      randomBool: (Math.random() < 0.5),
      myString: 'this is mock string',
      name: '山田 太郎',
      price: 300.0,
      num: 1,
      strArr: new Array(3).map(() => 'this is mock string'),
      numArr: new Array(3).map(() => 1),
      child: Object.assign({}, makeTestChildMock()),
      childArr: new Array(3).map(() => Object.assign({}, makeTestChildMock()))
    }, payload)
}

export const makeTestChildMock = (payload):TestChild => {
  return Object.assign({}, {
      TestChildNum: 1,
      nullableStr: 'this is mock string'
    }, payload)
}