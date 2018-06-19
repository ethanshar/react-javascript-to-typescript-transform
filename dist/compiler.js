"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var fs = require("fs");
var ts = require("typescript");
var chalk_1 = require("chalk");
var _ = require("lodash");
var prettier = require("prettier");
var detectIndent = require("detect-indent");
var DEFAULT_COMPILATION_OPTIONS = {
    ignorePrettierErrors: false,
};
exports.DEFAULT_COMPILATION_OPTIONS = DEFAULT_COMPILATION_OPTIONS;
/**
 * Compile and return result TypeScript
 * @param filePath Path to file to compile
 */
function compile(filePath, factoryFactories, incomingPrettierOptions, compilationOptions) {
    if (incomingPrettierOptions === void 0) { incomingPrettierOptions = {}; }
    if (compilationOptions === void 0) { compilationOptions = DEFAULT_COMPILATION_OPTIONS; }
    var compilerOptions = {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.ES2015,
    };
    var program = ts.createProgram([filePath], compilerOptions);
    // `program.getSourceFiles()` will include those imported files,
    // like: `import * as a from './file-a'`.
    // We should only transform current file.
    var sourceFiles = program.getSourceFiles().filter(function (sf) { return sf.fileName === filePath; });
    var typeChecker = program.getTypeChecker();
    var result = ts.transform(sourceFiles, factoryFactories.map(function (factoryFactory) { return factoryFactory(typeChecker); }, compilerOptions));
    if (result.diagnostics && result.diagnostics.length) {
        console.log(chalk_1.default.yellow("\n        ======================= Diagnostics for " + filePath + " =======================\n        "));
        try {
            for (var _a = __values(result.diagnostics), _b = _a.next(); !_b.done; _b = _a.next()) {
                var diag = _b.value;
                if (diag.file && diag.start) {
                    var pos = diag.file.getLineAndCharacterOfPosition(diag.start);
                    console.log("(" + pos.line + ", " + pos.character + ") " + diag.messageText);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    var printer = ts.createPrinter();
    // TODO: fix the index 0 access... What if program have multiple source files?
    var printed = printer.printNode(ts.EmitHint.SourceFile, result.transformed[0], sourceFiles[0]);
    var inputSource = fs.readFileSync(filePath, 'utf-8');
    var prettierOptions = getPrettierOptions(filePath, inputSource, incomingPrettierOptions);
    try {
        return prettier.format(printed, prettierOptions);
    }
    catch (prettierError) {
        if (compilationOptions.ignorePrettierErrors) {
            console.warn("Prettier failed for " + filePath + " (ignorePrettierErrors is on):");
            console.warn(prettierError);
            return printed;
        }
        throw prettierError;
    }
    var e_1, _c;
}
exports.compile = compile;
/**
 * Get Prettier options based on style of a JavaScript
 * @param filePath Path to source file
 * @param source Body of a JavaScript
 * @param options Existing prettier option
 */
function getPrettierOptions(filePath, source, options) {
    var resolvedOptions = prettier.resolveConfig.sync(filePath);
    if (resolvedOptions) {
        _.defaults(resolvedOptions, options);
        return resolvedOptions;
    }
    var _a = detectIndent(source), indentAmount = _a.amount, indentType = _a.type;
    var sourceWidth = getCodeWidth(source, 80);
    var semi = getUseOfSemi(source);
    var quotations = getQuotation(source);
    _.defaults(Object.assign({}, options), {
        tabWidth: indentAmount,
        useTabs: indentType && indentType === 'tab',
        printWidth: sourceWidth,
        semi: semi,
        singleQuote: quotations === 'single',
    });
    return options;
}
exports.getPrettierOptions = getPrettierOptions;
/**
 * Given body of a source file, return its code width
 * @param source
 */
function getCodeWidth(source, defaultWidth) {
    return source.split(os.EOL).reduce(function (result, line) { return Math.max(result, line.length); }, defaultWidth);
}
/**
 * Detect if a source file is using semicolon
 * @todo: use an actual parser. This is not a proper implementation
 * @param source
 * @return true if code is using semicolons
 */
function getUseOfSemi(source) {
    return source.indexOf(';') !== -1;
}
/**
 * Detect if a source file is using single quotes or double quotes
 * @todo use an actual parser. This is not a proper implementation
 * @param source
 */
function getQuotation(source) {
    var numberOfSingleQuotes = (source.match(/\'/g) || []).length;
    var numberOfDoubleQuotes = (source.match(/\"/g) || []).length;
    if (numberOfSingleQuotes > numberOfDoubleQuotes) {
        return 'single';
    }
    return 'double';
}
//# sourceMappingURL=compiler.js.map