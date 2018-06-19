import * as ts from 'typescript';
export declare type Factory = ts.TransformerFactory<ts.SourceFile>;
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
export declare function reactStatelessFunctionMakePropsTransformFactoryFactory(typeChecker: ts.TypeChecker): Factory;
