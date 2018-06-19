import * as prettier from 'prettier';
import { TransformFactoryFactory } from '.';
export interface CompilationOptions {
    ignorePrettierErrors: boolean;
}
declare const DEFAULT_COMPILATION_OPTIONS: CompilationOptions;
export { DEFAULT_COMPILATION_OPTIONS };
/**
 * Compile and return result TypeScript
 * @param filePath Path to file to compile
 */
export declare function compile(filePath: string, factoryFactories: TransformFactoryFactory[], incomingPrettierOptions?: prettier.Options, compilationOptions?: CompilationOptions): string;
/**
 * Get Prettier options based on style of a JavaScript
 * @param filePath Path to source file
 * @param source Body of a JavaScript
 * @param options Existing prettier option
 */
export declare function getPrettierOptions(filePath: string, source: string, options: prettier.Options): prettier.Options;
