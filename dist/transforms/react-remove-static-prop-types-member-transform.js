"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var helpers = require("../helpers");
/**
 * Remove static propTypes
 *
 * @example
 * Before:
 * class SomeComponent extends React.Component<{foo: number;}, {bar: string;}> {
 *   static propTypes = {
 *      foo: React.PropTypes.number.isRequired,
 *   }
 * }
 *
 * After:
 * class SomeComponent extends React.Component<{foo: number;}, {bar: string;}> {}
 */
function reactRemoveStaticPropTypesMemberTransformFactoryFactory(typeChecker) {
    return function reactRemoveStaticPropTypesMemberTransformFactory(context) {
        return function reactRemoveStaticPropTypesMemberTransform(sourceFile) {
            var visited = ts.visitEachChild(sourceFile, visitor, context);
            ts.addEmitHelpers(visited, context.readEmitHelpers());
            return visited;
            function visitor(node) {
                if (ts.isClassDeclaration(node) && helpers.isReactComponent(node, typeChecker)) {
                    return ts.updateClassDeclaration(node, node.decorators, node.modifiers, node.name, node.typeParameters, ts.createNodeArray(node.heritageClauses), node.members.filter(function (member) {
                        if (ts.isPropertyDeclaration(member) &&
                            helpers.hasStaticModifier(member) &&
                            helpers.isPropTypesMember(member, sourceFile)) {
                            return false;
                        }
                        // propTypes getter
                        if (ts.isGetAccessorDeclaration(member) &&
                            helpers.hasStaticModifier(member) &&
                            helpers.isPropTypesMember(member, sourceFile)) {
                            return false;
                        }
                        return true;
                    }));
                }
                return node;
            }
        };
    };
}
exports.reactRemoveStaticPropTypesMemberTransformFactoryFactory = reactRemoveStaticPropTypesMemberTransformFactoryFactory;
//# sourceMappingURL=react-remove-static-prop-types-member-transform.js.map