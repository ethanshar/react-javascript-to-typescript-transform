import * as ts from 'typescript';
export declare type Factory = ts.TransformerFactory<ts.SourceFile>;
/**
 * Remove `import PropTypes from 'prop-types'` or
 * `import { PropTypes } from 'react'`
 *
 * @example
 * Before:
 * import PropTypes from 'prop-types'
 * import React, { PropTypes } from 'react'
 *
 * After:
 * import React from 'react'
 */
export declare function reactRemovePropTypesImportTransformFactoryFactory(typeChecker: ts.TypeChecker): Factory;
