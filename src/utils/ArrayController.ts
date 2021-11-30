
export interface ArrayControllerOptions {
    throwErrors?: boolean;
    onMutate?(): void;
}

export class ArrayController<T = any> {

    constructor(private array: T[] = [],
        public readonly options: ArrayControllerOptions = {}) {
        options.throwErrors ??= false;
    }

    get values(): T[] {
        return this.array;
    }

    set values(newValues: T[]) {
        this.array = newValues;
        this.handleMutate();
    }

    get length() {
        return this.array.length;
    }

    append(item: T): void {
        this.array.push(item);
        this.handleMutate();
    }

    at(i: number, defaultValue?: T): T | undefined {
        const v = this.array[i];
        if (!v && defaultValue !== undefined) return defaultValue;
        else return v;
    }

    clear(): void {
        this.array = [];
        this.handleMutate();
    }

    insert(i: number, item: T): void {
        if (this.inBounds(i)) {
            this.array.splice(i, 0, item);
            this.handleMutate();
        } else if (i === this.array.length) {
            this.array.push(item);
            this.handleMutate();
        }
    }

    map<U>(callback: (value: T, index: number, controller: this) => U) {
        return this.array.map((v, i) => {
            return callback(v, i, this);
        })
    }

    moveDown(i: number): void {
        this.swap(i, i + 1);
    }

    moveToEnd(i: number): void {
        if (this.inBounds(i) && i + 1 < this.array.length) {
            const item = this.array[i];
            this.array.splice(i, 1);
            this.array.push(item);
            this.handleMutate();
        }
    }

    moveToStart(i: number): void {
        if (this.inBounds(i) && i > 0) {
            const item = this.array[i];
            this.array.splice(i, 1);
            this.array.unshift(item);
            this.handleMutate();
        }
    }

    moveUp(i: number): void {
        this.swap(i, i - 1);
    }

    pop(): T | undefined {
        const v = this.array.pop();
        this.handleMutate();
        return v;
    }

    prepend(item: T): void {
        this.array.unshift(item);
        this.handleMutate();
    }

    remove(i: number): void {
        if (this.inBounds(i)) {
            this.array.splice(i, 1);
            this.handleMutate();
        }
    }

    set(i: number, item: T): void {
        if (this.inBounds(i)) {
            this.array[i] = item;
            this.handleMutate();
        }
    }

    shift(): T | undefined {
        const v = this.array.shift();
        this.handleMutate();
        return v;
    }

    swap(i: number, j: number): void {
        if (this.inBounds(i) && this.inBounds(j) && i !== j) {
            const t = this.array[i];
            this.array[i] = this.array[j];
            this.array[j] = t;
            this.handleMutate();
        }
    }

    private handleMutate(): void {
        this.options.onMutate?.();
    }

    private inBounds(i: number): boolean {
        const valid = i >= 0 && i < this.array.length;

        if (this.options.throwErrors) {
            throw new Error('Index out of range.');
        }

        return valid;
    }

}