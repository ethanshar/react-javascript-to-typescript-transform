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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ = require("lodash");
var helpers = require("../helpers");
/**
 * Move Component.propTypes statements into class as a static member of the class
 * if React component is defined using a class
 *
 * Note: This transform assumes React component declaration and propTypes assignment statement
 * are both on root of the source file
 *
 * @example
 * Before:
 * class SomeComponent extends React.Component<{foo: number;}, {bar: string;}> {}
 * SomeComponent.propTypes = { foo: React.PropTypes.string }
 *
 * After
 * class SomeComponent extends React.Component<{foo: number;}, {bar: string;}> {
 *   static propTypes = { foo: React.PropTypes.string }
 * }
 *
 * @todo
 * This is not supporting multiple statements for a single class yet
 * ```
 * class SomeComponent extends React.Component<{foo: number;}, {bar: string;}> {}
 * SomeComponent.propTypes = { foo: React.PropTypes.string }
 * SomeComponent.propTypes.bar = React.PropTypes.number;
 * ```
 */
function reactMovePropTypesToClassTransformFactoryFactory(typeChecker) {
    return function reactMovePropTypesToClassTransformFactory(context) {
        return function reactMovePropTypesToClassTransform(sourceFile) {
            var visited = visitSourceFile(sourceFile, typeChecker);
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
        };
    };
}
exports.reactMovePropTypesToClassTransformFactoryFactory = reactMovePropTypesToClassTransformFactoryFactory;
/**
 * Make the move from propType statement to static member
 * @param sourceFile
 * @param typeChecker
 */
function visitSourceFile(sourceFile, typeChecker) {
    var statements = sourceFile.statements;
    // Look for propType assignment statements
    var propTypeAssignments = statements.filter(function (statement) {
        return helpers.isReactPropTypeAssignmentStatement(statement);
    });
    var _loop_1 = function (propTypeAssignment) {
        // Look for the class declarations with the same name
        var componentName = helpers.getComponentName(propTypeAssignment, sourceFile);
        var classStatement = _.find(statements, function (statement) {
            return ts.isClassDeclaration(statement) &&
                statement.name !== undefined &&
                statement.name.getText(sourceFile) === componentName;
        }); // Type weirdness
        // && helpers.isBinaryExpression(propTypeAssignment.expression) is redundant to satisfy the type checker
        if (classStatement && ts.isBinaryExpression(propTypeAssignment.expression)) {
            var newClassStatement = addStaticMemberToClass(classStatement, 'propTypes', propTypeAssignment.expression.right);
            statements = ts.createNodeArray(helpers.replaceItem(statements, classStatement, newClassStatement));
        }
    };
    try {
        for (var propTypeAssignments_1 = __values(propTypeAssignments), propTypeAssignments_1_1 = propTypeAssignments_1.next(); !propTypeAssignments_1_1.done; propTypeAssignments_1_1 = propTypeAssignments_1.next()) {
            var propTypeAssignment = propTypeAssignments_1_1.value;
            _loop_1(propTypeAssignment);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (propTypeAssignments_1_1 && !propTypeAssignments_1_1.done && (_a = propTypeAssignments_1.return)) _a.call(propTypeAssignments_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return ts.updateSourceFileNode(sourceFile, statements);
    var e_1, _a;
}
/**
 * Insert a new static member into a class
 * @param classDeclaration
 * @param name
 * @param value
 */
function addStaticMemberToClass(classDeclaration, name, value) {
    var staticModifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
    var propertyDeclaration = ts.createProperty([], [staticModifier], name, undefined, undefined, value);
    return ts.updateClassDeclaration(classDeclaration, classDeclaration.decorators, classDeclaration.modifiers, classDeclaration.name, classDeclaration.typeParameters, ts.createNodeArray(classDeclaration.heritageClauses), ts.createNodeArray(__spread([propertyDeclaration], classDeclaration.members)));
}
//# sourceMappingURL=react-move-prop-types-to-class-transform.js.map