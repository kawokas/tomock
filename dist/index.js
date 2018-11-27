System.register("fileWalker", ["typescript"], function (exports_1, context_1) {
    "use strict";
    var ts, walkFiles;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (ts_1) {
                ts = ts_1;
            }
        ],
        execute: function () {
            exports_1("walkFiles", walkFiles = (fileNames, options, visit) => {
                const program = ts.createProgram(fileNames, options);
                const checker = program.getTypeChecker();
                const visitFunc = (node) => {
                    return visit(node, program, checker, visitFunc);
                };
                for (const sourceFile of program.getSourceFiles()) {
                    // 対象ファイルのみ
                    if (!fileNames.find((name) => ~name.indexOf(sourceFile.fileName))) {
                        continue;
                    }
                    console.log(sourceFile.fileName);
                    ts.forEachChild(sourceFile, visitFunc);
                }
            });
        }
    };
});
System.register("mockGenerator", ["typescript", "fs", "fileWalker"], function (exports_2, context_2) {
    "use strict";
    var ts, fs, fileWalker_1, fileNames, outpath, makerTemplate;
    var __moduleName = context_2 && context_2.id;
    function main() {
        const out = [];
        fileWalker_1.walkFiles(fileNames, {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS
        }, (node, program, checker, childVisit) => {
            if (ts.isInterfaceDeclaration(node)) {
                const symbol = checker.getSymbolAtLocation(node.name);
                if (symbol) {
                    const name = symbol.getName();
                    const json = makeMockJson(symbol, checker);
                    const makerStr = makerTemplate(name, json);
                    out.push(makerStr);
                }
            }
            // TODO: namespaceの対応
            // } else if (ts.isModuleDeclaration(node)) {
            //    ts.forEachChild(node, childVisit);
            // }
        });
        fs.writeFileSync(outpath + "/mockMakers.ts", out.join('\n\n'));
    }
    function makeMockJson(symbol, checker) {
        const members = symbol.members;
        const inner = [];
        members.forEach((typeSymbol, key) => {
            const typeSym = checker.getTypeOfSymbolAtLocation(typeSymbol, typeSymbol.valueDeclaration);
            const typeNode = checker.typeToTypeNode(typeSym);
            const config = parseDoc(typeSymbol.getDocumentationComment(undefined));
            const val = makeMockValue(typeNode, checker, config);
            inner.push(`${key}: ${val}`);
        });
        const innerJson = inner.join(',\n      ');
        return `{
      ${innerJson}
    }`;
    }
    function makeMockValue(typeNode, checker, config) {
        // TODO:
        // - object
        // - enum
        // - namespaced interface
        switch (typeNode.kind) {
            case ts.SyntaxKind.StringKeyword:
                if (typeof config['default'] === "string") {
                    return `'${config['default'].replace("'", "\'")}'`;
                }
                return `'this is mock string'`;
                break;
            case ts.SyntaxKind.NumberKeyword:
                if (config['default'] && /^[0-9\.]+$/.test(config['default'])) {
                    return `${config['default']}`;
                }
                return '1';
                break;
            case ts.SyntaxKind.BooleanKeyword:
                if (config['default'] === 'random') {
                    return '(Math.random() < 0.5)';
                }
                if (config['default'] === 'false') {
                    return 'false';
                }
                return 'true';
                break;
            case ts.SyntaxKind.ArrayType:
                if (ts.isArrayTypeNode(typeNode)) {
                    const child = makeMockValue(typeNode.elementType, checker, config);
                    return `new Array(3).map(() => ${child})`;
                }
                else {
                    throw new Error('it is not array node');
                }
                break;
            case ts.SyntaxKind.TypeReference:
                if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
                    const name = typeNode.typeName.escapedText;
                    return `Object.assign({}, make${name}Mock())`;
                }
                else {
                    throw new Error('it is not type reference node');
                }
                break;
        }
    }
    function parseDoc(doc) {
        const config = {};
        doc.forEach((line) => {
            const result = line.text.match(/^\s*([a-z|A-Z|0-1|_-]+):\s*(.+)/);
            if (!result || result.length < 2)
                return;
            config[result[1]] = result[2];
        });
        return config;
    }
    return {
        setters: [
            function (ts_2) {
                ts = ts_2;
            },
            function (fs_1) {
                fs = fs_1;
            },
            function (fileWalker_1_1) {
                fileWalker_1 = fileWalker_1_1;
            }
        ],
        execute: function () {
            fileNames = process.argv.slice(2);
            outpath = process.argv.slice(3) || './';
            makerTemplate = (name, json) => `export const make${name}Mock = (payload):${name} => {
  return Object.assign({}, ${json}, payload)
}`;
            main();
            //
            // /** Generate documentation for all classes in a set of .ts files */
            // function generateDocumentation(
            //   fileNames: string[],
            //   options: ts.CompilerOptions
            // ): void {
            //   // Build a program using the set of root file names in fileNames
            //   let program = ts.createProgram(fileNames, options);
            //
            //   // Get the checker, we will use it to find more about classes
            //   let checker = program.getTypeChecker();
            //
            //   let output: DocEntry[] = [];
            //
            //   // Visit every sourceFile in the program
            //   for (const sourceFile of program.getSourceFiles()) {
            //     if (!sourceFile.isDeclarationFile) {
            //       // Walk the tree to search for classes
            //       ts.forEachChild(sourceFile, visit);
            //     }
            //   }
            //
            //   // print out the doc
            //   fs.writeFileSync("classes.json", JSON.stringify(output, undefined, 2));
            //
            //   return;
            //
            //   /** visit nodes finding exported classes */
            //   function visit(node: ts.Node) {
            //     // Only consider exported nodes
            //     if (!isNodeExported(node)) {
            //       return;
            //     }
            //
            //     if (ts.isClassDeclaration(node) && node.name) {
            //       // This is a top level class, get its symbol
            //       let symbol = checker.getSymbolAtLocation(node.name);
            //       if (symbol) {
            //         output.push(serializeClass(symbol));
            //       }
            //       // No need to walk any further, class expressions/inner declarations
            //       // cannot be exported
            //     } else if (ts.isModuleDeclaration(node)) {
            //       // This is a namespace, visit its children
            //       ts.forEachChild(node, visit);
            //     }
            //   }
            //
            //   /** Serialize a symbol into a json object */
            //   function serializeSymbol(symbol: ts.Symbol): DocEntry {
            //     return {
            //       name: symbol.getName(),
            //       documentation: ts.displayPartsToString(symbol.getDocumentationComment(undefined)),
            //       type: checker.typeToString(
            //         checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
            //       )
            //     };
            //   }
            //
            //   /** Serialize a class symbol information */
            //   function serializeClass(symbol: ts.Symbol) {
            //     let details = serializeSymbol(symbol);
            //
            //     // Get the construct signatures
            //     let constructorType = checker.getTypeOfSymbolAtLocation(
            //       symbol,
            //       symbol.valueDeclaration!
            //     );
            //     details.constructors = constructorType
            //       .getConstructSignatures()
            //       .map(serializeSignature);
            //     return details;
            //   }
            //
            //   /** Serialize a signature (call or construct) */
            //   function serializeSignature(signature: ts.Signature) {
            //     return {
            //       parameters: signature.parameters.map(serializeSymbol),
            //       returnType: checker.typeToString(signature.getReturnType()),
            //       documentation: ts.displayPartsToString(signature.getDocumentationComment(undefined))
            //     };
            //   }
            //
            //   /** True if this is visible outside this file, false otherwise */
            //   function isNodeExported(node: ts.Declaration): boolean {
            //     return (
            //       (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
            //       (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
            //     );
            //   }
            // }
            // generateDocumentation(process.argv.slice(2), {
            //   target: ts.ScriptTarget.ES5,
            //   module: ts.ModuleKind.CommonJS
            // });
        }
    };
});
//# sourceMappingURL=index.js.map