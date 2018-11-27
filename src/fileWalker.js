"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
exports.walkFiles = (fileNames, options, visit) => {
    const program = ts.createProgram(fileNames, options);
    const checker = program.getTypeChecker();
    const visitFunc = (node) => {
        return visit(node, program, checker, visitFunc);
    };
    for (const sourceFile of program.getSourceFiles()) {
        // 対象ファイルのみ
        if (!fileNames.find((name) => !!~name.indexOf(sourceFile.fileName))) {
            continue;
        }
        ts.forEachChild(sourceFile, visitFunc);
    }
};
