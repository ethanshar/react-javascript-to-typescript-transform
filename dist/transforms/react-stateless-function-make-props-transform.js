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
var ts = require("typescript");
var _ = require("lodash");
var helpers = require("../helpers");
/**
 * Transform react stateless components
 *
 * @example
 * Before:
 * const Hello = ({ message }) => {
 *   return <div>hello {message}</div>
 * }
 * // Or:
 * // const Hello = ({ message }) => <div>hello {message}</div>
 *
 * Hello.propTypes = {
 *   message: React.PropTypes.string,
 * }
 *
 * After:
 * Type HelloProps = {
 *   message: string;
 * }
 *
 * const Hello: React.SFC<HelloProps> = ({ message }) => {
 *   return <div>hello {message}</div>
 * }
 *
 * Hello.propTypes = {
 *   message: React.PropTypes.string,
 * }
 */
function reactStatelessFunctionMakePropsTransformFactoryFactory(typeChecker) {
    return function reactStatelessFunctionMakePropsTransformFactory(context) {
        return function reactStatelessFunctionMakePropsTransform(sourceFile) {
            var visited = visitSourceFile(sourceFile, typeChecker);
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
        };
    };
}
exports.reactStatelessFunctionMakePropsTransformFactoryFactory = reactStatelessFunctionMakePropsTransformFactoryFactory;
function visitSourceFile(sourceFile, typeChecker) {
    // Look for propType assignment statements
    var propTypeAssignments = sourceFile.statements.filter(function (statement) {
        return helpers.isReactPropTypeAssignmentStatement(statement);
    });
    var newSourceFile = sourceFile;
    var _loop_1 = function (propTypeAssignment) {
        var componentName = helpers.getComponentName(propTypeAssignment, newSourceFile);
        var funcComponent = _.find(newSourceFile.statements, function (s) {
            return ((ts.isFunctionDeclaration(s) && s.name !== undefined && s.name.getText() === componentName) ||
                (ts.isVariableStatement(s) && s.declarationList.declarations[0].name.getText() === componentName));
        }); // Type weirdness
        if (funcComponent) {
            newSourceFile = visitReactStatelessComponent(funcComponent, propTypeAssignment, newSourceFile);
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
    return newSourceFile;
    var e_1, _a;
}
function visitReactStatelessComponent(component, propTypesExpressionStatement, sourceFile) {
    var arrowFuncComponent = helpers.convertReactStatelessFunctionToArrowFunction(component);
    var componentName = arrowFuncComponent.declarationList.declarations[0].name.getText();
    var componentInitializer = arrowFuncComponent.declarationList.declarations[0].initializer;
    var propType = getPropTypesFromTypeAssignment(propTypesExpressionStatement);
    var shouldMakePropTypeDeclaration = propType.members.length > 0;
    var propTypeName = componentName + "Props";
    var propTypeDeclaration = ts.createTypeAliasDeclaration([], [], propTypeName, [], propType);
    var propTypeRef = ts.createTypeReferenceNode(propTypeName, []);
    var componentType = ts.createTypeReferenceNode(ts.createQualifiedName(ts.createIdentifier('React'), 'SFC'), [
        shouldMakePropTypeDeclaration ? propTypeRef : propType,
    ]);
    // replace component with ts stateless component
    var typedComponent = ts.createVariableStatement(arrowFuncComponent.modifiers, ts.createVariableDeclarationList([ts.createVariableDeclaration(componentName, componentType, componentInitializer)], arrowFuncComponent.declarationList.flags));
    var statements = shouldMakePropTypeDeclaration
        ? helpers.insertBefore(sourceFile.statements, component, [propTypeDeclaration])
        : sourceFile.statements;
    statements = helpers.replaceItem(statements, component, typedComponent);
    return ts.updateSourceFileNode(sourceFile, statements);
}
function getPropTypesFromTypeAssignment(propTypesExpressionStatement) {
    if (propTypesExpressionStatement !== undefined &&
        ts.isBinaryExpression(propTypesExpressionStatement.expression) &&
        ts.isObjectLiteralExpression(propTypesExpressionStatement.expression.right)) {
        return helpers.buildInterfaceFromPropTypeObjectLiteral(propTypesExpressionStatement.expression.right);
    }
    return ts.createTypeLiteralNode([]);
}
//# sourceMappingURL=react-stateless-function-make-props-transform.js.map