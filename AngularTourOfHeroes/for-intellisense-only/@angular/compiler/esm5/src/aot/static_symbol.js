/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a filePath and name and can be used as a hash table key.
 */
var StaticSymbol = /** @class */ (function () {
    function StaticSymbol(filePath, name, members) {
        this.filePath = filePath;
        this.name = name;
        this.members = members;
    }
    StaticSymbol.prototype.assertNoMembers = function () {
        if (this.members.length) {
            throw new Error("Illegal state: symbol without members expected, but got " + JSON.stringify(this) + ".");
        }
    };
    return StaticSymbol;
}());
export { StaticSymbol };
/**
 * A cache of static symbol used by the StaticReflector to return the same symbol for the
 * same symbol values.
 */
var StaticSymbolCache = /** @class */ (function () {
    function StaticSymbolCache() {
        this.cache = new Map();
    }
    StaticSymbolCache.prototype.get = function (declarationFile, name, members) {
        members = members || [];
        var memberSuffix = members.length ? "." + members.join('.') : '';
        var key = "\"" + declarationFile + "\"." + name + memberSuffix;
        var result = this.cache.get(key);
        if (!result) {
            result = new StaticSymbol(declarationFile, name, members);
            this.cache.set(key, result);
        }
        return result;
    };
    return StaticSymbolCache;
}());
export { StaticSymbolCache };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N5bWJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9hb3Qvc3RhdGljX3N5bWJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7OztHQUlHO0FBQ0g7SUFDRSxzQkFBbUIsUUFBZ0IsRUFBUyxJQUFZLEVBQVMsT0FBaUI7UUFBL0QsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxZQUFPLEdBQVAsT0FBTyxDQUFVO0lBQUcsQ0FBQztJQUV0RixzQ0FBZSxHQUFmO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQ1gsNkRBQTJELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQyxDQUFDO1FBQzFGLENBQUM7SUFDSCxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQzs7QUFFRDs7O0dBR0c7QUFDSDtJQUFBO1FBQ1UsVUFBSyxHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO0lBYWxELENBQUM7SUFYQywrQkFBRyxHQUFILFVBQUksZUFBdUIsRUFBRSxJQUFZLEVBQUUsT0FBa0I7UUFDM0QsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDeEIsSUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDcEUsSUFBTSxHQUFHLEdBQUcsT0FBSSxlQUFlLFdBQUssSUFBSSxHQUFHLFlBQWMsQ0FBQztRQUMxRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWixNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQWRELElBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSB0b2tlbiByZXByZXNlbnRpbmcgdGhlIGEgcmVmZXJlbmNlIHRvIGEgc3RhdGljIHR5cGUuXG4gKlxuICogVGhpcyB0b2tlbiBpcyB1bmlxdWUgZm9yIGEgZmlsZVBhdGggYW5kIG5hbWUgYW5kIGNhbiBiZSB1c2VkIGFzIGEgaGFzaCB0YWJsZSBrZXkuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNTeW1ib2wge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlsZVBhdGg6IHN0cmluZywgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIG1lbWJlcnM6IHN0cmluZ1tdKSB7fVxuXG4gIGFzc2VydE5vTWVtYmVycygpIHtcbiAgICBpZiAodGhpcy5tZW1iZXJzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbGxlZ2FsIHN0YXRlOiBzeW1ib2wgd2l0aG91dCBtZW1iZXJzIGV4cGVjdGVkLCBidXQgZ290ICR7SlNPTi5zdHJpbmdpZnkodGhpcyl9LmApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEEgY2FjaGUgb2Ygc3RhdGljIHN5bWJvbCB1c2VkIGJ5IHRoZSBTdGF0aWNSZWZsZWN0b3IgdG8gcmV0dXJuIHRoZSBzYW1lIHN5bWJvbCBmb3IgdGhlXG4gKiBzYW1lIHN5bWJvbCB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGF0aWNTeW1ib2xDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPHN0cmluZywgU3RhdGljU3ltYm9sPigpO1xuXG4gIGdldChkZWNsYXJhdGlvbkZpbGU6IHN0cmluZywgbmFtZTogc3RyaW5nLCBtZW1iZXJzPzogc3RyaW5nW10pOiBTdGF0aWNTeW1ib2wge1xuICAgIG1lbWJlcnMgPSBtZW1iZXJzIHx8IFtdO1xuICAgIGNvbnN0IG1lbWJlclN1ZmZpeCA9IG1lbWJlcnMubGVuZ3RoID8gYC4keyBtZW1iZXJzLmpvaW4oJy4nKX1gIDogJyc7XG4gICAgY29uc3Qga2V5ID0gYFwiJHtkZWNsYXJhdGlvbkZpbGV9XCIuJHtuYW1lfSR7bWVtYmVyU3VmZml4fWA7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuY2FjaGUuZ2V0KGtleSk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBTdGF0aWNTeW1ib2woZGVjbGFyYXRpb25GaWxlLCBuYW1lLCBtZW1iZXJzKTtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KGtleSwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSJdfQ==