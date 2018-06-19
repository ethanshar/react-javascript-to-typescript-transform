import * as ts from 'typescript';
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
export declare function buildInterfaceFromPropTypeObjectLiteral(objectLiteral: ts.ObjectLiteralExpression): ts.TypeLiteralNode;
