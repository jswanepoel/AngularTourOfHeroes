/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/transformers/inline_resources", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/metadata/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var index_1 = require("@angular/compiler-cli/src/metadata/index");
    var PRECONDITIONS_TEXT = 'angularCompilerOptions.enableResourceInlining requires all resources to be statically resolvable.';
    function getResourceLoader(host, containingFileName) {
        return {
            get: function (url) {
                if (typeof url !== 'string') {
                    throw new Error('templateUrl and stylesUrl must be string literals. ' + PRECONDITIONS_TEXT);
                }
                var fileName = host.resourceNameToFileName(url, containingFileName);
                if (fileName) {
                    var content = host.loadResource(fileName);
                    if (typeof content !== 'string') {
                        throw new Error('Cannot handle async resource. ' + PRECONDITIONS_TEXT);
                    }
                    return content;
                }
                throw new Error("Failed to resolve " + url + " from " + containingFileName + ". " + PRECONDITIONS_TEXT);
            }
        };
    }
    var InlineResourcesMetadataTransformer = /** @class */ (function () {
        function InlineResourcesMetadataTransformer(host) {
            this.host = host;
        }
        InlineResourcesMetadataTransformer.prototype.start = function (sourceFile) {
            var _this = this;
            var loader = getResourceLoader(this.host, sourceFile.fileName);
            return function (value, node) {
                if (index_1.isClassMetadata(value) && ts.isClassDeclaration(node) && value.decorators) {
                    value.decorators.forEach(function (d) {
                        if (index_1.isMetadataSymbolicCallExpression(d) &&
                            index_1.isMetadataImportedSymbolReferenceExpression(d.expression) &&
                            d.expression.module === '@angular/core' && d.expression.name === 'Component' &&
                            d.arguments) {
                            d.arguments = d.arguments.map(_this.updateDecoratorMetadata.bind(_this, loader));
                        }
                    });
                }
                return value;
            };
        };
        InlineResourcesMetadataTransformer.prototype.updateDecoratorMetadata = function (loader, arg) {
            if (arg['templateUrl']) {
                arg['template'] = loader.get(arg['templateUrl']);
                delete arg.templateUrl;
            }
            var styles = arg['styles'] || [];
            var styleUrls = arg['styleUrls'] || [];
            if (!Array.isArray(styles))
                throw new Error('styles should be an array');
            if (!Array.isArray(styleUrls))
                throw new Error('styleUrls should be an array');
            styles.push.apply(styles, tslib_1.__spread(styleUrls.map(function (styleUrl) { return loader.get(styleUrl); })));
            if (styles.length > 0) {
                arg['styles'] = styles;
                delete arg.styleUrls;
            }
            return arg;
        };
        return InlineResourcesMetadataTransformer;
    }());
    exports.InlineResourcesMetadataTransformer = InlineResourcesMetadataTransformer;
    function getInlineResourcesTransformFactory(program, host) {
        return function (context) { return function (sourceFile) {
            var loader = getResourceLoader(host, sourceFile.fileName);
            var visitor = function (node) {
                // Components are always classes; skip any other node
                if (!ts.isClassDeclaration(node)) {
                    return node;
                }
                // Decorator case - before or without decorator downleveling
                // @Component()
                var newDecorators = ts.visitNodes(node.decorators, function (node) {
                    if (isComponentDecorator(node, program.getTypeChecker())) {
                        return updateDecorator(node, loader);
                    }
                    return node;
                });
                // Annotation case - after decorator downleveling
                // static decorators: {type: Function, args?: any[]}[]
                var newMembers = ts.visitNodes(node.members, function (node) { return updateAnnotations(node, loader, program.getTypeChecker()); });
                // Create a new AST subtree with our modifications
                return ts.updateClassDeclaration(node, newDecorators, node.modifiers, node.name, node.typeParameters, node.heritageClauses || [], newMembers);
            };
            return ts.visitEachChild(sourceFile, visitor, context);
        }; };
    }
    exports.getInlineResourcesTransformFactory = getInlineResourcesTransformFactory;
    /**
     * Update a Decorator AST node to inline the resources
     * @param node the @Component decorator
     * @param loader provides access to load resources
     */
    function updateDecorator(node, loader) {
        if (!ts.isCallExpression(node.expression)) {
            // User will get an error somewhere else with bare @Component
            return node;
        }
        var expr = node.expression;
        var newArguments = updateComponentProperties(expr.arguments, loader);
        return ts.updateDecorator(node, ts.updateCall(expr, expr.expression, expr.typeArguments, newArguments));
    }
    /**
     * Update an Annotations AST node to inline the resources
     * @param node the static decorators property
     * @param loader provides access to load resources
     * @param typeChecker provides access to symbol table
     */
    function updateAnnotations(node, loader, typeChecker) {
        // Looking for a member of this shape:
        // PropertyDeclaration called decorators, with static modifier
        // Initializer is ArrayLiteralExpression
        // One element is the Component type, its initializer is the @angular/core Component symbol
        // One element is the component args, its initializer is the Component arguments to change
        // e.g.
        //   static decorators: {type: Function, args?: any[]}[] =
        //   [{
        //     type: Component,
        //     args: [{
        //       templateUrl: './my.component.html',
        //       styleUrls: ['./my.component.css'],
        //     }],
        //   }];
        if (!ts.isPropertyDeclaration(node) || // ts.ModifierFlags.Static &&
            !ts.isIdentifier(node.name) || node.name.text !== 'decorators' || !node.initializer ||
            !ts.isArrayLiteralExpression(node.initializer)) {
            return node;
        }
        var newAnnotations = node.initializer.elements.map(function (annotation) {
            // No-op if there's a non-object-literal mixed in the decorators values
            if (!ts.isObjectLiteralExpression(annotation))
                return annotation;
            var decoratorType = annotation.properties.find(function (p) { return isIdentifierNamed(p, 'type'); });
            // No-op if there's no 'type' property, or if it's not initialized to the Component symbol
            if (!decoratorType || !ts.isPropertyAssignment(decoratorType) ||
                !ts.isIdentifier(decoratorType.initializer) ||
                !isComponentSymbol(decoratorType.initializer, typeChecker)) {
                return annotation;
            }
            var newAnnotation = annotation.properties.map(function (prop) {
                // No-op if this isn't the 'args' property or if it's not initialized to an array
                if (!isIdentifierNamed(prop, 'args') || !ts.isPropertyAssignment(prop) ||
                    !ts.isArrayLiteralExpression(prop.initializer))
                    return prop;
                var newDecoratorArgs = ts.updatePropertyAssignment(prop, prop.name, ts.createArrayLiteral(updateComponentProperties(prop.initializer.elements, loader)));
                return newDecoratorArgs;
            });
            return ts.updateObjectLiteral(annotation, newAnnotation);
        });
        return ts.updateProperty(node, node.decorators, node.modifiers, node.name, node.questionToken, node.type, ts.updateArrayLiteral(node.initializer, newAnnotations));
    }
    function isIdentifierNamed(p, name) {
        return !!p.name && ts.isIdentifier(p.name) && p.name.text === name;
    }
    /**
     * Check that the node we are visiting is the actual Component decorator defined in @angular/core.
     */
    function isComponentDecorator(node, typeChecker) {
        if (!ts.isCallExpression(node.expression)) {
            return false;
        }
        var callExpr = node.expression;
        var identifier;
        if (ts.isIdentifier(callExpr.expression)) {
            identifier = callExpr.expression;
        }
        else {
            return false;
        }
        return isComponentSymbol(identifier, typeChecker);
    }
    function isComponentSymbol(identifier, typeChecker) {
        // Only handle identifiers, not expressions
        if (!ts.isIdentifier(identifier))
            return false;
        // NOTE: resolver.getReferencedImportDeclaration would work as well but is internal
        var symbol = typeChecker.getSymbolAtLocation(identifier);
        if (!symbol || !symbol.declarations || !symbol.declarations.length) {
            console.error("Unable to resolve symbol '" + identifier.text + "' in the program, does it type-check?");
            return false;
        }
        var declaration = symbol.declarations[0];
        if (!declaration || !ts.isImportSpecifier(declaration)) {
            return false;
        }
        var name = (declaration.propertyName || declaration.name).text;
        // We know that parent pointers are set because we created the SourceFile ourselves.
        // The number of parent references here match the recursion depth at this point.
        var moduleId = declaration.parent.parent.parent.moduleSpecifier.text;
        return moduleId === '@angular/core' && name === 'Component';
    }
    /**
     * For each property in the object literal, if it's templateUrl or styleUrls, replace it
     * with content.
     * @param node the arguments to @Component() or args property of decorators: [{type:Component}]
     * @param loader provides access to the loadResource method of the host
     * @returns updated arguments
     */
    function updateComponentProperties(args, loader) {
        if (args.length !== 1) {
            // User should have gotten a type-check error because @Component takes one argument
            return args;
        }
        var componentArg = args[0];
        if (!ts.isObjectLiteralExpression(componentArg)) {
            // User should have gotten a type-check error because @Component takes an object literal
            // argument
            return args;
        }
        var newProperties = [];
        var newStyleExprs = [];
        componentArg.properties.forEach(function (prop) {
            if (!ts.isPropertyAssignment(prop) || ts.isComputedPropertyName(prop.name)) {
                newProperties.push(prop);
                return;
            }
            switch (prop.name.text) {
                case 'styles':
                    if (!ts.isArrayLiteralExpression(prop.initializer)) {
                        throw new Error('styles takes an array argument');
                    }
                    newStyleExprs.push.apply(newStyleExprs, tslib_1.__spread(prop.initializer.elements));
                    break;
                case 'styleUrls':
                    if (!ts.isArrayLiteralExpression(prop.initializer)) {
                        throw new Error('styleUrls takes an array argument');
                    }
                    newStyleExprs.push.apply(newStyleExprs, tslib_1.__spread(prop.initializer.elements.map(function (expr) {
                        if (!ts.isStringLiteral(expr) && !ts.isNoSubstitutionTemplateLiteral(expr)) {
                            throw new Error('Can only accept string literal arguments to styleUrls. ' + PRECONDITIONS_TEXT);
                        }
                        var styles = loader.get(expr.text);
                        return ts.createLiteral(styles);
                    })));
                    break;
                case 'templateUrl':
                    if (!ts.isStringLiteral(prop.initializer) &&
                        !ts.isNoSubstitutionTemplateLiteral(prop.initializer)) {
                        throw new Error('Can only accept a string literal argument to templateUrl. ' + PRECONDITIONS_TEXT);
                    }
                    var template = loader.get(prop.initializer.text);
                    newProperties.push(ts.updatePropertyAssignment(prop, ts.createIdentifier('template'), ts.createLiteral(template)));
                    break;
                default:
                    newProperties.push(prop);
            }
        });
        // Add the non-inline styles
        if (newStyleExprs.length > 0) {
            var newStyles = ts.createPropertyAssignment(ts.createIdentifier('styles'), ts.createArrayLiteral(newStyleExprs));
            newProperties.push(newStyles);
        }
        return ts.createNodeArray([ts.updateObjectLiteral(componentArg, newProperties)]);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lX3Jlc291cmNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL2lubGluZV9yZXNvdXJjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLGtFQUFnSztJQUloSyxJQUFNLGtCQUFrQixHQUNwQixtR0FBbUcsQ0FBQztJQVl4RywyQkFBMkIsSUFBbUIsRUFBRSxrQkFBMEI7UUFDeEUsTUFBTSxDQUFDO1lBQ0wsR0FBRyxFQUFILFVBQUksR0FBMkI7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELEdBQUcsa0JBQWtCLENBQUMsQ0FBQztnQkFDOUYsQ0FBQztnQkFBQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3hFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ2IsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDNUMsRUFBRSxDQUFDLENBQUMsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN6RSxDQUFDO29CQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBcUIsR0FBRyxjQUFTLGtCQUFrQixVQUFLLGtCQUFvQixDQUFDLENBQUM7WUFDbEcsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQ7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Q0FBQyxXQUFXLENBQUM7d0JBQ3JDLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELE1BQU0sSUFBSSxLQUFLLENBQ1gsNERBQTRELEdBQUcsa0JBQWtCLENBQUMsQ0FBQztvQkFDekYsQ0FBQztvQkFDRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25ELGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUMxQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4RSxLQUFLLENBQUM7Z0JBRVI7b0JBQ0UsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCw0QkFBNEI7UUFDNUIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FDekMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7TWV0YWRhdGFPYmplY3QsIE1ldGFkYXRhVmFsdWUsIGlzQ2xhc3NNZXRhZGF0YSwgaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb259IGZyb20gJy4uL21ldGFkYXRhL2luZGV4JztcblxuaW1wb3J0IHtNZXRhZGF0YVRyYW5zZm9ybWVyLCBWYWx1ZVRyYW5zZm9ybX0gZnJvbSAnLi9tZXRhZGF0YV9jYWNoZSc7XG5cbmNvbnN0IFBSRUNPTkRJVElPTlNfVEVYVCA9XG4gICAgJ2FuZ3VsYXJDb21waWxlck9wdGlvbnMuZW5hYmxlUmVzb3VyY2VJbmxpbmluZyByZXF1aXJlcyBhbGwgcmVzb3VyY2VzIHRvIGJlIHN0YXRpY2FsbHkgcmVzb2x2YWJsZS4nO1xuXG4vKiogQSBzdWJzZXQgb2YgbWVtYmVycyBmcm9tIEFvdENvbXBpbGVySG9zdCAqL1xuZXhwb3J0IHR5cGUgUmVzb3VyY2VzSG9zdCA9IHtcbiAgcmVzb3VyY2VOYW1lVG9GaWxlTmFtZShyZXNvdXJjZU5hbWU6IHN0cmluZywgY29udGFpbmluZ0ZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xuICBsb2FkUmVzb3VyY2UocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+fCBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBTdGF0aWNSZXNvdXJjZUxvYWRlciA9IHtcbiAgZ2V0KHVybDogc3RyaW5nIHwgTWV0YWRhdGFWYWx1ZSk6IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIGdldFJlc291cmNlTG9hZGVyKGhvc3Q6IFJlc291cmNlc0hvc3QsIGNvbnRhaW5pbmdGaWxlTmFtZTogc3RyaW5nKTogU3RhdGljUmVzb3VyY2VMb2FkZXIge1xuICByZXR1cm4ge1xuICAgIGdldCh1cmw6IHN0cmluZyB8IE1ldGFkYXRhVmFsdWUpOiBzdHJpbmd7XG4gICAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0ZW1wbGF0ZVVybCBhbmQgc3R5bGVzVXJsIG11c3QgYmUgc3RyaW5nIGxpdGVyYWxzLiAnICsgUFJFQ09ORElUSU9OU19URVhUKTtcbiAgICAgIH0gY29uc3QgZmlsZU5hbWUgPSBob3N0LnJlc291cmNlTmFtZVRvRmlsZU5hbWUodXJsLCBjb250YWluaW5nRmlsZU5hbWUpO1xuICAgICAgaWYgKGZpbGVOYW1lKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBob3N0LmxvYWRSZXNvdXJjZShmaWxlTmFtZSk7XG4gICAgICAgIGlmICh0eXBlb2YgY29udGVudCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYW5kbGUgYXN5bmMgcmVzb3VyY2UuICcgKyBQUkVDT05ESVRJT05TX1RFWFQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgfSB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byByZXNvbHZlICR7dXJsfSBmcm9tICR7Y29udGFpbmluZ0ZpbGVOYW1lfS4gJHtQUkVDT05ESVRJT05TX1RFWFR9YCk7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgSW5saW5lUmVzb3VyY2VzTWV0YWRhdGFUcmFuc2Zvcm1lciBpbXBsZW1lbnRzIE1ldGFkYXRhVHJhbnNmb3JtZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGhvc3Q6IFJlc291cmNlc0hvc3QpIHt9XG5cbiAgc3RhcnQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IFZhbHVlVHJhbnNmb3JtfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgbG9hZGVyID0gZ2V0UmVzb3VyY2VMb2FkZXIodGhpcy5ob3N0LCBzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICByZXR1cm4gKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSA9PiB7XG4gICAgICBpZiAoaXNDbGFzc01ldGFkYXRhKHZhbHVlKSAmJiB0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSkgJiYgdmFsdWUuZGVjb3JhdG9ycykge1xuICAgICAgICB2YWx1ZS5kZWNvcmF0b3JzLmZvckVhY2goZCA9PiB7XG4gICAgICAgICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKGQpICYmXG4gICAgICAgICAgICAgIGlzTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24oZC5leHByZXNzaW9uKSAmJlxuICAgICAgICAgICAgICBkLmV4cHJlc3Npb24ubW9kdWxlID09PSAnQGFuZ3VsYXIvY29yZScgJiYgZC5leHByZXNzaW9uLm5hbWUgPT09ICdDb21wb25lbnQnICYmXG4gICAgICAgICAgICAgIGQuYXJndW1lbnRzKSB7XG4gICAgICAgICAgICBkLmFyZ3VtZW50cyA9IGQuYXJndW1lbnRzLm1hcCh0aGlzLnVwZGF0ZURlY29yYXRvck1ldGFkYXRhLmJpbmQodGhpcywgbG9hZGVyKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlRGVjb3JhdG9yTWV0YWRhdGEobG9hZGVyOiBTdGF0aWNSZXNvdXJjZUxvYWRlciwgYXJnOiBNZXRhZGF0YU9iamVjdCk6IE1ldGFkYXRhT2JqZWN0IHtcbiAgICBpZiAoYXJnWyd0ZW1wbGF0ZVVybCddKSB7XG4gICAgICBhcmdbJ3RlbXBsYXRlJ10gPSBsb2FkZXIuZ2V0KGFyZ1sndGVtcGxhdGVVcmwnXSk7XG4gICAgICBkZWxldGUgYXJnLnRlbXBsYXRlVXJsO1xuICAgIH1cblxuICAgIGNvbnN0IHN0eWxlcyA9IGFyZ1snc3R5bGVzJ10gfHwgW107XG4gICAgY29uc3Qgc3R5bGVVcmxzID0gYXJnWydzdHlsZVVybHMnXSB8fCBbXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3R5bGVzKSkgdGhyb3cgbmV3IEVycm9yKCdzdHlsZXMgc2hvdWxkIGJlIGFuIGFycmF5Jyk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN0eWxlVXJscykpIHRocm93IG5ldyBFcnJvcignc3R5bGVVcmxzIHNob3VsZCBiZSBhbiBhcnJheScpO1xuXG4gICAgc3R5bGVzLnB1c2goLi4uc3R5bGVVcmxzLm1hcChzdHlsZVVybCA9PiBsb2FkZXIuZ2V0KHN0eWxlVXJsKSkpO1xuICAgIGlmIChzdHlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgYXJnWydzdHlsZXMnXSA9IHN0eWxlcztcbiAgICAgIGRlbGV0ZSBhcmcuc3R5bGVVcmxzO1xuICAgIH1cblxuICAgIHJldHVybiBhcmc7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElubGluZVJlc291cmNlc1RyYW5zZm9ybUZhY3RvcnkoXG4gICAgcHJvZ3JhbTogdHMuUHJvZ3JhbSwgaG9zdDogUmVzb3VyY2VzSG9zdCk6IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPiB7XG4gIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4ge1xuICAgIGNvbnN0IGxvYWRlciA9IGdldFJlc291cmNlTG9hZGVyKGhvc3QsIHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgIGNvbnN0IHZpc2l0b3I6IHRzLlZpc2l0b3IgPSBub2RlID0+IHtcbiAgICAgIC8vIENvbXBvbmVudHMgYXJlIGFsd2F5cyBjbGFzc2VzOyBza2lwIGFueSBvdGhlciBub2RlXG4gICAgICBpZiAoIXRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cblxuICAgICAgLy8gRGVjb3JhdG9yIGNhc2UgLSBiZWZvcmUgb3Igd2l0aG91dCBkZWNvcmF0b3IgZG93bmxldmVsaW5nXG4gICAgICAvLyBAQ29tcG9uZW50KClcbiAgICAgIGNvbnN0IG5ld0RlY29yYXRvcnMgPSB0cy52aXNpdE5vZGVzKG5vZGUuZGVjb3JhdG9ycywgKG5vZGU6IHRzLkRlY29yYXRvcikgPT4ge1xuICAgICAgICBpZiAoaXNDb21wb25lbnREZWNvcmF0b3Iobm9kZSwgcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpKSkge1xuICAgICAgICAgIHJldHVybiB1cGRhdGVEZWNvcmF0b3Iobm9kZSwgbG9hZGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBbm5vdGF0aW9uIGNhc2UgLSBhZnRlciBkZWNvcmF0b3IgZG93bmxldmVsaW5nXG4gICAgICAvLyBzdGF0aWMgZGVjb3JhdG9yczoge3R5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W119W11cbiAgICAgIGNvbnN0IG5ld01lbWJlcnMgPSB0cy52aXNpdE5vZGVzKFxuICAgICAgICAgIG5vZGUubWVtYmVycyxcbiAgICAgICAgICAobm9kZTogdHMuQ2xhc3NFbGVtZW50KSA9PiB1cGRhdGVBbm5vdGF0aW9ucyhub2RlLCBsb2FkZXIsIHByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKSkpO1xuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgQVNUIHN1YnRyZWUgd2l0aCBvdXIgbW9kaWZpY2F0aW9uc1xuICAgICAgcmV0dXJuIHRzLnVwZGF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgICAgbm9kZSwgbmV3RGVjb3JhdG9ycywgbm9kZS5tb2RpZmllcnMsIG5vZGUubmFtZSwgbm9kZS50eXBlUGFyYW1ldGVycyxcbiAgICAgICAgICBub2RlLmhlcml0YWdlQ2xhdXNlcyB8fCBbXSwgbmV3TWVtYmVycyk7XG4gICAgfTtcblxuICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChzb3VyY2VGaWxlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgYSBEZWNvcmF0b3IgQVNUIG5vZGUgdG8gaW5saW5lIHRoZSByZXNvdXJjZXNcbiAqIEBwYXJhbSBub2RlIHRoZSBAQ29tcG9uZW50IGRlY29yYXRvclxuICogQHBhcmFtIGxvYWRlciBwcm92aWRlcyBhY2Nlc3MgdG8gbG9hZCByZXNvdXJjZXNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlRGVjb3JhdG9yKG5vZGU6IHRzLkRlY29yYXRvciwgbG9hZGVyOiBTdGF0aWNSZXNvdXJjZUxvYWRlcik6IHRzLkRlY29yYXRvciB7XG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pKSB7XG4gICAgLy8gVXNlciB3aWxsIGdldCBhbiBlcnJvciBzb21ld2hlcmUgZWxzZSB3aXRoIGJhcmUgQENvbXBvbmVudFxuICAgIHJldHVybiBub2RlO1xuICB9XG4gIGNvbnN0IGV4cHIgPSBub2RlLmV4cHJlc3Npb247XG4gIGNvbnN0IG5ld0FyZ3VtZW50cyA9IHVwZGF0ZUNvbXBvbmVudFByb3BlcnRpZXMoZXhwci5hcmd1bWVudHMsIGxvYWRlcik7XG4gIHJldHVybiB0cy51cGRhdGVEZWNvcmF0b3IoXG4gICAgICBub2RlLCB0cy51cGRhdGVDYWxsKGV4cHIsIGV4cHIuZXhwcmVzc2lvbiwgZXhwci50eXBlQXJndW1lbnRzLCBuZXdBcmd1bWVudHMpKTtcbn1cblxuLyoqXG4gKiBVcGRhdGUgYW4gQW5ub3RhdGlvbnMgQVNUIG5vZGUgdG8gaW5saW5lIHRoZSByZXNvdXJjZXNcbiAqIEBwYXJhbSBub2RlIHRoZSBzdGF0aWMgZGVjb3JhdG9ycyBwcm9wZXJ0eVxuICogQHBhcmFtIGxvYWRlciBwcm92aWRlcyBhY2Nlc3MgdG8gbG9hZCByZXNvdXJjZXNcbiAqIEBwYXJhbSB0eXBlQ2hlY2tlciBwcm92aWRlcyBhY2Nlc3MgdG8gc3ltYm9sIHRhYmxlXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUFubm90YXRpb25zKFxuICAgIG5vZGU6IHRzLkNsYXNzRWxlbWVudCwgbG9hZGVyOiBTdGF0aWNSZXNvdXJjZUxvYWRlcixcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiB0cy5DbGFzc0VsZW1lbnQge1xuICAvLyBMb29raW5nIGZvciBhIG1lbWJlciBvZiB0aGlzIHNoYXBlOlxuICAvLyBQcm9wZXJ0eURlY2xhcmF0aW9uIGNhbGxlZCBkZWNvcmF0b3JzLCB3aXRoIHN0YXRpYyBtb2RpZmllclxuICAvLyBJbml0aWFsaXplciBpcyBBcnJheUxpdGVyYWxFeHByZXNzaW9uXG4gIC8vIE9uZSBlbGVtZW50IGlzIHRoZSBDb21wb25lbnQgdHlwZSwgaXRzIGluaXRpYWxpemVyIGlzIHRoZSBAYW5ndWxhci9jb3JlIENvbXBvbmVudCBzeW1ib2xcbiAgLy8gT25lIGVsZW1lbnQgaXMgdGhlIGNvbXBvbmVudCBhcmdzLCBpdHMgaW5pdGlhbGl6ZXIgaXMgdGhlIENvbXBvbmVudCBhcmd1bWVudHMgdG8gY2hhbmdlXG4gIC8vIGUuZy5cbiAgLy8gICBzdGF0aWMgZGVjb3JhdG9yczoge3R5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W119W10gPVxuICAvLyAgIFt7XG4gIC8vICAgICB0eXBlOiBDb21wb25lbnQsXG4gIC8vICAgICBhcmdzOiBbe1xuICAvLyAgICAgICB0ZW1wbGF0ZVVybDogJy4vbXkuY29tcG9uZW50Lmh0bWwnLFxuICAvLyAgICAgICBzdHlsZVVybHM6IFsnLi9teS5jb21wb25lbnQuY3NzJ10sXG4gIC8vICAgICB9XSxcbiAgLy8gICB9XTtcbiAgaWYgKCF0cy5pc1Byb3BlcnR5RGVjbGFyYXRpb24obm9kZSkgfHwgIC8vIHRzLk1vZGlmaWVyRmxhZ3MuU3RhdGljICYmXG4gICAgICAhdHMuaXNJZGVudGlmaWVyKG5vZGUubmFtZSkgfHwgbm9kZS5uYW1lLnRleHQgIT09ICdkZWNvcmF0b3JzJyB8fCAhbm9kZS5pbml0aWFsaXplciB8fFxuICAgICAgIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihub2RlLmluaXRpYWxpemVyKSkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY29uc3QgbmV3QW5ub3RhdGlvbnMgPSBub2RlLmluaXRpYWxpemVyLmVsZW1lbnRzLm1hcChhbm5vdGF0aW9uID0+IHtcbiAgICAvLyBOby1vcCBpZiB0aGVyZSdzIGEgbm9uLW9iamVjdC1saXRlcmFsIG1peGVkIGluIHRoZSBkZWNvcmF0b3JzIHZhbHVlc1xuICAgIGlmICghdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihhbm5vdGF0aW9uKSkgcmV0dXJuIGFubm90YXRpb247XG5cbiAgICBjb25zdCBkZWNvcmF0b3JUeXBlID0gYW5ub3RhdGlvbi5wcm9wZXJ0aWVzLmZpbmQocCA9PiBpc0lkZW50aWZpZXJOYW1lZChwLCAndHlwZScpKTtcblxuICAgIC8vIE5vLW9wIGlmIHRoZXJlJ3Mgbm8gJ3R5cGUnIHByb3BlcnR5LCBvciBpZiBpdCdzIG5vdCBpbml0aWFsaXplZCB0byB0aGUgQ29tcG9uZW50IHN5bWJvbFxuICAgIGlmICghZGVjb3JhdG9yVHlwZSB8fCAhdHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQoZGVjb3JhdG9yVHlwZSkgfHxcbiAgICAgICAgIXRzLmlzSWRlbnRpZmllcihkZWNvcmF0b3JUeXBlLmluaXRpYWxpemVyKSB8fFxuICAgICAgICAhaXNDb21wb25lbnRTeW1ib2woZGVjb3JhdG9yVHlwZS5pbml0aWFsaXplciwgdHlwZUNoZWNrZXIpKSB7XG4gICAgICByZXR1cm4gYW5ub3RhdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBuZXdBbm5vdGF0aW9uID0gYW5ub3RhdGlvbi5wcm9wZXJ0aWVzLm1hcChwcm9wID0+IHtcbiAgICAgIC8vIE5vLW9wIGlmIHRoaXMgaXNuJ3QgdGhlICdhcmdzJyBwcm9wZXJ0eSBvciBpZiBpdCdzIG5vdCBpbml0aWFsaXplZCB0byBhbiBhcnJheVxuICAgICAgaWYgKCFpc0lkZW50aWZpZXJOYW1lZChwcm9wLCAnYXJncycpIHx8ICF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wKSB8fFxuICAgICAgICAgICF0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24ocHJvcC5pbml0aWFsaXplcikpXG4gICAgICAgIHJldHVybiBwcm9wO1xuXG4gICAgICBjb25zdCBuZXdEZWNvcmF0b3JBcmdzID0gdHMudXBkYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICAgIHByb3AsIHByb3AubmFtZSxcbiAgICAgICAgICB0cy5jcmVhdGVBcnJheUxpdGVyYWwodXBkYXRlQ29tcG9uZW50UHJvcGVydGllcyhwcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzLCBsb2FkZXIpKSk7XG5cbiAgICAgIHJldHVybiBuZXdEZWNvcmF0b3JBcmdzO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRzLnVwZGF0ZU9iamVjdExpdGVyYWwoYW5ub3RhdGlvbiwgbmV3QW5ub3RhdGlvbik7XG4gIH0pO1xuXG4gIHJldHVybiB0cy51cGRhdGVQcm9wZXJ0eShcbiAgICAgIG5vZGUsIG5vZGUuZGVjb3JhdG9ycywgbm9kZS5tb2RpZmllcnMsIG5vZGUubmFtZSwgbm9kZS5xdWVzdGlvblRva2VuLCBub2RlLnR5cGUsXG4gICAgICB0cy51cGRhdGVBcnJheUxpdGVyYWwobm9kZS5pbml0aWFsaXplciwgbmV3QW5ub3RhdGlvbnMpKTtcbn1cblxuZnVuY3Rpb24gaXNJZGVudGlmaWVyTmFtZWQocDogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlLCBuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhcC5uYW1lICYmIHRzLmlzSWRlbnRpZmllcihwLm5hbWUpICYmIHAubmFtZS50ZXh0ID09PSBuYW1lO1xufVxuXG4vKipcbiAqIENoZWNrIHRoYXQgdGhlIG5vZGUgd2UgYXJlIHZpc2l0aW5nIGlzIHRoZSBhY3R1YWwgQ29tcG9uZW50IGRlY29yYXRvciBkZWZpbmVkIGluIEBhbmd1bGFyL2NvcmUuXG4gKi9cbmZ1bmN0aW9uIGlzQ29tcG9uZW50RGVjb3JhdG9yKG5vZGU6IHRzLkRlY29yYXRvciwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKTogYm9vbGVhbiB7XG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGNhbGxFeHByID0gbm9kZS5leHByZXNzaW9uO1xuXG4gIGxldCBpZGVudGlmaWVyOiB0cy5Ob2RlO1xuXG4gIGlmICh0cy5pc0lkZW50aWZpZXIoY2FsbEV4cHIuZXhwcmVzc2lvbikpIHtcbiAgICBpZGVudGlmaWVyID0gY2FsbEV4cHIuZXhwcmVzc2lvbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGlzQ29tcG9uZW50U3ltYm9sKGlkZW50aWZpZXIsIHR5cGVDaGVja2VyKTtcbn1cblxuZnVuY3Rpb24gaXNDb21wb25lbnRTeW1ib2woaWRlbnRpZmllcjogdHMuTm9kZSwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKSB7XG4gIC8vIE9ubHkgaGFuZGxlIGlkZW50aWZpZXJzLCBub3QgZXhwcmVzc2lvbnNcbiAgaWYgKCF0cy5pc0lkZW50aWZpZXIoaWRlbnRpZmllcikpIHJldHVybiBmYWxzZTtcblxuICAvLyBOT1RFOiByZXNvbHZlci5nZXRSZWZlcmVuY2VkSW1wb3J0RGVjbGFyYXRpb24gd291bGQgd29yayBhcyB3ZWxsIGJ1dCBpcyBpbnRlcm5hbFxuICBjb25zdCBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlkZW50aWZpZXIpO1xuXG4gIGlmICghc3ltYm9sIHx8ICFzeW1ib2wuZGVjbGFyYXRpb25zIHx8ICFzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gcmVzb2x2ZSBzeW1ib2wgJyR7aWRlbnRpZmllci50ZXh0fScgaW4gdGhlIHByb2dyYW0sIGRvZXMgaXQgdHlwZS1jaGVjaz9gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBkZWNsYXJhdGlvbiA9IHN5bWJvbC5kZWNsYXJhdGlvbnNbMF07XG5cbiAgaWYgKCFkZWNsYXJhdGlvbiB8fCAhdHMuaXNJbXBvcnRTcGVjaWZpZXIoZGVjbGFyYXRpb24pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgbmFtZSA9IChkZWNsYXJhdGlvbi5wcm9wZXJ0eU5hbWUgfHwgZGVjbGFyYXRpb24ubmFtZSkudGV4dDtcbiAgLy8gV2Uga25vdyB0aGF0IHBhcmVudCBwb2ludGVycyBhcmUgc2V0IGJlY2F1c2Ugd2UgY3JlYXRlZCB0aGUgU291cmNlRmlsZSBvdXJzZWx2ZXMuXG4gIC8vIFRoZSBudW1iZXIgb2YgcGFyZW50IHJlZmVyZW5jZXMgaGVyZSBtYXRjaCB0aGUgcmVjdXJzaW9uIGRlcHRoIGF0IHRoaXMgcG9pbnQuXG4gIGNvbnN0IG1vZHVsZUlkID1cbiAgICAgIChkZWNsYXJhdGlvbi5wYXJlbnQgIS5wYXJlbnQgIS5wYXJlbnQgIS5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcbiAgcmV0dXJuIG1vZHVsZUlkID09PSAnQGFuZ3VsYXIvY29yZScgJiYgbmFtZSA9PT0gJ0NvbXBvbmVudCc7XG59XG5cbi8qKlxuICogRm9yIGVhY2ggcHJvcGVydHkgaW4gdGhlIG9iamVjdCBsaXRlcmFsLCBpZiBpdCdzIHRlbXBsYXRlVXJsIG9yIHN0eWxlVXJscywgcmVwbGFjZSBpdFxuICogd2l0aCBjb250ZW50LlxuICogQHBhcmFtIG5vZGUgdGhlIGFyZ3VtZW50cyB0byBAQ29tcG9uZW50KCkgb3IgYXJncyBwcm9wZXJ0eSBvZiBkZWNvcmF0b3JzOiBbe3R5cGU6Q29tcG9uZW50fV1cbiAqIEBwYXJhbSBsb2FkZXIgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBsb2FkUmVzb3VyY2UgbWV0aG9kIG9mIHRoZSBob3N0XG4gKiBAcmV0dXJucyB1cGRhdGVkIGFyZ3VtZW50c1xuICovXG5mdW5jdGlvbiB1cGRhdGVDb21wb25lbnRQcm9wZXJ0aWVzKFxuICAgIGFyZ3M6IHRzLk5vZGVBcnJheTx0cy5FeHByZXNzaW9uPiwgbG9hZGVyOiBTdGF0aWNSZXNvdXJjZUxvYWRlcik6IHRzLk5vZGVBcnJheTx0cy5FeHByZXNzaW9uPiB7XG4gIGlmIChhcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgIC8vIFVzZXIgc2hvdWxkIGhhdmUgZ290dGVuIGEgdHlwZS1jaGVjayBlcnJvciBiZWNhdXNlIEBDb21wb25lbnQgdGFrZXMgb25lIGFyZ3VtZW50XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cbiAgY29uc3QgY29tcG9uZW50QXJnID0gYXJnc1swXTtcbiAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKGNvbXBvbmVudEFyZykpIHtcbiAgICAvLyBVc2VyIHNob3VsZCBoYXZlIGdvdHRlbiBhIHR5cGUtY2hlY2sgZXJyb3IgYmVjYXVzZSBAQ29tcG9uZW50IHRha2VzIGFuIG9iamVjdCBsaXRlcmFsXG4gICAgLy8gYXJndW1lbnRcbiAgICByZXR1cm4gYXJncztcbiAgfVxuXG4gIGNvbnN0IG5ld1Byb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW107XG4gIGNvbnN0IG5ld1N0eWxlRXhwcnM6IHRzLkV4cHJlc3Npb25bXSA9IFtdO1xuICBjb21wb25lbnRBcmcucHJvcGVydGllcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgIGlmICghdHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQocHJvcCkgfHwgdHMuaXNDb21wdXRlZFByb3BlcnR5TmFtZShwcm9wLm5hbWUpKSB7XG4gICAgICBuZXdQcm9wZXJ0aWVzLnB1c2gocHJvcCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3dpdGNoIChwcm9wLm5hbWUudGV4dCkge1xuICAgICAgY2FzZSAnc3R5bGVzJzpcbiAgICAgICAgaWYgKCF0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24ocHJvcC5pbml0aWFsaXplcikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0eWxlcyB0YWtlcyBhbiBhcnJheSBhcmd1bWVudCcpO1xuICAgICAgICB9XG4gICAgICAgIG5ld1N0eWxlRXhwcnMucHVzaCguLi5wcm9wLmluaXRpYWxpemVyLmVsZW1lbnRzKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0eWxlVXJscyc6XG4gICAgICAgIGlmICghdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHByb3AuaW5pdGlhbGl6ZXIpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdHlsZVVybHMgdGFrZXMgYW4gYXJyYXkgYXJndW1lbnQnKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdTdHlsZUV4cHJzLnB1c2goLi4ucHJvcC5pbml0aWFsaXplci5lbGVtZW50cy5tYXAoKGV4cHI6IHRzLkV4cHJlc3Npb24pID0+IHtcbiAgICAgICAgICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChleHByKSAmJiAhdHMuaXNOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbChleHByKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICdDYW4gb25seSBhY2NlcHQgc3RyaW5nIGxpdGVyYWwgYXJndW1lbnRzIHRvIHN0eWxlVXJscy4gJyArIFBSRUNPTkRJVElPTlNfVEVYVCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IGxvYWRlci5nZXQoZXhwci50ZXh0KTtcbiAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlTGl0ZXJhbChzdHlsZXMpO1xuICAgICAgICB9KSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICd0ZW1wbGF0ZVVybCc6XG4gICAgICAgIGlmICghdHMuaXNTdHJpbmdMaXRlcmFsKHByb3AuaW5pdGlhbGl6ZXIpICYmXG4gICAgICAgICAgICAhdHMuaXNOb1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbChwcm9wLmluaXRpYWxpemVyKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0NhbiBvbmx5IGFjY2VwdCBhIHN0cmluZyBsaXRlcmFsIGFyZ3VtZW50IHRvIHRlbXBsYXRlVXJsLiAnICsgUFJFQ09ORElUSU9OU19URVhUKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IGxvYWRlci5nZXQocHJvcC5pbml0aWFsaXplci50ZXh0KTtcbiAgICAgICAgbmV3UHJvcGVydGllcy5wdXNoKHRzLnVwZGF0ZVByb3BlcnR5QXNzaWdubWVudChcbiAgICAgICAgICAgIHByb3AsIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3RlbXBsYXRlJyksIHRzLmNyZWF0ZUxpdGVyYWwodGVtcGxhdGUpKSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBuZXdQcm9wZXJ0aWVzLnB1c2gocHJvcCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBBZGQgdGhlIG5vbi1pbmxpbmUgc3R5bGVzXG4gIGlmIChuZXdTdHlsZUV4cHJzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBuZXdTdHlsZXMgPSB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoXG4gICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3N0eWxlcycpLCB0cy5jcmVhdGVBcnJheUxpdGVyYWwobmV3U3R5bGVFeHBycykpO1xuICAgIG5ld1Byb3BlcnRpZXMucHVzaChuZXdTdHlsZXMpO1xuICB9XG5cbiAgcmV0dXJuIHRzLmNyZWF0ZU5vZGVBcnJheShbdHMudXBkYXRlT2JqZWN0TGl0ZXJhbChjb21wb25lbnRBcmcsIG5ld1Byb3BlcnRpZXMpXSk7XG59XG4iXX0=