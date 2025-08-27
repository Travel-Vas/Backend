"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGracefulShutdown = exports.globalErrorHandler = void 0;
// import subscriptionModel from "../resources/subscription/subscription.model";
const globalErrorHandler = (err, req, res, next) => {
    console.error('Global Error:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Handle specific infrastructure errors
    if (isInfrastructureError(err)) {
        return res.status(502).json({
            success: false,
            message: "We're experiencing high demand right now. Please try again in a few moments.",
            code: 'SERVICE_TEMPORARILY_UNAVAILABLE',
            retryAfter: 30 // seconds
        });
    }
    // Handle memory errors
    if (isMemoryError(err)) {
        return res.status(502).json({
            success: false,
            message: "Our servers are currently processing many requests. Please try again shortly.",
            code: 'HIGH_SERVER_LOAD',
            retryAfter: 60
        });
    }
    // Handle database connection errors
    if (isDatabaseError(err)) {
        return res.status(502).json({
            success: false,
            message: "We're having trouble connecting to our database. Please try again in a moment.",
            code: 'DATABASE_TEMPORARILY_UNAVAILABLE',
            retryAfter: 15
        });
    }
    // Handle file system errors
    if (isFileSystemError(err)) {
        return res.status(502).json({
            success: false,
            message: "File upload service is temporarily unavailable. Please try again later.",
            code: 'STORAGE_TEMPORARILY_UNAVAILABLE',
            retryAfter: 45
        });
    }
    // Default error response for unknown errors
    res.status(500).json({
        success: false,
        message: "Something went wrong on our end. Our team has been notified.",
        code: 'INTERNAL_SERVER_ERROR'
    });
};
exports.globalErrorHandler = globalErrorHandler;
// 2. Error Type Detection Functions
const isInfrastructureError = (err) => {
    const infraErrors = [
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
        'ECONNRESET',
        'EPIPE',
        'EHOSTUNREACH'
    ];
    return infraErrors.some(code => {
        var _a;
        return err.code === code ||
            ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes(code)) ||
            err.errno === code;
    });
};
const isMemoryError = (err) => {
    const memoryErrors = [
        'out of memory',
        'cannot allocate memory',
        'memory limit exceeded',
        'heap out of memory',
        'ENOMEM'
    ];
    return memoryErrors.some(msg => {
        var _a;
        return ((_a = err.message) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(msg)) ||
            err.code === 'ENOMEM';
    }) || process.memoryUsage().heapUsed > (process.memoryUsage().heapTotal * 0.9);
};
const isDatabaseError = (err) => {
    const dbErrors = [
        'MongoNetworkError',
        'MongoServerSelectionError',
        'MongoTimeoutError',
        'connection timed out',
        'database connection failed'
    ];
    return dbErrors.some(msg => {
        var _a, _b;
        return ((_a = err.name) === null || _a === void 0 ? void 0 : _a.includes(msg)) ||
            ((_b = err.message) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(msg.toLowerCase()));
    });
};
const isFileSystemError = (err) => {
    const fsErrors = [
        'ENOSPC', // No space left on device
        'EMFILE', // Too many open files
        'ENFILE', // File table overflow
        'EACCES', // Permission denied
        'EROFS' // Read-only file system
    ];
    return fsErrors.some(code => err.code === code);
};
class CacheManager {
    static createCache(name) {
        const cache = new Map();
        this.caches.set(name, cache);
        this.cacheSizes.set(name, 0);
        return cache;
    }
    static getCache(name) {
        return this.caches.get(name) || null;
    }
    static getCacheOrCreate(name) {
        let cache = this.caches.get(name);
        if (!cache) {
            cache = this.createCache(name);
        }
        return cache;
    }
    static clearCache(name) {
        const cache = this.caches.get(name);
        if (cache) {
            const size = cache.size;
            cache.clear();
            this.cacheSizes.set(name, 0);
            console.log(`🗑️  Cleared cache "${name}" - removed ${size} items`);
            return true;
        }
        console.warn(`⚠️  Cache "${name}" not found for clearing`);
        return false;
    }
    static clearAllCaches() {
        let totalCleared = 0;
        for (const [name, cache] of this.caches) {
            if (cache) {
                totalCleared += cache.size;
                cache.clear();
                this.cacheSizes.set(name, 0);
            }
        }
        console.log(`🗑️  Cleared all caches - removed ${totalCleared} items total`);
        return totalCleared;
    }
    static getCacheStats() {
        const stats = [];
        for (const [name, cache] of this.caches) {
            if (cache) {
                const size = cache.size;
                const memoryEstimate = this.estimateCacheMemory(cache);
                stats.push({ name, size, memoryEstimate });
            }
        }
        return stats;
    }
    static cacheExists(name) {
        return this.caches.has(name);
    }
    static getAllCacheNames() {
        return Array.from(this.caches.keys());
    }
    static estimateCacheMemory(cache) {
        // Rough estimation - each entry is approximately 1KB
        const estimatedKB = cache.size * 1;
        if (estimatedKB > 1024) {
            return `${(estimatedKB / 1024).toFixed(1)}MB`;
        }
        return `${estimatedKB}KB`;
    }
}
CacheManager.caches = new Map();
CacheManager.cacheSizes = new Map();
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000, // 1 minute
    monitorInterval = 10000 // 10 seconds
    ) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.monitorInterval = monitorInterval;
        this.failures = 0;
        this.lastFailureTime = 0;
        this.state = 'CLOSED';
    }
    execute(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state === 'OPEN') {
                if (Date.now() - this.lastFailureTime > this.timeout) {
                    this.state = 'HALF_OPEN';
                }
                else {
                    throw new Error('Service temporarily unavailable due to high failure rate');
                }
            }
            try {
                const result = yield operation();
                this.onSuccess();
                return result;
            }
            catch (error) {
                this.onFailure();
                throw error;
            }
        });
    }
    onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }
    onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'OPEN';
            console.warn(`🔴 Circuit breaker opened after ${this.failures} failures`);
        }
    }
    getState() {
        return {
            state: this.state,
            failures: this.failures,
            isOpen: this.state === 'OPEN'
        };
    }
}
// 7. Graceful Shutdown Handler
const setupGracefulShutdown = (server) => {
    const shutdown = (signal) => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        server.close((err) => {
            if (err) {
                console.error('Error during server shutdown:', err);
                process.exit(1);
            }
            console.log('Server closed gracefully');
            process.exit(0);
        });
        // Force shutdown after 30 seconds
        setTimeout(() => {
            console.error('Force shutdown after timeout');
            process.exit(1);
        }, 30000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        shutdown('unhandledRejection');
    });
};
exports.setupGracefulShutdown = setupGracefulShutdown;
const setupCaches = () => {
    // Create different types of caches
    const userCache = CacheManager.createCache('users');
    const sessionCache = CacheManager.createCache('sessions');
    const tempCache = CacheManager.createCache('temp');
    const thumbnailCache = CacheManager.createCache('thumbnails');
    const previewCache = CacheManager.createCache('preview');
    const subscriptionCache = CacheManager.createCache('subscriptions');
    console.log('📦 Cache system initialized');
    return { userCache, sessionCache, tempCache, thumbnailCache, previewCache, subscriptionCache };
};
const exampleCacheUsage = () => {
    const userCache = CacheManager.getCache('users');
    const subscriptionCache = CacheManager.getCache('subscriptions');
    // Safe way to use caches with null checks
    if (userCache) {
        userCache.set('user_123', { name: 'John', email: 'john@example.com' });
        const user = userCache.get('user_123');
        console.log('Retrieved user:', user);
    }
    if (subscriptionCache) {
        subscriptionCache.set('sub_456', { plan: 'premium', features: {} });
        const subscription = subscriptionCache.get('sub_456');
        console.log('Retrieved subscription:', subscription);
    }
    // Or use getCacheOrCreate to always get a cache instance
    const tempCache = CacheManager.getCacheOrCreate('temp');
    tempCache.set('temp_data', { someData: 'value' });
    const tempData = tempCache.get('temp_data');
    console.log('Retrieved temp data:', tempData);
};
const safeSetCache = (cacheName, key, value) => {
    const cache = CacheManager.getCache(cacheName);
    if (cache) {
        cache.set(key, value);
        return true;
    }
    console.warn(`Cache "${cacheName}" not found for setting key "${key}"`);
    return false;
};
const safeGetCache = (cacheName, key) => {
    const cache = CacheManager.getCache(cacheName);
    if (cache) {
        return cache.get(key) || null;
    }
    console.warn(`Cache "${cacheName}" not found for getting key "${key}"`);
    return null;
};
const safeDeleteFromCache = (cacheName, key) => {
    const cache = CacheManager.getCache(cacheName);
    if (cache) {
        return cache.delete(key);
    }
    console.warn(`Cache "${cacheName}" not found for deleting key "${key}"`);
    return false;
};
const customCacheClearingStrategy = (memoryPercentage) => {
    if (memoryPercentage > 85) {
        // Clear in order of importance (least important first)
        const clearOrder = ['temp', 'preview', 'thumbnails', 'sessions', 'users', 'subscriptions'];
        let cleared = 0;
        for (const cacheName of clearOrder) {
            if (CacheManager.clearCache(cacheName)) {
                cleared++;
                // Check if we've freed enough memory (you could add actual memory check here)
                if (cleared >= 3)
                    break;
            }
        }
        console.log(`🧹 Custom cleanup strategy cleared ${cleared} caches`);
    }
};
