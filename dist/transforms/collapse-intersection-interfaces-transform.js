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
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var _ = require("lodash");
/**
 * Collapse unnecessary intersections between type literals
 *
 * @example
 * Before:
 * type Foo = {foo: string;} & {bar: number;}
 *
 * After
 * type Foo = {foo: string; bar: number;}
 */
function collapseIntersectionInterfacesTransformFactoryFactory(typeChecker) {
    return function collapseIntersectionInterfacesTransformFactory(context) {
        return function collapseIntersectionInterfacesTransform(sourceFile) {
            var visited = ts.visitEachChild(sourceFile, visitor, context);
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
            function visitor(node) {
                if (ts.isTypeAliasDeclaration(node)) {
                    return visitTypeAliasDeclaration(node);
                }
                return node;
            }
            function visitTypeAliasDeclaration(node) {
                if (ts.isIntersectionTypeNode(node.type)) {
                    return ts.createTypeAliasDeclaration([], [], node.name.text, [], visitIntersectionTypeNode(node.type));
                }
                return node;
            }
            function visitIntersectionTypeNode(node) {
                // Only intersection of type literals can be colapsed.
                // We are currently ignoring intersections such as `{foo: string} & {bar: string} & TypeRef`
                // TODO: handle mix of type references and multiple literal types
                if (!node.types.every(function (typeNode) { return ts.isTypeLiteralNode(typeNode); })) {
                    return node;
                }
                // We need cast `node.type.types` to `ts.NodeArray<ts.TypeLiteralNode>`
                // because TypeScript can't figure out `node.type.types.every(ts.isTypeLiteralNode)`
                var types = node.types;
                // Build a map of member names to all of types found in intersectioning type literals
                // For instance {foo: string, bar: number} & { foo: number } will result in a map like this:
                // Map {
                //   'foo' => Set { 'string', 'number' },
                //   'bar' => Set { 'number' }
                // }
                var membersMap = new Map();
                // A sepecial member of type literal nodes is index signitures which don't have a name
                // We use this symbol to track it in our members map
                var INDEX_SIGNITUTRE_MEMBER = Symbol('Index signiture member');
                // Keep a reference of first index signiture member parameters. (ignore rest)
                var indexMemberParameter = null;
                // Iterate through all of type literal nodes members and add them to the members map
                types.forEach(function (typeNode) {
                    typeNode.members.forEach(function (member) {
                        if (ts.isIndexSignatureDeclaration(member)) {
                            if (member.type !== undefined) {
                                if (membersMap.has(INDEX_SIGNITUTRE_MEMBER)) {
                                    membersMap.get(INDEX_SIGNITUTRE_MEMBER).add(member.type);
                                }
                                else {
                                    indexMemberParameter = member.parameters;
                                    membersMap.set(INDEX_SIGNITUTRE_MEMBER, new Set([member.type]));
                                }
                            }
                        }
                        else if (ts.isPropertySignature(member)) {
                            if (member.type !== undefined) {
                                var memberName = member.name.getText(sourceFile);
                                // For unknown reasons, member.name.getText() is returning nothing in some cases
                                // This is probably because previous transformers did something with the AST that
                                // index of text string of member identifier is lost
                                // TODO: investigate
                                if (!memberName) {
                                    memberName = member.name.escapedText;
                                }
                                if (membersMap.has(memberName)) {
                                    membersMap.get(memberName).add(member.type);
                                }
                                else {
                                    membersMap.set(memberName, new Set([member.type]));
                                }
                            }
                        }
                    });
                });
                // Result type literal members list
                var finalMembers = [];
                try {
                    // Put together the map into a type literal that has member per each map entery and type of that
                    // member is a union of all types in vlues for that member name in members map
                    // if a member has only one type, create a simple type literal for it
                    for (var _a = __values(membersMap.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                        var _c = __read(_b.value, 2), name_1 = _c[0], types_1 = _c[1];
                        if (typeof name_1 === 'symbol') {
                            continue;
                        }
                        // if for this name there is only one type found use the first type, otherwise make a union of all types
                        var resultType = types_1.size === 1 ? Array.from(types_1)[0] : createUnionType(Array.from(types_1));
                        finalMembers.push(ts.createPropertySignature([], name_1, undefined, resultType, undefined));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                // Handle index signiture member
                if (membersMap.has(INDEX_SIGNITUTRE_MEMBER)) {
                    var indexTypes = Array.from(membersMap.get(INDEX_SIGNITUTRE_MEMBER));
                    var indexType = indexTypes[0];
                    if (indexTypes.length > 1) {
                        indexType = createUnionType(indexTypes);
                    }
                    var indexSigniture = ts.createIndexSignature([], [], indexMemberParameter, indexType);
                    finalMembers.push(indexSigniture);
                }
                // Generate one single type literal node
                return ts.createTypeLiteralNode(finalMembers);
                var e_1, _d;
            }
            /**
             * Create a union type from multiple type nodes
             * @param types
             */
            function createUnionType(types) {
                // first dedupe literal types
                // TODO: this only works if all types are primitive types like string or number
                var uniqueTypes = _.uniqBy(types, function (type) { return type.kind; });
                return ts.createUnionOrIntersectionTypeNode(ts.SyntaxKind.UnionType, uniqueTypes);
            }
        };
    };
}
exports.collapseIntersectionInterfacesTransformFactoryFactory = collapseIntersectionInterfacesTransformFactoryFactory;
//# sourceMappingURL=collapse-intersection-interfaces-transform.js.map