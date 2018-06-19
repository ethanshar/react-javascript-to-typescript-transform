"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ = require("lodash");
__export(require("./build-prop-type-interface"));
/**
 * If a class declaration a react class?
 * @param classDeclaration
 * @param typeChecker
 */
function isReactComponent(classDeclaration, typeChecker) {
    // Only classes that extend React.Component
    if (!classDeclaration.heritageClauses) {
        return false;
    }
    if (classDeclaration.heritageClauses.length !== 1) {
        return false;
    }
    var firstHeritageClauses = classDeclaration.heritageClauses[0];
    if (firstHeritageClauses.token !== ts.SyntaxKind.ExtendsKeyword) {
        return false;
    }
    var expressionWithTypeArguments = firstHeritageClauses.types[0];
    if (!expressionWithTypeArguments) {
        return false;
    }
    // Try type checker and fallback to node text
    var type = typeChecker.getTypeAtLocation(expressionWithTypeArguments);
    var typeSymbol = type && type.symbol && type.symbol.name;
    if (!typeSymbol) {
        typeSymbol = expressionWithTypeArguments.expression.getText();
    }
    if (!/React\.Component|Component/.test(typeSymbol)) {
        return false;
    }
    return true;
}
exports.isReactComponent = isReactComponent;
/**
 * Determine if a ts.HeritageClause is React HeritageClause
 *
 * @example `extends React.Component<{}, {}>` is a React HeritageClause
 *
 * @todo: this is lazy. Use the typeChecker instead
 * @param clause
 */
function isReactHeritageClause(clause) {
    return (clause.token === ts.SyntaxKind.ExtendsKeyword &&
        clause.types.length === 1 &&
        ts.isExpressionWithTypeArguments(clause.types[0]) &&
        /Component/.test(clause.types[0].expression.getText()));
}
exports.isReactHeritageClause = isReactHeritageClause;
/**
 * Return true if a statement is a React propType assignment statement
 * @example
 * SomeComponent.propTypes = { foo: React.PropTypes.string };
 * @param statement
 */
function isReactPropTypeAssignmentStatement(statement) {
    return (ts.isExpressionStatement(statement) &&
        ts.isBinaryExpression(statement.expression) &&
        statement.expression.operatorToken.kind === ts.SyntaxKind.FirstAssignment &&
        ts.isPropertyAccessExpression(statement.expression.left) &&
        /\.propTypes$|\.propTypes\..+$/.test(statement.expression.left.getText()));
}
exports.isReactPropTypeAssignmentStatement = isReactPropTypeAssignmentStatement;
/**
 * Does class member have a "static" member?
 * @param classMember
 */
function hasStaticModifier(classMember) {
    if (!classMember.modifiers) {
        return false;
    }
    var staticModifier = _.find(classMember.modifiers, function (modifier) {
        return modifier.kind == ts.SyntaxKind.StaticKeyword;
    });
    return staticModifier !== undefined;
}
exports.hasStaticModifier = hasStaticModifier;
/**
 * Is class member a React "propTypes" member?
 * @param classMember
 * @param sourceFile
 */
function isPropTypesMember(classMember, sourceFile) {
    try {
        var name_1 = classMember.name !== undefined && ts.isIdentifier(classMember.name) ? classMember.name.escapedText : null;
        return name_1 === 'propTypes';
    }
    catch (e) {
        return false;
    }
}
exports.isPropTypesMember = isPropTypesMember;
/**
 * Get component name off of a propType assignment statement
 * @param propTypeAssignment
 * @param sourceFile
 */
function getComponentName(propTypeAssignment, sourceFile) {
    var text = propTypeAssignment.getText(sourceFile);
    return text.substr(0, text.indexOf('.'));
}
exports.getComponentName = getComponentName;
/**
 * Convert react stateless function to arrow function
 * @example
 * Before:
 * function Hello(message) {
 *   return <div>{message}</div>
 * }
 *
 * After:
 * const Hello = message => {
 *   return <div>{message}</div>
 * }
 */
function convertReactStatelessFunctionToArrowFunction(statelessFunc) {
    if (ts.isVariableStatement(statelessFunc))
        return statelessFunc;
    var funcName = statelessFunc.name || 'Component';
    var funcBody = statelessFunc.body || ts.createBlock([]);
    var initializer = ts.createArrowFunction(undefined, undefined, statelessFunc.parameters, undefined, undefined, funcBody);
    return ts.createVariableStatement(statelessFunc.modifiers, ts.createVariableDeclarationList([ts.createVariableDeclaration(funcName, undefined, initializer)], ts.NodeFlags.Const));
}
exports.convertReactStatelessFunctionToArrowFunction = convertReactStatelessFunctionToArrowFunction;
/**
 * Insert an item in middle of an array after a specific item
 * @param collection
 * @param afterItem
 * @param newItem
 */
function insertAfter(collection, afterItem, newItem) {
    var index = _.indexOf(collection, afterItem) + 1;
    return _.slice(collection, 0, index)
        .concat(newItem)
        .concat(_.slice(collection, index));
}
exports.insertAfter = insertAfter;
/**
 * Insert an item in middle of an array before a specific item
 * @param collection
 * @param beforeItem
 * @param newItem
 */
function insertBefore(collection, beforeItem, newItems) {
    var index = _.indexOf(collection, beforeItem);
    return _.slice(collection, 0, index)
        .concat(newItems)
        .concat(_.slice(collection, index));
}
exports.insertBefore = insertBefore;
/**
 * Replace an item in a collection with another item
 * @param collection
 * @param item
 * @param newItem
 */
function replaceItem(collection, item, newItem) {
    var index = _.indexOf(collection, item);
    return _.slice(collection, 0, index)
        .concat(newItem)
        .concat(_.slice(collection, index + 1));
}
exports.replaceItem = replaceItem;
/**
 * Remove an item from a collection
 * @param collection
 * @param item
 * @param newItem
 */
function removeItem(collection, item) {
    var index = _.indexOf(collection, item);
    return _.slice(collection, 0, index).concat(_.slice(collection, index + 1));
}
exports.removeItem = removeItem;
//# sourceMappingURL=index.js.map