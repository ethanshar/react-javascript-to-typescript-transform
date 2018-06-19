import * as ts from 'typescript';
export * from './build-prop-type-interface';
/**
 * If a class declaration a react class?
 * @param classDeclaration
 * @param typeChecker
 */
export declare function isReactComponent(classDeclaration: ts.ClassDeclaration, typeChecker: ts.TypeChecker): boolean;
/**
 * Determine if a ts.HeritageClause is React HeritageClause
 *
 * @example `extends React.Component<{}, {}>` is a React HeritageClause
 *
 * @todo: this is lazy. Use the typeChecker instead
 * @param clause
 */
export declare function isReactHeritageClause(clause: ts.HeritageClause): boolean;
/**
 * Return true if a statement is a React propType assignment statement
 * @example
 * SomeComponent.propTypes = { foo: React.PropTypes.string };
 * @param statement
 */
export declare function isReactPropTypeAssignmentStatement(statement: ts.Statement): statement is ts.ExpressionStatement;
/**
 * Does class member have a "static" member?
 * @param classMember
 */
export declare function hasStaticModifier(classMember: ts.ClassElement): boolean;
/**
 * Is class member a React "propTypes" member?
 * @param classMember
 * @param sourceFile
 */
export declare function isPropTypesMember(classMember: ts.ClassElement, sourceFile: ts.SourceFile): boolean;
/**
 * Get component name off of a propType assignment statement
 * @param propTypeAssignment
 * @param sourceFile
 */
export declare function getComponentName(propTypeAssignment: ts.Statement, sourceFile: ts.SourceFile): string;
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
export declare function convertReactStatelessFunctionToArrowFunction(statelessFunc: ts.FunctionDeclaration | ts.VariableStatement): ts.VariableStatement;
/**
 * Insert an item in middle of an array after a specific item
 * @param collection
 * @param afterItem
 * @param newItem
 */
export declare function insertAfter<T>(collection: ArrayLike<T>, afterItem: T, newItem: T): T[];
/**
 * Insert an item in middle of an array before a specific item
 * @param collection
 * @param beforeItem
 * @param newItem
 */
export declare function insertBefore<T>(collection: ArrayLike<T>, beforeItem: T, newItems: T | T[]): T[];
/**
 * Replace an item in a collection with another item
 * @param collection
 * @param item
 * @param newItem
 */
export declare function replaceItem<T>(collection: ArrayLike<T>, item: T, newItem: T): T[];
/**
 * Remove an item from a collection
 * @param collection
 * @param item
 * @param newItem
 */
export declare function removeItem<T>(collection: ArrayLike<T>, item: T): T[];
