import * as ts from 'typescript'
import * as fs from 'fs'
import {walkFiles} from './fileWalker'
import * as util from 'util'
const fileNames = process.argv.slice(2)
const outpath = process.argv.slice(3) || './'

const makerTemplate = (name: string, json: string) => `export const make${name}Mock = (payload):${name} => {
  return Object.assign({}, ${json}, payload)
}`

type DocConfig = {[key: string]: string}

function main() {
  const out = []
  walkFiles(fileNames, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
  }, (
    node: ts.Node,
    program: ts.Program,
    checker: ts.TypeChecker,
    childVisit: (node: ts.Node) => void) => {
    if (ts.isInterfaceDeclaration(node)) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        const name = symbol.getName()
        const json = makeMockJson(symbol, checker)
        const makerStr = makerTemplate(name, json)
        out.push(makerStr)
      }
    }
    // TODO: namespaceの対応
    // } else if (ts.isModuleDeclaration(node)) {
    //    ts.forEachChild(node, childVisit);
    // }
  })
  fs.writeFileSync(outpath + "/mockMakers.ts", out.join('\n\n'))
}

function makeMockJson(symbol: ts.Symbol, checker: ts.TypeChecker):string {
  const members = symbol.members
  const inner = []
  members.forEach((typeSymbol, key) => {
    const typeSym = checker.getTypeOfSymbolAtLocation(typeSymbol, typeSymbol.valueDeclaration!)
    const config = parseDoc(typeSymbol.getDocumentationComment(undefined))
    const typeNode = checker.typeToTypeNode(typeSym)
    const val = makeMockValue(typeNode, checker, config)
    inner.push(`${key}: ${val}`)
  })
  const innerJson = inner.join(',\n      ')
  return `{
      ${innerJson}
    }`
}

function makeMockValue(typeNode: ts.TypeNode, checker: ts.TypeChecker, config?: DocConfig): string {
  // TODO:
  // - object
  // - enum
  // - namespaced interface

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      if(typeof config['default'] === "string") {
        return `'${config['default'].replace("'", "\'")}'`
      }
      return `'this is mock string'`
      break
    case ts.SyntaxKind.NumberKeyword:
      if(config['default'] && /^[0-9\.]+$/.test(config['default']) ) {
        return `${config['default']}`
      }
      return '1'
      break
    case ts.SyntaxKind.BooleanKeyword:
      if(config['default'] === 'random') {
        return '(Math.random() < 0.5)'
      }
      if(config['default'] === 'false') {
        return 'false'
      }
      return 'true'
      break;
    case ts.SyntaxKind.ArrayType:
      if(ts.isArrayTypeNode(typeNode)) {
        const child = makeMockValue(typeNode.elementType, checker, config)
        return `new Array(3).toString().split(',').map(() => ${child})`
      } else {
        throw new Error('it is not array node')
      }
      break
    case ts.SyntaxKind.TypeReference:
      if(ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
        const name = typeNode.typeName.escapedText
        return `Object.assign({}, make${name}Mock())`
      } else {
        throw new Error('it is not type reference node')
      }
      break
  }
}

function parseDoc(doc: ts.SymbolDisplayPart[]): DocConfig {
  const config = {}
  doc.forEach((line) => {
    const result = line.text.match(/^\s*([a-z|A-Z|0-1|_-]+):\s*(.+)/)
    if(!result || result.length < 2) return
    config[result[1]] = result[2]
  })
  return config
}

main()


const checker = program.getTypeChecker();
...
const visit = (node: ts.Node) => {
  const symbol = checker.getSymbolAtLocation(node.name);
  symbol.getDocumentationComment()
}
  => [{text: "hogehoge", kind: "text"}]
