"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
/**
 * Remove `import PropTypes from 'prop-types'` or
 * `import { PropTypes } from 'react'`
 *
 * @example
 * Before:
 * import PropTypes from 'prop-types'
 * import React, { PropTypes } from 'react'
 *
 * After:
 * import React from 'react'
 */
function reactRemovePropTypesImportTransformFactoryFactory(typeChecker) {
    return function reactRemovePropTypesImportTransformFactory(context) {
        return function reactRemovePropTypesImportTransform(sourceFile) {
            var visited = ts.updateSourceFileNode(sourceFile, sourceFile.statements
                .filter(function (s) {
                return !(ts.isImportDeclaration(s) &&
                    ts.isStringLiteral(s.moduleSpecifier) &&
                    s.moduleSpecifier.text === 'prop-types');
            })
                .map(updateReactImportIfNeeded));
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
        };
    };
}
exports.reactRemovePropTypesImportTransformFactoryFactory = reactRemovePropTypesImportTransformFactoryFactory;
function updateReactImportIfNeeded(statement) {
    if (!ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text !== 'react' ||
        !statement.importClause ||
        !statement.importClause.namedBindings ||
        !ts.isNamedImports(statement.importClause.namedBindings)) {
        return statement;
    }
    var namedBindings = statement.importClause.namedBindings;
    var newNamedBindingElements = namedBindings.elements.filter(function (elm) { return elm.name.text !== 'PropTypes'; });
    if (newNamedBindingElements.length === namedBindings.elements.length) {
        // Means it has no 'PropTypes' named import
        return statement;
    }
    var newImportClause = ts.updateImportClause(statement.importClause, statement.importClause.name, newNamedBindingElements.length === 0
        ? undefined
        : ts.updateNamedImports(namedBindings, newNamedBindingElements));
    return ts.updateImportDeclaration(statement, statement.decorators, statement.modifiers, newImportClause, statement.moduleSpecifier);
}
//# sourceMappingURL=react-remove-prop-types-import.js.map