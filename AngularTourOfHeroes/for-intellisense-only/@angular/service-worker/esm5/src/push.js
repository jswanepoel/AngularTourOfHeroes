/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { NEVER, Subject, merge } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ERR_SW_NOT_SUPPORTED, NgswCommChannel } from './low_level';
/**
 * Subscribe and listen to push notifications from the Service Worker.
 *
 * @experimental
 */
var SwPush = /** @class */ (function () {
    function SwPush(sw) {
        this.sw = sw;
        this.subscriptionChanges = new Subject();
        if (!sw.isEnabled) {
            this.messages = NEVER;
            this.subscription = NEVER;
            return;
        }
        this.messages = this.sw.eventsOfType('PUSH').pipe(map(function (message) { return message.data; }));
        this.pushManager = this.sw.registration.pipe(map(function (registration) { return registration.pushManager; }));
        var workerDrivenSubscriptions = this.pushManager.pipe(switchMap(function (pm) { return pm.getSubscription().then(function (sub) { return sub; }); }));
        this.subscription = merge(workerDrivenSubscriptions, this.subscriptionChanges);
    }
    Object.defineProperty(SwPush.prototype, "isEnabled", {
        /**
         * Returns true if the Service Worker is enabled (supported by the browser and enabled via
         * ServiceWorkerModule).
         */
        get: function () { return this.sw.isEnabled; },
        enumerable: true,
        configurable: true
    });
    SwPush.prototype.requestSubscription = function (options) {
        var _this = this;
        if (!this.sw.isEnabled) {
            return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
        }
        var pushOptions = { userVisibleOnly: true };
        var key = this.decodeBase64(options.serverPublicKey.replace(/_/g, '/').replace(/-/g, '+'));
        var applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
        for (var i = 0; i < key.length; i++) {
            applicationServerKey[i] = key.charCodeAt(i);
        }
        pushOptions.applicationServerKey = applicationServerKey;
        return this.pushManager.pipe(switchMap(function (pm) { return pm.subscribe(pushOptions); }), take(1))
            .toPromise()
            .then(function (sub) {
            _this.subscriptionChanges.next(sub);
            return sub;
        });
    };
    SwPush.prototype.unsubscribe = function () {
        var _this = this;
        if (!this.sw.isEnabled) {
            return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
        }
        var doUnsubscribe = function (sub) {
            if (sub === null) {
                throw new Error('Not subscribed to push notifications.');
            }
            return sub.unsubscribe().then(function (success) {
                if (!success) {
                    throw new Error('Unsubscribe failed!');
                }
                _this.subscriptionChanges.next(null);
            });
        };
        return this.subscription.pipe(take(1), switchMap(doUnsubscribe)).toPromise();
    };
    SwPush.prototype.decodeBase64 = function (input) { return atob(input); };
    SwPush.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    SwPush.ctorParameters = function () { return [
        { type: NgswCommChannel }
    ]; };
    return SwPush;
}());
export { SwPush };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3NlcnZpY2Utd29ya2VyL3NyYy9wdXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLEtBQUssRUFBYyxPQUFPLEVBQUUsS0FBSyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXBELE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFHbEU7Ozs7R0FJRztBQUNIO0lBU0UsZ0JBQW9CLEVBQW1CO1FBQW5CLE9BQUUsR0FBRixFQUFFLENBQWlCO1FBSC9CLHdCQUFtQixHQUN2QixJQUFJLE9BQU8sRUFBeUIsQ0FBQztRQUd2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLE1BQU0sQ0FBQztRQUNULENBQUM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQyxPQUFZLElBQUssT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFaLENBQVksQ0FBQyxDQUFDLENBQUM7UUFFdkYsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQ3hDLEdBQUcsQ0FBQyxVQUFDLFlBQXVDLElBQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxX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Q0FBQyxDQUFDLENBQUM7b0JBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2dCQUVELEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQy9FLENBQUM7SUFFTyw2QkFBWSxHQUFwQixVQUFxQixLQUFhLElBQVksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQXpFcEUsVUFBVTs7OztnQkFSbUIsZUFBZTs7SUFrRjdDLGFBQUM7Q0FBQSxBQTFFRCxJQTBFQztTQXpFWSxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtORVZFUiwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgbWVyZ2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHttYXAsIHN3aXRjaE1hcCwgdGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0VSUl9TV19OT1RfU1VQUE9SVEVELCBOZ3N3Q29tbUNoYW5uZWx9IGZyb20gJy4vbG93X2xldmVsJztcblxuXG4vKipcbiAqIFN1YnNjcmliZSBhbmQgbGlzdGVuIHRvIHB1c2ggbm90aWZpY2F0aW9ucyBmcm9tIHRoZSBTZXJ2aWNlIFdvcmtlci5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTd1B1c2gge1xuICByZWFkb25seSBtZXNzYWdlczogT2JzZXJ2YWJsZTxvYmplY3Q+O1xuICByZWFkb25seSBzdWJzY3JpcHRpb246IE9ic2VydmFibGU8UHVzaFN1YnNjcmlwdGlvbnxudWxsPjtcblxuICBwcml2YXRlIHB1c2hNYW5hZ2VyOiBPYnNlcnZhYmxlPFB1c2hNYW5hZ2VyPjtcbiAgcHJpdmF0ZSBzdWJzY3JpcHRpb25DaGFuZ2VzOiBTdWJqZWN0PFB1c2hTdWJzY3JpcHRpb258bnVsbD4gPVxuICAgICAgbmV3IFN1YmplY3Q8UHVzaFN1YnNjcmlwdGlvbnxudWxsPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgc3c6IE5nc3dDb21tQ2hhbm5lbCkge1xuICAgIGlmICghc3cuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gTkVWRVI7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IE5FVkVSO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5zdy5ldmVudHNPZlR5cGUoJ1BVU0gnKS5waXBlKG1hcCgobWVzc2FnZTogYW55KSA9PiBtZXNzYWdlLmRhdGEpKTtcblxuICAgIHRoaXMucHVzaE1hbmFnZXIgPSB0aGlzLnN3LnJlZ2lzdHJhdGlvbi5waXBlKFxuICAgICAgICBtYXAoKHJlZ2lzdHJhdGlvbjogU2VydmljZVdvcmtlclJlZ2lzdHJhdGlvbikgPT4geyByZXR1cm4gcmVnaXN0cmF0aW9uLnB1c2hNYW5hZ2VyOyB9KSk7XG5cbiAgICBjb25zdCB3b3JrZXJEcml2ZW5TdWJzY3JpcHRpb25zID0gdGhpcy5wdXNoTWFuYWdlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoKHBtOiBQdXNoTWFuYWdlcikgPT4gcG0uZ2V0U3Vic2NyaXB0aW9uKCkudGhlbihzdWIgPT4geyByZXR1cm4gc3ViOyB9KSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9uID0gbWVyZ2Uod29ya2VyRHJpdmVuU3Vic2NyaXB0aW9ucywgdGhpcy5zdWJzY3JpcHRpb25DaGFuZ2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIFNlcnZpY2UgV29ya2VyIGlzIGVuYWJsZWQgKHN1cHBvcnRlZCBieSB0aGUgYnJvd3NlciBhbmQgZW5hYmxlZCB2aWFcbiAgICogU2VydmljZVdvcmtlck1vZHVsZSkuXG4gICAqL1xuICBnZXQgaXNFbmFibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zdy5pc0VuYWJsZWQ7IH1cblxuICByZXF1ZXN0U3Vic2NyaXB0aW9uKG9wdGlvbnM6IHtzZXJ2ZXJQdWJsaWNLZXk6IHN0cmluZ30pOiBQcm9taXNlPFB1c2hTdWJzY3JpcHRpb24+IHtcbiAgICBpZiAoIXRoaXMuc3cuaXNFbmFibGVkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKEVSUl9TV19OT1RfU1VQUE9SVEVEKSk7XG4gICAgfVxuICAgIGNvbnN0IHB1c2hPcHRpb25zOiBQdXNoU3Vic2NyaXB0aW9uT3B0aW9uc0luaXQgPSB7dXNlclZpc2libGVPbmx5OiB0cnVlfTtcbiAgICBsZXQga2V5ID0gdGhpcy5kZWNvZGVCYXNlNjQob3B0aW9ucy5zZXJ2ZXJQdWJsaWNLZXkucmVwbGFjZSgvXy9nLCAnLycpLnJlcGxhY2UoLy0vZywgJysnKSk7XG4gICAgbGV0IGFwcGxpY2F0aW9uU2VydmVyS2V5ID0gbmV3IFVpbnQ4QXJyYXkobmV3IEFycmF5QnVmZmVyKGtleS5sZW5ndGgpKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleS5sZW5ndGg7IGkrKykge1xuICAgICAgYXBwbGljYXRpb25TZXJ2ZXJLZXlbaV0gPSBrZXkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcHVzaE9wdGlvbnMuYXBwbGljYXRpb25TZXJ2ZXJLZXkgPSBhcHBsaWNhdGlvblNlcnZlcktleTtcblxuICAgIHJldHVybiB0aGlzLnB1c2hNYW5hZ2VyLnBpcGUoc3dpdGNoTWFwKChwbTogUHVzaE1hbmFnZXIpID0+IHBtLnN1YnNjcmliZShwdXNoT3B0aW9ucykpLCB0YWtlKDEpKVxuICAgICAgICAudG9Qcm9taXNlKClcbiAgICAgICAgLnRoZW4oc3ViID0+IHtcbiAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbkNoYW5nZXMubmV4dChzdWIpO1xuICAgICAgICAgIHJldHVybiBzdWI7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgdW5zdWJzY3JpYmUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCF0aGlzLnN3LmlzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihFUlJfU1dfTk9UX1NVUFBPUlRFRCkpO1xuICAgIH1cblxuICAgIGNvbnN0IGRvVW5zdWJzY3JpYmUgPSAoc3ViOiBQdXNoU3Vic2NyaXB0aW9uIHwgbnVsbCkgPT4ge1xuICAgICAgaWYgKHN1YiA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzdWJzY3JpYmVkIHRvIHB1c2ggbm90aWZpY2F0aW9ucy4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN1Yi51bnN1YnNjcmliZSgpLnRoZW4oc3VjY2VzcyA9PiB7XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdWJzY3JpYmUgZmFpbGVkIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25DaGFuZ2VzLm5leHQobnVsbCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9uLnBpcGUodGFrZSgxKSwgc3dpdGNoTWFwKGRvVW5zdWJzY3JpYmUpKS50b1Byb21pc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVjb2RlQmFzZTY0KGlucHV0OiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gYXRvYihpbnB1dCk7IH1cbn1cbiJdfQ==