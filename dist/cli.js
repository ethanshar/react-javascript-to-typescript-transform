#!/usr/bin/env node
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
var program = require("commander");
var glob = require("glob");
var fs = require("fs");
var path = require("path");
var _1 = require(".");
function resolveGlobs(globPatterns) {
    var files = [];
    function addFile(file) {
        file = path.resolve(file);
        if (files.indexOf(file) === -1) {
            files.push(file);
        }
    }
    globPatterns.forEach(function (pattern) {
        if (/[{}*?+\[\]]/.test(pattern)) {
            // Smells like globs
            glob.sync(pattern, {}).forEach(function (file) {
                addFile(file);
            });
        }
        else {
            addFile(pattern);
        }
    });
    return files;
}
program
    .version('1.0.0')
    .option('--arrow-parens <avoid|always>', 'Include parentheses around a sole arrow function parameter.', 'avoid')
    .option('--no-bracket-spacing', 'Do not print spaces between brackets.', false)
    .option('--jsx-bracket-same-line', 'Put > on the last line instead of at a new line.', false)
    .option('--print-width <int>', 'The line length where Prettier will try wrap.', 80)
    .option('--prose-wrap <always|never|preserve> How to wrap prose. (markdown)', 'preserve')
    .option('--no-semi', 'Do not print semicolons, except at the beginning of lines which may need them', false)
    .option('--single-quote', 'Use single quotes instead of double quotes.', false)
    .option('--tab-width <int>', 'Number of spaces per indentation level.', 2)
    .option('--trailing-comma <none|es5|all>', 'Print trailing commas wherever possible when multi-line.', 'none')
    .option('--use-tabs', 'Indent with tabs instead of spaces.', false)
    .option('--ignore-prettier-errors', 'Ignore (but warn about) errors in Prettier', false)
    .option('--keep-original-files', 'Keep original files', false)
    .option('--keep-temporary-files', 'Keep temporary files', false)
    .usage('[options] <filename or glob>')
    .command('* [glob/filename...]')
    .action(function (globPatterns) {
    var prettierOptions = {
        arrowParens: program.arrowParens,
        bracketSpacing: !program.noBracketSpacing,
        jsxBracketSameLine: !!program.jsxBracketSameLine,
        printWidth: parseInt(program.printWidth, 10),
        proseWrap: program.proseWrap,
        semi: !program.noSemi,
        singleQuote: !!program.singleQuote,
        tabWidth: parseInt(program.tabWidth, 10),
        trailingComma: program.trailingComma,
        useTabs: !!program.useTabs,
    };
    var compilationOptions = {
        ignorePrettierErrors: !!program.ignorePrettierErrors,
    };
    var files = resolveGlobs(globPatterns);
    if (!files.length) {
        throw new Error('Nothing to do. You must provide file names or glob patterns to transform.');
    }
    var errors = false;
    try {
        for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
            var filePath = files_1_1.value;
            console.log("Transforming " + filePath + "...");
            var newPath = filePath.replace(/\.jsx?$/, '.tsx');
            var temporaryPath = filePath.replace(/\.jsx?$/, "_js2ts_" + +new Date() + ".tsx");
            try {
                fs.copyFileSync(filePath, temporaryPath);
                var result = _1.run(temporaryPath, prettierOptions, compilationOptions);
                fs.writeFileSync(newPath, result);
                if (!program.keepOriginalFiles) {
                    fs.unlinkSync(filePath);
                }
            }
            catch (error) {
                console.warn("Failed to convert " + filePath);
                console.warn(error);
                errors = true;
            }
            if (!program.keepTemporaryFiles) {
                if (fs.existsSync(temporaryPath)) {
                    fs.unlinkSync(temporaryPath);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (errors) {
        process.exit(1);
    }
    var e_1, _a;
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map