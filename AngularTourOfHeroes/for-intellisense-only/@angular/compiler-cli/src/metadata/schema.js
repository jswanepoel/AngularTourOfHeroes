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
        define("@angular/compiler-cli/src/metadata/schema", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Metadata Schema
    // If you make a backwards incompatible change to the schema, increment the METADTA_VERSION number.
    // If you make a backwards compatible change to the metadata (such as adding an option field) then
    // leave METADATA_VERSION the same. If possible, supply as many versions of the metadata that can
    // represent the semantics of the file in an array. For example, when generating a version 2 file,
    // if version 1 can accurately represent the metadata, generate both version 1 and version 2 in
    // an array.
    exports.METADATA_VERSION = 4;
    function isModuleMetadata(value) {
        return value && value.__symbolic === 'module';
    }
    exports.isModuleMetadata = isModuleMetadata;
    function isClassMetadata(value) {
        return value && value.__symbolic === 'class';
    }
    exports.isClassMetadata = isClassMetadata;
    function isInterfaceMetadata(value) {
        return value && value.__symbolic === 'interface';
    }
    exports.isInterfaceMetadata = isInterfaceMetadata;
    function isMemberMetadata(value) {
        if (value) {
            switch (value.__symbolic) {
                case 'constructor':
                case 'method':
                case 'property':
                    return true;
            }
        }
        return false;
    }
    exports.isMemberMetadata = isMemberMetadata;
    function isMethodMetadata(value) {
        return value && (value.__symbolic === 'constructor' || value.__symbolic === 'method');
    }
    exports.isMethodMetadata = isMethodMetadata;
    function isConstructorMetadata(value) {
        return value && value.__symbolic === 'constructor';
    }
    exports.isConstructorMetadata = isConstructorMetadata;
    function isFunctionMetadata(value) {
        return value && value.__symbolic === 'function';
    }
    exports.isFunctionMetadata = isFunctionMetadata;
    function isMetadataSymbolicExpression(value) {
        if (value) {
            switch (value.__symbolic) {
                case 'binary':
                case 'call':
                case 'index':
                case 'new':
                case 'pre':
                case 'reference':
                case 'select':
                case 'spread':
                case 'if':
                    return true;
            }
        }
        return false;
    }
    exports.isMetadataSymbolicExpression = isMetadataSymbolicExpression;
    function isMetadataSymbolicBinaryExpression(value) {
        return value && value.__symbolic === 'binary';
    }
    exports.isMetadataSymbolicBinaryExpression = isMetadataSymbolicBinaryExpression;
    function isMetadataSymbolicIndexExpression(value) {
        return value && value.__symbolic === 'index';
    }
    exports.isMetadataSymbolicIndexExpression = isMetadataSymbolicIndexExpression;
    function isMetadataSymbolicCallExpression(value) {
        return value && (value.__symbolic === 'call' || value.__symbolic === 'new');
    }
    exports.isMetadataSymbolicCallExpression = isMetadataSymbolicCallExpression;
    function isMetadataSymbolicPrefixExpression(value) {
        return value && value.__symbolic === 'pre';
    }
    exports.isMetadataSymbolicPrefixExpression = isMetadataSymbolicPrefixExpression;
    function isMetadataSymbolicIfExpression(value) {
        return value && value.__symbolic === 'if';
    }
    exports.isMetadataSymbolicIfExpression = isMetadataSymbolicIfExpression;
    function isMetadataGlobalReferenceExpression(value) {
        return value && value.name && !value.module && isMetadataSymbolicReferenceExpression(value);
    }
    exports.isMetadataGlobalReferenceExpression = isMetadataGlobalReferenceExpression;
    function isMetadataModuleReferenceExpression(value) {
        return value && value.module && !value.name && !value.default &&
            isMetadataSymbolicReferenceExpression(value);
    }
    exports.isMetadataModuleReferenceExpression = isMetadataModuleReferenceExpression;
    function isMetadataImportedSymbolReferenceExpression(value) {
        return value && value.module && !!value.name && isMetadataSymbolicReferenceExpression(value);
    }
    exports.isMetadataImportedSymbolReferenceExpression = isMetadataImportedSymbolReferenceExpression;
    function isMetadataImportDefaultReference(value) {
        return value && value.module && value.default && isMetadataSymbolicReferenceExpression(value);
    }
    exports.isMetadataImportDefaultReference = isMetadataImportDefaultReference;
    function isMetadataSymbolicReferenceExpression(value) {
        return value && value.__symbolic === 'reference';
    }
    exports.isMetadataSymbolicReferenceExpression = isMetadataSymbolicReferenceExpression;
    function isMetadataSymbolicSelectExpression(value) {
        return value && value.__symbolic === 'select';
    }
    exports.isMetadataSymbolicSelectExpression = isMetadataSymbolicSelectExpression;
    function isMetadataSymbolicSpreadExpression(value) {
        return value && value.__symbolic === 'spread';
    }
    exports.isMetadataSymbolicSpreadExpression = isMetadataSymbolicSpreadExpression;
    function isMetadataError(value) {
        return value && value.__symbolic === 'error';
    }
    exports.isMetadataError = isMetadataError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9zY2hlbWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxrQkFBa0I7SUFFbEIsbUdBQW1HO0lBRW5HLGtHQUFrRztJQUNsRyxpR0FBaUc7SUFDakcsa0dBQWtHO0lBQ2xHLCtGQUErRjtJQUMvRixZQUFZO0lBRUMsUUFBQSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7SUFZbEMsMEJBQWlDLEtBQVU7UUFDekMsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQztJQUNoRCxDQUFDO0lBRkQsNENBRUM7SUFlRCx5QkFBZ0MsS0FBVTtRQUN4QyxNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssT0FBTyxDQUFDO0lBQy9DLENBQUM7SUFGRCwwQ0FFQztJQUdELDZCQUFvQyxLQUFVO1FBQzVDLE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUM7SUFDbkQsQ0FBQztJQUZELGtEQUVDO0lBUUQsMEJBQWlDLEtBQVU7UUFDekMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNWLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixLQUFLLGFBQWEsQ0FBQztnQkFDbkIsS0FBSyxRQUFRLENBQUM7Z0JBQ2QsS0FBSyxVQUFVO29CQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQVZELDRDQVVDO0lBTUQsMEJBQWlDLEtBQVU7UUFDekMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FB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QyxVQUFVLEtBQUssV0FBVyxDQUFDO0lBQ25ELENBQUM7SUFIRCxzRkFHQztJQU9ELDRDQUFtRCxLQUFVO1FBRTNELE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUM7SUFDaEQsQ0FBQztJQUhELGdGQUdDO0lBTUQsNENBQW1ELEtBQVU7UUFFM0QsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQztJQUNoRCxDQUFDO0lBSEQsZ0ZBR0M7SUF5QkQseUJBQWdDLEtBQVU7UUFDeEMsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLE9BQU8sQ0FBQztJQUMvQyxDQUFDO0lBRkQsMENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIE1ldGFkYXRhIFNjaGVtYVxuXG4vLyBJZiB5b3UgbWFrZSBhIGJhY2t3YXJkcyBpbmNvbXBhdGlibGUgY2hhbmdlIHRvIHRoZSBzY2hlbWEsIGluY3JlbWVudCB0aGUgTUVUQURUQV9WRVJTSU9OIG51bWJlci5cblxuLy8gSWYgeW91IG1ha2UgYSBiYWNrd2FyZHMgY29tcGF0aWJsZSBjaGFuZ2UgdG8gdGhlIG1ldGFkYXRhIChzdWNoIGFzIGFkZGluZyBhbiBvcHRpb24gZmllbGQpIHRoZW5cbi8vIGxlYXZlIE1FVEFEQVRBX1ZFUlNJT04gdGhlIHNhbWUuIElmIHBvc3NpYmxlLCBzdXBwbHkgYXMgbWFueSB2ZXJzaW9ucyBvZiB0aGUgbWV0YWRhdGEgdGhhdCBjYW5cbi8vIHJlcHJlc2VudCB0aGUgc2VtYW50aWNzIG9mIHRoZSBmaWxlIGluIGFuIGFycmF5LiBGb3IgZXhhbXBsZSwgd2hlbiBnZW5lcmF0aW5nIGEgdmVyc2lvbiAyIGZpbGUsXG4vLyBpZiB2ZXJzaW9uIDEgY2FuIGFjY3VyYXRlbHkgcmVwcmVzZW50IHRoZSBtZXRhZGF0YSwgZ2VuZXJhdGUgYm90aCB2ZXJzaW9uIDEgYW5kIHZlcnNpb24gMiBpblxuLy8gYW4gYXJyYXkuXG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9WRVJTSU9OID0gNDtcblxuZXhwb3J0IHR5cGUgTWV0YWRhdGFFbnRyeSA9IENsYXNzTWV0YWRhdGEgfCBJbnRlcmZhY2VNZXRhZGF0YSB8IEZ1bmN0aW9uTWV0YWRhdGEgfCBNZXRhZGF0YVZhbHVlO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vZHVsZU1ldGFkYXRhIHtcbiAgX19zeW1ib2xpYzogJ21vZHVsZSc7XG4gIHZlcnNpb246IG51bWJlcjtcbiAgZXhwb3J0cz86IE1vZHVsZUV4cG9ydE1ldGFkYXRhW107XG4gIGltcG9ydEFzPzogc3RyaW5nO1xuICBtZXRhZGF0YToge1tuYW1lOiBzdHJpbmddOiBNZXRhZGF0YUVudHJ5fTtcbiAgb3JpZ2lucz86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01vZHVsZU1ldGFkYXRhKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBNb2R1bGVNZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnbW9kdWxlJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb2R1bGVFeHBvcnRNZXRhZGF0YSB7XG4gIGV4cG9ydD86IChzdHJpbmd8e25hbWU6IHN0cmluZywgYXM6IHN0cmluZ30pW107XG4gIGZyb206IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDbGFzc01ldGFkYXRhIHtcbiAgX19zeW1ib2xpYzogJ2NsYXNzJztcbiAgZXh0ZW5kcz86IE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9ufE1ldGFkYXRhRXJyb3I7XG4gIGFyaXR5PzogbnVtYmVyO1xuICBkZWNvcmF0b3JzPzogKE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9ufE1ldGFkYXRhRXJyb3IpW107XG4gIG1lbWJlcnM/OiBNZXRhZGF0YU1hcDtcbiAgc3RhdGljcz86IHtbbmFtZTogc3RyaW5nXTogTWV0YWRhdGFWYWx1ZSB8IEZ1bmN0aW9uTWV0YWRhdGF9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xhc3NNZXRhZGF0YSh2YWx1ZTogYW55KTogdmFsdWUgaXMgQ2xhc3NNZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnY2xhc3MnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEludGVyZmFjZU1ldGFkYXRhIHsgX19zeW1ib2xpYzogJ2ludGVyZmFjZSc7IH1cbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVyZmFjZU1ldGFkYXRhKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBJbnRlcmZhY2VNZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnaW50ZXJmYWNlJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YU1hcCB7IFtuYW1lOiBzdHJpbmddOiBNZW1iZXJNZXRhZGF0YVtdOyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtYmVyTWV0YWRhdGEge1xuICBfX3N5bWJvbGljOiAnY29uc3RydWN0b3InfCdtZXRob2QnfCdwcm9wZXJ0eSc7XG4gIGRlY29yYXRvcnM/OiAoTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb258TWV0YWRhdGFFcnJvcilbXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01lbWJlck1ldGFkYXRhKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBNZW1iZXJNZXRhZGF0YSB7XG4gIGlmICh2YWx1ZSkge1xuICAgIHN3aXRjaCAodmFsdWUuX19zeW1ib2xpYykge1xuICAgICAgY2FzZSAnY29uc3RydWN0b3InOlxuICAgICAgY2FzZSAnbWV0aG9kJzpcbiAgICAgIGNhc2UgJ3Byb3BlcnR5JzpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRob2RNZXRhZGF0YSBleHRlbmRzIE1lbWJlck1ldGFkYXRhIHtcbiAgX19zeW1ib2xpYzogJ2NvbnN0cnVjdG9yJ3wnbWV0aG9kJztcbiAgcGFyYW1ldGVyRGVjb3JhdG9ycz86ICgoTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24gfCBNZXRhZGF0YUVycm9yKVtdfHVuZGVmaW5lZClbXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGhvZE1ldGFkYXRhKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBNZXRob2RNZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiAodmFsdWUuX19zeW1ib2xpYyA9PT0gJ2NvbnN0cnVjdG9yJyB8fCB2YWx1ZS5fX3N5bWJvbGljID09PSAnbWV0aG9kJyk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RydWN0b3JNZXRhZGF0YSBleHRlbmRzIE1ldGhvZE1ldGFkYXRhIHtcbiAgX19zeW1ib2xpYzogJ2NvbnN0cnVjdG9yJztcbiAgcGFyYW1ldGVycz86IChNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbnxNZXRhZGF0YUVycm9yfG51bGx8dW5kZWZpbmVkKVtdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29uc3RydWN0b3JNZXRhZGF0YSh2YWx1ZTogYW55KTogdmFsdWUgaXMgQ29uc3RydWN0b3JNZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnY29uc3RydWN0b3InO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZ1bmN0aW9uTWV0YWRhdGEge1xuICBfX3N5bWJvbGljOiAnZnVuY3Rpb24nO1xuICBwYXJhbWV0ZXJzOiBzdHJpbmdbXTtcbiAgZGVmYXVsdHM/OiBNZXRhZGF0YVZhbHVlW107XG4gIHZhbHVlOiBNZXRhZGF0YVZhbHVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb25NZXRhZGF0YSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRnVuY3Rpb25NZXRhZGF0YSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgdHlwZSBNZXRhZGF0YVZhbHVlID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwgfCBNZXRhZGF0YU9iamVjdCB8XG4gICAgTWV0YWRhdGFBcnJheSB8IE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uIHwgTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24gfFxuICAgIE1ldGFkYXRhU3ltYm9saWNCaW5hcnlFeHByZXNzaW9uIHwgTWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbiB8XG4gICAgTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uIHwgTWV0YWRhdGFTeW1ib2xpY1ByZWZpeEV4cHJlc3Npb24gfFxuICAgIE1ldGFkYXRhU3ltYm9saWNJZkV4cHJlc3Npb24gfCBNZXRhZGF0YVN5bWJvbGljU3ByZWFkRXhwcmVzc2lvbiB8XG4gICAgTWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24gfCBNZXRhZGF0YUVycm9yO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhT2JqZWN0IHsgW25hbWU6IHN0cmluZ106IE1ldGFkYXRhVmFsdWU7IH1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YUFycmF5IHsgW25hbWU6IG51bWJlcl06IE1ldGFkYXRhVmFsdWU7IH1cblxuZXhwb3J0IHR5cGUgTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24gPSBNZXRhZGF0YVN5bWJvbGljQmluYXJ5RXhwcmVzc2lvbiB8XG4gICAgTWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbiB8IE1ldGFkYXRhU3ltYm9saWNJbmRleEV4cHJlc3Npb24gfFxuICAgIE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiB8IE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiB8XG4gICAgTWV0YWRhdGFTeW1ib2xpY1ByZWZpeEV4cHJlc3Npb24gfCBNZXRhZGF0YVN5bWJvbGljSWZFeHByZXNzaW9uIHxcbiAgICBNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24gfCBNZXRhZGF0YU1vZHVsZVJlZmVyZW5jZUV4cHJlc3Npb24gfFxuICAgIE1ldGFkYXRhSW1wb3J0ZWRTeW1ib2xSZWZlcmVuY2VFeHByZXNzaW9uIHwgTWV0YWRhdGFJbXBvcnRlZERlZmF1bHRSZWZlcmVuY2VFeHByZXNzaW9uIHxcbiAgICBNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiB8IE1ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24ge1xuICBpZiAodmFsdWUpIHtcbiAgICBzd2l0Y2ggKHZhbHVlLl9fc3ltYm9saWMpIHtcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICBjYXNlICdjYWxsJzpcbiAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgIGNhc2UgJ25ldyc6XG4gICAgICBjYXNlICdwcmUnOlxuICAgICAgY2FzZSAncmVmZXJlbmNlJzpcbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBjYXNlICdzcHJlYWQnOlxuICAgICAgY2FzZSAnaWYnOlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhU3ltYm9saWNCaW5hcnlFeHByZXNzaW9uIHtcbiAgX19zeW1ib2xpYzogJ2JpbmFyeSc7XG4gIG9wZXJhdG9yOiAnJiYnfCd8fCd8J3wnfCdeJ3wnJid8Jz09J3wnIT0nfCc9PT0nfCchPT0nfCc8J3wnPid8Jzw9J3wnPj0nfCdpbnN0YW5jZW9mJ3wnaW4nfCdhcyd8XG4gICAgICAnPDwnfCc+Pid8Jz4+Pid8JysnfCctJ3wnKid8Jy8nfCclJ3wnKionO1xuICBsZWZ0OiBNZXRhZGF0YVZhbHVlO1xuICByaWdodDogTWV0YWRhdGFWYWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNCaW5hcnlFeHByZXNzaW9uKHZhbHVlOiBhbnkpOlxuICAgIHZhbHVlIGlzIE1ldGFkYXRhU3ltYm9saWNCaW5hcnlFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLl9fc3ltYm9saWMgPT09ICdiaW5hcnknO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhU3ltYm9saWNJbmRleEV4cHJlc3Npb24ge1xuICBfX3N5bWJvbGljOiAnaW5kZXgnO1xuICBleHByZXNzaW9uOiBNZXRhZGF0YVZhbHVlO1xuICBpbmRleDogTWV0YWRhdGFWYWx1ZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNJbmRleEV4cHJlc3Npb24odmFsdWU6IGFueSk6XG4gICAgdmFsdWUgaXMgTWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnaW5kZXgnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiB7XG4gIF9fc3ltYm9saWM6ICdjYWxsJ3wnbmV3JztcbiAgZXhwcmVzc2lvbjogTWV0YWRhdGFWYWx1ZTtcbiAgYXJndW1lbnRzPzogTWV0YWRhdGFWYWx1ZVtdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uKHZhbHVlOiBhbnkpOlxuICAgIHZhbHVlIGlzIE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiAodmFsdWUuX19zeW1ib2xpYyA9PT0gJ2NhbGwnIHx8IHZhbHVlLl9fc3ltYm9saWMgPT09ICduZXcnKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVN5bWJvbGljUHJlZml4RXhwcmVzc2lvbiB7XG4gIF9fc3ltYm9saWM6ICdwcmUnO1xuICBvcGVyYXRvcjogJysnfCctJ3wnfid8JyEnO1xuICBvcGVyYW5kOiBNZXRhZGF0YVZhbHVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY1ByZWZpeEV4cHJlc3Npb24odmFsdWU6IGFueSk6XG4gICAgdmFsdWUgaXMgTWV0YWRhdGFTeW1ib2xpY1ByZWZpeEV4cHJlc3Npb24ge1xuICByZXR1cm4gdmFsdWUgJiYgdmFsdWUuX19zeW1ib2xpYyA9PT0gJ3ByZSc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbiB7XG4gIF9fc3ltYm9saWM6ICdpZic7XG4gIGNvbmRpdGlvbjogTWV0YWRhdGFWYWx1ZTtcbiAgdGhlbkV4cHJlc3Npb246IE1ldGFkYXRhVmFsdWU7XG4gIGVsc2VFeHByZXNzaW9uOiBNZXRhZGF0YVZhbHVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgTWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnaWYnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvIHtcbiAgLyoqXG4gICAqIFRoZSBsaW5lIG51bWJlciBvZiB0aGUgZXJyb3IgaW4gdGhlIC50cyBmaWxlIHRoZSBtZXRhZGF0YSB3YXMgY3JlYXRlZCBmb3IuXG4gICAqL1xuICBsaW5lPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgbnVtYmVyIG9mIHV0ZjggY29kZS11bml0cyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUgb2YgdGhlIGVycm9yLlxuICAgKi9cbiAgY2hhcmFjdGVyPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbiBleHRlbmRzIE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvIHtcbiAgX19zeW1ib2xpYzogJ3JlZmVyZW5jZSc7XG4gIG5hbWU6IHN0cmluZztcbiAgYXJndW1lbnRzPzogTWV0YWRhdGFWYWx1ZVtdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uKHZhbHVlOiBhbnkpOlxuICAgIHZhbHVlIGlzIE1ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5uYW1lICYmICF2YWx1ZS5tb2R1bGUgJiYgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uIGV4dGVuZHMgTWV0YWRhdGFTb3VyY2VMb2NhdGlvbkluZm8ge1xuICBfX3N5bWJvbGljOiAncmVmZXJlbmNlJztcbiAgbW9kdWxlOiBzdHJpbmc7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNNZXRhZGF0YU1vZHVsZVJlZmVyZW5jZUV4cHJlc3Npb24odmFsdWU6IGFueSk6XG4gICAgdmFsdWUgaXMgTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLm1vZHVsZSAmJiAhdmFsdWUubmFtZSAmJiAhdmFsdWUuZGVmYXVsdCAmJlxuICAgICAgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZSk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24gZXh0ZW5kcyBNZXRhZGF0YVNvdXJjZUxvY2F0aW9uSW5mbyB7XG4gIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnO1xuICBtb2R1bGU6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBhcmd1bWVudHM/OiBNZXRhZGF0YVZhbHVlW107XG59XG5leHBvcnQgZnVuY3Rpb24gaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZTogYW55KTpcbiAgICB2YWx1ZSBpcyBNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5tb2R1bGUgJiYgISF2YWx1ZS5uYW1lICYmIGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24odmFsdWUpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhSW1wb3J0ZWREZWZhdWx0UmVmZXJlbmNlRXhwcmVzc2lvbiBleHRlbmRzIE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvIHtcbiAgX19zeW1ib2xpYzogJ3JlZmVyZW5jZSc7XG4gIG1vZHVsZTogc3RyaW5nO1xuICBkZWZhdWx0OlxuICAgIGJvb2xlYW47XG4gICAgYXJndW1lbnRzPzogTWV0YWRhdGFWYWx1ZVtdO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFJbXBvcnREZWZhdWx0UmVmZXJlbmNlKHZhbHVlOiBhbnkpOlxuICAgIHZhbHVlIGlzIE1ldGFkYXRhSW1wb3J0ZWREZWZhdWx0UmVmZXJlbmNlRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5tb2R1bGUgJiYgdmFsdWUuZGVmYXVsdCAmJiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHZhbHVlKTtcbn1cblxuZXhwb3J0IHR5cGUgTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24gPSBNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24gfFxuICAgIE1ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbiB8IE1ldGFkYXRhSW1wb3J0ZWRTeW1ib2xSZWZlcmVuY2VFeHByZXNzaW9uIHxcbiAgICBNZXRhZGF0YUltcG9ydGVkRGVmYXVsdFJlZmVyZW5jZUV4cHJlc3Npb247XG5leHBvcnQgZnVuY3Rpb24gaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbih2YWx1ZTogYW55KTpcbiAgICB2YWx1ZSBpcyBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAncmVmZXJlbmNlJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiB7XG4gIF9fc3ltYm9saWM6ICdzZWxlY3QnO1xuICBleHByZXNzaW9uOiBNZXRhZGF0YVZhbHVlO1xuICBtZW1iZXI6IHN0cmluZztcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc01ldGFkYXRhU3ltYm9saWNTZWxlY3RFeHByZXNzaW9uKHZhbHVlOiBhbnkpOlxuICAgIHZhbHVlIGlzIE1ldGFkYXRhU3ltYm9saWNTZWxlY3RFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLl9fc3ltYm9saWMgPT09ICdzZWxlY3QnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uIHtcbiAgX19zeW1ib2xpYzogJ3NwcmVhZCc7XG4gIGV4cHJlc3Npb246IE1ldGFkYXRhVmFsdWU7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNNZXRhZGF0YVN5bWJvbGljU3ByZWFkRXhwcmVzc2lvbih2YWx1ZTogYW55KTpcbiAgICB2YWx1ZSBpcyBNZXRhZGF0YVN5bWJvbGljU3ByZWFkRXhwcmVzc2lvbiB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnc3ByZWFkJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YUVycm9yIGV4dGVuZHMgTWV0YWRhdGFTb3VyY2VMb2NhdGlvbkluZm8ge1xuICBfX3N5bWJvbGljOiAnZXJyb3InO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1lc3NhZ2Ugc2hvdWxkIGJlIHNob3J0IGFuZCByZWxhdGl2ZWx5IGRpc2NyaXB0aXZlIGFuZCBzaG91bGQgYmUgZml4ZWQgb25jZSBpdCBpcyBjcmVhdGVkLlxuICAgKiBJZiB0aGUgcmVhZGVyIGRvZXNuJ3QgcmVjb2duaXplIHRoZSBtZXNzYWdlLCBpdCB3aWxsIGRpc3BsYXkgdGhlIG1lc3NhZ2UgdW5tb2RpZmllZC4gSWYgdGhlXG4gICAqIHJlYWRlciByZWNvZ25pemVzIHRoZSBlcnJvciBtZXNzYWdlIGlzIGl0IGZyZWUgdG8gdXNlIHN1YnN0aXR1dGUgbWVzc2FnZSB0aGUgaXMgbW9yZVxuICAgKiBkZXNjcmlwdGl2ZSBhbmQvb3IgbG9jYWxpemVkLlxuICAgKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbW9kdWxlIG9mIHRoZSBlcnJvciAob25seSB1c2VkIGluIGJ1bmRsZWQgbWV0YWRhdGEpXG4gICAqL1xuICBtb2R1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENvbnRleHQgaW5mb3JtYXRpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBnZW5lcmF0ZSBhIG1vcmUgZGVzY3JpcHRpdmUgZXJyb3IgbWVzc2FnZS4gVGhlIGNvbnRlbnRcbiAgICogb2YgdGhlIGNvbnRleHQgaXMgZGVwZW5kZW50IG9uIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgKi9cbiAgY29udGV4dD86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTWV0YWRhdGFFcnJvcih2YWx1ZTogYW55KTogdmFsdWUgaXMgTWV0YWRhdGFFcnJvciB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5fX3N5bWJvbGljID09PSAnZXJyb3InO1xufVxuIl19