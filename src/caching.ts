/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/init-declarations */

const MAX_MEMORY = (Math.pow(1024, 2) * 1000) / 2; //1GB /2 (1 character in js is 2 bytes)

interface CacheEntry {
    dataVersion: string;
    authorizationHash: string;
    lastAccessed: Date;
    value: string;
}

class Caching {
    dataVersionHeader: string;
    authorizationHashHeader: string;
    private maxMemory: number;
    private cache: { [url: string]: CacheEntry };
    constructor(options?: { maxMemory: number }) {
        this.cache = {};
        options = options || {
            maxMemory: MAX_MEMORY,
        };

        this.maxMemory = options.maxMemory;
        this.dataVersionHeader = "X-Octopus-Data-Version";
        this.authorizationHashHeader = "X-Octopus-Authorization-Hash";
    }
    clearAll() {
        this.cache = {};
    }
    setHeaderAndGetValue(request: any, options: any) {
        if (this.cache[options.url]) {
            request.setRequestHeader(this.dataVersionHeader, this.cache[options.url].dataVersion);
            request.setRequestHeader(this.authorizationHashHeader, this.cache[options.url].authorizationHash);
            this.cache[options.url].lastAccessed = new Date();
            return this.cache[options.url].value;
        }
    }
    updateCache(request: any, options: any) {
        try {
            const dataVersion = request.getResponseHeader(this.dataVersionHeader);
            const authorizationHash = request.getResponseHeader(this.authorizationHashHeader);
            if (!!dataVersion && !!authorizationHash) {
                const item = {
                    dataVersion,
                    authorizationHash,
                    lastAccessed: new Date(),
                    value: request.responseText,
                };

                const itemSize = this.itemSizeInMemory(options.url, item);
                if (itemSize < this.maxMemory) {
                    this.cache[options.url] = item;
                }

                this.memoryPressureCleanup();
            } else {
                delete this.cache[options.url];
            }
        } catch (e) {
            delete this.cache[options.url];
        }
    }
    canUseCachedValue(request: any) {
        return request.status === 304 && (request.responseText === "" || !request.responseText);
    }
    private memoryPressureCleanup() {
        let currentMemory = this.roughSizeOfReleasableMemory();
        while (currentMemory >= this.maxMemory) {
            this.removeOldest();
            const newMemoryLevel = this.roughSizeOfReleasableMemory();
            if (newMemoryLevel === currentMemory) {
                // Just make sure we don't get stuck.
                return;
            }
            currentMemory = newMemoryLevel;
        }
    }
    private itemSizeInMemory(url: string, item: CacheEntry) {
        return url.length + item.value.length;
    }
    private removeOldest() {
        let oldestUrl: string;
        let oldestResponded = -1;
        const now = new Date();

        Object.keys(this.cache).forEach((url) => {
            const age = now.valueOf() - this.cache[url].lastAccessed.valueOf();
            if (age > oldestResponded) {
                oldestResponded = age;
                oldestUrl = url;
            }
        });

        delete this.cache[oldestUrl!];
    }
    private roughSizeOfReleasableMemory() {
        return Object.keys(this.cache).reduce((total, url) => {
            const item = this.cache[url];
            return total + this.itemSizeInMemory(url, item);
        }, 0);
    }
}

export default Caching;
