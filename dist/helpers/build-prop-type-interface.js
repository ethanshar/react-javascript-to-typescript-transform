"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
/**
 * Build props interface from propTypes object
 * @example
 * {
 *   foo: React.PropTypes.string.isRequired
 * }
 *
 * becomes
 * {
 *  foo: string;
 * }
 * @param objectLiteral
 */
function buildInterfaceFromPropTypeObjectLiteral(objectLiteral) {
    var members = objectLiteral.properties
        // We only need to process PropertyAssignment:
        // {
        //    a: 123     // PropertyAssignment
        // }
        //
        // filter out:
        // {
        //   a() {},     // MethodDeclaration
        //   b,          // ShorthandPropertyAssignment
        //   ...c,       // SpreadAssignment
        //   get d() {}, // AccessorDeclaration
        // }
        .filter(ts.isPropertyAssignment)
        // Ignore children, React types have it
        .filter(function (property) { return property.name.getText() !== 'children'; })
        .map(function (propertyAssignment) {
        var name = propertyAssignment.name.getText();
        var initializer = propertyAssignment.initializer;
        var isRequired = isPropTypeRequired(initializer);
        var typeExpression = isRequired
            ? // We have guaranteed the type in `isPropTypeRequired()`
                initializer.expression
            : initializer;
        var typeValue = getTypeFromReactPropTypeExpression(typeExpression);
        return ts.createPropertySignature([], name, isRequired ? undefined : ts.createToken(ts.SyntaxKind.QuestionToken), typeValue, undefined);
    });
    return ts.createTypeLiteralNode(members);
}
exports.buildInterfaceFromPropTypeObjectLiteral = buildInterfaceFromPropTypeObjectLiteral;
/**
 * Turns React.PropTypes.* into TypeScript type value
 *
 * @param node React propTypes value
 */
function getTypeFromReactPropTypeExpression(node) {
    var result = null;
    if (ts.isPropertyAccessExpression(node)) {
        /**
         * PropTypes.array,
         * PropTypes.bool,
         * PropTypes.func,
         * PropTypes.number,
         * PropTypes.object,
         * PropTypes.string,
         * PropTypes.symbol, (ignore)
         * PropTypes.node,
         * PropTypes.element,
         * PropTypes.any,
         */
        var text = node.getText().replace(/React\.PropTypes\./, '');
        if (/string/.test(text)) {
            result = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        }
        else if (/any/.test(text)) {
            result = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
        }
        else if (/array/.test(text)) {
            result = ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
        }
        else if (/bool/.test(text)) {
            result = ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
        }
        else if (/number/.test(text)) {
            result = ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
        }
        else if (/object/.test(text)) {
            result = ts.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword);
        }
        else if (/node/.test(text)) {
            result = ts.createTypeReferenceNode('React.ReactNode', []);
        }
        else if (/element/.test(text)) {
            result = ts.createTypeReferenceNode('JSX.Element', []);
        }
        else if (/func/.test(text)) {
            var arrayOfAny = ts.createParameter([], [], ts.createToken(ts.SyntaxKind.DotDotDotToken), 'args', undefined, ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined);
            result = ts.createFunctionTypeNode([], [arrayOfAny], ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
        }
    }
    else if (ts.isCallExpression(node)) {
        /**
         * PropTypes.instanceOf(), (ignore)
         * PropTypes.oneOf(), // only support oneOf([1, 2]), oneOf(['a', 'b'])
         * PropTypes.oneOfType(),
         * PropTypes.arrayOf(),
         * PropTypes.objectOf(),
         * PropTypes.shape(),
         */
        var text = node.expression.getText();
        if (/oneOf$/.test(text)) {
            var argument = node.arguments[0];
            if (ts.isArrayLiteralExpression(argument)) {
                if (argument.elements.every(function (elm) { return ts.isStringLiteral(elm) || ts.isNumericLiteral(elm); })) {
                    result = ts.createUnionTypeNode(argument.elements.map(function (elm) {
                        return ts.createLiteralTypeNode(elm);
                    }));
                }
            }
        }
        else if (/oneOfType$/.test(text)) {
            var argument = node.arguments[0];
            if (ts.isArrayLiteralExpression(argument)) {
                result = ts.createUnionOrIntersectionTypeNode(ts.SyntaxKind.UnionType, argument.elements.map(function (elm) { return getTypeFromReactPropTypeExpression(elm); }));
            }
        }
        else if (/arrayOf$/.test(text)) {
            var argument = node.arguments[0];
            if (argument) {
                result = ts.createArrayTypeNode(getTypeFromReactPropTypeExpression(argument));
            }
        }
        else if (/objectOf$/.test(text)) {
            var argument = node.arguments[0];
            if (argument) {
                result = ts.createTypeLiteralNode([
                    ts.createIndexSignature(undefined, undefined, [
                        ts.createParameter(undefined, undefined, undefined, 'key', undefined, ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)),
                    ], getTypeFromReactPropTypeExpression(argument)),
                ]);
            }
        }
        else if (/shape$/.test(text)) {
            var argument = node.arguments[0];
            if (ts.isObjectLiteralExpression(argument)) {
                return buildInterfaceFromPropTypeObjectLiteral(argument);
            }
        }
    }
    /**
     * customProp,
     * anything others
     */
    if (result === null) {
        result = ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }
    return result;
}
/**
 * Decide if node is required
 * @param node React propTypes member node
 */
function isPropTypeRequired(node) {
    if (!ts.isPropertyAccessExpression(node))
        return false;
    var text = node.getText().replace(/React\.PropTypes\./, '');
    return /\.isRequired/.test(text);
}
//# sourceMappingURL=build-prop-type-interface.js.map