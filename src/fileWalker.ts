import * as ts from "typescript";

export const walkFiles = (
  fileNames: string[],
  options: ts.CompilerOptions,
  visit: (node: ts.Node, program: ts.Program, checker: ts.TypeChecker, childVisit: (node: ts.Node) => void) => void) => {

  const program = ts.createProgram(fileNames, options)
  const checker = program.getTypeChecker()

  const visitFunc = (node: ts.Node) => {
    return visit(node, program, checker, visitFunc)
  }
  for (const sourceFile of program.getSourceFiles()) {
    // 対象ファイルのみ
    if(! fileNames.find((name) => !!~name.indexOf(sourceFile.fileName))) {
      continue
    }
    ts.forEachChild(sourceFile, visitFunc)
  }
}
