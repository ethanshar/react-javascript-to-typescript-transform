"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_1 = require("./compiler");
exports.compile = compiler_1.compile;
var react_js_make_props_and_state_transform_1 = require("./transforms/react-js-make-props-and-state-transform");
exports.reactJSMakePropsAndStateInterfaceTransformFactoryFactory = react_js_make_props_and_state_transform_1.reactJSMakePropsAndStateInterfaceTransformFactoryFactory;
var react_remove_prop_types_assignment_transform_1 = require("./transforms/react-remove-prop-types-assignment-transform");
exports.reactRemovePropTypesAssignmentTransformFactoryFactory = react_remove_prop_types_assignment_transform_1.reactRemovePropTypesAssignmentTransformFactoryFactory;
var react_move_prop_types_to_class_transform_1 = require("./transforms/react-move-prop-types-to-class-transform");
exports.reactMovePropTypesToClassTransformFactoryFactory = react_move_prop_types_to_class_transform_1.reactMovePropTypesToClassTransformFactoryFactory;
var collapse_intersection_interfaces_transform_1 = require("./transforms/collapse-intersection-interfaces-transform");
exports.collapseIntersectionInterfacesTransformFactoryFactory = collapse_intersection_interfaces_transform_1.collapseIntersectionInterfacesTransformFactoryFactory;
var react_remove_static_prop_types_member_transform_1 = require("./transforms/react-remove-static-prop-types-member-transform");
exports.reactRemoveStaticPropTypesMemberTransformFactoryFactory = react_remove_static_prop_types_member_transform_1.reactRemoveStaticPropTypesMemberTransformFactoryFactory;
var react_stateless_function_make_props_transform_1 = require("./transforms/react-stateless-function-make-props-transform");
exports.reactStatelessFunctionMakePropsTransformFactoryFactory = react_stateless_function_make_props_transform_1.reactStatelessFunctionMakePropsTransformFactoryFactory;
var react_remove_prop_types_import_1 = require("./transforms/react-remove-prop-types-import");
exports.reactRemovePropTypesImportTransformFactoryFactory = react_remove_prop_types_import_1.reactRemovePropTypesImportTransformFactoryFactory;
exports.allTransforms = [
    react_move_prop_types_to_class_transform_1.reactMovePropTypesToClassTransformFactoryFactory,
    react_js_make_props_and_state_transform_1.reactJSMakePropsAndStateInterfaceTransformFactoryFactory,
    react_stateless_function_make_props_transform_1.reactStatelessFunctionMakePropsTransformFactoryFactory,
    collapse_intersection_interfaces_transform_1.collapseIntersectionInterfacesTransformFactoryFactory,
    react_remove_prop_types_assignment_transform_1.reactRemovePropTypesAssignmentTransformFactoryFactory,
    react_remove_static_prop_types_member_transform_1.reactRemoveStaticPropTypesMemberTransformFactoryFactory,
    react_remove_prop_types_import_1.reactRemovePropTypesImportTransformFactoryFactory,
];
/**
 * Run React JavaScript to TypeScript transform for file at `filePath`
 * @param filePath
 */
function run(filePath, prettierOptions, compilationOptions) {
    if (prettierOptions === void 0) { prettierOptions = {}; }
    if (compilationOptions === void 0) { compilationOptions = compiler_1.DEFAULT_COMPILATION_OPTIONS; }
    return compiler_1.compile(filePath, exports.allTransforms, prettierOptions, compilationOptions);
}
exports.run = run;
//# sourceMappingURL=index.js.map