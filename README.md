# tomock
tomock generate mocker functions from type definition

## example
```bash
yarn install
yarn run build
yarn run tomock-generate @types/** ./out
```

### in (@types/index.d.ts)

```typescript
interface Hoge {
  hoge: string
  /** default: random */
  flg: boolean
  /** default: 45 */
  num: number
}
```

### run command
```bash
yarn run tomock-generate @types/** ./out
```

### out

```typescript
export const makeHogeMock = (
    payload: { [key in keyof Hoge]?: Hoge[key] } = {}
  ): Hoge => {
  return Object.assign({}, {
      hoge: 'this is mock string',
      flg: (Math.random() < 0.5),
      num: 45
    }, payload)
}
```
