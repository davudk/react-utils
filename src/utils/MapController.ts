
export interface MapControllerOptions<K = any, V = any> {
    source?: Map<K, V>;
    onMutate?(): void;
}

export class MapController<K = any, V = any> implements Map<K, V> {
    private _map: Map<K, V>;
    [Symbol.toStringTag]: string;

    constructor(public readonly options: MapControllerOptions<K, V> = {}) {
        this._map = new Map(options.source ?? []);
        this[Symbol.toStringTag] = this._map[Symbol.toStringTag];
    }

    get map(): Map<K, V> {
        return this._map;
    }

    set map(newMap: Map<K, V>) {
        this._map = newMap;
        this.handleMutate();
    }

    get size(): number {
        return this._map.size;
    }

    clear(): void {
        this._map.clear();
        this.handleMutate();
    }

    computeIfAbsent(key: K, provider: (key: K) => V): V | undefined {
        if (this._map.has(key)) {
            return this._map.get(key);
        } else {
            const value = provider(key);
            this._map.set(key, value);
            this.handleMutate();
            return value;
        }
    }

    delete(key: K): boolean {
        const v = this._map.delete(key);
        this.handleMutate();
        return v;
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this._map.forEach(callbackfn, thisArg);
    }

    get(key: K): V | undefined {
        return this._map.get(key);
    }

    has(key: K): boolean {
        return this._map.has(key);
    }

    set(key: K, value: V): this {
        this._map.set(key, value);
        this.handleMutate();
        return this;
    }

    entries(): IterableIterator<[K, V]> {
        return this._map.entries();
    }

    keys(): IterableIterator<K> {
        return this._map.keys();
    }

    values(): IterableIterator<V> {
        return this._map.values();
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this._map[Symbol.iterator]();
    }

    private handleMutate(): void {
        this.options.onMutate?.();
    }
}