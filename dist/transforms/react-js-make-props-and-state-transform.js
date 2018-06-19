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
 * Get transform for transforming React code originally written in JS which does not have
 * props and state generic types
 * This transform will remove React component static "propTypes" member during transform
 */
function reactJSMakePropsAndStateInterfaceTransformFactoryFactory(typeChecker) {
    return function reactJSMakePropsAndStateInterfaceTransformFactory(context) {
        return function reactJSMakePropsAndStateInterfaceTransform(sourceFile) {
            var visited = visitSourceFile(sourceFile, typeChecker);
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
        };
    };
}
exports.reactJSMakePropsAndStateInterfaceTransformFactoryFactory = reactJSMakePropsAndStateInterfaceTransformFactoryFactory;
function visitSourceFile(sourceFile, typeChecker) {
    var newSourceFile = sourceFile;
    try {
        for (var _a = __values(sourceFile.statements), _b = _a.next(); !_b.done; _b = _a.next()) {
            var statement = _b.value;
            if (ts.isClassDeclaration(statement) && helpers.isReactComponent(statement, typeChecker)) {
                newSourceFile = visitReactClassDeclaration(statement, newSourceFile, typeChecker);
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
    return newSourceFile;
    var e_1, _c;
}
function visitReactClassDeclaration(classDeclaration, sourceFile, typeChecker) {
    if (!classDeclaration.heritageClauses || !classDeclaration.heritageClauses.length) {
        return sourceFile;
    }
    var className = classDeclaration && classDeclaration.name && classDeclaration.name.getText(sourceFile);
    var propType = getPropsTypeOfReactComponentClass(classDeclaration, sourceFile);
    var stateType = getStateTypeOfReactComponentClass(classDeclaration, typeChecker);
    var shouldMakePropTypeDeclaration = propType.members.length > 0;
    var shouldMakeStateTypeDeclaration = !isStateTypeMemberEmpty(stateType);
    var propTypeName = className + "Props";
    var stateTypeName = className + "State";
    var propTypeDeclaration = ts.createTypeAliasDeclaration([], [], propTypeName, [], propType);
    var stateTypeDeclaration = ts.createTypeAliasDeclaration([], [], stateTypeName, [], stateType);
    var propTypeRef = ts.createTypeReferenceNode(propTypeName, []);
    var stateTypeRef = ts.createTypeReferenceNode(stateTypeName, []);
    var newClassDeclaration = getNewReactClassDeclaration(classDeclaration, shouldMakePropTypeDeclaration ? propTypeRef : propType, shouldMakeStateTypeDeclaration ? stateTypeRef : stateType);
    var allTypeDeclarations = [];
    if (shouldMakePropTypeDeclaration)
        allTypeDeclarations.push(propTypeDeclaration);
    if (shouldMakeStateTypeDeclaration)
        allTypeDeclarations.push(stateTypeDeclaration);
    var statements = helpers.insertBefore(sourceFile.statements, classDeclaration, allTypeDeclarations);
    statements = helpers.replaceItem(statements, classDeclaration, newClassDeclaration);
    return ts.updateSourceFileNode(sourceFile, statements);
}
function getNewReactClassDeclaration(classDeclaration, propTypeRef, stateTypeRef) {
    if (!classDeclaration.heritageClauses || !classDeclaration.heritageClauses.length) {
        return classDeclaration;
    }
    var firstHeritageClause = classDeclaration.heritageClauses[0];
    var newFirstHeritageClauseTypes = helpers.replaceItem(firstHeritageClause.types, firstHeritageClause.types[0], ts.updateExpressionWithTypeArguments(firstHeritageClause.types[0], [propTypeRef, stateTypeRef], firstHeritageClause.types[0].expression));
    var newHeritageClauses = helpers.replaceItem(classDeclaration.heritageClauses, firstHeritageClause, ts.updateHeritageClause(firstHeritageClause, newFirstHeritageClauseTypes));
    return ts.updateClassDeclaration(classDeclaration, classDeclaration.decorators, classDeclaration.modifiers, classDeclaration.name, classDeclaration.typeParameters, newHeritageClauses, classDeclaration.members);
}
function getPropsTypeOfReactComponentClass(classDeclaration, sourceFile) {
    var staticPropTypesMember = _.find(classDeclaration.members, function (member) {
        return (ts.isPropertyDeclaration(member) &&
            helpers.hasStaticModifier(member) &&
            helpers.isPropTypesMember(member, sourceFile));
    });
    if (staticPropTypesMember !== undefined &&
        ts.isPropertyDeclaration(staticPropTypesMember) && // check to satisfy type checker
        staticPropTypesMember.initializer &&
        ts.isObjectLiteralExpression(staticPropTypesMember.initializer)) {
        return helpers.buildInterfaceFromPropTypeObjectLiteral(staticPropTypesMember.initializer);
    }
    var staticPropTypesGetterMember = _.find(classDeclaration.members, function (member) {
        return (ts.isGetAccessorDeclaration(member) &&
            helpers.hasStaticModifier(member) &&
            helpers.isPropTypesMember(member, sourceFile));
    });
    if (staticPropTypesGetterMember !== undefined &&
        ts.isGetAccessorDeclaration(staticPropTypesGetterMember) // check to satisfy typechecker
    ) {
        var returnStatement = _.find(staticPropTypesGetterMember.body.statements, function (statement) {
            return ts.isReturnStatement(statement);
        });
        if (returnStatement !== undefined &&
            ts.isReturnStatement(returnStatement) && // check to satisfy typechecker
            returnStatement.expression &&
            ts.isObjectLiteralExpression(returnStatement.expression)) {
            return helpers.buildInterfaceFromPropTypeObjectLiteral(returnStatement.expression);
        }
    }
    return ts.createTypeLiteralNode([]);
}
function getStateTypeOfReactComponentClass(classDeclaration, typeChecker) {
    var initialState = getInitialStateFromClassDeclaration(classDeclaration, typeChecker);
    var initialStateIsVoid = initialState.kind === ts.SyntaxKind.VoidKeyword;
    var collectedStateTypes = getStateLookingForSetStateCalls(classDeclaration, typeChecker);
    if (!collectedStateTypes.length && initialStateIsVoid) {
        return ts.createTypeLiteralNode([]);
    }
    if (!initialStateIsVoid) {
        collectedStateTypes.push(initialState);
    }
    return ts.createUnionOrIntersectionTypeNode(ts.SyntaxKind.IntersectionType, collectedStateTypes);
}
/**
 * Get initial state of a React component looking for state value initially set
 * @param classDeclaration
 * @param typeChecker
 */
function getInitialStateFromClassDeclaration(classDeclaration, typeChecker) {
    // initial state class member
    var initialStateMember = _.find(classDeclaration.members, function (member) {
        try {
            return ts.isPropertyDeclaration(member) && member.name && member.name.getText() === 'state';
        }
        catch (e) {
            return false;
        }
    });
    if (initialStateMember && ts.isPropertyDeclaration(initialStateMember) && initialStateMember.initializer) {
        var type = typeChecker.getTypeAtLocation(initialStateMember.initializer);
        return typeChecker.typeToTypeNode(type);
    }
    // Initial state in constructor
    var constructor = _.find(classDeclaration.members, function (member) { return member.kind === ts.SyntaxKind.Constructor; });
    if (constructor && constructor.body) {
        try {
            for (var _a = __values(constructor.body.statements), _b = _a.next(); !_b.done; _b = _a.next()) {
                var statement = _b.value;
                if (ts.isExpressionStatement(statement) &&
                    ts.isBinaryExpression(statement.expression) &&
                    statement.expression.left.getText() === 'this.state') {
                    return typeChecker.typeToTypeNode(typeChecker.getTypeAtLocation(statement.expression.right));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    // No initial state, fall back to void
    return ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    var e_2, _c;
}
/**
 * Look for setState() function calls to collect the state interface in a React class component
 * @param classDeclaration
 * @param typeChecker
 */
function getStateLookingForSetStateCalls(classDeclaration, typeChecker) {
    var typeNodes = [];
    try {
        for (var _a = __values(classDeclaration.members), _b = _a.next(); !_b.done; _b = _a.next()) {
            var member = _b.value;
            if (member && ts.isMethodDeclaration(member) && member.body) {
                lookForSetState(member.body);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return typeNodes;
    function lookForSetState(node) {
        ts.forEachChild(node, lookForSetState);
        if (ts.isExpressionStatement(node) &&
            ts.isCallExpression(node.expression) &&
            node.expression.expression.getText().match(/setState/)) {
            var type = typeChecker.getTypeAtLocation(node.expression.arguments[0]);
            typeNodes.push(typeChecker.typeToTypeNode(type));
        }
    }
    var e_3, _c;
}
function isStateTypeMemberEmpty(stateType) {
    // Only need to handle TypeLiteralNode & IntersectionTypeNode
    if (ts.isTypeLiteralNode(stateType)) {
        return stateType.members.length === 0;
    }
    if (!ts.isIntersectionTypeNode(stateType)) {
        return true;
    }
    return stateType.types.every(isStateTypeMemberEmpty);
}
//# sourceMappingURL=react-js-make-props-and-state-transform.js.map